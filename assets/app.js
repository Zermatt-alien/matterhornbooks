// 마테호른 북스 홈페이지 공용 스크립트
(function () {
  "use strict";
  var API = (window.MB_CONFIG && window.MB_CONFIG.API_URL || "").trim();
  var STORE = (window.MB_CONFIG && window.MB_CONFIG.STORE_URL || "").trim();
  var DEMO = !API;
  var DEMO_KEY = "mb_demo_questions";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function fmtDate(d) { return d ? String(d).slice(0, 10).replace(/-/g, ".") : ""; }

  // ---------- 데이터 ----------
  function demoQuestions() {
    try { return JSON.parse(localStorage.getItem(DEMO_KEY) || "[]"); } catch (e) { return []; }
  }
  function saveDemoQuestions(list) {
    try { localStorage.setItem(DEMO_KEY, JSON.stringify(list)); } catch (e) { /* 저장 불가 */ }
  }

  var cache = null;
  function load() {
    if (cache) return cache;
    if (DEMO) {
      var s = JSON.parse(JSON.stringify(window.MB_SAMPLE));
      var mine = demoQuestions().map(function (q) {
        var copy = Object.assign({}, q); delete copy.pw;
        if (copy.secret) { delete copy.content; }
        return copy;
      });
      s.questions = mine.reverse().concat(s.questions);
      cache = Promise.resolve(s);
    } else {
      cache = fetch(API + "?action=all", { redirect: "follow" })
        .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
        .then(function (j) { if (!j.ok) throw new Error(j.error || "불러오기 실패"); return j.data; });
    }
    return cache;
  }

  function post(payload) {
    if (DEMO) return demoPost(payload);
    return fetch(API, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json(); });
  }

  function demoPost(p) {
    var list = demoQuestions();
    if (p.action === "ask") {
      var id = 100 + list.length + 1;
      list.push({ id: id, date: new Date().toISOString().slice(0, 10), name: p.name, book: p.book, title: p.title,
        content: p.content, secret: !!p.secret, pw: p.password, answered: false });
      saveDemoQuestions(list);
      cache = null;
      return Promise.resolve({ ok: true, id: id });
    }
    if (p.action === "view") {
      var q = list.filter(function (x) { return x.id === Number(p.id); })[0];
      if (!q) return Promise.resolve({ ok: false, error: "미리보기 모드의 예시 비밀글은 열 수 없습니다." });
      if (q.pw !== p.password) return Promise.resolve({ ok: false, error: "비밀번호가 맞지 않습니다." });
      return Promise.resolve({ ok: true, content: q.content, answer: q.answer || "", answerDate: q.answerDate || "" });
    }
    return Promise.resolve({ ok: false, error: "알 수 없는 요청" });
  }

  function bookName(data, id) {
    var b = data.books.filter(function (x) { return x.id === id; })[0];
    return b ? (b.series ? b.series + " " : "") + b.title : (id || "");
  }
  function bookOptions(data, selected, includeAll) {
    var html = includeAll ? '<option value="">모든 책</option>' : '<option value="">책을 고르세요</option>';
    var groups = {};
    var order = [];
    data.books.forEach(function (b) {
      var g = b.series || "기타";
      if (!groups[g]) { groups[g] = []; order.push(g); }
      groups[g].push(b);
    });
    order.forEach(function (g) {
      html += '<optgroup label="' + esc(g) + '">';
      groups[g].forEach(function (b) {
        html += '<option value="' + esc(b.id) + '"' + (b.id === selected ? " selected" : "") + ">" + esc(b.series ? b.series + " " + b.title : b.title) + "</option>";
      });
      html += "</optgroup>";
    });
    return html;
  }

  function failBox(el, err) {
    el.innerHTML = '<p class="empty">내용을 불러오지 못했습니다. 잠시 뒤 새로고침해 주세요. (' + esc(err && err.message || err) + ")</p>";
  }

  // ---------- 조각 ----------
  function noticeRow(n, withBody) {
    var body = withBody
      ? '<div class="row-body" id="n-body-' + esc(n.id) + '" hidden>' + esc(n.body) + "</div>"
      : "";
    var title = withBody
      ? '<button class="toggle" type="button" aria-expanded="false" aria-controls="n-body-' + esc(n.id) + '">' + esc(n.title) + "</button>"
      : '<a href="notice.html#n-' + esc(n.id) + '">' + esc(n.title) + "</a>";
    return '<li class="row" id="n-' + esc(n.id) + '">' +
      '<span class="meta">' + fmtDate(n.date) + "</span>" +
      "<h3>" + title + "</h3>" +
      '<span class="side">' + (n.pinned ? '<span class="tag">' + esc(n.category || "공지") + "</span>" : '<span class="tag tag--plain">' + esc(n.category || "공지") + "</span>") + "</span>" +
      body + "</li>";
  }

  function questionRow(q, data, full) {
    var lock = q.secret ? "비밀글" : (q.answered ? "답변 완료" : "답변 대기");
    var titleHtml = full
      ? '<button class="toggle" type="button" aria-expanded="false" aria-controls="q-body-' + esc(q.id) + '">' + esc(q.title) + "</button>"
      : '<a href="qna.html#q-' + esc(q.id) + '">' + esc(q.title) + "</a>";
    var body = "";
    if (full) {
      body = '<div id="q-body-' + esc(q.id) + '" class="q-detail" hidden style="display:contents">';
      if (q.secret) {
        body += '<form class="unlock" data-id="' + esc(q.id) + '"><label class="visually-hidden" for="pw-' + esc(q.id) + '">비밀번호</label>' +
          '<input type="password" id="pw-' + esc(q.id) + '" placeholder="글 쓸 때 정한 비밀번호" autocomplete="off" required>' +
          '<button class="btn btn--secondary btn--small" type="submit">열기</button><span class="status" role="status"></span></form>';
      } else {
        body += '<div class="row-body">' + esc(q.content) + "</div>";
        if (q.answered) body += answerHtml(q.answer, q.answerDate);
      }
      body += "</div>";
    }
    return '<li class="row" id="q-' + esc(q.id) + '">' +
      '<span class="meta">' + fmtDate(q.date) + "</span>" +
      "<h3>" + titleHtml + "</h3>" +
      '<span class="side">' + esc(lock) + "<br>" + esc(q.name) + "</span>" +
      (full ? '<span class="meta">' + esc(bookName(data, q.book)) + "</span>" : "") +
      body + "</li>";
  }
  function answerHtml(a, d) {
    return '<div class="qa-answer"><b>마테호른 북스 답변 ' + esc(fmtDate(d)) + "</b>" + esc(a) + "</div>";
  }

  function wireToggles(root) {
    root.addEventListener("click", function (e) {
      var t = e.target.closest(".toggle");
      if (!t) return;
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      if (!panel) return;
      var open = t.getAttribute("aria-expanded") === "true";
      t.setAttribute("aria-expanded", String(!open));
      panel.hidden = open;
    });
  }
  function openFromHash(prefix) {
    var h = location.hash;
    if (!h || h.indexOf("#" + prefix) !== 0) return;
    var row = document.getElementById(h.slice(1));
    var t = row && row.querySelector(".toggle");
    if (t && t.getAttribute("aria-expanded") !== "true") t.click();
    if (row) row.scrollIntoView();
  }

  // ---------- 페이지 ----------
  var pages = {};

  pages.home = function () {
    var n = $("#home-notices"), b = $("#home-books"), q = $("#home-questions");
    load().then(function (data) {
      var notices = data.notices.slice().sort(sortNotices).slice(0, 4);
      n.innerHTML = notices.length ? notices.map(function (x) { return noticeRow(x, false); }).join("") : '<li class="empty">아직 공지가 없습니다.</li>';
      b.innerHTML = data.books.map(function (bk) {
        var errCount = data.errata.filter(function (e) { return e.book === bk.id; }).length;
        return '<li class="book">' +
          '<span class="series">' + esc(bk.series) + "</span>" +
          "<h3>" + esc(bk.title) + (bk.isNew ? ' <span class="tag">새 책</span>' : "") + "</h3>" +
          (bk.target ? "<p>" + esc(bk.target) + "</p>" : "") +
          '<span class="links"><a href="errata.html?book=' + encodeURIComponent(bk.id) + '">정오표' + (errCount ? " " + errCount + "건" : "") + "</a>" +
          '<a href="qna.html?book=' + encodeURIComponent(bk.id) + '#ask">질문하기</a>' +
          ((bk.buy || STORE) ? '<a href="' + esc(bk.buy || STORE) + '" rel="noopener" target="_blank">스마트스토어에서 구매</a>' : "") + "</span></li>";
      }).join("");
      var qs = data.questions.slice(0, 4);
      q.innerHTML = qs.length ? qs.map(function (x) { return questionRow(x, data, false); }).join("") : '<li class="empty">아직 질문이 없습니다.</li>';
    }).catch(function (e) { failBox(n, e); b.innerHTML = ""; q.innerHTML = ""; });
  };

  function sortNotices(a, b) {
    if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
    return String(b.date).localeCompare(String(a.date)) || (b.id - a.id);
  }

  pages.notice = function () {
    var list = $("#notice-list");
    wireToggles(list);
    load().then(function (data) {
      var all = data.notices.slice().sort(sortNotices);
      list.innerHTML = all.length ? all.map(function (x) { return noticeRow(x, true); }).join("") : '<li class="empty">아직 공지가 없습니다.</li>';
      openFromHash("n-");
    }).catch(function (e) { failBox(list, e); });
  };

  pages.errata = function () {
    var sel = $("#errata-book"), search = $("#errata-search"), out = $("#errata-out"), pdf = $("#errata-pdf");
    var params = new URLSearchParams(location.search);
    load().then(function (data) {
      sel.innerHTML = bookOptions(data, params.get("book") || "", true);
      function render() {
        var id = sel.value, term = search.value.trim().toLowerCase();
        var rows = data.errata.filter(function (e) {
          if (id && e.book !== id) return false;
          if (!term) return true;
          return [e.page, e.where, e.before, e.after].join(" ").toLowerCase().indexOf(term) !== -1;
        });
        var book = data.books.filter(function (b) { return b.id === id; })[0];
        pdf.innerHTML = book && book.errataPdf ? '<a class="btn btn--secondary btn--small" href="' + esc(book.errataPdf) + '" target="_blank" rel="noopener">정오표 PDF 내려받기</a>' : "";
        if (!rows.length) {
          out.innerHTML = '<p class="empty">' + (id ? "이 책에 올라온 정오 사항이 없습니다." : "검색 결과가 없습니다.") + "</p>";
          return;
        }
        out.innerHTML = '<p class="meta" style="margin-bottom:var(--space-sm)">' + rows.length + '건</p><div class="errata-list"><table><caption class="visually-hidden">정오표</caption><thead><tr>' +
          (id ? "" : "<th scope=\"col\">책</th>") +
          '<th scope="col">쇄</th><th scope="col">쪽</th><th scope="col">위치</th><th scope="col">수정 전</th><th scope="col">수정 후</th><th scope="col">올린 날</th></tr></thead><tbody>' +
          rows.map(function (e) {
            return "<tr>" + (id ? "" : '<td class="wide" data-label="책">' + esc(bookName(data, e.book)) + "</td>") +
              '<td class="num" data-label="쇄">' + esc(e.printing) + '</td><td class="num" data-label="쪽">' + esc(e.page) + '</td><td class="wide" data-label="위치">' + esc(e.where) +
              '</td><td class="wide" data-label="수정 전"><del>' + esc(e.before) + '</del></td><td class="wide" data-label="수정 후"><ins>' + esc(e.after) + '</ins></td><td class="num wide" data-label="올린 날">' + fmtDate(e.date) + "</td></tr>";
          }).join("") + "</tbody></table></div>";
      }
      sel.addEventListener("change", function () {
        var u = new URL(location.href);
        if (sel.value) u.searchParams.set("book", sel.value); else u.searchParams.delete("book");
        history.replaceState(null, "", u);
        render();
      });
      search.addEventListener("input", render);
      render();
    }).catch(function (e) { failBox(out, e); });
  };

  pages.qna = function () {
    var list = $("#qna-list"), form = $("#ask-form"), status = $("#ask-status"), bookSel = $("#ask-book");
    var params = new URLSearchParams(location.search);
    wireToggles(list);

    list.addEventListener("submit", function (e) {
      var f = e.target.closest(".unlock");
      if (!f) return;
      e.preventDefault();
      var st = f.querySelector(".status"), input = f.querySelector("input"), btn = f.querySelector("button");
      btn.setAttribute("aria-busy", "true"); st.className = "status"; st.textContent = "확인하는 중";
      post({ action: "view", id: Number(f.dataset.id), password: input.value }).then(function (r) {
        btn.removeAttribute("aria-busy");
        if (!r.ok) { st.className = "status error"; st.textContent = r.error || "열 수 없습니다."; return; }
        var html = '<div class="row-body">' + esc(r.content) + "</div>" + (r.answer ? answerHtml(r.answer, r.answerDate) : '<div class="row-body"><span class="meta">아직 답변 전입니다.</span></div>');
        f.insertAdjacentHTML("afterend", html);
        f.remove();
      }).catch(function () { btn.removeAttribute("aria-busy"); st.className = "status error"; st.textContent = "연결에 실패했습니다."; });
    });

    function renderList(data) {
      var qs = data.questions;
      list.innerHTML = qs.length ? qs.map(function (x) { return questionRow(x, data, true); }).join("") : '<li class="empty">아직 질문이 없습니다. 첫 질문을 남겨 주세요.</li>';
      openFromHash("q-");
    }

    load().then(function (data) {
      bookSel.innerHTML = bookOptions(data, params.get("book") || "", false);
      renderList(data);
    }).catch(function (e) { failBox(list, e); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var payload = {
        action: "ask",
        name: String(fd.get("name") || "").trim(),
        book: String(fd.get("book") || ""),
        title: String(fd.get("title") || "").trim(),
        content: String(fd.get("content") || "").trim(),
        secret: fd.get("secret") === "on",
        password: String(fd.get("password") || ""),
        website: String(fd.get("website") || "")
      };
      var bad = null;
      form.querySelectorAll("[aria-invalid]").forEach(function (el) { el.removeAttribute("aria-invalid"); });
      if (!payload.name) bad = ["ask-name", "이름(닉네임)을 적어 주세요."];
      else if (!payload.book) bad = ["ask-book", "어느 책에 대한 질문인지 골라 주세요."];
      else if (!payload.title) bad = ["ask-title", "제목을 적어 주세요."];
      else if (payload.content.length < 5) bad = ["ask-content", "질문 내용을 조금 더 적어 주세요."];
      else if (!/^\d{4,}$/.test(payload.password)) bad = ["ask-pw", "비밀번호는 숫자 4자리 이상으로 정해 주세요."];
      if (bad) {
        var el = document.getElementById(bad[0]);
        el.setAttribute("aria-invalid", "true"); el.focus();
        status.className = "status error"; status.textContent = bad[1];
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      btn.setAttribute("aria-busy", "true"); btn.disabled = true;
      status.className = "status"; status.textContent = "올리는 중";
      post(payload).then(function (r) {
        btn.removeAttribute("aria-busy"); btn.disabled = false;
        if (!r.ok) { status.className = "status error"; status.textContent = r.error || "올리지 못했습니다."; return; }
        form.reset();
        status.className = "status ok";
        status.textContent = "질문이 올라갔습니다. 답변이 달리면 이 게시판에서 확인할 수 있습니다.";
        cache = null;
        load().then(renderList);
      }).catch(function () {
        btn.removeAttribute("aria-busy"); btn.disabled = false;
        status.className = "status error"; status.textContent = "연결에 실패했습니다. 잠시 뒤 다시 시도해 주세요.";
      });
    });
  };

  // ---------- 시작 ----------
  document.addEventListener("DOMContentLoaded", function () {
    if (DEMO) {
      var note = document.createElement("div");
      note.className = "demo-note";
      note.innerHTML = '<div class="container">미리보기 모드입니다. 구글 시트를 연결하기 전이라 예시 내용을 보여 줍니다.</div>';
      var head = document.querySelector(".site-head");
      if (head) head.insertAdjacentElement("afterend", note);
    }
    var p = document.body.dataset.page;
    document.querySelectorAll('[data-nav="' + p + '"]').forEach(function (a) { a.setAttribute("aria-current", "page"); });
    if (pages[p]) pages[p]();
    if ("serviceWorker" in navigator && location.protocol === "https:") {
      navigator.serviceWorker.register("sw.js").catch(function () { /* 오프라인 기능 없이 계속 */ });
    }
  });
})();
