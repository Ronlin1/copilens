#!/usr/bin/env pwsh
# Comprehensive Command Test for Copilens

$env:PYTHONIOENCODING='utf-8'

Write-Host "`n════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   COPILENS COMMAND TEST SUITE" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════`n" -ForegroundColor Cyan

$TotalTests = 0
$PassedTests = 0
$FailedTests = 0

function Test-Command {
    param(
        [string]$Name,
        [string[]]$Args,
        [bool]$ShouldSucceed = $true
    )
    
    $script:TotalTests++
    Write-Host "Testing: $Name..." -ForegroundColor Yellow -NoNewline
    
    try {
        $output = & python -m copilens.cli $Args 2>&1
        $exitCode = $LASTEXITCODE
        
        if (($exitCode -eq 0 -or $exitCode -eq $null) -eq $ShouldSucceed) {
            Write-Host " ✓" -ForegroundColor Green
            $script:PassedTests++
            return $true
        } else {
            Write-Host " ✗" -ForegroundColor Red
            Write-Host "  Exit code: $exitCode" -ForegroundColor DarkRed
            $script:FailedTests++
            return $false
        }
    }
    catch {
        Write-Host " ✗ (exception)" -ForegroundColor Red
        Write-Host "  $_" -ForegroundColor DarkRed
        $script:FailedTests++
        return $false
    }
}

# Test main commands
Write-Host "Main Commands:" -ForegroundColor Cyan
Test-Command "Main help" @("--help")
Test-Command "Welcome screen (no args)" @()

# Test config commands
Write-Host "`nConfig Commands:" -ForegroundColor Cyan
Test-Command "config (no subcommand)" @("config")
Test-Command "config --help" @("config", "--help")
Test-Command "config show" @("config", "show")
Test-Command "config get-key" @("config", "get-key")

# Test chat commands
Write-Host "`nChat Commands:" -ForegroundColor Cyan
Test-Command "chat-ai (no subcommand)" @("chat-ai")
Test-Command "chat-ai --help" @("chat-ai", "--help")

# Test remote commands
Write-Host "`nRemote Analysis Commands:" -ForegroundColor Cyan
Test-Command "remote (no subcommand)" @("remote")
Test-Command "remote --help" @("remote", "--help")

# Test generate commands
Write-Host "`nGenerate Commands:" -ForegroundColor Cyan
Test-Command "generate --help" @("generate", "--help")

# Test deploy commands
Write-Host "`nDeploy Commands:" -ForegroundColor Cyan
Test-Command "deploy --help" @("deploy", "--help")
Test-Command "detect-arch" @("detect-arch")

# Test monitor commands
Write-Host "`nMonitor Commands:" -ForegroundColor Cyan
Test-Command "monitor --help" @("monitor", "--help")

# Test core analysis commands
Write-Host "`nCore Analysis Commands:" -ForegroundColor Cyan
Test-Command "stats --help" @("stats", "--help")
Test-Command "diff --help" @("diff", "--help")
Test-Command "risk --help" @("risk", "--help")

# Test agent commands
Write-Host "`nAgent Commands:" -ForegroundColor Cyan
Test-Command "agent --help" @("agent", "--help")
Test-Command "agent-status" @("agent-status")

# Summary
Write-Host "`n════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   TEST RESULTS" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "Total:  $TotalTests" -ForegroundColor White
Write-Host "Passed: $PassedTests" -ForegroundColor Green
Write-Host "Failed: $FailedTests" -ForegroundColor $(if ($FailedTests -gt 0) {"Red"} else {"Green"})

$PassRate = if ($TotalTests -gt 0) { [math]::Round(($PassedTests / $TotalTests) * 100, 1) } else { 0 }
Write-Host "`nPass Rate: $PassRate%" -ForegroundColor $(if ($PassRate -eq 100) {"Green"} elseif ($PassRate -gt 80) {"Yellow"} else {"Red"})

if ($PassedTests -eq $TotalTests) {
    Write-Host "`n✅ All tests passed! Copilens is working perfectly." -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Some tests failed. Check errors above." -ForegroundColor Yellow
}

# Show command examples
Write-Host "`n════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   QUICK START EXAMPLES" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "[bold]Setup (First Time):[/bold]" -ForegroundColor Yellow
Write-Host "  copilens config setup`n"

Write-Host "[bold]Interactive Chat:[/bold]" -ForegroundColor Yellow
Write-Host "  copilens chat-ai interactive`n"

Write-Host "[bold]Analyze Remote Repo:[/bold]" -ForegroundColor Yellow
Write-Host "  copilens remote quick https://github.com/user/repo`n"

Write-Host "[bold]Analyze Local Repo:[/bold]" -ForegroundColor Yellow
Write-Host "  copilens stats --full --no-llm`n"

Write-Host "[bold]Deploy:[/bold]" -ForegroundColor Yellow
Write-Host "  copilens deploy deploy --platform simple --auto`n"

Write-Host "For more: copilens --help`n" -ForegroundColor Cyan
