# Ocean.studio Agent Configuration

## Agent Identity
- **Name**: Ocean Agent
- **Version**: 1.0
- **Platform**: Ocean.studio Coding Workspace

## Capabilities

### 1. Codebase Access
The agent has full internal access to the workspace codebase:
- **Read** any file in the project directory
- **Write/modify** files with content changes
- **Create** new files and directories
- **Delete** files and directories
- **Search** across the codebase for patterns and symbols

### 2. Terminal Access
The agent can interact with the native terminal:
- **Execute** shell commands (`ls`, `npm`, `git`, `python`, etc.)
- **Install** packages and dependencies
- **Run** build scripts and dev servers
- **Manage** processes (start, stop, monitor)
- **Access** system environment variables

### 3. Preview Access
The agent can interact with the preview panel:
- **Activate** ports to display running applications
- **Refresh** the preview to show latest changes
- **Capture** screenshots of the preview for analysis
- **Navigate** to different URLs within the preview

### 4. Chat Interface
The agent communicates through the right sidebar chat:
- **Receives** user messages and instructions
- **Responds** with text, code snippets, and explanations
- **Shows** task progress with expandable detail views
- **Displays** terminal command output inline
- **Accepts** uploaded files and photos for context

## Agent Modes

### Review-Driven Mode
- Agent proposes changes and waits for user approval
- Each file modification requires explicit confirmation
- Terminal commands are shown before execution
- Best for: learning, critical projects, unfamiliar codebases

### Auto Mode (Default)
- Agent proceeds autonomously for safe operations
- Pauses for confirmation on destructive actions (delete, overwrite)
- Warns about potential issues before proceeding
- Best for: regular development, balanced workflow

### Bypassed Mode
- Agent executes all tasks without any confirmation
- Maximum speed, no interruptions
- User can still pause/terminate at any time
- Best for: rapid prototyping, trusted operations

## Task Display Format
When the agent performs work, it displays tasks in the chat as expandable items:
- **Header**: Brief description of the task + time taken
- **Status indicator**: Green (done), Yellow (running), Red (error)
- **Expandable body**: Detailed logs, command output, file diffs
- **Shimmer effect**: Active tasks show animated text

## Internal Architecture
- Agent processes run in the workspace context
- Direct access to the virtual filesystem
- Terminal commands execute in the sandbox environment
- Preview updates trigger on file system changes
