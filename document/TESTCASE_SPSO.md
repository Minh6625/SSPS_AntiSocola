# TESTCASE - SPSO FEATURES

## 1. QUẢN LÝ MÁY IN (Printer Management)

| ID   | Chức năng                   | Trường hợp kiểm thử                        | Dữ liệu đầu vào                                              | Kết quả mong đợi                                                                                                    | Kết quả thực tế | Pass/Fail |
| ---- | --------------------------- | ------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | --------------- | --------- |
| TC59 | Xem danh sách máy in        | Hiển thị tất cả máy in                     | -                                                            | Hiển thị danh sách máy in với đầy đủ thông tin (ID, Tên, Vị trí, Trạng thái, Khổ giấy)                              |                 |           |
| TC60 | Lọc theo cơ sở              | Chọn cơ sở "Dĩ An"                         | campus: "Dĩ An"                                              | Chỉ hiển thị máy in tại Dĩ An                                                                                       |                 |           |
| TC61 | Lọc theo tòa nhà            | Chọn cơ sở + tòa nhà                       | campus: "Dĩ An", building: "H6"                              | Chỉ hiển thị máy in tại H6                                                                                          |                 |           |
| TC62 | Lọc theo phòng              | Chọn cơ sở + tòa + phòng                   | campus, building, room                                       | Chỉ hiển thị máy in tại phòng cụ thể                                                                                |                 |           |
| TC63 | Lọc theo hãng               | Chọn hãng "HP"                             | brand: "HP"                                                  | Chỉ hiển thị máy in HP                                                                                              |                 |           |
| TC64 | Lọc theo model              | Chọn hãng + model                          | brand: "HP", model: "LaserJet"                               | Chỉ hiển thị máy in HP LaserJet                                                                                     |                 |           |
| TC65 | Lọc theo trạng thái         | Chọn "Đang hoạt động"                      | status: "Active"                                             | Chỉ hiển thị máy Active                                                                                             |                 |           |
| TC66 | Lọc theo ngày bảo trì       | Chọn ngày cụ thể                           | lastMaintenanceDate: "2024-12-01"                            | Chỉ hiển thị máy bảo trì ngày đó                                                                                    |                 |           |
| TC67 | Tìm kiếm theo tên           | Nhập "Printer 1"                           | keyword: "Printer 1"                                         | Hiển thị máy in có tên chứa "Printer 1"                                                                             |                 |           |
| TC68 | Thêm máy in hợp lệ          | Điền đầy đủ thông tin                      | printerName, brandId, modelId, roomId, ipAddress, paperSizes | Tạo máy in thành công, hiển thị trong danh sách                                                                     |                 |           |
| TC69 | Thêm máy in thiếu thông tin | Không chọn Brand                           | brandId: null                                                | Hiển thị alert "Vui lòng chọn đầy đủ thông tin"                                                                     |                 |           |
| TC70 | Thêm máy in thiếu Model     | Không chọn Model                           | modelId: null                                                | Hiển thị alert "Vui lòng chọn đầy đủ thông tin"                                                                     |                 |           |
| TC71 | Thêm máy in thiếu Phòng     | Không chọn Room                            | roomId: null                                                 | Hiển thị alert "Vui lòng chọn đầy đủ thông tin"                                                                     |                 |           |
| TC72 | Sửa máy in                  | Cập nhật thông tin máy in                  | printerId: valid, updated data                               | Cập nhật thành công, hiển thị thông tin mới                                                                         |                 |           |
| TC73 | Sửa máy in - Load dữ liệu   | Mở modal sửa                               | printerId: valid                                             | Load đúng thông tin: Brand, Model, Campus, Building, Room, IP, Paper sizes, Color, Duplex, Status, Maintenance date |                 |           |
| TC74 | Xóa máy in                  | Click "Xóa" và confirm                     | printerId: valid                                             | Hiển thị confirm, sau khi confirm: xóa máy in khỏi danh sách                                                        |                 |           |
| TC75 | Xóa máy in - Hủy            | Click "Xóa" nhưng cancel                   | printerId: valid                                             | Không xóa máy in                                                                                                    |                 |           |
| TC76 | Bật máy in                  | Toggle switch từ OFF → ON                  | printerId: valid, status: Inactive                           | Máy in chuyển sang Active                                                                                           |                 |           |
| TC77 | Tắt máy in                  | Toggle switch từ ON → OFF                  | printerId: valid, status: Active                             | Máy in chuyển sang Inactive                                                                                         |                 |           |
| TC78 | Chọn 1 máy in               | Click checkbox trên 1 máy                  | printerId: valid                                             | Checkbox được chọn, hiển thị "1 đã chọn"                                                                            |                 |           |
| TC79 | Chọn tất cả máy in          | Click checkbox header                      | -                                                            | Tất cả máy in được chọn                                                                                             |                 |           |
| TC80 | Bỏ chọn tất cả              | Click checkbox header khi đã chọn tất cả   | -                                                            | Bỏ chọn tất cả máy in                                                                                               |                 |           |
| TC81 | Xóa hàng loạt               | Chọn nhiều máy + click "Xóa hàng loạt"     | selectedIds: [1,2,3]                                         | Hiển thị confirm, sau khi confirm: xóa tất cả máy đã chọn                                                           |                 |           |
| TC82 | Bật/Tắt hàng loạt           | Chọn nhiều máy + click "Bật/Tắt hàng loạt" | selectedIds: [1,2,3]                                         | Hiển thị confirm, sau khi confirm: toggle trạng thái tất cả máy đã chọn                                             |                 |           |
| TC83 | Refill giấy/mực             | Click "Refill" và chọn items               | printerId: valid, refillData: {a4Paper, a3Paper, toners}     | Cập nhật trạng thái máy in, chuyển từ OutOfPaper/OutOfToner về Active                                               |                 |           |
| TC84 | Phân trang                  | Click "Sau" khi có > 10 máy                | page: 0 → 1                                                  | Hiển thị trang 2                                                                                                    |                 |           |
| TC85 | Dropdown menu               | Click 3 chấm                               | printerId: valid                                             | Hiển thị menu với các option: Sửa, Xóa, Refill                                                                      |                 |           |

## 2. VỊ TRÍ MÁY IN (Location Management)

| ID    | Chức năng                | Trường hợp kiểm thử           | Dữ liệu đầu vào                                      | Kết quả mong đợi                                                                           | Kết quả thực tế | Pass/Fail |
| ----- | ------------------------ | ----------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------- | --------- |
| TC86  | Xem tab Cơ sở            | Click tab "Cơ sở"             | -                                                    | Hiển thị danh sách cơ sở với: Mã, Tên, Địa chỉ, Trạng thái                                 |                 |           |
| TC87  | Xem tab Tòa nhà          | Click tab "Tòa nhà"           | -                                                    | Hiển thị danh sách tòa nhà với: Mã, Tên, Cơ sở, Số tầng, Trạng thái                        |                 |           |
| TC88  | Xem tab Phòng            | Click tab "Phòng"             | -                                                    | Hiển thị danh sách phòng với: Số phòng, Tên, Tòa nhà, Loại phòng, Sức chứa, Trạng thái     |                 |           |
| TC89  | Thêm cơ sở hợp lệ        | Điền đầy đủ thông tin         | campusCode, campusName, address, isActive            | Tạo cơ sở thành công                                                                       |                 |           |
| TC90  | Thêm cơ sở thiếu mã      | Không điền mã cơ sở           | campusCode: ""                                       | Hiển thị lỗi "Mã cơ sở không được để trống"                                                |                 |           |
| TC91  | Thêm cơ sở thiếu tên     | Không điền tên cơ sở          | campusName: ""                                       | Hiển thị lỗi "Tên cơ sở không được để trống"                                               |                 |           |
| TC92  | Sửa cơ sở                | Cập nhật thông tin cơ sở      | campusId: valid, updated data                        | Cập nhật thành công                                                                        |                 |           |
| TC93  | Xóa cơ sở                | Click "Xóa" và confirm        | campusId: valid                                      | Hiển thị cảnh báo "Xóa cơ sở sẽ xóa TẤT CẢ tòa nhà và phòng", sau khi confirm: xóa cascade |                 |           |
| TC94  | Thêm tòa nhà hợp lệ      | Chọn cơ sở + điền thông tin   | campusId, buildingCode, buildingName, floorCount     | Tạo tòa nhà thành công                                                                     |                 |           |
| TC95  | Thêm tòa nhà thiếu cơ sở | Không chọn cơ sở              | campusId: null                                       | Hiển thị lỗi "Vui lòng chọn cơ sở"                                                         |                 |           |
| TC96  | Thêm tòa nhà mã trùng    | Mã tòa đã tồn tại trong cơ sở | buildingCode: "H6" (đã có)                           | Hiển thị lỗi "Mã tòa nhà đã tồn tại"                                                       |                 |           |
| TC97  | Hiển thị tòa nhà đã dùng | Chọn cơ sở có tòa nhà         | campusId: valid                                      | Hiển thị danh sách mã tòa đã sử dụng                                                       |                 |           |
| TC98  | Sửa tòa nhà              | Cập nhật thông tin tòa nhà    | buildingId: valid, updated data                      | Cập nhật thành công                                                                        |                 |           |
| TC99  | Xóa tòa nhà              | Click "Xóa" và confirm        | buildingId: valid                                    | Hiển thị cảnh báo "Xóa tòa nhà sẽ xóa TẤT CẢ phòng", sau khi confirm: xóa cascade          |                 |           |
| TC100 | Thêm phòng hợp lệ        | Chọn tòa nhà + điền thông tin | buildingId, roomNumber, roomName, roomType, capacity | Tạo phòng thành công                                                                       |                 |           |
| TC101 | Thêm phòng thiếu tòa nhà | Không chọn tòa nhà            | buildingId: null                                     | Hiển thị lỗi "Vui lòng chọn tòa nhà"                                                       |                 |           |
| TC102 | Thêm phòng số trùng      | Số phòng đã tồn tại trong tòa | roomNumber: "101" (đã có)                            | Hiển thị lỗi "Số phòng đã tồn tại"                                                         |                 |           |
| TC103 | Hiển thị phòng đã dùng   | Chọn tòa nhà có phòng         | buildingId: valid                                    | Hiển thị danh sách số phòng đã sử dụng                                                     |                 |           |
| TC104 | Sửa phòng                | Cập nhật thông tin phòng      | roomId: valid, updated data                          | Cập nhật thành công                                                                        |                 |           |
| TC105 | Xóa phòng                | Click "Xóa" và confirm        | roomId: valid                                        | Xóa phòng thành công                                                                       |                 |           |
| TC106 | Chọn loại phòng          | Chọn từ dropdown              | roomType: "Phòng học"                                | Chọn loại phòng thành công                                                                 |                 |           |

## 3. CÀI ĐẶT CẤU HÌNH & QUẢN LÝ HỌC KỲ (System Settings & Semesters)

| ID    | Chức năng                                      | Trường hợp kiểm thử                           | Dữ liệu đầu vào                                              | Kết quả mong đợi                                                                                                                     | Kết quả thực tế | Pass/Fail |
| ----- | ---------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | --------------- | --------- |
| TC107 | Xem tab Cấu hình chung                         | Click tab "Cấu hình chung"                    | -                                                            | Hiển thị các cấu hình: Số trang A4 mặc định, Giá trang A4, Tự động cấp trang, Kích thước file tối đa, Định dạng file, Chế độ bảo trì |                 |           |
| TC108 | Xem tab Quản lý học kỳ                         | Click tab "Quản lý học kỳ"                    | -                                                            | Hiển thị danh sách học kỳ với: Mã, Tên, Thời gian, Trạng thái                                                                        |                 |           |
| TC109 | Cập nhật số trang A4 mặc định                  | Nhập 100                                      | default_a4_pages_per_semester: 100                           | Lưu thành công, hiển thị thông báo                                                                                                   |                 |           |
| TC110 | Cập nhật giá trang A4                          | Nhập 1000                                     | a4_price_per_page: 1000                                      | Lưu thành công                                                                                                                       |                 |           |
| TC111 | Bật tự động cấp trang                          | Check checkbox                                | auto_allocate_pages: true                                    | Lưu thành công                                                                                                                       |                 |           |
| TC112 | Tắt tự động cấp trang                          | Uncheck checkbox                              | auto_allocate_pages: false                                   | Lưu thành công                                                                                                                       |                 |           |
| TC113 | Cập nhật kích thước file tối đa                | Nhập 100 MB                                   | max_file_size_mb: 100                                        | Lưu thành công                                                                                                                       |                 |           |
| TC114 | Chọn định dạng file                            | Chọn PDF, DOCX, PPTX                          | allowed_file_extensions: "pdf,docx,pptx"                     | Lưu thành công                                                                                                                       |                 |           |
| TC115 | Bỏ chọn tất cả định dạng                       | Uncheck tất cả                                | allowed_file_extensions: ""                                  | Hiển thị lỗi "Vui lòng chọn ít nhất 1 định dạng file cho phép!", không lưu                                                           |                 |           |
| TC116 | Bật chế độ bảo trì                             | Check checkbox                                | system_maintenance_mode: true                                | Lưu thành công, sinh viên không thể sử dụng hệ thống                                                                                 |                 |           |
| TC117 | Tắt chế độ bảo trì                             | Uncheck checkbox                              | system_maintenance_mode: false                               | Lưu thành công, sinh viên có thể sử dụng                                                                                             |                 |           |
| TC118 | Hiển thị học kỳ hiện tại                       | Xem học kỳ đang diễn ra                       | -                                                            | Hiển thị card học kỳ hiện tại với màu xanh, badge "Hiện tại"                                                                         |                 |           |
| TC119 | Thêm học kỳ hợp lệ                             | Điền đầy đủ thông tin                         | semesterCode, semesterName, academicYear, startDate, endDate | Tạo học kỳ thành công                                                                                                                |                 |           |
| TC120 | Thêm học kỳ - Auto generate mã                 | Nhập "Học kỳ 1" + "2024-2025"                 | semesterName: "Học kỳ 1", academicYear: "2024-2025"          | Tự động tạo mã "HK1-2024"                                                                                                            |                 |           |
| TC121 | Thêm học kỳ - Mã không hợp lệ                  | Mã không đúng format                          | semesterCode: "ABC"                                          | Hiển thị lỗi "Mã học kỳ phải có định dạng HK[1-3]-YYYY"                                                                              |                 |           |
| TC122 | Thêm học kỳ - Tên quá ngắn                     | Tên < 5 ký tự                                 | semesterName: "HK1"                                          | Hiển thị lỗi "Tên học kỳ phải có ít nhất 5 ký tự"                                                                                    |                 |           |
| TC123 | Thêm học kỳ - Năm học không hợp lệ             | Năm học sai format                            | academicYear: "2024"                                         | Hiển thị lỗi "Năm học phải có định dạng YYYY-YYYY"                                                                                   |                 |           |
| TC124 | Thêm học kỳ - Ngày kết thúc trước ngày bắt đầu | endDate < startDate                           | startDate: "2024-09-01", endDate: "2024-08-01"               | Hiển thị lỗi "Ngày kết thúc phải sau ngày bắt đầu"                                                                                   |                 |           |
| TC125 | Thêm học kỳ - Thời gian < 30 ngày              | Khoảng cách < 30 ngày                         | startDate: "2024-09-01", endDate: "2024-09-15"               | Hiển thị lỗi "Học kỳ phải kéo dài ít nhất 30 ngày"                                                                                   |                 |           |
| TC126 | Thêm học kỳ - Thời gian > 365 ngày             | Khoảng cách > 365 ngày                        | startDate: "2024-01-01", endDate: "2025-12-31"               | Hiển thị lỗi "Học kỳ không được dài quá 365 ngày"                                                                                    |                 |           |
| TC127 | Thêm học kỳ - Ngày cấp phát ngoài khoảng       | pageAllocationDate ngoài [startDate, endDate] | pageAllocationDate: "2024-08-01"                             | Hiển thị lỗi "Ngày cấp phát phải nằm trong khoảng thời gian học kỳ"                                                                  |                 |           |
| TC128 | Thêm học kỳ - Auto fill ngày cấp phát          | Không điền ngày cấp phát                      | pageAllocationDate: ""                                       | Tự động điền = startDate                                                                                                             |                 |           |
| TC129 | Sửa học kỳ                                     | Cập nhật thông tin học kỳ                     | semesterId: valid, updated data                              | Cập nhật thành công                                                                                                                  |                 |           |
| TC130 | Xóa học kỳ                                     | Click "Xóa" và confirm                        | semesterId: valid                                            | Xóa học kỳ thành công                                                                                                                |                 |           |
| TC131 | Không thể xóa học kỳ hiện tại                  | Click "Xóa" trên học kỳ đang diễn ra          | semesterId: current                                          | Button "Xóa" bị ẩn                                                                                                                   |                 |           |
| TC132 | Hiển thị trạng thái học kỳ                     | Xem các học kỳ khác nhau                      | -                                                            | Sắp diễn ra: xanh dương, Đang diễn ra: xanh lá, Đã kết thúc: xám, Đã xóa: xám                                                        |                 |           |

## 4. BÁO CÁO (Reports)

| ID    | Chức năng                    | Trường hợp kiểm thử                   | Dữ liệu đầu vào                              | Kết quả mong đợi                                                                                                           | Kết quả thực tế | Pass/Fail |
| ----- | ---------------------------- | ------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------- | --------- |
| TC133 | Xem báo cáo tháng            | Chọn loại "Tháng" + Tháng 12/2024     | reportType: "monthly", year: 2024, month: 12 | Hiển thị báo cáo tháng 12/2024 với: Tổng quan, Phân bổ khổ giấy, Top students, Top printers, Phân tích, Thống kê theo ngày |                 |           |
| TC134 | Xem báo cáo năm              | Chọn loại "Năm" + Năm 2024            | reportType: "yearly", year: 2024             | Hiển thị báo cáo năm 2024 với: Tổng quan, Phân bổ khổ giấy, Top students, Top printers, Thống kê theo tháng                |                 |           |
| TC135 | Chuyển đổi loại báo cáo      | Click "Tháng" → "Năm"                 | -                                            | Tự động load báo cáo năm                                                                                                   |                 |           |
| TC136 | Thay đổi năm                 | Chọn năm 2023                         | year: 2023                                   | Tự động load báo cáo năm 2023                                                                                              |                 |           |
| TC137 | Thay đổi tháng               | Chọn tháng 11                         | month: 11                                    | Tự động load báo cáo tháng 11                                                                                              |                 |           |
| TC138 | Hiển thị tổng quan           | Xem metrics cards                     | -                                            | Hiển thị 4 cards: Tổng lệnh in, Tổng trang in, Doanh thu, Sinh viên hoạt động                                              |                 |           |
| TC139 | Hiển thị phân bổ khổ giấy    | Xem biểu đồ A4/A3                     | -                                            | Hiển thị % A4 và % A3 với progress bar, số lệnh in                                                                         |                 |           |
| TC140 | Hiển thị Top 5 sinh viên     | Xem danh sách top students            | -                                            | Hiển thị 5 sinh viên in nhiều nhất với: Tên, Email, Số trang, Số lệnh                                                      |                 |           |
| TC141 | Hiển thị Top 3 máy in        | Xem danh sách top printers            | -                                            | Hiển thị 3 máy in bận nhất với: Tên, Vị trí, Số lệnh, Số trang                                                             |                 |           |
| TC142 | Hiển thị phân tích           | Xem phần Key Insights                 | -                                            | Hiển thị Điểm mạnh và Đề xuất                                                                                              |                 |           |
| TC143 | Hiển thị thống kê theo ngày  | Xem biểu đồ daily stats (monthly)     | -                                            | Hiển thị bar chart số lệnh in theo từng ngày trong tháng                                                                   |                 |           |
| TC144 | Hiển thị thống kê theo tháng | Xem biểu đồ monthly stats (yearly)    | -                                            | Hiển thị bar chart số lệnh in theo từng tháng trong năm                                                                    |                 |           |
| TC145 | Xuất PDF tháng               | Click "Xuất PDF" trên báo cáo tháng   | reportType: "monthly"                        | Download file PDF báo cáo tháng                                                                                            |                 |           |
| TC146 | Xuất Excel tháng             | Click "Xuất Excel" trên báo cáo tháng | reportType: "monthly"                        | Download file Excel báo cáo tháng                                                                                          |                 |           |
| TC147 | Xuất PDF năm                 | Click "Xuất PDF" trên báo cáo năm     | reportType: "yearly"                         | Download file PDF báo cáo năm                                                                                              |                 |           |
| TC148 | Xuất Excel năm               | Click "Xuất Excel" trên báo cáo năm   | reportType: "yearly"                         | Download file Excel báo cáo năm                                                                                            |                 |           |
| TC149 | Không có dữ liệu tháng       | Chọn tháng không có dữ liệu           | month: 1, year: 2020                         | Hiển thị empty state "Không có dữ liệu in ấn cho tháng 1/2020"                                                             |                 |           |
| TC150 | Không có dữ liệu năm         | Chọn năm không có dữ liệu             | year: 2020                                   | Hiển thị empty state "Không có dữ liệu in ấn cho năm 2020"                                                                 |                 |           |
| TC151 | Loading state                | Đang tải báo cáo                      | -                                            | Hiển thị spinner và text "Đang tải báo cáo..."                                                                             |                 |           |
| TC152 | Error state                  | Lỗi khi tải báo cáo                   | -                                            | Hiển thị thông báo lỗi màu đỏ                                                                                              |                 |           |

---

## TỔNG KẾT TESTCASE SPSO

**Tổng số testcase:** 152

**Phân loại theo chức năng:**

- Quản lý máy in: 27 testcases (TC59-TC85)
- Vị trí máy in: 21 testcases (TC86-TC106)
- Cài đặt cấu hình & Quản lý học kỳ: 26 testcases (TC107-TC132)
- Báo cáo: 20 testcases (TC133-TC152)

**Mức độ ưu tiên:**

- Critical (P0): ~55% - Các chức năng core như thêm/sửa/xóa máy in, quản lý vị trí, cấu hình hệ thống
- High (P1): ~30% - Các chức năng quan trọng như lọc, tìm kiếm, báo cáo
- Medium (P2): ~10% - Các chức năng nâng cao như bulk actions, refill
- Low (P3): ~5% - Các chức năng phụ như empty state, loading state

---

## GHI CHÚ QUAN TRỌNG

### Cách sử dụng testcase:

1. **Cột "Kết quả thực tế"**: Ghi lại kết quả khi thực hiện test
2. **Cột "Pass/Fail"**:
   - Pass: Kết quả thực tế = Kết quả mong đợi
   - Fail: Kết quả thực tế ≠ Kết quả mong đợi (ghi rõ lỗi)

### Môi trường test:

- **Browser**: Chrome, Firefox, Edge (latest versions)
- **Screen sizes**: Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)
- **Database**: SQL Server với dữ liệu test đầy đủ
- **Backend**: Spring Boot API running on localhost:8080
- **Frontend**: Next.js running on localhost:3000

### Dữ liệu test cần chuẩn bị:

**SPSO:**

- Account: spso@hcmiu.edu.vn / password
- Có quyền truy cập tất cả chức năng SPSO

**Student:**

- Account: student@hcmiu.edu.vn / password
- Có số dư trang in: 50 A4, 10 A3
- Có một số tài liệu đã upload
- Có một số print jobs (Completed, Pending, Failed)

**Reference Data:**

- Ít nhất 2 cơ sở (Dĩ An, TP.HCM)
- Mỗi cơ sở có 2-3 tòa nhà
- Mỗi tòa nhà có 5-10 phòng
- Ít nhất 3 hãng máy in (HP, Canon, Epson)
- Mỗi hãng có 2-3 models
- Ít nhất 10 máy in với các trạng thái khác nhau

**System Config:**

- default_a4_pages_per_semester: 50
- a4_price_per_page: 500
- max_file_size_mb: 50
- allowed_file_extensions: pdf,docx,pptx,xlsx
- auto_allocate_pages: true
- system_maintenance_mode: false

**Semesters:**

- Ít nhất 3 học kỳ: 1 đã kết thúc, 1 đang diễn ra, 1 sắp diễn ra

### Quy trình test:

1. **Smoke Test**: Chạy các testcase P0 trước
2. **Regression Test**: Chạy tất cả testcase sau mỗi lần deploy
3. **Bug Report**: Ghi rõ ID testcase, môi trường, steps to reproduce, expected vs actual
4. **Retest**: Sau khi fix bug, chạy lại testcase đã fail

### Metrics đánh giá:

- **Pass Rate**: (Số testcase Pass / Tổng số testcase) × 100%
- **Target**: ≥ 95% cho P0, ≥ 90% cho P1, ≥ 85% cho P2+P3
- **Critical Bugs**: 0 bugs P0 trước khi release
- **Coverage**: 100% chức năng được test
