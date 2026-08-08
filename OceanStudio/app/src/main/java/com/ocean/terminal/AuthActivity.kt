package com.ocean.terminal

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class AuthActivity : AppCompatActivity() {

    private lateinit var emailInput: EditText
    private lateinit var passwordInput: EditText
    private lateinit var signInBtn: Button
    private lateinit var googleBtn: Button
    private lateinit var githubBtn: Button
    private lateinit var previewBtn: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_auth)

        emailInput = findViewById(R.id.emailInput)
        passwordInput = findViewById(R.id.passwordInput)
        signInBtn = findViewById(R.id.signInBtn)
        googleBtn = findViewById(R.id.googleBtn)
        githubBtn = findViewById(R.id.githubBtn)
        previewBtn = findViewById(R.id.previewBtn)

        signInBtn.setOnClickListener {
            val email = emailInput.text.toString().trim()
            val password = passwordInput.text.toString().trim()

            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please enter email and password", Toast.LENGTH_SHORT).show()
            } else {
                // Sign in success -> navigate to Landing
                startActivity(Intent(this, LandingActivity::class.java))
                finish()
            }
        }

        googleBtn.setOnClickListener {
            Toast.makeText(this, "Connecting to Google Auth...", Toast.LENGTH_SHORT).show()
            startActivity(Intent(this, LandingActivity::class.java))
            finish()
        }

        githubBtn.setOnClickListener {
            Toast.makeText(this, "Connecting to GitHub OAuth...", Toast.LENGTH_SHORT).show()
            startActivity(Intent(this, LandingActivity::class.java))
            finish()
        }

        previewBtn.setOnClickListener {
            // Preview login bypass
            startActivity(Intent(this, LandingActivity::class.java))
            finish()
        }
    }
}
