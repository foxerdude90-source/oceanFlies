// Landing Page — Ocean.studio
import { router } from '../utils/router.js';
import { auth, signOut } from '../firebase.js';

const WAVE_ICON = `<svg viewBox="0 0 32 32" fill="none"><path d="M4 18c0 0 4-6 12-6s12 6 12 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M4 14c0 0 4-6 12-6s12 6 12 6" stroke="#0284C7" stroke-width="2" stroke-linecap="round" opacity="0.5"/><path d="M4 22c0 0 4-6 12-6s12 6 12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.3"/></svg>`;

const features = [
  {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 8l3 3-3 3"/><line x1="14" y1="14" x2="16" y2="14"/></svg>`,
    title: 'Native Terminal',
    desc: 'A real terminal running on your hardware. Install anything, run any command. No simulation, full system access.'
  },
  {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>`,
    title: 'AI Coding Agent',
    desc: 'An intelligent agent that reads your code, runs commands, and builds alongside you. Choose auto, review-driven, or bypassed mode.'
  },
  {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
    title: 'Live Preview',
    desc: 'See your apps render in real-time. Any port activated via terminal shows directly in the preview. Websites, apps, anything.'
  },
  {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    title: 'Full Code Editor',
    desc: 'Syntax highlighting, multi-file tabs, search & replace, and all the editor features you expect. Built for real work.'
  },
  {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    title: 'File Explorer',
    desc: 'Browse your entire codebase with nested folder navigation. Create, rename, delete — everything works exactly as you need.'
  },
  {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
    title: 'MCP & Plugins',
    desc: 'Connect external tools, webhooks, and MCP connectors. Extend your workspace with the integrations you need.'
  }
];

export function initLandingPage() {
  const app = document.getElementById('app');
  const user = auth.currentUser;
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Developer';

  app.innerHTML = `
    <div class="landing-page">
      <!-- Navigation -->
      <nav class="landing-nav">
        <div class="landing-nav-logo">
          ${WAVE_ICON}
          <span>Ocean.studio</span>
        </div>
        <div class="landing-nav-actions">
          ${user ? `
            <span style="font-size: var(--text-sm); color: var(--color-text-muted);">Hi, ${displayName}</span>
            <button class="btn btn-ghost btn-sm" id="signOutBtn">Sign out</button>
          ` : ''}
          <button class="btn btn-primary btn-sm" id="launchBtnNav">Launch Workspace</button>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="landing-hero">
        <div class="landing-hero-bg">
          <div class="landing-orb landing-orb-1"></div>
          <div class="landing-orb landing-orb-2"></div>
          <div class="landing-orb landing-orb-3"></div>
        </div>
        <div class="landing-hero-content">
          <div class="landing-badge">
            <span class="landing-badge-dot"></span>
            Now in early access
          </div>
          <h1>Build anything,<br/>from <span class="accent">anywhere</span></h1>
          <p class="landing-hero-desc">
            Ocean.studio is a full-powered coding workspace with an AI agent that writes, runs, and deploys code on your device. 
            A real terminal, live preview, and intelligent assistant — all in one place.
          </p>
          <div class="landing-hero-actions">
            <button class="btn btn-primary" id="launchBtnHero">
              Launch Workspace
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button class="btn btn-secondary" id="learnMoreBtn">Learn more</button>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="landing-features" id="features">
        <div class="landing-section-label">Features</div>
        <h2 class="landing-section-title">Everything you need to build</h2>
        <p class="landing-section-desc">
          No mock-ups, no simulations. Every feature is real, functional, and built for serious development work.
        </p>
        <div class="landing-features-grid">
          ${features.map(f => `
            <div class="landing-feature-card">
              <div class="landing-feature-icon">${f.icon}</div>
              <h3>${f.title}</h3>
              <p>${f.desc}</p>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Stats -->
      <section class="landing-stats">
        <div class="landing-stats-grid">
          <div>
            <div class="landing-stat-value">100%</div>
            <div class="landing-stat-label">Native execution</div>
          </div>
          <div>
            <div class="landing-stat-value">3</div>
            <div class="landing-stat-label">Agent modes</div>
          </div>
          <div>
            <div class="landing-stat-value">Real</div>
            <div class="landing-stat-label">Terminal access</div>
          </div>
          <div>
            <div class="landing-stat-value">Live</div>
            <div class="landing-stat-label">Preview engine</div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="landing-cta">
        <h2>Ready to start building?</h2>
        <p>
          Launch your workspace and let the agent handle the heavy lifting. 
          Write code, run terminals, preview apps — all from one place.
        </p>
        <button class="btn btn-primary btn-lg" id="launchBtnCta">
          Launch Workspace
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </section>

      <!-- Footer -->
      <footer class="landing-footer">
        <div class="landing-footer-inner">
          <div class="landing-footer-left">
            ${WAVE_ICON}
            <span>Ocean.studio &copy; 2026. All rights reserved.</span>
          </div>
          <div class="landing-footer-links">
            <a href="#">Documentation</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  `;

  // Bind events
  const launchButtons = ['#launchBtnNav', '#launchBtnHero', '#launchBtnCta'];
  launchButtons.forEach(sel => {
    const btn = app.querySelector(sel);
    if (btn) btn.addEventListener('click', () => router.navigate('/setup'));
  });

  const learnMoreBtn = app.querySelector('#learnMoreBtn');
  if (learnMoreBtn) {
    learnMoreBtn.addEventListener('click', () => {
      document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
    });
  }

  const signOutBtn = app.querySelector('#signOutBtn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
      sessionStorage.removeItem('ocean_preview_mode');
      await signOut(auth);
      router.navigate('/auth');
    });
  }

  // Intersection Observer for feature card animations
  const cards = app.querySelectorAll('.landing-feature-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.animation = `fadeInUp 0.5s ease-out ${i * 0.1}s both`;
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  cards.forEach(card => observer.observe(card));
}
