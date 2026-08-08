package com.ocean.terminal

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Typeface
import android.util.AttributeSet
import android.view.KeyEvent
import android.view.View

class TerminalView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    val buffer = TerminalBuffer(rows = 60, cols = 80)
    
    private val bgPaint = Paint().apply {
        color = 0xFFFFFFFF.toInt() // Pure Paper White
        style = Paint.Style.FILL
    }
    
    private val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = 0xFF1E293B.toInt() // Deep Charcoal
        typeface = Typeface.MONOSPACE
        textSize = 36f
    }

    private val cursorPaint = Paint().apply {
        color = 0xFF0284C7.toInt() // Crisp Ocean Blue
        style = Paint.Style.FILL
    }

    private val charWidth: Float
    private val charHeight: Float

    init {
        val fm = textPaint.fontMetrics
        charHeight = fm.bottom - fm.top
        charWidth = textPaint.measureText("M")
        isFocusable = true
        isFocusableInTouchMode = true
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        
        // Background
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), bgPaint)

        // Draw Terminal Text Grid
        val fm = textPaint.fontMetrics
        val startY = -fm.top

        for (r in 0 until buffer.rows) {
            val y = r * charHeight + startY
            if (y > height + charHeight) break

            val lineStr = buffer.getLine(r)
            val colors = buffer.getLineColors(r)

            for (c in 0 until lineStr.length) {
                val charStr = lineStr[c].toString()
                if (charStr != " ") {
                    textPaint.color = colors[c]
                    canvas.drawText(charStr, c * charWidth, y, textPaint)
                }
            }
        }

        // Draw Cursor
        val cursorX = buffer.cursorCol * charWidth
        val cursorY = buffer.cursorRow * charHeight
        canvas.drawRect(cursorX, cursorY, cursorX + charWidth, cursorY + charHeight, cursorPaint)
    }

    fun appendText(text: String) {
        // Parse ANSI colors & escape codes
        var i = 0
        while (i < text.length) {
            val c = text[i]
            if (c == '\u001B' && i + 1 < text.length && text[i + 1] == '[') {
                // Skip ANSI escape sequence
                val end = text.indexOf('m', i)
                if (end != -1) {
                    val code = text.substring(i + 2, end)
                    if (code.contains("36") || code.contains("34")) {
                        // Ocean Blue prompt identifier
                    }
                    i = end + 1
                    continue
                }
            }
            
            val color = if (buffer.cursorCol < 15 && buffer.getLine(buffer.cursorRow).startsWith("~/")) {
                0xFF0284C7.toInt() // Crisp Ocean Blue
            } else {
                0xFF1E293B.toInt() // Deep Charcoal
            }
            
            buffer.writeChar(c, color)
            i++
        }
        postInvalidate()
    }
}
