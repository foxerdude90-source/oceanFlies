package oceanstudio.ai

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Typeface
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.ScaleGestureDetector
import android.view.View

class TerminalView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    val buffer = TerminalBuffer(rows = 80, cols = 100)
    
    private var fontSize = 36f
    private val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = 0xFFF8FAFC.toInt() // Pure Off-White
        typeface = Typeface.MONOSPACE
        textSize = fontSize
    }

    private val bgPaint = Paint().apply {
        color = 0xFF090D16.toInt() // Deep Terminal Dark
        style = Paint.Style.FILL
    }

    private val cursorPaint = Paint().apply {
        color = 0xFF06B6D4.toInt() // Electric Ocean Cyan
        style = Paint.Style.FILL
    }

    private val selectionPaint = Paint().apply {
        color = 0xFF164E63.toInt() // Dark Cyan Glow Selection
        style = Paint.Style.FILL
    }

    private var charWidth: Float = 0f
    private var charHeight: Float = 0f

    private var selectionStartRow = -1
    private var selectionStartCol = -1
    private var selectionEndRow = -1
    private var selectionEndCol = -1

    private val scaleDetector = ScaleGestureDetector(context, object : ScaleGestureDetector.SimpleOnScaleGestureListener() {
        override fun onScale(detector: ScaleGestureDetector): Boolean {
            fontSize *= detector.scaleFactor
            fontSize = fontSize.coerceIn(20f, 72f)
            textPaint.textSize = fontSize
            recalculateMetrics()
            postInvalidate()
            return true
        }
    })

    init {
        recalculateMetrics()
        isFocusable = true
        isFocusableInTouchMode = true
    }

    private fun recalculateMetrics() {
        val fm = textPaint.fontMetrics
        charHeight = fm.bottom - fm.top
        charWidth = textPaint.measureText("M")
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        scaleDetector.onTouchEvent(event)
        if (scaleDetector.isInProgress) return true

        when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                val col = (event.x / charWidth).toInt().coerceIn(0, buffer.cols - 1)
                val row = (event.y / charHeight).toInt().coerceIn(0, buffer.rows - 1)
                selectionStartRow = row
                selectionStartCol = col
                selectionEndRow = row
                selectionEndCol = col
                postInvalidate()
            }
            MotionEvent.ACTION_MOVE -> {
                val col = (event.x / charWidth).toInt().coerceIn(0, buffer.cols - 1)
                val row = (event.y / charHeight).toInt().coerceIn(0, buffer.rows - 1)
                selectionEndRow = row
                selectionEndCol = col
                postInvalidate()
            }
        }
        return true
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        
        // Background: Deep Terminal Dark
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), bgPaint)

        val fm = textPaint.fontMetrics
        val startY = -fm.top

        // Draw Terminal Text & Selection
        for (r in 0 until buffer.rows) {
            val y = r * charHeight + startY
            if (y > height + charHeight) break

            val lineStr = buffer.getLine(r)
            val colors = buffer.getLineColors(r)

            for (c in 0 until lineStr.length) {
                val charStr = lineStr[c].toString()

                if (isPosSelected(r, c)) {
                    val selX = c * charWidth
                    val selY = r * charHeight
                    canvas.drawRect(selX, selY, selX + charWidth, selY + charHeight, selectionPaint)
                }

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

    private fun isPosSelected(row: Int, col: Int): Boolean {
        if (selectionStartRow == -1 || selectionEndRow == -1) return false
        val start = selectionStartRow * buffer.cols + selectionStartCol
        val end = selectionEndRow * buffer.cols + selectionEndCol
        val min = Math.min(start, end)
        val max = Math.max(start, end)
        val pos = row * buffer.cols + col
        return pos in min..max && min != max
    }

    fun copySelectedText(): String {
        if (selectionStartRow == -1 || selectionEndRow == -1) return ""
        val sb = StringBuilder()
        val start = selectionStartRow * buffer.cols + selectionStartCol
        val end = selectionEndRow * buffer.cols + selectionEndCol
        val min = Math.min(start, end)
        val max = Math.max(start, end)

        for (pos in min..max) {
            val r = pos / buffer.cols
            val c = pos % buffer.cols
            if (r in 0 until buffer.rows) {
                val line = buffer.getLine(r)
                if (c in 0 until line.length) {
                    sb.append(line[c])
                }
            }
            if (c == buffer.cols - 1) sb.append("\n")
        }

        val text = sb.toString().trim()
        if (text.isNotEmpty()) {
            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            clipboard.setPrimaryClip(ClipData.newPlainText("TerminalText", text))
        }
        return text
    }

    fun appendText(text: String) {
        var i = 0
        while (i < text.length) {
            val c = text[i]
            if (c == '\u001B' && i + 1 < text.length && text[i + 1] == '[') {
                val end = text.indexOf('m', i)
                if (end != -1) {
                    i = end + 1
                    continue
                }
            }
            
            val color = if (buffer.cursorCol < 20 && buffer.getLine(buffer.cursorRow).contains("~")) {
                0xFF06B6D4.toInt() // Electric Cyan prompt
            } else {
                0xFFF8FAFC.toInt() // Off-White text
            }
            
            buffer.writeChar(c, color)
            i++
        }
        postInvalidate()
    }
}
