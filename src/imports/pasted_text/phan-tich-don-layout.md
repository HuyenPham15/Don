CHỈNH LẠI MÀN “BÀN PHÂN TÍCH ĐƠN” THÀNH LAYOUT 2 CỘT DUY NHẤT.

MỤC TIÊU:
Màn hình phải cực kỳ rõ ràng, tối giản và tập trung vào giá trị AI.

CHỈ CÓ 2 CỘT:

CỘT TRÁI = TÀI LIỆU GỐC
CỘT PHẢI = AI PHÂN TÍCH

Không tạo cột thứ 3.
Không tạo sidebar riêng cho đề xuất.
Không hiển thị pipeline kỹ thuật như OCR, Entity Resolution, Embedding, RAG...
Không hiển thị AI đang làm gì.
Người dùng chỉ cần nhìn thấy AI đã hiểu gì, tìm thấy gì, đề xuất gì và cán bộ cần xác nhận gì.

--------------------------------------------------
CỘT TRÁI – TÀI LIỆU GỐC
--------------------------------------------------

Chiếm khoảng 38–40% màn hình.

Header:

TÀI LIỆU GỐC
Đơn khiếu nại_NVA.pdf

Hiển thị PDF viewer lớn, dễ đọc.

Có:
- zoom
- số trang
- tìm kiếm
- download

Khi AI trích xuất thông tin từ tài liệu, nút [Xem nguồn] bên cột AI sẽ đưa PDF đến đúng trang và highlight đoạn thông tin tương ứng.

Ví dụ:

Người gửi: Nguyễn Văn A
→ [Xem nguồn]

Loại đơn: Khiếu nại
→ [Xem nguồn]

Yêu cầu: Xem xét lại mức bồi thường
→ [Xem nguồn]

--------------------------------------------------
CỘT PHẢI – AI PHÂN TÍCH
--------------------------------------------------

Chiếm khoảng 60–62%.

Header:

AI PHÂN TÍCH

LN-19/2026-GOVEX_HC

Badge:
✓ Đã hoàn thành

Không hiển thị các bước AI kỹ thuật.

--------------------------------------------------
SECTION 1 – AI ĐÃ HIỂU ĐƠN
--------------------------------------------------

Card:

AI ĐÃ HIỂU ĐƠN

Loại đơn
Khiếu nại · 82%

Người gửi
Nguyễn Văn A · 92%

Đối tượng liên quan
Công ty TNHH Xây dựng ABC

Cơ quan liên quan
UBND tỉnh XYZ

Sự việc
Khiếu nại về mức bồi thường GPMB

Địa điểm
Dự án Khu dân cư X

Yêu cầu
Xem xét lại mức bồi thường theo QĐ 45/2024/QĐ-UBND

Mỗi trường quan trọng có:

[Xem nguồn ↗]

Thông tin được trình bày dạng 2 cột label/value hoặc các row rõ ràng.
Không dùng card quá nhiều gây rối.

--------------------------------------------------
SECTION 2 – AI TÌM THẤY
--------------------------------------------------

Card:

AI TÌM THẤY

Lịch sử người gửi
02 lượt nhận trước đây

Đơn liên quan
03 đơn liên quan

Vụ việc liên quan
01 vụ việc

Nội dung tương đồng
86%

Khả năng trùng
84% với LN-08/2026

Hiển thị ngắn gọn.

Mỗi kết quả có nút:

[Xem hồ sơ]
[Xem chi tiết]

Không hiển thị toàn bộ lịch sử trên màn chính.

Click vào sẽ mở drawer chi tiết.

Ví dụ click “02 lượt nhận trước đây”:

LỊCH SỬ NGƯỜI GỬI

LN-08/2026
12/03/2026
Bồi thường GPMB

LN-03/2024
05/01/2024
Dự án Khu dân cư X

[Xem toàn bộ]

--------------------------------------------------
SECTION 3 – THÔNG TIN CẦN XÁC MINH
--------------------------------------------------

Card:

THÔNG TIN CẦN XÁC MINH · 3

⚠ Chưa có số điện thoại người nộp đơn
[Bổ sung]

⚠ Tên tổ chức khác dữ liệu lịch sử
TNHH Xây dựng ABC
vs
CP Xây dựng ABC
[Xem dữ liệu]

⚠ Chưa xác định rõ cơ quan có thẩm quyền
[Xem căn cứ]

Không gọi section này là “AI phát hiện”.
Chỉ cần “Thông tin cần xác minh”.

--------------------------------------------------
SECTION 4 – AI ĐỀ XUẤT HƯỚNG XỬ LÝ
--------------------------------------------------

Đây là section QUAN TRỌNG NHẤT.

Card lớn:

AI ĐỀ XUẤT HƯỚNG XỬ LÝ

Loại đơn:
Khiếu nại · 82%

Quy trình áp dụng:
Quy trình xử lý đơn Khiếu nại · QT-03

Bước hiện tại:
01 · Kiểm tra điều kiện tiếp nhận

--------------------------------

ĐỐI CHIẾU ĐIỀU KIỆN

4/5 điều kiện đạt

✓ Có người gửi
✓ Có nội dung khiếu nại
✓ Có yêu cầu cụ thể
✓ Xác định được đối tượng liên quan

⚠ Chưa có quyết định/hành vi bị khiếu nại

--------------------------------

ĐỀ XUẤT

Bổ sung thông tin về quyết định/hành vi bị khiếu nại trước khi chuyển sang bước tiếp theo.

--------------------------------

CƠ SỞ ĐỀ XUẤT

AI phân tích:
Loại đơn được xác định là Khiếu nại · 82%

Quy trình:
QT-03 · Quy trình xử lý đơn Khiếu nại

Rule:
Kiểm tra đầy đủ thông tin trước khi chuyển bước

Dữ liệu:
01 đơn + 02 tài liệu + dữ liệu hệ thống

Các link nhỏ:

[Xem AI]
[Xem quy trình]
[Xem Rule]
[Xem nguồn]

--------------------------------------------------
SECTION 5 – XÁC NHẬN CỦA CÁN BỘ
--------------------------------------------------

Ngay dưới AI đề xuất:

XÁC NHẬN CỦA CÁN BỘ

Hướng xử lý:
Khiếu nại

Quy trình:
QT-03 · Quy trình xử lý đơn Khiếu nại

Bước tiếp theo:
Kiểm tra điều kiện tiếp nhận

Text nhỏ:

“AI chỉ đưa ra đề xuất. Cán bộ kiểm tra và xác nhận trước khi chuyển vào quy trình.”

Buttons:

[Chỉnh sửa]
[Không đồng ý]

Primary:

[XÁC NHẬN & CHUYỂN QUY TRÌNH →]

--------------------------------------------------
SAU KHI CÁN BỘ XÁC NHẬN
--------------------------------------------------

Khi click:

[XÁC NHẬN & CHUYỂN QUY TRÌNH]

Không mở lại màn AI.

Thay section cuối bằng:

✓ ĐÃ XÁC NHẬN HƯỚNG XỬ LÝ

Đơn đã được chuyển vào:

QT-03 · Quy trình xử lý đơn Khiếu nại

Bước hiện tại:

02 · Kiểm tra điều kiện tiếp nhận

--------------------------------

CÔNG VIỆC TIẾP THEO

Kiểm tra điều kiện tiếp nhận

Cần thực hiện:
Kiểm tra quyết định/hành vi bị khiếu nại

Người thực hiện:
Cán bộ tiếp nhận

Hạn:
18/09/2026

[XỬ LÝ CÔNG VIỆC →]

--------------------------------------------------
NGUYÊN TẮC UX
--------------------------------------------------

Màn hình phải đọc được theo thứ tự:

1. Tài liệu gốc
2. AI đã hiểu đơn gì
3. AI tìm thấy thông tin liên quan gì
4. Có vấn đề gì cần xác minh
5. AI đề xuất hướng xử lý nào
6. Dựa trên căn cứ nào
7. Cán bộ xác nhận
8. Sau xác nhận → hệ thống chạy quy trình

Không hiển thị:
- OCR
- Entity Resolution
- Embedding
- RAG
- AI pipeline
- AI đang làm gì
- số bước AI
- thuật ngữ kỹ thuật

Đây là màn hình nghiệp vụ, không phải màn hình debug AI.

PHONG CÁCH:
- Government enterprise
- Legal workflow
- Clean
- Professional
- Minimal
- Typography rõ
- Border nhẹ
- Không gradient
- Không neon
- Không robot
- Không futuristic AI effect

ƯU TIÊN INFORMATION HIERARCHY.

Cột phải có thể scroll độc lập.
Cột trái PDF có thể scroll độc lập.

Giữ header hiện tại và sidebar GOVEX.