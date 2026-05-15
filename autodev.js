import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.join(__dirname, 'autodev.config.json');
const LOGS_DIR = path.join(__dirname, 'logs');
const DEFAULT_INTERVAL = 3600;

if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR);
}

console.log("\x1b[32m=======================================================\x1b[0m");
console.log("\x1b[32m   Starting Sirrine School App Factory Auto-Dev Loop   \x1b[0m");
console.log("\x1b[32m=======================================================\x1b[0m");

async function runLoop() {
  while (true) {
    const loopStartTime = new Date();
    let intervalSeconds = DEFAULT_INTERVAL;

    if (fs.existsSync(CONFIG_PATH)) {
      try {
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        if (config.intervalSeconds) {
          intervalSeconds = config.intervalSeconds;
        }
      } catch (err) {
        console.warn("\x1b[33mWarning: Could not parse autodev.config.json. Using default interval.\x1b[0m");
      }
    }

    const timestamp = loopStartTime.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    console.log(`\n\x1b[36m>>> Triggering a new development cycle at ${loopStartTime.toLocaleString()} <<<\x1b[0m`);
    console.log(`\x1b[90mTarget interval: ${intervalSeconds} seconds\x1b[0m`);

    try {
      const prompt = `
App Factory workflow (Autonomous & Non-Blocking):
1. PREPARATION: Run 'git pull origin main' to get the latest status.
2. SELECTION: Pick one un-implemented idea from IDEAS.md (not marked [x], [IN_PROGRESS], or [BLOCKED]).
3. LOCKING: Update IDEAS.md to mark that idea as [IN_PROGRESS], then IMMEDIATELY commit and push this change to 'origin main'.
4. IMPLEMENTATION: Implement the feature using the architecture in APP_FACTORY_ARCHITECTURE.md.
5. TESTING: Write and run Playwright E2E tests. Fix errors until they pass.
6. HANDLING BLOCKERS: If you are stuck, need clarification, or have a question:
   - Write your question/blocker clearly in questions.md.
   - Mark the idea as [BLOCKED] in IDEAS.md.
   - Commit and push IDEAS.md and questions.md, then EXIT. DO NOT ask the user a question interactively.
7. FINALIZATION: Once fully passing, mark the idea as [x] in IDEAS.md.
8. DEPLOYMENT: Commit all changes, and push to 'origin main' and 'heroku main'.
`;

      const relativePromptFile = path.join('logs', `prompt-${timestamp}.txt`);
      const fullPromptFile = path.join(__dirname, relativePromptFile);
      fs.writeFileSync(fullPromptFile, prompt);

      const worktreeName = `autodev-${timestamp}`;
      console.log(`\x1b[36mLaunching background session in worktree: ${worktreeName}\x1b[0m`);

      const errorLogFile = path.join(LOGS_DIR, `error-${timestamp}.log`);
      const errorStream = fs.createWriteStream(errorLogFile);

      // Spawn gemini in the background. 
      // We use the @filename syntax to pass the prompt from a file.
      // We use a relative path for @promptFile so Gemini can resolve it relative to its workspace root.
      // We disable shell: true to avoid escaping issues.
      // We add --skip-trust to ensure headless execution is not blocked by trust prompts.
      const geminiProcess = spawn('gemini', [
        '--prompt', `@${relativePromptFile}`,
        '--yolo',
        '--worktree', worktreeName,
        '--skip-trust'
      ], {
        detached: true,
        stdio: ['ignore', 'inherit', errorStream], // Pipe stderr to file
        shell: false
      });

      geminiProcess.on('exit', (code) => {
        errorStream.end();
        console.log(`\n\x1b[32m>>> [${worktreeName}] Task completed with code ${code} <<<\x1b[0m`);
        if (code !== 0) {
          console.log(`\x1b[31m!!! [${worktreeName}] Check ${errorLogFile} for error details !!!\x1b[0m`);
        }
      });

      geminiProcess.unref();

    } catch (err) {
      console.error(`\x1b[31mAn error occurred while launching the Gemini cycle: ${err.message}\x1b[0m`);
    }

    let remaining = intervalSeconds;
    console.log(''); // New line before countdown
    while (remaining > 0) {
      process.stdout.write(`\r\x1b[33m--- Next trigger in: ${remaining}s (Active tasks are running in background) ---\x1b[0m`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      remaining--;
    }
    process.stdout.write('\r' + ' '.repeat(80) + '\r'); // Clear the line
  }
}

runLoop();
