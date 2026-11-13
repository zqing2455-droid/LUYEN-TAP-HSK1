# Nhận bài nộp của học viên về Google Trang tính

Làm một lần duy nhất, khoảng 10 phút. Sau đó mọi bài ôn đều tự gửi về.

---

## Bước 1 · Tạo bảng tính

1. Mở <https://sheets.new> — một bảng tính trống hiện ra.
2. Đặt tên bảng tính là **Bài nộp HSK1** (bấm vào chữ "Bảng tính không có tiêu đề" ở góc trên bên trái).

Không cần tạo cột gì cả. Hai trang tính **Tổng hợp** và **Chi tiết câu sai** sẽ tự sinh ra khi có bài nộp đầu tiên.

---

## Bước 2 · Dán mã Apps Script

1. Trong bảng tính vừa tạo, vào menu **Tiện ích mở rộng → Apps Script**.
2. Một tab mới mở ra, bên trong có sẵn file `Code.gs` với mấy dòng `function myFunction() {}`.
3. **Xoá sạch** nội dung đang có trong ô soạn thảo.
4. Mở file `google-apps-script/Code.gs` trong kho này, **chép toàn bộ** và dán vào.
5. Bấm biểu tượng đĩa mềm 💾 (Lưu dự án).

---

## Bước 3 · Triển khai thành Ứng dụng web

1. Góc trên bên phải, bấm nút xanh **Triển khai → Lượt triển khai mới**.
2. Bấm biểu tượng bánh răng ⚙ bên trái chữ "Chọn loại", chọn **Ứng dụng web**.
3. Điền đúng ba ô này:

   | Ô | Chọn |
   |---|---|
   | Mô tả | `Nhận bài nộp HSK1` |
   | Thực thi với tư cách | **Tôi** (`zqing2455@gmail.com`) |
   | Người có quyền truy cập | **Bất kỳ ai** |

   ⚠ Ô cuối **bắt buộc** là "Bất kỳ ai". Nếu để "Bất kỳ ai có Tài khoản Google" thì học viên phải đăng nhập mới nộp được, và phần lớn sẽ nộp hỏng.

4. Bấm **Triển khai**. Google sẽ hỏi quyền:
   - **Uỷ quyền truy cập** → chọn tài khoản của cô.
   - Màn hình "Google chưa xác minh ứng dụng này" → bấm **Nâng cao** → **Chuyển đến Nhận bài nộp HSK1 (không an toàn)**. Đây là script của chính cô nên không sao.
   - **Cho phép**.
5. Màn hình cuối cho một đường link dạng:

   ```
   https://script.google.com/macros/s/AKfycb..................../exec
   ```

   **Chép đường link này.**

---

## Bước 4 · Dán link vào trang web

1. Mở file `assets/nop-bai.js` trong kho này.
2. Tìm dòng thứ 18:

   ```js
   var ENDPOINT = '';   // ← DÁN LINK WEB APP VÀO GIỮA HAI DẤU NHÁY NÀY
   ```

3. Dán link vào giữa hai dấu nháy:

   ```js
   var ENDPOINT = 'https://script.google.com/macros/s/AKfycb..../exec';
   ```

4. Lưu lại và đẩy lên GitHub. Khoảng 1–2 phút sau là trang web chạy bản mới.

---

## Bước 5 · Thử một lượt

1. Mở <https://zqing2455-droid.github.io/LUYEN-TAP-HSK1/bai/bai-01.html>
2. Trên đầu trang sẽ thấy thanh **"📩 Bài nộp sẽ gửi về cho cô Thanh Trúc. Em ghi họ tên vào đây nhé:"** — gõ `Thử nghiệm` rồi bấm **Lưu**.
3. Làm đại vài câu rồi bấm **NỘP BÀI**.
4. Dưới ô điểm phải hiện dòng xanh **"✓ Đã gửi bài này cho cô Thanh Trúc."**
5. Quay lại bảng tính — một dòng mới đã nằm trong trang **Tổng hợp**.

---

## Cô sẽ nhận được gì

**Trang `Tổng hợp`** — mỗi lượt nộp một dòng:

| Thời gian | Họ tên | Bài | Đúng | Tổng | % | Số câu sai | Các câu sai | Xếp câu | Nghe viết lại | Phân biệt | Hội thoại | Tự viết |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 13/11/2026 21:40 | Nguyễn Thị Lan | Bài 01 | 16 | 20 | 80% | 4 | 03 · 07 · 12 · 19 | 3/3 | 4/5 | 5/6 | 2/3 | 2/3 |

**Trang `Chi tiết câu sai`** — mỗi câu sai một dòng, có đủ ba thứ để thấy em sai ở chỗ nào: đề bài, em trả lời gì, đáp án đúng là gì.

| Thời gian | Họ tên | Bài | Câu | Tầng | Đề bài | Em đã trả lời | Đáp án đúng |
|---|---|---|---|---|---|---|---|
| 13/11 21:40 | Nguyễn Thị Lan | Bài 01 | 03 | Xếp câu | Cô giáo vừa giúp em. Em cảm ơn cô. | 老师好您 | 老师，谢谢您！ / 谢谢老师！ |
| 13/11 21:40 | Nguyễn Thị Lan | Bài 01 | 12 | Phân biệt | Bạn cảm ơn em. Em đáp lại thế nào? | C. 谢谢！ | B. 不客气。 |
| 13/11 21:40 | Nguyễn Thị Lan | Bài 01 | 15 | Hội thoại | Buổi học đầu tiên — cô Vương bước vào lớp | Lượt 1: ✓ 老师，您好！ ｜ Lượt 2: ✗ 小语，您好！ | Lượt 1: 老师，您好！ ｜ Lượt 2: 小语，你好！ |

Muốn xem nhanh cả lớp thì bôi đen trang `Tổng hợp` → **Chèn → Bảng tổng hợp**, kéo *Họ tên* xuống hàng và *Bài* sang cột.

---

## Những điều nên biết

- **Học viên không cần đăng nhập gì cả.** Chỉ gõ tên một lần, máy nhớ luôn cho các bài sau.
- **Mất mạng vẫn không mất bài.** Bài nộp được giữ trong máy học viên, lần sau mở trang là tự gửi đi.
- **Làm lại nhiều lần thì ghi nhiều dòng.** Đây là cố ý — cô nhìn được tiến bộ qua từng lượt. Muốn chỉ lấy lượt cao nhất thì dùng bảng tổng hợp với hàm `MAX`.
- **Tên do học viên tự gõ nên có thể sai chính tả hoặc trùng nhau.** Nếu sau này thấy phiền, nói em một tiếng, em đổi sang danh sách lớp cho chọn.
- **Đây là trang web công khai**, nên về lý thuyết ai biết link Web App cũng gửi dữ liệu vào bảng tính được. Với bài tập tiếng Trung thì không sao; chỉ đừng dùng cùng một script này cho việc gì cần bảo mật.
- **Thêm bài ôn mới (bài 06 trở đi)** chỉ cần gắn `<script src="../assets/nop-bai.js"></script>` vào cuối trang và gọi `guiBaiNop()` sau khi chấm — không phải đụng tới Apps Script.
- **Mỗi lần sửa mã trong Apps Script** đều phải vào **Triển khai → Quản lý lượt triển khai → ✏ → Phiên bản: Phiên bản mới → Triển khai**, nếu không thì bản cũ vẫn chạy.
