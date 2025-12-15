# Hướng dẫn CI/CD cho HCMSIU_SSPS

## 📋 Tổng quan

Dự án này sử dụng **GitHub Actions** để tự động hóa quá trình build, test và deploy cho cả Backend (Spring Boot) và Frontend (Next.js).

## 🔧 Các Workflow đã cài đặt

### 1. **Backend CI** (`.github/workflows/backend-ci.yml`)

**Kích hoạt khi:**

- Push code vào các nhánh: `main`, `develop`, `feat/**`
- Có thay đổi trong thư mục `backend/`
- Pull request vào `main` hoặc `develop`

**Các bước thực hiện:**

- ✅ Checkout code
- ✅ Setup JDK 17
- ✅ Build project với Maven
- ✅ Chạy unit tests
- ✅ Tạo test report
- ✅ Build JAR file
- ✅ Upload artifact (lưu 7 ngày)

### 2. **Frontend CI** (`.github/workflows/frontend-ci.yml`)

**Kích hoạt khi:**

- Push code vào các nhánh: `main`, `develop`, `feat/**`
- Có thay đổi trong thư mục `frontend/`
- Pull request vào `main` hoặc `develop`

**Các bước thực hiện:**

- ✅ Checkout code
- ✅ Setup Node.js 20
- ✅ Install dependencies
- ✅ Chạy ESLint
- ✅ Build Next.js application
- ✅ Upload build artifact (lưu 7 ngày)

### 3. **Code Quality Check** (`.github/workflows/code-quality.yml`)

**Kích hoạt khi:**

- Tạo Pull Request vào `main` hoặc `develop`

**Kiểm tra:**

- Backend: Checkstyle, SpotBugs
- Frontend: ESLint, TypeScript type checking

### 4. **Deploy to Production** (`.github/workflows/deploy.yml`)

**Kích hoạt khi:**

- Push vào nhánh `main`
- Hoặc trigger thủ công

**Chức năng:**

- Deploy backend và frontend lên production server

## 🚀 Hướng dẫn sử dụng

### Bước 1: Push code lên GitHub

```bash
# Đảm bảo đang ở nhánh feat/ci-cd
git add .github/
git commit -m "Add CI/CD workflows"
git push origin feat/ci-cd
```

### Bước 2: Kiểm tra workflow chạy

1. Vào repository trên GitHub
2. Click tab **Actions**
3. Xem các workflow đang chạy

### Bước 3: Xem kết quả

- ✅ **Green check**: Build thành công
- ❌ **Red X**: Build thất bại (click vào để xem log chi tiết)

## 📦 Tải artifact

Sau khi workflow chạy xong:

1. Vào tab **Actions**
2. Click vào workflow run
3. Scroll xuống mục **Artifacts**
4. Download `backend-jar` hoặc `frontend-build`

## 🔐 Cấu hình Secrets (cho Production)

Để deploy lên production, cần thêm secrets vào GitHub:

1. Vào **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Thêm các secrets cần thiết:

### Cho Backend:

```
DB_HOST=your-database-host
DB_PORT=1433
DB_NAME=HCMSIU_SSPS
DB_USERNAME=your-db-username
DB_PASSWORD=your-db-password
SERVER_HOST=your-production-server
SSH_PRIVATE_KEY=your-ssh-key
```

### Cho Frontend:

```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
VERCEL_TOKEN=your-vercel-token
```

## 🛠️ Tùy chỉnh Deployment

### Deployment qua SSH

Sửa file `.github/workflows/deploy.yml`:

```yaml
- name: Deploy to server via SSH
  uses: appleboy/ssh-action@master
  with:
    host: ${{ secrets.SERVER_HOST }}
    username: ${{ secrets.SERVER_USERNAME }}
    key: ${{ secrets.SSH_PRIVATE_KEY }}
    script: |
      cd /var/www/ssps-backend
      git pull
      mvn clean package -DskipTests
      systemctl restart ssps-backend
```

### Deployment với Docker

```yaml
- name: Build and push Docker image
  uses: docker/build-push-action@v5
  with:
    context: ./backend
    push: true
    tags: your-registry/ssps-backend:latest
```

### Deployment lên Vercel (Frontend)

```yaml
- name: Deploy to Vercel
  working-directory: ./frontend
  run: |
    npm install -g vercel
    vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## 📊 Status Badges

Thêm vào `README.md` để hiển thị trạng thái build:

```markdown
![Backend CI](https://github.com/your-username/SSPS_AntiSocola/workflows/Backend%20CI/badge.svg)
![Frontend CI](https://github.com/your-username/SSPS_AntiSocola/workflows/Frontend%20CI/badge.svg)
```

## 🧪 Test trên Local

### Backend:

```bash
cd backend
mvn clean test
mvn package
```

### Frontend:

```bash
cd frontend
npm install
npm run lint
npm run build
```

## 🐛 Troubleshooting

### Lỗi "Maven build failed"

- Kiểm tra Java version (phải là 17)
- Kiểm tra dependencies trong `pom.xml`
- Xem log chi tiết trong Actions

### Lỗi "npm ci failed"

- Xóa `package-lock.json` và chạy `npm install` lại
- Commit file `package-lock.json` mới

### Lỗi "No space left on device"

- GitHub Actions runner có giới hạn disk space
- Thêm step cleanup:

```yaml
- name: Cleanup
  run: docker system prune -af
```

## 📝 Best Practices

1. **Branch Protection**: Bật protection cho nhánh `main`

   - Require PR trước khi merge
   - Require CI pass trước khi merge

2. **Code Review**: Review code trước khi merge PR

3. **Semantic Versioning**: Đặt tag cho mỗi release

   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

4. **Environment Variables**: Không commit secrets/passwords

5. **Testing**: Viết tests đầy đủ trước khi push

## 🔄 Workflow Diagram

```
Developer Push → GitHub → Trigger Workflow
                            ↓
                    Run Tests & Build
                            ↓
                    ✅ Success → Deploy
                    ❌ Fail → Notify
```

## 📚 Tài liệu tham khảo

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Maven CI/CD Guide](https://maven.apache.org/guides/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## 💡 Tips

- Sử dụng cache để tăng tốc độ build
- Chạy tests song song để tiết kiệm thời gian
- Monitor workflow usage để tránh vượt quá limit
- Sử dụng self-hosted runners nếu cần performance cao hơn

---

**Lưu ý**: Workflows này đã được tối ưu cho dự án SSPS. Tùy chỉnh theo nhu cầu cụ thể của bạn!
