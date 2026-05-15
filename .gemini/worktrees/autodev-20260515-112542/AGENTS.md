# Contributor's Guide (Agents & Developers)

Welcome to the Sirrine School project! This guide outlines the standard operating procedures for contributing to this codebase.

## 🚀 Development Workflow

### 1. Create a New Branch
Always work on a feature branch created from the latest version of `main`.
```powershell
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### 2. Implementation & Testing
- Follow the existing **Atomic Component** structure in `src/components`.
- Ensure all styles are **Condensed** (targeting 100vh/100dvh) to maintain a no-scroll UI.
- Verify mobile responsiveness for all changes.
- **New Games:** Place in `src/games/<category>/` and ensure they utilize `GameContainer.tsx`.
- Run a build to check for TypeScript errors before committing:
  ```powershell
  npm run build
  ```

### 3. Staging & Committing
Use descriptive, imperative commit messages.
```powershell
git add .
git commit -m "feat: add subtraction mode to Arithmetic Arena"
```

### 4. Push to Origin & Open Pull Request
If the `origin` remote does not exist (pointing to `Sirrine-Jonathan/SirrineSchool`), you must add it first.
```powershell
# If needed:
git remote add origin https://github.com/Sirrine-Jonathan/SirrineSchool.git

# Push changes:
git push -u origin feature/your-feature-name
```
**Opening PR:** Visit the GitHub repository to open a Pull Request against the `main` branch. Ensure the PR is reviewed and merged before proceeding to deployment.

### 5. Deployment (Heroku)
Deployment to Heroku should **only** happen from the `main` branch after your PR has been merged.
```powershell
git checkout main
git pull origin main
git push heroku main
```
- **App URL:** [https://sirrine-school-4c20b3093b37.herokuapp.com/](https://sirrine-school-4c20b3093b37.herokuapp.com/)

---

## 🛠 Tech Stack & Core Mandates

- **Framework:** React 18 (Vite)
- **Styling:** `styled-components` (Strictly **No Tailwind**)
- **Icons:** `lucide-react`
- **PWA:** `vite-plugin-pwa`. Assets are stored in `public/`.
- **UI Mandate:** **Zero Vertical Scrolling.** The application must fit within `100dvh`. Use flexbox/grid and relative scaling to ensure content is visible on all screen sizes.
- **Deployment:** Static hosting via `serve` on Heroku.

## 📂 Project Structure

- `/src/components`: Reusable UI elements (Dashboard, Keyboard, etc.)
- `/src/games`: Educational games categorized by subject.
- `/src/hooks`: Custom React hooks (e.g., `useUser` for state/XP).
- `/public`: PWA icons and manifest assets.
- `/src/styles`: Global styles and theme definitions.
