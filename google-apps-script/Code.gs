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

/* ── Lấy sheet, chưa có thì tạo kèm dòng tiêu đề.
      Nếu sheet đã có mà tiêu đề cũ không khớp thì ghi đè tiêu đề mới. ── */
function sheet(ss, ten, tieuDe) {
  var sh = ss.getSheetByName(ten);
  if (!sh) {
    sh = ss.insertSheet(ten);
    sh.appendRow(tieuDe);
    sh.setFrozenRows(1);
    sh.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm');
    sh.setColumnWidth(1, 140);
    sh.setColumnWidth(2, 170);
  } else {
    var soCot = Math.max(sh.getLastColumn(), 1);
    var cu    = sh.getRange(1, 1, 1, soCot).getValues()[0];
    if (cu.join('|') !== tieuDe.join('|')) sh.getRange(1, 1, 1, tieuDe.length).setValues([tieuDe]);
  }
  sh.getRange(1, 1, 1, tieuDe.length).setFontWeight('bold').setBackground('#efe7df');
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

/* ── Sheet 2: mỗi CÂU SAI một dòng — đề bài, em trả lời gì, đáp án đúng là gì ── */
function ghiChiTiet(ss, d) {
  var ds = d.cauSai || [];
  if (!ds.length) return;
  var sh  = sheet(ss, TEN_SHEET_CHITIET,
    ['Thời gian', 'Họ tên', 'Bài', 'Câu', 'Tầng', 'Đề bài', 'Em đã trả lời', 'Đáp án đúng']);
  var luc = new Date(d.luc || Date.now());
  var ten = d.ten || '(chưa ghi tên)';
  var bai = d.bai || '';
  var dau = sh.getLastRow() + 1;
  sh.getRange(dau, 1, ds.length, 8).setValues(
    ds.map(function (c) {
      return [luc, ten, bai, Number(c.cau), c.tang || '',
              c.de || '', c.traLoi || '(bỏ trống)', c.dapAn || ''];
    })
  );
  // cho chữ xuống dòng trong ô, đừng tràn ngang
  sh.getRange(dau, 6, ds.length, 3).setWrap(true).setVerticalAlignment('top');
  sh.setColumnWidth(6, 320);
  sh.setColumnWidth(7, 240);
  sh.setColumnWidth(8, 240);
}
