// src/pages/Tracing/Sessions/SessionApi.js
import { langfuse } from 'lib/langfuse';

/**
 * Langfuse API에서 세션 목록을 가져옵니다.
 */
export const fetchSessions = async () => {
  try {
    const response = await langfuse.api.sessionsList({});
    const apiResponse = response;

    // API 응답 데이터를 UI에서 사용하는 형태로 변환합니다.
    return apiResponse.data.map((session) => ({
      id: session.id,
      createdAt: new Date(session.createdAt).toLocaleString(),
      environment: session.environment ?? 'default',
      isFavorited: false, 
      duration: 'N/A',
      userIds: 'N/A',
      traces: 0,
      totalCost: 0,
      usage: { input: 0, output: 0 },
      // 필요한 추가 필드를 기본값으로 채워줍니다.
      inputCost: 0,
      outputCost: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      traceTags: [],
    }));
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    throw new Error('세션 목록을 불러오는 데 실패했습니다.');
  }
};