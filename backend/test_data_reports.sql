-- TEST DATA CHO TRANG BÁO CÁO
-- Chạy script này để tạo dữ liệu test

-- Kiểm tra dữ liệu hiện có
SELECT 
    COUNT(*) as total_print_logs,
    MIN(print_time) as earliest_print,
    MAX(print_time) as latest_print
FROM print_logs;

SELECT 
    COUNT(*) as total_transactions,
    MIN(created_at) as earliest_transaction,
    MAX(created_at) as latest_transaction
FROM page_transactions;

-- Nếu không có dữ liệu, chạy các câu lệnh dưới đây:

-- 1. Tạo dữ liệu PrintLog cho tháng 12/2024
-- (Giả sử đã có users và printers trong database)

-- Lấy user_id và printer_id đầu tiên
DO $$
DECLARE
    test_student_id VARCHAR(50);
    test_printer_id BIGINT;
    i INT;
BEGIN
    -- Lấy student_id đầu tiên
    SELECT user_id INTO test_student_id 
    FROM users 
    WHERE user_type = 'STUDENT' 
    LIMIT 1;
    
    -- Lấy printer_id đầu tiên
    SELECT printer_id INTO test_printer_id 
    FROM printers 
    WHERE status = 'Active' 
    LIMIT 1;
    
    -- Nếu tìm thấy cả student và printer
    IF test_student_id IS NOT NULL AND test_printer_id IS NOT NULL THEN
        -- Tạo 50 print logs cho tháng 12/2024
        FOR i IN 1..50 LOOP
            INSERT INTO print_logs (
                student_id,
                printer_id,
                document_name,
                file_path,
                paper_size,
                pages_printed,
                a4_equivalent_used,
                copies,
                is_double_sided,
                status,
                print_time,
                created_at,
                updated_at
            ) VALUES (
                test_student_id,
                test_printer_id,
                'Document_' || i || '.pdf',
                '/uploads/doc_' || i || '.pdf',
                CASE WHEN i % 5 = 0 THEN 'A3' ELSE 'A4' END,
                FLOOR(RANDOM() * 20 + 5)::INT,
                CASE WHEN i % 5 = 0 THEN FLOOR(RANDOM() * 40 + 10)::INT ELSE FLOOR(RANDOM() * 20 + 5)::INT END,
                1,
                CASE WHEN i % 2 = 0 THEN TRUE ELSE FALSE END,
                CASE WHEN i % 10 = 0 THEN 'Failed' ELSE 'Completed' END,
                TIMESTAMP '2024-12-01 08:00:00' + (i || ' hours')::INTERVAL,
                TIMESTAMP '2024-12-01 08:00:00' + (i || ' hours')::INTERVAL,
                TIMESTAMP '2024-12-01 08:00:00' + (i || ' hours')::INTERVAL
            );
        END LOOP;
        
        RAISE NOTICE 'Đã tạo 50 print logs cho tháng 12/2024';
    ELSE
        RAISE NOTICE 'Không tìm thấy student hoặc printer. Vui lòng tạo dữ liệu users và printers trước.';
    END IF;
END $$;

-- 2. Tạo dữ liệu PageTransaction cho tháng 12/2024
DO $$
DECLARE
    test_student_id VARCHAR(50);
    i INT;
BEGIN
    -- Lấy student_id đầu tiên
    SELECT user_id INTO test_student_id 
    FROM users 
    WHERE user_type = 'STUDENT' 
    LIMIT 1;
    
    IF test_student_id IS NOT NULL THEN
        -- Tạo 10 transactions mua trang
        FOR i IN 1..10 LOOP
            INSERT INTO page_transactions (
                student_id,
                transaction_type,
                a4_pages,
                a3_pages,
                amount,
                transaction_status,
                payment_method,
                created_at,
                updated_at
            ) VALUES (
                test_student_id,
                'Purchase',
                FLOOR(RANDOM() * 100 + 50)::INT,
                0,
                (FLOOR(RANDOM() * 100 + 50) * 500)::DECIMAL,
                'Completed',
                'SIUPay',
                TIMESTAMP '2024-12-01 08:00:00' + (i * 2 || ' hours')::INTERVAL,
                TIMESTAMP '2024-12-01 08:00:00' + (i * 2 || ' hours')::INTERVAL
            );
        END LOOP;
        
        RAISE NOTICE 'Đã tạo 10 page transactions cho tháng 12/2024';
    END IF;
END $$;

-- 3. Kiểm tra lại dữ liệu
SELECT 
    DATE_TRUNC('month', print_time) as month,
    COUNT(*) as total_logs,
    SUM(pages_printed) as total_pages,
    COUNT(DISTINCT student_id) as unique_students
FROM print_logs
WHERE print_time >= '2024-12-01' AND print_time < '2025-01-01'
GROUP BY DATE_TRUNC('month', print_time);

SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as total_transactions,
    SUM(a4_pages) as total_pages_purchased,
    SUM(amount) as total_revenue
FROM page_transactions
WHERE created_at >= '2024-12-01' AND created_at < '2025-01-01'
    AND transaction_type = 'Purchase'
    AND transaction_status = 'Completed'
GROUP BY DATE_TRUNC('month', created_at);

-- 4. Nếu muốn xóa dữ liệu test (CẨNTHẬN!)
-- DELETE FROM print_logs WHERE print_time >= '2024-12-01' AND print_time < '2025-01-01';
-- DELETE FROM page_transactions WHERE created_at >= '2024-12-01' AND created_at < '2025-01-01';
