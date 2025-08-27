import React, { useState, useEffect, useRef } from 'react';
import styles from './NewExperimentModal.module.css';
import { X, ChevronDown, Check } from 'lucide-react';
import { fetchAllPromptNames, fetchVersionsForPrompt } from './NewExperimentModalApi';
import NewLlmConnectionModal from '../Playground/NewLlmConnectionModal';

const NewExperimentModal = ({ isOpen, onClose, onSubmit, promptName, promptVersion }) => {
  // --- 필드 state ---
  const [experimentName, setExperimentName] = useState('');
  const [description, setDescription] = useState('');
  
  // --- Prompt 드롭다운 state ---
  const [allPrompts, setAllPrompts] = useState([]); 
  const [availableVersions, setAvailableVersions] = useState([]); 
  const [selectedPrompt, setSelectedPrompt] = useState(promptName); 
  const [selectedVersion, setSelectedVersion] = useState(promptVersion); 
  
  // --- Model 드롭다운 state ---
  const [providers] = useState(['test', 'openai']); // 임시 데이터
  const [selectedProvider, setSelectedProvider] = useState(providers[0]);
  const [isProviderDropdownOpen, setProviderDropdownOpen] = useState(false);
  const providerRef = useRef(null);
  
  // --- LLM 연결 모달 state ---
  const [isLlmModalOpen, setIsLlmModalOpen] = useState(false);

  // --- 나머지 임시 데이터 ---
  const [models] = useState(['Qwen3-30B-A3B-Instruct-2507-UD', 'gpt-4']);
  const [datasets] = useState(['Select a dataset', 'dataset-1', 'dataset-2']);

  // 모달이 열릴 때 모든 프롬프트 목록을 불러오고 필드를 초기화
  useEffect(() => {
    if (isOpen) {
      const loadAllPrompts = async () => {
        const names = await fetchAllPromptNames();
        setAllPrompts(names);
      };
      loadAllPrompts();
      setExperimentName('');
      setDescription('');
      setSelectedPrompt(promptName);
      setSelectedVersion(promptVersion);
    }
  }, [isOpen, promptName, promptVersion]);

  // 선택된 프롬프트가 바뀔 때마다 버전 목록을 다시 불러옴
  useEffect(() => {
    if (selectedPrompt) {
      const loadVersions = async () => {
        const versions = await fetchVersionsForPrompt(selectedPrompt);
        setAvailableVersions(versions.sort((a, b) => b - a));
        if (!versions.includes(Number(selectedVersion))) {
            setSelectedVersion(versions[0] || '');
        }
      };
      loadVersions();
    }
  }, [selectedPrompt, selectedVersion]);

  // Provider 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (providerRef.current && !providerRef.current.contains(event.target)) {
        setProviderDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  const handleSubmit = () => {
    console.log({
      experimentName,
      description,
      prompt: selectedPrompt,
      version: selectedVersion,
      provider: selectedProvider,
    });
    onSubmit();
  };

  const handlePromptChange = (e) => {
    setSelectedPrompt(e.target.value);
  };
  
  const handleVersionChange = (e) => {
    setSelectedVersion(Number(e.target.value));
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <div>
              <h2 className={styles.title}>New Prompt Experiment</h2>
              <p className={styles.subtitle}>
                Create an experiment to test a prompt version on a dataset. 
                <a href="#" className={styles.docLink}>See documentation</a> to learn more.
              </p>
            </div>
            <button type="button" onClick={onClose} className={styles.closeButton}>
              <X size={20} />
            </button>
          </div>
          <div className={styles.body}>
            {/* [복원] Experiment name 입력 필드 */}
            <div className={styles.formGroup}>
              <label htmlFor="experiment-name">Experiment name (optional)</label>
              <input
                id="experiment-name"
                type="text"
                className={styles.input}
                value={experimentName}
                onChange={(e) => setExperimentName(e.target.value)}
              />
            </div>

            {/* [복원] Description 입력 필드 */}
            <div className={styles.formGroup}>
              <label htmlFor="description">Description (optional)</label>
              <textarea
                id="description"
                className={styles.textarea}
                rows="3"
                placeholder="Add description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* [복원] Prompt 섹션 */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Prompt</h3>
              <div className={styles.inlineGroup}>
                <div className={styles.selectWrapper} style={{ flex: 2 }}>
                  <select 
                    className={styles.select} 
                    value={selectedPrompt} 
                    onChange={handlePromptChange}
                  >
                    {allPrompts.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <ChevronDown size={16} className={styles.selectIcon} />
                </div>
                <div className={styles.selectWrapper} style={{ flex: 1 }}>
                  <select 
                    className={styles.select} 
                    value={selectedVersion} 
                    onChange={handleVersionChange}
                    disabled={availableVersions.length === 0}
                  >
                    {availableVersions.map(v => <option key={v} value={v}>Version {v}</option>)}
                  </select>
                  <ChevronDown size={16} className={styles.selectIcon} />
                </div>
              </div>
            </div>

            {/* [수정 완료] Model 섹션 (커스텀 드롭다운 포함) */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Model</h3>
              <div className={styles.formGroup}>
                <label>Provider</label>
                <div className={styles.customSelectContainer} ref={providerRef}>
                  <button 
                    className={styles.selectButton} 
                    onClick={() => setProviderDropdownOpen(prev => !prev)}
                  >
                    <span>{selectedProvider}</span>
                    <ChevronDown size={16} className={styles.selectIcon} />
                  </button>
                  {isProviderDropdownOpen && (
                    <div className={styles.dropdownMenu}>
                      {providers.map(p => (
                        <div 
                          key={p} 
                          className={styles.dropdownItem} 
                          onClick={() => {
                            setSelectedProvider(p);
                            setProviderDropdownOpen(false);
                          }}
                        >
                          {p}
                          {selectedProvider === p && <Check size={16} />}
                        </div>
                      ))}
                      <div className={styles.dropdownDivider}></div>
                      <div 
                        className={`${styles.dropdownItem} ${styles.actionItem}`}
                        onClick={() => {
                          setIsLlmModalOpen(true);
                          setProviderDropdownOpen(false);
                        }}
                      >
                        + Add LLM Connection
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Model name</label>
                <div className={styles.selectWrapper}>
                  <select className={styles.select}>
                    {models.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDown size={16} className={styles.selectIcon} />
                </div>
              </div>
            </div>

            {/* [복원] Dataset 섹션 */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Dataset (expected columns)</h3>
              <div className={styles.selectWrapper}>
                <select className={styles.select}>
                  {datasets.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown size={16} className={styles.selectIcon} />
              </div>
            </div>

            {/* [복원] Evaluators 섹션 */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Evaluators</h3>
              <p className={styles.evaluatorInfo}>Select a dataset first to set up evaluators.</p>
            </div>
          </div>
          <div className={styles.footer}>
            <button type="button" className={styles.createButton} onClick={handleSubmit}>
              Create
            </button>
          </div>
        </div>
      </div>
      
      <NewLlmConnectionModal 
        isOpen={isLlmModalOpen} 
        onClose={() => setIsLlmModalOpen(false)} 
      />
    </>
  );
};

export default NewExperimentModal;