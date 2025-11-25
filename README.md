# AindroCode

> Fully local PWA Mobile IDE with 50+ language support and AI assistance

AindroCode is a modern, browser-based code editor and execution environment that runs entirely offline. Write, run, and debug code in 50+ programming languages using WebAssembly and in-browser interpreters, with optional AI-powered assistance.

## Features

### 🚀 Core Capabilities

- **50+ Languages Supported**: Python (Pyodide), JavaScript, TypeScript, C/C++ (WASM), Go (TinyGo), Rust, Ruby, PHP, Lua, SQL (DuckDB), Bash-like shell, and 40+ more
- **Monaco Editor**: Professional code editing with syntax highlighting, minimap, and IntelliSense
- **Integrated Terminal**: xterm.js-powered terminal with persistent session history
- **AI Super-Agent**: Full filesystem access with orchestrated execution (Plan → Ask → Execute → Verify)
- **Offline-First**: All code execution happens locally in your browser
- **Progressive Web App**: Installable on Android, iOS, and Desktop

### 💾 Robust State Persistence

- **No Data Loss**: Automatic state recovery across refresh/back/close
- **Atomic Snapshots**: Versioned autosave with write-ahead logging
- **IndexedDB + OPFS**: Dual storage strategy for maximum reliability
- **Session Restoration**: Restore open tabs, terminal sessions, and AI chat history
- **Explicit Snapshots**: Manual "Save" and "Restore Last Snapshot" controls

### 🤖 AI Features

- **Chat Mode**: Code generation, debugging, and explanations
- **Agent Mode**: Full project orchestration with file creation/modification/deletion
- **Diff Viewer**: Review all proposed changes before approval
- **User-Controlled**: Powered by your own OpenAI API key (stored securely)

### 🎨 Modern UI/UX

- **Light/Dark Theme**: Automatic system theme detection
- **Mobile-First Design**: Optimized for touch interfaces
- **Resizable Panels**: Customize your workspace layout
- **File Tree**: Nested folder support with drag-and-drop (planned)
- **Empty States**: Beautiful placeholders with helpful hints

## Browser Limitations

AindroCode runs entirely in the browser, which enables offline functionality but comes with some constraints:

### ✓ Fully Supported
- Pure code execution (Python, JavaScript, TypeScript, C++, Go, Rust, etc.)
- Small standard library usage
- Basic file operations (in-browser filesystem)
- Local AI inference (with API key)

### ⚠ Limited Support
- **Package installations**: Limited to browser-compatible libraries
- **npm packages**: CDN/ESM-based only (no full `node_modules`)
- **pip packages**: Pyodide-supported wheels via `micropip` only
- **Network requests**: CORS restrictions apply

### ✗ Not Supported in Browser
- Full frameworks requiring dev servers (React, Flask, Django, Laravel, Spring Boot)
- Native binaries and system calls
- Docker containers
- Database servers (except in-browser SQL engines like DuckDB)

> **Note**: These limitations exist because AindroCode runs entirely in the browser without a real OS. The future native APK will remove most of these restrictions.

## Future: Native Android APK

### Coming Soon: Full Linux Environment

We're planning a native Android APK release that embeds a minimal Linux userspace (PRoot-style runtime), which will remove many current browser limitations:

#### What Will Change in the APK

1. **Full Compilers & Interpreters**
   - Native GCC, Clang, Python, Node.js, Go, Rust toolchains
   - No WebAssembly constraints or performance overhead

2. **Package Managers**
   - `apt` for system packages
   - `pip` with full PyPI access
   - `npm` with complete `node_modules` support
   - `cargo`, `go get`, `gem install`, etc.

3. **LSP Servers**
   - Full language server protocol support
   - Real-time code intelligence and diagnostics
   - Refactoring tools and symbol navigation

4. **Persistent Filesystem**
   - True file I/O with native permissions
   - Process spawn and background tasks
   - Shell script execution with full POSIX compliance

5. **Network Freedom**
   - No CORS restrictions
   - Full socket support
   - Run web servers and APIs

#### Migration from PWA to APK

Your work won't be lost when the native APK launches:

- **Export/Import**: Export projects as ZIP from PWA, import into APK
- **Automatic Migration**: Future versions may support direct data transfer
- **Compatible Schema**: Both versions share the same project structure

### When Will the APK Launch?

The native APK is currently in planning stages. We'll announce:
- Beta testing program
- Expected release timeline
- Feature compatibility matrix

Follow our releases for updates!

## Installation

### As PWA (Current)

1. Visit AindroCode in a modern browser (Chrome, Edge, Safari)
2. Click the "Install" prompt or menu option
3. Launch from your home screen like a native app

### System Requirements

- Modern browser with WebAssembly support
- Chrome 90+, Safari 14+, Firefox 88+, or Edge 90+
- Recommended: 4GB+ RAM for running large programs
- Storage: Uses browser storage quota (typically 10GB+)

## Usage

### Creating a Project

1. Click "Create Your First Project" on the home screen
2. Enter a project name and optional description
3. Start coding!

### Running Code

1. Open or create a file with proper extension (`.py`, `.js`, `.cpp`, etc.)
2. Write your code in the Monaco editor
3. Click "Run" to execute in the integrated terminal
4. View output, errors, and execution logs

### Using AI Features

1. Go to **Settings** and add your OpenAI API key
2. Navigate to the **AI** page
3. Choose **Chat Mode** for Q&A or **Agent Mode** for project orchestration
4. Review and approve AI-proposed changes before execution

### Keyboard Shortcuts

- `Ctrl/Cmd + S`: Save current file
- `Ctrl/Cmd + R`: Run current file
- `Ctrl/Cmd + /`: Toggle comment
- `Ctrl/Cmd + F`: Find in file
- `F11`: Toggle fullscreen

## Supported Languages

### Tier 1: Full Browser Support
Python, JavaScript, TypeScript, Lua, SQL (DuckDB), WebAssembly Text Format

### Tier 2: WASM Runtime
C, C++, Rust (limited), Go (TinyGo), Ruby, PHP, Bash-like shell

### Tier 3: Interpreter-based
Scheme, Lisp, Pascal, Fortran, OCaml, Fennel, Zig (WASM interpreter), Brainfuck, Whitespace

See **Settings → Limitations** for detailed compatibility information.

## Architecture

```
Aindrocode/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Home, Editor, AI, Settings
│   │   ├── lib/           # Theme, utilities
│   │   └── App.tsx        # Main app with routing
│   └── public/
│       └── manifest.json  # PWA manifest
├── server/                 # Express backend (dev only)
├── shared/
│   └── schema.ts          # TypeScript schemas
└── README.md              # This file
```

## Development

### Prerequisites
- Node.js 18+ and npm

### Setup
```bash
npm install
npm run dev
```

Visit `http://localhost:5000`

### Build for Production
```bash
npm run build
```

## Data Privacy

- **100% Local**: All code execution happens in your browser
- **No Telemetry**: We don't collect usage data or analytics
- **API Keys**: Your OpenAI API key is stored locally via IndexedDB
- **Offline**: Works completely offline (except AI features which require internet)

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Editor**: Monaco Editor (VSCode engine)
- **Terminal**: xterm.js
- **Execution**: Pyodide, WASM runtimes, native JS
- **Storage**: IndexedDB (idb), OPFS where available
- **AI**: OpenAI API (client-side)
- **PWA**: Workbox service worker

## Roadmap

### v1.0 (Current - PWA)
- [x] 50+ language support via WASM/interpreters
- [x] Monaco editor with syntax highlighting
- [x] Integrated terminal with xterm.js
- [x] AI chat and agent modes
- [x] PWA with offline support
- [x] State persistence and recovery

### v1.1 (Planned)
- [ ] Neovim WASM mode with .lua runner
- [ ] File tree drag-and-drop
- [ ] Multi-cursor editing
- [ ] Git integration (in-browser)
- [ ] Collaborative editing (WebRTC)

### v2.0 (Native APK)
- [ ] Full Linux userspace (PRoot-style)
- [ ] Native compilers and interpreters
- [ ] Package managers (apt, pip, npm)
- [ ] LSP server support
- [ ] Persistent filesystem
- [ ] Migration tool from PWA

## Contributing

AindroCode is in active development. Contributions, bug reports, and feature requests are welcome!

## License

MIT License - See LICENSE file for details

## Acknowledgments

- **Monaco Editor** - VSCode's editor engine
- **Pyodide** - Python for the browser
- **xterm.js** - Terminal emulation
- **shadcn/ui** - Beautiful component library
- **OpenAI** - AI-powered assistance

---

**Built with ❤️ for developers who code anywhere, anytime**
