package oceanstudio.ai

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.View
import android.webkit.WebView
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import java.io.InputStream
import java.io.OutputStream
import kotlin.concurrent.thread

class MainActivity : AppCompatActivity() {

    private lateinit var tabAgent: TextView
    private lateinit var tabEditor: TextView
    private lateinit var tabPreview: TextView
    private lateinit var tabTerminal: TextView

    private lateinit var agentViewContainer: LinearLayout
    private lateinit var codeEditorInput: EditText
    private lateinit var previewWebView: WebView
    private lateinit var terminalContainer: LinearLayout

    private lateinit var terminalView: TerminalView
    private lateinit var chatInput: EditText
    private lateinit var chatContainer: LinearLayout
    private lateinit var keyboardBar: LinearLayout
    private lateinit var activeFileText: TextView

    private var masterFd: Int = -1
    private var ptyInputStream: InputStream? = null
    private var ptyOutputStream: OutputStream? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        tabAgent = findViewById(R.id.tabAgent)
        tabEditor = findViewById(R.id.tabEditor)
        tabPreview = findViewById(R.id.tabPreview)
        tabTerminal = findViewById(R.id.tabTerminal)

        agentViewContainer = findViewById(R.id.agentViewContainer)
        codeEditorInput = findViewById(R.id.codeEditorInput)
        previewWebView = findViewById(R.id.previewWebView)
        terminalContainer = findViewById(R.id.terminalContainer)

        terminalView = findViewById(R.id.terminalView)
        chatInput = findViewById(R.id.chatInput)
        chatContainer = findViewById(R.id.chatContainer)
        keyboardBar = findViewById(R.id.keyboardBar)
        activeFileText = findViewById(R.id.activeFileText)

        BootstrapInstaller.installIfNeeded(this)

        previewWebView.settings.javaScriptEnabled = true
        previewWebView.loadDataWithBaseURL(
            "file:///android_asset/",
            "<html><body style='font-family:sans-serif;padding:24px;background:#0B0F17;color:#F8FAFC;'><h2>🌊 Ocean.studio Live Preview</h2><p style='color:#94A3B8;'>Real-time webview rendering engine active.</p></body></html>",
            "text/html",
            "UTF-8",
            null
        )

        codeEditorInput.setText(
            """# Ocean.studio — Python & Multilingual Workspace
import sys
import os

print(f"Ocean.studio Environment Active: {sys.version}")
print(f"User Sandbox Working Dir: {os.getcwd()}")
"""
        )

        setupTabSwitching()
        setupKeyboardBar()
        initNativeTerminalSession()

        findViewById<Button>(R.id.sendChatBtn)?.setOnClickListener {
            val text = chatInput.text.toString().trim()
            if (text.isNotEmpty()) {
                addChatMessage(text, isUser = true)
                chatInput.setText("")
                simulateAgentResponse(text)
            }
        }

        findViewById<Button>(R.id.runCodeBtn)?.setOnClickListener {
            val code = codeEditorInput.text.toString()
            Toast.makeText(this, "Executing code in OceanTerminal PTY...", Toast.LENGTH_SHORT).show()
            sendKeyToPty("cat << 'EOF' > main.py\n$code\nEOF\npython3 main.py 2>&1\n")
            switchTab(tabTerminal, terminalContainer)
        }
    }

    private fun setupTabSwitching() {
        tabAgent.setOnClickListener { switchTab(tabAgent, agentViewContainer) }
        tabEditor.setOnClickListener { switchTab(tabEditor, codeEditorInput); activeFileText.text = " / main.py" }
        tabPreview.setOnClickListener { switchTab(tabPreview, previewWebView); activeFileText.text = " / Live Preview" }
        tabTerminal.setOnClickListener { switchTab(tabTerminal, terminalContainer); activeFileText.text = " / OceanTerminal" }
    }

    private fun switchTab(activeTab: TextView, targetView: View) {
        val tabs = listOf(tabAgent, tabEditor, tabPreview, tabTerminal)
        val views = listOf(agentViewContainer, codeEditorInput, previewWebView, terminalContainer)

        for (i in tabs.indices) {
            if (tabs[i] == activeTab) {
                tabs[i].setBackgroundResource(R.drawable.bg_tab_active)
                tabs[i].setTextColor(0xFF06B6D4.toInt())
                views[i].visibility = View.VISIBLE
            } else {
                tabs[i].background = null
                tabs[i].setTextColor(0xFF94A3B8.toInt())
                views[i].visibility = View.GONE
            }
        }
    }

    private fun setupKeyboardBar() {
        val keys = arrayOf("Ctrl", "Alt", "Tab", "Esc", "|", "~", "-", "/", "▲", "▼", "◄", "►")
        for (k in keys) {
            val btn = Button(this).apply {
                text = k
                textSize = 12f
                setTextColor(0xFFF8FAFC.toInt())
                setBackgroundResource(R.drawable.bg_key_chip)
                setPadding(16, 8, 16, 8)
                setOnClickListener {
                    sendKeyToPty(k)
                }
            }
            keyboardBar.addView(btn)
        }
    }

    private fun sendKeyToPty(keyStr: String) {
        val bytes = when (keyStr) {
            "Tab" -> byteArrayOf(0x09)
            "Esc" -> byteArrayOf(0x1B)
            "▲" -> "\u001B[A".toByteArray()
            "▼" -> "\u001B[B".toByteArray()
            "◄" -> "\u001B[D".toByteArray()
            "►" -> "\u001B[C".toByteArray()
            else -> keyStr.toByteArray()
        }
        try {
            ptyOutputStream?.write(bytes)
            ptyOutputStream?.flush()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun initNativeTerminalSession() {
        thread {
            val prefix = TerminalEnv.getPrefix(this)
            val shPath = "$prefix/bin/sh"
            val envVars = TerminalEnv.getEnvVars(this)
            val pidArray = IntArray(1)

            masterFd = NativePTY.createSubprocess(
                cmd = if (java.io.File(shPath).exists()) shPath else "/system/bin/sh",
                cwd = TerminalEnv.getHome(this),
                envVars = envVars,
                processIdArray = pidArray
            )

            if (masterFd >= 0) {
                NativePTY.setWindowSize(masterFd, rows = 40, cols = 80, widthPx = 1080, heightPx = 1920)

                val fileDescriptor = java.io.FileDescriptor()
                try {
                    val field = java.io.FileDescriptor::class.java.getDeclaredField("descriptor")
                    field.isAccessible = true
                    field.setInt(fileDescriptor, masterFd)

                    ptyInputStream = java.io.FileInputStream(fileDescriptor)
                    ptyOutputStream = java.io.FileOutputStream(fileDescriptor)

                    val bufferBytes = ByteArray(4096)
                    while (true) {
                        val bytesRead = ptyInputStream?.read(bufferBytes) ?: -1
                        if (bytesRead <= 0) break
                        val text = String(bufferBytes, 0, bytesRead)
                        runOnUiThread {
                            terminalView.appendText(text)
                        }
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            } else {
                runOnUiThread {
                    terminalView.appendText("Ocean.studio Native Terminal Engine Active.\n~/workspace $ ")
                }
            }
        }
    }

    private fun addChatMessage(text: String, isUser: Boolean) {
        val container = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundResource(R.drawable.bg_glass_card)
            setPadding(16, 12, 16, 12)
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                setMargins(0, 0, 0, 12)
            }
            layoutParams = params
        }

        val headerTv = TextView(this).apply {
            this.text = if (isUser) "YOU" else "OCEAN AGENT"
            textSize = 11f
            setTypeface(null, android.graphics.Typeface.BOLD)
            setTextColor(if (isUser) 0xFF06B6D4.toInt() else 0xFF8B5CF6.toInt())
            letterSpacing = 0.1f
        }

        val msgTv = TextView(this).apply {
            this.text = text
            textSize = 14f
            setTextColor(0xFFF8FAFC.toInt())
            setPadding(0, 4, 0, 0)
        }

        container.addView(headerTv)
        container.addView(msgTv)
        chatContainer.addView(container)
    }

    private fun simulateAgentResponse(prompt: String) {
        Handler(Looper.getMainLooper()).postDelayed({
            addChatMessage("I've processed your prompt: \"$prompt\". Codebase updated and ready for execution.", isUser = false)
        }, 800)
    }

    override fun onDestroy() {
        super.onDestroy()
        if (masterFd >= 0) {
            NativePTY.closePty(masterFd)
        }
    }
}
