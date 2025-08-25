// src/pages/Tracing/Tracing.jsx
import { useState, useMemo, useEffect } from 'react';
import styles from './Tracing.module.css';
import { DataTable } from 'components/DataTable/DataTable';
import { traceTableColumns } from './traceColumns.jsx'; // .jsx로 확장자 변경
import SearchInput from 'components/SearchInput/SearchInput';
import FilterControls from 'components/FilterControls/FilterControls';
import TraceDetailPanel from './TraceDetailPanel.jsx'; // .jsx로 확장자 변경
import { useSearch } from '../../hooks/useSearch.js';
import ColumnVisibilityModal from './ColumnVisibilityModal.jsx'; // .jsx로 확장자 변경
import { fetchTraces } from './TracingApi';
import FilterButton from 'components/FilterButton/FilterButton';
import { Columns } from 'lucide-react';

const Tracing = () => {
  const [activeTab, setActiveTab] = useState('Traces');
  const [selectedTrace, setSelectedTrace] = useState(null);
  const [traces, setTraces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchType, setSearchType] = useState('IDs / Names');
  const { searchQuery, setSearchQuery, filteredData: filteredTraces } = useSearch(traces, searchType);
  
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [columns, setColumns] = useState(
    traceTableColumns.map(c => ({ ...c, visible: true }))
  );

  useEffect(() => {
    const loadTraces = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedTraces = await fetchTraces();
        setTraces(fetchedTraces);
      } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("알 수 없는 오류가 발생했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadTraces();
  }, []);
  
  const handleRowClick = (trace) => {
    setSelectedTrace(prev => (prev?.id === trace.id ? null : trace));
  };
  
  const setAllColumnsVisible = (visible) => {
    setColumns(prev => prev.map(col => ({ ...col, visible })));
  };

  const toggleColumnVisibility = (key) => {
    setColumns(prev =>
      prev.map(col =>
        col.key === key ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const visibleColumns = useMemo(() => columns.filter(c => c.visible), [columns]);

  return (
    <div className={`${styles.container} ${selectedTrace ? styles.containerWithDetail : ''}`}>
      <div className={styles.listSection}>
        
        <div className={styles.tabs}>
          <button className={`${styles.tabButton} ${activeTab === 'Traces' ? styles.active : ''}`} onClick={() => setActiveTab('Traces')}>Traces</button>
          <button className={`${styles.tabButton} ${activeTab === 'Observations' ? styles.active : ''}`} onClick={() => setActiveTab('Observations')}>Observations</button>
        </div>
        
        <div className={styles.filterBar}>
          <div className={styles.filterLeftGroup}>
            <SearchInput
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              searchType={searchType}
              setSearchType={setSearchType}
              searchTypes={['IDs / Names', 'Full Text']}
            />
            <FilterControls />
          </div>
          <FilterButton onClick={() => setIsColumnModalOpen(true)}>
            <Columns size={16} /> Columns ({visibleColumns.length}/{columns.length})
          </FilterButton>
        </div>
        
        <div className={styles.contentArea}>
          {activeTab === 'Traces' ? (
            isLoading ? (
                <div>Loading traces...</div>
            ) : error ? (
                <div style={{ color: 'red' }}>Error: {error}</div>
            ) : (
                <DataTable
                  columns={visibleColumns}
                  data={filteredTraces}
                  keyField="id"
                  renderEmptyState={() => <div>No traces found.</div>}
                  showActions={false}
                  selectedRowKey={selectedTrace?.id || null}
                  onRowClick={handleRowClick}
                />
            )
          ) : ( <div>Observations View</div> )}
        </div>
      </div>

      {selectedTrace && (
        <TraceDetailPanel
          trace={selectedTrace}
          onClose={() => setSelectedTrace(null)}
        />
      )}

      <ColumnVisibilityModal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
        columns={columns}
        toggleColumnVisibility={toggleColumnVisibility}
        setAllColumnsVisible={setAllColumnsVisible}
      />
    </div>
  );
};

export default Tracing;