/**
 * 간단한 프롬프트 목록 더미 데이터
 *
 * 필드 설명:
 * - id: 고유 식별자 (UI 라우팅/선택 값으로 사용)
 * - name: 프롬프트 표시 이름
 * - description: 프롬프트 용도/설명
 * - updated: 최근 수정일 (YYYY-MM-DD) — 목록 정렬/표시에 사용 가능
 */

/** @type {{id:string,name:string,description:string,updated:string}[]} */
export const dummyPrompts = [
  {
    // 긴 글 요약용 프롬프트 — 글을 핵심 bullet points로 압축
    id: "prompt-1",
    name: "Summarization Prompt",
    description: "Summarize long articles into short bullet points.",
    updated: "2025-08-01",
  },
  {
    // 문서/문장 분류용 프롬프트 — 사전 정의된 카테고리로 분류
    id: "prompt-2",
    name: "Classification Prompt",
    description: "Classify input texts into predefined categories.",
    updated: "2025-08-02",
  },
  {
    // 번역용 프롬프트 — 여러 언어로 변환
    id: "prompt-3",
    name: "Translation Prompt",
    description: "Translate input text into multiple languages.",
    updated: "2025-08-03",
  },
];
