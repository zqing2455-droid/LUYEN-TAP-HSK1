# ON-TAP-HSK1

## Giao diện "Mầm xanh"

Toàn bộ giao diện nằm trong một file dùng chung: `assets/giao-dien.css` (đổi màu ở mục 1 là cả web đổi theo).
Màu vòng quay trò chơi vẽ bằng JavaScript nên nằm riêng trong `tools/gan-giao-dien.py` (bảng `MAU_VONG`).

**Khi thêm trang mới** (bài ôn, bộ flashcard, trò chơi), chạy lại một lần:

```
python3 tools/gan-giao-dien.py
```

Script chèn link phông + `assets/giao-dien.css` ngay sau `</style>` cuối của mỗi trang và đổi màu vòng quay trò chơi.
Chạy bao nhiêu lần cũng được, không bị gắn trùng.

## Chữ Hán chạy bút thuận trên flashcard

Thẻ flashcard tự viết chữ Hán từng nét: mặt trước lặp liên tục, mặt sau viết một lần (chạm chữ để xem lại),
"Xem tất cả" giữ chữ tĩnh. Mã nằm ở `assets/chay-net.js`, dữ liệu nét ở `assets/net-chu/` (nguồn và giấy phép: `assets/net-chu/NGUON.txt`).

**Khi thêm bộ thẻ mới** (`flashcard/bai-XX.html`), chạy lại một lần:

```
npm install hanzi-writer-data@2.0.1          # lấy dữ liệu nét, chỉ cần một lần, ở thư mục bất kỳ
python3 tools/dung-net-chu.py --nguon <đường dẫn>/node_modules/hanzi-writer-data
python3 tools/gan-giao-dien.py                # gắn giao diện cho trang mới
```

Script tạo file nét còn thiếu và gắn dòng nạp `assets/chay-net.js` vào bộ thẻ mới. Chạy lại bao nhiêu lần cũng được.
