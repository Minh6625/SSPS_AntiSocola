# TESTCASE - STUDENT FEATURES

## 1. CHỌN MÁY IN (Printer Selection)

| ID   | Chức năng                  | Trường hợp kiểm thử                               | Dữ liệu đầu vào                              | Kết quả mong đợi                                                                                       | Kết quả thực tế | Pass/Fail |
| ---- | -------------------------- | ------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------- | --------- |
| TC01 | Xem danh sách máy in       | Hiển thị tất cả máy in khả dụng                   | Không có filter                              | Hiển thị danh sách máy in với trạng thái "Active", thông tin đầy đủ (tên, vị trí, khổ giấy, tính năng) |                 |           |
| TC02 | Lọc theo cơ sở             | Chọn cơ sở "Dĩ An"                                | Campus: "Dĩ An"                              | Chỉ hiển thị máy in tại cơ sở Dĩ An                                                                    |                 |           |
| TC03 | Lọc theo cơ sở             | Chọn cơ sở "TP.HCM"                               | Campus: "TP.HCM"                             | Chỉ hiển thị máy in tại cơ sở TP.HCM                                                                   |                 |           |
| TC04 | Lọc theo tòa nhà           | Chọn cơ sở "Dĩ An", tòa "H6"                      | Campus: "Dĩ An", Building: "H6"              | Chỉ hiển thị máy in tại tòa H6                                                                         |                 |           |
| TC05 | Lọc theo phòng             | Chọn cơ sở "Dĩ An", tòa "H6", phòng "101"         | Campus: "Dĩ An", Building: "H6", Room: "101" | Chỉ hiển thị máy in tại phòng H6-101                                                                   |                 |           |
| TC06 | Lọc theo hãng              | Chọn hãng "HP"                                    | Brand: "HP"                                  | Chỉ hiển thị máy in hãng HP                                                                            |                 |           |
| TC07 | Lọc theo model             | Chọn hãng "HP", model "LaserJet Pro"              | Brand: "HP", Model: "LaserJet Pro"           | Chỉ hiển thị máy in HP LaserJet Pro                                                                    |                 |           |
| TC08 | Tìm kiếm theo tên          | Nhập "Printer 1"                                  | Keyword: "Printer 1"                         | Hiển thị các máy in có tên chứa "Printer 1"                                                            |                 |           |
| TC09 | Chỉ hiển thị máy khả dụng  | Bật checkbox "Chỉ hiển thị máy khả dụng"          | showAvailableOnly: true                      | Chỉ hiển thị máy in có status = "Active"                                                               |                 |           |
| TC10 | Hiển thị tất cả máy in     | Tắt checkbox "Chỉ hiển thị máy khả dụng"          | showAvailableOnly: false                     | Hiển thị tất cả máy in kể cả Inactive, Maintenance                                                     |                 |           |
| TC11 | Chọn máy in khả dụng       | Click "Chọn máy in này" trên máy Active           | printerId: valid, status: Active             | Chuyển sang trang cấu hình in với printerId đã chọn                                                    |                 |           |
| TC12 | Chọn máy in không khả dụng | Click button trên máy Inactive                    | printerId: valid, status: Inactive           | Button bị disable, không thể click                                                                     |                 |           |
| TC13 | Phân trang                 | Click "Sau" khi có nhiều hơn 8 máy in             | currentPage: 0 → 1                           | Hiển thị trang 2 với 8 máy in tiếp theo                                                                |                 |           |
| TC14 | Không có tài liệu          | Truy cập trang chọn máy in mà không có documentId | documentId: null                             | Hiển thị alert "Vui lòng chọn tài liệu trước", redirect về /student/print-document                     |                 |           |
| TC15 | Kết hợp nhiều filter       | Cơ sở "Dĩ An" + Hãng "HP" + Tìm kiếm "Lab"        | Multiple filters                             | Hiển thị máy in thỏa mãn tất cả điều kiện                                                              |                 |           |

## 2. CẤU HÌNH IN & GỬI LỆNH IN (Print Configuration)

| ID   | Chức năng                      | Trường hợp kiểm thử            | Dữ liệu đầu vào                    | Kết quả mong đợi                                                             | Kết quả thực tế | Pass/Fail |
| ---- | ------------------------------ | ------------------------------ | ---------------------------------- | ---------------------------------------------------------------------------- | --------------- | --------- |
| TC16 | Hiển thị thông tin tài liệu    | Xem thông tin tài liệu đã chọn | documentId: valid                  | Hiển thị tên file, số trang gốc                                              |                 |           |
| TC17 | Hiển thị thông tin máy in      | Xem thông tin máy in đã chọn   | printerId: valid                   | Hiển thị tên máy in, vị trí, có button "Đổi máy in"                          |                 |           |
| TC18 | Chọn khổ giấy A4               | Click radio "A4"               | paperSize: "A4"                    | Chọn A4, tính toán trang A4 tương đương                                      |                 |           |
| TC19 | Chọn khổ giấy A3               | Click radio "A3"               | paperSize: "A3"                    | Chọn A3, tính toán trang A4 tương đương (x2)                                 |                 |           |
| TC20 | In tất cả trang                | Chọn "Tất cả trang"            | pageRange: "all"                   | Chọn in toàn bộ tài liệu                                                     |                 |           |
| TC21 | In trang tùy chọn hợp lệ       | Nhập "1-5,10,15-20"            | pageRange: "1-5,10,15-20"          | Chấp nhận, tính toán đúng số trang                                           |                 |           |
| TC22 | In trang tùy chọn không hợp lệ | Nhập "abc" hoặc "1-"           | pageRange: "abc"                   | Hiển thị lỗi validation                                                      |                 |           |
| TC23 | In trang vượt quá số trang     | Nhập "1-100" với file 50 trang | pageRange: "1-100", totalPages: 50 | Hiển thị lỗi "Vượt quá số trang"                                             |                 |           |
| TC24 | Bật in 2 mặt                   | Toggle "In 2 mặt" ON           | duplex: true                       | Số trang A4 tương đương giảm 50%                                             |                 |           |
| TC25 | Tắt in 2 mặt                   | Toggle "In 2 mặt" OFF          | duplex: false                      | Số trang A4 tương đương không giảm                                           |                 |           |
| TC26 | Số bản copy = 1                | Nhập số bản: 1                 | copies: 1                          | Tính toán với 1 bản                                                          |                 |           |
| TC27 | Số bản copy = 5                | Nhập số bản: 5                 | copies: 5                          | Tổng trang = trang gốc × 5                                                   |                 |           |
| TC28 | Số bản copy > 10               | Nhập số bản: 15                | copies: 15                         | Hiển thị lỗi "Tối đa 10 bản"                                                 |                 |           |
| TC29 | Số bản copy = 0                | Nhập số bản: 0                 | copies: 0                          | Hiển thị lỗi "Tối thiểu 1 bản"                                               |                 |           |
| TC30 | Chọn in màu                    | Chọn "Màu" (nếu máy hỗ trợ)    | colorMode: "Color"                 | Chọn in màu                                                                  |                 |           |
| TC31 | Chọn in đen trắng              | Chọn "Đen trắng"               | colorMode: "Grayscale"             | Chọn in đen trắng                                                            |                 |           |
| TC32 | Tính toán số dư đủ             | A4 cần: 10, Số dư: 50          | required: 10, balance: 50          | Hiển thị "Số dư sau khi in: 40", button "Xác nhận in" enabled                |                 |           |
| TC33 | Tính toán số dư không đủ       | A4 cần: 60, Số dư: 50          | required: 60, balance: 50          | Hiển thị cảnh báo "Số dư không đủ", button disabled, link "Mua thêm trang"   |                 |           |
| TC34 | Gửi lệnh in thành công         | Cấu hình hợp lệ, số dư đủ      | Valid config                       | Tạo print job, trừ số dư, redirect về Print History với thông báo thành công |                 |           |
| TC35 | Gửi lệnh in thất bại           | Lỗi server                     | Valid config                       | Hiển thị thông báo lỗi, không trừ số dư                                      |                 |           |
| TC36 | Đổi máy in                     | Click "Đổi máy in"             | -                                  | Quay lại trang chọn máy in, giữ documentId                                   |                 |           |
| TC37 | Quay lại                       | Click "Quay lại"               | -                                  | Quay lại trang chọn máy in                                                   |                 |           |
| TC38 | In nhiều tài liệu              | Chọn 3 tài liệu                | documentIds: "1,2,3"               | Hiển thị danh sách 3 tài liệu, tính tổng số trang                            |                 |           |

## 3. LỊCH SỬ IN (Print History)

| ID   | Chức năng                        | Trường hợp kiểm thử                   | Dữ liệu đầu vào                 | Kết quả mong đợi                                                                                                                           | Kết quả thực tế | Pass/Fail |
| ---- | -------------------------------- | ------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------- | --------- |
| TC39 | Xem lịch sử in                   | Hiển thị tất cả lệnh in của sinh viên | -                               | Hiển thị danh sách print jobs với đầy đủ thông tin (ngày, tài liệu, máy in, trạng thái, số trang)                                          |                 |           |
| TC40 | Hiển thị thống kê                | Xem thống kê tổng quan                | -                               | Hiển thị 4 cards: Tổng job, Hoàn thành, Đang chờ, Thất bại                                                                                 |                 |           |
| TC41 | Lọc theo ngày                    | Chọn ngày cụ thể                      | date: "2024-12-28"              | Chỉ hiển thị jobs trong ngày đã chọn                                                                                                       |                 |           |
| TC42 | Lọc theo máy in                  | Chọn máy in cụ thể                    | printerId: "Printer-H6-101"     | Chỉ hiển thị jobs in trên máy đã chọn                                                                                                      |                 |           |
| TC43 | Lọc theo trạng thái "Thành công" | Chọn status "Completed"               | status: "Completed"             | Chỉ hiển thị jobs có trạng thái Completed                                                                                                  |                 |           |
| TC44 | Lọc theo trạng thái "Đang chờ"   | Chọn status "Pending"                 | status: "Pending"               | Chỉ hiển thị jobs có trạng thái Pending                                                                                                    |                 |           |
| TC45 | Lọc theo trạng thái "Thất bại"   | Chọn status "Failed"                  | status: "Failed"                | Chỉ hiển thị jobs có trạng thái Failed                                                                                                     |                 |           |
| TC46 | Tìm kiếm theo tên tài liệu       | Nhập "Report"                         | searchQuery: "Report"           | Hiển thị jobs có tên tài liệu chứa "Report"                                                                                                |                 |           |
| TC47 | Kết hợp nhiều filter             | Ngày + Máy in + Trạng thái            | Multiple filters                | Hiển thị jobs thỏa mãn tất cả điều kiện                                                                                                    |                 |           |
| TC48 | Xem chi tiết job                 | Click "Xem chi tiết"                  | jobId: valid                    | Hiển thị modal với đầy đủ thông tin: Ngày, Sinh viên, Máy in, Loại giấy, Kiểu in, Loại in (màu/đen trắng), Số trang, Trạng thái, Tổng tiền |                 |           |
| TC49 | Hủy job đang chờ                 | Click "Hủy job" trên job Pending      | jobId: valid, status: Pending   | Hiển thị confirm, sau khi confirm: job chuyển sang Cancelled, reload danh sách                                                             |                 |           |
| TC50 | Hủy job đang in                  | Click "Hủy job" trên job Printing     | jobId: valid, status: Printing  | Hiển thị confirm, sau khi confirm: job chuyển sang Cancelled                                                                               |                 |           |
| TC51 | Không thể hủy job hoàn thành     | Xem job Completed                     | jobId: valid, status: Completed | Không hiển thị button "Hủy job"                                                                                                            |                 |           |
| TC52 | Không thể hủy job thất bại       | Xem job Failed                        | jobId: valid, status: Failed    | Không hiển thị button "Hủy job"                                                                                                            |                 |           |
| TC53 | Auto-refresh khi có job active   | Có job Pending hoặc Printing          | -                               | Tự động refresh mỗi 5 giây                                                                                                                 |                 |           |
| TC54 | Dừng auto-refresh                | Tất cả jobs đã hoàn thành             | -                               | Dừng auto-refresh                                                                                                                          |                 |           |
| TC55 | Hiển thị trạng thái màu sắc      | Xem các trạng thái khác nhau          | -                               | Completed: xanh lá, Pending: vàng, Printing: xanh dương, Failed: đỏ, Cancelled: đỏ                                                         |                 |           |
| TC56 | Dropdown menu vị trí             | Click menu ở 3 dòng cuối              | -                               | Menu hiển thị phía trên (bottom-full)                                                                                                      |                 |           |
| TC57 | Dropdown menu vị trí             | Click menu ở các dòng khác            | -                               | Menu hiển thị phía dưới (top-full)                                                                                                         |                 |           |
| TC58 | Không có lịch sử                 | Sinh viên chưa in lần nào             | -                               | Hiển thị empty state với icon và text "Không tìm thấy lịch sử in"                                                                          |                 |           |

## 4. UPLOAD & QUẢN LÝ TÀI LIỆU (Document Upload & Management)

| ID    | Chức năng                        | Trường hợp kiểm thử                      | Dữ liệu đầu vào                              | Kết quả mong đợi                                                              | Kết quả thực tế | Pass/Fail |
| ----- | -------------------------------- | ---------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------- | --------------- | --------- |
| TC153 | Upload file PDF hợp lệ           | Chọn file PDF < 50MB                     | file: "document.pdf", size: 10MB             | Upload thành công, hiển thị trong danh sách                                   |                 |           |
| TC154 | Upload file DOCX hợp lệ          | Chọn file DOCX < 50MB                    | file: "document.docx", size: 5MB             | Upload thành công                                                             |                 |           |
| TC155 | Upload file PPTX hợp lệ          | Chọn file PPTX < 50MB                    | file: "presentation.pptx", size: 8MB         | Upload thành công                                                             |                 |           |
| TC156 | Upload file XLSX hợp lệ          | Chọn file XLSX < 50MB                    | file: "spreadsheet.xlsx", size: 3MB          | Upload thành công                                                             |                 |           |
| TC157 | Upload file không hợp lệ         | Chọn file .txt                           | file: "document.txt"                         | Hiển thị lỗi "Loại file không được phép"                                      |                 |           |
| TC158 | Upload file quá lớn              | Chọn file > 50MB                         | file: "large.pdf", size: 60MB                | Hiển thị lỗi "File quá lớn (60MB > 50MB)"                                     |                 |           |
| TC159 | Upload nhiều file                | Chọn 3 files cùng lúc                    | files: [file1, file2, file3]                 | Upload tất cả thành công                                                      |                 |           |
| TC160 | Drag & drop file                 | Kéo thả file vào vùng upload             | file: "document.pdf"                         | Upload thành công                                                             |                 |           |
| TC161 | Xem danh sách tài liệu           | Click tab "Danh sách tài liệu"           | -                                            | Hiển thị tất cả tài liệu đã upload với: Tên, Loại, Kích thước, Số trang, Ngày |                 |           |
| TC162 | Tìm kiếm tài liệu                | Nhập "Report"                            | searchTerm: "Report"                         | Hiển thị tài liệu có tên chứa "Report"                                        |                 |           |
| TC163 | Lọc theo loại file               | Chọn "PDF"                               | filterFileType: "PDF"                        | Chỉ hiển thị file PDF                                                         |                 |           |
| TC164 | Lọc theo ngày                    | Chọn từ ngày - đến ngày                  | dateFrom: "2024-12-01", dateTo: "2024-12-31" | Hiển thị tài liệu upload trong khoảng thời gian                               |                 |           |
| TC165 | Lọc theo kích thước              | Nhập min 1MB, max 10MB                   | sizeMin: 1, sizeMax: 10                      | Hiển thị tài liệu có kích thước 1-10MB                                        |                 |           |
| TC166 | Sắp xếp theo ngày mới nhất       | Chọn "Ngày mới nhất"                     | sortBy: "Ngày mới nhất"                      | Sắp xếp giảm dần theo ngày upload                                             |                 |           |
| TC167 | Sắp xếp theo kích thước lớn nhất | Chọn "Kích thước lớn nhất"               | sortBy: "Kích thước lớn nhất"                | Sắp xếp giảm dần theo kích thước                                              |                 |           |
| TC168 | Sắp xếp theo tên A-Z             | Chọn "Tên file (A-Z)"                    | sortBy: "Tên file (A-Z)"                     | Sắp xếp tăng dần theo tên                                                     |                 |           |
| TC169 | Chọn 1 tài liệu                  | Click checkbox trên 1 tài liệu           | documentId: valid                            | Checkbox được chọn, hiển thị "1 đã chọn"                                      |                 |           |
| TC170 | Chọn tất cả tài liệu             | Click checkbox header                    | -                                            | Tất cả tài liệu được chọn (chỉ những file được phép)                          |                 |           |
| TC171 | Không thể chọn file không hợp lệ | Click checkbox trên file không được phép | documentId: invalid                          | Hiển thị alert "Không thể chọn file này: [lý do]"                             |                 |           |
| TC172 | Tải về 1 tài liệu                | Click "Tải về" trên 1 tài liệu           | documentId: valid                            | Download file về máy                                                          |                 |           |
| TC173 | Tải về nhiều tài liệu            | Chọn nhiều tài liệu + click "Tải về"     | selectedIds: [1,2,3]                         | Download tất cả file đã chọn                                                  |                 |           |
| TC174 | In 1 tài liệu                    | Click "In" trên 1 tài liệu               | documentId: valid                            | Chuyển sang trang chọn máy in với documentId                                  |                 |           |
| TC175 | In nhiều tài liệu                | Chọn nhiều tài liệu + click "In"         | selectedIds: [1,2,3]                         | Chuyển sang trang chọn máy in với documentIds                                 |                 |           |
| TC176 | Xóa 1 tài liệu                   | Click "Xóa" và confirm                   | documentId: valid                            | Xóa tài liệu thành công                                                       |                 |           |
| TC177 | Xóa nhiều tài liệu               | Chọn nhiều tài liệu + click "Xóa"        | selectedIds: [1,2,3]                         | Xóa tất cả tài liệu đã chọn                                                   |                 |           |
| TC178 | Không thể xóa tài liệu đang in   | Xóa tài liệu có print job Pending        | documentId: valid, has pending job           | Hiển thị lỗi "Không thể xóa tài liệu đang được in"                            |                 |           |
| TC179 | Hiển thị badge file không hợp lệ | Xem file không được phép                 | -                                            | Hiển thị badge đỏ "Không cho phép" với tooltip lý do                          |                 |           |
| TC180 | Không có tài liệu                | Chưa upload file nào                     | -                                            | Hiển thị empty state "Chưa có tài liệu"                                       |                 |           |

## 5. SỐ DƯ TRANG IN (Page Balance)

| ID    | Chức năng                   | Trường hợp kiểm thử                    | Dữ liệu đầu vào             | Kết quả mong đợi                                                                         | Kết quả thực tế | Pass/Fail |
| ----- | --------------------------- | -------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------- | --------------- | --------- |
| TC181 | Xem số dư trang A4          | Hiển thị số dư A4                      | -                           | Hiển thị số trang A4 hiện có với progress bar                                            |                 |           |
| TC182 | Xem số dư trang A3          | Hiển thị số dư A3                      | -                           | Hiển thị số trang A3 hiện có với progress bar                                            |                 |           |
| TC183 | Xem tổng A4 tương đương     | Hiển thị tổng quy đổi                  | -                           | Hiển thị tổng trang A4 tương đương (A4 + A3×2)                                           |                 |           |
| TC184 | Mua thêm trang hợp lệ       | Nhập 100 trang                         | pages: 100                  | Hiển thị giá: 50,000 VND, button "Thanh toán" enabled                                    |                 |           |
| TC185 | Mua thêm trang = 0          | Nhập 0 trang                           | pages: 0                    | Button "Thanh toán" disabled                                                             |                 |           |
| TC186 | Mua thêm trang âm           | Nhập -10 trang                         | pages: -10                  | Hiển thị lỗi hoặc reset về 0                                                             |                 |           |
| TC187 | Thanh toán thành công       | Click "Thanh toán" với số trang hợp lệ | pages: 100                  | Hiển thị confirm, sau khi confirm: cộng trang vào số dư, hiển thị thông báo thành công   |                 |           |
| TC188 | Thanh toán thất bại         | Lỗi server                             | pages: 100                  | Hiển thị thông báo lỗi, không cộng trang                                                 |                 |           |
| TC189 | Xem lịch sử giao dịch       | Hiển thị danh sách transactions        | -                           | Hiển thị bảng với: Ngày, Loại (Cấp phát/Mua thêm/Khấu trừ), Số trang, Số dư sau, Ghi chú |                 |           |
| TC190 | Lọc giao dịch theo loại     | Chọn "Mua thêm"                        | transactionType: "Purchase" | Chỉ hiển thị giao dịch mua thêm                                                          |                 |           |
| TC191 | Lọc giao dịch theo ngày     | Chọn khoảng thời gian                  | dateFrom, dateTo            | Hiển thị giao dịch trong khoảng thời gian                                                |                 |           |
| TC192 | Phân trang giao dịch        | Click "Sau" khi có nhiều giao dịch     | page: 0 → 1                 | Hiển thị trang 2                                                                         |                 |           |
| TC193 | Hiển thị giao dịch cấp phát | Xem giao dịch đầu học kỳ               | -                           | Hiển thị loại "Cấp phát" với số trang mặc định                                           |                 |           |
| TC194 | Hiển thị giao dịch khấu trừ | Xem giao dịch sau khi in               | -                           | Hiển thị loại "Khấu trừ" với số trang đã in, ghi chú jobId                               |                 |           |
| TC195 | Không có giao dịch          | Chưa có giao dịch nào                  | -                           | Hiển thị empty state "Chưa có giao dịch"                                                 |                 |           |

---

## TỔNG KẾT TESTCASE STUDENT

**Tổng số testcase:** 195

**Phân loại theo chức năng:**

- Chọn máy in: 15 testcases (TC01-TC15)
- Cấu hình in & Gửi lệnh in: 23 testcases (TC16-TC38)
- Lịch sử in: 20 testcases (TC39-TC58)
- Upload & Quản lý tài liệu: 28 testcases (TC153-TC180)
- Số dư trang in: 15 testcases (TC181-TC195)

**Mức độ ưu tiên:**

- Critical (P0): ~60% - Các chức năng core như chọn máy in, cấu hình in, gửi lệnh in, xem số dư
- High (P1): ~25% - Các chức năng quan trọng như lọc, tìm kiếm, xem chi tiết
- Medium (P2): ~10% - Các chức năng nâng cao như sắp xếp, phân trang
- Low (P3): ~5% - Các chức năng phụ như empty state, loading state
