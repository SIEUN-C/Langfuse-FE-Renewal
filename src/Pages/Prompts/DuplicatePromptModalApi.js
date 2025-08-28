const PROJECT_ID = "cmetj3c160006qp07r33bizpj";

/**
 * 프롬프트를 복제하는 API 호출 함수
 * @param {string} sourcePromptId - 복제의 원본이 되는 프롬프트 버전의 고유 DB ID
 * @param {string} newName - 새로 생성될 프롬프트의 이름
 * @param {boolean} copyAllVersions - 모든 버전을 복사할지 여부
 * @returns {Promise<Object>} 생성된 프롬프트 정보
 */
export const duplicatePrompt = async (sourcePromptId, newName, copyAllVersions) => {
  try {
    // TODO: 현재 프로젝트 ID를 동적으로 가져와야 합니다.
    const projectId = PROJECT_ID; 

    // 백엔드 API는 'isSingleVersion' 파라미터를 사용하므로,
    // 프론트엔드의 'copyAllVersions' 값을 반대로 변환해줍니다.
    const isSingleVersion = !copyAllVersions;

    const input = {
      json: {
        projectId,
        promptId: sourcePromptId,
        name: newName,
        isSingleVersion,
      },
    };

    const url = `/api/trpc/prompts.duplicatePrompt`;
    
    const response = await fetch(url, {
      method: 'POST', // 데이터를 생성/변경하므로 POST 메서드 사용
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 인증 쿠키 전송
      body: JSON.stringify(input),
    });

    if (!response.ok) {
        const errorData = await response.json();
        // tRPC 에러는 error.json.message 에 상세 내용이 담겨 있습니다.
        const errorMessage = errorData[0]?.error?.json?.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
    }
    
    const data = await response.json();
    // 성공 시, tRPC 응답 구조에 따라 새로 생성된 프롬프트 정보를 반환합니다.
    return data[0].result.data.json; 
  } catch (error) {
    console.error("Failed to duplicate prompt:", error);
    throw error; // 에러를 상위로 보내 UI에서 처리할 수 있도록 합니다.
  }
};