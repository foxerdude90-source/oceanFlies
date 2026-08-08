package oceanstudio.ai

import android.content.Context
import android.util.Log
import java.io.File
import java.io.FileDescriptor
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.InputStream
import java.io.OutputStream
import kotlin.concurrent.thread

class TerminalSession(
    private val context: Context,
    private val initialCommand: String = "/data/data/oceanstudio.ai/files/usr/bin/sh",
    private val workingDir: String = "/data/data/oceanstudio.ai/files/home",
    private val onOutput: (String) -> Unit
) {
    private val TAG = "TerminalSession"

    var masterFd: Int = -1
        private set
    var processId: Int = -1
        private set

    private var inputStream: InputStream? = null
    private var outputStream: OutputStream? = null
    private var isRunning = false

    fun startSession() {
        if (isRunning) return

        val prefix = TerminalEnv.getPrefix(context)
        val home = TerminalEnv.getHome(context)
        val env = TerminalEnv.getEnvVars(context)

        val shFile = File(prefix, "bin/sh")
        val cmdToRun = if (shFile.exists()) shFile.absolutePath else "/system/bin/sh"

        val pidArray = IntArray(1)
        masterFd = NativePTY.createSubprocess(
            cmd = cmdToRun,
            cwd = if (File(workingDir).exists()) workingDir else home,
            envVars = env,
            processIdArray = pidArray
        )

        if (masterFd < 0) {
            Log.e(TAG, "Failed to spawn native PTY subprocess")
            onOutput("\r\n[OceanTerminal] Failed to spawn PTY subprocess.\r\n")
            return
        }

        processId = pidArray[0]
        isRunning = true

        val fdObj = FileDescriptor()
        try {
            val field = FileDescriptor::class.java.getDeclaredField("descriptor")
            field.isAccessible = true
            field.setInt(fdObj, masterFd)

            inputStream = FileInputStream(fdObj)
            outputStream = FileOutputStream(fdObj)
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing PTY streams: ${e.message}", e)
        }

        thread(name = "OceanPTY-Reader") {
            val buffer = ByteArray(4096)
            try {
                while (isRunning) {
                    val readBytes = inputStream?.read(buffer) ?: -1
                    if (readBytes <= 0) break
                    val outputText = String(buffer, 0, readBytes)
                    onOutput(outputText)
                }
            } catch (e: Exception) {
                Log.d(TAG, "PTY reader thread stopped: ${e.message}")
            } finally {
                isRunning = false
            }
        }
    }

    fun write(bytes: ByteArray) {
        if (!isRunning) return
        try {
            outputStream?.write(bytes)
            outputStream?.flush()
        } catch (e: Exception) {
            Log.e(TAG, "Failed to write to PTY: ${e.message}", e)
        }
    }

    fun writeString(str: String) {
        write(str.toByteArray())
    }

    fun updateWindowSize(rows: Int, cols: Int, widthPx: Int, heightPx: Int) {
        if (masterFd >= 0) {
            NativePTY.setWindowSize(masterFd, rows, cols, widthPx, heightPx)
        }
    }

    fun stopSession() {
        isRunning = false
        if (masterFd >= 0) {
            NativePTY.closePty(masterFd)
            masterFd = -1
        }
    }
}
