import React, { useState, useEffect, useMemo } from 'react';
import styles from './PromptsReference.module.css';
import { fetchPromptLinkOptions } from './promptsApi';
import { X, Clipboard, ExternalLink } from 'lucide-react'; // ExternalLink 아이콘 추가

const PromptsReference = ({ onClose, onInsert }) => {
  const [prompts, setPrompts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPromptName, setSelectedPromptName] = useState('');
  const [referenceBy, setReferenceBy] = useState('Version');
  const [selectedValue, setSelectedValue] = useState('');

  useEffect(() => {
    const loadPrompts = async () => {
      setIsLoading(true);
      const availablePrompts = await fetchPromptLinkOptions();
      setPrompts(availablePrompts);
      if (availablePrompts.length > 0) {
        setSelectedPromptName(availablePrompts[0].name);
        // 기본값으로 첫 프롬프트의 첫 버전을 선택
        setReferenceBy('Version');
        if(availablePrompts[0].versions?.length > 0) {
          setSelectedValue(availablePrompts[0].versions[0]);
        }
      }
      setIsLoading(false);
    };
    loadPrompts();
  }, []);

  const selectedPromptObject = useMemo(() => {
    return prompts.find(p => p.name === selectedPromptName);
  }, [selectedPromptName, prompts]);

  // ▼▼▼ [수정] 태그 형식을 요청하신 내용으로 변경 ▼▼▼
  const referenceTag = useMemo(() => {
    if (!selectedPromptName || !selectedValue) return '';
    const type = referenceBy.toLowerCase();
    // 태그 형식을 '@@@...@@@'로 수정
    return `@@@langfusePrompt:name=${selectedPromptName}|${type}=${selectedValue}@@@`;
  }, [selectedPromptName, referenceBy, selectedValue]);

  const handlePromptNameChange = (e) => {
    const newPromptName = e.target.value;
    setSelectedPromptName(newPromptName);
    
    // 선택된 프롬프트가 바뀌면, 해당 프롬프트의 첫 번째 버전/라벨을 기본 선택
    const newPrompt = prompts.find(p => p.name === newPromptName);
    if(newPrompt) {
        if(referenceBy === 'Version' && newPrompt.versions?.length > 0) {
            setSelectedValue(newPrompt.versions[0]);
        } else if (referenceBy === 'Label' && newPrompt.labels?.length > 0) {
            setSelectedValue(newPrompt.labels[0]);
        } else {
            setSelectedValue('');
        }
    }
  };

  const handleReferenceByChange = (e) => {
    const newType = e.target.value;
    setReferenceBy(newType);

    // 참조 타입이 바뀌면, 해당 타입의 첫 번째 값을 기본 선택
    if (selectedPromptObject) {
        if(newType === 'Version' && selectedPromptObject.versions?.length > 0) {
            setSelectedValue(selectedPromptObject.versions[0]);
        } else if (newType === 'Label' && selectedPromptObject.labels?.length > 0) {
            setSelectedValue(selectedPromptObject.labels[0]);
        } else {
            setSelectedValue('');
        }
    }
  };

  // ▼▼▼ [수정] 버튼 클릭 시 태그를 삽입하는 기능으로 변경 ▼▼▼
  const handleInsert = () => {
    if (referenceTag) {
      onInsert(referenceTag);
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* ... (Header, Description 부분은 기존과 동일) ... */}
        <div className={styles.header}>
            <h2 className={styles.title}>Add inline prompt reference</h2>
            <button onClick={onClose} className={styles.closeButton}><X size={20} /></button>
        </div>
        <p className={styles.description}>
            Referenced prompts are dynamically resolved and inserted when fetched via API/SDK. This enables modular design—create complex prompts from reusable, independently maintained components.
        </p>
        
        {/* Prompt Name Dropdown */}
        <div className={styles.formGroup}>
          <label htmlFor="prompt-name" className={styles.label}>Prompt name</label>
          <select id="prompt-name" className={styles.select} value={selectedPromptName} onChange={handlePromptNameChange} disabled={isLoading || prompts.length === 0}>
            {isLoading ? <option>Loading...</option> : 
             prompts.length > 0 ? prompts.map(p => <option key={p.name} value={p.name}>{p.name}</option>) :
             <option>No text prompts found</option>
            }
          </select>
          <p className={styles.subLabel}>Only text prompts can be referenced inline.</p>
        </div>

        {/* Reference by & Conditional Dropdowns */}
        {selectedPromptObject && (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="reference-by" className={styles.label}>Reference by</label>
              <select id="reference-by" className={styles.select} value={referenceBy} onChange={handleReferenceByChange}>
                <option value="Version">Version</option>
                <option value="Label">Label</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="reference-value" className={styles.label}>{referenceBy}</label>
              <div className={styles.valueSelector}>
                 <select id="reference-value" className={styles.select} value={selectedValue} onChange={e => setSelectedValue(e.target.value)} disabled={!selectedValue && (referenceBy === 'Version' ? selectedPromptObject.versions?.length === 0 : selectedPromptObject.labels?.length === 0)}>
                    <option value="">Select a {referenceBy.toLowerCase()}</option>
                    {referenceBy === 'Version' ? 
                      (selectedPromptObject.versions?.map(v => <option key={v} value={v}>{v}</option>)) :
                      (selectedPromptObject.labels?.map(l => <option key={l} value={l}>{l}</option>))
                    }
                  </select>
                  <button className={styles.linkButton}><ExternalLink size={16}/></button>
              </div>
            </div>
          </>
        )}
        
        {/* ▼▼▼ [추가] Tag Preview 섹션 ▼▼▼ */}
        <div className={styles.formGroup}>
            <label className={styles.label}>Tag preview</label>
            <div className={styles.tagDisplay}>
                <pre>{referenceTag}</pre>
                <button onClick={() => navigator.clipboard.writeText(referenceTag)} className={styles.copyButton}>
                    <Clipboard size={16} />
                </button>
            </div>
            <p className={styles.subLabel}>This tag will be inserted into the prompt content.</p>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button onClick={onClose} className={styles.cancelButton}>Cancel</button>
          <button onClick={handleInsert} className={styles.insertButton} disabled={!referenceTag}>
            Insert
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptsReference;