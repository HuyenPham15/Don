Thiết kế lại TOÀN BỘ hệ thống GOVEX theo hướng “AI-POWERED WORKFLOW”, tập trung vào quy trình từ lúc tiếp nhận một lượt nhận cho đến khi cán bộ xử lý công việc.

MỤC TIÊU CỐT LÕI:

GOVEX không chỉ là hệ thống nhập đơn → chuyển đơn → cán bộ xử lý.

Hệ thống phải thể hiện được:

NGƯỜI DÙNG TIẾP NHẬN ĐƠN
→ NHẬP THÔNG TIN
→ CHUYỂN TIẾP
→ AI TỰ ĐỘNG PHÂN TÍCH
→ AI TRA CỨU DỮ LIỆU
→ AI TÌM MỐI QUAN HỆ
→ AI TÓM TẮT
→ AI PHÁT HIỆN VẤN ĐỀ
→ AI ĐỀ XUẤT
→ CÁN BỘ XEM KẾT QUẢ
→ CÁN BỘ XÁC NHẬN / CHỈNH SỬA
→ TIẾP TỤC XỬ LÝ.

AI KHÔNG được xuất hiện như một chatbot độc lập đứng cạnh form.

AI phải là một lớp xử lý thông minh nằm bên trong workflow nghiệp vụ.

==================================================
I. KIẾN TRÚC ĐIỀU HƯỚNG
==================================================

Thiết kế desktop web application.

SIDEBAR:

1. Đoạn chat mới
2. Công việc của tôi
3. Nhận đơn
4. Thư viện pháp luật
5. Báo cáo thông minh

Bên dưới:
- Lịch sử chat

Giữ sidebar cố định.

“Công việc của tôi” là workspace trung tâm của cán bộ.

“Nhận đơn” là nơi tiếp nhận/tạo lượt nhận.

==================================================
II. MODULE 1 – NHẬN ĐƠN
==================================================

Khi click “Nhận đơn”:

Mở màn:

“TIẾP NHẬN LƯỢT NHẬN”

Đây là nơi Văn thư/cán bộ tạo một lượt nhận mới.

Không sử dụng Kanban ở màn hình này.

--------------------------------------------------
MÀN DANH SÁCH
--------------------------------------------------

Header:

Tiếp nhận lượt nhận

Button:

[+ Thêm lượt nhận]

Search:

“Tìm theo mã lượt nhận, người nộp đơn, nội dung…”

Filter:

- Thời gian
- Hình thức nhận
- Trạng thái
- Đơn vị tiếp nhận

Table:

Mã lượt nhận
Ngày nhận
Người nộp đơn
Hình thức
Nội dung chính
Đơn vị tiếp nhận
Trạng thái
Thao tác

Ví dụ:

LN-19/2026-GOVEX_HC
15/09/2026
Nguyễn Văn A
Trực tiếp
Khiếu nại về...
Phòng Hành chính - Tổng hợp
Mới nhận

--------------------------------------------------
THÊM LƯỢT NHẬN
--------------------------------------------------

Khi click:

[+ Thêm lượt nhận]

Mở màn hình:

“TIẾP NHẬN LƯỢT NHẬN MỚI”

Chia form thành các nhóm rõ ràng:

A. THÔNG TIN TIẾP NHẬN

- Mã lượt nhận – tự sinh
- Ngày nhận
- Hình thức nhận
- Đơn vị tiếp nhận
- Người tiếp nhận

B. NGƯỜI NỘP ĐƠN

- Tư cách người nộp
- Họ tên
- Số điện thoại
- Địa chỉ
- CCCD/Mã định danh nếu có

C. THÔNG TIN ĐƠN

- Ngày làm đơn
- Tên đơn
- Nội dung
- Tài liệu đính kèm

Dùng upload area rõ ràng cho PDF/DOCX/image.

--------------------------------------------------
ACTION
--------------------------------------------------

Bottom action bar:

[Hủy]
[Lưu nháp]
[CHUYỂN TIẾP]

Đây là điểm kích hoạt AI.

==================================================
III. QUY TẮC QUAN TRỌNG: AI CHỈ BẮT ĐẦU SAU “CHUYỂN TIẾP”
==================================================

Khi người dùng click:

“CHUYỂN TIẾP”

hệ thống:

1. Validate dữ liệu bắt buộc
2. Lưu lượt nhận
3. Tạo mã lượt nhận
4. Chuyển lượt nhận đến workflow
5. TỰ ĐỘNG KÍCH HOẠT AI

Không yêu cầu người dùng click thêm:
“Phân tích bằng AI”.

Hiển thị confirmation/toast:

“Đã chuyển lượt nhận thành công.”

Bên dưới:

“AI đang tự động phân tích đơn. Bạn có thể theo dõi tiến trình tại Công việc của tôi.”

Sau đó:

→ chuyển người dùng về “Công việc của tôi”.

==================================================
IV. AI PROCESSING ENGINE
==================================================

Ngay sau “Chuyển tiếp”, AI chạy background.

Thiết kế trạng thái AI rõ ràng.

AI thực hiện:

01. Đọc tài liệu
02. OCR nếu tài liệu scan
03. Bóc tách thông tin
04. Xác định người gửi
05. Xác định đối tượng
06. Xác định sự việc
07. Tìm lịch sử người gửi
08. Tìm đơn liên quan
09. Tìm vụ việc liên quan
10. Phân tích quan hệ giữa các đối tượng
11. Phân tích độ tương đồng
12. Phát hiện khả năng trùng
13. Phát hiện thông tin thiếu/mâu thuẫn
14. Tạo tóm tắt nghiệp vụ
15. Đề xuất phân loại
16. Đề xuất hướng xử lý
17. Đối chiếu Rule / Kho tri thức
18. Chuẩn bị bằng chứng và nguồn

AI phải thể hiện tiến trình từng bước.

Trạng thái:

✓ Hoàn thành
● Đang xử lý
○ Chưa thực hiện

Không chỉ hiển thị spinner.

Phải hiển thị AI đang làm gì.

==================================================
V. MODULE 2 – CÔNG VIỆC CỦA TÔI
==================================================

Thiết kế lại màn “Công việc của tôi” thành WORKSPACE của cán bộ.

Mục tiêu:

Khi cán bộ đăng nhập hoặc mở màn này, họ phải biết:

- Hôm nay tôi cần làm gì?
- Có công việc nào mới?
- Có lượt nhận nào vừa được chuyển đến?
- AI đang xử lý những gì?
- Công việc nào cần tôi kiểm tra?
- Công việc nào quá hạn?
- Tôi đang chờ ai?
- Ai đang chờ tôi?

--------------------------------------------------
HEADER
--------------------------------------------------

Công việc của tôi

Hiển thị:

Hôm nay
16/09/2026

Tổng công việc:
12

Cần xử lý:
5

Đang chờ:
4

Quá hạn:
1

AI đang xử lý:
3

--------------------------------------------------
KANBAN
--------------------------------------------------

Giữ Kanban làm cấu trúc chính.

Các cột:

1. HÀNG ĐỢI TIẾP NHẬN
2. CẦN THẨM ĐỊNH & XỬ LÝ
3. CHỜ PHỐI HỢP LIÊN NGÀNH
4. CHỜ KÝ & TRẢ KẾT QUẢ

Không tạo cột riêng cho AI.

AI là lớp xử lý nằm trong từng công việc.

==================================================
VI. CARD LƯỢT NHẬN
==================================================

Trong “Hàng đợi tiếp nhận”, khi một lượt nhận vừa được chuyển:

Hiển thị card:

[LƯỢT NHẬN]

Đơn lượt nhận LN-19/2026-GOVEX_HC

Nguyễn Văn A
15/09/2026

AI đang phân tích

7/18 bước

Đang tìm vụ việc liên quan...

[Xem chi tiết]

Card phải rất gọn.

Không đưa toàn bộ nội dung đơn lên card.

==================================================
VII. CÁC TRẠNG THÁI CARD KHI AI ĐANG CHẠY
==================================================

Prototype phải mô phỏng được nhiều trạng thái:

STATE 1
AI đang đọc tài liệu
1/18 bước

STATE 2
AI đang bóc tách thông tin
3/18 bước

STATE 3
AI đang xác định người gửi
5/18 bước

STATE 4
AI đang tìm lịch sử
7/18 bước

STATE 5
AI đang tìm vụ việc liên quan
9/18 bước

STATE 6
AI đang phân tích tương đồng
11/18 bước

STATE 7
AI đang kiểm tra thông tin
13/18 bước

STATE 8
AI đang đề xuất hướng xử lý
16/18 bước

STATE 9
AI đã hoàn thành
18/18 bước

==================================================
VIII. XEM CHI TIẾT LƯỢT NHẬN
==================================================

Khi click:

[Xem chi tiết]

Mở:

“CHI TIẾT LƯỢT NHẬN”

Màn hình này phải thay đổi theo trạng thái AI.

--------------------------------------------------
KHI AI CHƯA HOÀN THÀNH
--------------------------------------------------

Header:

LƯỢT NHẬN
LN-19/2026-GOVEX_HC

Badge:

AI ĐANG PHÂN TÍCH

Tạo khu vực nổi bật:

“AI ĐANG LÀM GÌ?”

Ví dụ:

✓ Đã đọc tài liệu
✓ Đã bóc tách thông tin
✓ Đã xác định người gửi
✓ Đã tìm lịch sử
● Đang tìm vụ việc liên quan
○ Phân tích tương đồng
○ Kiểm tra thông tin
○ Tạo tóm tắt
○ Đề xuất hướng xử lý

Progress:

9/18 bước

Hiển thị text:

“AI đang tìm các vụ việc có liên quan đến người gửi, Công ty ABC, Dự án X và nội dung trong đơn.”

--------------------------------------------------
KẾT QUẢ ĐÃ CÓ
--------------------------------------------------

Quan trọng:

AI không cần hoàn thành toàn bộ mới hiển thị kết quả.

Nếu đã bóc tách được:

NGƯỜI GỬI
Nguyễn Văn A
92% khớp

ĐỐI TƯỢNG
Công ty ABC

SỰ VIỆC
...

NỘI DUNG CHÍNH
...

Các phần chưa hoàn thành:

“Đang phân tích...”

==================================================
IX. AI ĐÃ PHÂN TÍCH ĐƯỢC GÌ
==================================================

Khi AI hoàn thành:

Hiển thị:

AI ĐÃ PHÂN TÍCH

1. Người gửi
2. Nội dung
3. Đối tượng
4. Sự việc
5. Yêu cầu
6. Lịch sử
7. Đơn liên quan
8. Vụ việc liên quan
9. Tương đồng
10. Khả năng trùng
11. Thông tin thiếu/mâu thuẫn
12. Đề xuất

==================================================
X. BÀN PHÂN TÍCH AI
==================================================

Thiết kế detail workspace theo 3 vùng:

LEFT:
Tài liệu gốc

CENTER:
AI phân tích

RIGHT:
Tra cứu & quan hệ liên quan

LEFT:

PDF viewer
Highlight source text

CENTER:

Người gửi
Nội dung
Đối tượng
Sự việc
Yêu cầu
Tóm tắt nghiệp vụ

RIGHT:

Lịch sử người gửi
Đơn liên quan
Vụ việc liên quan
Tương đồng
Trùng đơn
Thông tin cần kiểm tra

==================================================
XI. AI TÌM QUAN HỆ
==================================================

Không chỉ hiển thị:

“3 đơn liên quan”.

Phải thể hiện:

ĐƠN HIỆN TẠI

↓

Nguyễn Văn A
→ 2 lượt gửi trước

↓

Công ty ABC
→ 3 đơn liên quan

↓

Dự án X
→ 2 đơn liên quan

↓

Vụ việc Y
→ 1 vụ việc liên quan

↓

86% tương đồng

Các node có thể click.

==================================================
XII. AI PHÁT HIỆN TRÙNG
==================================================

Hiển thị:

“CÓ KHẢ NĂNG TRÙNG”

84%

Với:

LN-08/2026

Lý do:

✓ Cùng người gửi
✓ Cùng đối tượng
✓ Cùng sự việc
✓ Nội dung tương đồng

Không tự động kết luận.

Cán bộ quyết định.

==================================================
XIII. THÔNG TIN CẦN KIỂM TRA
==================================================

Hiển thị:

⚠ Chưa có số điện thoại
⚠ Tên cơ quan khác với dữ liệu lịch sử
⚠ Chưa xác định rõ thời điểm xảy ra sự việc

Actions:

[Xem nguồn]
[Bổ sung]
[Đánh dấu đã kiểm tra]

==================================================
XIV. AI ĐỀ XUẤT
==================================================

Hiển thị:

AI ĐỀ XUẤT

Phân loại:
“Khiếu nại”

Độ tin cậy:
78%

Hướng xử lý:
“Tiếp nhận và chuyển thẩm định”

Lý do:

- Nội dung thể hiện...
- Yêu cầu của người gửi...
- Dữ liệu lịch sử...
- Đơn tương tự...

Tách riêng:

AI PHÂN TÍCH

và

RULE / TRI THỨC NGHIỆP VỤ

Hiển thị rõ:

“AI chỉ đưa ra đề xuất.
Cán bộ quyết định kết quả cuối cùng.”

==================================================
XV. TRACEABILITY
==================================================

Mọi kết quả AI đều phải có:

[Xem nguồn]

Ví dụ:

“2 lượt gửi trước”
→ mở 2 lượt.

“3 đơn liên quan”
→ mở 3 đơn.

“1 vụ việc liên quan”
→ mở vụ việc.

“86% tương đồng”
→ mở màn hình so sánh.

“Người gửi khớp 92%”
→ hiển thị các yếu tố khớp.

“AI đề xuất khiếu nại”
→ hiển thị dữ liệu + nguồn + Rule.

==================================================
XVI. XÁC NHẬN CỦA CÁN BỘ
==================================================

Khi AI hoàn thành:

Bottom action bar:

[Quay lại]

[Chỉnh sửa kết quả AI]

[Xem nguồn]

[Xác nhận & tiếp nhận]

Khi click:

“Xác nhận & tiếp nhận”

→ tạo ĐƠN TIẾP NHẬN.

==================================================
XVII. ĐƠN TIẾP NHẬN
==================================================

Sau xác nhận:

Hiển thị:

ĐƠN TIẾP NHẬN

Mã:
DN-19/2026-GOVEX

Các trường được AI tự động điền:

- Loại đơn
- Người gửi
- Đối tượng
- Nội dung
- Yêu cầu
- Quan hệ pháp luật
- Đơn vị tiếp nhận
- Ngày làm đơn
- Ngày tiếp nhận

Tất cả đều có thể chỉnh sửa.

Hiển thị:

“Các thông tin trên được AI đề xuất và đã được cán bộ xác nhận.”

==================================================
XVIII. QUAY LẠI CÔNG VIỆC CỦA TÔI
==================================================

Sau khi xác nhận:

Đơn chuyển sang:

“CẦN THẨM ĐỊNH & XỬ LÝ”

Card:

[ĐƠN TIẾP NHẬN]

DN-19/2026-GOVEX

Phân loại đơn

[Phân loại]

AI status:

“AI đã hoàn thành phân tích”

==================================================
XIX. CÁC TRẠNG THÁI CẦN THỂ HIỆN
==================================================

Prototype phải có đầy đủ các trạng thái:

Lượt nhận mới
AI đang phân tích
AI phân tích một phần
AI đã phân tích xong
Cần cán bộ kiểm tra
Cần cán bộ xác nhận
Đã tạo đơn tiếp nhận
Đang thẩm định
Đang xử lý
Chờ phối hợp
Chờ ký
Đã hoàn thành

==================================================
XX. THIẾT KẾ UX TỔNG THỂ
==================================================

Giao diện:

- Government enterprise
- Legal case management
- Modern
- Clean
- Professional
- High information clarity
- Desktop-first
- Responsive

Không sử dụng giao diện AI futuristic quá mức.

Không lạm dụng gradient, glow, animation.

AI phải được thể hiện bằng:
- trạng thái
- progress
- insight
- evidence
- recommendation
- relationship
- source

Không biến hệ thống thành chatbot.

==================================================
XXI. TRIẾT LÝ THIẾT KẾ
==================================================

Hệ thống phải tạo ra cảm giác:

“Cán bộ giao việc cho hệ thống.
Hệ thống tự động làm phần việc phân tích.
Cán bộ quay lại xem hệ thống đã làm được gì.
Cán bộ kiểm tra và quyết định.”

Không phải:

“Cán bộ phải tự bấm từng chức năng AI.”

FLOW CUỐI CÙNG:

NHẬN ĐƠN
↓
TIẾP NHẬN LƯỢT NHẬN
↓
NHẬP THÔNG TIN + TÀI LIỆU
↓
CHUYỂN TIẾP
↓
AI TỰ ĐỘNG PHÂN TÍCH
↓
CÔNG VIỆC CỦA TÔI
↓
LƯỢT NHẬN
↓
AI ĐANG LÀM GÌ?
↓
AI ĐÃ PHÂN TÍCH ĐƯỢC GÌ?
↓
TRA CỨU LỊCH SỬ
↓
TÌM ĐƠN/VỤ VIỆC LIÊN QUAN
↓
PHÂN TÍCH TƯƠNG ĐỒNG
↓
PHÁT HIỆN TRÙNG
↓
KIỂM TRA THIẾU/MÂU THUẪN
↓
TÓM TẮT
↓
AI ĐỀ XUẤT
↓
RULE / TRI THỨC KIỂM TRA
↓
CÁN BỘ XEM NGUỒN
↓
CHỈNH SỬA
↓
XÁC NHẬN
↓
ĐƠN TIẾP NHẬN
↓
CẦN THẨM ĐỊNH & XỬ LÝ
↓
CÁC BƯỚC XỬ LÝ TIẾP THEO.

Hãy thiết kế thành một prototype hoàn chỉnh, các màn hình phải liên kết với nhau và có dữ liệu demo nhất quán xuyên suốt flow.