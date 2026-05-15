# Sirrine School - App Factory Architecture

This document outlines the "App Factory" workflow, leveraging agentic AI and multi-agent flow to continuously rapidly develop, test, and deploy features for the Sirrine School application.

## Core Philosophy: The Multi-Agent Pipeline

Instead of a single AI trying to hold all context and execute all tasks, the App Factory uses a pipeline of specialized agents coordinated by the Lead Orchestrator (Gemini CLI).

### 1. Strategy & Research Phase (The Orchestrator & Investigator)
- **Actor:** Lead Orchestrator (Gemini CLI) + `codebase_investigator` (Sub-agent)
- **Action:** When a new feature (from `IDEAS.md`) or bug is identified, the Orchestrator delegates a deep-dive investigation to the `codebase_investigator`.
- **Output:** A detailed architectural map of where changes need to occur and potential dependencies.

### 2. Implementation Phase (The Builder)
- **Actor:** Lead Orchestrator + `generalist` (Sub-agent)
- **Action:** For complex implementations (e.g., building a whole new game component), the Orchestrator delegates the raw coding task to the `generalist` agent, providing it with the precise requirements and target files identified in Phase 1.
- **Output:** Newly generated or refactored React components, styles, and game logic.

### 3. Verification Phase (The Automated QA)
- **Actor:** Playwright + Lead Orchestrator
- **Action:** 
  1. The Orchestrator writes or updates End-to-End (E2E) tests using **Playwright** to cover the new user journey.
  2. The test suite is executed (`npm run test`).
  3. **Agentic Healing:** If a test fails, the Orchestrator reads the Playwright error logs, identifies the DOM or logic failure, and immediately iterates on the code until the test turns green.

### 4. Deployment Phase (Continuous Delivery)
- **Actor:** Git + Heroku CLI
- **Action:** Once tests pass and the build succeeds, changes are committed and pushed to the `main` branch, automatically triggering a Heroku deployment.

---

## Setting up the Factory Floor

We already have a strong foundation:
- **Framework:** React + TypeScript + Vite
- **Testing:** Playwright is installed and configured (`playwright.config.ts`).
- **Deployment:** Heroku pipeline is active.

### Next Steps to Activate the Factory:

1. **Baseline Testing:** We must ensure the current E2E tests are robust. We need to update existing tests to reflect recent massive UI changes (e.g., removing user profiles, combining the dashboard, new game modes).
2. **Standardize Game Templates:** Create a boilerplate template/sub-agent prompt for generating new games from `IDEAS.md` to ensure they always use `GameContainer.tsx` and standard `useUser` hooks.
3. **Agentic Test Loop:** Establish a workflow where every new feature *must* have a corresponding Playwright test written *before* it is considered complete.
