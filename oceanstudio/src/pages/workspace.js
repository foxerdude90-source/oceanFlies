// Workspace Page — Ocean.studio
// Main IDE: File Explorer, Monaco Editor, Live Preview, Ocean Agent Chat, Native Terminal
import { router } from '../utils/router.js';
import { auth, signOut } from '../firebase.js';

const WAVE_ICON = `<svg viewBox="0 0 32 32" fill="none"><path d="M4 18c0 0 4-6 12-6s12 6 12 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M4 14c0 0 4-6 12-6s12 6 12 6" stroke="#0284C7" stroke-width="2" stroke-linecap="round" opacity="0.5"/><path d="M4 22c0 0 4-6 12-6s12 6 12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.3"/></svg>`;

// Virtual file system
const fileSystem = {
  name: 'project',
  type: 'folder',
  open: true,
  children: [
    { name: 'src', type: 'folder', open: true, children: [
      { name: 'index.html', type: 'file', language: 'html', content: '<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <title>Ocean.studio Preview</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <div id="app">\n    <div class="card">\n      <div class="wave-icon">\n        <svg width="40" height="40" viewBox="0 0 32 32" fill="none"><path d="M4 18c0 0 4-6 12-6s12 6 12 6" stroke="#0284C7" stroke-width="2.5" stroke-linecap="round"/><path d="M4 14c0 0 4-6 12-6s12 6 12 6" stroke="#38BDF8" stroke-width="2" stroke-linecap="round" opacity="0.5"/><path d="M4 22c0 0 4-6 12-6s12 6 12 6" stroke="#0F172A" stroke-width="2" stroke-linecap="round" opacity="0.3"/></svg>\n      </div>\n      <h1>Welcome to Ocean.studio</h1>\n      <p>Your hardware-driven coding environment & AI workspace is running live.</p>\n      <button id="actionBtn" onclick="alert(\'Hello from Ocean.studio!\')">Click Me</button>\n    </div>\n  </div>\n  <script src="app.js"></script>\n</body>\n</html>' },
      { name: 'style.css', type: 'file', language: 'css', content: '* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\n  background: #FEFCFA;\n  color: #1E293B;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 100vh;\n  padding: 2rem;\n}\n\n#app {\n  width: 100%;\n  max-width: 500px;\n}\n\n.card {\n  background: #FFFFFF;\n  border: 1px solid #E2E8F0;\n  border-radius: 16px;\n  padding: 2.5rem;\n  text-align: center;\n  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05);\n}\n\n.wave-icon {\n  margin-bottom: 1.5rem;\n}\n\nh1 {\n  font-size: 1.75rem;\n  font-weight: 700;\n  color: #0F172A;\n  margin-bottom: 0.75rem;\n}\n\np {\n  font-size: 0.95rem;\n  color: #64748B;\n  line-height: 1.6;\n  margin-bottom: 1.5rem;\n}\n\nbutton {\n  background: #0F172A;\n  color: #FFFFFF;\n  border: none;\n  padding: 0.75rem 1.75rem;\n  border-radius: 8px;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n\nbutton:hover {\n  background: #334155;\n  transform: translateY(-1px);\n}' },
      { name: 'app.js', type: 'file', language: 'javascript', content: '// Ocean.studio - App Logic\n\ndocument.addEventListener("DOMContentLoaded", () => {\n  console.log("Ocean.studio Live Preview Active");\n});' },
    ]},
    { name: 'public', type: 'folder', open: false, children: [
      { name: 'favicon.ico', type: 'file', language: 'plaintext', content: '(binary file)' },
    ]},
    { name: 'package.json', type: 'file', language: 'json', content: '{\n  "name": "ocean-app",\n  "version": "1.0.0",\n  "private": true,\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build"\n  }\n}' },
    { name: 'README.md', type: 'file', language: 'markdown', content: '# Ocean.studio App\n\nBuilt with [Ocean.studio](https://ocean.studio)\n\n## Features\n- Live Code Editor\n- Real-time Preview Engine\n- Ocean AI Agent Integration\n- Native Mobile Terminal' },
  ]
};

let activeFile = null;
let openTabs = [];
let currentView = 'editor'; // 'editor' | 'preview' | 'codebase'
let terminalOpen = false;
let chatMessages = [];
let monacoEditor = null;
let termInstance = null;

function getFileIcon(name) {
  const ext = name.split('.').pop();
  const colors = {
    html: '#E44D26', css: '#264DE4', js: '#F7DF1E', json: '#5B5B5B',
    md: '#083FA1', ts: '#3178C6', jsx: '#61DAFB', tsx: '#3178C6',
    py: '#3776AB', rb: '#CC342D', go: '#00ADD8', rs: '#DEA584',
    ico: '#999', svg: '#FFB13B'
  };
  const color = colors[ext] || '#94A3B8';
  return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 2h6.5L13 5.5V14H3V2Z" stroke="${color}" stroke-width="1.2"/><path d="M9 2v4h4" stroke="${color}" stroke-width="1.2"/></svg>`;
}

function renderFileTree(node, depth = 0) {
  if (node.type === 'folder') {
    return `
      <div class="ws-file-item folder ${node.open ? 'open' : ''}" data-path="${node.name}" style="padding-left: ${12 + depth * 16}px">
        <span class="ws-file-arrow">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3 2l4 3-4 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
        <span class="ws-file-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h4l2-2h6v11H2V4Z" stroke="#F59E0B" stroke-width="1.2" fill="${node.open ? '#FEF3C7' : 'none'}"/></svg>
        </span>
        <span class="ws-file-name">${node.name}</span>
      </div>
      <div class="ws-file-children ${node.open ? '' : 'hidden'}">
        ${(node.children || []).map(c => renderFileTree(c, depth + 1)).join('')}
      </div>
    `;
  }
  return `
    <div class="ws-file-item file ${activeFile === node ? 'active' : ''}" data-filename="${node.name}" style="padding-left: ${12 + depth * 16}px">
      <span class="ws-file-icon">${getFileIcon(node.name)}</span>
      <span class="ws-file-name">${node.name}</span>
    </div>
  `;
}

function findFile(node, name) {
  if (node.type === 'file' && node.name === name) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findFile(child, name);
      if (found) return found;
    }
  }
  return null;
}

function findFolder(node, name) {
  if (node.type === 'folder' && node.name === name) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findFolder(child, name);
      if (found) return found;
    }
  }
  return null;
}

function addFileToFS(filename, content = '') {
  const ext = filename.split('.').pop();
  const langMap = { html: 'html', css: 'css', js: 'javascript', json: 'json', md: 'markdown', txt: 'plaintext' };
  const newFile = {
    name: filename,
    type: 'file',
    language: langMap[ext] || 'plaintext',
    content: content || `// ${filename}\n`
  };
  
  // Add to src folder if it exists, otherwise root
  const srcFolder = findFolder(fileSystem, 'src');
  if (srcFolder) {
    srcFolder.children.push(newFile);
  } else {
    fileSystem.children.push(newFile);
  }
  return newFile;
}

function openFile(file) {
  if (!file || file.type !== 'file') return;
  activeFile = file;
  if (!openTabs.includes(file)) openTabs.push(file);
  renderWorkspace();
  initEditor(file);
}

function closeTab(file) {
  openTabs = openTabs.filter(t => t !== file);
  if (activeFile === file) {
    activeFile = openTabs.length > 0 ? openTabs[openTabs.length - 1] : null;
  }
  renderWorkspace();
  if (activeFile) initEditor(activeFile);
}

async function initEditor(file) {
  if (!file) return;
  const container = document.getElementById('monacoContainer');
  if (!container) return;

  try {
    const monaco = await import('monaco-editor');

    if (monacoEditor) {
      monacoEditor.setValue(file.content);
      const langMap = { html: 'html', css: 'css', javascript: 'javascript', js: 'javascript', json: 'json', markdown: 'markdown', md: 'markdown', plaintext: 'plaintext' };
      const model = monacoEditor.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, langMap[file.language] || 'plaintext');
      }
    } else {
      self.MonacoEnvironment = {
        getWorker: function () {
          return new Worker(
            URL.createObjectURL(new Blob([''], { type: 'application/javascript' }))
          );
        }
      };

      monacoEditor = monaco.editor.create(container, {
        value: file.content,
        language: file.language || 'plaintext',
        theme: 'vs',
        fontSize: 13,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        minimap: { enabled: false },
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        renderLineHighlight: 'line',
        padding: { top: 12 },
        automaticLayout: true,
        wordWrap: 'on',
        tabSize: 2,
        bracketPairColorization: { enabled: true },
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
      });

      monacoEditor.onDidChangeModelContent(() => {
        if (activeFile) {
          activeFile.content = monacoEditor.getValue();
          updateLivePreview();
        }
      });
    }
  } catch (err) {
    container.innerHTML = `
      <textarea id="fallbackEditor" style="width:100%;height:100%;border:none;resize:none;padding:16px;font-family:var(--font-mono);font-size:13px;background:var(--color-bg);color:var(--color-text-primary);outline:none;line-height:1.6;">${file.content}</textarea>
    `;
    const textarea = container.querySelector('#fallbackEditor');
    textarea.addEventListener('input', () => {
      file.content = textarea.value;
      updateLivePreview();
    });
  }
}

function updateLivePreview() {
  const iframe = document.getElementById('previewFrame');
  if (!iframe) return;

  const htmlFile = findFile(fileSystem, 'index.html');
  const cssFile = findFile(fileSystem, 'style.css');
  const jsFile = findFile(fileSystem, 'app.js');

  let htmlContent = htmlFile ? htmlFile.content : '<h1>No index.html</h1>';
  const cssContent = cssFile ? cssFile.content : '';
  const jsContent = jsFile ? jsFile.content : '';

  // Inject CSS & JS inline into preview
  if (cssContent) {
    htmlContent = htmlContent.replace('</head>', `<style>${cssContent}</style></head>`);
  }
  if (jsContent) {
    htmlContent = htmlContent.replace('</body>', `<script>${jsContent}</script></body>`);
  }

  iframe.srcdoc = htmlContent;
}

function addChatMessage(text, type = 'user') {
  chatMessages.push({ text, type, time: new Date() });
  renderChatMessages();
  
  if (type === 'user') {
    // Process intent and simulate full Ocean Agent workflow
    setTimeout(() => {
      const taskId = Date.now();
      let responseText = '';
      let tasks = [];

      const lower = text.toLowerCase();
      if (lower.includes('button') || lower.includes('component') || lower.includes('card')) {
        tasks = [
          { id: taskId, label: 'Reading project structure', status: 'done', time: '0.4s', log: 'Inspected src/index.html & src/style.css' },
          { id: taskId + 1, label: 'Updating src/index.html & src/style.css', status: 'done', time: '1.1s', log: 'Added UI component markup and modern styles' },
          { id: taskId + 2, label: 'Updating live preview', status: 'done', time: '0.3s', log: 'Bound port 5173 to preview panel' },
        ];
        responseText = `I've created the requested UI element in \`src/index.html\` and added styling in \`src/style.css\`. Switch to the **Preview** tab to see it live!`;
      } else if (lower.includes('file') || lower.includes('create') || lower.includes('add')) {
        const match = text.match(/([a-zA-Z0-9_-]+\.[a-zA-Z0-9]+)/);
        const fileName = match ? match[1] : 'newfile.js';
        const newFile = addFileToFS(fileName, `// ${fileName} created by Ocean Agent\nconsole.log("Module loaded: ${fileName}");`);
        openFile(newFile);
        tasks = [
          { id: taskId, label: 'Parsing file request', status: 'done', time: '0.3s', log: `Filename identified: ${fileName}` },
          { id: taskId + 1, label: `Creating file ${fileName}`, status: 'done', time: '0.6s', log: `Written to /src/${fileName}` },
        ];
        responseText = `Created file **${fileName}** in the \`src/\` folder and opened it in the editor!`;
      } else {
        tasks = [
          { id: taskId, label: 'Analyzing request intent', status: 'done', time: '0.5s', log: `Parsed: "${text}"\nAgent mode: Auto` },
          { id: taskId + 1, label: 'Running terminal diagnostic', status: 'done', time: '0.9s', log: 'Executed internal static check\n0 syntax errors found' },
        ];
        responseText = `I've reviewed your request: "${text}". Everything looks great. I can modify files, run terminal commands, or update the live preview for you!`;
      }

      chatMessages.push({
        type: 'agent',
        tasks: tasks,
        text: responseText,
        time: new Date()
      });
      renderChatMessages();
    }, 1200);
  }
}

function renderChatMessages() {
  const container = document.querySelector('.ws-chat-messages');
  if (!container) return;

  if (chatMessages.length === 0) {
    container.innerHTML = `
      <div class="ws-chat-welcome">
        <h3>Ocean Agent</h3>
        <p>I'm your AI coding assistant. I can read your code, run terminal commands, modify files, and update live previews. Ask me anything.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = chatMessages.map(msg => {
    if (msg.type === 'user') {
      return `<div class="ws-chat-msg"><div class="ws-chat-msg-user">${escapeHtml(msg.text)}</div></div>`;
    }
    let tasksHtml = '';
    if (msg.tasks) {
      tasksHtml = msg.tasks.map(t => `
        <div class="ws-agent-task" data-taskid="${t.id}">
          <div class="ws-agent-task-header">
            <svg class="ws-agent-task-arrow" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            <span class="ws-agent-task-label shimmer-text">${t.label}</span>
            <span class="ws-agent-task-time">${t.time}</span>
            <span class="ws-agent-task-status ${t.status}"></span>
          </div>
          <div class="ws-agent-task-body">
            <div class="ws-agent-task-log">${escapeHtml(t.log)}</div>
          </div>
        </div>
      `).join('');
    }
    return `
      <div class="ws-chat-msg">
        ${tasksHtml}
        <div class="ws-chat-msg-agent">${escapeHtml(msg.text).replace(/\n/g, '<br>')}</div>
      </div>
    `;
  }).join('');

  container.scrollTop = container.scrollHeight;

  container.querySelectorAll('.ws-agent-task-header').forEach(header => {
    header.addEventListener('click', () => {
      header.parentElement.classList.toggle('open');
    });
  });
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function renderWorkspace() {
  const app = document.getElementById('app');
  const user = auth.currentUser;
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Dev';

  app.innerHTML = `
    <div class="workspace">
      <!-- Top Bar -->
      <div class="ws-topbar">
        <div class="ws-topbar-left">
          <div class="ws-topbar-logo">${WAVE_ICON}<span>Ocean.studio</span></div>
          <button class="btn-icon btn-ghost" id="toggleLeftSidebar" title="Toggle file explorer">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3h12M2 8h12M2 13h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
        </div>
        <div class="ws-topbar-center">
          <button class="ws-tab ${currentView === 'editor' ? 'active' : ''}" data-view="editor">Editor</button>
          <button class="ws-tab ${currentView === 'preview' ? 'active' : ''}" data-view="preview">Preview</button>
          <button class="ws-tab ${currentView === 'codebase' ? 'active' : ''}" data-view="codebase">Codebase</button>
        </div>
        <div class="ws-topbar-right">
          <button class="btn-icon btn-ghost" id="toggleTerminal" title="Toggle terminal">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M5 6l2 2-2 2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 10h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
          </button>
          <button class="btn-icon btn-ghost" id="toggleRightSidebar" title="Toggle agent panel">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M14 3v10M2 3h12M2 8h8M2 13h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
          <span style="font-size:var(--text-xs);color:var(--color-text-muted);margin-left:var(--space-2)">${displayName}</span>
          <button class="btn btn-ghost btn-sm" id="wsSignOut" title="Sign out">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>

      <div class="ws-main">
        <!-- Left Sidebar -->
        <div class="ws-sidebar-left" id="leftSidebar">
          <div class="ws-sidebar-header">
            <span class="ws-sidebar-title">Explorer</span>
            <div class="ws-sidebar-actions">
              <button class="btn-icon btn-ghost btn-sm" title="New file" id="newFileBtn">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              </button>
            </div>
          </div>
          <div class="ws-filetree" id="fileTree">
            ${renderFileTree(fileSystem)}
          </div>
        </div>

        <!-- Center Panel -->
        <div class="ws-center">
          ${currentView === 'editor' ? `
            <div class="ws-editor-tabs">
              ${openTabs.map(tab => `
                <button class="ws-editor-tab ${tab === activeFile ? 'active' : ''}" data-tab="${tab.name}">
                  ${getFileIcon(tab.name)}
                  <span>${tab.name}</span>
                  <span class="ws-editor-tab-close" data-close="${tab.name}">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                  </span>
                </button>
              `).join('')}
            </div>
            <div class="ws-editor-content" id="monacoContainer">
              ${!activeFile ? `
                <div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--color-text-muted);font-size:var(--text-sm);">
                  Select a file from the explorer to start editing
                </div>
              ` : ''}
            </div>
          ` : currentView === 'preview' ? `
            <div class="ws-preview active">
              <div class="ws-preview-toolbar">
                <button class="btn-icon btn-ghost btn-sm" title="Toggle Size">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                </button>
                <input class="ws-preview-url" value="localhost:5173" readonly />
                <button class="btn-icon btn-ghost btn-sm" title="Refresh Preview" id="previewRefreshBtn">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7a6 6 0 1 1 1.5 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M1 11V7h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <button class="btn-icon btn-ghost btn-sm" title="Fullscreen" id="previewFullscreen">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </div>
              <iframe class="ws-preview-iframe" id="previewFrame" src="about:blank"></iframe>
            </div>
          ` : `
            <div style="padding:var(--space-6);overflow-y:auto;height:100%;">
              <h3 style="font-size:var(--text-md);font-weight:600;margin-bottom:var(--space-4);color:var(--color-text-primary);">Codebase Navigation</h3>
              <div id="codebaseTree">${renderFileTree(fileSystem)}</div>
            </div>
          `}

          <!-- Terminal -->
          <div class="ws-terminal-wrapper ${terminalOpen ? 'open' : ''}" id="terminalWrapper">
            <div class="ws-terminal-header">
              <div class="ws-terminal-title">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M5 6l2 2-2 2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 10h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                Ocean Native Terminal
              </div>
              <div class="ws-terminal-actions">
                <button class="btn-icon btn-ghost btn-sm" title="Clear" id="termClear">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                </button>
                <button class="btn-icon btn-ghost btn-sm" title="Close" id="termClose">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M9 3L3 9M3 3l6 6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                </button>
              </div>
            </div>
            <div class="ws-terminal-body" id="terminalBody"></div>
            <div class="ws-terminal-keybar">
              ${['Ctrl', 'Alt', 'Tab', 'Esc', '|', '~', '-', '/', 'Up', 'Down', 'Left', 'Right'].map(k => `
                <button class="ws-terminal-key" data-key="${k}">${k}</button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Right Sidebar (Chat) -->
        <div class="ws-sidebar-right" id="rightSidebar">
          <div class="ws-chat-header">
            <div class="ws-chat-title">
              <span class="ws-chat-status"></span>
              Ocean Agent
            </div>
            <button class="btn-icon btn-ghost btn-sm" id="chatSettings" title="Agent Settings">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="2" stroke="currentColor" stroke-width="1.3"/><path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.8 2.8l1.4 1.4M9.8 9.8l1.4 1.4M2.8 11.2l1.4-1.4M9.8 4.2l1.4-1.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
            </button>
          </div>

          <div class="ws-chat-messages" id="chatMessages"></div>

          <div class="ws-chat-input-area" style="position:relative;">
            <div class="ws-chat-plus-menu" id="plusMenu">
              <button class="ws-chat-plus-menu-item" data-action="upload-file">
                <svg viewBox="0 0 16 16" fill="none"><path d="M14 10v3H2v-3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 3v7M5 6l3-3 3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                Upload file
              </button>
              <button class="ws-chat-plus-menu-item" data-action="upload-photo">
                <svg viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" stroke-width="1.3"/><circle cx="5.5" cy="6.5" r="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M2 11l3-3 2 2 3-3 4 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                Upload photo
              </button>
              <button class="ws-chat-plus-menu-item" data-action="mcp">
                <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.3"/><path d="M8 5v3l2 1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                MCP Connectors
              </button>
              <button class="ws-chat-plus-menu-item" data-action="webhook">
                <svg viewBox="0 0 16 16" fill="none"><path d="M3 3l10 5-10 5V3Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
                Webhooks
              </button>
              <button class="ws-chat-plus-menu-item" data-action="plugin">
                <svg viewBox="0 0 16 16" fill="none"><path d="M6 2v3a2 2 0 1 0 4 0V2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><rect x="3" y="7" width="10" height="7" rx="1" stroke="currentColor" stroke-width="1.3"/></svg>
                Plugins
              </button>
            </div>
            <div class="ws-chat-input-wrapper">
              <button class="ws-chat-plus-btn" id="chatPlusBtn" title="Attach">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3v12M3 9h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </button>
              <textarea class="ws-chat-input" id="chatInput" placeholder="Ask Ocean Agent..." rows="1"></textarea>
              <button class="ws-chat-send-btn" id="chatSendBtn" disabled>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8h12M10 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </div>
          </div>
          <input type="file" id="fileUploadInput" style="display:none" />
          <input type="file" id="photoUploadInput" accept="image/*" style="display:none" />
        </div>
      </div>
    </div>
  `;

  bindWorkspaceEvents();
  renderChatMessages();

  if (currentView === 'preview') {
    setTimeout(updateLivePreview, 50);
  } else if (activeFile && currentView === 'editor') {
    setTimeout(() => initEditor(activeFile), 100);
  }

  if (terminalOpen) {
    setTimeout(() => initTerminal(), 100);
  }
}

function bindWorkspaceEvents() {
  const app = document.getElementById('app');

  // View tabs
  app.querySelectorAll('.ws-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentView = tab.dataset.view;
      renderWorkspace();
    });
  });

  // New file button
  app.querySelector('#newFileBtn')?.addEventListener('click', () => {
    const filename = prompt('Enter new file name (e.g., component.js):');
    if (filename && filename.trim()) {
      const newFile = addFileToFS(filename.trim());
      openFile(newFile);
    }
  });

  // Toggle sidebars
  app.querySelector('#toggleLeftSidebar')?.addEventListener('click', () => {
    document.getElementById('leftSidebar')?.classList.toggle('collapsed');
  });
  app.querySelector('#toggleRightSidebar')?.addEventListener('click', () => {
    document.getElementById('rightSidebar')?.classList.toggle('collapsed');
  });

  // Toggle terminal
  app.querySelector('#toggleTerminal')?.addEventListener('click', () => {
    terminalOpen = !terminalOpen;
    renderWorkspace();
  });
  app.querySelector('#termClose')?.addEventListener('click', () => {
    terminalOpen = false;
    renderWorkspace();
  });

  // Preview refresh button
  app.querySelector('#previewRefreshBtn')?.addEventListener('click', () => {
    updateLivePreview();
  });

  // Preview fullscreen
  app.querySelector('#previewFullscreen')?.addEventListener('click', () => {
    const frame = document.getElementById('previewFrame');
    if (frame) {
      if (frame.requestFullscreen) frame.requestFullscreen();
    }
  });

  // File tree clicks
  app.querySelectorAll('.ws-file-item.file').forEach(item => {
    item.addEventListener('click', () => {
      const file = findFile(fileSystem, item.dataset.filename);
      if (file) {
        currentView = 'editor';
        openFile(file);
      }
    });
  });

  // Folder toggles
  app.querySelectorAll('.ws-file-item.folder').forEach(item => {
    item.addEventListener('click', () => {
      const folder = findFolder(fileSystem, item.dataset.path);
      if (folder) {
        folder.open = !folder.open;
        renderWorkspace();
      }
    });
  });

  // Editor tabs
  app.querySelectorAll('.ws-editor-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      if (e.target.closest('.ws-editor-tab-close')) {
        const file = findFile(fileSystem, e.target.closest('.ws-editor-tab-close').dataset.close);
        if (file) closeTab(file);
        return;
      }
      const file = findFile(fileSystem, tab.dataset.tab);
      if (file) openFile(file);
    });
  });

  // Chat input
  const chatInput = app.querySelector('#chatInput');
  const sendBtn = app.querySelector('#chatSendBtn');
  if (chatInput) {
    chatInput.addEventListener('input', () => {
      sendBtn.disabled = !chatInput.value.trim();
      chatInput.style.height = 'auto';
      chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
    });
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (chatInput.value.trim()) {
          addChatMessage(chatInput.value.trim());
          chatInput.value = '';
          chatInput.style.height = 'auto';
          sendBtn.disabled = true;
        }
      }
    });
  }
  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      if (chatInput.value.trim()) {
        addChatMessage(chatInput.value.trim());
        chatInput.value = '';
        chatInput.style.height = 'auto';
        sendBtn.disabled = true;
      }
    });
  }

  // Plus menu
  const plusBtn = app.querySelector('#chatPlusBtn');
  const plusMenu = app.querySelector('#plusMenu');
  if (plusBtn && plusMenu) {
    plusBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      plusMenu.classList.toggle('show');
    });
    document.addEventListener('click', () => plusMenu.classList.remove('show'), { once: true });
  }

  // Plus menu items
  app.querySelectorAll('.ws-chat-plus-menu-item').forEach(item => {
    item.addEventListener('click', () => {
      const action = item.dataset.action;
      if (action === 'upload-file') document.getElementById('fileUploadInput')?.click();
      else if (action === 'upload-photo') document.getElementById('photoUploadInput')?.click();
      else if (action === 'mcp') addChatMessage('Configuring MCP Connectors...');
      else if (action === 'webhook') addChatMessage('Setting up Webhook Endpoint...');
      else if (action === 'plugin') addChatMessage('Opening Plugin Manager...');
      plusMenu?.classList.remove('show');
    });
  });

  // Upload file handler
  app.querySelector('#fileUploadInput')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const newFile = addFileToFS(file.name, evt.target.result);
        openFile(newFile);
        addChatMessage(`[Uploaded file: ${file.name} to sandbox storage]`);
      };
      reader.readAsText(file);
    }
  });

  // Upload photo handler
  app.querySelector('#photoUploadInput')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      addChatMessage(`[Uploaded image: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]`);
    }
  });

  // Sign out
  app.querySelector('#wsSignOut')?.addEventListener('click', async () => {
    sessionStorage.removeItem('ocean_preview_mode');
    sessionStorage.removeItem('ocean_config');
    await signOut(auth);
    router.navigate('/auth');
  });
}

async function initTerminal() {
  const container = document.getElementById('terminalBody');
  if (!container || container.querySelector('.xterm')) return;

  try {
    const { Terminal } = await import('@xterm/xterm');
    const { FitAddon } = await import('@xterm/addon-fit');
    await import('@xterm/xterm/css/xterm.css');

    const term = new Terminal({
      theme: {
        background: '#FFFFFF',
        foreground: '#1E293B',
        cursor: '#0284C7',
        selectionBackground: '#E0F2FE',
        selectionForeground: '#0369A1',
        black: '#1E293B',
        red: '#DC2626',
        green: '#059669',
        yellow: '#D97706',
        blue: '#0284C7',
        magenta: '#7C3AED',
        cyan: '#06B6D4',
        white: '#F8FAFC',
      },
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: 13,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: 'bar',
    });

    termInstance = term;
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(container);
    fitAddon.fit();

    term.writeln('\x1b[36m  Ocean Native Terminal Engine (v1.0.0-arm64)\x1b[0m');
    term.writeln('  PREFIX=/data/data/com.ocean.terminal/files/usr');
    term.writeln('  Type \x1b[32mhelp\x1b[0m or \x1b[32mls\x1b[0m to inspect sandbox.\n');
    term.write('\x1b[34m~/project $\x1b[0m ');

    let commandBuffer = '';
    term.onKey(({ key, domEvent }) => {
      if (domEvent.key === 'Enter') {
        term.writeln('');
        const cmd = commandBuffer.trim();
        if (cmd) {
          handleTerminalCommand(cmd, term);
        }
        commandBuffer = '';
        term.write('\x1b[34m~/project $\x1b[0m ');
      } else if (domEvent.key === 'Backspace') {
        if (commandBuffer.length > 0) {
          commandBuffer = commandBuffer.slice(0, -1);
          term.write('\b \b');
        }
      } else if (key.length === 1 && !domEvent.ctrlKey && !domEvent.altKey) {
        commandBuffer += key;
        term.write(key);
      }
    });

    // Soft keyboard bar keys
    document.querySelectorAll('.ws-terminal-key').forEach(btn => {
      btn.addEventListener('click', () => {
        const k = btn.dataset.key;
        if (k === 'Ctrl' || k === 'Alt') { /* modifier */ }
        else if (k === 'Tab') { term.write('\t'); commandBuffer += '\t'; }
        else if (k === 'Esc') { term.write('\x1b'); }
        else if (k === 'Up') { term.write('\x1b[A'); }
        else if (k === 'Down') { term.write('\x1b[B'); }
        else if (k === 'Left') { term.write('\x1b[D'); }
        else if (k === 'Right') { term.write('\x1b[C'); }
        else { term.write(k); commandBuffer += k; }
        term.focus();
      });
    });

    document.getElementById('termClear')?.addEventListener('click', () => {
      term.clear();
      term.write('\x1b[34m~/project $\x1b[0m ');
    });

    window.addEventListener('resize', () => fitAddon.fit());
  } catch (err) {
    container.innerHTML = `
      <div style="padding:var(--space-4);font-family:var(--font-mono);font-size:var(--text-sm);color:var(--color-text-secondary);">
        <div style="color:var(--color-accent);">Ocean Terminal Engine v1.0</div>
        <div style="margin-top:var(--space-2);">Sandbox active: /data/data/com.ocean.terminal/files/usr</div>
      </div>
    `;
  }
}

function handleTerminalCommand(cmd, term) {
  const parts = cmd.split(' ');
  const main = parts[0];

  if (main === 'clear') {
    term.clear();
  } else if (main === 'ls') {
    const srcFolder = findFolder(fileSystem, 'src');
    const rootFiles = fileSystem.children.map(c => c.name + (c.type === 'folder' ? '/' : ''));
    term.writeln('  ' + rootFiles.join('  '));
  } else if (main === 'pwd') {
    term.writeln('  /data/data/com.ocean.terminal/files/home/project');
  } else if (main === 'cat' && parts[1]) {
    const file = findFile(fileSystem, parts[1]);
    if (file) {
      const lines = file.content.split('\n');
      lines.forEach(l => term.writeln('  ' + l));
    } else {
      term.writeln(`  cat: ${parts[1]}: No such file or directory`);
    }
  } else if (main === 'touch' && parts[1]) {
    const newFile = addFileToFS(parts[1]);
    term.writeln(`  Created file ${parts[1]}`);
    openFile(newFile);
  } else if (main === 'mkdir' && parts[1]) {
    fileSystem.children.push({ name: parts[1], type: 'folder', open: true, children: [] });
    term.writeln(`  Created directory ${parts[1]}/`);
    renderWorkspace();
  } else if (main === 'npm' || main === 'node' || cmd.includes('dev') || cmd.includes('start') || cmd.includes('port')) {
    term.writeln('  \x1b[32m[Ocean Server]\x1b[0m Server started at http://localhost:5173/');
    term.writeln('  \x1b[36m[Preview]\x1b[0m Activating port in Live Preview panel...');
    setTimeout(() => {
      currentView = 'preview';
      renderWorkspace();
    }, 600);
  } else if (main === 'help') {
    term.writeln('  Available commands:');
    term.writeln('    ls               - List files in current directory');
    term.writeln('    cat <file>       - View file contents');
    term.writeln('    touch <file>     - Create a new file');
    term.writeln('    mkdir <folder>   - Create a directory');
    term.writeln('    npm run dev      - Start dev server & activate preview port');
    term.writeln('    pwd              - Print working directory');
    term.writeln('    clear            - Clear terminal screen');
  } else {
    term.writeln(`  \x1b[33mCommand executed: ${cmd}\x1b[0m`);
  }
}

export function initWorkspacePage() {
  if (!activeFile) {
    const defaultFile = findFile(fileSystem, 'index.html');
    if (defaultFile) {
      activeFile = defaultFile;
      openTabs = [defaultFile];
    }
  }
  renderWorkspace();
}
