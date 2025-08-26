


import { langfuse } from 'lib/langfuse';

// --- API 함수 ---

/**
 * 프롬프트 목록 전체를 가져오고, 각 프롬프트의 최신 버전 정보와 타입을 포함합니다.
 * @returns {Promise<Array<Object>>} UI에 표시될 프롬프트 목록
 */
export const fetchPrompts = async () => {
  // 1. 모든 프롬프트의 기본 목록(이름 위주)을 가져옵니다.
  const listResponse = await langfuse.api.promptsList({});
  
  // 2. 각 프롬프트의 상세 정보를 병렬로 조회합니다.
  const detailedPrompts = await Promise.all(
    listResponse.data.map(promptInfo => 
      langfuse.api.promptsGet({ promptName: promptInfo.name })
    )
  );

  // 3. 상세 정보가 포함된 데이터를 UI 표시용 형태로 가공합니다.
  return detailedPrompts.map((prompt) => ({
    id: prompt.name,
    name: prompt.name,
    versions: prompt.version, // API에서 받은 최신 버전 번호를 사용합니다.
    type: prompt.type,       // API에서 받은 프롬프트 타입을 사용합니다.
    observations: 0, // 이 정보는 현재 API에서 제공되지 않으므로 0으로 유지합니다.
    latestVersionCreatedAt: new Date(prompt.updatedAt).toLocaleString(), // 업데이트된 시간을 보기 좋게 포맷합니다.
    tags: prompt.tags || [],
  }));
};

