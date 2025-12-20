"""
Script để chạy SQL schema trên Heroku Postgres
Cần cài: pip install psycopg2-binary
"""

import psycopg2
import sys

# Thông tin kết nối
DATABASE_URL = "postgres://u58eft9uuktsoh:pa028932fef3df6a7852da5d75aed14ed9883da50840b974073326ebe0d860cac@c683rl2u9g20vq.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/d1kb4q3us7hdf3"

def run_sql_file(filename):
    """Chạy SQL file trên Postgres"""
    try:
        # Kết nối database
        print(f"Đang kết nối database...")
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        # Đọc SQL file
        print(f"Đang đọc file: {filename}")
        with open(filename, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # Chạy SQL
        print(f"Đang thực thi SQL...")
        cursor.execute(sql_content)
        conn.commit()
        
        print(f"✅ Thành công! Schema đã được tạo.")
        
        # Kiểm tra bảng đã tạo
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        """)
        tables = cursor.fetchall()
        
        print(f"\n📋 Danh sách {len(tables)} bảng đã tạo:")
        for table in tables:
            print(f"  - {table[0]}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python run_postgres_schema.py <sql_file>")
        print("Example: python run_postgres_schema.py script/database/database_schema_postgres.sql")
        sys.exit(1)
    
    sql_file = sys.argv[1]
    run_sql_file(sql_file)
