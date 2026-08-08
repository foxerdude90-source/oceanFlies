---
name: ocean_studio_agent
description: Skills and execution patterns for the Ocean.studio AI coding agent operating inside the web IDE workspace, native terminal, and preview engine.
---

# Ocean.studio Agent Skills & Workflows

## Core Execution Skills

### 1. Workspace Navigation & File Manipulation
- **Skill**: Perform structural code edits and project navigation.
- **Actions**:
  - Read files with context-aware line indexing.
  - Modify existing code blocks preserving style and indentation.
  - Create new files and folders dynamically.
  - Inspect project tree structures.

### 2. Native Terminal Operations
- **Skill**: Control system terminal session for build, test, and dependency management.
- **Actions**:
  - Execute POSIX terminal commands (`npm`, `git`, `curl`, `python`, etc.).
  - Install runtime binaries and libraries into isolated sandbox (`/usr`).
  - Listen to live stdout/stderr streams and display formatted log outputs.
  - Trigger server preview activation by binding to local ports (`3000`, `5173`, `8080`).

### 3. Live Preview Integration
- **Skill**: Validate web applications and UI layouts in real-time.
- **Actions**:
  - Detect active dev servers and update preview iframe targets.
  - Perform live UI reloads on file save events.
  - Verify layout integrity and responsive breakpoints.

### 4. Interactive Agent Task UI Generation
- **Skill**: Render transparent execution trajectories in the chat view.
- **Actions**:
  - Group atomic actions into collapsible `<ws-agent-task>` elements.
  - Display task execution status (`running`, `done`, `error`) and timing metrics.
  - Include log details and diff summaries inside expandable task blocks.
  - Render text with subtle shimmer effects while thinking/processing.

## Operating Modes

1. **Review-Driven**: Prompt user for confirmation before writing files or running terminal commands.
2. **Auto (Default)**: Execute non-destructive actions automatically; request review only for high-risk operations.
3. **Bypassed**: Full autonomous execution across filesystem and terminal without confirmation pauses.
