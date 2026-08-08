package com.ocean.terminal

import android.content.Context
import android.util.Log
import java.io.File
import java.io.FileOutputStream
import java.util.zip.ZipInputStream

object BootstrapInstaller {
    private const val TAG = "BootstrapInstaller"

    fun isInstalled(context: Context): Boolean {
        val shFile = File(TerminalEnv.getPrefix(context), "bin/sh")
        return shFile.exists() && shFile.canExecute()
    }

    fun installIfNeeded(context: Context): Boolean {
        TerminalEnv.setupDirectories(context)

        val shFile = File(TerminalEnv.getPrefix(context), "bin/sh")
        if (shFile.exists()) {
            return true
        }

        try {
            Log.i(TAG, "Extracting bootstrap package into ${TerminalEnv.getPrefix(context)}")
            
            // Try extracting bootstrap archive from assets if available
            val assetManager = context.assets
            val assetFiles = assetManager.list("") ?: arrayOf()
            
            if (assetFiles.contains("bootstrap-arm64.zip")) {
                assetManager.open("bootstrap-arm64.zip").use { inputStream ->
                    ZipInputStream(inputStream).use { zipInput ->
                        var entry = zipInput.nextEntry
                        val prefixPath = TerminalEnv.getPrefix(context)
                        
                        while (entry != null) {
                            val outFile = File(prefixPath, entry.name)
                            if (entry.isDirectory) {
                                outFile.mkdirs()
                            } else {
                                outFile.parentFile?.mkdirs()
                                FileOutputStream(outFile).use { outputStream ->
                                    zipInput.copyTo(outputStream)
                                }
                                outFile.setExecutable(true, false)
                                outFile.setReadable(true, false)
                            }
                            zipInput.closeEntry()
                            entry = zipInput.nextEntry
                        }
                    }
                }
            } else {
                // Fallback: create symlinked busybox shell wrapper if standalone
                createFallbackShell(context)
            }

            // Ensure permissions on all binaries
            val binDir = File(TerminalEnv.getPrefix(context), "bin")
            binDir.listFiles()?.forEach { file ->
                file.setExecutable(true, false)
            }

            Log.i(TAG, "Bootstrap installation completed successfully.")
            return true
        } catch (e: Exception) {
            Log.e(TAG, "Bootstrap extraction failed: ${e.message}", e)
            createFallbackShell(context)
            return false
        }
    }

    private fun createFallbackShell(context: Context) {
        val binDir = File(TerminalEnv.getPrefix(context), "bin")
        binDir.mkdirs()
        
        val shScript = File(binDir, "sh")
        if (!shScript.exists()) {
            shScript.writeText("#!/system/bin/sh\nexec /system/bin/sh \"$@\"\n")
            shScript.setExecutable(true, false)
        }
    }
}
