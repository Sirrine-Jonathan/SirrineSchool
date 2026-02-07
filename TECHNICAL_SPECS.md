# Sirrine School - Technical Specifications

## 1. Project Overview
"Sirrine School" is an offline-capable educational gaming platform designed for Grace (7) and Charlie (4). The application will be a **Progressive Web App (PWA)**, allowing it to be installed on mobile devices and run completely offline after the initial load. It utilizes local storage for progress tracking, requiring no external database.

## 2. Tech Stack

*   **Framework:** **React** (TypeScript) + **Vite**.
    *   *PWA Support:* Vite PWA plugin (configured for offline-first caching).
*   **Styling:** **Styled Components**.
    *   *Why:* Component-based styling, dynamic theming support.
*   **Game Engine/Graphics:** **Framer Motion** (for UI/Transitions) + **React Canvas** or simple **DOM manipulation**.
    *   *Decision:* We will focus on **2D games** using standard web technologies (HTML5 Canvas or SVG/DOM). This simplifies asset generation (PNGs over GLBs) and performance on mobile.
*   **State Management:** **React Context** + **LocalStorage**.
*   **Routing:** **React Router**.
*   **Audio/Haptics:** Web Audio API for simple beeps/boops; `navigator.vibrate()` for haptic feedback on mobile.

## 3. Architecture & Deployment (Local-First)

### How to Play on Mobile (Without Hosting)
1.  **Development Mode:** You run the app on your PC (e.g., `npm run host`).
2.  **Local Network Access:** Your PC and Phone must be on the same Wi-Fi. You access the app on your phone via your PC's IP address.
3.  **Install:** Once loaded on the phone, you tap "Add to Home Screen".
4.  **Offline:** Because of the PWA service worker, the app will work even if you turn off the server on your PC (until you need an update).

## 4. User Profiles & Themes

*   **Grace (7)**
    *   *Themes:* Princesses, Space.
    *   *Visual Style:* Sparkles, deep blues/purples (Space), elegant fonts.
*   **Charlie (4)**
    *   *Themes:* Monster Trucks, Skateboarding.
    *   *Visual Style:* Gritty textures (dirt/concrete), bold fonts, high contrast.

## 5. Curriculum & Game Concepts (2D Focus)

### A. Math (4 - 10 years)
*   **Level 1 (Charlie): "Monster Truck Count"**
    *   *Gameplay:* Side-scrolling 2D view. Truck drives on a jagged line.
    *   *Challenge:* "How many rocks?" (Visual counting). Select the number to smash them.
*   **Level 2 (Grace): "Space Mission Supplies"**
    *   *Gameplay:* 2D Inventory Management / Grid view.
    *   *Challenge:* "Load 4 crates of 5 fuel cells." (Multiplication visuals). Drag and drop mechanics.

### B. Reading & Letters (Charlie focus)
*   **"Skateboard Sound Match"**
    *   *Gameplay:* Top-down or Side view 2D skater.
    *   *Challenge:* Obstacles have letters. Tap the "B" obstacle when you hear "Buh" to grind the rail.

### C. Typing (Grace focus, Charlie accessible)
*   **"Astro Typer" / "Keyboard Race"**
    *   *Gameplay:* 2D Cockpit overlay. Meteors (PNG sprites) fall from top to bottom.
    *   *Settings:* `showHint` (boolean), `hintDelay` (ms).
    *   *Mechanic:* Type the letter on the meteor to zap it. Visual keyboard at bottom highlights keys if hint is on.

## 6. Asset Management
*   **Strategy:** 2D Sprites (PNG/SVG).
*   **Asset Requests:** Create a folder `src/assets/requests/`. Inside, place markdown files (e.g., `monster_truck_sprite.md`) containing the prompt.
    *   *Note:* Request PNGs with transparent backgrounds.

## 7. Data Model (LocalStorage)
```json
{
  "currentUser": "grace",
  "settings": {
    "masterVolume": 0.8,
    "typingHintEnabled": true,
    "typingHintDelay": 3000
  },
  "users": {
    "grace": {
      "theme": "space_princess",
      "xp": 1200,
      "inventory": ["rocket_booster_v1", "tiara_decal"],
      "stats": { "math_correct": 45, "typing_wpm": 12 }
    },
    "charlie": {
      "theme": "monster_skate",
      "xp": 800,
      "inventory": ["mud_tires", "flame_sticker"],
      "stats": { "letters_identified": 20 }
    }
  }
}
```