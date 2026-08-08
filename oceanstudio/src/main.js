// Ocean.studio — Main Entry Point
import './styles/global.css';
import './styles/auth.css';
import './styles/landing.css';
import './styles/workspace.css';

import { router } from './utils/router.js';
import { auth, onAuthStateChanged } from './firebase.js';
import { initAuthPage } from './pages/auth.js';
import { initLandingPage } from './pages/landing.js';
import { initSetupPage } from './pages/setup.js';
import { initWorkspacePage } from './pages/workspace.js';

// Wait for auth state before starting router
let authReady = false;
let currentUser = null;

function isAuthenticated() {
  return currentUser !== null || sessionStorage.getItem('ocean_preview_mode') === 'true';
}

// Configure routes
router
  .on('/auth', () => {
    if (isAuthenticated()) {
      router.navigate('/', true);
      return;
    }
    document.title = 'Ocean.studio — Sign In';
    initAuthPage();
  })
  .on('/', () => {
    if (!isAuthenticated()) {
      router.navigate('/auth', true);
      return;
    }
    document.title = 'Ocean.studio — Home';
    initLandingPage();
  })
  .on('/setup', () => {
    if (!isAuthenticated()) {
      router.navigate('/auth', true);
      return;
    }
    document.title = 'Ocean.studio — Setup Workspace';
    initSetupPage();
  })
  .on('/workspace', () => {
    if (!isAuthenticated()) {
      router.navigate('/auth', true);
      return;
    }
    document.title = 'Ocean.studio — Workspace';
    initWorkspacePage();
  })
  .on('*', () => {
    router.navigate('/', true);
  });

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (!authReady) {
    authReady = true;
    router.start();
  } else {
    // Auth state changed (login/logout)
    if (user) {
      if (window.location.pathname === '/auth') {
        router.navigate('/');
      }
    } else {
      if (window.location.pathname !== '/auth') {
        router.navigate('/auth');
      }
    }
  }
});

// Fallback: if auth check takes too long, start anyway
setTimeout(() => {
  if (!authReady) {
    authReady = true;
    router.start();
  }
}, 3000);
