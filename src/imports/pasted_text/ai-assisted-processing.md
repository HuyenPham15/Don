Hãy redesign màn hình “AI hỗ trợ tiếp nhận và xử lý đơn” theo hướng nghiệp vụ rõ ràng, dễ kiểm tra, minh bạch nguồn căn cứ và không tạo cảm giác AI tự quyết định hướng xử lý.

Mục tiêu thiết kế:
- AI chỉ trích xuất, tóm tắt và diễn giải thông tin.
- Kết quả nghiệp vụ phải dựa trên dữ liệu hệ thống, Rule và Knowledge đã cấu hình.
- Người dùng phải nhìn thấy vì sao hệ thống đưa ra cảnh báo/gợi ý.
- Hướng xử lý cuối cùng do cán bộ lựa chọn.
- Giao diện desktop, chuyên nghiệp, phù hợp hệ thống nghiệp vụ hành chính.
- Giảm số lượng card và thông tin lặp lại.
- Ưu tiên bố cục đọc từ trên xuống: Nội dung đơn → Đối chiếu → Rule → Căn cứ → Gợi ý → Quyết định của cán bộ.

==================================================
1. HEADER – TRẠNG THÁI PHÂN TÍCH
==================================================

Header:
“AI hỗ trợ phân tích hồ sơ”

Nếu AI đang xử lý:
- Hiển thị trạng thái “Đang phân tích”
- Sub text: “Hệ thống đang trích xuất thông tin, đối chiếu dữ liệu và kiểm tra quy tắc nghiệp vụ.”
- Có progress theo các bước:
  1. Trích xuất thông tin
  2. Tra cứu dữ liệu hệ thống
  3. Kiểm tra Rule
  4. Tra cứu Knowledge
  5. Tổng hợp kết quả

Nếu không có progress thực tế, chỉ dùng loading indicator, không hiển thị % giả.

Khi hoàn thành:
- Hiển thị icon check màu xanh
- Text: “Phân tích hoàn thành”
- Sub text:
  “Vui lòng kiểm tra thông tin và căn cứ trước khi xác định hướng xử lý.”

==================================================
2. SECTION 1 – THÔNG TIN AI TRÍCH XUẤT
==================================================

Tiêu đề:
“1. Thông tin trích xuất từ hồ sơ”

Có nút:
[Chỉnh sửa]

AI chỉ trích xuất dữ liệu từ hồ sơ, không kết luận nghiệp vụ tại section này.

Hiển thị dạng read-only, chia 2 cột.

Dữ liệu mẫu:

Người gửi:
Ông A

Đối tượng liên quan:
Ông B

Số tiền:
2.000.000.000 đồng

Dự án:
Dự án X

Nội dung:
Ông A cho rằng ông B nhận 2 tỷ đồng để góp vốn dự án X nhưng sau đó không thực hiện cam kết và không hoàn trả tiền.

Tóm tắt AI:
“Ông A phản ánh việc ông B nhận 2 tỷ đồng để góp vốn vào dự án X nhưng không thực hiện cam kết và chưa hoàn trả tiền.”

Các thông tin AI chưa xác định được hiển thị:
“Chưa xác định”

Không hiển thị confidence % ở tất cả các trường.

Chỉ highlight những trường cần kiểm tra bằng badge:
“Cần kiểm tra”

Khi nhấn “Chỉnh sửa”:
- Chuyển dữ liệu thành form input
- Cho phép user sửa thông tin AI đã đọc
- Button:
  [Hủy]
  [Lưu thay đổi]

Sau khi user sửa:
- Hiển thị badge nhỏ “Đã chỉnh sửa”
- Không để AI tự ghi đè lại dữ liệu user đã xác nhận

==================================================
3. SECTION 2 – KẾT QUẢ ĐỐI CHIẾU HỆ THỐNG
==================================================

Tiêu đề:
“2. Kết quả đối chiếu trong hệ thống”

Không hiển thị dạng dashboard quá nhiều card lớn.

Dùng 3 summary item nằm ngang:

03
Đơn đã gửi trước

01
Đơn có nội dung liên quan

01
Vụ việc/Vụ án liên quan

Có action:
[Xem chi tiết]

Bên dưới hiển thị block:
“Đơn liên quan gần nhất”

D-2026-00341

Người gửi:
Ông A

Đối tượng:
Ông B

Dự án:
Dự án X

Trạng thái:
Đã tiếp nhận

Button:
[Mở đơn]
[So sánh]

==================================================
4. SECTION 3 – KẾT QUẢ KIỂM TRA RULE
==================================================

Tiêu đề:
“3. Kết quả kiểm tra nghiệp vụ”

Không sử dụng thuật ngữ kỹ thuật quá nặng với user.

Hiển thị một checklist:

✓ Người gửi đơn đã có trên hệ thống
✓ Chủ đề/nội dung đã xuất hiện trong dữ liệu trước
✓ Có vụ việc/vụ án liên quan
⚠ Phát hiện đơn có mức tương đồng cao

Block cảnh báo:

“Cần kiểm tra đơn đã tiếp nhận trước”

Nội dung:
“Hệ thống phát hiện đơn D-2026-00341 có nội dung liên quan đến hồ sơ hiện tại.”

Căn cứ phát hiện:
✓ Cùng người gửi: Ông A
✓ Cùng đối tượng: Ông B
✓ Cùng dự án: Dự án X
✓ Nội dung có mức tương đồng 89%

Không hiển thị:
“Đơn trùng 89%”

Thay bằng:
“Mức tương đồng nội dung: 89%”

Badge:
“Cần kiểm tra”

Có link nhỏ:
“Xem Rule được kích hoạt”

Khi mở:
Hiển thị Drawer:
Rule ID: R-CHECK-04
Điều kiện:
Mức tương đồng >= 85%
Kết quả:
Yêu cầu kiểm tra đơn trước khi xác định hướng xử lý.

==================================================
5. SECTION 4 – KNOWLEDGE / CĂN CỨ LIÊN QUAN
==================================================

Tiêu đề:
“4. Căn cứ và hướng dẫn liên quan”

Không hiển thị toàn bộ knowledge tree trên màn hình.

Chỉ hiển thị các knowledge item thực sự liên quan đến hồ sơ hiện tại.

Ví dụ:

[Hướng dẫn nghiệp vụ]
Kiểm tra kết quả xử lý đơn trước trước khi xác định hướng xử lý đối với đơn có nội dung liên quan hoặc trùng lặp.

Nguồn:
Hướng dẫn nghiệp vụ tiếp nhận đơn

[Xem chi tiết]

Item khác:

[Quy định pháp luật]
Tên văn bản / Điều khoản liên quan

[Xem nội dung]

Item khác:

[Tri thức thực tiễn]
Trường hợp có cùng người gửi, cùng đối tượng và cùng vụ việc cần đối chiếu lịch sử xử lý.

Các loại nguồn có thể dùng badge:
- Quy định pháp luật
- Danh mục nghiệp vụ
- Hướng dẫn nghiệp vụ
- Tri thức thực tiễn

==================================================
6. SECTION 5 – GỢI Ý HỖ TRỢ XỬ LÝ
==================================================

Tiêu đề:
“5. Gợi ý hỗ trợ xử lý”

Đây là phần AI tổng hợp kết quả từ:
- Thông tin AI trích xuất
- Search
- Rule
- Knowledge

Thiết kế một card nổi bật nhẹ, không dùng màu đỏ.

Icon:
Sparkle / AI

Nội dung mẫu:

“Nội dung đơn có dấu hiệu liên quan đến đơn D-2026-00341 đã được tiếp nhận trước đây.

Đơn trước có cùng người gửi là ông A, cùng đối tượng liên quan là ông B và cùng đề cập đến dự án X.

Hệ thống ghi nhận mức tương đồng nội dung 89% và kích hoạt quy tắc cần kiểm tra đơn trước.

Đề nghị cán bộ kiểm tra kết quả xử lý đơn D-2026-00341 trước khi xác định việc tiếp nhận, chuyển xử lý hoặc xử lý theo trường hợp đơn có nội dung liên quan/trùng lặp.”

Bên dưới có:
[Căn cứ từ dữ liệu hệ thống]
[Rule]
[Knowledge]

Có thể click để xem nguồn tạo ra nội dung gợi ý.

Không dùng text:
“AI quyết định”
“AI xác định phải xử lý”
“AI đề xuất bắt buộc chuyển...”

==================================================
7. SECTION 6 – QUYẾT ĐỊNH CỦA CÁN BỘ
==================================================

Tiêu đề:
“6. Xác định hướng xử lý”

Có chú thích:
“Hướng xử lý do cán bộ xác nhận dựa trên nội dung hồ sơ và kết quả kiểm tra.”

Dùng radio card:

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
“Chuyển tiếp nhận xử lý”

Hiển thị:
Đơn vị nhận *
[................................]

Người/Nhóm xử lý
[................................]

Có trường:
Ghi chú xử lý

==================================================
8. STICKY FOOTER
==================================================

Footer cố định dưới màn hình.

Bên trái:
“Đã kiểm tra 4/5 nội dung cần xác nhận”

Bên phải:
[Lưu nháp]
[Xác nhận thông tin]
[Chuyển xử lý]

Primary button:
“Chuyển xử lý”

Chỉ enable khi:
- Các trường bắt buộc đầy đủ
- Các cảnh báo bắt buộc đã được user kiểm tra
- User đã chọn hướng xử lý

==================================================
9. DRAWER SO SÁNH ĐƠN
==================================================

Khi nhấn “So sánh”, mở side drawer bên phải.

Tiêu đề:
“So sánh với đơn D-2026-00341”

Bảng:

Trường | Hồ sơ hiện tại | D-2026-00341

Người gửi
Ông A
Ông A
✓ Trùng

Đối tượng
Ông B
Ông B
✓ Trùng

Dự án
Dự án X
Dự án X
✓ Trùng

Số tiền
2 tỷ đồng
2 tỷ đồng
✓ Trùng

Nội dung
...
...
≈ Tương đồng

Ngày gửi
...
...
≠ Khác

Cuối drawer:
“Mức tương đồng nội dung: 89%”

Không hiển thị kết luận:
“Đây là đơn trùng”

Button:
[Mở đơn cũ]
[Đóng]

==================================================
10. NGUYÊN TẮC UI/UX
==================================================

- Không để quá nhiều card viền dày.
- Không dùng quá nhiều màu.
- Primary: xanh dương.
- Success: xanh lá.
- Warning: vàng/cam.
- Red chỉ dùng cho lỗi hoặc chặn xử lý.
- Label màu xám, value đậm hơn.
- Section cách nhau 24–32px.
- Card radius 8–12px.
- Không hiển thị knowledge tree hoặc rule tree đầy đủ trực tiếp trên màn hình.
- Chỉ hiển thị kết quả liên quan đến hồ sơ hiện tại.
- Các thông tin kỹ thuật như Rule ID, nguồn Knowledge đưa vào drawer/popover.
- Thiết kế tối ưu để cán bộ đọc nhanh và hiểu:
  “Hệ thống phát hiện gì?”
  “Dựa vào đâu?”
  “Tôi cần kiểm tra gì?”
  “Tôi phải quyết định bước nào?”

==================================================
11. PROTOTYPE STATES
==================================================

Tạo các frame sau:

1. AI đang phân tích
2. Phân tích hoàn thành – không có cảnh báo
3. Phân tích hoàn thành – phát hiện đơn liên quan
4. User đang chỉnh sửa thông tin AI trích xuất
5. Drawer so sánh đơn
6. Drawer xem Rule
7. Drawer xem Knowledge
8. User chọn hướng xử lý
9. Sẵn sàng chuyển xử lý

Giữ nguyên layout desktop và tạo prototype interaction giữa các state.