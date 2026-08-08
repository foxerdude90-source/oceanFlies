# Ocean.studio — Mobile Coding IDE & Native Android Terminal Engine

Official repository for **Ocean.studio** (`com.ocean.terminal`) — a hardware-level mobile development workspace, native Android POSIX terminal emulator, live preview engine, and AI coding agent.

---

## 🏛️ Project Repositories & Modules

### 1. `OceanStudio/` (Native Android APK Project — `com.ocean.terminal`)
- **Language**: Kotlin 1.9+, C++20 (NDK 25+), CMake 3.22+
- **Target SDK**: **Target SDK 28** (bypasses Android W^X executable restrictions for user-space POSIX binaries)
- **Native PTY Core**: `app/src/main/cpp/native-pty.cpp` JNI bindings for `openpty()`, `forkpty()`, and `ioctl(TIOCSWINSZ)`
- **User-Space Sandbox**: `/data/data/com.ocean.terminal/files/usr` (`PREFIX`) & `/data/data/com.ocean.terminal/files/home` (`HOME`)
- **Bootstrap Engine**: `BootstrapInstaller.kt` extracts `bootstrap-arm64.zip` POSIX utilities (`sh`, `ls`, `cat`, `mkdir`, `ps`, `curl`) on first launch
- **Custom TerminalView**: Native Android Canvas text matrix grid (`#FFFFFF` background, `#1E293B` text, `#0284C7` crisp ocean blue prompt)
- **Soft Touch Keyboard Bar**: Translucent action bar containing touch buttons for `Ctrl`, `Alt`, `Tab`, `Esc`, `|`, `~`, `-`, `/`, `▲`, `▼`, `◄`, `►`
- **Firebase Auth**: `AuthActivity.kt` matching design specs with Email/Password, Google OAuth, GitHub OAuth, and Preview Login bypass

### 2. `oceanstudio/` (Web IDE Workspace & Preview)
- **Tech Stack**: Vite, Monaco Editor, xterm.js, Firebase JS SDK
- **Features**: Multi-tab code editor, live iframe preview, Ocean Agent chat with expandable task UI (`▶`), native terminal drawer, setup wizard

---

## 📄 Specifications & Agent Docs
- [`AGENTS.md`](./AGENTS.md): Agent capabilities, POSIX terminal access, and execution modes
- [`SKILL.md`](./SKILL.md): Ocean Agent skills & operational procedures
- [`walkthrough.md`](./walkthrough.md): Technical implementation summary
- [`implementation_plan.md`](./implementation_plan.md): Architectural design document

---

## 🔑 Firebase Credentials
Configured with project `oceanstudio-ef4c5`:
- App ID: `1:2746278315:web:e7b281fe41fcc5a875b2ee`
- Auth Domain: `oceanstudio-ef4c5.firebaseapp.com`
