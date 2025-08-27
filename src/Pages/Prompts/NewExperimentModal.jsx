// src/Pages/Prompts/NewExperimentModal.jsx (전체 코드)

import React, { useState, useEffect, useRef } from 'react';
import styles from './NewExperimentModal.module.css';
import { X, ChevronDown, Check, ExternalLink } from 'lucide-react';
import { fetchAllPromptNames, fetchVersionsForPrompt, fetchLlmConnections } from './NewExperimentModalApi';
import NewLlmConnectionModal from '../Playground/NewLlmConnectionModal';

const NewExperimentModal = ({ isOpen, onClose, onSubmit, promptName, promptVersion }) => {
  const [experimentName, setExperimentName] = useState('');
  const [description, setDescription] = useState('');
  const [allPrompts, setAllPrompts] = useState([]);
  const [availableVersions, setAvailableVersions] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(promptName);
  const [selectedVersion, setSelectedVersion] = useState(promptVersion);

  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [isProviderDropdownOpen, setProviderDropdownOpen] = useState(false);
  const providerRef = useRef(null);

  const [isLlmModalOpen, setIsLlmModalOpen] = useState(false);

  const [models] = useState(['Qwen3-30B-A3B-Instruct-2507-UD', 'gpt-4']);
  const [datasets] = useState(['Select a dataset', 'dataset-1', 'dataset-2']);

  useEffect(() => {
    if (isOpen) {
      const loadInitialData = async () => {
        const [promptNames, connections] = await Promise.all([
          fetchAllPromptNames(),
          fetchLlmConnections()
        ]);
        setAllPrompts(promptNames);
        setProviders(connections);

        if (connections.length > 0) {
          setSelectedProvider(connections[0].id);
        }
      };
      loadInitialData();
      
      setExperimentName('');
      setDescription('');
      setSelectedPrompt(promptName);
      setSelectedVersion(promptVersion);
    }
  }, [isOpen, promptName, promptVersion]);

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
      providerId: selectedProvider,
    });
    onSubmit();
  };

  const handlePromptChange = (e) => {
    setSelectedPrompt(e.target.value);
  };
  
  const handleVersionChange = (e) => {
    setSelectedVersion(Number(e.target.value));
  };

  const selectedProviderObject = providers.find(p => p.id === selectedProvider);

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <div>
              <h2 className={styles.title}>New Dataset Run</h2>
              <p className={styles.subtitle}>
                Create a dataset run to test a prompt version on a dataset.
                <a href="#" className={styles.docLink}>See documentation</a> to learn more.
              </p>
            </div>
            <button type="button" onClick={onClose} className={styles.closeButton}>
              <X size={20} />
            </button>
          </div>
          <div className={styles.body}>
            {/* Experiment name과 Description은 다시 원래의 formGroup을 사용 */}
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

            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Model</h3>
                <a href="/settings/llm-connections" target="_blank" rel="noopener noreferrer" className={styles.iconButton} title="Go to LLM Connections">
                  <ExternalLink size={16} />
                </a>
              </div>
              
              {/* Model 섹션 내부 div의 className을 formRow로 변경 */}
              <div className={styles.formRow}>
                <label>Provider</label>
                <div className={styles.customSelectContainer} ref={providerRef}>
                  <button
                    className={styles.selectButton}
                    onClick={() => setProviderDropdownOpen(prev => !prev)}
                  >
                    <span>{selectedProviderObject?.adapter ?? selectedProviderObject?.id ?? "Select a provider"}</span>
                    <ChevronDown size={16} className={styles.selectIcon} />
                  </button>
                  {isProviderDropdownOpen && (
                    <div className={styles.dropdownMenu}>
                      {providers.map(p => (
                        <div
                          key={p.id}
                          className={styles.dropdownItem}
                          onClick={() => {
                            setSelectedProvider(p.id);
                            setProviderDropdownOpen(false);
                          }}
                        >
                          {p.adapter ?? p.id}
                          {selectedProvider === p.id && <Check size={16} />}
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

              <div className={styles.formRow}>
                <label>Model name</label>
                <div className={styles.selectWrapper}>
                  <select className={styles.select} defaultValue={selectedProviderObject?.modelName ?? ""}>
                    {models.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDown size={16} className={styles.selectIcon} />
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Dataset (expected columns)</h3>
              <div className={styles.selectWrapper}>
                <select className={styles.select}>
                  {datasets.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown size={16} className={styles.selectIcon} />
              </div>
            </div>

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