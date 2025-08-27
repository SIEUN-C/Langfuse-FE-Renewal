import { langfuse } from 'lib/langfuse';
import axios from 'axios';

/**
 * [안정화 버전] 프롬프트 목록 전체를 가져옵니다.
 * 이 버전은 SDK 대신 안정적인 tRPC API를 직접 호출하여 숫자 이름 등 모든 경우에 동작합니다.
 */
export const fetchPrompts = async () => {
  try {
    const projectId = "cmei859qe0006md08gdckbscu"; // 이 부분은 동적으로 가져오도록 개선하는 것이 좋습니다.
    // ▼▼▼ API가 요구하는 모든 파라미터를 포함하도록 수정 ▼▼▼
    const params = {
      json: {
        projectId: projectId,
        page: 0,
        limit: 50,
        filter: [], // 필수: 필터 배열 추가
        orderBy: { column: "createdAt", order: "DESC" },
        searchQuery: null, // 필수: 검색어 추가
      },
      meta: {
        values: {
          searchQuery: ["undefined"]
        }
      }
    };
    // ▲▲▲ 여기까지 수정 ▲▲▲

    const url = `/api/trpc/prompts.all?input=${encodeURIComponent(JSON.stringify(params))}`;
    const response = await axios.get(url);

    // tRPC 응답 구조에 맞게 실제 데이터 경로를 반환합니다.
    const promptsFromServer = response.data.result.data.json.prompts;

    return promptsFromServer.map((prompt) => ({
      id: prompt.name,
      name: prompt.name,
      versions: prompt.version,
      type: prompt.type,
      observations: 0,
      latestVersionCreatedAt: new Date(prompt.createdAt).toLocaleString(),
      tags: prompt.tags || [],
    }));

  } catch (error) {
    console.error("Failed to fetch prompts via tRPC:", error);
    throw new Error(error.response?.data?.error?.message || "Failed to fetch prompts.");
  }
};

// --- [삭제 기능] ---

const getAllPromptVersions = async (promptName, projectId) => {
  const params = { json: { name: promptName, projectId } };
  const url = `/api/trpc/prompts.allVersions?input=${encodeURIComponent(JSON.stringify(params))}`;
  const response = await axios.get(url);
  return response.data.result.data.json.promptVersions;
};

const deletePromptVersion = async (promptVersionId, projectId) => {
  await axios.post('/api/trpc/prompts.deleteVersion', {
    json: {
      promptVersionId,
      projectId,
    },
  });
};

export const deletePrompt = async (promptName) => {
  try {
    const projectId = "cmei859qe0006md08gdckbscu";
    const versions = await getAllPromptVersions(promptName, projectId);
    if (versions.length === 0) return;
    await Promise.all(
      versions.map(version => deletePromptVersion(version.id, projectId))
    );
  } catch (error) {
    console.error(`Failed to delete prompt ${promptName}:`, error);
    const errorMessage = error.response?.data?.error?.message || `Failed to delete prompt '${promptName}'.`;
    throw new Error(errorMessage);
  }
};

// --- 프롬프트 상세 페이지 및 생성 관련 함수들 ---
// 이 함수들은 SDK를 사용해도 큰 문제가 없으므로 그대로 둡니다.
export const fetchPromptVersions = async (promptName) => {
    const response = await langfuse.api.promptsGet({ promptName });
    // ... (기존 코드와 동일)
    const versionsResponse = response ? [response] : [];
    const isChatPrompt = (prompt) => Array.isArray(prompt);

    return versionsResponse.map((v) => {
      const pythonCode = `from langfuse import Langfuse

    # Initialize langfuse client
    langfuse = Langfuse()

    # Get production prompt
    prompt = langfuse.get_prompt("${v.name}")

    # Get by Label
    # You can use as many labels as you'd like to identify different deployment targets
    prompt = langfuse.get_prompt("${v.name}", label="latest")

    # Get by version number, usually not recommended as it requires code changes to deploy new prompt versions
    langfuse.get_prompt("${v.name}", version=${v.version})`;
      const jsTsCode = `import { Langfuse } from "langfuse";

    // Initialize the langfuse client
    const langfuse = new Langfuse();

    // Get production prompt
    const prompt = await langfuse.getPrompt("${v.name}");

    // Get by Label
    # You can use as many labels as you'd like to identify different deployment targets
    const prompt = await langfuse.getPrompt("${v.name}", { label: "latest" });

    # Get by version number, usually not recommended as it requires code changes to deploy new prompt versions
    langfuse.getPrompt("${v.name}", { version: ${v.version} });`;

        return {
            id: v.version,
            label: v.commitMessage || `Version ${v.version}`,
            labels: v.labels,
            details: v.updatedAt ? new Date(v.updatedAt).toLocaleString() : 'N/A',
            author: v.createdBy,
            prompt: {
                user: isChatPrompt(v.prompt) ? v.prompt.find(p => p.role === 'user')?.content ?? '' : v.prompt,
                system: isChatPrompt(v.prompt) ? v.prompt.find(p => p.role === 'system')?.content : undefined,
            },
            config: v.config,
            useprompts: { python: pythonCode, jsTs: jsTsCode },
            tags: v.tags,
            commitMessage: v.commitMessage,
        };
    }).sort((a, b) => b.id - a.id);
};

/**
 * [tRPC API 직접 호출] 프롬프트의 태그를 업데이트합니다.
 * @param {string} promptName - 태그를 수정할 프롬프트의 이름
 * @param {string[]} tags - 새로운 태그 목록 (배열)
 * @param {string} projectId - 프로젝트 ID
 */
export const updatePromptTags = async (promptName, tags, projectId) => {
  try {
    await axios.post('/api/trpc/prompts.updateTags', {
      json: {
        projectId,
        name: promptName,
        tags,
      },
    });
  } catch (error) {
    console.error(`Failed to update tags for prompt ${promptName}:`, error);
    throw new Error(error.response?.data?.error?.message || 'Failed to update tags.');
  }
};