# Script deploy Backend lên Heroku

Write-Host "🚀 Deploying Backend to Heroku..." -ForegroundColor Cyan

# Kiểm tra xem đã login Heroku chưa
$herokuAuth = heroku auth:whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Chưa login Heroku. Vui lòng chạy: heroku login" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Logged in as: $herokuAuth" -ForegroundColor Green

# Kiểm tra xem có remote heroku-backend chưa
$remotes = git remote -v
if ($remotes -notmatch "heroku-backend") {
    Write-Host "⚙️  Adding Heroku remote for backend..." -ForegroundColor Yellow
    heroku git:remote -a spss-be -r heroku-backend
}

# Commit changes nếu có
$status = git status --porcelain
if ($status) {
    Write-Host "📝 Committing changes..." -ForegroundColor Yellow
    git add backend/
    git commit -m "Update backend for deployment"
}

# Deploy
Write-Host "🚢 Pushing to Heroku..." -ForegroundColor Cyan
$subtreeHash = git subtree split --prefix backend HEAD
git push heroku-backend "${subtreeHash}:main" --force

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend deployed successfully!" -ForegroundColor Green
    Write-Host "📊 Checking logs..." -ForegroundColor Cyan
    Start-Sleep -Seconds 5
    heroku logs --tail -a spss-be -n 50
}
else {
    Write-Host "❌ Deployment failed. Check logs:" -ForegroundColor Red
    heroku logs --tail -a spss-be
}
