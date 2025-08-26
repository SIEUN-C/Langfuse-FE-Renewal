// 수정코드
import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Info,
  Play,
  RotateCcw,
  Plus,
  Copy,
  Save,
  Wrench,
  BookText,
  Variable,
  Search,
  Minus,
  Edit,
  X,
} from "lucide-react";
import styles from "./Playground.module.css";
import ChatBox from "../../components/ChatBox/ChatBox";
import NewLlmConnectionModal from "./NewLlmConnectionModal";
import PlaygroundPanel from "./PlaygroundPanel";
import NewItemModal from "./NewItemModal";
import SavePromptPopover from "./SavePromptPopover";

// Tools Panel Content Component
const ToolsPanelContent = ({
  attachedTools,
  availableTools,
  onAddTool,
  onRemoveTool,
  onCreateTool,
}) => (
  <>
    {attachedTools.map((tool) => (
      <div className={styles.toolSection} key={tool.id}>
        <div className={styles.toolItem}>
          <div className={styles.toolInfo}>
            <Wrench size={14} />
            <div className={styles.toolText}>
              <span className={styles.toolName}>{tool.name}</span>
              <span className={styles.toolDesc}>{tool.description}</span>
            </div>
          </div>
          <div className={styles.iconCircle} onClick={() => onRemoveTool(tool.id)}>
            <Minus size={14} />
          </div>
        </div>
      </div>
    ))}

    <div className={styles.toolSearch}>
      <Search size={14} />
      <input type="text" placeholder="Search tools..." />
    </div>

    <div className={styles.toolList}>
      {availableTools.map((tool) => (
        <div
          className={styles.toolItem}
          key={tool.id}
          onDoubleClick={() => onAddTool(tool)}
        >
          <div className={styles.toolInfo}>
            <Wrench size={14} />
            <div className={styles.toolText}>
              <span className={styles.toolName}>{tool.name}</span>
              <span className={styles.toolDesc}>{tool.description}</span>
            </div>
          </div>
          <button className={styles.editButton}>
            <Edit size={14} />
          </button>
        </div>
      ))}
    </div>

    <button className={styles.toolButton} onClick={onCreateTool}>
      <Plus size={14} /> Create new tool
    </button>
  </>
);

// Schema Panel Content Component
const SchemaPanelContent = ({
  userSchema,
  onAddSchema,
  onRemoveSchema,
  availableSchemas,
  onCreateSchema,
}) => (
  <>
    {userSchema && (
      <div className={styles.toolSection}>
        <div className={styles.toolItem}>
          <div className={styles.toolInfo}>
            <BookText size={14} />
            <div className={styles.toolText}>
              <span className={styles.toolName}>{userSchema.name}</span>
              <span className={styles.toolDesc}>{userSchema.description}</span>
            </div>
          </div>
          <div className={styles.iconCircle} onClick={() => onRemoveSchema(userSchema.id)}>
            <Minus size={14} />
          </div>
        </div>
      </div>
    )}

    <div className={styles.toolSearch}>
      <Search size={14} />
      <input type="text" placeholder="Search schemas..." />
    </div>

    <div className={styles.toolList}>
      {availableSchemas.map((schema) => (
        <div
          className={styles.toolItem}
          key={schema.id}
          onDoubleClick={() => onAddSchema(schema)}
        >
          <div className={styles.toolInfo}>
            <div className={styles.toolText}>
              <span className={styles.toolName}>{schema.name}</span>
              <span className={styles.toolDesc}>{schema.description}</span>
            </div>
          </div>
          <button className={styles.editButton}>
            <Edit size={14} />
          </button>
        </div>
      ))}
    </div>

    <button className={styles.toolButton} onClick={onCreateSchema}>
      <Plus size={14} /> Create new schema
    </button>
  </>
);

// [수정] PlaygroundComponent가 초기 데이터를 받을 수 있도록 props를 추가합니다 (initialData).
const PlaygroundComponent = ({ onCopy, onRemove, showRemoveButton, initialData }) => {
  
  // [수정] messages state의 초기값을 initialData에서 가져오도록 변경합니다.
  const [messages, setMessages] = useState(initialData?.messages || []);

  // [추가] 전달받은 프롬프트 정보를 표시하기 위한 state를 추가합니다.
  const [loadedPrompt, setLoadedPrompt] = useState(
    initialData ? { name: initialData.promptName, version: initialData.promptVersion } : null
  );

  const [isLlmModalOpen, setIsLlmModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'tool' | 'schema' | null
  const [activePanel, setActivePanel] = useState(null); // 'tools' | 'schema' | null
  const [isSavePopoverOpen, setIsSavePopoverOpen] = useState(false);

  const [attachedTools, setAttachedTools] = useState([]);
  const [availableTools] = useState([
    { id: "tool-1", name: "tool", description: "ddd" },
    { id: "tool-2", name: "search_web", description: "Search the web for information." },
  ]);

  const [attachedUserSchema, setAttachedUserSchema] = useState(null);
  const [availableSchemas] = useState([
    { id: "schema-1", name: "waetae", description: "weddfwe" },
  ]);

  const togglePanel = (panelName) => {
    setActivePanel(activePanel === panelName ? null : panelName);
  };

  const handleAddTool = (toolToAdd) => {
    if (!attachedTools.some((t) => t.id === toolToAdd.id)) {
      setAttachedTools((prev) => [...prev, toolToAdd]);
    }
  };

  const handleRemoveTool = (toolId) => {
    setAttachedTools((prev) => prev.filter((t) => t.id !== toolId));
  };

  const handleAddSchema = (schemaToAdd) => {
    setAttachedUserSchema(schemaToAdd);
  };

  const handleRemoveSchema = (schemaId) => {
    if (attachedUserSchema && attachedUserSchema.id === schemaId) {
      setAttachedUserSchema(null);
    }
  };

  const API_URL = "/api/chatCompletion";
  const PROJECT_ID = "cmekxpet50001qe07qeelt05h";
  const DEFAULT_PROVIDER = "openai";
  const DEFAULT_ADAPTER = "openai";
  const DEFAULT_MODEL = "gpt-4o-mini";
  const [output, setOutput] = useState(null);

  function toServerBody(messages, { projectId, provider, adapter, model }) {
    const toRole = (role) => (role || "user").toLowerCase();
    const toType = (role) => {
      const r = toRole(role);
      if (r === "assistant") return "assistant";
      if (r === "system") return "system";
      if (r === "developer") return "developer";
      return "user";
    };

    const chat = messages
      .filter((m) => m.kind !== "placeholder" && m.role !== "Placeholder")
      .map((m) => ({
        type: toType(m.role),
        role: toRole(m.role),
        content: (m.content || "").trim(),
      }));

    return {
      projectId,
      messages: chat,
      modelParams: {
        provider,
        adapter,
        model,
        temperature: 0.7,
      },
      streaming: false,
    };
  }

  async function handleSubmit() {
    const body = toServerBody(messages, {
      projectId: PROJECT_ID,
      provider: DEFAULT_PROVIDER,
      adapter: DEFAULT_ADAPTER,
      model: DEFAULT_MODEL,
    });

    if (body.messages.length === 0 || body.messages.every((m) => !m.content)) {
      alert("Please add at least one message with content");
      return;
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Chat error", err);
        alert(err?.message || "Chat failed");
        return;
      }

      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json")
        ? await res.json()
        : { content: await res.text() };

      setOutput(data);
      console.log("[playground/chat] sent:", body);
      console.log("[playground/chat] received:", data);
    } catch (e) {
      console.error("Submit failed", e);
      alert("실행 중 오류가 발생했습니다. 콘솔을 확인하세요.");
    }
  }

  return (
    <div className={styles.panelContainer}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span>{loadedPrompt ? `${loadedPrompt.name} (v${loadedPrompt.version})` : 'Model'}</span>
          <div className={styles.cardActions}>
            <button className={styles.iconActionBtn} onClick={onCopy}>
              <Copy size={16} />
            </button>
            <button
              className={styles.iconActionBtn}
              onClick={() => setIsSavePopoverOpen((prev) => !prev)}
            >
              <Save size={16} />
            </button>
            {showRemoveButton && (
              <button className={styles.iconActionBtn} onClick={onRemove}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className={styles.cardBody}>
          <p className={styles.noApiKeyText}>No LLM API key set in project.</p>
          <button className={styles.addLlmBtn} onClick={() => setIsLlmModalOpen(true)}>
            <Plus size={16} /> Add LLM Connection
          </button>
        </div>

        {isSavePopoverOpen && (
          <SavePromptPopover onSaveAsNew={() => console.log("onSaveAsNew")} />
        )}
      </div>

      <div className={styles.controlsBar}>
        <button className={styles.controlBtn} onClick={() => togglePanel("tools")}>
          <Wrench size={14} /> Tools{" "}
          <span className={styles.badge}>{attachedTools.length}</span>
        </button>
        <button className={styles.controlBtn} onClick={() => togglePanel("schema")}>
          <BookText size={14} /> Schema{" "}
          <span className={styles.badge}>{attachedUserSchema ? 1 : 0}</span>
        </button>
        <button className={styles.controlBtn}>
          <Variable size={14} /> Variables
        </button>
      </div>

      {activePanel === "tools" && (
        <PlaygroundPanel title="Tools" description="Configure tools for your model to use.">
          <ToolsPanelContent
            attachedTools={attachedTools}
            availableTools={availableTools}
            onAddTool={handleAddTool}
            onRemoveTool={handleRemoveTool}
            onCreateTool={() => setModalType("tool")}
          />
        </PlaygroundPanel>
      )}

      {activePanel === "schema" && (
        <PlaygroundPanel
          title="Structured Output"
          description="Configure JSON schema for structured output."
        >
          <SchemaPanelContent
            userSchema={attachedUserSchema}
            availableSchemas={availableSchemas}
            onAddSchema={handleAddSchema}
            onRemoveSchema={handleRemoveSchema}
            onCreateSchema={() => setModalType("schema")}
          />
        </PlaygroundPanel>
      )}

      <ChatBox messages={messages} setMessages={setMessages} />

      <div className={styles.outputCard}>
        <div className={styles.cardHeader}>
          <span>Output</span>
        </div>
        <div className={styles.outputBody}>
          <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
            {output ? JSON.stringify(output, null, 2) : ""}
          </pre>
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.submitBtn} onClick={handleSubmit}>
          Submit
        </button>
      </div>

      <NewLlmConnectionModal
        isOpen={isLlmModalOpen}
        onClose={() => setIsLlmModalOpen(false)}
      />
      {modalType && (
        <NewItemModal isOpen={!!modalType} type={modalType} onClose={() => setModalType(null)} />
      )}
    </div>
  );
};

// ===== 메인 컴포넌트 =====
export default function Playground() {
  const location = useLocation();
  const initialPanelState = location.state;

  const [panels, setPanels] = useState([
    { id: Date.now(), initialData: initialPanelState }
  ]);

  const addPanel = () => setPanels((prev) => [...prev, { id: Date.now(), initialData: null }]);
  const removePanel = (idToRemove) => {
    if (panels.length > 1) setPanels((prev) => prev.filter((p) => p.id !== idToRemove));
  };
  const resetPlayground = () => setPanels([{ id: Date.now(), initialData: null }]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          Playground <Info size={16} />
        </div>
        <div className={styles.actions}>
          <span className={styles.windowInfo}>{panels.length} windows</span>
          <button className={styles.actionBtn} onClick={addPanel}>
            <Plus size={16} /> Add Panel
          </button>
          <button className={styles.actionBtn}>
            <Play size={16} /> Run All (Ctrl + Enter)
          </button>
          <button className={styles.actionBtn} onClick={resetPlayground}>
            <RotateCcw size={16} /> Reset playground
          </button>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {panels.map((panel) => (
          <PlaygroundComponent
            key={panel.id}
            initialData={panel.initialData}
            onCopy={addPanel}
            onRemove={() => removePanel(panel.id)}
            showRemoveButton={panels.length > 1}
          />
        ))}
      </div>
    </div>
  );
}


// 기존코드
// import { useState } from "react";
// import {
//   Info,
//   Play,
//   RotateCcw,
//   Plus,
//   Copy,
//   Save,
//   Wrench,
//   BookText,
//   Variable,
//   Search,
//   Minus,
//   Edit,
//   X,
// } from "lucide-react";
// import styles from "./Playground.module.css";
// import ChatBox from "../../components/ChatBox/ChatBox";
// import NewLlmConnectionModal from "./NewLlmConnectionModal";
// import PlaygroundPanel from "./PlaygroundPanel";
// import NewItemModal from "./NewItemModal";
// import SavePromptPopover from "./SavePromptPopover";

// // 참고: JS 전환으로 타입은 제거했지만 구조는 동일하게 유지
// // Tool: { id, name, description }
// // Schema: { id, name, description }

// // Tools Panel Content Component
// const ToolsPanelContent = ({
//   attachedTools,
//   availableTools,
//   onAddTool,
//   onRemoveTool,
//   onCreateTool,
// }) => (
//   <>
//     {attachedTools.map((tool) => (
//       <div className={styles.toolSection} key={tool.id}>
//         <div className={styles.toolItem}>
//           <div className={styles.toolInfo}>
//             <Wrench size={14} />
//             <div className={styles.toolText}>
//               <span className={styles.toolName}>{tool.name}</span>
//               <span className={styles.toolDesc}>{tool.description}</span>
//             </div>
//           </div>
//           <div className={styles.iconCircle} onClick={() => onRemoveTool(tool.id)}>
//             <Minus size={14} />
//           </div>
//         </div>
//       </div>
//     ))}

//     <div className={styles.toolSearch}>
//       <Search size={14} />
//       <input type="text" placeholder="Search tools..." />
//     </div>

//     <div className={styles.toolList}>
//       {availableTools.map((tool) => (
//         <div
//           className={styles.toolItem}
//           key={tool.id}
//           onDoubleClick={() => onAddTool(tool)}
//         >
//           <div className={styles.toolInfo}>
//             <Wrench size={14} />
//             <div className={styles.toolText}>
//               <span className={styles.toolName}>{tool.name}</span>
//               <span className={styles.toolDesc}>{tool.description}</span>
//             </div>
//           </div>
//           <button className={styles.editButton}>
//             <Edit size={14} />
//           </button>
//         </div>
//       ))}
//     </div>

//     <button className={styles.toolButton} onClick={onCreateTool}>
//       <Plus size={14} /> Create new tool
//     </button>
//   </>
// );

// // Schema Panel Content Component
// const SchemaPanelContent = ({
//   userSchema,
//   onAddSchema,
//   onRemoveSchema,
//   availableSchemas,
//   onCreateSchema,
// }) => (
//   <>
//     {userSchema && (
//       <div className={styles.toolSection}>
//         <div className={styles.toolItem}>
//           <div className={styles.toolInfo}>
//             <BookText size={14} />
//             <div className={styles.toolText}>
//               <span className={styles.toolName}>{userSchema.name}</span>
//               <span className={styles.toolDesc}>{userSchema.description}</span>
//             </div>
//           </div>
//           <div className={styles.iconCircle} onClick={() => onRemoveSchema(userSchema.id)}>
//             <Minus size={14} />
//           </div>
//         </div>
//       </div>
//     )}

//     <div className={styles.toolSearch}>
//       <Search size={14} />
//       <input type="text" placeholder="Search schemas..." />
//     </div>

//     <div className={styles.toolList}>
//       {availableSchemas.map((schema) => (
//         <div
//           className={styles.toolItem}
//           key={schema.id}
//           onDoubleClick={() => onAddSchema(schema)}
//         >
//           <div className={styles.toolInfo}>
//             <div className={styles.toolText}>
//               <span className={styles.toolName}>{schema.name}</span>
//               <span className={styles.toolDesc}>{schema.description}</span>
//             </div>
//           </div>
//           <button className={styles.editButton}>
//             <Edit size={14} />
//           </button>
//         </div>
//       ))}
//     </div>

//     <button className={styles.toolButton} onClick={onCreateSchema}>
//       <Plus size={14} /> Create new schema
//     </button>
//   </>
// );

// // 단일 패널 컴포넌트
// const PlaygroundComponent = ({ onCopy, onRemove, showRemoveButton }) => {
//   // ChatBox가 기대하는 메시지 구조: [{ role: "user"|"assistant"|"system", content: "..." }, ...] 같은 형태라면 아래 초기값을 비워둔다.
//   const [messages, setMessages] = useState([]);
//   const [isLlmModalOpen, setIsLlmModalOpen] = useState(false);
//   const [modalType, setModalType] = useState(null); // 'tool' | 'schema' | null
//   const [activePanel, setActivePanel] = useState(null); // 'tools' | 'schema' | null
//   const [isSavePopoverOpen, setIsSavePopoverOpen] = useState(false);

//   const [attachedTools, setAttachedTools] = useState([]);
//   const [availableTools] = useState([
//     { id: "tool-1", name: "tool", description: "ddd" },
//     { id: "tool-2", name: "search_web", description: "Search the web for information." },
//   ]);

//   const [attachedUserSchema, setAttachedUserSchema] = useState(null);
//   const [availableSchemas] = useState([
//     { id: "schema-1", name: "waetae", description: "weddfwe" },
//   ]);

//   const togglePanel = (panelName) => {
//     setActivePanel(activePanel === panelName ? null : panelName);
//   };

//   const handleAddTool = (toolToAdd) => {
//     if (!attachedTools.some((t) => t.id === toolToAdd.id)) {
//       setAttachedTools((prev) => [...prev, toolToAdd]);
//     }
//   };

//   const handleRemoveTool = (toolId) => {
//     setAttachedTools((prev) => prev.filter((t) => t.id !== toolId));
//   };

//   const handleAddSchema = (schemaToAdd) => {
//     setAttachedUserSchema(schemaToAdd);
//   };

//   const handleRemoveSchema = (schemaId) => {
//     if (attachedUserSchema && attachedUserSchema.id === schemaId) {
//       setAttachedUserSchema(null);
//     }
//   };

//   // ====== 서버 호출에 필요한 상수/도우미/상태/핸들러 추가 시작 ======

//   // 서버 route.ts에서 확인한 URL : web/src/app/api/chatCompletion/route.ts
//   const API_URL = "/api/chatCompletion";

//   // 일단 하드코딩. 나중에 프로젝트/LLM 선택 UI와 연동 가능
//   const PROJECT_ID = "cmekxpet50001qe07qeelt05h";
//   const DEFAULT_PROVIDER = "openai";
//   const DEFAULT_ADAPTER = "openai";      // ← 스키마상 'adapter'는 필수
//   const DEFAULT_MODEL = "gpt-4o-mini";   // LLM Connection에서 쓰는 모델명으로 교체 가능

//   // Output 표시용 상태
//   const [output, setOutput] = useState(null);

//   // ChatBox → 서버 바디 변환
//   function toServerBody(messages, { projectId, provider, adapter, model }) {
//     const toRole = (role) => (role || "user").toLowerCase(); // "System"→"system"
//     const toType = (role) => {
//       const r = toRole(role);
//       // role ↔ type 매핑(기본 1:1)
//       if (r === "assistant") return "assistant";
//       if (r === "system") return "system";
//       if (r === "developer") return "developer";
//       return "user";
//     };

//     const chat = messages
//       .filter((m) => m.kind !== "placeholder" && m.role !== "Placeholder")
//       .map((m) => ({
//         type: toType(m.role),
//         role: toRole(m.role),
//         content: (m.content || "").trim(),
//       }));

//     return {
//       projectId,
//       messages: chat,
//       modelParams: {
//         provider,
//         adapter,   // 필수!
//         model,
//         temperature: 0.7,
//       },
//       streaming: false,
//     };
//   }

//   // Submit 핸들러
//   async function handleSubmit() {
//     const body = toServerBody(messages, {
//       projectId: PROJECT_ID,
//       provider: DEFAULT_PROVIDER,
//       adapter: DEFAULT_ADAPTER,
//       model: DEFAULT_MODEL,
//     });

//     // 간단 유효성 (서버에서도 검증하지만, UX를 위해 프론트에서 미리)
//     if (body.messages.length === 0 || body.messages.every((m) => !m.content)) {
//       alert("Please add at least one message with content");
//       return;
//     }

//     try {
//       const res = await fetch(API_URL, {
//         method: "POST",
//         headers: { "content-type": "application/json" },
//         credentials: "include", // next-auth 세션 쿠키 전달 (프록시가 3000에 붙어 있어야 함)
//         body: JSON.stringify(body),
//       });

//       if (!res.ok) {
//         const err = await res.json().catch(() => ({}));
//         console.error("Chat error", err);
//         alert(err?.message || "Chat failed");
//         return;
//       }

//       const ct = res.headers.get("content-type") || "";
//       const data = ct.includes("application/json")
//         ? await res.json()
//         : { content: await res.text() };

//       setOutput(data); // Output 카드에 표시
//       console.log("[playground/chat] sent:", body);
//       console.log("[playground/chat] received:", data);
//     } catch (e) {
//       console.error("Submit failed", e);
//       alert("실행 중 오류가 발생했습니다. 콘솔을 확인하세요.");
//     }
//   }
//   // ====== 서버 호출에 필요한 상수/도우미/상태/핸들러 추가 끝 ======





//   return (
//     <div className={styles.panelContainer}>
//       <div className={styles.card}>
//         <div className={styles.cardHeader}>
//           <span>Model</span>
//           <div className={styles.cardActions}>
//             <button className={styles.iconActionBtn} onClick={onCopy}>
//               <Copy size={16} />
//             </button>
//             <button
//               className={styles.iconActionBtn}
//               onClick={() => setIsSavePopoverOpen((prev) => !prev)}
//             >
//               <Save size={16} />
//             </button>
//             {showRemoveButton && (
//               <button className={styles.iconActionBtn} onClick={onRemove}>
//                 <X size={16} />
//               </button>
//             )}
//           </div>
//         </div>

//         <div className={styles.cardBody}>
//           <p className={styles.noApiKeyText}>No LLM API key set in project.</p>
//           <button className={styles.addLlmBtn} onClick={() => setIsLlmModalOpen(true)}>
//             <Plus size={16} /> Add LLM Connection
//           </button>
//         </div>

//         {isSavePopoverOpen && (
//           <SavePromptPopover onSaveAsNew={() => console.log("onSaveAsNew")} />
//         )}
//       </div>

//       <div className={styles.controlsBar}>
//         <button className={styles.controlBtn} onClick={() => togglePanel("tools")}>
//           <Wrench size={14} /> Tools{" "}
//           <span className={styles.badge}>{attachedTools.length}</span>
//         </button>
//         <button className={styles.controlBtn} onClick={() => togglePanel("schema")}>
//           <BookText size={14} /> Schema{" "}
//           <span className={styles.badge}>{attachedUserSchema ? 1 : 0}</span>
//         </button>
//         <button className={styles.controlBtn}>
//           <Variable size={14} /> Variables
//         </button>
//       </div>

//       {activePanel === "tools" && (
//         <PlaygroundPanel title="Tools" description="Configure tools for your model to use.">
//           <ToolsPanelContent
//             attachedTools={attachedTools}
//             availableTools={availableTools}
//             onAddTool={handleAddTool}
//             onRemoveTool={handleRemoveTool}
//             onCreateTool={() => setModalType("tool")}
//           />
//         </PlaygroundPanel>
//       )}

//       {activePanel === "schema" && (
//         <PlaygroundPanel
//           title="Structured Output"
//           description="Configure JSON schema for structured output."
//         >
//           <SchemaPanelContent
//             userSchema={attachedUserSchema}
//             availableSchemas={availableSchemas}
//             onAddSchema={handleAddSchema}
//             onRemoveSchema={handleRemoveSchema}
//             onCreateSchema={() => setModalType("schema")}
//           />
//         </PlaygroundPanel>
//       )}

//       <ChatBox messages={messages} setMessages={setMessages} />

//       <div className={styles.outputCard}>
//         <div className={styles.cardHeader}>
//           <span>Output</span>
//         </div>
//         <div className={styles.outputBody}>
//           <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
//             {output ? JSON.stringify(output, null, 2) : ""}
//           </pre>
//         </div>
//       </div>

//       <div className={styles.footer}>
//         <button className={styles.submitBtn} onClick={handleSubmit}>
//           Submit
//         </button>
//       </div>

//       <NewLlmConnectionModal
//         isOpen={isLlmModalOpen}
//         onClose={() => setIsLlmModalOpen(false)}
//       />
//       {modalType && (
//         <NewItemModal isOpen={!!modalType} type={modalType} onClose={() => setModalType(null)} />
//       )}
//     </div>
//   );
// };

// // ===== 메인 컴포넌트 =====
// export default function Playground() {
//   const [panels, setPanels] = useState([Date.now()]); // 초기 패널 1개

//   const addPanel = () => setPanels((prev) => [...prev, Date.now()]);
//   const removePanel = (idToRemove) => {
//     if (panels.length > 1) setPanels((prev) => prev.filter((id) => id !== idToRemove));
//   };
//   const resetPlayground = () => setPanels([Date.now()]);

//   return (
//     <div className={styles.container}>
//       <div className={styles.header}>
//         <div className={styles.title}>
//           Playground <Info size={16} />
//         </div>
//         <div className={styles.actions}>
//           <span className={styles.windowInfo}>{panels.length} windows</span>
//           <button className={styles.actionBtn} onClick={addPanel}>
//             <Plus size={16} /> Add Panel
//           </button>
//           <button className={styles.actionBtn}>
//             <Play size={16} /> Run All (Ctrl + Enter)
//           </button>
//           <button className={styles.actionBtn} onClick={resetPlayground}>
//             <RotateCcw size={16} /> Reset playground
//           </button>
//         </div>
//       </div>

//       <div className={styles.mainGrid}>
//         {panels.map((id) => (
//           <PlaygroundComponent
//             key={id}
//             onCopy={addPanel}
//             onRemove={() => removePanel(id)}
//             showRemoveButton={panels.length > 1}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }
