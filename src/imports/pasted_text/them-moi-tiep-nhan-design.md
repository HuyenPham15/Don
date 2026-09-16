THIẾT KẾ MÀN “THÊM MỚI TIẾP NHẬN” CHO HỆ THỐNG GOVEX.

GIỮ NGUYÊN design system, sidebar, header, màu sắc và phong cách giao diện GOVEX hiện tại. Chỉ thiết kế lại màn Thêm mới tiếp nhận theo hướng AI-first.

MỤC TIÊU:

Màn này KHÔNG phải form nhập 30–40 trường.

Cán bộ chỉ nhập những thông tin tối thiểu để tạo “LƯỢT NHẬN” và cung cấp tài liệu đầu vào cho AI.

Sau khi cán bộ nhấn “CHUYỂN TIẾP”, hệ thống mới tự động kích hoạt AI để phân tích đơn.

FLOW:

THÊM MỚI TIẾP NHẬN
→ Nhập thông tin ban đầu
→ Tải tài liệu
→ CHUYỂN TIẾP
→ Tạo LƯỢT NHẬN
→ AI TỰ ĐỘNG PHÂN TÍCH
→ Công việc của tôi
→ Cán bộ xem kết quả AI
→ Xác nhận / chỉnh sửa
→ Tạo Đơn tiếp nhận.

==================================================
1. HEADER
==================================================

Hiển thị:

← Quay lại

THÊM MỚI TIẾP NHẬN

Mô tả ngắn:

“Tạo lượt nhận mới để đưa vào quy trình xử lý. Sau khi chuyển tiếp, AI sẽ tự động phân tích và tra cứu thông tin liên quan.”

==================================================
2. NHÓM 01 – THÔNG TIN TIẾP NHẬN
==================================================

Tạo section:

“01 · THÔNG TIN TIẾP NHẬN”

Các trường:

- Mã lượt nhận: Tự sinh
- Ngày nhận: mặc định ngày hiện tại
- Hình thức nhận: Trực tiếp
- Đơn vị tiếp nhận: tự động theo đơn vị của người dùng
- Người tiếp nhận: tự động theo tài khoản đăng nhập

Không yêu cầu người dùng nhập lại thông tin hệ thống đã biết.

==================================================
3. NHÓM 02 – NGƯỜI NỘP ĐƠN
==================================================

Section:

“02 · NGƯỜI NỘP ĐƠN”

Các trường:

- Tư cách người nộp
- Họ tên / Tên tổ chức
- CCCD / Mã định danh nếu có
- Số điện thoại nếu có
- Địa chỉ nếu có
- Ngày sinh nếu có

Không bắt buộc cán bộ phải nhập đầy đủ nếu thông tin chưa có.

Hiển thị hint:

“Thông tin chưa có sẽ được AI hỗ trợ xác định từ tài liệu và dữ liệu hiện có.”

Không cần nút “Tra cứu người gửi” bắt buộc.

Sau khi chuyển tiếp, AI sẽ tự thực hiện Entity Resolution dựa trên:

- Họ tên
- CCCD
- Số điện thoại
- Địa chỉ
- Ngày sinh
- Các thông tin nhận diện khác.

==================================================
4. NHÓM 03 – THÔNG TIN BAN ĐẦU CỦA ĐƠN
==================================================

Section:

“03 · THÔNG TIN BAN ĐẦU”

Các trường tối thiểu:

- Tên đơn / tiêu đề
- Ngày làm đơn
- Nội dung ban đầu

Nội dung ban đầu sử dụng textarea lớn.

Không yêu cầu cán bộ nhập:

- Loại đơn
- Phân loại
- Loại vụ việc
- Quan hệ pháp luật
- Đối tượng bị phản ánh
- Sự việc
- Cơ quan có thẩm quyền
- Hướng xử lý

Những thông tin này sẽ được AI phân tích sau khi chuyển tiếp.

==================================================
5. NHÓM 04 – TÀI LIỆU GỐC
==================================================

Section nổi bật:

“04 · TÀI LIỆU GỐC”

Thiết kế vùng upload lớn:

“Kéo thả tài liệu vào đây”

hoặc

[ + Chọn tài liệu ]

Hỗ trợ:

PDF
DOCX
JPG
PNG

Sau khi upload:

📄 Don_khieu_nai_NguyenVanA.pdf
2.4 MB
✓ Đã tải lên

Cho phép nhiều tài liệu:

- Tài liệu chính
- Tài liệu kèm theo
- Tài liệu bổ sung

Thêm mô tả:

“AI sẽ đọc và phân tích tài liệu sau khi bạn chuyển tiếp.”

==================================================
6. KHU VỰC GIẢI THÍCH AI
==================================================

Ngay trước khu vực button, tạo một card nhỏ:

“SAU KHI CHUYỂN TIẾP, AI SẼ TỰ ĐỘNG”

Hiển thị 5 bước:

01 · Đọc & bóc tách đơn
02 · Tìm người / tổ chức trong dữ liệu
03 · Tìm đơn / vụ việc liên quan
04 · Tạo tóm tắt nghiệp vụ
05 · Gợi ý hướng xử lý

Dòng giải thích:

“AI phân tích tự động. Cán bộ kiểm tra và quyết định kết quả cuối cùng.”

Không có nút “Phân tích bằng AI”.

AI phải được kích hoạt tự động sau khi nhấn CHUYỂN TIẾP.

==================================================
7. BUTTON
==================================================

Bottom sticky action bar:

[Hủy]
[Lưu nháp]
[CHUYỂN TIẾP →]

Nút “CHUYỂN TIẾP” là CTA chính.

Khi click:

1. Validate các trường bắt buộc
2. Lưu dữ liệu
3. Tạo mã Lượt nhận
4. Lưu tài liệu
5. Kích hoạt AI background
6. Chuyển người dùng về “Công việc của tôi”

Hiển thị notification:

“Đã chuyển lượt nhận LN-19/2026-GOVEX_HC.”

“AI đang tự động phân tích đơn. Bạn có thể theo dõi tiến trình tại Công việc của tôi.”

==================================================
8. SAU KHI CHUYỂN TIẾP
==================================================

Prototype phải mô phỏng được transition:

THÊM MỚI TIẾP NHẬN
↓
CHUYỂN TIẾP
↓
CÔNG VIỆC CỦA TÔI

Trong “Hàng đợi tiếp nhận” xuất hiện card:

[LƯỢT NHẬN]

LN-19/2026-GOVEX_HC

Nguyễn Văn A

AI ĐANG PHÂN TÍCH

“Đang tìm đơn / vụ việc liên quan...”

[Xem chi tiết]

==================================================
9. QUY TẮC UX QUAN TRỌNG
==================================================

Màn “Thêm mới tiếp nhận” phải tạo cảm giác:

CÁN BỘ:
“ Tôi chỉ cần đưa đơn và thông tin ban đầu vào hệ thống.”

HỆ THỐNG:
“ Tôi sẽ tự đọc, tìm kiếm, đối chiếu, liên kết, tổng hợp và đề xuất.”

CÁN BỘ:
“ Tôi quay lại kiểm tra những gì AI đã làm và quyết định.”

Không thiết kế màn này như một form hành chính truyền thống.

Không hiển thị quá nhiều trường.

Không yêu cầu cán bộ nhập lại những thông tin AI có thể bóc tách từ tài liệu.

Thiết kế tối giản, rõ ràng, chuyên nghiệp, phù hợp hệ thống quản lý hành chính/pháp lý.

AI phải được thể hiện như một phần của WORKFLOW, không phải một chatbot đứng cạnh form.