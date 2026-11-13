/**
 * ══════════════════════════════════════════════════════════════════
 *  NHẬN BÀI NỘP  ·  LUYỆN TẬP HSK1
 *  ------------------------------------------------------------------
 *  Dán TOÀN BỘ file này vào Apps Script của Google Trang tính,
 *  rồi Triển khai (Deploy) thành Ứng dụng web.
 *  Hướng dẫn từng bước: xem HUONG-DAN.md cùng thư mục.
 * ══════════════════════════════════════════════════════════════════
 */

var TEN_SHEET_TONG    = 'Tổng hợp';
var TEN_SHEET_CHITIET = 'Chi tiết câu sai';

/* ── Trang web gọi vào đây mỗi lần học viên bấm NỘP BÀI ── */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var d  = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    ghiTong(ss, d);
    ghiChiTiet(ss, d);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, loi: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

/* ── Mở link Web App bằng trình duyệt sẽ thấy dòng này → nghĩa là chạy được ── */
function doGet() {
  return json({ ok: true, note: 'Web App dang chay binh thuong.' });
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ── Lấy sheet, chưa có thì tạo kèm dòng tiêu đề ── */
function sheet(ss, ten, tieuDe) {
  var sh = ss.getSheetByName(ten);
  if (!sh) {
    sh = ss.insertSheet(ten);
    sh.appendRow(tieuDe);
    sh.getRange(1, 1, 1, tieuDe.length)
      .setFontWeight('bold')
      .setBackground('#efe7df');
    sh.setFrozenRows(1);
    sh.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm');
    sh.setColumnWidth(1, 140);
    sh.setColumnWidth(2, 170);
  }
  return sh;
}

/* ── Sheet 1: mỗi lượt nộp một dòng ── */
function ghiTong(ss, d) {
  var sh = sheet(ss, TEN_SHEET_TONG, [
    'Thời gian', 'Họ tên', 'Bài', 'Đúng', 'Tổng', '%', 'Số câu sai', 'Các câu sai',
    'Xếp câu', 'Nghe viết lại', 'Phân biệt', 'Hội thoại', 'Tự viết'
  ]);
  var t   = d.tang   || {};
  var sai = (d.cauSai || []).map(function (c) {
    return ('0' + c.cau).slice(-2);
  });
  sh.appendRow([
    new Date(d.luc || Date.now()),
    d.ten || '(chưa ghi tên)',
    d.bai || '',
    d.diem,
    d.tong,
    d.tong ? Math.round(d.diem / d.tong * 100) + '%' : '',
    sai.length,
    sai.join(' · '),
    t['Xếp câu']       || '',
    t['Nghe viết lại'] || '',
    t['Phân biệt']     || '',
    t['Hội thoại']     || '',
    t['Tự viết']       || ''
  ]);
}

/* ── Sheet 2: mỗi CÂU SAI một dòng, kèm nội dung học viên đã trả lời ── */
function ghiChiTiet(ss, d) {
  var ds = d.cauSai || [];
  if (!ds.length) return;
  var sh  = sheet(ss, TEN_SHEET_CHITIET,
    ['Thời gian', 'Họ tên', 'Bài', 'Câu', 'Tầng', 'Em đã trả lời']);
  var luc = new Date(d.luc || Date.now());
  var ten = d.ten || '(chưa ghi tên)';
  var bai = d.bai || '';
  sh.getRange(sh.getLastRow() + 1, 1, ds.length, 6).setValues(
    ds.map(function (c) {
      return [luc, ten, bai, Number(c.cau), c.tang || '', c.traLoi || '(bỏ trống)'];
    })
  );
}
