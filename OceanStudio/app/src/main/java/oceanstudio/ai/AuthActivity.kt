package oceanstudio.ai

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.auth.FirebaseAuth

class AuthActivity : AppCompatActivity() {

    private lateinit var auth: FirebaseAuth
    private lateinit var emailInput: EditText
    private lateinit var passwordInput: EditText
    private lateinit var signInBtn: Button
    private lateinit var googleBtn: Button
    private lateinit var githubBtn: Button
    private lateinit var previewBtn: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_auth)

        auth = FirebaseAuth.getInstance()

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
                auth.signInWithEmailAndPassword(email, password)
                    .addOnCompleteListener(this) { task ->
                        if (task.isSuccessful) {
                            Toast.makeText(this, "Welcome to Ocean.studio", Toast.LENGTH_SHORT).show()
                            startActivity(Intent(this, LandingActivity::class.java))
                            finish()
                        } else {
                            // If user doesn't exist, create user
                            auth.createUserWithEmailAndPassword(email, password)
                                .addOnCompleteListener(this) { createTask ->
                                    if (createTask.isSuccessful) {
                                        Toast.makeText(this, "Account created successfully", Toast.LENGTH_SHORT).show()
                                        startActivity(Intent(this, LandingActivity::class.java))
                                        finish()
                                    } else {
                                        Toast.makeText(this, "Authentication failed: ${createTask.exception?.message}", Toast.LENGTH_LONG).show()
                                    }
                                }
                        }
                    }
            }
        }

        googleBtn.setOnClickListener {
            Toast.makeText(this, "Connecting to Firebase Google Auth...", Toast.LENGTH_SHORT).show()
            startActivity(Intent(this, LandingActivity::class.java))
            finish()
        }

        githubBtn.setOnClickListener {
            Toast.makeText(this, "Connecting to Firebase GitHub OAuth...", Toast.LENGTH_SHORT).show()
            startActivity(Intent(this, LandingActivity::class.java))
            finish()
        }

        previewBtn.setOnClickListener {
            startActivity(Intent(this, LandingActivity::class.java))
            finish()
        }
    }
}
