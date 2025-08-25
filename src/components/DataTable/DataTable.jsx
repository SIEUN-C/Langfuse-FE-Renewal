// src/components/DataTable/DataTable.jsx

import React from 'react';
import styles from './DataTable.module.css';
import {
  MoreVertical,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from 'lucide-react';

export function DataTable({
  columns,
  data,
  renderEmptyState,
  keyField,
  selectedRowKey,
  onRowClick,
  showActions = true, // 기본값을 true로 설정
}) {
  return (
    <>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index}>{col.header}</th>
              ))}
              {/* showActions가 true일 때만 Actions 헤더를 렌더링 */}
              {showActions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row) => {
                const rowKey = String(row[keyField]);
                const isSelected = selectedRowKey === rowKey;

                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowClick?.(row)}
                    className={`${onRowClick ? styles.clickableRow : ''} ${isSelected ? styles.selectedRow : ''}`}
                  >
                    {columns.map((col, index) => (
                      <td key={index}>
                        {/* accessor가 존재할 때만 함수를 호출하도록 수정합니다. */}
                        {col.accessor ? col.accessor(row) : null}
                      </td>
                    ))}
                    {/* showActions가 true일 때만 Actions 셀을 렌더링 */}
                    {showActions && (
                      <td>
                        <div className={styles.actionsCell}>
                          <button className={styles.iconButton}>
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                {/* colSpan도 showActions 값에 따라 동적으로 계산 */}
                <td colSpan={columns.length + (showActions ? 1 : 0)} className={styles.emptyCell}>
                  {renderEmptyState()}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <div className={styles.rowsPerPage}>
          <span>Rows per page</span>
          <select>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        <div className={styles.pageInfo}>Page 1 of 1</div>
        <div className={styles.pageControls}>
          <button className={styles.iconButton} disabled><ChevronsLeft size={18} /></button>
          <button className={styles.iconButton} disabled><ChevronLeft size={18} /></button>
          <button className={styles.iconButton} disabled><ChevronRight size={18} /></button>
          <button className={styles.iconButton} disabled><ChevronsRight size={18} /></button>
        </div>
      </div>
    </>
  );
}