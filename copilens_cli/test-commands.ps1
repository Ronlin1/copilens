#!/usr/bin/env pwsh
# Copilens Command Tester - Tests all commands with proper Windows support

$env:PYTHONIOENCODING='utf-8'

Write-Host "`n════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   COPILENS COMMAND TESTER" -ForegroundColor Cyan  
Write-Host "════════════════════════════════════════════`n" -ForegroundColor Cyan

$TotalTests = 0
$PassedTests = 0
$FailedTests = 0
$SkippedTests = 0

function Test-CopilensCommand {
    param(
        [string]$Name,
        [string[]]$Args,
        [bool]$RequiresAPIKey = $false,
        [bool]$RequiresGit = $false
    )
    
    $script:TotalTests++
    
    # Check prerequisites
    if ($RequiresAPIKey -and -not $env:GEMINI_API_KEY) {
        Write-Host "  ⊘ $Name" -ForegroundColor DarkGray -NoNewline
        Write-Host " (skipped - no API key)" -ForegroundColor DarkGray
        $script:SkippedTests++
        return
    }
    
    if ($RequiresGit) {
        $isGit = Test-Path ".git"
        if (-not $isGit) {
            Write-Host "  ⊘ $Name" -ForegroundColor DarkGray -NoNewline
            Write-Host " (skipped - not a git repo)" -ForegroundColor DarkGray
            $script:SkippedTests++
            return
        }
    }
    
    Write-Host "  Testing: $Name..." -ForegroundColor Yellow -NoNewline
    
    try {
        $output = & python -m copilens.cli $Args 2>&1
        $exitCode = $LASTEXITCODE
        
        if ($exitCode -eq 0 -or $exitCode -eq $null) {
            Write-Host " ✓" -ForegroundColor Green
            $script:PassedTests++
        } else {
            Write-Host " ✗ (exit code: $exitCode)" -ForegroundColor Red
            if ($output -match "Error|Exception") {
                Write-Host "    $($output | Select-Object -First 2)" -ForegroundColor DarkRed
            }
            $script:FailedTests++
        }
    }
    catch {
        Write-Host " ✗ (exception)" -ForegroundColor Red
        Write-Host "    $_" -ForegroundColor DarkRed
        $script:FailedTests++
    }
}

# Basic Commands (No dependencies)
Write-Host "Basic Commands (No API key needed):" -ForegroundColor Cyan
Test-CopilensCommand "Help" @("--help")
Test-CopilensCommand "Architecture Detection" @("detect-arch")
Test-CopilensCommand "Stats (no LLM)" @("stats", "--full", "--no-llm")
Test-CopilensCommand "Deployment Status" @("deploy", "status")

# Git-based Commands
Write-Host "`nGit-based Commands:" -ForegroundColor Cyan
Test-CopilensCommand "Init" @("init") -RequiresGit $false
Test-CopilensCommand "Diff Analysis" @("diff") -RequiresGit $true
Test-CopilensCommand "Risk Analysis" @("risk") -RequiresGit $true
Test-CopilensCommand "Trend Analysis" @("trend") -RequiresGit $true

# Deployment Commands
Write-Host "`nDeployment Commands:" -ForegroundColor Cyan
Test-CopilensCommand "Deploy (dry-run)" @("deploy", "deploy", "--platform", "simple")

# API Key-dependent Commands
Write-Host "`nAI-Powered Commands (Require API key):" -ForegroundColor Cyan
Test-CopilensCommand "Stats with LLM" @("stats", "--full", "--llm") -RequiresAPIKey $true
Test-CopilensCommand "Code Generation" @("generate", "generate", "test") -RequiresAPIKey $true
Test-CopilensCommand "Explain" @("explain") -RequiresAPIKey $true -RequiresGit $true
Test-CopilensCommand "Chat" @("chat") -RequiresAPIKey $true

# Agent Commands
Write-Host "`nAgent Commands:" -ForegroundColor Cyan
Test-CopilensCommand "Agent Status" @("agent-status")
Test-CopilensCommand "Agent Memory" @("agent-memory")

# Summary
Write-Host "`n════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   TEST RESULTS" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "Total:   $TotalTests" -ForegroundColor White
Write-Host "Passed:  $PassedTests" -ForegroundColor Green
Write-Host "Failed:  $FailedTests" -ForegroundColor $(if ($FailedTests -gt 0) {"Red"} else {"Green"})
Write-Host "Skipped: $SkippedTests" -ForegroundColor DarkGray

$PassRate = if ($TotalTests -gt 0) { [math]::Round(($PassedTests / $TotalTests) * 100, 1) } else { 0 }
Write-Host "`nPass Rate: $PassRate%" -ForegroundColor $(if ($PassRate -gt 80) {"Green"} elseif ($PassRate -gt 50) {"Yellow"} else {"Red"})

# Recommendations
Write-Host "`n════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   RECOMMENDATIONS" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════`n" -ForegroundColor Cyan

if (-not $env:GEMINI_API_KEY) {
    Write-Host "💡 Set GEMINI_API_KEY to unlock AI features:" -ForegroundColor Yellow
    Write-Host "   `$env:GEMINI_API_KEY='your-key'" -ForegroundColor White
    Write-Host "   Get key: https://makersuite.google.com/app/apikey`n" -ForegroundColor Cyan
}

if (-not (Test-Path ".git")) {
    Write-Host "💡 Initialize git to unlock git-based features:" -ForegroundColor Yellow
    Write-Host "   git init`n" -ForegroundColor White
}

if ($FailedTests -eq 0 -and $PassedTests -gt 0) {
    Write-Host "✅ All tests passed! Copilens is working perfectly." -ForegroundColor Green
} elseif ($PassedTests -gt 0) {
    Write-Host "⚠️  Some tests failed. Check errors above." -ForegroundColor Yellow
} else {
    Write-Host "❌ No tests passed. Check installation." -ForegroundColor Red
}

Write-Host "`nFor detailed usage: See WINDOWS_GUIDE.md`n" -ForegroundColor Cyan
