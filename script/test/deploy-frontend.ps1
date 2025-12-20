# Script deploy Frontend lên Heroku

Write-Host "🚀 Deploying Frontend to Heroku..." -ForegroundColor Cyan

# Kiểm tra xem đã login Heroku chưa
$herokuAuth = heroku auth:whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Chưa login Heroku. Vui lòng chạy: heroku login" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Logged in as: $herokuAuth" -ForegroundColor Green

# Kiểm tra xem có remote heroku-frontend chưa
$remotes = git remote -v
if ($remotes -notmatch "heroku-frontend") {
    Write-Host "⚙️  Adding Heroku remote for frontend..." -ForegroundColor Yellow
    heroku git:remote -a spss-fe -r heroku-frontend
}

# Commit changes nếu có
$status = git status --porcelain
if ($status) {
    Write-Host "📝 Committing changes..." -ForegroundColor Yellow
    git add frontend/
    git commit -m "Update frontend for deployment"
}

# Deploy
Write-Host "🚢 Pushing to Heroku..." -ForegroundColor Cyan
$subtreeHash = git subtree split --prefix frontend HEAD
git push heroku-frontend "${subtreeHash}:main" --force

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend deployed successfully!" -ForegroundColor Green
    Write-Host "📊 Checking logs..." -ForegroundColor Cyan
    Start-Sleep -Seconds 5
    heroku logs --tail -a spss-fe -n 50
}
else {
    Write-Host "❌ Deployment failed. Check logs:" -ForegroundColor Red
    heroku logs --tail -a spss-fe
}
