/**
 * NewItemModal
 * - LLM Tool / JSON Schema 생성 모달
 * - "tool"일 때: 도구 설명 + 파라미터(JSON Schema) 입력
 * - "schema"일 때: 스키마 설명 + JSON Schema 입력
 */

import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { X } from "lucide-react";
import styles from "./NewItemModal.module.css";
import LineNumberedTextarea from "../../components/LineNumberedTextarea/LineNumberedTextarea";

/**
 * @param {Object} props
 * @param {boolean} props.isOpen - 모달 열림 상태
 * @param {'tool'|'schema'} props.type - 생성 타입("tool" 또는 "schema")
 * @param {() => void} props.onClose - 모달 닫기 콜백
 */
export default function NewItemModal({ isOpen, type, onClose }) {
  // 이름/설명 상태
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // JSON Schema 입력 (기본 템플릿)
  const [parameters, setParameters] = useState(
    '{\n  "type": "object",\n  "properties": {},\n  "required": [],\n  "additionalProperties": false\n}'
  );

  // type에 따라 헤더/라벨/도움말 텍스트를 메모이즈
  const content = useMemo(() => {
    if (type === "tool") {
      return {
        title: "Create LLM Tool",
        subtitle: "Define a tool for LLM function calling",
        descriptionHelpText:
          "This description will be sent to the LLM to help it understand the tool's purpose and functionality.",
        descriptionPlaceholder: "Describe the tool's purpose and usage",
        parametersLabel: "Parameters (JSON Schema)",
        footerNote:
          "Note: Changes to tools are reflected to all new traces of this project.",
      };
    }
    return {
      title: "Create LLM Schema",
      subtitle: "Define a JSON Schema for structured outputs",
      descriptionHelpText: "Describe the schema",
      descriptionPlaceholder: "Describe the schema",
      parametersLabel: "JSON Schema",
      footerNote:
        "Note: Changes to Schemas are reflected to all new traces of this project.",
    };
  }, [type]);

  // 열려있지 않다면 렌더하지 않음
  if (!isOpen) return null;

  // 저장 버튼: JSON Schema 유효성 검사 후 콘솔에 결과 출력
  const handleSave = () => {
    try {
      const parsed = JSON.parse(parameters);
      console.log({ type, name, description, parameters: parsed });
      alert(`${type === "tool" ? "Tool" : "Schema"} saved! (See console for details)`);
      onClose();
    } catch (err) {
      alert("Parameters must be valid JSON.\n\n" + err.message);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-item-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더: 타이틀/서브타이틀 + 닫기 버튼 */}
        <div className={styles.modalHeader}>
          <div>
            <h2 id="new-item-modal-title" className={styles.modalTitle}>
              {content.title}
            </h2>
            <p className={styles.modalSubtitle}>{content.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* 바디: 이름/설명/JSON Schema 입력 영역 */}
        <div className={styles.modalBody}>
          {/* Name */}
          <div className={styles.formGroup}>
            <label htmlFor="item-name">Name</label>
            <input
              id="item-name"
              type="text"
              placeholder="e.g., get_weather"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <label htmlFor="item-description">Description</label>
            <p className={styles.descriptionText}>{content.descriptionHelpText}</p>
            <textarea
              id="item-description"
              rows={3}
              placeholder={content.descriptionPlaceholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* JSON Schema 입력 (LineNumberedTextarea 사용) */}
          <div className={styles.formGroup}>
            <label htmlFor="item-parameters">{content.parametersLabel}</label>
            <p className={styles.descriptionText}>
              Define the structure of your tool parameters using JSON Schema format.
            </p>

            <LineNumberedTextarea
              id="item-parameters"
              value={parameters}
              onChange={(e) => setParameters(e.target.value)}
              minHeight={120}
            >
              {/* prettify 버튼: JSON 구조 정렬 */}
              <button
                type="button"
                className={styles.prettifyButton}
                onClick={() => {
                  try {
                    const pretty = JSON.stringify(JSON.parse(parameters), null, 2);
                    setParameters(pretty);
                  } catch {
                    alert("Invalid JSON. Cannot prettify.");
                  }
                }}
              >
                Prettify
              </button>
            </LineNumberedTextarea>
          </div>
        </div>

        {/* 푸터: 안내 문구 + 취소/저장 */}
        <div className={styles.modalFooter}>
          <span className={styles.footerNote}>{content.footerNote}</span>
          <div className={styles.footerActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="button" className={styles.saveButton} onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

NewItemModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  type: PropTypes.oneOf(["tool", "schema"]).isRequired,
  onClose: PropTypes.func.isRequired,
};