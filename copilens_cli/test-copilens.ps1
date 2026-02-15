# Copilens Test Script for Windows
# Run this in PowerShell to test all functionality

Write-Host "`n=== COPILENS TEST SUITE ===" -ForegroundColor Cyan
Write-Host "Testing all commands and features`n" -ForegroundColor White

$ErrorCount = 0
$SuccessCount = 0

function Test-Command {
    param(
        [string]$Name,
        [scriptblock]$Command
    )
    
    Write-Host "Testing: $Name..." -ForegroundColor Yellow -NoNewline
    try {
        & $Command
        Write-Host " ✓" -ForegroundColor Green
        $script:SuccessCount++
    } catch {
        Write-Host " ✗" -ForegroundColor Red
        Write-Host "  Error: $_" -ForegroundColor Red
        $script:ErrorCount++
    }
}

# Test 1: Python installation
Test-Command "Python" {
    $ver = python --version 2>&1
    if ($ver -notmatch "Python 3") { throw "Python 3 required" }
}

# Test 2: Copilens installation
Test-Command "Copilens installed" {
    $result = pip show copilens 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Copilens not installed" }
}

# Test 3: Dependencies
Test-Command "Dependencies (pyyaml)" {
    python -c "import yaml" 2>&1
    if ($LASTEXITCODE -ne 0) { throw "pyyaml not installed" }
}

Test-Command "Dependencies (toml)" {
    python -c "import toml" 2>&1
    if ($LASTEXITCODE -ne 0) { throw "toml not installed" }
}

Test-Command "Dependencies (requests)" {
    python -c "import requests" 2>&1
    if ($LASTEXITCODE -ne 0) { throw "requests not installed" }
}

# Test 4: Copilens imports
Test-Command "Copilens imports" {
    python -c "from copilens.analyzers.repo_analyzer import RepositoryAnalyzer" 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Import failed" }
}

Test-Command "Architecture detector" {
    python -c "from copilens.analyzers.architecture_detector import ArchitectureDetector; d = ArchitectureDetector('.'); arch = d.detect(); print(arch.project_type.value)" 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Architecture detection failed" }
}

# Test 5: API Key
Write-Host "`nAPI Key Check:" -ForegroundColor Cyan
if ($env:GEMINI_API_KEY) {
    Write-Host "  ✓ GEMINI_API_KEY is set" -ForegroundColor Green
    $SuccessCount++
} else {
    Write-Host "  ✗ GEMINI_API_KEY is NOT set" -ForegroundColor Yellow
    Write-Host "    Set with: `$env:GEMINI_API_KEY='your-key'" -ForegroundColor White
    Write-Host "    Get key: https://makersuite.google.com/app/apikey" -ForegroundColor White
}

# Test 6: Command availability
Write-Host "`nCommand Tests:" -ForegroundColor Cyan

Test-Command "Stats (no-llm mode)" {
    python -c "from copilens.commands.stats import _show_full_repo_stats; from pathlib import Path; import sys; sys.stdout = open('nul', 'w'); _show_full_repo_stats(Path('.'), use_llm=False)" 2>&1
}

Test-Command "Architecture detection" {
    python -c "from copilens.analyzers.architecture_detector import ArchitectureDetector; d = ArchitectureDetector('.'); arch = d.detect(); print('OK')" 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Failed" }
}

Test-Command "Simple deployer" {
    python -c "from copilens.deployment.platforms.simple import SimpleDeployer; d = SimpleDeployer(); print('Available:', d.is_available())" 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Simple deployer failed" }
}

# Test 7: LLM availability
Write-Host "`nLLM Provider Test:" -ForegroundColor Cyan
if ($env:GEMINI_API_KEY) {
    Test-Command "LLM provider" {
        python -c "from copilens.agentic.llm_provider import get_llm; llm = get_llm(); print('Available:', llm.is_available(), 'Providers:', llm.list_available_providers())" 2>&1
    }
} else {
    Write-Host "  ⊘ Skipped (no API key)" -ForegroundColor Yellow
}

# Test 8: Deployment platforms
Write-Host "`nDeployment Platforms:" -ForegroundColor Cyan

Test-Command "Simple deployer registration" {
    python -c "from copilens.deployment.manager import DeploymentManager; m = DeploymentManager('.'); print('Platforms:', len(m.platforms))" 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Failed" }
}

# Summary
Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Cyan
Write-Host "Passed: $SuccessCount" -ForegroundColor Green
Write-Host "Failed: $ErrorCount" -ForegroundColor $(if ($ErrorCount -gt 0) { "Red" } else { "Green" })

if ($ErrorCount -eq 0) {
    Write-Host "`n✓ All tests passed! Copilens is ready to use." -ForegroundColor Green
} else {
    Write-Host "`n⚠ Some tests failed. See errors above." -ForegroundColor Yellow
}

# Quick start instructions
Write-Host "`n=== QUICK START ===" -ForegroundColor Cyan
Write-Host @"
1. Set API key (if not set):
   `$env:GEMINI_API_KEY="your-key"

2. Try commands:
   copilens stats --full --no-llm  # Works without API key
   copilens detect-arch             # Architecture detection
   copilens deploy --platform simple # Prepare for deployment

3. With API key:
   copilens stats --full --llm      # AI insights
   copilens generate "hello world"  # Code generation

4. Get free API key:
   https://makersuite.google.com/app/apikey
"@ -ForegroundColor White

Write-Host "`nFor help: copilens --help`n" -ForegroundColor Cyan
