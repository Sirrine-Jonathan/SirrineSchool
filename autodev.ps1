$ErrorActionPreference = "Stop"

Write-Host "=======================================================" -ForegroundColor Green
Write-Host "   Starting Sirrine School App Factory Auto-Dev Loop   " -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green

# Infinite loop to keep the factory running around the clock
while ($true) {
    $startTime = Get-Date
    Write-Host "`n>>> Starting a new development cycle at $startTime <<<" -ForegroundColor Cyan
    
    try {
        # We invoke the Gemini CLI with --yolo so it runs autonomously without asking for permission.
        # The prompt explicitly outlines the App Factory flow: Pick an idea, build it, test it, and deploy it.
        gemini "App Factory workflow:`n1. Pick one un-implemented idea from IDEAS.md.`n2. Implement it as a new game/feature using the architecture described in APP_FACTORY_ARCHITECTURE.md.`n3. Write Playwright E2E tests in tests/e2e/ to cover the new feature.`n4. Run 'npm run build' and 'npx playwright test'. Iteratively fix any errors until tests pass.`n5. Once fully passing, mark the idea as done, commit the changes, and run 'git push origin main' and 'git push heroku main'." --yolo
    } catch {
        Write-Host "An error occurred during the Gemini cycle: $_" -ForegroundColor Red
    }

    # Wait 4 hours before starting the next cycle. 
    # This prevents rate limit exhaustion and allows the application to evolve steadily.
    $sleepSeconds = 14400
    Write-Host "`n--- Cycle complete. Sleeping for $($sleepSeconds / 3600) hours before the next shift... ---" -ForegroundColor Yellow
    Start-Sleep -Seconds $sleepSeconds
}
