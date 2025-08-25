// src/pages/Tracing/TraceDetailPanel.jsx
import React, { useState, useEffect } from 'react';
import { X, Tag, Copy, Download, MessageSquare, ExternalLink } from 'lucide-react';
import { fetchTraceDetails } from './TraceDetailApi'; // API 함수 import
import styles from './TraceDetailPanel.module.css';

const TraceDetailPanel = ({ trace, onClose }) => {
  const [activeTab, setActiveTab] = useState('Output');
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const traceDetails = await fetchTraceDetails(trace.id);
        setDetails(traceDetails);
      } catch (err) {
        setError("상세 정보를 불러오는 데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDetails();
  }, [trace.id]);

  const renderBody = () => {
    if (isLoading) {
      return <div className={styles.body}>Loading details...</div>;
    }
    if (error) {
      return <div className={styles.body} style={{ color: 'red' }}>{error}</div>;
    }
    if (!details) {
      return <div className={styles.body}>No details available.</div>;
    }

    return (
      <div className={styles.body}>
        {/* Timeline */}
        <div className={styles.timeline}>
          <div className={styles.timelineItem}>
            <MessageSquare size={16} />
            <span>{details.name}</span>
            <span className={styles.duration}>{(details.latency).toFixed(2)}s</span>
          </div>
        </div>

        {/* Metadata */}
        <div className={styles.metadataGrid}>
          <div><span>Session</span><a href="#" className={styles.link}>{details.sessionId}</a></div>
          <div><span>User ID</span><a href="#" className={styles.link}>{details.userId}</a></div>
          <div><span>Env</span><span>{details.environment || 'default'}</span></div>
          <div><span>Latency</span><span>{(details.latency * 1000).toFixed(0)}ms</span></div>
          <div><span>Total Cost</span><span>${details.totalCost.toFixed(6)}</span></div>
          <div><span>Release</span><span>{details.release || 'N/A'}</span></div>
          <div><span>Tags</span><span>{details.tags.join(', ') || 'N/A'}</span></div>
          <div><span>Public</span><span>{String(details.public)}</span></div>
        </div>

        {/* Scores Table */}
        <div className={styles.tableSection}>
            <h4 className={styles.sectionTitle}>Scores</h4>
            <table className={styles.detailsTable}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Value</th>
                        <th>Source</th>
                        <th>Comment</th>
                    </tr>
                </thead>
                <tbody>
                    {details.scores.map(score => (
                        <tr key={score.id}>
                            <td>{score.name}</td>
                            <td className={styles.valueCell}>{score.value}</td>
                            <td><span className={styles.badge}>{score.source}</span></td>
                            <td>{score.comment || 'N/A'}</td>
                        </tr>
                    ))}
                    {details.scores.length === 0 && (
                        <tr><td colSpan={4}>No scores available.</td></tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Observations Table */}
        <div className={styles.tableSection}>
            <h4 className={styles.sectionTitle}>Observations</h4>
            <table className={styles.detailsTable}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Model</th>
                        <th>Latency</th>
                    </tr>
                </thead>
                <tbody>
                    {details.observations.map(obs => (
                        <tr key={obs.id}>
                            <td>{obs.name || 'N/A'}</td>
                            <td><span className={styles.badge}>{obs.type}</span></td>
                            <td>{obs.model || 'N/A'}</td>
                            <td className={styles.valueCell}>{obs.latency ? `${(obs.latency * 1000).toFixed(0)} ms` : 'N/A'}</td>
                        </tr>
                    ))}
                     {details.observations.length === 0 && (
                        <tr><td colSpan={4}>No observations available.</td></tr>
                    )}
                </tbody>
            </table>
        </div>


        {/* Input/Output */}
        <div className={styles.ioSection}>
          <div className={styles.tabs}>
            <button
              className={activeTab === 'Input' ? styles.active : ''}
              onClick={() => setActiveTab('Input')}
            >
              Input
            </button>
            <button
              className={activeTab === 'Output' ? styles.active : ''}
              onClick={() => setActiveTab('Output')}
            >
              Output
            </button>
          </div>
          <div className={styles.tabContent}>
            {activeTab === 'Input' && <pre>{JSON.stringify(details.input, null, 2)}</pre>}
            {activeTab === 'Output' && <pre>{JSON.stringify(details.output, null, 2)}</pre>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.title}>
          <h3>Trace</h3>
          <span className={styles.traceId}>{trace.id}</span>
        </div>
        <div className={styles.actions}>
          {details?.htmlPath && (
            <a href={details.htmlPath} target="_blank" rel="noopener noreferrer" className={styles.actionButton}>
              <ExternalLink size={14} /> View in Langfuse
            </a>
          )}
          <button className={styles.actionButton}><Tag size={14} /> Add to dataset</button>
          <button className={styles.iconButton}><Copy size={16} /></button>
          <button className={styles.iconButton}><Download size={16} /></button>
          <button className={styles.iconButton} onClick={onClose}><X size={18} /></button>
        </div>
      </div>
      {renderBody()}
    </div>
  );
};

export default TraceDetailPanel;