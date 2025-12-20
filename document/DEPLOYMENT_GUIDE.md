# HƯỚNG DẪN DEPLOYMENT HEROKU - SSPS PROJECT

## 🎯 Tổng Quan

Dự án SSPS đã được deploy thành công lên Heroku với cấu trúc:

- **Backend**: Spring Boot + PostgreSQL
- **Frontend**: Next.js 14
- **Database**: Heroku Postgres (27 tables + seed data)

## 🔗 URLs

### Production URLs

- **Frontend**: https://spss-fe-8883681576d4.herokuapp.com/
- **Backend API**: https://spss-be-06709850ddfe.herokuapp.com/
- **Database**: postgresql-silhouetted-35609 (Heroku Postgres)

### Heroku Apps

- Frontend App: `spss-fe`
- Backend App: `spss-be`

## 🔐 Test Accounts

Password cho tất cả: `123456`

| Role    | Email               | Mô tả                    |
| ------- | ------------------- | ------------------------ |
| Student | student.test@edu.vn | Tài khoản sinh viên test |
| SPSO    | spso.test@edu.vn    | Nhân viên vận hành       |
| Admin   | admin.test@edu.vn   | Quản trị viên            |

## 📊 Database Summary

- **27 Tables**: Users, PageBalance, Printers, PrintJobs, etc.
- **7 Users**: 3 test accounts + 4 production users
- **11 Printers**: Across 2 campuses (Dĩ An, Linh Trung)
- **41 Permissions**: RBAC with Student, SPSO, Admin roles

## 🚀 Deployment Commands

### Deploy Backend

```bash
cd backend
git subtree push --prefix backend https://git.heroku.com/spss-be.git feat/deploy:main
```

### Deploy Frontend

```bash
git subtree push --prefix frontend https://git.heroku.com/spss-fe.git feat/deploy:main
```

### View Logs

```bash
# Backend logs
heroku logs --tail --app spss-be

# Frontend logs
heroku logs --tail --app spss-fe
```

## ⚙️ Environment Variables

### Backend (spss-be)

```bash
DATABASE_URL=postgres://u58eft9uuktsoh:pa028932fef...@c683rl2u9g20vq.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/d1kb4q3us7hdf3
```

### Frontend (spss-fe)

File: `frontend/.env.production`

```bash
NEXT_PUBLIC_API_BASE_URL=https://spss-be-06709850ddfe.herokuapp.com/api
```

## 📁 Database Files

### PostgreSQL Schema & Data

- `script/database/database_schema_postgres.sql` - 27 tables schema
- `script/database/database_seed_data_postgres.sql` - Complete seed data
- `script/database/drop_database_postgres.sql` - Reset script

### Connection to Heroku Postgres

See `POSTGRES_SETUP_GUIDE.md` for detailed instructions using:

- pgAdmin 4
- DBeaver
- TablePlus
- psql command line

## 🛠️ Troubleshooting

### Frontend không connect được Backend

**Nguyên nhân**: Frontend đang gọi `localhost:8080`  
**Giải pháp**: Đã thêm `.env.production` với `NEXT_PUBLIC_API_BASE_URL`

### Backend 403 Forbidden

**Giải thích**: Root URL `/` bị Spring Security protect - Bình thường!  
**Endpoints**: Frontend dùng `/api/auth/login`, `/api/printers`, etc.

### Database Connection Failed

**Kiểm tra**:

```bash
heroku pg:info --app spss-be
heroku config:get DATABASE_URL --app spss-be
```

## 📝 Important Notes

1. **PostgreSQL Migration**: Đã chuyển từ SQL Server sang PostgreSQL
2. **Schema Conversion**: 27 bảng đã được convert hoàn chỉnh (NVARCHAR→VARCHAR, DATETIME2→TIMESTAMP, etc.)
3. **Heroku Postgres Tier**: Essential-0 (~$5/month)
4. **Backend startup**: ~7-8 seconds (normal)
5. **19 JPA Repositories**: All entities mapped successfully

## 🔄 Update Workflow

### Update Backend Code

```bash
# Make changes in backend/
git add backend/
git commit -m "backend: Your changes"
git push origin feat/deploy
git subtree push --prefix backend https://git.heroku.com/spss-be.git feat/deploy:main
```

### Update Frontend Code

```bash
# Make changes in frontend/
git add frontend/
git commit -m "frontend: Your changes"
git push origin feat/deploy
git subtree push --prefix frontend https://git.heroku.com/spss-fe.git feat/deploy:main
```

### Update Database Schema

1. Modify `script/database/database_schema_postgres.sql`
2. Connect to Heroku Postgres via pgAdmin 4
3. Run updated schema (or use `heroku pg:psql --app spss-be`)

## ✅ Deployment Checklist

- [x] Backend deployed with PostgreSQL driver
- [x] Frontend deployed with production backend URL
- [x] Database schema created (27 tables)
- [x] Seed data loaded (7 users, 11 printers, 41 permissions)
- [x] Backend connected to Heroku Postgres
- [x] Spring Security configured
- [x] CORS configured for frontend domain
- [x] Test accounts ready

## 🎯 Next Steps

1. ✅ Test login với test accounts
2. ✅ Verify các chức năng: print document, view printers, manage
3. ⏳ Configure email service for OTP (optional)
4. ⏳ Update README.md với production URLs
5. ⏳ Add monitoring/analytics (optional)

## 📞 Support

- **Heroku Dashboard**: https://dashboard.heroku.com/apps
- **PostgreSQL Guide**: See `POSTGRES_SETUP_GUIDE.md`
- **Database Schema**: See `document/database_documentation.md`

---

**Last Updated**: December 20, 2025  
**Branch**: `feat/deploy`  
**Status**: ✅ Deployed & Running
