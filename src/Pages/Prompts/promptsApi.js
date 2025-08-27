import axios from 'axios';
import { langfuse } from 'lib/langfuse';

const PROJECT_ID = "cmetj3c160006qp07r33bizpj"; // ⚠️ 프로젝트 ID를 한 곳에서 관리

/**
 * [tRPC] 프롬프트 목록 전체를 가져옵니다.
 */
export const fetchPrompts = async () => {
  try {
    const params = {
      json: {
        projectId: PROJECT_ID,
        page: 0,
        limit: 50,
        filter: [],
        orderBy: { column: "createdAt", order: "DESC" },
        searchQuery: null,
      },
      meta: {
        values: {
          searchQuery: ["undefined"]
        }
      }
    };
    const url = `/api/trpc/prompts.all?input=${encodeURIComponent(JSON.stringify(params))}`;
    const response = await axios.get(url);
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
// ========================= 추가 ===============================
/**
 * 인라인 참조에 사용할 수 있는 텍스트 프롬프트 목록을 가져옵니다.
 * @returns {Promise<Array<{id: string, name: string}>>}
 */
export const fetchPromptLinkOptions = async () => {
  try {
    // TODO: 현재 프로젝트 ID를 동적으로 가져와야 합니다.
    // 우선 제공해주신 네트워크 로그에 있는 ID를 임시로 사용합니다.
    const projectId = PROJECT_ID; 

    const input = {
      json: { projectId },
    };

    const url = `/api/trpc/prompts.getPromptLinkOptions?input=${encodeURIComponent(JSON.stringify(input))}`;

    // 'credentials: "include"' 옵션을 추가하여 인증 쿠키를 함께 전송합니다.
    const response = await fetch(url, {
      credentials: 'include', // ★★★ 이 옵션이 핵심입니다!
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const prompts = data.result?.data?.json;

    if (!Array.isArray(prompts)) {
      console.error("API response is not an array:", data);
      return [];
    }
    
    return prompts;
    // return prompts.map(prompt => ({
    //   id: prompt.name,
    //   name: prompt.name,
    // }));

  } catch (error) {
    console.error("Failed to fetch prompt link options:", error);
    return [];
  }
};

// ========================= 추가 =================================
/**
 * [tRPC] 특정 프롬프트의 모든 버전 정보를 가져옵니다. (상세 페이지용)
 */
export const fetchPromptVersions = async (promptName) => {
    try {
        const params = { json: { name: promptName, projectId: PROJECT_ID } };
        const url = `/api/trpc/prompts.allVersions?input=${encodeURIComponent(JSON.stringify(params))}`;
        const response = await axios.get(url);
        const versionsResponse = response.data.result.data.json.promptVersions;

        // API 응답(response.txt)을 기반으로 데이터 가공 로직을 수정합니다.
        return versionsResponse.map((v) => ({
            id: v.version,
            label: v.commitMessage || `Version ${v.version}`,
            labels: v.labels,
            details: v.updatedAt ? new Date(v.updatedAt).toLocaleString() : 'N/A',
            author: v.creator, // `response.txt`에 따르면 'creator' 필드에 사용자 이름이 있습니다.
            prompt: Array.isArray(v.prompt) ? {
                user: v.prompt.find(p => p.role === 'user')?.content ?? '',
                system: v.prompt.find(p => p.role === 'system')?.content,
            } : { user: v.prompt },
            config: v.config,
            tags: v.tags,
            commitMessage: v.commitMessage,
            // useprompts는 API 응답에 없으므로, 필요 시 기본값을 설정합니다.
            useprompts: { python: "# Python code snippet", jsTs: "// JS/TS code snippet" },
        })).sort((a, b) => b.id - a.id);

    } catch (error) {
        console.error(`Failed to fetch versions for prompt ${promptName}:`, error);
        throw new Error(error.response?.data?.error?.message || `Failed to fetch versions for '${promptName}'.`);
    }
};

/**
 * [tRPC] 특정 이름의 프롬프트를 모든 버전을 삭제하여 제거합니다.
 */
export const deletePrompt = async (promptName) => {
  try {
    const versions = await getAllPromptVersions(promptName, PROJECT_ID);
    if (versions.length === 0) return;
    await Promise.all(
      versions.map(version => deletePromptVersion(version.id, PROJECT_ID))
    );
  } catch (error) {
    // 에러 전파는 deletePromptVersion 내부에서 처리
    throw error;
  }
};

const getAllPromptVersions = async (promptName, projectId) => {
    const params = { json: { name: promptName, projectId } };
    const url = `/api/trpc/prompts.allVersions?input=${encodeURIComponent(JSON.stringify(params))}`;
    const response = await axios.get(url);
    return response.data.result.data.json.promptVersions;
};

const deletePromptVersion = async (promptVersionId, projectId) => {
    try {
        await axios.post('/api/trpc/prompts.deleteVersion', {
        json: {
            promptVersionId,
            projectId,
        },
        });
    } catch(error) {
        console.error(`Failed to delete prompt version ${promptVersionId}:`, error);
        const errorMessage = error.response?.data?.error?.message || `Failed to delete prompt version.`;
        throw new Error(errorMessage);
    }
};

/**
 * [tRPC] 프롬프트의 태그를 업데이트합니다.
 */
export const updatePromptTags = async (promptName, tags) => {
  try {
    await axios.post('/api/trpc/prompts.updateTags', {
      json: {
        projectId: PROJECT_ID,
        name: promptName,
        tags,
      },
    });
  } catch (error) {
    console.error(`Failed to update tags for prompt ${promptName}:`, error);
    throw new Error(error.response?.data?.error?.message || 'Failed to update tags.');
  }
};