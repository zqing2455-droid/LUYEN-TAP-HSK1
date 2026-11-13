/* ══════════════════════════════════════════════════════════════════════
   GỬI BÀI NỘP VỀ CHO CÔ  ·  LUYỆN TẬP HSK1
   ----------------------------------------------------------------------
   Học viên bấm NỘP BÀI  →  kết quả được gửi về Google Trang tính của cô.

   ⚠ CHỈ CẦN SỬA ĐÚNG MỘT DÒNG: dán link Web App vào ENDPOINT bên dưới.
     Cách lấy link: đọc google-apps-script/HUONG-DAN.md

   Nếu ENDPOINT để trống thì trang vẫn chạy bình thường như cũ,
   chỉ là không gửi gì đi cả.
   ══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbyR29mubASk1W77IMTmdCR0DCCC24rPlmYMw71anC6o4hETniz9xutFPnIjMVWfVKTGKQ/exec';

  var TEN_CO     = 'cô Thanh Trúc';
  var K_TEN      = 'hsk1-ten-hoc-vien';
  var K_HANGDOI  = 'hsk1-hangdoi-nop';

  /* ── kho lưu an toàn (chế độ ẩn danh có thể chặn localStorage) ── */
  function doc(k)    { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function ghi(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function tenHocVien()      { return (doc(K_TEN) || '').trim(); }
  function luuTen(t)         { ghi(K_TEN, (t || '').trim()); }

  /* ── tên bài, lấy từ đường dẫn: bai-03.html → "Bài 03" ── */
  function tenBai() {
    var m = location.pathname.match(/bai-(\d+)/i);
    return m ? 'Bài ' + m[1] : (document.title || location.pathname);
  }

  /* ══════════ THANH KHAI TÊN ══════════ */
  var thanh, oTen;

  function dungThanh() {
    var wrap = document.querySelector('.wrap');
    if (!wrap || !ENDPOINT) return;

    thanh = document.createElement('div');
    thanh.id = 'thanh-ten';
    thanh.style.cssText =
      'margin:14px 0;padding:11px 14px;border:1px solid rgba(0,0,0,.12);' +
      'border-radius:12px;background:rgba(0,0,0,.025);font-size:14px;' +
      'display:flex;flex-wrap:wrap;gap:9px;align-items:center;line-height:1.5';

    veThanh();

    // đặt thanh ngay dưới phần mở đầu — phải leo lên tới con TRỰC TIẾP của .wrap
    var moc = wrap.querySelector('.sub') || wrap.querySelector('header');
    while (moc && moc.parentNode && moc.parentNode !== wrap) moc = moc.parentNode;
    if (moc && moc.parentNode === wrap) wrap.insertBefore(thanh, moc.nextSibling);
    else wrap.insertBefore(thanh, wrap.firstChild);
  }

  function veThanh() {
    if (!thanh) return;
    var ten = tenHocVien();

    if (ten) {
      thanh.innerHTML =
        '<span>📩 Bài nộp sẽ gửi về cho ' + TEN_CO + '. Em là <b></b>.</span>' +
        '<button type="button" id="doi-ten" style="font:inherit;cursor:pointer;' +
        'border:1px solid rgba(0,0,0,.2);background:#fff;border-radius:8px;padding:4px 11px">Đổi tên</button>';
      thanh.querySelector('b').textContent = ten;      // chèn bằng textContent cho an toàn
      thanh.querySelector('#doi-ten').onclick = function () { luuTen(''); veThanh(); };
      return;
    }

    thanh.innerHTML =
      '<span>📩 Bài nộp sẽ gửi về cho ' + TEN_CO + '. Em ghi họ tên vào đây nhé:</span>' +
      '<input id="o-ten" type="text" placeholder="Ví dụ: Nguyễn Thị Lan" ' +
      'style="font:inherit;padding:6px 10px;border:1px solid rgba(0,0,0,.25);' +
      'border-radius:8px;min-width:190px;flex:1 1 190px">' +
      '<button type="button" id="luu-ten" style="font:inherit;font-weight:700;cursor:pointer;' +
      'border:0;background:#1f6f4f;color:#fff;border-radius:8px;padding:7px 15px">Lưu</button>';

    oTen = thanh.querySelector('#o-ten');
    var luu = function () {
      var v = oTen.value.trim();
      if (!v) { oTen.focus(); return; }
      luuTen(v); veThanh();
    };
    thanh.querySelector('#luu-ten').onclick = luu;
    oTen.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); luu(); } });
  }

  /* ══════════ HÀNG ĐỢI — mất mạng thì giữ lại, lần sau gửi tiếp ══════════ */
  function layHangDoi() {
    try { return JSON.parse(doc(K_HANGDOI) || '[]'); } catch (e) { return []; }
  }
  function luuHangDoi(a) { ghi(K_HANGDOI, JSON.stringify(a.slice(-40))); }

  function guiMot(ban) {
    // mode:'no-cors' + text/plain → không bị chặn CORS, không cần preflight
    return fetch(ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(ban)
    });
  }

  function xaHangDoi() {
    if (!ENDPOINT) return Promise.resolve();
    var hd = layHangDoi();
    if (!hd.length) return Promise.resolve();
    luuHangDoi([]);                                  // lấy ra khỏi hàng đợi trước
    return Promise.all(hd.map(function (ban) {
      return guiMot(ban)['catch'](function () {      // gửi hỏng thì trả lại hàng đợi
        var l = layHangDoi(); l.push(ban); luuHangDoi(l);
      });
    }));
  }

  /* ══════════ HÀM TRANG BÀI GỌI KHI NỘP ══════════ */
  window.guiBaiNop = function (kq) {
    if (!ENDPOINT) return;

    var ten = tenHocVien();
    if (!ten) {
      ten = (window.prompt('Em ghi họ tên để cô biết đây là bài của ai nhé:') || '').trim();
      if (ten) { luuTen(ten); veThanh(); } else { ten = '(chưa ghi tên)'; }
    }

    var ban = {
      ten:    ten,
      bai:    tenBai(),
      diem:   kq.diem,
      tong:   kq.tong,
      tang:   kq.tang   || {},
      cauSai: kq.cauSai || [],
      luc:    new Date().toISOString(),
      trang:  location.href
    };

    var hd = layHangDoi(); hd.push(ban); luuHangDoi(hd);
    xaHangDoi();
    baoDaGui();
  };

  function baoDaGui() {
    var res = document.getElementById('result');
    if (!res) return;
    var d = document.createElement('div');
    d.style.cssText = 'margin-top:12px;font-size:14px;color:#1f6f4f;font-weight:700';
    d.textContent = '✓ Đã gửi bài này cho ' + TEN_CO + '.';
    res.appendChild(d);
  }

  /* ══════════ KHỞI ĐỘNG ══════════ */
  function batDau() { dungThanh(); xaHangDoi(); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', batDau);
  else batDau();
})();
