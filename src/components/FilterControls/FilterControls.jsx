// src/components/FilterControls/FilterControls.jsx
import React from 'react';
import styles from './FilterControls.module.css';

// 분리된 컴포넌트들을 import 합니다.
// .jsx 확장자로 변경되었을 수 있으므로 확장자를 제거하여 import 합니다.
import TimeRangeFilter from './TimeRangeFilter';
import EnvironmentFilter from './EnvironmentFilter';
import FilterBuilder from './FilterBuilder';

const FilterControls = () => {
  return (
    <div className={styles.filterControls}>
      <TimeRangeFilter />
      <EnvironmentFilter />
      <FilterBuilder />
    </div>
  );
};

export default FilterControls;