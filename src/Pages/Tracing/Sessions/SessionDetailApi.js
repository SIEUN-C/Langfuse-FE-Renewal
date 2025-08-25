// src/pages/Tracing/Sessions/SessionDetailApi.js
import { langfuse } from 'lib/langfuse';

// API 응답값을 UI에 표시하기 안전한 문자열로 변환
const formatTraceValue = (value) => {
    if (value === null || typeof value === 'undefined') {
        return 'N/A';
    }
    if (typeof value === 'string') {
        return value;
    }
    // 객체인 경우, 보기 좋게 2칸 들여쓰기된 JSON 문자열로 변환
    return JSON.stringify(value, null, 2);
};

// API 응답을 UI에서 사용할 데이터 형태로 변환
const transformDataForUi = (apiData) => {
  const uiTraces = apiData.traces.map(trace => {
    const outputString = formatTraceValue(trace.output);
    
    // metadata가 객체인지 확인하고 error 속성에 접근합니다.
    const hasError = typeof trace.metadata === 'object' && trace.metadata !== null && 'error' in trace.metadata && trace.metadata.error === true;
    const summary = outputString.substring(0, 100) + (outputString.length > 100 ? '...' : '');
    const dummyScores = [
        { name: 'helpfulness', value: Math.random() },
        { name: 'conciseness', value: Math.random() },
    ];

    return {
      id: trace.id,
      status: hasError ? 'negative' : 'positive',
      input: trace.input ?? {},
      output: outputString,
      summary: trace.name ?? summary,
      timestamp: new Date(trace.timestamp),
      scores: dummyScores, 
    };
  });

  return {
    id: apiData.id,
    traces: uiTraces,
  };
};


export const fetchSessionDetails = async (sessionId) => {
    try {
        // ▼▼▼ 오류 수정 ▼▼▼
        // { sessionId } 객체 대신 sessionId 문자열을 직접 전달합니다.
        const response = await langfuse.api.sessionsGet(sessionId);
        const apiData = response;
        return transformDataForUi(apiData);
    } catch (error) {
        console.error(`Failed to fetch details for session ${sessionId}:`, error);
        throw new Error('세션 상세 정보를 불러오는 데 실패했습니다.');
    }
};
