Hãy redesign màn hình “AI trích xuất thông tin đơn” hiện tại theo hướng gọn, dễ kiểm tra và dễ chỉnh sửa dữ liệu sau khi AI phân tích xong.

Mục tiêu:
- AI chỉ hỗ trợ trích xuất thông tin, người dùng phải có quyền kiểm tra và chỉnh sửa trước khi chuyển xử lý.
- Giảm lặp thông tin trên màn hình.
- Làm rõ trạng thái: AI đang phân tích / AI đã phân tích xong / Người dùng đã xác nhận.
- Giao diện phù hợp với hệ thống nghiệp vụ hành chính, chuyên nghiệp, ít màu, ưu tiên khả năng đọc dữ liệu.

1. Trạng thái “AI đang phân tích”
Thiết kế một trạng thái loading riêng cho khu vực AI:
- Header: “AI đang phân tích hồ sơ”
- Sub text: “Đang đọc nội dung và trích xuất thông tin từ tài liệu...”
- Hiển thị progress bar nếu hệ thống có dữ liệu tiến độ thực tế.
- Nếu không có progress thực tế thì dùng loading animation, không hiển thị phần trăm giả.
- Hiển thị các bước:
  + Đọc tài liệu
  + Trích xuất thông tin
  + Xác định loại đơn
  + Tra cứu dữ liệu liên quan
- Bước đang chạy có trạng thái loading.
- Bước hoàn thành có icon check.
- Bước chưa chạy hiển thị màu neutral.
- Trong thời gian AI xử lý, các vùng dữ liệu bên dưới hiển thị skeleton.
- Không cho phép user chỉnh sửa khi AI chưa hoàn thành.

2. Trạng thái “AI đã phân tích xong”
Sau khi hoàn thành, đổi header thành:
“AI đã phân tích xong”
Sub text:
“Vui lòng kiểm tra thông tin trước khi chuyển xử lý.”

Có badge:
“Có X thông tin cần kiểm tra”
chỉ hiển thị khi tồn tại trường có độ tin cậy thấp hoặc dữ liệu chưa xác định.

3. Redesign Section “Thông tin trích xuất”
Đổi tên thành:
“1. Thông tin đơn”

Không hiển thị lặp lại thông tin dưới dạng card riêng như giao diện cũ.

Chia nội dung thành các nhóm nhỏ:

A. Thông tin chung
- Loại đơn
- Ngày làm đơn
- Nội dung / Sự việc
- Yêu cầu của người gửi

B. Người gửi đơn
- Họ tên / Tên tổ chức
- CCCD / MST
- Số điện thoại
- Email
- Địa chỉ

C. Đối tượng / Cơ quan liên quan
- Đối tượng bị khiếu nại / tố cáo
- Cơ quan liên quan
- Địa điểm / Dự án

D. Thông tin văn bản liên quan nếu AI nhận diện được
- Số văn bản / quyết định
- Ngày văn bản
- Cơ quan ban hành

Mặc định các trường hiển thị dạng read-only, không phải input.

Ví dụ:
Người gửi đơn
Nguyễn Văn A

CCCD
079075012345

Địa chỉ
45 Lê Lợi, P.3, TP. XYZ

Ở góc phải của section có nút:
“Chỉnh sửa”

4. Khi user nhấn “Chỉnh sửa”
Chuyển các trường trong section sang dạng form input.

Các control sử dụng:
- Text input
- Textarea
- Date picker
- Select với trường có danh mục
- Searchable select với cơ quan / đơn vị

Footer của section khi edit:
[Hủy] [Lưu thay đổi]

Sau khi user lưu:
- Trở lại dạng read-only
- Hiển thị badge nhỏ “Đã chỉnh sửa” bên cạnh trường user đã sửa.
- Không tự động ghi đè lại bằng kết quả AI.

Có thể cho phép tooltip hoặc history:
“Giá trị AI ban đầu: Nguyễn Văn A”

5. Quy tắc hiển thị độ tin cậy AI
Không hiển thị % confidence ở mọi trường như giao diện hiện tại.

Áp dụng:
- Confidence >= 90%:
  Hiển thị bình thường, không cần badge.
- Confidence từ 70% đến dưới 90%:
  Hiển thị badge màu vàng “Cần kiểm tra”.
- Confidence < 70%:
  Highlight nhẹ field và hiển thị “Độ tin cậy thấp”.
- AI không xác định được:
  Hiển thị “Chưa xác định”.

Không dùng nhiều màu đỏ nếu không phải lỗi nghiêm trọng.

6. Section “Kết quả tra cứu trong hệ thống”
Giữ 3 nhóm dữ liệu tổng quan:
- Lượt gửi trước
- Đơn liên quan
- Vụ việc liên quan

Thiết kế thành các summary card nhỏ, cùng kích thước:
Ví dụ:
02
Lượt gửi trước
[Xem chi tiết]

03
Đơn liên quan
[Xem chi tiết]

01
Vụ việc liên quan
[Xem chi tiết]

7. Gom cảnh báo trùng đơn
Không tạo 2 card đỏ riêng biệt cho:
- Nội dung tương đồng
- Khả năng trùng đơn

Thay bằng một block:
“Cảnh báo cần kiểm tra”

Ví dụ:
“Có 01 đơn có khả năng trùng với hồ sơ hiện tại.”

Thông tin hiển thị:
LN-08/2026
Nguyễn Văn A
Khiếu nại về bồi thường GPMB

Mức tương đồng: 84%

Button:
[So sánh]
[Mở đơn]

Khi nhấn “So sánh”, mở side drawer bên phải.

Drawer so sánh:
Tiêu đề:
“So sánh với đơn LN-08/2026”

Hiển thị bảng 3 cột:
- Trường thông tin
- Đơn hiện tại
- Đơn đã có

Các dòng:
Người gửi
Đối tượng
Nội dung
Ngày làm đơn
Địa điểm
Yêu cầu

Dùng icon:
✓ Trùng
≈ Tương đồng
≠ Khác

8. Bổ sung Section “Thông tin xử lý”
Đặt ở cuối màn hình.

Tên section:
“3. Thông tin xử lý”

Các trường:
- Hướng xử lý *
- Đơn vị tiếp nhận *
- Người / Nhóm xử lý
- Ghi chú

Hướng xử lý dùng radio card hoặc radio button:
- Tạo đơn mới
- Gắn vào đơn / hồ sơ hiện có
- Chuyển tiếp nhận xử lý
- Bàn giao
- Kết thúc lượt nhận

Các trường tiếp theo thay đổi theo hướng xử lý đã chọn.

9. Action cuối màn hình
Sticky footer dưới cùng:

Bên trái:
“Thông tin chưa xác nhận” hoặc “Đã kiểm tra thông tin”

Bên phải:
[Lưu nháp]
[Xác nhận & Chuyển xử lý]

Primary button chỉ enable khi:
- Các trường bắt buộc đã có dữ liệu
- Các field bắt buộc kiểm tra đã được user xác nhận
- User đã chọn hướng xử lý

10. Style UI
- Giữ layout desktop hiện tại.
- Background trắng hoặc xám rất nhạt.
- Card border #E5E7EB, radius 8-12px.
- Khoảng cách section rõ ràng.
- Không dùng quá nhiều box lồng nhau.
- Label nhỏ, màu xám.
- Value nổi bật hơn label.
- Primary color xanh dương.
- Warning dùng vàng/cam nhẹ.
- Error chỉ dùng đỏ khi thực sự cần user xử lý.
- Ưu tiên whitespace để màn hình không bị rối.
- Các section có thể collapse nếu nội dung dài.
- Căn chỉnh theo grid 12 cột.

11. Các trạng thái cần tạo trong prototype
Tạo đầy đủ 4 frame/state:
1. AI đang phân tích
2. AI phân tích xong – chưa chỉnh sửa
3. User đang chỉnh sửa thông tin
4. User đã xác nhận và sẵn sàng chuyển xử lý

Giữ nguyên dữ liệu mẫu hiện tại:
- Người gửi: Nguyễn Văn A
- CCCD: 079075012345
- Đối tượng bị khiếu nại: Công ty TNHH Xây dựng ABC
- Cơ quan liên quan: UBND tỉnh XYZ
- Dự án: Khu dân cư X
- Sự việc: Khiếu nại về mức bồi thường GPMB
- Yêu cầu: Xem xét lại mức bồi thường theo QĐ 45/2024/QĐ-UBND
- Ngày làm đơn: 10/09/2026
- Loại đơn: Khiếu nại
- Mức tin cậy loại đơn: 82%
- Cảnh báo đơn tương đồng: 84%