THIẾT KẾ LẠI TOÀN BỘ FLOW “AI XỬ LÝ ĐƠN” CỦA GOVEX.

MỤC TIÊU QUAN TRỌNG NHẤT:

Tôi muốn người dùng nhìn vào prototype và ngay lập tức hiểu:

GOVEX KHÔNG CHỈ LÀ HỆ THỐNG NHẬN ĐƠN.

Khi một đơn được chuyển vào hệ thống, AI sẽ tự động làm 5 việc:

1. ĐỌC VÀ BÓC TÁCH ĐƠN
2. TÌM NGƯỜI / TỔ CHỨC TRONG DỮ LIỆU HIỆN CÓ
3. TÌM ĐƠN VÀ VỤ VIỆC CÓ LIÊN QUAN
4. TẠO TÓM TẮT NGHIỆP VỤ
5. GỢI Ý HƯỚNG XỬ LÝ

Sau đó:

AI phân tích
→ AI tìm kiếm và liên kết dữ liệu
→ AI tổng hợp
→ Rule / Knowledge kiểm tra
→ Cán bộ xem bằng chứng
→ Cán bộ quyết định.

AI KHÔNG tự quyết định nghiệp vụ cuối cùng.

==================================================
1. FLOW TỔNG THỂ
==================================================

Thiết kế prototype hoàn chỉnh theo flow:

NHẬN ĐƠN
↓
TIẾP NHẬN LƯỢT NHẬN
↓
CÁN BỘ NHẬP THÔNG TIN BAN ĐẦU + TẢI TÀI LIỆU
↓
[CHUYỂN TIẾP]
↓
AI TỰ ĐỘNG BẮT ĐẦU PHÂN TÍCH
↓
CÔNG VIỆC CỦA TÔI
↓
LƯỢT NHẬN ĐƯỢC CHUYỂN ĐẾN
↓
AI ĐANG PHÂN TÍCH / AI ĐÃ PHÂN TÍCH XONG
↓
XEM CHI TIẾT
↓
BÀN PHÂN TÍCH ĐƠN
↓
CÁN BỘ XEM KẾT QUẢ AI
↓
XEM NGUỒN / XEM BẰNG CHỨNG
↓
CHỈNH SỬA NẾU CẦN
↓
XEM RULE / KNOWLEDGE
↓
XÁC NHẬN
↓
TẠO ĐƠN TIẾP NHẬN
↓
TIẾP TỤC CÔNG VIỆC.

==================================================
2. ĐIỂM KÍCH HOẠT AI
==================================================

Ở màn “Tiếp nhận lượt nhận”:

Cán bộ chỉ nhập những thông tin tối thiểu cần thiết:

- Ngày nhận
- Hình thức nhận
- Người nộp đơn
- Thông tin nhận diện nếu có
- Nội dung ban đầu nếu có
- Tài liệu / file đơn

Không thiết kế form 30–40 trường.

Cuối màn hình:

[ LƯU NHÁP ]     [ CHUYỂN TIẾP ]

Khi click “CHUYỂN TIẾP”:

Hệ thống:

✓ Lưu lượt nhận
✓ Chuyển lượt nhận đến người/đơn vị xử lý
✓ Tự động kích hoạt AI

Hiển thị:

“Đã chuyển lượt nhận.”

“AI đang tự động phân tích đơn.
Bạn có thể theo dõi kết quả tại Công việc của tôi.”

Không có nút:
“Phân tích AI”

vì AI đã tự động chạy.

==================================================
3. CÔNG VIỆC CỦA TÔI
==================================================

Giữ màn “Công việc của tôi” làm workspace trung tâm.

Kanban:

HÀNG ĐỢI TIẾP NHẬN
CẦN THẨM ĐỊNH & XỬ LÝ
<!-- CHỜ PHỐI HỢP LIÊN NGÀNH -->
CHỜ KÝ & TRẢ KẾT QUẢ

Không tạo cột riêng cho AI.

AI là một lớp xử lý nằm trong công việc.

Khi lượt nhận vừa được chuyển đến:

Card:

[LƯỢT NHẬN]

LN-19/2026-GOVEX_HC

Nguyễn Văn A

AI ĐANG PHÂN TÍCH

“Đang tìm đơn/vụ việc liên quan...”

Tiến độ:
3/5 nhóm phân tích

[Xem chi tiết]

==================================================
4. TRẠNG THÁI AI
==================================================

AI không được thể hiện chỉ bằng:

“Loading...”

Phải thể hiện AI đang làm gì và đã tìm được gì.

Thiết kế progress theo 5 nhiệm vụ nghiệp vụ:

01
ĐỌC & BÓC TÁCH ĐƠN

02
TÌM NGƯỜI / TỔ CHỨC

03
TÌM ĐƠN / VỤ VIỆC LIÊN QUAN

04
TÓM TẮT NGHIỆP VỤ

05
GỢI Ý HƯỚNG XỬ LÝ

Mỗi nhiệm vụ có:

○ Chưa thực hiện
● Đang xử lý
✓ Hoàn thành

Khi một nhiệm vụ hoàn thành, ngay lập tức hiển thị kết quả của nhiệm vụ đó.

==================================================
5. MÀN HÌNH “BÀN PHÂN TÍCH ĐƠN”
==================================================

Đây là màn hình quan trọng nhất của sản phẩm.

Không thiết kế như chatbot.

Thiết kế như một:

“AI WORKSPACE / BÀN PHÂN TÍCH ĐƠN”

Màn hình gồm 3 khu vực:

LEFT:
TÀI LIỆU GỐC

CENTER:
AI HIỂU & PHÂN TÍCH

RIGHT:
AI TRA CỨU & TÌM QUAN HỆ

==================================================
6. AI JOB 01 – ĐỌC VÀ BÓC TÁCH ĐƠN
==================================================

Khu vực CENTER:

Tiêu đề:

“01 · AI ĐÃ HIỂU ĐƠN”

Hiển thị những gì AI bóc tách được:

NGƯỜI GỬI
Nguyễn Văn A
✓

NGƯỜI / TỔ CHỨC BỊ PHẢN ÁNH
Công ty TNHH Xây dựng ABC

CƠ QUAN LIÊN QUAN
UBND tỉnh XYZ

ĐỊA ĐIỂM
Dự án Khu dân cư X

THỜI GIAN
10/09/2026

SỰ VIỆC
Khiếu nại về mức bồi thường GPMB

YÊU CẦU
Xem xét lại mức bồi thường

TÀI LIỆU KÈM THEO
02 tài liệu

Nếu là tài liệu scan:

Hiển thị:

✓ OCR đã thực hiện

Mỗi thông tin phải có:

[Xem nguồn]

Khi click:

→ highlight đoạn tương ứng trong tài liệu gốc.

==================================================
7. AI JOB 02 – TÌM NGƯỜI / TỔ CHỨC
==================================================

Tiêu đề:

“02 · AI ĐÃ TÌM THẤY”

Không chỉ tìm theo họ tên.

Thể hiện:

AI ENTITY RESOLUTION

Nguyễn Văn A

92% khớp

Đối chiếu:

✓ Họ tên
✓ CCCD
✓ Số điện thoại
✓ Địa chỉ
✓ Ngày sinh nếu có

Kết quả:

“Đã xác định người gửi có khả năng trùng với hồ sơ Nguyễn Văn A.”

Bên dưới:

LỊCH SỬ NGƯỜI GỬI

02 lượt nhận trước

LN-08/2026
12/03/2026

LN-03/2024
05/01/2024

Hiển thị:

“Đã từng gửi đến:
UBND tỉnh XYZ
Phòng X”

Và:

“Các nội dung trước đây liên quan:
- Bồi thường GPMB
- Dự án Khu dân cư X”

Actions:

[Xem hồ sơ]
[Xem 2 lượt nhận]

==================================================
8. AI JOB 03 – TÌM ĐƠN / VỤ VIỆC LIÊN QUAN
==================================================

ĐÂY LÀ KHU VỰC QUAN TRỌNG NHẤT CỦA AI.

Tiêu đề:

“03 · AI TÌM THẤY QUAN HỆ LIÊN QUAN”

Không chỉ hiển thị số lượng.

Hệ thống phải thể hiện AI đã tìm kiếm dựa trên:

CON NGƯỜI
+
TỔ CHỨC
+
ĐỊA ĐIỂM
+
NỘI DUNG
+
SỰ KIỆN
+
TỪ KHÓA
+
NGỮ NGHĨA

Ví dụ:

ĐƠN HIỆN TẠI
↓
Nguyễn Văn A
↓
Công ty ABC
↓
Dự án Khu dân cư X
↓
Khiếu nại bồi thường GPMB

AI phát hiện:

03 đơn liên quan Công ty ABC

01 đơn liên quan cùng Dự án X

01 vụ việc đang xử lý tại Đơn vị Y

86% tương đồng nội dung

Hiển thị relationship map đơn giản:

              ĐƠN HIỆN TẠI
                    │
        ┌───────────┼───────────┐
        ↓           ↓           ↓
   NGUYỄN VĂN A  CÔNG TY ABC  DỰ ÁN X
        │           │           │
   2 đơn cũ      3 đơn liên quan 2 đơn
                    │
                    ↓
              VỤ VIỆC VV-04/2026
                    │
              86% tương đồng

Mỗi node click được.

==================================================
9. AI JOB 04 – TÓM TẮT NGHIỆP VỤ
==================================================

Tiêu đề:

“04 · AI TÓM TẮT NGHIỆP VỤ”

KHÔNG tạo summary văn chương.

Phải có cấu trúc:

NGƯỜI GỬI

Nguyễn Văn A

NỘI DUNG CHÍNH

Phản ánh/khiếu nại về mức bồi thường GPMB...

ĐỐI TƯỢNG LIÊN QUAN

- Công ty TNHH Xây dựng ABC
- Dự án Khu dân cư X

SỰ VIỆC

...

YÊU CẦU CỦA NGƯỜI GỬI

Xem xét lại mức bồi thường...

KẾT QUẢ TRA CỨU

- 02 lượt gửi trước
- 03 đơn liên quan
- 01 vụ việc liên quan
- 01 đơn tương đồng 86%

Hiển thị:

“AI tổng hợp từ 01 đơn + 02 tài liệu + dữ liệu liên quan trong hệ thống.”

[Xem nguồn]

==================================================
10. AI JOB 05 – GỢI Ý HƯỚNG XỬ LÝ
==================================================

Tiêu đề:

“05 · AI ĐỀ XUẤT”

Hiển thị:

PHÂN LOẠI ĐỀ XUẤT

KHIẾU NẠI

78% tin cậy

HƯỚNG XỬ LÝ ĐỀ XUẤT

“Tiếp nhận và chuyển thẩm định”

CÁC PHÁT HIỆN LIÊN QUAN

⚠ Có khả năng trùng với LN-08/2026

⚠ Cần kiểm tra thông tin cơ quan liên quan

💡 Có vụ việc tương tự VV-04/2026

==================================================
11. TÁCH AI VÀ RULE / KNOWLEDGE
==================================================

ĐÂY LÀ YÊU CẦU BẮT BUỘC.

Không để LLM tự suy luận toàn bộ quy trình nghiệp vụ.

Thiết kế khu vực:

“CƠ SỞ CỦA ĐỀ XUẤT”

Tách thành 2 nguồn:

----------------------------

AI PHÂN TÍCH

AI nhận diện:

- Nội dung thể hiện khiếu nại
- Người gửi có lịch sử liên quan
- Có đơn tương tự
- Có vụ việc liên quan
- Có dấu hiệu trùng

----------------------------

RULE / KNOWLEDGE NGHIỆP VỤ

Hiển thị:

Điều kiện nghiệp vụ
Quy trình áp dụng
Căn cứ pháp lý
Quy tắc xử lý

Ví dụ:

“Nếu đơn đã được giải quyết và không phát sinh tình tiết mới → áp dụng Rule X.”

Hiển thị:

[Xem Rule]
[Xem căn cứ]

Sau đó:

AI ĐỀ XUẤT

“Đề nghị cán bộ kiểm tra khả năng trùng trước khi phân loại.”

Thông điệp:

“AI đề xuất – cán bộ quyết định.”

==================================================
12. MISSING / CONFLICT INFORMATION
==================================================

Tạo một khu vực:

“AI PHÁT HIỆN CẦN KIỂM TRA”

Ví dụ:

⚠ Chưa có số điện thoại người gửi

⚠ Tên tổ chức trong đơn khác dữ liệu lịch sử

⚠ Chưa xác định rõ cơ quan có thẩm quyền

Mỗi cảnh báo:

[Xem nguồn]
[Bổ sung]
[Đánh dấu đã kiểm tra]

==================================================
13. TRACEABILITY – BẮT BUỘC
==================================================

Mọi kết quả AI phải truy ngược được về nguồn.

Ví dụ:

AI nói:

“Người gửi khớp 92%”

→ [Xem bằng chứng]

AI nói:

“Đã có 02 đơn trước”

→ [Xem 02 đơn]

AI nói:

“03 đơn liên quan”

→ [Xem 03 đơn]

AI nói:

“86% tương đồng”

→ [Xem điểm tương đồng]

AI tóm tắt:

→ [Xem đoạn tài liệu nguồn]

AI đề xuất:

→ [Xem dữ liệu sử dụng]
→ [Xem Rule]
→ [Xem căn cứ]

Không được có AI output quan trọng nào không có nguồn hoặc lý do.

==================================================
14. KHI AI CHƯA PHÂN TÍCH XONG
==================================================

Nếu người dùng mở lượt nhận trong lúc AI đang chạy:

Không hiển thị:

“Đang xử lý...”

Thay vào đó:

AI ĐANG PHÂN TÍCH

03 / 05 nhiệm vụ

✓ Đã đọc & bóc tách
✓ Đã tìm người gửi
● Đang tìm đơn/vụ việc liên quan
○ Tóm tắt nghiệp vụ
○ Gợi ý hướng xử lý

Bên dưới vẫn hiển thị kết quả đã có:

NGƯỜI GỬI
Nguyễn Văn A
92% khớp

LỊCH SỬ
02 lượt nhận trước

ĐƠN LIÊN QUAN
Đang tìm...

Điều này phải tạo cảm giác:

“AI đang làm việc ngay lúc này.”

==================================================
15. KHI AI HOÀN THÀNH
==================================================

Hiển thị:

✓ AI ĐÃ PHÂN TÍCH XONG

5/5 nhiệm vụ

Thời gian:
01 phút 24 giây

Tóm tắt kết quả ở đầu màn hình:

AI ĐÃ TÌM THẤY:

👤 01 người gửi đã xác định
📁 02 lượt gửi trước
🔗 03 đơn liên quan
⚖ 01 vụ việc liên quan
📊 01 nội dung tương đồng 86%
⚠ 02 vấn đề cần kiểm tra
💡 01 hướng xử lý được đề xuất

Đây phải là “AI INSIGHT SUMMARY”.

==================================================
16. HUMAN IN THE LOOP
==================================================

Cuối màn hình:

AI đã phân tích và đề xuất.

Cán bộ có quyền:

[Chỉnh sửa]
[Không đồng ý]
[Xem nguồn]
[Xem Rule]
[Xác nhận & tiếp nhận]

Không để AI tự động quyết định.

==================================================
17. SAU KHI XÁC NHẬN
==================================================

Tạo:

ĐƠN TIẾP NHẬN

Các trường được AI đề xuất tự động:

- Người gửi
- Loại đơn
- Đối tượng
- Nội dung
- Sự việc
- Yêu cầu
- Quan hệ pháp luật
- Đơn vị xử lý

Hiển thị:

“Thông tin được AI đề xuất và đã được cán bộ xác nhận.”

Sau đó đơn chuyển sang:

CẦN THẨM ĐỊNH & XỬ LÝ

==================================================
18. VISUAL DESIGN
==================================================

Giữ phong cách GOVEX hiện đại, chuyên nghiệp, phù hợp hệ thống hành chính/pháp lý.

Không dùng:
- giao diện AI futuristic
- quá nhiều gradient
- glow
- robot
- icon AI khắp nơi
- chatbot chiếm màn hình

Hãy làm AI trở nên rõ ràng bằng INFORMATION DESIGN:

AI UNDERSTANDING
AI SEARCH
ENTITY RESOLUTION
RELATION DISCOVERY
SEMANTIC SIMILARITY
INSIGHT
EVIDENCE
RULE / KNOWLEDGE
RECOMMENDATION
HUMAN DECISION

==================================================
19. THÔNG ĐIỆP SẢN PHẨM PHẢI THỂ HIỆN ĐƯỢC
==================================================

Thiết kế sao cho khi demo, người xem nhìn vào sẽ hiểu:

TRUYỀN THỐNG:

Nhận đơn
→ Nhập thông tin
→ Chuyển
→ Phân công
→ Xử lý

GOVEX:

Đưa đơn vào
↓
AI HIỂU ĐƠN
↓
AI TÌM NGƯỜI
↓
AI TÌM LỊCH SỬ
↓
AI TÌM ĐƠN / VỤ VIỆC LIÊN QUAN
↓
AI PHÁT HIỆN QUAN HỆ
↓
AI TÓM TẮT
↓
AI PHÁT HIỆN VẤN ĐỀ
↓
AI ĐỀ XUẤT
↓
RULE / KNOWLEDGE KIỂM TRA
↓
CÁN BỘ XEM BẰNG CHỨNG
↓
CÁN BỘ QUYẾT ĐỊNH

ĐÂY LÀ TRẢI NGHIỆM AI CẦN THỂ HIỆN.

Hãy tạo prototype với dữ liệu demo nhất quán, các màn hình có thể click qua lại và đặc biệt mô phỏng được cả 2 trạng thái:

1. AI ĐANG PHÂN TÍCH
2. AI ĐÃ PHÂN TÍCH XONG

ƯU TIÊN LÀM CHO “BÀN PHÂN TÍCH ĐƠN” TRỞ THÀNH MÀN HÌNH TRUNG TÂM THỂ HIỆN GIÁ TRỊ AI CỦA TOÀN BỘ SẢN PHẨM.