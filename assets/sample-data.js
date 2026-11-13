// 미리보기용 예시 데이터. 구글 시트를 연결하면 쓰이지 않습니다.
// 책 정보는 표지에 적힌 내용만 옮겼고, 정오표·질문은 모양을 보여 주기 위한 예시입니다.
window.MB_SAMPLE = {
  books: [
    { id: "phys", series: "통합과학 기출문제집", title: "물리학", target: "2028학년도 수능 대비",
      intro: "단원별 기출 310문항. 통합과학 기출에서 물리학 기출, 심화까지 이어집니다.", cover: "assets/img/cover-physics.jpg", buy: "", errataPdf: "", isNew: true },
    { id: "chem", series: "통합과학 기출문제집", title: "화학", target: "", intro: "", cover: "", buy: "", errataPdf: "" },
    { id: "bio", series: "통합과학 기출문제집", title: "생명과학", target: "", intro: "", cover: "", buy: "", errataPdf: "" },
    { id: "earth", series: "통합과학 기출문제집", title: "지구과학", target: "", intro: "", cover: "", buy: "", errataPdf: "" },
    { id: "me1", series: "물질과 에너지 유형훈련 300제", title: "1권", target: "", intro: "", cover: "", buy: "", errataPdf: "" },
    { id: "me2", series: "물질과 에너지 유형훈련 300제", title: "2권", target: "", intro: "", cover: "", buy: "", errataPdf: "" }
  ],
  notices: [
    { id: 2, date: "2026-11-13", category: "안내", title: "정오표와 질문은 이 홈페이지에서 받습니다", pinned: true,
      body: "책을 보다가 틀린 곳을 찾았거나 풀이가 궁금하면 질의응답 게시판에 남겨 주세요.\n확인된 오류는 정오표에 올리고, 답변은 게시판에 답니다." },
    { id: 1, date: "2026-11-13", category: "새 책", title: "통합과학 기출문제집 물리학", pinned: false,
      body: "2028학년도 수능 대비 통합과학 기출문제집 물리학 편입니다.\n2016~2026년 학력평가, 2021~2027학년도 모의평가와 수능에서 고른 기출 310문항을 단원별로 실었습니다." }
  ],
  errata: [
    { book: "phys", printing: "1쇄", page: "00", where: "예시 문항", before: "(예시) 수정 전 문구", after: "(예시) 수정 후 문구", date: "2026-11-13" }
  ],
  questions: [
    { id: 2, date: "2026-11-13", name: "예시 학생", book: "phys", title: "(예시) 비밀글 질문", secret: true, answered: false },
    { id: 1, date: "2026-11-13", name: "예시 학생", book: "phys", title: "(예시) 공개 질문은 이렇게 보입니다", secret: false,
      content: "질문 내용이 여기에 보입니다.", answered: true, answer: "답변은 구글 시트의 '답변' 칸에 적으면 여기에 나타납니다.", answerDate: "2026-11-13" }
  ]
};
