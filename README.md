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
