# 🌊 OceanStudio — Native POSIX IDE & Terminal Engine

![Android CI](https://img.shields.io/badge/Android-SDK%2034-0284C7?style=for-the-badge&logo=android&logoColor=white)
![Build Status](https://img.shields.io/badge/Build-Passing-10B981?style=for-the-badge&logo=github-actions&logoColor=white)
![Firebase Auth](https://img.shields.io/badge/Firebase-Native_Android-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-6366F1?style=for-the-badge)

**OceanStudio** (`oceanstudio.ai`) is a production-grade, native Android application engineered in Kotlin, C++, and Android NDK. It features a complete non-simulated POSIX Linux terminal environment operating via native pseudo-terminals (PTY), executing real system calls and binaries within an isolated user-space sandbox (`/data/data/oceanstudio.ai/files/usr`).

---

## ⚡ Quick Direct Download & Direct Install

You can download and install the pre-compiled Android binaries directly from the latest GitHub Releases:

| Artifact Type | Package Format | Direct Download Link | Description |
| :--- | :--- | :--- | :--- |
| **Release APK** | `.apk` | [📥 Download Release APK](https://github.com/foxerdude90-source/oceanFlies/releases/latest) | Signed production release build ready for direct side-loading on Android devices. |
| **Debug APK** | `.apk` | [📥 Download Debug APK](https://github.com/foxerdude90-source/oceanFlies/releases/latest) | Debug build containing full logging for developers and testers. |
| **App Bundle** | `.aab` | [📥 Download App Bundle (AAB)](https://github.com/foxerdude90-source/oceanFlies/releases/latest) | Play Store App Bundle optimized for Google Play Console deployment. |

---

## 🎨 White Studio Aesthetic & Design Specs

OceanStudio adheres strictly to the **White Studio Aesthetic**:

- **Paper Background**: Pure Paper White (`#FFFFFF`) / Studio Off-White (`#F8FAFC`).
- **Text & Foreground**: Deep Charcoal (`#1E293B`).
- **Prompt & Cursor**: Crisp Ocean Blue (`#0284C7`).
- **Text Selection**: Soft Cyan Accent (`#E0F2FE`).
- **Typography**: Crisp System Monospace (`Typeface.MONOSPACE`).
- **Touch Keyboard Bar**: Action keys (`Ctrl`, `Alt`, `Tab`, `Esc`, `|`, `~`, `-`, `/`, `▲`, `▼`, `◄`, `►`).

---

## 🏗️ Architecture & Component Overview

```
OceanStudio/
├── app/
│   ├── google-services.json             # Native Android Firebase Config (oceanstudio.ai)
│   ├── src/main/
│   │   ├── cpp/
│   │   │   ├── native-pty.cpp           # C++ NDK JNI PTY Driver (openpty, forkpty, ioctl)
│   │   │   └── CMakeLists.txt           # CMake NDK build script targeting liboceanpty.so
│   │   ├── java/oceanstudio/ai/
│   │   │   ├── AuthActivity.kt          # Email, Google Sign-In SDK, GitHub OAuth, Preview mode
│   │   │   ├── LandingActivity.kt       # Workspace launcher screen
│   │   │   ├── SetupActivity.kt         # Template, Language, and Agent Mode selection
│   │   │   ├── MainActivity.kt          # Full IDE Workspace (Editor, Web Preview, Terminal, Agent)
│   │   │   ├── TerminalActivity.kt      # Standalone Terminal Activity with Soft Keys
│   │   │   ├── NativePTY.kt             # Kotlin JNI bridge object
│   │   │   ├── TerminalEnv.kt           # POSIX environment variables (/data/data/oceanstudio.ai/files/usr)
│   │   │   ├── BootstrapInstaller.kt    # POSIX BusyBox extraction engine
│   │   │   ├── TerminalBuffer.kt        # Text matrix grid buffer
│   │   │   ├── TerminalView.kt          # Custom Android Canvas terminal widget
│   │   │   ├── TerminalSession.kt       # Async PTY reader/writer stream manager
│   │   │   └── OceanWakeService.kt      # Foreground Service & PARTIAL_WAKE_LOCK
│   │   └── res/
│   │       └── layout/                  # Activity XML layouts (Auth, Landing, Setup, Main, Terminal)
│   └── build.gradle.kts                 # App module configuration & Firebase dependencies
└── build.gradle.kts                     # Root project configuration with google-services plugin
```

---

## 🔐 Firebase Configuration Details

- **Package Name**: `oceanstudio.ai`
- **Mobile SDK App ID**: `1:2746278315:android:071675f462ed2c3175b2ee`
- **OAuth Web Client ID**: `2746278315-vhu0ctt0e2b9kehrt6pq4lh8nsmsdvsd.apps.googleusercontent.com`
- **SHA-1 Fingerprint**: `CD:61:EF:9A:48:F8:C5:F3:04:95:74:21:89:D1:FA:71:06:D2:52:F7`
- **SHA-256 Fingerprint**: `2A:B9:52:78:E2:89:D9:5A:0B:A3:D5:D9:3E:49:C6:F4:2A:DE:D4:3B:FD:86:99:77:30:6A:DF:DB:95:51:27:A1`

---

## 🛠️ Building from Source

### Prerequisites:
- Android SDK 34 (Build-Tools 34.0.0)
- Android NDK (CMake 3.22.1+)
- JDK 17

### Build Commands:
```bash
# Clone the repository
git clone https://github.com/foxerdude90-source/oceanFlies.git
cd oceanFlies/OceanStudio

# Build Debug APK, Release APK, and Release AAB Bundle
./gradlew assembleDebug assembleRelease bundleRelease
```

Generated outputs will be located in:
- Debug APK: `app/build/outputs/apk/debug/app-debug.apk`
- Release APK: `app/build/outputs/apk/release/app-release.apk`
- App Bundle: `app/build/outputs/bundle/release/app-release.aab`

---

## 📱 Direct Installation Instructions on Android

1. Download **`app-release.apk`** or **`app-debug.apk`** to your Android device.
2. Open your File Manager and tap the downloaded `.apk` file.
3. If prompted, enable **"Install from unknown sources"** for your browser or file manager.
4. Tap **Install** and open **OceanStudio**.
5. Log in via Email, Google Sign-In, or click **"Preview Login (Bypass Auth)"** to launch the terminal workspace!

---

## 📄 License
This project is licensed under the MIT License.
EOF
