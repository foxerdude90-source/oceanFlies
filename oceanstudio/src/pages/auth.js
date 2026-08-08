// Auth Page — Ocean.studio
// Login, Sign Up, Forgot Password, Google & GitHub OAuth
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  googleProvider,
  githubProvider,
  sendPasswordResetEmail,
  updateProfile
} from '../firebase.js';
import { router } from '../utils/router.js';

const WAVE_ICON = `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 18c0 0 4-6 12-6s12 6 12 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M4 14c0 0 4-6 12-6s12 6 12 6" stroke="#0284C7" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
  <path d="M4 22c0 0 4-6 12-6s12 6 12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.3"/>
</svg>`;

const GOOGLE_ICON = `<svg viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>`;

const GITHUB_ICON = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>`;

let currentView = 'login'; // 'login' | 'signup' | 'forgot'

function showError(container, message) {
  const existing = container.querySelector('.auth-error');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = 'auth-error';
  el.textContent = message;
  const form = container.querySelector('.auth-form');
  if (form) form.insertBefore(el, form.firstChild);
  setTimeout(() => el.remove(), 5000);
}

function showSuccess(container, message) {
  const existing = container.querySelector('.auth-success');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = 'auth-success';
  el.textContent = message;
  const form = container.querySelector('.auth-form');
  if (form) form.insertBefore(el, form.firstChild);
}

function setLoading(btn, loading) {
  if (!btn) return;
  if (loading) {
    btn.disabled = true;
    btn.dataset.originalText = btn.textContent;
    btn.innerHTML = '<div class="spinner"></div>';
  } else {
    btn.disabled = false;
    btn.textContent = btn.dataset.originalText || 'Submit';
  }
}

function renderLogin() {
  return `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-logo">
          <div class="auth-logo-icon">${WAVE_ICON}</div>
          <span class="auth-logo-text">Ocean.studio</span>
        </div>

        <div class="auth-tabs">
          <button class="auth-tab active" data-tab="login">Sign in</button>
          <button class="auth-tab" data-tab="signup">Sign up</button>
        </div>

        <h1 class="auth-heading">Welcome back</h1>
        <p class="auth-subheading">Sign in to access your coding workspace and agent.</p>

        <form class="auth-form" id="loginForm">
          <div class="auth-field">
            <label class="label" for="loginEmail">Email</label>
            <input class="input" type="email" id="loginEmail" placeholder="you@example.com" required autocomplete="email" />
          </div>
          <div class="auth-field">
            <label class="label" for="loginPassword">Password</label>
            <input class="input" type="password" id="loginPassword" placeholder="Enter your password" required autocomplete="current-password" />
          </div>
          <button type="button" class="auth-forgot" id="forgotBtn">Forgot password?</button>
          <button type="submit" class="auth-submit" id="loginSubmit">Sign in</button>
        </form>

        <div class="auth-divider">or continue with</div>

        <div class="auth-social-row">
          <button class="auth-social-btn" id="googleBtn">
            ${GOOGLE_ICON}
            Google
          </button>
          <button class="auth-social-btn" id="githubBtn">
            ${GITHUB_ICON}
            GitHub
          </button>
        </div>

        <button class="auth-preview-btn" id="previewBtn">Preview Login (temporary)</button>

        <div class="auth-footer">
          Don't have an account? <button id="toSignup">Sign up</button>
        </div>
      </div>
    </div>
  `;
}

function renderSignup() {
  return `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-logo">
          <div class="auth-logo-icon">${WAVE_ICON}</div>
          <span class="auth-logo-text">Ocean.studio</span>
        </div>

        <div class="auth-tabs">
          <button class="auth-tab" data-tab="login">Sign in</button>
          <button class="auth-tab active" data-tab="signup">Sign up</button>
        </div>

        <h1 class="auth-heading">Create account</h1>
        <p class="auth-subheading">Start building with Ocean.studio today.</p>

        <form class="auth-form" id="signupForm">
          <div class="auth-field">
            <label class="label" for="signupName">Full name</label>
            <input class="input" type="text" id="signupName" placeholder="Your name" required autocomplete="name" />
          </div>
          <div class="auth-field">
            <label class="label" for="signupEmail">Email</label>
            <input class="input" type="email" id="signupEmail" placeholder="you@example.com" required autocomplete="email" />
          </div>
          <div class="auth-field">
            <label class="label" for="signupPassword">Password</label>
            <input class="input" type="password" id="signupPassword" placeholder="Create a password" required autocomplete="new-password" minlength="6" />
          </div>
          <button type="submit" class="auth-submit" id="signupSubmit">Create account</button>
        </form>

        <div class="auth-divider">or continue with</div>

        <div class="auth-social-row">
          <button class="auth-social-btn" id="googleBtn">
            ${GOOGLE_ICON}
            Google
          </button>
          <button class="auth-social-btn" id="githubBtn">
            ${GITHUB_ICON}
            GitHub
          </button>
        </div>

        <div class="auth-footer">
          Already have an account? <button id="toLogin">Sign in</button>
        </div>
      </div>
    </div>
  `;
}

function renderForgot() {
  return `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-logo">
          <div class="auth-logo-icon">${WAVE_ICON}</div>
          <span class="auth-logo-text">Ocean.studio</span>
        </div>

        <button class="auth-back-btn" id="backToLogin">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Back to sign in
        </button>

        <h1 class="auth-heading">Reset password</h1>
        <p class="auth-subheading">Enter your email and we'll send you a link to reset your password.</p>

        <form class="auth-form" id="forgotForm">
          <div class="auth-field">
            <label class="label" for="forgotEmail">Email</label>
            <input class="input" type="email" id="forgotEmail" placeholder="you@example.com" required autocomplete="email" />
          </div>
          <button type="submit" class="auth-submit" id="forgotSubmit">Send reset link</button>
        </form>
      </div>
    </div>
  `;
}

function bindEvents(container) {
  // Tab switching
  container.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentView = tab.dataset.tab;
      renderAuthPage();
    });
  });

  // Navigation buttons
  const toSignup = container.querySelector('#toSignup');
  if (toSignup) toSignup.addEventListener('click', () => { currentView = 'signup'; renderAuthPage(); });

  const toLogin = container.querySelector('#toLogin');
  if (toLogin) toLogin.addEventListener('click', () => { currentView = 'login'; renderAuthPage(); });

  const forgotBtn = container.querySelector('#forgotBtn');
  if (forgotBtn) forgotBtn.addEventListener('click', () => { currentView = 'forgot'; renderAuthPage(); });

  const backToLogin = container.querySelector('#backToLogin');
  if (backToLogin) backToLogin.addEventListener('click', () => { currentView = 'login'; renderAuthPage(); });

  // Login form
  const loginForm = container.querySelector('#loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = container.querySelector('#loginEmail').value;
      const password = container.querySelector('#loginPassword').value;
      const btn = container.querySelector('#loginSubmit');
      setLoading(btn, true);
      try {
        await signInWithEmailAndPassword(auth, email, password);
        router.navigate('/');
      } catch (err) {
        setLoading(btn, false);
        const msg = err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-email' ? 'Invalid email or password.'
          : err.code === 'auth/user-not-found' ? 'No account found with this email.'
          : err.code === 'auth/wrong-password' ? 'Incorrect password.'
          : err.code === 'auth/too-many-requests' ? 'Too many attempts. Please try again later.'
          : 'Something went wrong. Please try again.';
        showError(container, msg);
      }
    });
  }

  // Signup form
  const signupForm = container.querySelector('#signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = container.querySelector('#signupName').value;
      const email = container.querySelector('#signupEmail').value;
      const password = container.querySelector('#signupPassword').value;
      const btn = container.querySelector('#signupSubmit');
      setLoading(btn, true);
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        router.navigate('/');
      } catch (err) {
        setLoading(btn, false);
        const msg = err.code === 'auth/email-already-in-use' ? 'An account with this email already exists.'
          : err.code === 'auth/weak-password' ? 'Password should be at least 6 characters.'
          : 'Something went wrong. Please try again.';
        showError(container, msg);
      }
    });
  }

  // Forgot form
  const forgotForm = container.querySelector('#forgotForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = container.querySelector('#forgotEmail').value;
      const btn = container.querySelector('#forgotSubmit');
      setLoading(btn, true);
      try {
        await sendPasswordResetEmail(auth, email);
        setLoading(btn, false);
        showSuccess(container, 'Password reset email sent! Check your inbox.');
      } catch (err) {
        setLoading(btn, false);
        showError(container, 'Could not send reset email. Please check your email address.');
      }
    });
  }

  // Google OAuth button
  const googleBtn = container.querySelector('#googleBtn');
  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      try {
        await signInWithPopup(auth, googleProvider);
        router.navigate('/');
      } catch (err) {
        if (err.code === 'auth/popup-blocked' || err.code === 'auth/operation-not-supported-in-this-environment') {
          // Fallback to redirect mode for mobile / blocked popups
          await signInWithRedirect(auth, googleProvider);
        } else if (err.code !== 'auth/popup-closed-by-user') {
          showError(container, `Google sign-in failed (${err.code || err.message}). Please try again.`);
        }
      }
    });
  }

  // GitHub OAuth button (with full redirect fallback)
  const githubBtn = container.querySelector('#githubBtn');
  if (githubBtn) {
    githubBtn.addEventListener('click', async () => {
      try {
        await signInWithPopup(auth, githubProvider);
        router.navigate('/');
      } catch (err) {
        if (err.code === 'auth/popup-blocked' || err.code === 'auth/operation-not-supported-in-this-environment') {
          // Fallback to redirect mode for mobile / blocked popups
          await signInWithRedirect(auth, githubProvider);
        } else if (err.code === 'auth/account-exists-with-different-credential') {
          showError(container, 'An account already exists with the same email address using a different sign-in method.');
        } else if (err.code !== 'auth/popup-closed-by-user') {
          showError(container, `GitHub sign-in failed (${err.code || err.message}). Please try again.`);
        }
      }
    });
  }

  // Preview login (bypass auth)
  const previewBtn = container.querySelector('#previewBtn');
  if (previewBtn) {
    previewBtn.addEventListener('click', () => {
      sessionStorage.setItem('ocean_preview_mode', 'true');
      router.navigate('/');
    });
  }
}

function renderAuthPage() {
  const app = document.getElementById('app');
  let html;
  switch (currentView) {
    case 'signup': html = renderSignup(); break;
    case 'forgot': html = renderForgot(); break;
    default: html = renderLogin();
  }
  app.innerHTML = html;
  bindEvents(app);
}

export function initAuthPage() {
  currentView = 'login';
  renderAuthPage();

  // Check for redirect result from Google/GitHub OAuth redirect flow
  getRedirectResult(auth).then((result) => {
    if (result && result.user) {
      router.navigate('/');
    }
  }).catch((err) => {
    const app = document.getElementById('app');
    if (app && err.code !== 'auth/popup-closed-by-user') {
      showError(app, `Authentication failed: ${err.message}`);
    }
  });
}
