package oceanstudio.ai

import android.content.Context
import java.io.File

object TerminalEnv {
    const val PACKAGE_NAME = "oceanstudio.ai"
    
    fun getPrefix(context: Context): String {
        return "${context.filesDir.absolutePath}/usr"
    }

    fun getHome(context: Context): String {
        return "${context.filesDir.absolutePath}/home"
    }

    fun getEnvVars(context: Context): Array<String> {
        val prefix = getPrefix(context)
        val home = getHome(context)
        
        return arrayOf(
            "PREFIX=$prefix",
            "HOME=$home",
            "PATH=$prefix/bin:$prefix/bin/applets:/system/bin:/system/xbin",
            "LD_LIBRARY_PATH=$prefix/lib",
            "TERM=xterm-256color",
            "COLORTERM=truecolor",
            "LANG=en_US.UTF-8",
            "TMPDIR=$prefix/tmp"
        )
    }

    fun setupDirectories(context: Context) {
        val prefixDir = File(getPrefix(context))
        val homeDir = File(getHome(context))
        val binDir = File(prefixDir, "bin")
        val tmpDir = File(prefixDir, "tmp")
        val libDir = File(prefixDir, "lib")

        binDir.mkdirs()
        homeDir.mkdirs()
        tmpDir.mkdirs()
        libDir.mkdirs()
    }
}
