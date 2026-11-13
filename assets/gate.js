// 공개 전 비밀번호 화면. 맞는 비밀번호를 한 번 넣으면 그 기기에서는 다시 묻지 않습니다.
// 공개할 때는 각 페이지 <head>의 gate.js 줄을 지우면 됩니다. (가림막 수준: 웹을 아는 사람은 우회 가능)
(function () {
  var HASH = "ebf7e64dfbf3650485ee40bd3bd9cdb0584abbbb77d320247093b2d4acdda2e0";
  var KEY = "mb_gate";
  try { if (localStorage.getItem(KEY) === HASH) return; } catch (e) {}

  // http에서도 돌아가도록 직접 구현한 SHA-256
  function sha256(str) {
    var bytes = unescape(encodeURIComponent(str)), K = [], H = [], i, j, isP = function (n) { for (var f = 2; f * f <= n; f++) if (n % f === 0) return false; return true; };
    for (var c = 0, n = 2; c < 64; n++) if (isP(n)) { if (c < 8) H[c] = (Math.pow(n, 1 / 2) * 4294967296) | 0; K[c++] = (Math.pow(n, 1 / 3) * 4294967296) | 0; }
    var l = bytes.length * 8; bytes += "\x80"; while (bytes.length % 64 !== 56) bytes += "\x00";
    var w = []; for (i = 0; i < bytes.length; i++) w[i >> 2] |= bytes.charCodeAt(i) << ((3 - i % 4) * 8);
    w[w.length] = 0; w[(bytes.length >> 2) + 1] = l;
    var r = function (x, s) { return (x >>> s) | (x << (32 - s)); };
    for (j = 0; j < w.length; j += 16) {
      var W = w.slice(j, j + 16), a = H.slice(0);
      for (i = 0; i < 64; i++) {
        if (i >= 16) { var x = W[i - 15], y = W[i - 2]; W[i] = (W[i - 16] + (r(x, 7) ^ r(x, 18) ^ (x >>> 3)) + W[i - 7] + (r(y, 17) ^ r(y, 19) ^ (y >>> 10))) | 0; }
        var t1 = a[7] + (r(a[4], 6) ^ r(a[4], 11) ^ r(a[4], 25)) + ((a[4] & a[5]) ^ (~a[4] & a[6])) + K[i] + (W[i] | 0);
        var t2 = (r(a[0], 2) ^ r(a[0], 13) ^ r(a[0], 22)) + ((a[0] & a[1]) ^ (a[0] & a[2]) ^ (a[1] & a[2]));
        a = [(t1 + t2) | 0].concat(a); a[4] = (a[4] + t1) | 0; a.length = 8;
      }
      for (i = 0; i < 8; i++) H[i] = (H[i] + a[i]) | 0;
    }
    return H.map(function (v) { return ("00000000" + (v >>> 0).toString(16)).slice(-8); }).join("");
  }

  var root = document.documentElement;
  root.className += " gated";
  var css = document.createElement("style");
  css.textContent =
    "html.gated body > *:not(#gate){display:none !important}" +
    "#gate{min-height:100vh;display:grid;place-items:center;padding:24px 16px;background:var(--color-paper);color:var(--color-ink);font-family:var(--font-body)}" +
    "#gate form{width:min(100%,22rem);display:grid;gap:12px}" +
    "#gate h1{font-size:var(--text-2xl);font-weight:800;margin:0 0 8px}" +
    "#gate p{margin:0;color:var(--color-ink-2);font-size:var(--text-sm)}" +
    "#gate input{font:inherit;font-size:1.125rem;min-height:48px;padding:0 12px;border:1px solid var(--color-rule-2);background:var(--color-paper);color:var(--color-ink)}" +
    "#gate input:focus-visible,#gate button:focus-visible{outline:2px solid var(--color-focus);outline-offset:2px}" +
    "#gate button{font:inherit;font-weight:700;min-height:48px;border:0;background:var(--color-ink);color:var(--color-paper);cursor:pointer}" +
    "#gate .err{color:var(--color-error);min-height:1.4em}";
  (document.head || root).appendChild(css);

  function show() {
    var box = document.createElement("div");
    box.id = "gate";
    box.innerHTML = '<form autocomplete="off"><h1>마테호른 북스</h1><p>공개 준비 중입니다. 비밀번호를 넣어 주세요.</p>' +
      '<label for="gate-pw" class="label">비밀번호</label><input id="gate-pw" type="password" inputmode="numeric" required>' +
      '<button type="submit">들어가기</button><p class="err" role="alert"></p></form>';
    document.body.insertBefore(box, document.body.firstChild);
    var f = box.querySelector("form"), inp = box.querySelector("input"), err = box.querySelector(".err");
    inp.focus();
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (sha256("mb-gate:" + inp.value.trim()) === HASH) {
        try { localStorage.setItem(KEY, HASH); } catch (x) {}
        box.parentNode.removeChild(box);
        root.className = root.className.replace(/\s*gated/, "");
      } else { err.textContent = "비밀번호가 맞지 않습니다."; inp.select(); }
    });
  }
  if (document.body) show(); else document.addEventListener("DOMContentLoaded", show);
})();
