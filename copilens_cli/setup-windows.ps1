# Windows Setup Script for Copilens
# Run this script once to configure your environment

Write-Host "`n=== COPILENS WINDOWS SETUP ===" -ForegroundColor Cyan

# Step 1: Set Python UTF-8 encoding
Write-Host "`n1. Setting Python UTF-8 encoding..." -ForegroundColor Yellow
[System.Environment]::SetEnvironmentVariable('PYTHONIOENCODING', 'utf-8', 'User')
$env:PYTHONIOENCODING = 'utf-8'
Write-Host "   ✓ PYTHONIOENCODING=utf-8" -ForegroundColor Green

# Step 2: Check if Copilens is installed
Write-Host "`n2. Checking Copilens installation..." -ForegroundColor Yellow
$pipShow = pip show copilens 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Copilens is installed" -ForegroundColor Green
} else {
    Write-Host "   Installing Copilens..." -ForegroundColor Yellow
    Set-Location "$PSScriptRoot"
    pip install -e . 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Copilens installed successfully" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Installation failed" -ForegroundColor Red
        exit 1
    }
}

# Step 3: Install dependencies
Write-Host "`n3. Checking dependencies..." -ForegroundColor Yellow
$deps = @('pyyaml', 'toml', 'requests', 'google-generativeai', 'rich')
foreach ($dep in $deps) {
    python -c "import $(if ($dep -eq 'google-generativeai') {'google.generativeai'} elseif ($dep -eq 'pyyaml') {'yaml'} else {$dep})" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ $dep" -ForegroundColor Green
    } else {
        Write-Host "   Installing $dep..." -ForegroundColor Yellow
        pip install $dep 2>&1 | Out-Null
    }
}

# Step 4: API Key setup
Write-Host "`n4. API Key configuration..." -ForegroundColor Yellow
if ($env:GEMINI_API_KEY) {
    Write-Host "   ✓ GEMINI_API_KEY is set" -ForegroundColor Green
} else {
    Write-Host "   ! GEMINI_API_KEY not set" -ForegroundColor Yellow
    Write-Host "`n   To set it permanently:" -ForegroundColor White
    Write-Host "   [System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'your-key', 'User')" -ForegroundColor Cyan
    Write-Host "`n   Or for current session:" -ForegroundColor White
    Write-Host "   `$env:GEMINI_API_KEY='your-key'" -ForegroundColor Cyan
    Write-Host "`n   Get free key: https://makersuite.google.com/app/apikey" -ForegroundColor White
}

# Step 5: Test basic functionality
Write-Host "`n5. Testing basic functionality..." -ForegroundColor Yellow
$env:PYTHONIOENCODING = 'utf-8'
python -c "from copilens.analyzers.architecture_detector import ArchitectureDetector; d = ArchitectureDetector('.'); arch = d.detect(); print('Detected:', arch.project_type.value)" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Architecture detection works" -ForegroundColor Green
} else {
    Write-Host "   ✗ Test failed" -ForegroundColor Red
}

# Summary
Write-Host "`n=== SETUP COMPLETE ===" -ForegroundColor Cyan
Write-Host @"

Next steps:
1. Set your API key (if not done):
   `$env:GEMINI_API_KEY="your-key"
   
2. Try these commands:
   copilens                          # Welcome screen
   copilens stats --full --no-llm    # Repo analysis (no API needed)
   copilens detect-arch              # Detect project type
   copilens deploy --platform simple # Prepare for deployment

3. With API key:
   copilens stats --full --llm       # AI-powered insights
   copilens generate "hello world"   # Code generation

TIP: Add to your PowerShell profile for persistent settings:
  notepad `$PROFILE
  Add: `$env:PYTHONIOENCODING='utf-8'
       `$env:GEMINI_API_KEY='your-key-here'

"@ -ForegroundColor White

Write-Host "For help: copilens --help`n" -ForegroundColor Cyan
