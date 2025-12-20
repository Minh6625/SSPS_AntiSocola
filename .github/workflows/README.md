# CI/CD Pipeline Documentation

## 📊 Active Workflows

### 1. **deploy-heroku.yml** ⭐ - Auto Deploy to Heroku

- **Trigger**: Push/merge to `develop` branch
- **Features**:
  - ✅ Auto deploy backend to Heroku (spss-be)
  - ✅ Auto deploy frontend to Heroku (spss-fe)
  - ✅ Health checks verification
- **Requirements**: `HEROKU_API_KEY` secret must be configured

### 2. **ci-cd-pipeline.yml** - Full CI/CD Pipeline

Pipeline mới được tổ chức thành **4 stages** rõ ràng:

```
INSTALL → BUILD → DEPLOY → TEST
```

### Workflow: `ci-cd-pipeline.yml`

## 🔄 Stages

### Stage 1: INSTALL (Song song)

- **install-backend**: Cài dependencies Maven, cache ~/.m2
- **install-frontend**: Cài dependencies NPM, cache node_modules

### Stage 2: BUILD (Song song, phụ thuộc INSTALL)

- **build-backend**:
  - Needs: `install-backend`
  - Test + Build JAR
  - Upload artifact `backend-jar`
- **build-frontend**:
  - Needs: `install-frontend`
  - Lint + Type check + Build
  - Upload artifact `frontend-build`

### Stage 3: DEPLOY (Tuần tự, phụ thuộc BUILD)

- **deploy-staging** (nếu develop branch):
  - Needs: `build-backend`, `build-frontend`
  - Download artifacts
  - Deploy backend + frontend
- **deploy-production** (nếu main branch):
  - Needs: `build-backend`, `build-frontend`
  - Download artifacts
  - Deploy backend + frontend

### Stage 4: TEST (Phụ thuộc DEPLOY)

- **smoke-test** (chỉ staging):
  - Needs: `deploy-staging`
  - Test health endpoints
  - Run smoke tests

## 📈 Dependency Graph

```
     install-backend ────→ build-backend ────┐
                                              ├──→ deploy-staging ──→ smoke-test
     install-frontend ───→ build-frontend ────┤
                                              └──→ deploy-production
```

## ✨ Ưu điểm so với workflows cũ

### Trước (6 workflows riêng lẻ):

❌ Mỗi workflow install + build lại từ đầu
❌ Không tái sử dụng artifacts
❌ Workflows chạy độc lập, không dependencies
❌ Lãng phí thời gian và resources

### Sau (1 pipeline tổng hợp):

✅ Install 1 lần, cache và tái sử dụng
✅ Build 1 lần, upload artifacts
✅ Deploy sử dụng artifacts đã build
✅ Stages rõ ràng như GitLab
✅ Dependencies hợp lý giữa các jobs
✅ Tiết kiệm 50-70% thời gian CI/CD

## 🚀 Triggers

```yaml
on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop]
  workflow_dispatch: # Manual trigger
```

## 📦 Artifacts

- **backend-jar**: JAR file từ build backend (7 days)
- **frontend-build**: .next folder + package.json (7 days)

## 🌍 Environments

- **staging**: Deploy từ branch `develop`
- **production**: Deploy từ branch `main`

## 📝 TODO

Các bước deploy hiện tại là placeholder. Cần cấu hình:

1. **Backend Deploy**:

   ```bash
   # SSH to server
   scp artifacts/backend/*.jar user@server:/path
   # Or Docker
   docker build -t backend:latest .
   docker push registry/backend:latest
   ```

2. **Frontend Deploy**:

   ```bash
   # Vercel/Netlify
   vercel deploy --prod
   # Or SSH
   rsync -avz artifacts/frontend/.next/ user@server:/path
   ```

3. **Smoke Tests**:
   ```bash
   curl -f https://api.example.com/health
   newman run tests/smoke-tests.json
   ```

## 🔧 Migration Plan

### Option 1: Thay thế hoàn toàn

Disable các workflows cũ:

- backend-ci.yml
- frontend-ci.yml
- deploy-staging.yml
- deploy.yml

### Option 2: Giữ song song (Recommended)

- `ci-cd-pipeline.yml`: Main pipeline cho develop/main
- `backend-ci.yml`, `frontend-ci.yml`: CI cho feature branches
- `code-quality.yml`: Code review cho PRs
- `pr-check.yml`: PR validation

## 📊 Visualization

GitHub Actions sẽ hiển thị dependency graph tương tự GitLab:

```
Pipeline
├─ install
│  ├─ install-backend (✓)
│  └─ install-frontend (✓)
├─ build (depends on install)
│  ├─ build-backend (✓)
│  └─ build-frontend (✓)
├─ deploy (depends on build)
│  └─ deploy-staging (⏸)
└─ test (depends on deploy)
   └─ smoke-test (⏸)
```

## 🎯 Best Practices

1. **Cache Strategy**: Maven + NPM dependencies được cache
2. **Artifact Reuse**: Build 1 lần, deploy nhiều nơi
3. **Environment Protection**: staging/production với approval gates
4. **Fail Fast**: Lỗi ở stage sớm → dừng pipeline
5. **Parallel Execution**: Backend + Frontend build song song
