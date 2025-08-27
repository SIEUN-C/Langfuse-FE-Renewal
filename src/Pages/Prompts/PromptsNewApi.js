import axios from 'axios';

const PROJECT_ID = "cmetj3c160006qp07r33bizpj"
/**
 * [tRPC] 새로운 프롬프트를 생성하거나 새 버전을 만듭니다.
 */
export const createPromptOrVersion = async (params) => {
  const {
    promptName,
    promptType,
    chatContent,
    textContent,
    config,
    labels, // { production: true/false } 형태의 객체
    commitMessage,
  } = params;

  // 1. 활성화된 라벨만 문자열 배열로 변환합니다. (e.g., ["production"] 또는 [])
  const activeLabels = Object.entries(labels)
    .filter(([, isActive]) => isActive)
    .map(([label]) => label);

  // 2. API가 요구하는 payload 형식에 맞게 데이터를 구성합니다.
  const payload = {
    json: {
      projectId: PROJECT_ID, // ⚠️ 이 부분은 나중에 동적으로 가져와야 합니다.
      name: promptName,
      type: promptType.toLowerCase(), // 'Chat' -> 'chat'
      // Chat 타입일 경우와 Text 타입일 경우를 구분하여 prompt 데이터 구성
      prompt: promptType === 'Text'
        ? textContent
        : chatContent
            .filter(msg => msg.role !== 'Placeholder')
            .map(({ role, content }) => ({ role: role.toLowerCase(), content: content || '' })),
      config: JSON.parse(config),
      labels: activeLabels,
      commitMessage: commitMessage || null,
    },
    meta: {
      values: {
        commitMessage: ["undefined"]
      }
    }
  };

  // 3. 안정적인 tRPC API를 직접 호출합니다.
  try {
    // prompts.create API를 사용하여 새 프롬프트 또는 버전을 생성합니다.
    await axios.post('/api/trpc/prompts.create', payload);
  } catch (error) {
    console.error("Failed to create prompt via tRPC:", error);
    throw new Error(error.response?.data?.error?.message || "Failed to create prompt.");
  }
};