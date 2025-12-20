# CI/CD Workflows - SPSS SIU

## 📋 Active Workflows

### 1. **ci.yml** - Continuous Integration ⚡

- **Trigger**: Push to `develop`/`feat/**`, Pull Requests
- **Features**:
  - ✅ Backend: Build Maven, Run tests, Checkstyle
  - ✅ Frontend: Build Next.js, ESLint, Type check
  - ✅ PR validation: Merge conflict check, Auto comment
  - ✅ Conditional runs (only when files changed)
  - ✅ Artifacts upload (JAR, Build files)

### 2. **deploy-heroku.yml** - Auto Deploy to Heroku 🚀

- **Trigger**: Push/merge to `develop` branch
- **Features**:
  - ✅ Auto deploy backend to Heroku (spss-be)
  - ✅ Auto deploy frontend to Heroku (spss-fe)
  - ✅ Health checks verification
  - ✅ Sequential deployment (Backend → Frontend)
- **Requirements**: `HEROKU_API_KEY` secret must be configured

### 2. **ci.yml** - Continuous Integration ⚡

- **Trigger**: Push to `develop`/`feat/**`, Pull Requests
- **Features**:
  - ✅ Backend: Build Maven, Run tests, Checkstyle
  - ✅ Frontend: Build Next.js, ESLint, Type check
  - ✅ PR validation: Merge conflict check, Auto comment
  - ✅ Conditional runs (only when files changed)
  - ✅ Artifacts upload (JAR, Build files)

### 2. **deploy-heroku.yml** - Auto Deploy to Heroku 🚀

- **Trigger**: Push/merge to `develop` branch
- **Features**:
  - ✅ Auto deploy backend to Heroku (spss-be)
  - ✅ Auto deploy frontend to Heroku (spss-fe)
  - ✅ Health checks verification
  - ✅ Sequential deployment (Backend → Frontend)
- **Requirements**: `HEROKU_API_KEY` secret must be configured

### 2. **ci.yml** - Continuous Integration ⚡

- **Trigger**: Push to `develop`/`feat/**`, Pull Requests
- **Features**:
  - ✅ Backend: Build Maven, Run tests, Checkstyle
  - ✅ Frontend: Build Next.js, ESLint, Type check
  - ✅ PR validation: Merge conflict check, Auto comment
  - ✅ Conditional runs (only when files changed)
  - ✅ Artifacts upload (JAR, Build files)

### 2. **deploy-heroku.yml** - Auto Deploy to Heroku 🚀

- **Trigger**: Push/merge to `develop` branch
- **Features**:
  - ✅ Auto deploy backend to Heroku (spss-be)
  - ✅ Auto deploy frontend to Heroku (spss-fe)
  - ✅ Health checks verification
  - ✅ Sequential deployment (Backend → Frontend)
- **Requirements**: `HEROKU_API_KEY` secret must be configured

## 🔐 Required Secrets

Configure these secrets in GitHub Settings → Secrets and variables → Actions:

```
HEROKU_API_KEY          # Heroku API token for deployment
```

### Get Heroku API Key:

```bash
heroku auth:token
```

## 📊 Workflow Flow

```
Push/PR → CI checks (Build + Test + Lint)
            ↓
      [If develop] → Auto Deploy to Heroku
            ↓
   Backend deployed → Frontend deployed → Health checks
```

## 🎯 Branch Strategy

- **feat/\*** → CI only (build + test)
- **develop** → CI + Auto Deploy to Heroku
- **main** → (Reserved for production)

## ✅ Benefits

✨ **Simplified**: 2 workflows thay vì 8 files
✨ **Efficient**: Conditional runs, cache dependencies
✨ **Automated**: Auto deploy on merge to develop
✨ **Visible**: PR comments, summary reports

## 🛠️ Manual Deployment (Backup)

If GitHub Actions fails, deploy manually:

```bash
# Backend
git subtree push --prefix backend https://git.heroku.com/spss-be.git develop:main

# Frontend
git subtree push --prefix frontend https://git.heroku.com/spss-fe.git develop:main
```

## 📝 Notes

- CI runs only on changed files (backend or frontend)
- ESLint/Type errors don't block builds (continue-on-error)
- Artifacts retained for 7 days
- Deploy takes ~5 minutes total (Backend 2-3min + Frontend 2-3min)
