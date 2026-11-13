// 마테호른 북스 서비스 워커: 화면 파일은 저장해 두고, 데이터(구글 시트)는 항상 새로 받습니다.
// 화면 파일을 고치면 아래 버전 숫자를 하나 올려 주세요.
const VERSION = "mb-v4";
const SHELL = [
  "index.html", "notice.html", "errata.html", "qna.html",
  "assets/site.css", "assets/tokens.css", "assets/base.css",
  "assets/app.js", "assets/config.js", "assets/gate.js", "assets/sample-data.js",
  "assets/img/cover-physics.jpg", "assets/icons/icon-192.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return; // 구글 시트 요청은 건드리지 않음
  // 새 내용이 먼저, 인터넷이 끊기면 저장해 둔 화면
  e.respondWith(
    fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(VERSION).then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match("index.html")))
  );
});
