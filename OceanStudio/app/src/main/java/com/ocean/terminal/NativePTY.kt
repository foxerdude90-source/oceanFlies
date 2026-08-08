package com.ocean.terminal

object NativePTY {
    init {
        System.loadLibrary("oceanpty")
    }

    external fun createSubprocess(
        cmd: String,
        cwd: String,
        envVars: Array<String>,
        processIdArray: IntArray
    ): Int

    external fun setWindowSize(
        fd: Int,
        rows: Int,
        cols: Int,
        widthPx: Int,
        heightPx: Int
    )

    external fun closePty(fd: Int)

    external fun waitForProcess(pid: Int): Int
}
