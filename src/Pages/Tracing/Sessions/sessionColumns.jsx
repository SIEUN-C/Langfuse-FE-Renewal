// src/pages/Tracing/Sessions/sessionColumns.jsx
import React from 'react'; // React를 명시적으로 import
import { Link } from 'react-router-dom';
import styles from './Sessions.module.css';

// 테이블과 모달에서 사용할 컬럼 목록을 정의합니다.
export const sessionTableColumns = [
    { 
      key: 'id', 
      header: 'ID', 
      visible: true, 
      accessor: (row) => (
        <Link to={`/sessions/${row.id}`} className={styles.idLink}>
          {row.id}
        </Link>
      ) 
    },
    { key: 'createdAt', header: 'Created At', accessor: (row) => row.createdAt, visible: true },
    { key: 'duration', header: 'Duration', accessor: (row) => row.duration, visible: true },
    { key: 'environment', header: 'Environment', accessor: (row) => row.environment, visible: true },
    { key: 'userIds', header: 'User IDs', accessor: (row) => row.userIds, visible: true },
    { key: 'traces', header: 'Traces', accessor: (row) => row.traces, visible: true },
    { key: 'inputCost', header: 'Input Cost', accessor: (row) => row.inputCost, visible: true },
    { key: 'outputCost', header: 'Output Cost', accessor: (row) => row.outputCost, visible: true },
    { key: 'totalCost', header: 'Total Cost', accessor: (row) => row.totalCost, visible: true },
    { key: 'inputTokens', header: 'Input Tokens', accessor: (row) => row.inputTokens, visible: true },
    { key: 'outputTokens', header: 'Output Tokens', accessor: (row) => row.outputTokens, visible: true },
    { key: 'totalTokens', header: 'Total Tokens', accessor: (row) => row.totalTokens, visible: true },
    { key: 'usage', header: 'Usage', accessor: (row) => `${row.usage.input}/${row.usage.output}`, visible: true },
    { key: 'traceTags', header: 'Trace Tags', accessor: (row) => row.traceTags.join(', '), visible: true },
    // Scores 컬럼 정의 추가
    { key: '# Conciseness-V1 (Eval)', header: '# Conciseness-V1 (Eval)', visible: false },
    { key: '# Contains-Pii (Eval)', header: '# Contains-Pii (Eval)', visible: false },
    { key: '# Contextrelevance (Eval)', header: '# Contextrelevance (Eval)', visible: false },
    { key: '# Hallucination (Eval)', header: '# Hallucination (Eval)', visible: false },
    { key: '# Helpfulness (Eval)', header: '# Helpfulness (Eval)', visible: false },
    { key: '# Is Exclamation (Eval)', header: '# Is Exclamation (Eval)', visible: false },
    { key: '# Is_question (Eval)', header: '# Is_question (Eval)', visible: false },
    { key: '# Language-Detector (Eval)', header: '# Language-Detector (Eval)', visible: false },
    { key: '# Toxicity-V2 (Eval)', header: '# Toxicity-V2 (Eval)', visible: false },
    { key: '# User-Feedback (Api)', header: '# User-Feedback (Api)', visible: false },
];

// ColumnVisibilityModal에 표시될 컬럼들의 순서를 정의합니다.
export const columnOrderInModal = [
    'createdAt', 
    'duration', 
    'environment', 
    'userIds', 
    'traces', 
    'inputCost',
    'outputCost', 
    'totalCost', 
    'inputTokens', 
    'outputTokens', 
    'totalTokens',
    'usage', 
    'traceTags'
];

// Scores 관련 컬럼 키 목록을 추가하고 export 합니다.
export const scoreColumnKeys = [
    '# Conciseness-V1 (Eval)',
    '# Contains-Pii (Eval)',
    '# Contextrelevance (Eval)',
    '# Hallucination (Eval)',
    '# Helpfulness (Eval)',
    '# Is Exclamation (Eval)',
    '# Is_question (Eval)',
    '# Language-Detector (Eval)',
    '# Toxicity-V2 (Eval)',
    '# User-Feedback (Api)',
];
