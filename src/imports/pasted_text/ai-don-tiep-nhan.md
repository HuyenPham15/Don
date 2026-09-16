Hãy thiết kế màn hình “AI hỗ trợ tiếp nhận và xử lý đơn” theo layout 2 cột, ưu tiên khả năng đối chiếu giữa tài liệu gốc và thông tin AI bóc tách.

MỤC TIÊU
- Cán bộ vừa xem được tài liệu gốc, vừa xem được kết quả AI trích xuất.
- User có thể kiểm tra và chỉnh sửa thông tin sau khi AI phân tích xong.
- Hệ thống thể hiện rõ AI chỉ hỗ trợ trích xuất, tra cứu, tổng hợp và gợi ý.
- Hướng xử lý cuối cùng do cán bộ quyết định.
- Giao diện nghiệp vụ hành chính, rõ ràng, ít màu, dễ đọc, không bị rối.

==================================================
1. BỐ CỤC TỔNG THỂ
==================================================

Thiết kế desktop workspace dạng split screen:

- Cột trái: 58–60% chiều rộng
- Cột phải: 40–42% chiều rộng
- Có divider ở giữa
- Cho phép kéo divider để thay đổi độ rộng 2 panel
- Hai panel có thể scroll độc lập
- Header và action footer cố định

Bố cục:

┌─────────────────────────────┬─────────────────────────────┐
│ TÀI LIỆU GỐC                │ KẾT QUẢ AI                  │
│                             │                             │
│ PDF / Scan / Image Viewer   │ Thông tin trích xuất       │
│                             │ Tra cứu hệ thống           │
│                             │ Tóm tắt nghiệp vụ          │
│                             │ Gợi ý hỗ trợ xử lý         │
│                             │ Hướng xử lý                │
└─────────────────────────────┴─────────────────────────────┘

==================================================
2. HEADER
==================================================

Header toàn màn hình:

Breadcrumb:
Nhận đơn / AI hỗ trợ phân tích

Title:
“AI hỗ trợ tiếp nhận đơn”

Sub text:
“Đối chiếu tài liệu gốc, kiểm tra thông tin AI trích xuất và xác định hướng xử lý.”

Bên phải:
- Trạng thái AI
- Thời gian phân tích
- Button “Đóng”

Trạng thái có thể là:
- Đang phân tích
- Phân tích hoàn thành
- Có nội dung cần kiểm tra
- Đã xác nhận

==================================================
3. PANEL TRÁI – TÀI LIỆU GỐC
==================================================

Tiêu đề panel:
“Tài liệu gốc”

Header nhỏ hiển thị:
- Tên file
- Loại file: PDF / JPG / PNG
- Số trang
- Dung lượng nếu cần

Toolbar:
- Trang trước
- Trang sau
- Số trang hiện tại / tổng số trang
- Zoom out
- Zoom in
- Fit width
- Fit page
- Rotate
- Download
- Full screen

Vùng chính:
- Hiển thị PDF hoặc ảnh scan
- Background xám nhạt
- Trang tài liệu màu trắng
- Có shadow nhẹ

Yêu cầu tương tác quan trọng:
Khi user click vào một trường AI bóc tách ở panel bên phải, ví dụ:
- Người gửi
- Địa chỉ
- Đối tượng liên quan
- Nội dung chính
- Yêu cầu

thì panel trái:
- tự scroll đến vị trí tương ứng trong tài liệu
- highlight đoạn text AI đã dùng để trích xuất thông tin
- highlight màu vàng nhạt hoặc xanh nhạt
- tooltip nhỏ: “Nguồn trích xuất”

Nếu một thông tin được lấy từ nhiều đoạn:
- highlight tất cả các đoạn liên quan

Nếu AI không xác định được nguồn:
- không highlight
- hiển thị “Không xác định được vị trí trong tài liệu”

==================================================
4. PANEL PHẢI – KẾT QUẢ AI
==================================================

Panel bên phải là khu vực làm việc chính.

Không dùng quá nhiều card lớn.
Dùng accordion/section theo chiều dọc.

Các section:

1. Thông tin AI trích xuất
2. Kết quả tra cứu hệ thống
3. Tóm tắt nghiệp vụ
4. Gợi ý hỗ trợ xử lý
5. Xác định hướng xử lý

==================================================
5. SECTION 1 – THÔNG TIN AI TRÍCH XUẤT
==================================================

Tiêu đề:
“1. Thông tin trích xuất”

Góc phải:
[Chỉnh sửa]

Hiển thị thông tin dạng read-only theo grid 2 cột.

Nhóm A – Người gửi
- Họ tên / Tên tổ chức
- CCCD / MST
- Ngày sinh
- Số điện thoại
- Email
- Địa chỉ

Nhóm B – Đối tượng liên quan
- Người / Tổ chức bị phản ánh
- Cơ quan liên quan
- Đơn vị liên quan

Nhóm C – Nội dung vụ việc
- Nội dung chính
- Sự việc
- Địa điểm
- Thời gian
- Dự án / Vụ việc
- Yêu cầu của người gửi

Nhóm D – Tài liệu kèm theo
- Danh sách tài liệu AI nhận diện được

Data mẫu:
Người gửi:
Nguyễn Văn A

CCCD:
079075012345

Đối tượng liên quan:
Công ty TNHH Xây dựng ABC

Cơ quan liên quan:
UBND tỉnh XYZ

Dự án:
Khu dân cư X

Nội dung chính:
Khiếu nại về mức bồi thường GPMB

Yêu cầu:
Xem xét lại mức bồi thường theo QĐ 45/2024/QĐ-UBND

Ngày làm đơn:
10/09/2026

Không hiển thị confidence % ở mọi trường.

Quy tắc:
- Confidence cao: hiển thị bình thường
- Confidence trung bình: badge “Cần kiểm tra”
- Confidence thấp: badge “Độ tin cậy thấp”
- Không xác định: “Chưa xác định”

==================================================
6. TRẠNG THÁI CHỈNH SỬA
==================================================

Khi click “Chỉnh sửa”:
- các trường read-only chuyển thành input
- dùng text input, textarea, date picker, select phù hợp
- không mở modal, chỉnh sửa trực tiếp trong panel phải

Footer của section:
[Hủy]
[Lưu thay đổi]

Sau khi lưu:
- quay về read-only
- field user đã sửa có badge:
  “Đã chỉnh sửa”
- tooltip:
  “Giá trị AI ban đầu: …”

Không cho AI tự ghi đè lại dữ liệu user đã xác nhận.

==================================================
7. SECTION 2 – KẾT QUẢ TRA CỨU HỆ THỐNG
==================================================

Tiêu đề:
“2. Kết quả tra cứu”

Hiển thị 3 summary item nhỏ:

03
Đơn đã gửi trước

01
Đơn có nội dung liên quan

01
Vụ việc/Vụ án liên quan

Không làm thành dashboard card quá lớn.

Bên dưới hiển thị:
“Đơn liên quan gần nhất”

D-2026-00341

Người gửi:
Nguyễn Văn A

Đối tượng:
Công ty TNHH Xây dựng ABC

Dự án:
Khu dân cư X

Trạng thái:
Đã tiếp nhận

Ngày tiếp nhận:
15/08/2026

Actions:
[Mở đơn]
[So sánh]

Nếu có nhiều bản ghi:
hiển thị tối đa 3 item + link “Xem tất cả”

==================================================
8. DRAWER SO SÁNH
==================================================

Khi click “So sánh”:
mở drawer từ bên phải, rộng khoảng 600–720px.

Title:
“So sánh với đơn D-2026-00341”

Hiển thị bảng:

Trường | Hồ sơ hiện tại | Đơn D-2026-00341 | Kết quả

Người gửi
Nguyễn Văn A
Nguyễn Văn A
✓ Trùng

Đối tượng
Công ty ABC
Công ty ABC
✓ Trùng

Dự án
Khu dân cư X
Khu dân cư X
✓ Trùng

Nội dung
...
...
≈ Tương đồng

Ngày làm đơn
10/09/2026
15/08/2026
≠ Khác

Footer:
“Mức tương đồng nội dung: 89%”

Không dùng text:
“Đơn trùng 89%”

Actions:
[Mở đơn cũ]
[Đóng]

==================================================
9. SECTION 3 – TÓM TẮT NGHIỆP VỤ
==================================================

Tiêu đề:
“3. Tóm tắt nghiệp vụ”

Không viết kiểu tóm tắt văn chương.

Hiển thị theo cấu trúc:

NGƯỜI GỬI
Nguyễn Văn A – ...

NỘI DUNG CHÍNH
Phản ánh / khiếu nại về ...

ĐỐI TƯỢNG LIÊN QUAN
- Công ty TNHH Xây dựng ABC
- UBND tỉnh XYZ

SỰ VIỆC
...

YÊU CẦU CỦA NGƯỜI GỬI
...

KẾT QUẢ TRA CỨU
- Đã có 03 đơn của người này
- Có 01 đơn có nội dung tương tự
- Có 01 vụ việc liên quan

Thiết kế section này như một bản brief nghiệp vụ ngắn gọn để cán bộ đọc nhanh.

==================================================
10. SECTION 4 – GỢI Ý HỖ TRỢ XỬ LÝ
==================================================

Tiêu đề:
“4. Gợi ý hỗ trợ xử lý”

Dùng card nền xanh rất nhạt hoặc neutral, không dùng đỏ.

Ví dụ:

⚠ Cần kiểm tra đơn đã tiếp nhận trước

“Nội dung hồ sơ hiện tại có dấu hiệu liên quan đến đơn D-2026-00341 đã được tiếp nhận trước đây.

Căn cứ phát hiện:
✓ Cùng người gửi
✓ Cùng đối tượng liên quan
✓ Cùng dự án
✓ Mức tương đồng nội dung: 89%

Đề nghị cán bộ kiểm tra kết quả xử lý đơn D-2026-00341 trước khi xác định hướng xử lý.”

Actions:
[Xem đơn]
[Xem căn cứ]

Có thể có nhiều gợi ý, ví dụ:
- Cần kiểm tra đơn trước
- Cần bổ sung CCCD
- Có khả năng thuộc thẩm quyền đơn vị Y
- Cần xác minh thêm thông tin Z

Không dùng từ:
- “AI quyết định”
- “AI bắt buộc chuyển”
- “AI kết luận”

==================================================
11. HIỂN THỊ CĂN CỨ RULE / KNOWLEDGE
==================================================

Khi click “Xem căn cứ”:
mở drawer hoặc popover.

Chia thành 3 tab:

1. Dữ liệu hệ thống
2. Rule nghiệp vụ
3. Knowledge

Ví dụ Rule:
R-CHECK-04

Điều kiện:
- Cùng người gửi
- Có cùng đối tượng
- Có cùng dự án
- Mức tương đồng >= 85%

Kết quả:
“Yêu cầu kiểm tra đơn đã tiếp nhận trước khi xác định hướng xử lý.”

Knowledge:
- Hướng dẫn nghiệp vụ liên quan
- Quy định pháp luật
- Tri thức thực tiễn

Chỉ hiển thị knowledge liên quan đến trường hợp hiện tại.

==================================================
12. SECTION 5 – XÁC ĐỊNH HƯỚNG XỬ LÝ
==================================================

Tiêu đề:
“5. Xác định hướng xử lý”

Sub text:
“Hướng xử lý do cán bộ xác nhận dựa trên nội dung hồ sơ và kết quả kiểm tra.”

Dùng radio card compact:

○ Tiếp nhận đơn mới

○ Gắn với đơn/hồ sơ đã có

○ Chuyển tiếp nhận xử lý

○ Chuyển đơn vị có thẩm quyền

○ Yêu cầu bổ sung thông tin

○ Kết thúc / Không tiếp nhận

Nếu chọn:
“Gắn với đơn/hồ sơ đã có”

Hiển thị:
Đơn/Hồ sơ liên quan *
[D-2026-00341 ▼]

Nếu chọn:
“Chuyển đơn vị có thẩm quyền”

Hiển thị:
Đơn vị nhận *
[........................ ▼]

Lý do chuyển
[........................]

Nếu chọn:
“Yêu cầu bổ sung”

Hiển thị:
Thông tin cần bổ sung *
[........................]

Có trường chung:
Ghi chú xử lý

==================================================
13. STICKY FOOTER
==================================================

Footer cố định dưới panel phải hoặc toàn màn hình.

Bên trái:
✓ Đã kiểm tra 4/5 nội dung cần xác nhận

Bên phải:
[Lưu nháp]
[Xác nhận thông tin]
[Chuyển xử lý]

“Chuyển xử lý” là primary button.

Chỉ enable khi:
- các trường bắt buộc có dữ liệu
- user đã xử lý các cảnh báo bắt buộc
- đã chọn hướng xử lý

==================================================
14. STATE – AI ĐANG PHÂN TÍCH
==================================================

Giữ tài liệu gốc ở panel trái bình thường.

Panel phải hiển thị trạng thái loading.

Title:
“AI đang phân tích hồ sơ”

Sub text:
“Hệ thống đang đọc tài liệu, trích xuất thông tin và đối chiếu dữ liệu.”

Hiển thị stepper:

1. Đọc và bóc tách đơn
2. Định danh người liên quan
3. Tra cứu đơn/vụ việc liên quan
4. Tổng hợp nghiệp vụ
5. Gợi ý hỗ trợ xử lý

Trạng thái:
✓ Hoàn thành
● Đang xử lý
○ Chưa thực hiện

Các section chưa hoàn thành hiển thị skeleton.

Không hiển thị % progress giả nếu backend không cung cấp.

==================================================
15. STATE – AI PHÂN TÍCH XONG
==================================================

Hiển thị banner nhỏ:

✓ Phân tích hoàn thành

“Vui lòng kiểm tra thông tin trước khi xác định hướng xử lý.”

Nếu có cảnh báo:
badge:
“2 nội dung cần kiểm tra”

Automatically expand section chứa cảnh báo.

==================================================
16. TƯƠNG TÁC PANEL TRÁI – PANEL PHẢI
==================================================

Tạo prototype interaction:

- Click field “Người gửi”
→ highlight tên Nguyễn Văn A trong PDF

- Click field “Đối tượng liên quan”
→ highlight Công ty TNHH Xây dựng ABC

- Click “Nội dung chính”
→ highlight đoạn mô tả sự việc

- Click “Yêu cầu”
→ highlight yêu cầu cuối đơn

- Hover highlight
→ tooltip hiển thị:
“AI trích xuất từ đoạn này”

- Click vào highlight trên tài liệu
→ focus field tương ứng ở panel phải

==================================================
17. NGUYÊN TẮC VISUAL
==================================================

Style:
- Modern enterprise/government web app
- Clean, professional
- Ít màu
- Không dùng gradient mạnh
- Không dùng quá nhiều icon decorative

Color:
- Primary: blue
- Success: green
- Warning: amber
- Error: red chỉ khi có lỗi hoặc chặn xử lý
- Background: #F7F8FA hoặc tương đương
- Card background: white
- Border: #E5E7EB

Typography:
- Label nhỏ, gray
- Value đậm hơn label
- Heading rõ phân cấp

Spacing:
- Section spacing 24px
- Field spacing 12–16px
- Radius 8–10px

Không tạo quá nhiều box lồng nhau.

==================================================
18. TẠO CÁC FRAME / STATE
==================================================

Tạo đầy đủ các frame sau:

1. AI đang phân tích
2. AI phân tích hoàn thành
3. AI phân tích hoàn thành + có cảnh báo đơn liên quan
4. User đang chỉnh sửa thông tin
5. Drawer so sánh đơn
6. Drawer xem căn cứ Rule / Knowledge
7. User chọn hướng xử lý
8. Đã xác nhận – sẵn sàng chuyển xử lý

Giữ nguyên layout 2 cột trong tất cả các state.