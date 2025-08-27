// src/Pages/Prompts/NewExperimentModalApi.js

import { langfuse } from '../../lib/langfuse';

// [디버깅 코드] 사용 가능한 모든 API 함수 목록을 콘솔에 출력
//console.log("사용 가능한 Langfuse API 함수 목록:", langfuse.api);

/**
 * 프로젝트에 있는 모든 프롬프트의 이름을 가져옵니다.
 * @returns {Promise<string[]>} 프롬프트 이름 배열
 */
export const fetchAllPromptNames = async () => {
  try {
    // promptsList를 필터 없이 호출하여 모든 프롬프트를 가져옵니다.
    const response = await langfuse.api.promptsList({});
    const prompts = response.data || [];
    // 중복을 제거하고 이름만 추출하여 반환합니다.
    const promptNames = [...new Set(prompts.map(p => p.name))];
    return promptNames;
  } catch (error) {
    console.error("Failed to fetch all prompt names:", error);
    return [];
  }
};

/**
 * 특정 프롬프트의 모든 버전 번호 목록을 가져옵니다.
 * @param {string} promptName - 조회할 프롬프트의 이름
 * @returns {Promise<number[]>} 버전 번호 배열
 */
export const fetchVersionsForPrompt = async (promptName) => {
  if (!promptName) return [];
  try {
    // promptsList를 이름으로 필터링하여 해당 프롬프트 정보를 가져옵니다.
    const response = await langfuse.api.promptsList({ name: promptName });
    const promptInfo = response.data?.[0];
    return promptInfo?.versions || [];
  } catch (error) {
    console.error(`Failed to fetch versions for prompt "${promptName}":`, error);
    return [];
  }
};

// src/Pages/Prompts/NewExperimentModalApi.js

// ... (fetchAllPromptNames, fetchVersionsForPrompt 함수는 그대로 둡니다)

/**
 * [수정] 프로젝트에 설정된 모든 LLM API Keys(Connections)를 가져옵니다.
 * @returns {Promise<Object[]>} LLM Connection 객체 배열
 */
export const fetchLlmConnections = async () => {
  try {
    // [수정] 'projects.get' API를 호출하여 현재 프로젝트의 상세 정보를 가져옵니다.
    const response = await langfuse.api.projectsGet();
    
    // [수정] 응답 객체 안의 llmApiKeys 배열을 반환합니다.
    return response.llmApiKeys || [];
  } catch (error) {
    console.error("Failed to fetch LLM connections (API Keys) via projectsGet:", error);
    return [];
  }
};