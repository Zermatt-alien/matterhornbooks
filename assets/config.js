// 마테호른 북스 홈페이지 설정. API_URL = 구글 시트 Apps Script 웹 앱 주소(…/exec). 비우면 예시 데이터로 보이는 미리보기 모드.
// STORE_URL = 네이버 스마트스토어. 도서 탭 '구매 링크'가 비어 있는 책은 여기로 연결됩니다.
window.MB_CONFIG = {
  API_URL: "https://script.google.com/macros/s/AKfycbw8z3Rd2VDyuF_nXZ3PgwjNV5WtiVwnwLwrCGpj64qyJNulpI1V5xoKyd3o40hn8GqJaw/exec",
  STORE_URL: "https://smartstore.naver.com/matterhornbooks",
  // 홈페이지에 보일 책 아이디와 순서 (비우면 도서 탭 전체)
  SHOW_BOOKS: ["phys", "me1", "me2", "rw1", "rw2"],
  // 시트 도서 탭에 없거나 비어 있는 칸을 채움 (시트에 값이 있으면 시트가 우선)
  BOOK_INFO: {
    phys: { cover: "assets/img/cover-physics.jpg" },
    me1: { cover: "assets/img/cover-me1.jpg" },
    me2: { target: "Ⅲ. 화학 변화의 자발성 · Ⅳ. 반응 속도", cover: "assets/img/cover-me2.jpg" },
    rw1: { series: "화학 반응의 세계 유형훈련 300제", title: "1권", target: "Ⅰ. 산 염기 평형", cover: "assets/img/cover-rw1.jpg" },
    rw2: { series: "화학 반응의 세계 유형훈련 300제", title: "2권", target: "Ⅱ. 산화·환원 반응", cover: "assets/img/cover-rw2.jpg" }
  },
  // 숨길 공지 번호
  HIDE_NOTICES: []
};
