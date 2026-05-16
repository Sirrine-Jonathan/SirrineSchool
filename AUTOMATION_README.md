#  Sirrine School & Project Automation: Full Documentation

This document provides a comprehensive overview of the architecture, setup, and workflows for both the local **Sirrine School "App Factory"** and the global **`~/~projects/Automation`** manager.

---

## 1. The Sirrine School App Factory

This is a lightweight, zero-dependency autonomous loop designed for rapid prototyping directly within the project.

### 1.1. Core Workflow
1.  **Selection & Locking:** Picks an idea from `IDEAS.md`, marks it as `[IN_PROGRESS]`, and pushes the lock to Git.
2.  **Implementation:** Codes the new game or feature.
3.  **Testing:** Runs Playwright tests and fixes errors.
4.  **Handling Blockers:** If stuck, it writes questions to `questions.md`, marks the idea as `[BLOCKED]`, and exits.
5.  **Deployment:** Commits and pushes the final code to `origin main` and `heroku main`.

### 1.2. How to Run
The loop runs in WSL for cross-platform compatibility.
```bash
# In a WSL terminal, from the SirrineSchool directory:
npm run autodev
```

### 1.3. Key Components
*   **`autodev.js`**: The Node.js script that manages the interval loop, launches background Gemini sessions, and displays the live countdown.
*   **`autodev.config.json`**: Controls the interval time in seconds.
*   **`logs/`**: Stores prompts and error logs for each cycle.
*   **`.gemini/worktrees/`**: Where isolated Git worktrees are created for each session to prevent file collisions.
*   **`IDEAS.md`**: The "backlog" for the factory.

---

## 2. The Global `~/~projects/Automation` Manager

This is a project-agnostic, multi-role "AI Software Team" designed to manage established repositories with a full PR/Review lifecycle.

### 2.1. Core Workflow
1.  **Manager Loop:** `manager.js` reads `manager-config.json` to get the list of active projects and their frequencies.
2.  **Role Rotation:** For each project, it picks a role from its `config.<name>.json` (e.g., `developer`, `reviewer`, `tester`).
3.  **Session Launch:** It launches a Gemini session in the project's directory, passing the role's prompt (`roles/developer.md`).
4.  **Observability:** Provides a unified terminal dashboard showing the status and countdown for all managed projects.

### 2.2. How to Run
```bash
# In a WSL terminal:
node /mnt/c/Users/jonat/~projects/Automation/manager.js
```

### 2.3. Key Components
*   **`manager.js`**: The central Node.js orchestrator.
*   **`manager-config.json`**: The master list of active projects and their schedules.
*   **`config.<name>.json`**: Project-specific details (repo URL, local path, active roles).
*   **`roles/*.md`**: The prompts that define the behavior for each role (e.g., the "factory" prompt for Sirrine School).

---

## 3. Environment Setup & Configuration

### 3.1. Windows Subsystem for Linux (WSL)
*   **Ubuntu:** The primary development environment.
*   **Windows Terminal Profile:** Configured to open Ubuntu by default in the project directory.

### 3.2. Node.js & Dependencies
*   **NVM:** Node Version Manager is used to manage Node.js versions within WSL.
*   **`npm install`:** Must be run within WSL to ensure native binaries (like `ripgrep`, `@rollup/rollup-linux-x64-gnu`) are correctly compiled for Linux.

### 3.3. Gemini CLI Configuration
*   **Authentication:** Uses a `GEMINI_API_KEY` set in `~/.bashrc` for headless execution.
*   **Trust:** Workspaces are automatically trusted via `--skip-trust` in scripts or by adding paths to `trustedWorkspaces` in `~/.gemini/settings.json`.
*   **Worktrees:** The `experimental.worktrees` feature is enabled in `~/.gemini/settings.json` for both Windows and WSL.

---

## 4. App Store Submission & Native Builds

The project is configured as a PWA and can be wrapped as a native Android APK for Fire Tablets using Capacitor.

### 4.1. Core Workflow
The process is automated via `npm` scripts:
1.  `npm run mobile:sync`: Builds the web assets and syncs them to the native Android project.
2.  `npm run mobile:version`: Automatically increments the `versionCode` and `versionName` in `android/app/build.gradle`.
3.  `npm run mobile:assets`: Generates all required icons and splash screens from `assets/logo.png`.

### 4.2. Manual Steps (One-time per Release)
1.  **Generate Signed Bundle:** Use Android Studio to create a signed `.aab` file (detailed instructions are in `SHIPPING.md`).
2.  **Upload:** Submit the `.aab` to the Amazon Appstore and/or Google Play Console.

### 4.3. Key Files
*   **`SHIPPING.md`**: Your step-by-step guide for the manual signing and submission process.
*   **`bump-version.js`**: The script that handles automated versioning.
*   **`public/privacy.html`**: A COPPA-compliant privacy policy, hosted with the app.

---

## 5. Game Mastery & Progression
*   **`useUser.tsx`**: Contains the core logic for tracking `masteredGames` in `localStorage`.
*   **`recordGameWin(gameId)`**: Function to be called from within a game when its win condition is met.
*   **`resetAllProgress()`**: Wipes all local data for a fresh start, accessible via the Settings modal.
*   **Dashboard & Badges:** The UI automatically displays "NEW", "Played", or "WON!" badges based on the `localStorage` state.
