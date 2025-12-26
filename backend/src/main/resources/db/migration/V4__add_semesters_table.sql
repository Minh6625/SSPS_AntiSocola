-- Migration V4: Add Semesters table for semester-based page allocation
-- Purpose: Manage semester configuration for automatic page allocation
-- Date: 2024-12-26

-- ================================================================
-- BẢNG: SEMESTERS - Quản lý học kỳ
-- ================================================================
CREATE TABLE IF NOT EXISTS Semesters (
    SemesterID SERIAL PRIMARY KEY,
    SemesterCode VARCHAR(20) NOT NULL UNIQUE,
    SemesterName VARCHAR(100) NOT NULL,
    AcademicYear VARCHAR(20) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    DefaultA4Pages INT NOT NULL DEFAULT 100,
    DefaultA3Pages INT NOT NULL DEFAULT 0,
    PageAllocationDate DATE,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    IsCurrent BOOLEAN NOT NULL DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CreatedBy VARCHAR(20),
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedBy VARCHAR(20),
    
    CONSTRAINT CK_Semester_Dates CHECK (EndDate > StartDate),
    CONSTRAINT CK_Semester_Pages CHECK (DefaultA4Pages >= 0 AND DefaultA3Pages >= 0),
    
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (UpdatedBy) REFERENCES Users(UserID)
);

-- Create indexes
CREATE INDEX IX_Semester_Code ON Semesters(SemesterCode);
CREATE INDEX IX_Semester_Active ON Semesters(IsActive, IsCurrent);
CREATE INDEX IX_Semester_Dates ON Semesters(StartDate, EndDate);

-- Add comments
COMMENT ON TABLE Semesters IS 'Quản lý học kỳ và cấu hình cấp trang tự động';
COMMENT ON COLUMN Semesters.SemesterCode IS 'Mã học kỳ (VD: HK1-2024, HK2-2024, HK3-2024)';
COMMENT ON COLUMN Semesters.DefaultA4Pages IS 'Số trang A4 cấp phát mặc định cho sinh viên mỗi học kỳ';
COMMENT ON COLUMN Semesters.DefaultA3Pages IS 'Số trang A3 cấp phát mặc định cho sinh viên mỗi học kỳ';
COMMENT ON COLUMN Semesters.PageAllocationDate IS 'Ngày tự động cấp trang cho sinh viên';
COMMENT ON COLUMN Semesters.IsCurrent IS 'Học kỳ hiện tại (chỉ có 1 học kỳ IsCurrent=TRUE)';

-- Insert default system configurations if not exists
INSERT INTO SystemConfig (ConfigKey, ConfigValue, Description, DataType, UpdatedAt)
VALUES 
    ('default_a4_pages_per_semester', '100', 'Số trang A4 mặc định cấp phát mỗi học kỳ', 'Integer', CURRENT_TIMESTAMP),
    ('default_a3_pages_per_semester', '0', 'Số trang A3 mặc định cấp phát mỗi học kỳ', 'Integer', CURRENT_TIMESTAMP),
    ('max_file_size_mb', '50', 'Kích thước file tối đa cho phép upload (MB)', 'Integer', CURRENT_TIMESTAMP),
    ('max_pages_per_job', '100', 'Số trang tối đa cho phép in mỗi lần', 'Integer', CURRENT_TIMESTAMP),
    ('page_allocation_day', '1', 'Ngày trong tháng tự động cấp trang (1-31)', 'Integer', CURRENT_TIMESTAMP),
    ('allowed_file_extensions', 'pdf,doc,docx,ppt,pptx,xls,xlsx,txt', 'Các định dạng file được phép upload', 'String', CURRENT_TIMESTAMP),
    ('enable_color_printing', 'false', 'Cho phép in màu', 'Boolean', CURRENT_TIMESTAMP),
    ('enable_duplex_printing', 'true', 'Cho phép in 2 mặt', 'Boolean', CURRENT_TIMESTAMP),
    ('a4_price_per_page', '500', 'Giá mỗi trang A4 (VND)', 'Decimal', CURRENT_TIMESTAMP),
    ('a3_price_per_page', '1000', 'Giá mỗi trang A3 (VND)', 'Decimal', CURRENT_TIMESTAMP),
    ('system_maintenance_mode', 'false', 'Chế độ bảo trì hệ thống', 'Boolean', CURRENT_TIMESTAMP),
    ('auto_allocate_pages', 'true', 'Tự động cấp trang đầu học kỳ', 'Boolean', CURRENT_TIMESTAMP)
ON CONFLICT (ConfigKey) DO NOTHING;

-- Insert sample semester data
INSERT INTO Semesters (SemesterCode, SemesterName, AcademicYear, StartDate, EndDate, DefaultA4Pages, DefaultA3Pages, PageAllocationDate, IsActive, IsCurrent, CreatedAt)
VALUES 
    ('HK1-2024', 'Học kỳ 1 năm 2024-2025', '2024-2025', '2024-09-01', '2024-12-31', 100, 0, '2024-09-01', TRUE, FALSE, CURRENT_TIMESTAMP),
    ('HK2-2024', 'Học kỳ 2 năm 2024-2025', '2024-2025', '2025-01-01', '2025-05-31', 100, 0, '2025-01-01', TRUE, TRUE, CURRENT_TIMESTAMP),
    ('HK3-2024', 'Học kỳ hè năm 2024-2025', '2024-2025', '2025-06-01', '2025-08-31', 50, 0, '2025-06-01', TRUE, FALSE, CURRENT_TIMESTAMP)
ON CONFLICT (SemesterCode) DO NOTHING;
