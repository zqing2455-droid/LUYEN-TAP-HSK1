/* ═══════════════════════════════════════════════════════════════════════
   CHỮ HÁN CHẠY BÚT THUẬN (笔顺) CHO THẺ FLASHCARD — web Luyện tập HSK 1

   Nạp bằng:  <script src="../assets/chay-net.js" defer></script>
   (tools/dung-net-chu.py tự chèn dòng này vào mọi bộ thẻ flashcard/bai-*.html)

   - Mặt trước (chiều 汉字 → Việt): chữ Hán tự viết từng nét, lặp lại liên tục; lật thẻ thì dừng.
   - Mặt sau: chữ Hán ở đầu thẻ viết đúng một lần khi lật sang; chạm vào chữ để xem lại.
     Chiều Việt → 汉字: mặt trước là tiếng Việt, chữ Hán chạy nét ở mặt sau.
   - Từ nhiều chữ: mỗi chữ một ô 田字格, viết lần lượt từng chữ; ô tự co theo bề rộng thẻ.
   - Chế độ "Xem tất cả" giữ chữ tĩnh.
   - Máy bật "giảm chuyển động", chữ có ký tự không phải chữ Hán hoặc thiếu dữ liệu nét
     → giữ nguyên chữ tĩnh cũ, không báo lỗi.

   Không sửa lõi code bộ thẻ: script tự theo dõi #stage (MutationObserver) để biết lúc
   thẻ được dựng lại và lúc thẻ lật (class "flipped" trên .card).

   Nhịp bám theo GIF bút thuận trong PPT: mỗi nét clamp(độ dài đường giữa / 55, 6, 16) × 45 ms,
   nghỉ 260 ms giữa các nét, giữ chữ hoàn chỉnh 2 giây rồi lặp.
   Dữ liệu nét: assets/net-chu/<mã Unicode hex>.json (xem NGUON.txt trong thư mục đó).
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__chayNet) return;
  window.__chayNet = true;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var SRC = (document.currentScript && document.currentScript.src) || '';
  var DIR = SRC.replace(/chay-net\.js(\?.*)?$/, 'net-chu/');
  var CDN = 'https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/';
  var NS = 'http://www.w3.org/2000/svg';
  var CJK = /^[一-鿿]$/;

  /* ---------- kiểu dáng (màu theo giao diện "Mầm xanh") ---------- */
  var st = document.createElement('style');
  st.textContent =
    '.hz.cn-on{position:relative;display:block;width:100%;max-width:100%;min-width:0}' +
    '.cn-box{display:flex;justify-content:center;align-items:center;gap:6px;width:100%;max-width:100%;min-width:0}' +
    '.b-top .cn-box{justify-content:flex-start}' +
    '.front .cn-box{margin-top:22px}' +                                /* chừa chỗ cho số thứ tự thẻ ở góc trên */
    '.cn-box svg{flex:0 1 auto;width:var(--cn-cell,110px);min-width:0;height:auto;aspect-ratio:1;display:block;' +
    'background:#fff;border-radius:12px}' +
    '.cn-box.cn-tap{cursor:pointer}' +
    '.cn-grid{fill:none;stroke:#D5E0D3;stroke-width:8}' +              /* khung ô: rêu nhạt */
    '.cn-dash{stroke:#D5E0D3;stroke-width:5;stroke-dasharray:28 22}' + /* chữ thập 田字格 */
    '.cn-gh{fill:#E6E2D9}' +                                           /* nét chưa viết: xám nhạt */
    '.cn-ink{fill:var(--m-la-dam,#2C4236)}' +                          /* nét đã viết: xanh đậm */
    '.cn-cur{fill:none;stroke:#C4564A;stroke-width:200;stroke-linecap:round;stroke-linejoin:round}' + /* nét đang viết: đỏ son */
    '.cn-txt{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}' +
    '.b-top .hz.cn-on{flex:1 0 100%}';
  document.head.appendChild(st);

  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  /* ---------- dữ liệu nét: file cùng repo, thiếu thì thử CDN ---------- */
  var cache = {};
  function fetchJSON(url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }
  function loadChar(ch) {
    if (cache[ch]) return cache[ch];
    var hex = ch.codePointAt(0).toString(16);
    cache[ch] = fetchJSON(DIR + hex + '.json').catch(function () {
      return fetchJSON(CDN + encodeURIComponent(ch) + '.json')
        .then(function (d) { return { s: d.strokes, m: d.medians }; });
    }).then(function (d) { return d && d.s && d.m ? d : null; }, function () { return null; });
    return cache[ch];
  }

  /* ---------- dựng SVG cho một chữ: nét mờ · nét mực · nét đang viết ---------- */
  var uid = 0;
  function polyLen(m) {
    var L = 0;
    for (var i = 0; i < m.length - 1; i++) L += Math.hypot(m[i + 1][0] - m[i][0], m[i + 1][1] - m[i][1]);
    return L || 60;
  }
  function buildChar(d) {
    var id = 'cn' + (++uid);
    var svg = el('svg', { viewBox: '0 0 1024 1024', 'aria-hidden': 'true', focusable: 'false' });
    el('rect', { x: 10, y: 10, width: 1004, height: 1004, rx: 40, 'class': 'cn-grid' }, svg);
    el('line', { x1: 512, y1: 10, x2: 512, y2: 1014, 'class': 'cn-dash' }, svg);
    el('line', { x1: 10, y1: 512, x2: 1014, y2: 512, 'class': 'cn-dash' }, svg);
    var defs = el('defs', {}, svg);
    var g = el('g', { transform: 'scale(1,-1) translate(0,-900)' }, svg);
    var ghost = el('g', {}, g), ink = el('g', {}, g), cur = el('g', {}, g);
    var strokes = d.s.map(function (path, i) {
      el('path', { d: path, 'class': 'cn-gh' }, ghost);
      var p = el('path', { d: path, 'class': 'cn-ink' }, ink);
      p.style.display = 'none';
      var cp = el('clipPath', { id: id + '-' + i }, defs);
      el('path', { d: path }, cp);
      var cg = el('g', { 'clip-path': 'url(#' + id + '-' + i + ')' }, cur);
      cg.style.display = 'none';
      var pts = d.m[i];
      var med = el('path', { d: 'M ' + pts.map(function (q) { return q[0] + ' ' + q[1]; }).join(' L '), 'class': 'cn-cur' }, cg);
      var L = polyLen(pts);
      return { ink: p, cg: cg, med: med, len: L,
               dur: Math.max(6, Math.min(16, Math.floor(L / 55))) * 45 };   // như GIF: 6–16 khung × 45 ms
    });
    return {
      svg: svg, strokes: strokes,
      full: function () { ghost.style.display = 'none'; strokes.forEach(function (s) { s.ink.style.display = ''; s.cg.style.display = 'none'; }); },
      blank: function () { ghost.style.display = ''; strokes.forEach(function (s) { s.ink.style.display = 'none'; s.cg.style.display = 'none'; }); }
    };
  }

  /* ---------- bộ chạy nét cho cả một từ ---------- */
  function Writer(box, chars, loop) {
    var token = 0;
    function alive(my) { return my === token && box.isConnected; }
    function wait(ms, my) {
      return new Promise(function (res) { setTimeout(res, ms); }).then(function () { return alive(my); });
    }
    function grow(s, my) {
      return new Promise(function (res) {
        var t0 = performance.now(), gap = s.len * 2 + 4000;
        (function tick(now) {
          if (!alive(my)) return res(false);
          var k = Math.min(1, ((now || performance.now()) - t0) / s.dur);
          s.med.style.strokeDasharray = Math.max(s.len * k, 1) + ' ' + gap;
          if (k < 1) requestAnimationFrame(tick); else res(true);
        })();
      });
    }
    function allFull() { chars.forEach(function (c) { c.full(); }); }
    function allBlank() { chars.forEach(function (c) { c.blank(); }); }
    return {
      stop: function () { token++; allFull(); },
      /* opts: preview = ms giữ chữ hoàn chỉnh trước khi xoá để viết; delay = ms chờ khi đã xoá */
      play: function (opts) {
        opts = opts || {};
        var my = ++token;
        (async function () {
          do {
            if (opts.preview) { allFull(); if (!(await wait(opts.preview, my))) return; }
            allBlank();
            if (!(await wait(opts.delay || 350, my))) return;
            for (var c = 0; c < chars.length; c++) {
              for (var i = 0; i < chars[c].strokes.length; i++) {
                var s = chars[c].strokes[i];
                s.cg.style.display = '';
                if (!(await grow(s, my))) return;
                s.cg.style.display = 'none';
                s.ink.style.display = '';
                if (!(await wait(260, my))) return;     // chốt nét rồi nghỉ một nhịp
              }
            }
            allFull();
            if (!loop) return;
            if (!(await wait(2000, my))) return;        // giữ chữ hoàn chỉnh rồi lặp lại
          } while (alive(my));
        })();
      }
    };
  }

  /* ---------- gắn vào từng thẻ ---------- */
  // cỡ ô tối đa theo số chữ (1, 2, 3, 4, 5+); ô tự co nhỏ hơn nếu thẻ hẹp
  var CELL = { front: [124, 112, 98, 84, 72], back: [62, 62, 54, 46, 42] };
  var cards = new WeakMap();      // .card -> { front, back, flipped }

  function refit() { if (typeof window.fitAll === 'function') { window.fitAll(); requestAnimationFrame(window.fitAll); } }

  function mount(host, kind, tap) {
    if (!host || host.getAttribute('data-cn')) return Promise.resolve(null);
    var word = host.textContent.trim();
    var letters = Array.from(word);
    if (!letters.length || !letters.every(function (c) { return CJK.test(c); })) return Promise.resolve(null);
    host.setAttribute('data-cn', '1');
    var cell = CELL[kind][Math.min(letters.length, 5) - 1];
    return Promise.all(letters.map(loadChar)).then(function (list) {
      if (!host.isConnected) return null;
      if (list.some(function (d) { return !d; })) { host.removeAttribute('data-cn'); return null; }  // thiếu nét: chữ tĩnh
      var box = document.createElement('div');
      box.className = 'cn-box' + (tap ? ' cn-tap' : '');
      box.style.setProperty('--cn-cell', cell + 'px');
      var chars = list.map(buildChar);
      chars.forEach(function (c) { box.appendChild(c.svg); c.full(); });
      host.classList.add('cn-on');
      host.setAttribute('role', 'img');
      host.setAttribute('aria-label', word);          // giữ chữ gốc cho trình đọc màn hình
      host.textContent = '';
      var txt = document.createElement('span'); txt.className = 'cn-txt'; txt.textContent = word;
      host.appendChild(txt); host.appendChild(box);
      var w = Writer(box, chars, kind === 'front');
      if (tap) {
        box.title = 'Chạm để xem lại nét';
        box.addEventListener('click', function (e) { e.stopPropagation(); w.play({ delay: 200 }); });
      }
      refit();
      return w;
    });
  }

  function isFlipped(card) { return card.classList.contains('flipped'); }

  function enhance(stage) {
    if (stage.classList.contains('all')) return;            // "Xem tất cả": giữ chữ tĩnh
    stage.querySelectorAll('.card').forEach(function (card) {
      if (cards.has(card)) return;
      var rec = { front: null, back: null, flipped: isFlipped(card) };
      cards.set(card, rec);
      // mặt trước chỉ có chữ Hán ở chiều 汉字 → Việt (chiều Việt → 汉字 không có .big.hz)
      mount(card.querySelector('.front .big.hz'), 'front', false).then(function (w) {
        rec.front = w;
        if (w && !isFlipped(card)) w.play({ preview: 700 });
      });
      mount(card.querySelector('.back .b-top .hz'), 'back', true).then(function (w) {
        rec.back = w;
        if (w && isFlipped(card)) w.play({ delay: 450 });
      });
    });
  }

  function onClassChange(card) {
    var rec = cards.get(card); if (!rec) return;
    var f = isFlipped(card);
    if (f === rec.flipped) return;                          // đổi class "đã thuộc / cần ôn": bỏ qua
    rec.flipped = f;
    if (f) {
      if (rec.front) rec.front.stop();
      if (rec.back) rec.back.play({ delay: 450 });          // chờ thẻ lật xong rồi mới viết
    } else {
      if (rec.back) rec.back.stop();
      if (rec.front) rec.front.play({ preview: 700 });
    }
  }

  function start() {
    var stage = document.getElementById('stage');
    if (!stage) return;
    new MutationObserver(function (muts) {
      var rerender = false;
      muts.forEach(function (m) {
        if (m.type === 'childList' && m.target === stage) rerender = true;
        else if (m.type === 'attributes' && m.target.classList && m.target.classList.contains('card')) onClassChange(m.target);
      });
      if (rerender) enhance(stage);
    }).observe(stage, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    enhance(stage);

    // tải sẵn nét của cả bộ thẻ lúc rảnh, sang thẻ khác là có ngay
    var idle = window.requestIdleCallback || function (f) { return setTimeout(f, 600); };
    idle(function () {
      try {
        var seen = {};
        DATA.words.forEach(function (w) { Array.from(w.hz).forEach(function (c) { if (CJK.test(c) && !seen[c]) { seen[c] = 1; loadChar(c); } }); });
      } catch (e) {}
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
