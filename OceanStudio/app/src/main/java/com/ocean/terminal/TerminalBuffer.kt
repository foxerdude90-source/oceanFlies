package com.ocean.terminal

class TerminalBuffer(val rows: Int = 100, val cols: Int = 80) {
    private val buffer = Array(rows) { CharArray(cols) { ' ' } }
    private val colorBuffer = Array(rows) { IntArray(cols) { 0xFF1E293B.toInt() } }
    
    var cursorRow = 0
    var cursorCol = 0

    fun writeChar(ch: Char, color: Int = 0xFF1E293B.toInt()) {
        if (ch == '\n') {
            cursorCol = 0
            cursorRow++
            if (cursorRow >= rows) {
                scrollUp()
                cursorRow = rows - 1
            }
            return
        }
        if (ch == '\r') {
            cursorCol = 0
            return
        }
        if (ch == '\b') {
            if (cursorCol > 0) {
                cursorCol--
                buffer[cursorRow][cursorCol] = ' '
            }
            return
        }

        if (cursorCol >= cols) {
            cursorCol = 0
            cursorRow++
            if (cursorRow >= rows) {
                scrollUp()
                cursorRow = rows - 1
            }
        }

        buffer[cursorRow][cursorCol] = ch
        colorBuffer[cursorRow][cursorCol] = color
        cursorCol++
    }

    fun writeString(str: String, color: Int = 0xFF1E293B.toInt()) {
        for (c in str) {
            writeChar(c, color)
        }
    }

    private fun scrollUp() {
        for (r in 0 until rows - 1) {
            buffer[r] = buffer[r + 1].clone()
            colorBuffer[r] = colorBuffer[r + 1].clone()
        }
        buffer[rows - 1] = CharArray(cols) { ' ' }
        colorBuffer[rows - 1] = IntArray(cols) { 0xFF1E293B.toInt() }
    }

    fun getLine(row: Int): String {
        if (row in 0 until rows) {
            return String(buffer[row])
        }
        return ""
    }

    fun getLineColors(row: Int): IntArray {
        if (row in 0 until rows) {
            return colorBuffer[row]
        }
        return IntArray(cols) { 0xFF1E293B.toInt() }
    }

    fun clear() {
        for (r in 0 until rows) {
            buffer[r].fill(' ')
            colorBuffer[r].fill(0xFF1E293B.toInt())
        }
        cursorRow = 0
        cursorCol = 0
    }
}
