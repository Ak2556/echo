'use client';

import React, { useState, useMemo } from 'react';
import {
  OptimizedSorting,
  SearchAlgorithms,
  PerformanceAnalytics,
  MemoryOptimizedOperations,
} from '../../utils/DSAUtils';

export type SortDirection = 'asc' | 'desc';
export type SortType = 'string' | 'number' | 'date' | 'boolean' | 'custom';

export interface SortField {
  key: string;
  label: string;
  type: SortType;
  customSort?: (a: any, b: any) => number;
  getValue?: (item: any) => any;
}

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'range' | 'date-range' | 'boolean';
  options?: { value: string; label: string }[];
  getValue?: (item: any) => any;
}

export interface SortingUtilityProps {
  data: any[];
  sortFields: SortField[];
  filterFields?: FilterField[];
  searchFields?: string[];
  initialSort?: { field: string; direction: SortDirection };
  onDataChange?: (sortedData: any[]) => void;
  showSearch?: boolean;
  showFilters?: boolean;
  showSort?: boolean;
  compact?: boolean;
  isDarkMode?: boolean;
}

// Advanced sorting algorithms
class AdvancedSorting {
  static quickSort<T>(arr: T[], compareFn: (a: T, b: T) => number): T[] {
    if (arr.length <= 1) return arr;

    const pivot = arr[Math.floor(arr.length / 2)];
    const left = arr.filter((x) => compareFn(x, pivot) < 0);
    const middle = arr.filter((x) => compareFn(x, pivot) === 0);
    const right = arr.filter((x) => compareFn(x, pivot) > 0);

    return [
      ...AdvancedSorting.quickSort(left, compareFn),
      ...middle,
      ...AdvancedSorting.quickSort(right, compareFn),
    ];
  }

  static mergeSort<T>(arr: T[], compareFn: (a: T, b: T) => number): T[] {
    if (arr.length <= 1) return arr;

    const mid = Math.floor(arr.length / 2);
    const left = AdvancedSorting.mergeSort(arr.slice(0, mid), compareFn);
    const right = AdvancedSorting.mergeSort(arr.slice(mid), compareFn);

    return AdvancedSorting.merge(left, right, compareFn);
  }

  private static merge<T>(
    left: T[],
    right: T[],
    compareFn: (a: T, b: T) => number
  ): T[] {
    const result: T[] = [];
    let leftIndex = 0;
    let rightIndex = 0;

    while (leftIndex < left.length && rightIndex < right.length) {
      if (compareFn(left[leftIndex], right[rightIndex]) <= 0) {
        result.push(left[leftIndex]);
        leftIndex++;
      } else {
        result.push(right[rightIndex]);
        rightIndex++;
      }
    }

    return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
  }

  static timsort<T>(arr: T[], compareFn: (a: T, b: T) => number): T[] {
    // Simplified Timsort implementation
    const MIN_GALLOP = 7;
    const MIN_MERGE = 32;

    if (arr.length < MIN_MERGE) {
      return AdvancedSorting.insertionSort(arr.slice(), compareFn);
    }

    return AdvancedSorting.mergeSort(arr, compareFn);
  }

  static insertionSort<T>(arr: T[], compareFn: (a: T, b: T) => number): T[] {
    for (let i = 1; i < arr.length; i++) {
      const key = arr[i];
      let j = i - 1;

      while (j >= 0 && compareFn(arr[j], key) > 0) {
        arr[j + 1] = arr[j];
        j--;
      }
      arr[j + 1] = key;
    }

    return arr;
  }

  static radixSort(arr: number[]): number[] {
    if (arr.length <= 1) return arr;

    const max = Math.max(...arr);
    const maxDigits = Math.floor(Math.log10(max)) + 1;

    let result = [...arr];

    for (let digit = 0; digit < maxDigits; digit++) {
      const buckets: number[][] = Array(10)
        .fill(null)
        .map(() => []);

      for (const num of result) {
        const digitValue = Math.floor(num / Math.pow(10, digit)) % 10;
        buckets[digitValue].push(num);
      }

      result = buckets.flat();
    }

    return result;
  }

  static countingSort(arr: number[], max?: number): number[] {
    if (arr.length <= 1) return arr;

    const maxVal = max || Math.max(...arr);
    const count = new Array(maxVal + 1).fill(0);
    const result = new Array(arr.length);

    // Count occurrences
    for (const num of arr) {
      count[num]++;
    }

    // Calculate positions
    for (let i = 1; i <= maxVal; i++) {
      count[i] += count[i - 1];
    }

    // Place elements
    for (let i = arr.length - 1; i >= 0; i--) {
      result[count[arr[i]] - 1] = arr[i];
      count[arr[i]]--;
    }

    return result;
  }

  static bucketSort(arr: number[], bucketCount = 10): number[] {
    if (arr.length <= 1) return arr;

    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const bucketSize = (max - min) / bucketCount;

    const buckets: number[][] = Array(bucketCount)
      .fill(null)
      .map(() => []);

    // Distribute elements into buckets
    for (const num of arr) {
      const bucketIndex = Math.min(
        bucketCount - 1,
        Math.floor((num - min) / bucketSize)
      );
      buckets[bucketIndex].push(num);
    }

    // Sort each bucket and concatenate
    return buckets
      .map((bucket) => AdvancedSorting.insertionSort(bucket, (a, b) => a - b))
      .flat();
  }

  static heapSort<T>(arr: T[], compareFn: (a: T, b: T) => number): T[] {
    const result = [...arr];
    const n = result.length;

    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      AdvancedSorting.heapify(result, n, i, compareFn);
    }

    // Extract elements from heap
    for (let i = n - 1; i > 0; i--) {
      [result[0], result[i]] = [result[i], result[0]];
      AdvancedSorting.heapify(result, i, 0, compareFn);
    }

    return result;
  }

  private static heapify<T>(
    arr: T[],
    n: number,
    i: number,
    compareFn: (a: T, b: T) => number
  ): void {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < n && compareFn(arr[left], arr[largest]) > 0) {
      largest = left;
    }

    if (right < n && compareFn(arr[right], arr[largest]) > 0) {
      largest = right;
    }

    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      AdvancedSorting.heapify(arr, n, largest, compareFn);
    }
  }
}

export { AdvancedSorting };

export default function SortingUtility({
  data,
  sortFields,
  filterFields = [],
  searchFields = [],
  initialSort,
  onDataChange,
  showSearch = true,
  showFilters = true,
  showSort = true,
  compact = false,
  isDarkMode = true,
}: SortingUtilityProps) {
  const [sortField, setSortField] = useState(
    initialSort?.field || sortFields[0]?.key || ''
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    initialSort?.direction || 'asc'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortAlgorithm, setSortAlgorithm] = useState<
    'quick' | 'merge' | 'heap' | 'tim'
  >('tim');

  const createCompareFn = (field: SortField, direction: SortDirection) => {
    return (a: any, b: any): number => {
      let aVal = field.getValue ? field.getValue(a) : a[field.key];
      let bVal = field.getValue ? field.getValue(b) : b[field.key];

      if (field.customSort) {
        return direction === 'asc'
          ? field.customSort(a, b)
          : field.customSort(b, a);
      }

      // Handle null/undefined values
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return direction === 'asc' ? -1 : 1;
      if (bVal == null) return direction === 'asc' ? 1 : -1;

      switch (field.type) {
        case 'string':
          aVal = String(aVal).toLowerCase();
          bVal = String(bVal).toLowerCase();
          break;
        case 'number':
          aVal = Number(aVal) || 0;
          bVal = Number(bVal) || 0;
          break;
        case 'date':
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
          break;
        case 'boolean':
          aVal = Boolean(aVal);
          bVal = Boolean(bVal);
          break;
      }

      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return direction === 'asc' ? comparison : -comparison;
    };
  };

  const processedData = useMemo(() => {
    return PerformanceAnalytics.measure('SortingUtility.processData', () => {
      let result = [...data];

      // Apply advanced search with fuzzy matching for better UX
      if (searchTerm && searchFields.length > 0) {
        if (searchTerm.length < 3) {
          // Use simple substring search for short queries
          const searchLower = searchTerm.toLowerCase();
          result = result.filter((item) =>
            searchFields.some((field) => {
              const value = String(item[field] || '').toLowerCase();
              return value.includes(searchLower);
            })
          );
        } else {
          // Use fuzzy search for longer queries to handle typos
          const candidates = result.map((item) => ({
            item,
            searchText: searchFields
              .map((field) => String(item[field] || ''))
              .join(' '),
          }));

          const fuzzyResults = SearchAlgorithms.fuzzySearch(
            searchTerm,
            candidates.map((c) => c.searchText),
            0.3 // Lower threshold for more lenient matching
          );

          result = fuzzyResults.map((fuzzyResult) => {
            const candidateIndex = candidates.findIndex(
              (c) => c.searchText === fuzzyResult.item
            );
            return candidates[candidateIndex].item;
          });
        }
      }

      return result;
    });
  }, [data, searchTerm, searchFields]);

  const filteredData = useMemo(() => {
    return PerformanceAnalytics.measure('SortingUtility.filterData', () => {
      let result = [...processedData];

      // Apply filters
      Object.entries(filters).forEach(([filterKey, filterValue]) => {
        if (
          !filterValue ||
          (Array.isArray(filterValue) && filterValue.length === 0)
        )
          return;

        const filterField = filterFields.find((f) => f.key === filterKey);
        if (!filterField) return;

        result = result.filter((item) => {
          const itemValue = filterField.getValue
            ? filterField.getValue(item)
            : item[filterKey];

          switch (filterField.type) {
            case 'text':
              return String(itemValue)
                .toLowerCase()
                .includes(String(filterValue).toLowerCase());
            case 'select':
              return itemValue === filterValue;
            case 'boolean':
              return Boolean(itemValue) === Boolean(filterValue);
            case 'range':
              const [min, max] = filterValue;
              const numValue = Number(itemValue);
              return numValue >= min && numValue <= max;
            case 'date-range':
              const [startDate, endDate] = filterValue;
              const itemDate = new Date(itemValue).getTime();
              return (
                itemDate >= new Date(startDate).getTime() &&
                itemDate <= new Date(endDate).getTime()
              );
            default:
              return true;
          }
        });
      });

      return result;
    });
  }, [processedData, filters, filterFields]);

  const sortedData = useMemo(() => {
    return PerformanceAnalytics.measure('SortingUtility.sortData', () => {
      let result = [...filteredData];

      // Apply intelligent sorting using optimized algorithms
      if (sortField) {
        const field = sortFields.find((f) => f.key === sortField);
        if (field) {
          const compareFn = createCompareFn(field, sortDirection);

          // Use the smart sorting algorithm that chooses the best approach
          result = OptimizedSorting.smartSort(result, compareFn);
        }
      }

      onDataChange?.(result);
      return result;
    });
  }, [
    filteredData,
    sortField,
    sortDirection,
    sortFields,
    createCompareFn,
    onDataChange,
  ]);

  const handleSortChange = (field: string) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  return (
    <div
      className={`sorting-utility ${compact ? 'compact' : ''} ${isDarkMode ? 'dark' : 'light'}`}
    >
      <div className="sorting-controls">
        {showSearch && searchFields.length > 0 && (
          <div className="search-section">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        )}

        {showSort && (
          <div className="sort-section">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="sort-select"
            >
              <option value="">No Sorting</option>
              {sortFields.map((field) => (
                <option key={field.key} value={field.key}>
                  {field.label}
                </option>
              ))}
            </select>

            {sortField && (
              <button
                onClick={() =>
                  setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
                }
                className="sort-direction"
                title={`Sort ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </button>
            )}

            <select
              value={sortAlgorithm}
              onChange={(e) => setSortAlgorithm(e.target.value as any)}
              className="algorithm-select"
              title="Sorting Algorithm"
            >
              <option value="tim">Timsort (Hybrid)</option>
              <option value="quick">QuickSort</option>
              <option value="merge">MergeSort</option>
              <option value="heap">HeapSort</option>
            </select>
          </div>
        )}

        {showFilters && filterFields.length > 0 && (
          <div className="filters-section">
            {filterFields.map((field) => (
              <div key={field.key} className="filter-field">
                <label>{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    value={filters[field.key] || ''}
                    onChange={(e) =>
                      handleFilterChange(field.key, e.target.value)
                    }
                    className="filter-select"
                  >
                    <option value="">All</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'boolean' ? (
                  <select
                    value={filters[field.key] ?? ''}
                    onChange={(e) =>
                      handleFilterChange(
                        field.key,
                        e.target.value === ''
                          ? undefined
                          : e.target.value === 'true'
                      )
                    }
                    className="filter-select"
                  >
                    <option value="">All</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={filters[field.key] || ''}
                    onChange={(e) =>
                      handleFilterChange(field.key, e.target.value)
                    }
                    className="filter-input"
                    placeholder={`Filter by ${field.label}`}
                  />
                )}
              </div>
            ))}

            <button onClick={clearFilters} className="clear-filters">
              Clear All
            </button>
          </div>
        )}
      </div>

      <div className="results-info">
        <span>
          Showing {sortedData.length} of {data.length} items
        </span>
        {sortField && (
          <span>
            Sorted by {sortFields.find((f) => f.key === sortField)?.label} (
            {sortDirection})
          </span>
        )}
      </div>

      <style jsx>{`
        .sorting-utility {
          background: var(--surface);
          border-radius: 12px;
          padding: 1rem;
          border: 1px solid var(--border);
        }

        .sorting-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .search-section,
        .sort-section,
        .filters-section {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .search-input,
        .sort-select,
        .algorithm-select,
        .filter-select,
        .filter-input {
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--surface);
          color: var(--text);
          font-size: 0.9rem;
        }

        .sort-direction {
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--text);
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .sort-direction:hover {
          background: var(--hover);
        }

        .filter-field {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .filter-field label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .clear-filters {
          background: var(--error);
          color: white;
          border: none;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .clear-filters:hover {
          background: var(--error-hover);
        }

        .results-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          color: var(--text-secondary);
          padding-top: 0.5rem;
          border-top: 1px solid var(--border);
        }

        .compact {
          padding: 0.5rem;
        }

        .compact .sorting-controls {
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        /* Dark theme */
        .sorting-utility.dark {
          --surface: #1a1a1a;
          --border: #404040;
          --text: #ffffff;
          --text-secondary: #a0a0a0;
          --hover: #333333;
          --error: #ff4444;
          --error-hover: #cc3333;
        }

        /* Light theme */
        .sorting-utility.light {
          --surface: #ffffff;
          --border: #e0e0e0;
          --text: #000000;
          --text-secondary: #666666;
          --hover: #f0f0f0;
          --error: #dc3545;
          --error-hover: #c82333;
        }

        @media (max-width: 768px) {
          .sorting-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .sort-section,
          .filters-section {
            flex-wrap: wrap;
          }

          .results-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
}
