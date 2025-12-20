# Hướng dẫn Setup Database PostgreSQL trên Heroku

## Cách 1: Sử dụng Heroku Dashboard (KHUYẾN NGHỊ) ✅

### Bước 1: Mở Heroku Dataclips

1. Truy cập: https://data.heroku.com/
2. Đăng nhập với tài khoản Heroku
3. Chọn database: **postgresql-silhouetted-35609**
4. Click tab **Dataclips** hoặc **Settings** > **Credentials**

### Bước 2: Lấy thông tin kết nối

```
Host: c683rl2u9g20vq.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com
Database: d1kb4q3us7hdf3
User: u58eft9uuktsoh
Port: 5432
Password: pa028932fef3df6a7852da5d75aed14ed9883da50840b974073326ebe0d860cac
```

### Bước 3: Kết nối bằng pgAdmin hoặc DBeaver

#### Option A: DBeaver (Miễn phí, dễ dùng)

1. Download: https://dbeaver.io/download/
2. Install và mở DBeaver
3. Click **New Database Connection** > **PostgreSQL**
4. Nhập thông tin:
   - Host: `c683rl2u9g20vq.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com`
   - Port: `5432`
   - Database: `d1kb4q3us7hdf3`
   - Username: `u58eft9uuktsoh`
   - Password: `pa028932fef3df6a7852da5d75aed14ed9883da50840b974073326ebe0d860cac`
5. Click **Test Connection** → **OK**
6. Mở file `script/database/database_schema_postgres.sql`
7. Chọn tất cả (Ctrl+A) → Click **Execute SQL Script** (Ctrl+Enter)
8. Đợi chạy xong → Kiểm tra bảng đã tạo

#### Option B: pgAdmin

1. Download: https://www.pgadmin.org/download/
2. Install và mở pgAdmin
3. Right-click **Servers** > **Register** > **Server**
4. Tab **General**: Name = `Heroku SSPS`
5. Tab **Connection**: Nhập thông tin như trên
6. Click **Save**
7. Navigate đến database `d1kb4q3us7hdf3`
8. Right-click database > **Query Tool**
9. Open file `script/database/database_schema_postgres.sql`
10. Click **Execute** (F5)

---

## Cách 2: Sử dụng TablePlus (Đơn giản nhất) ✅✅

1. Download: https://tableplus.com/ (có bản miễn phí)
2. Click **Create a new connection** > **PostgreSQL**
3. Nhập:
   - Name: `Heroku SSPS`
   - Host: `c683rl2u9g20vq.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com`
   - Port: `5432`
   - User: `u58eft9uuktsoh`
   - Password: `pa028932fef3df6a7852da5d75aed14ed9883da50840b974073326ebe0d860cac`
   - Database: `d1kb4q3us7hdf3`
4. Click **Test** → **Connect**
5. Click **SQL** (góc trên) > **Open File** > Chọn `database_schema_postgres.sql`
6. Click **Run Current** (Cmd/Ctrl + R)

---

## Cách 3: Dùng psql command line (Nếu đã cài PostgreSQL)

```powershell
# Set environment variable
$env:PGPASSWORD="pa028932fef3df6a7852da5d75aed14ed9883da50840b974073326ebe0d860cac"

# Connect và chạy schema
psql -h c683rl2u9g20vq.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com -U u58eft9uuktsoh -d d1kb4q3us7hdf3 -p 5432 -f script/database/database_schema_postgres.sql

# Hoặc chạy seed data
psql -h c683rl2u9g20vq.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com -U u58eft9uuktsoh -d d1kb4q3us7hdf3 -p 5432 -f script/database/database_seed_data_postgres.sql
```

---

## Cách 4: Dùng Heroku CLI với psql (Sau khi cài psql)

```powershell
# Cài PostgreSQL trước
# Windows: https://www.postgresql.org/download/windows/
# Hoặc dùng choco: choco install postgresql

# Sau đó chạy:
heroku pg:psql --app spss-be < script/database/database_schema_postgres.sql
```

---

## Kiểm tra sau khi chạy schema

### Cách 1: Dùng Heroku CLI

```powershell
# Liệt kê tất cả bảng
heroku pg:psql --app spss-be -c "\dt"

# Đếm số bảng
heroku pg:psql --app spss-be -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'"

# Xem structure một bảng
heroku pg:psql --app spss-be -c "\d users"
```

### Cách 2: Dùng GUI tool

```sql
-- Liệt kê tất cả bảng
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Xem cấu trúc bảng Users
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'users';
```

---

## ⚠️ Lưu ý

1. **Không cần tạo database**: Database `d1kb4q3us7hdf3` đã được Heroku tạo sẵn
2. **Bỏ qua lệnh `USE`**: PostgreSQL không có USE, chỉ cần connect đúng database
3. **Password dài**: Copy chính xác password, không thêm/bớt ký tự

---

## Khuyến nghị

**Dùng TablePlus hoặc DBeaver** - Giao diện trực quan, dễ dùng, không cần cài psql riêng.
