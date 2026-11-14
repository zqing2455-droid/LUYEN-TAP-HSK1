#!/usr/bin/env python3
"""
Gắn giao diện "Mầm xanh" (assets/giao-dien.css) vào mọi trang HTML của web.

Chạy lại bất cứ khi nào thêm trang mới:   python3 tools/gan-giao-dien.py
Chạy bao nhiêu lần cũng được — khối chèn có mốc chú thích nên không bị gắn trùng.

Script làm 3 việc, KHÔNG đụng tới nội dung bài:
  1. Chèn link phông Google + link assets/giao-dien.css ngay SAU thẻ </style> CUỐI CÙNG
     (không chèn trước </head> vì có trang không có <head> đóng mở chuẩn).
  2. Thêm <meta charset="utf-8"> nếu 1024 byte đầu chưa có (tránh vỡ chữ tiếng Việt).
  3. Trang trò chơi: đổi màu vẽ vòng quay (vẽ bằng JavaScript nên CSS không đổi được).
"""
import os, re, sys

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BO_QUA = {'.git', 'google-apps-script', 'tools', 'node_modules'}

MOC_DAU, MOC_CUOI = '<!-- giao-dien:bat-dau -->', '<!-- giao-dien:ket-thuc -->'
PHONG = ('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700'
         '&family=Nunito:wght@500;600;700;800&family=Patrick+Hand&display=swap')

# ── màu vòng quay trò chơi (khớp bảng màu trong assets/giao-dien.css) ──
MAU_VONG = '["#F6DCC2","#DED7F1","#CFE0CD","#F5E3B4","#F2D0C8","#D4E2E7"]'
DOI_MAU_VONG = [  # (chuỗi cũ, chuỗi mới) — chỉ thay khi còn chuỗi cũ
    (re.compile(r'const MAU_O = \[[^\]]*\];'), 'const MAU_O = ' + MAU_VONG + ';'),
    ('cx.fillStyle="#2E211E"',            'cx.fillStyle="#E8EEE6"'),   # vòng trống (đã nói hết)
    ('cx.fillStyle="#7A6356"',            'cx.fillStyle="#3F5B4C"'),   # chữ 全对
    ('kq[idx]===0 ? "#7A2621"',           'kq[idx]===0 ? "#EDB9AF"'),  # ô "cần luyện lại"
    ('cx.strokeStyle = "#1E1413"',        'cx.strokeStyle = "#FFFFFF"'),  # đường chia ô
    ('cx.fillStyle = "#F6EFE4"',          'cx.fillStyle = "#2C4236"'),    # chữ Hán trên ô
    ('cx.fillStyle="#1E1413"',            'cx.fillStyle="#FFFFFF"'),      # nút tâm
    ('cx.strokeStyle="#D79A28"',          'cx.strokeStyle="#3F5B4C"'),    # viền nút tâm
]


def khoi_chen(tien_to):
    return (MOC_DAU + '\n'
            '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
            '<link rel="stylesheet" href="' + PHONG.replace('&', '&amp;') + '">\n'
            '<link rel="stylesheet" href="' + tien_to + 'assets/giao-dien.css">\n'
            + MOC_CUOI)


def xu_ly(duong_dan):
    s = open(duong_dan, encoding='utf-8').read()
    goc = s
    tien_to = '../' * os.path.relpath(duong_dan, GOC).count(os.sep)

    # 1 · gỡ khối cũ (nếu có) rồi chèn lại ngay sau </style> cuối
    s = re.sub(re.escape(MOC_DAU) + r'.*?' + re.escape(MOC_CUOI) + r'\n?', '', s, flags=re.S)
    vt = s.rfind('</style>')
    if vt < 0:
        return 'BỎ QUA (không có <style>)'
    vt += len('</style>')
    s = s[:vt] + '\n' + khoi_chen(tien_to) + s[vt:]

    # 2 · charset
    if 'charset' not in s[:1024].lower():
        s = '<meta charset="utf-8">\n' + s

    # 3 · màu vòng quay
    if 'const MAU_O' in s:
        for cu, moi in DOI_MAU_VONG:
            s = cu.sub(moi, s) if hasattr(cu, 'sub') else s.replace(cu, moi)

    if s != goc:
        open(duong_dan, 'w', encoding='utf-8').write(s)
        return 'đã gắn'
    return 'không đổi'


def main():
    dem = 0
    for thu_muc, con, tep in os.walk(GOC):
        con[:] = sorted(c for c in con if c not in BO_QUA)
        for t in sorted(tep):
            if t.endswith('.html'):
                p = os.path.join(thu_muc, t)
                print(f'{os.path.relpath(p, GOC):28s} {xu_ly(p)}')
                dem += 1
    print(f'— {dem} trang')


if __name__ == '__main__':
    sys.exit(main())
