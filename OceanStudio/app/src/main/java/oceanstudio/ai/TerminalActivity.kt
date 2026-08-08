package oceanstudio.ai

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.provider.Settings
import android.widget.Button
import android.widget.LinearLayout
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class TerminalActivity : AppCompatActivity() {

    private lateinit var terminalView: TerminalView
    private lateinit var keyboardBar: LinearLayout
    private var terminalSession: TerminalSession? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_terminal)

        terminalView = findViewById(R.id.terminalView)
        keyboardBar = findViewById(R.id.keyboardBar)

        BootstrapInstaller.installIfNeeded(this)

        setupKeyboardBar()

        terminalSession = TerminalSession(this) { output ->
            runOnUiThread {
                terminalView.appendText(output)
            }
        }
        terminalSession?.startSession()

        OceanWakeService.startService(this)

        findViewById<Button>(R.id.copyBtn)?.setOnClickListener {
            val copied = terminalView.copySelectedText()
            if (copied.isNotEmpty()) {
                Toast.makeText(this, "Copied to clipboard", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(this, "Select text to copy", Toast.LENGTH_SHORT).show()
            }
        }

        findViewById<Button>(R.id.batteryOptBtn)?.setOnClickListener {
            requestIgnoreBatteryOptimization()
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
                    sendKeyToTerminal(k)
                }
            }
            keyboardBar.addView(btn)
        }
    }

    private fun sendKeyToTerminal(keyStr: String) {
        val bytes = when (keyStr) {
            "Tab" -> byteArrayOf(0x09)
            "Esc" -> byteArrayOf(0x1B)
            "▲" -> "\u001B[A".toByteArray()
            "▼" -> "\u001B[B".toByteArray()
            "◄" -> "\u001B[D".toByteArray()
            "►" -> "\u001B[C".toByteArray()
            else -> keyStr.toByteArray()
        }
        terminalSession?.write(bytes)
    }

    private fun requestIgnoreBatteryOptimization() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
            if (!pm.isIgnoringBatteryOptimizations(packageName)) {
                val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                    data = Uri.parse("package:$packageName")
                }
                startActivity(intent)
            } else {
                Toast.makeText(this, "Battery optimization already ignored", Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        terminalSession?.stopSession()
    }
}
