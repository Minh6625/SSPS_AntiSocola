# Script chuyển đổi SQL Server sang PostgreSQL
# Đọc file SQL Server và convert syntax

$inputFile = "script/database/database_schema_sqlserver.sql"
$outputFile = "script/database/database_schema_postgres.sql"

Write-Host "Đang convert SQL Server -> PostgreSQL..." -ForegroundColor Cyan

$content = Get-Content $inputFile -Raw

# Loại bỏ các lệnh SQL Server specific
$content = $content -replace "USE master;", ""
$content = $content -replace "GO", ""
$content = $content -replace "USE HCMSIU_SSPS;", ""
$content = $content -replace "IF NOT EXISTS.*?CREATE DATABASE.*?END", ""

# Convert data types
$content = $content -replace "NVARCHAR\((\d+)\)", "VARCHAR(`$1)"
$content = $content -replace "NVARCHAR\(MAX\)", "TEXT"
$content = $content -replace "INT IDENTITY\(1,1\)", "SERIAL"
$content = $content -replace "BIGINT IDENTITY\(1,1\)", "BIGSERIAL"
$content = $content -replace "DATETIME2", "TIMESTAMP"
$content = $content -replace "BIT", "BOOLEAN"
$content = $content -replace "GETDATE\(\)", "CURRENT_TIMESTAMP"
$content = $content -replace " DEFAULT 0(?!\d)", " DEFAULT FALSE"
$content = $content -replace " DEFAULT 1(?!\d)", " DEFAULT TRUE"

# Convert computed columns
$content = $content -replace "AS \((.*?)\) PERSISTED", "GENERATED ALWAYS AS (`$1) STORED"

# Convert CREATE OR ALTER to DROP IF EXISTS + CREATE
$content = $content -replace "CREATE OR ALTER (VIEW|PROCEDURE|FUNCTION)", "DROP `$1 IF EXISTS `$1_name CASCADE; CREATE `$1"

# Header
$header = @"
-- ================================================================
-- HCMSIU_SSPS - STUDENT SMART PRINTING SERVICE DATABASE
-- Hệ thống quản lý in ấn thông minh cho sinh viên  
-- Database: PostgreSQL 14+
-- Converted from SQL Server
-- Auto-generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
-- Total: 27 Tables
-- ================================================================

"@

$output = $header + $content

# Lưu file
$output | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host "✅ Đã convert xong!" -ForegroundColor Green
Write-Host "File output: $outputFile" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Thống kê:" -ForegroundColor Cyan
$tableCount = ($output | Select-String "CREATE TABLE" | Measure-Object).Count
Write-Host "  - Số bảng: $tableCount" -ForegroundColor White
Write-Host "  - Dung lượng: $([math]::Round((Get-Item $outputFile).Length / 1KB, 2)) KB" -ForegroundColor White
