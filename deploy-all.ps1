# Script deploy cả Backend và Frontend lên Heroku

Write-Host "🚀 Deploying Full Stack to Heroku..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor White

# Kiểm tra xem đã login Heroku chưa
$herokuAuth = heroku auth:whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Chưa login Heroku. Vui lòng chạy: heroku login" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Logged in as: $herokuAuth" -ForegroundColor Green

# Setup remotes
Write-Host "`n⚙️  Setting up Heroku remotes..." -ForegroundColor Yellow
$remotes = git remote -v

if ($remotes -notmatch "heroku-backend") {
    heroku git:remote -a spss-be -r heroku-backend
}

if ($remotes -notmatch "heroku-frontend") {
    heroku git:remote -a spss-fe -r heroku-frontend
}

Write-Host "✅ Remotes configured" -ForegroundColor Green

# Commit changes nếu có
$status = git status --porcelain
if ($status) {
    Write-Host "`n📝 Committing changes..." -ForegroundColor Yellow
    git add .
    git commit -m "Deploy: Update backend and frontend"
    Write-Host "✅ Changes committed" -ForegroundColor Green
}

# Deploy Backend
Write-Host "`n========================================" -ForegroundColor White
Write-Host "🔧 DEPLOYING BACKEND..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor White

$subtreeHashBackend = git subtree split --prefix backend HEAD
git push heroku-backend "${subtreeHashBackend}:main" --force

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Backend deployed successfully!" -ForegroundColor Green

# Deploy Frontend
Write-Host "`n========================================" -ForegroundColor White
Write-Host "🎨 DEPLOYING FRONTEND..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor White

$subtreeHashFrontend = git subtree split --prefix frontend HEAD
git push heroku-frontend "${subtreeHashFrontend}:main" --force

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend deployed successfully!" -ForegroundColor Green

# Summary
Write-Host "`n========================================" -ForegroundColor White
Write-Host "🎉 DEPLOYMENT COMPLETED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor White

Write-Host "`n📱 URLs:" -ForegroundColor Cyan
Write-Host "Backend:  https://spss-be-*.herokuapp.com" -ForegroundColor White
Write-Host "Frontend: https://spss-fe-*.herokuapp.com" -ForegroundColor White

Write-Host "`n📊 To check logs, run:" -ForegroundColor Cyan
Write-Host "heroku logs --tail -a spss-be" -ForegroundColor Yellow
Write-Host "heroku logs --tail -a spss-fe" -ForegroundColor Yellow
