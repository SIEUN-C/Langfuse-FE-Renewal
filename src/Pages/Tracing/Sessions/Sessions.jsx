// src/pages/Tracing/Sessions/Sessions.jsx
import React, { useState, useMemo, useEffect } from 'react';
import styles from './Sessions.module.css';
import {
    RefreshCw,
    Star,
    Columns
} from 'lucide-react';
import ColumnVisibilityModal from '../ColumnVisibilityModal.jsx';
import { DataTable } from '../../../components/DataTable/DataTable.jsx'; 
import { sessionTableColumns } from './sessionColumns.jsx'; // .jsx 확장자 추가
import FilterButton from '../../../components/FilterButton/FilterButton.jsx';
import DateRangePicker from '../../../components/DateRange/DateRangePicker.jsx';
import { fetchSessions } from './SessionApi.js';

import EnvironmentFilter from '../../../components/FilterControls/EnvironmentFilter.jsx';
import FilterBuilder from '../../../components/FilterControls/FilterBuilder.jsx';

const Sessions = () => {
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [isColumnVisibleModalOpen, setIsColumnVisibleModalOpen] = useState(false);

    const [columns, setColumns] = useState(
        sessionTableColumns.map(c => ({ ...c, visible: c.visible }))
    );

    const [startDate, setStartDate] = useState(new Date(Date.now() - 24 * 60 * 60 * 1000));
    const [endDate, setEndDate] = useState(new Date());

    useEffect(() => {
        const loadSessions = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const fetchedSessions = await fetchSessions();
                setSessions(fetchedSessions);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unknown error occurred.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadSessions();
    }, []);

    const toggleFavorite = (id, e) => {
        e.stopPropagation(); 
        setSessions(prevSessions =>
            prevSessions.map(session =>
                session.id === id ? { ...session, isFavorited: !session.isFavorited } : session
            )
        );
    };

    const toggleColumnVisibility = (key) => {
        setColumns(prev =>
            prev.map(col => (col.key === key ? { ...col, visible: !col.visible } : col))
        );
    };

    const setAllColumnsVisible = (visible) => {
        setColumns(prev => prev.map(col => ({ ...col, visible })));
    };

    const visibleColumns = useMemo(() => columns.filter(c => c.visible), [columns]);

    const columnsWithActions = useMemo(() => [
        {
            key: 'checkbox',
            header: <input type="checkbox" />,
            accessor: () => <input type="checkbox" />,
            visible: true
        },
        {
            key: 'favorite',
            header: '',
            accessor: (row) => (
                <Star
                    size={16}
                    className={`${styles.starIcon} ${row.isFavorited ? styles.favorited : ''}`}
                    onClick={(e) => toggleFavorite(row.id, e)}
                />
            ),
            visible: true
        },
        ...visibleColumns,
    ], [visibleColumns, sessions, toggleFavorite]); // toggleFavorite을 의존성 배열에 추가

    const renderTableContent = () => {
        if (isLoading) {
            return <div>Loading sessions...</div>;
        }
        if (error) {
            return <div style={{ color: 'red' }}>Error: {error}</div>;
        }
        return (
            <DataTable
                columns={columnsWithActions}
                data={sessions}
                keyField="id"
                renderEmptyState={() => <>No sessions found.</>}
                selectedRowKey={selectedSessionId}
                onRowClick={(row) => setSelectedSessionId(row.id)}
                showActions={false}
            />
        );
    };
    
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <h1>Sessions</h1>
                    <RefreshCw size={16} className={styles.refreshIcon} />
                </div>
            </div>

            <div className={styles.filterBar}>
                <div className={styles.filterLeft}>
                    <DateRangePicker 
                        startDate={startDate}
                        endDate={endDate}
                        setStartDate={setStartDate}
                        setEndDate={setEndDate}
                    />
                    <EnvironmentFilter />
                    <FilterBuilder />
                </div>
                <div className={styles.filterRight}>
                    <FilterButton onClick={() => setIsColumnVisibleModalOpen(true)}>
                        <Columns size={16} /> Columns ({visibleColumns.length}/{columns.length})
                    </FilterButton>
                </div>
            </div>

            <div className={styles.tableContainer}>
                {renderTableContent()}
            </div>

            <ColumnVisibilityModal
                isOpen={isColumnVisibleModalOpen}
                onClose={() => setIsColumnVisibleModalOpen(false)}
                columns={columns}
                toggleColumnVisibility={toggleColumnVisibility}
                setAllColumnsVisible={setAllColumnsVisible}
            />
        </div>
    );
};

export default Sessions;
