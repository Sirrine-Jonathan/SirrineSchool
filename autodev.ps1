$ErrorActionPreference = "Stop"

Write-Host "=======================================================" -ForegroundColor Green
Write-Host "   Starting Sirrine School App Factory Auto-Dev Loop   " -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green

# Infinite loop to keep the factory running around the clock
while ($true) {
    $startTime = Get-Date
    Write-Host "`n>>> Starting a new development cycle at $startTime <<<" -ForegroundColor Cyan
    
    try {
        # We invoke the Gemini CLI with --yolo so it runs autonomously.
        # We append an explicit instruction to EXIT THE SESSION after deployment.
        $prompt = @"
App Factory workflow:
1. Pick one un-implemented idea from IDEAS.md.
2. Implement it as a new game/feature using the architecture described in APP_FACTORY_ARCHITECTURE.md.
3. Write Playwright E2E tests in tests/e2e/ to cover the new feature.
4. Run 'npm run build' and 'npx playwright test'. Iteratively fix any errors until tests pass.
5. Once fully passing, mark the idea as done, commit the changes, and run 'git push origin main' and 'git push heroku main'.
6. IMPORTANT: Once everything is pushed and confirmed, EXIT THIS SESSION IMMEDIATELY.
"@
        gemini $prompt --yolo
    } catch {
        Write-Host "An error occurred during the Gemini cycle: $_" -ForegroundColor Red
    }

    # Wait 1 hour (3600 seconds) before starting the next cycle. 
    $sleepSeconds = 3600
    Write-Host "`n--- Cycle complete. Sleeping for 1 hour before the next shift... ---" -ForegroundColor Yellow
    Start-Sleep -Seconds $sleepSeconds
}
