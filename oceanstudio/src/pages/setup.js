// Setup Page — Ocean.studio
// Workspace configuration: Template, Language, Agent Mode
import { router } from '../utils/router.js';

const WAVE_ICON = `<svg viewBox="0 0 32 32" fill="none"><path d="M4 18c0 0 4-6 12-6s12 6 12 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M4 14c0 0 4-6 12-6s12 6 12 6" stroke="#0284C7" stroke-width="2" stroke-linecap="round" opacity="0.5"/><path d="M4 22c0 0 4-6 12-6s12 6 12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.3"/></svg>`;

const templates = [
  { id: 'blank', name: 'Blank Project', desc: 'Start from scratch', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="16" height="16" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>` },
  { id: 'web', name: 'Web Application', desc: 'HTML, CSS, JS starter', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>` },
  { id: 'api', name: 'API Server', desc: 'Node.js REST API', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>` },
  { id: 'mobile', name: 'Mobile App', desc: 'React Native / Flutter', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>` },
];

const agentModes = [
  { id: 'review', name: 'Review-driven', desc: 'Agent does everything with your approval. You review each step before it executes.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>` },
  { id: 'auto', name: 'Auto Agent', desc: 'Agent thinks before proceeding and is cautious on critical things that could harm your project.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>` },
  { id: 'bypassed', name: 'Bypassed', desc: 'Agent works fully independently without any review. Maximum speed, complete autonomy.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>` },
];

let currentStep = 0;
let config = { template: 'blank', language: 'en', agentMode: 'auto' };

function renderStep() {
  const app = document.getElementById('app');

  const steps = ['Template', 'Language', 'Agent Mode'];
  const progress = ((currentStep + 1) / steps.length) * 100;

  let stepContent = '';

  if (currentStep === 0) {
    stepContent = `
      <h2 class="setup-step-title">Choose a template</h2>
      <p class="setup-step-desc">Select a starting point for your workspace.</p>
      <div class="setup-templates">
        ${templates.map(t => `
          <button class="setup-template-card ${config.template === t.id ? 'selected' : ''}" data-template="${t.id}">
            <div class="setup-template-icon">${t.icon}</div>
            <div class="setup-template-name">${t.name}</div>
            <div class="setup-template-desc">${t.desc}</div>
          </button>
        `).join('')}
      </div>
    `;
  } else if (currentStep === 1) {
    stepContent = `
      <h2 class="setup-step-title">Select language</h2>
      <p class="setup-step-desc">Choose the interface language for your workspace.</p>
      <div class="setup-language-list">
        ${['English', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Chinese', 'Arabic'].map((lang, i) => {
          const code = ['en', 'es', 'fr', 'de', 'ja', 'ko', 'zh', 'ar'][i];
          return `
            <button class="setup-language-item ${config.language === code ? 'selected' : ''}" data-lang="${code}">
              <span class="setup-language-name">${lang}</span>
              ${config.language === code ? '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8l3 3 5-5" stroke="#0284C7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}
            </button>
          `;
        }).join('')}
      </div>
    `;
  } else if (currentStep === 2) {
    stepContent = `
      <h2 class="setup-step-title">Agent mode</h2>
      <p class="setup-step-desc">How should the AI agent behave in your workspace?</p>
      <div class="setup-agent-modes">
        ${agentModes.map(m => `
          <button class="setup-agent-card ${config.agentMode === m.id ? 'selected' : ''}" data-mode="${m.id}">
            <div class="setup-agent-icon">${m.icon}</div>
            <div>
              <div class="setup-agent-name">${m.name}</div>
              <div class="setup-agent-desc">${m.desc}</div>
            </div>
          </button>
        `).join('')}
      </div>
    `;
  }

  app.innerHTML = `
    <div class="setup-page">
      <div class="setup-container">
        <div class="setup-header">
          <div class="setup-logo">
            ${WAVE_ICON}
            <span>Ocean.studio</span>
          </div>
          <button class="btn btn-ghost btn-sm" id="setupBack">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Back
          </button>
        </div>

        <div class="setup-progress">
          <div class="setup-progress-bar" style="width: ${progress}%"></div>
        </div>

        <div class="setup-steps-indicator">
          ${steps.map((s, i) => `
            <div class="setup-step-dot ${i <= currentStep ? 'active' : ''} ${i === currentStep ? 'current' : ''}">
              <span>${i + 1}</span>
            </div>
            ${i < steps.length - 1 ? '<div class="setup-step-line"></div>' : ''}
          `).join('')}
        </div>

        <div class="setup-step-content animate-fade-in" key="${currentStep}">
          ${stepContent}
        </div>

        <div class="setup-actions">
          ${currentStep > 0 ? '<button class="btn btn-secondary" id="prevStep">Previous</button>' : '<div></div>'}
          ${currentStep < steps.length - 1 
            ? '<button class="btn btn-primary" id="nextStep">Continue</button>'
            : '<button class="btn btn-accent btn-lg" id="launchWorkspace">Launch Workspace</button>'
          }
        </div>
      </div>
    </div>
  `;

  // Bind events
  app.querySelector('#setupBack')?.addEventListener('click', () => {
    if (currentStep === 0) router.navigate('/');
    else { currentStep--; renderStep(); }
  });

  app.querySelector('#prevStep')?.addEventListener('click', () => { currentStep--; renderStep(); });
  app.querySelector('#nextStep')?.addEventListener('click', () => { currentStep++; renderStep(); });
  app.querySelector('#launchWorkspace')?.addEventListener('click', () => {
    sessionStorage.setItem('ocean_config', JSON.stringify(config));
    router.navigate('/workspace');
  });

  // Template selection
  app.querySelectorAll('.setup-template-card').forEach(card => {
    card.addEventListener('click', () => {
      config.template = card.dataset.template;
      renderStep();
    });
  });

  // Language selection
  app.querySelectorAll('.setup-language-item').forEach(item => {
    item.addEventListener('click', () => {
      config.language = item.dataset.lang;
      renderStep();
    });
  });

  // Agent mode selection
  app.querySelectorAll('.setup-agent-card').forEach(card => {
    card.addEventListener('click', () => {
      config.agentMode = card.dataset.mode;
      renderStep();
    });
  });
}

export function initSetupPage() {
  currentStep = 0;
  config = { template: 'blank', language: 'en', agentMode: 'auto' };
  renderStep();
}
