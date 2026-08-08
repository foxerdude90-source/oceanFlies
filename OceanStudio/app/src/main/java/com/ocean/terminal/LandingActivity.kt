package com.ocean.terminal

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity

class LandingActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_landing)

        findViewById<Button>(R.id.launchWorkspaceBtn).setOnClickListener {
            startActivity(Intent(this, SetupActivity::class.java))
        }
    }
}
