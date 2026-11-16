// 마테호른 북스 홈페이지 설정. API_URL = 구글 시트 Apps Script 웹 앱 주소(…/exec). 비우면 예시 데이터로 보이는 미리보기 모드.
// STORE_URL = 네이버 스마트스토어. 도서 탭 '구매 링크'가 비어 있는 책은 여기로 연결됩니다.
window.MB_CONFIG = {
  API_URL: "https://script.google.com/macros/s/AKfycbw8z3Rd2VDyuF_nXZ3PgwjNV5WtiVwnwLwrCGpj64qyJNulpI1V5xoKyd3o40hn8GqJaw/exec",
  STORE_URL: "https://smartstore.naver.com/matterhornbooks",
  // 홈페이지에 보일 책 아이디만 (비우면 도서 탭 전체). 지금은 물질과 에너지 2권만 공개.
  SHOW_BOOKS: ["me2"],
  // 숨길 공지 번호 (1 = 통합과학 기출문제집 물리학 새 책 공지)
  HIDE_NOTICES: [1]
};
