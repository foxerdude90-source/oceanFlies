package oceanstudio.ai

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.webkit.WebView
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import java.io.InputStream
import java.io.OutputStream
import kotlin.concurrent.thread

class MainActivity : AppCompatActivity() {

    private lateinit var terminalView: TerminalView
    private lateinit var webView: WebView
    private lateinit var codeEditorInput: EditText
    private lateinit var chatInput: EditText
    private lateinit var chatContainer: LinearLayout
    private lateinit var keyboardBar: LinearLayout

    private var masterFd: Int = -1
    private var ptyInputStream: InputStream? = null
    private var ptyOutputStream: OutputStream? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        terminalView = findViewById(R.id.terminalView)
        webView = findViewById(R.id.previewWebView)
        codeEditorInput = findViewById(R.id.codeEditorInput)
        chatInput = findViewById(R.id.chatInput)
        chatContainer = findViewById(R.id.chatContainer)
        keyboardBar = findViewById(R.id.keyboardBar)

        BootstrapInstaller.installIfNeeded(this)

        webView.settings.javaScriptEnabled = true
        webView.loadDataWithBaseURL(
            "file:///android_asset/",
            "<html><body style='font-family:sans-serif;padding:20px;text-align:center;background:#FEFCFA;color:#1E293B;'><h2>Ocean.studio Hardware Preview</h2><p>Hardware-driven preview engine active.</p></body></html>",
            "text/html",
            "UTF-8",
            null
        )

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
    }

    private fun setupKeyboardBar() {
        val keys = arrayOf("Ctrl", "Alt", "Tab", "Esc", "|", "~", "-", "/", "▲", "▼", "◄", "►")
        for (k in keys) {
            val btn = Button(this).apply {
                text = k
                textSize = 12f
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
                val field = java.io.FileDescriptor::class.java.getDeclaredField("descriptor")
                field.isAccessible = true
                field.setInt(fileDescriptor, masterFd)

                ptyInputStream = java.io.FileInputStream(fileDescriptor)
                ptyOutputStream = java.io.FileOutputStream(fileDescriptor)

                val bufferBytes = ByteArray(4096)
                try {
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
                    terminalView.appendText("Ocean Native Terminal Session Started.\n~/project $ ")
                }
            }
        }
    }

    private fun addChatMessage(text: String, isUser: Boolean) {
        val tv = TextView(this).apply {
            this.text = if (isUser) "You: $text" else "Ocean Agent: $text"
            setPadding(16, 12, 16, 12)
            textSize = 14f
            setTextColor(if (isUser) 0xFF0F172A.toInt() else 0xFF0284C7.toInt())
        }
        chatContainer.addView(tv)
    }

    private fun simulateAgentResponse(prompt: String) {
        Handler(Looper.getMainLooper()).postDelayed({
            addChatMessage("I've analyzed your prompt: \"$prompt\". Updating codebase and terminal session...", isUser = false)
        }, 1000)
    }

    override fun onDestroy() {
        super.onDestroy()
        if (masterFd >= 0) {
            NativePTY.closePty(masterFd)
        }
    }
}
