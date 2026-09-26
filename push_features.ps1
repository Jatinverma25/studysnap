# push_features.ps1
# Automates staging, committing, and pushing after successful feature rounds
param (
    [string]$Message = "feat: periodic feature update and tests verified"
)

Write-Host ">>> Checking Git status..." -ForegroundColor Cyan
git status --short

Write-Host "`n>>> Staging changes (respecting .gitignore)..." -ForegroundColor Cyan
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "No changes detected. Working tree clean." -ForegroundColor Yellow
} else {
    Write-Host "`n>>> Committing changes: '$Message'..." -ForegroundColor Cyan
    git commit -m "$Message"
}

Write-Host "`n>>> Pushing to remote repository (main)..." -ForegroundColor Cyan
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✔ Successfully pushed feature updates to remote repository!" -ForegroundColor Green
} else {
    Write-Host "`n✖ Push failed. Ensure remote 'origin' is configured (git remote -v)." -ForegroundColor Red
}
