'use client';

/**
 * Advanced Data Structures and Algorithms with Optimal Time & Space Complexity
 * Implements cutting-edge algorithms for maximum performance
 */

/**
 * Segment Tree for Range Queries - O(log n) query, O(log n) update
 * Best for: Range sum/min/max queries, frequent updates
 */
class SegmentTree {
  private tree: number[];
  private n: number;
  private operation: (a: number, b: number) => number;
  private identity: number;

  constructor(
    arr: number[],
    op: (a: number, b: number) => number,
    identity: number
  ) {
    this.n = arr.length;
    this.tree = new Array(4 * this.n);
    this.operation = op;
    this.identity = identity;
    this.build(arr, 1, 0, this.n - 1);
  }

  private build(arr: number[], node: number, start: number, end: number): void {
    if (start === end) {
      this.tree[node] = arr[start];
    } else {
      const mid = Math.floor((start + end) / 2);
      this.build(arr, 2 * node, start, mid);
      this.build(arr, 2 * node + 1, mid + 1, end);
      this.tree[node] = this.operation(
        this.tree[2 * node],
        this.tree[2 * node + 1]
      );
    }
  }

  // O(log n) range query
  query(l: number, r: number): number {
    return this.queryHelper(1, 0, this.n - 1, l, r);
  }

  private queryHelper(
    node: number,
    start: number,
    end: number,
    l: number,
    r: number
  ): number {
    if (r < start || end < l) return this.identity;
    if (l <= start && end <= r) return this.tree[node];

    const mid = Math.floor((start + end) / 2);
    const leftQuery = this.queryHelper(2 * node, start, mid, l, r);
    const rightQuery = this.queryHelper(2 * node + 1, mid + 1, end, l, r);
    return this.operation(leftQuery, rightQuery);
  }

  // O(log n) point update
  update(idx: number, val: number): void {
    this.updateHelper(1, 0, this.n - 1, idx, val);
  }

  private updateHelper(
    node: number,
    start: number,
    end: number,
    idx: number,
    val: number
  ): void {
    if (start === end) {
      this.tree[node] = val;
    } else {
      const mid = Math.floor((start + end) / 2);
      if (idx <= mid) {
        this.updateHelper(2 * node, start, mid, idx, val);
      } else {
        this.updateHelper(2 * node + 1, mid + 1, end, idx, val);
      }
      this.tree[node] = this.operation(
        this.tree[2 * node],
        this.tree[2 * node + 1]
      );
    }
  }
}

/**
 * Fenwick Tree (Binary Indexed Tree) - O(log n) update/query, O(n) space
 * Best for: Prefix sum queries, frequency counting
 */
class FenwickTree {
  private tree: number[];
  private n: number;

  constructor(size: number) {
    this.n = size;
    this.tree = new Array(size + 1).fill(0);
  }

  // O(log n) update
  update(idx: number, delta: number): void {
    for (let i = idx + 1; i <= this.n; i += i & -i) {
      this.tree[i] += delta;
    }
  }

  // O(log n) prefix sum query
  query(idx: number): number {
    let sum = 0;
    for (let i = idx + 1; i > 0; i -= i & -i) {
      sum += this.tree[i];
    }
    return sum;
  }

  // O(log n) range sum query
  rangeQuery(left: number, right: number): number {
    return this.query(right) - (left > 0 ? this.query(left - 1) : 0);
  }
}

/**
 * Disjoint Set Union (Union-Find) with Path Compression and Union by Rank
 * O(α(n)) amortized time for union/find operations (practically O(1))
 */
class UnionFind {
  private parent: number[];
  private rank: number[];
  private components: number;

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
    this.components = n;
  }

  // O(α(n)) amortized - practically O(1)
  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // Path compression
    }
    return this.parent[x];
  }

  // O(α(n)) amortized - practically O(1)
  union(x: number, y: number): boolean {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX === rootY) return false;

    // Union by rank
    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }

    this.components--;
    return true;
  }

  isConnected(x: number, y: number): boolean {
    return this.find(x) === this.find(y);
  }

  getComponents(): number {
    return this.components;
  }
}

/**
 * Suffix Array with LCP Array - O(n log n) build, O(log n) search
 * Best for: String pattern matching, longest common substring
 */
class SuffixArray {
  private text: string;
  private suffixArray: number[];
  private lcpArray: number[];

  constructor(text: string) {
    this.text = text;
    this.suffixArray = this.buildSuffixArray();
    this.lcpArray = this.buildLCPArray();
  }

  // O(n log n) construction using counting sort optimization
  private buildSuffixArray(): number[] {
    const n = this.text.length;
    const suffixes = Array.from({ length: n }, (_, i) => i);

    // Radix sort based approach for O(n log n)
    let gap = 1;
    const rank = Array.from({ length: n }, (_, i) => this.text.charCodeAt(i));
    const tempRank = new Array(n);

    while (gap < n) {
      // Sort by second key (rank[i + gap])
      suffixes.sort((a, b) => {
        const aSecond = a + gap < n ? rank[a + gap] : -1;
        const bSecond = b + gap < n ? rank[b + gap] : -1;
        if (rank[a] === rank[b]) {
          return aSecond - bSecond;
        }
        return rank[a] - rank[b];
      });

      // Update ranks
      tempRank[suffixes[0]] = 0;
      for (let i = 1; i < n; i++) {
        const curr = suffixes[i];
        const prev = suffixes[i - 1];
        const currSecond = curr + gap < n ? rank[curr + gap] : -1;
        const prevSecond = prev + gap < n ? rank[prev + gap] : -1;

        if (rank[curr] === rank[prev] && currSecond === prevSecond) {
          tempRank[curr] = tempRank[prev];
        } else {
          tempRank[curr] = i;
        }
      }

      rank.splice(0, n, ...tempRank);
      gap *= 2;
    }

    return suffixes;
  }

  // O(n) LCP array construction using Kasai's algorithm
  private buildLCPArray(): number[] {
    const n = this.text.length;
    const lcp = new Array(n - 1);
    const invSuffix = new Array(n);

    for (let i = 0; i < n; i++) {
      invSuffix[this.suffixArray[i]] = i;
    }

    let k = 0;
    for (let i = 0; i < n; i++) {
      if (invSuffix[i] === n - 1) {
        k = 0;
        continue;
      }

      const j = this.suffixArray[invSuffix[i] + 1];
      while (i + k < n && j + k < n && this.text[i + k] === this.text[j + k]) {
        k++;
      }

      lcp[invSuffix[i]] = k;
      if (k > 0) k--;
    }

    return lcp;
  }

  // O(log n) pattern search
  search(pattern: string): number[] {
    const results: number[] = [];
    const left = this.lowerBound(pattern);
    const right = this.upperBound(pattern);

    for (let i = left; i < right; i++) {
      results.push(this.suffixArray[i]);
    }

    return results.sort((a, b) => a - b);
  }

  private lowerBound(pattern: string): number {
    let left = 0,
      right = this.suffixArray.length;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      const suffix = this.text.substring(this.suffixArray[mid]);
      if (suffix.localeCompare(pattern) < 0) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    return left;
  }

  private upperBound(pattern: string): number {
    let left = 0,
      right = this.suffixArray.length;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      const suffix = this.text.substring(this.suffixArray[mid]);
      if (suffix.substring(0, pattern.length).localeCompare(pattern) <= 0) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    return left;
  }
}

/**
 * Skip List - O(log n) average search/insert/delete, O(n) space
 * Probabilistic alternative to balanced trees with better constant factors
 */
class SkipList<T> {
  private maxLevel: number;
  private head: SkipListNode<T>;
  private level: number;
  private compare: (a: T, b: T) => number;

  constructor(
    compare: (a: T, b: T) => number = (a, b) => (a < b ? -1 : a > b ? 1 : 0)
  ) {
    this.maxLevel = 16;
    this.head = new SkipListNode<T>(null as any, this.maxLevel);
    this.level = 0;
    this.compare = compare;
  }

  // O(log n) average search
  search(value: T): boolean {
    let current = this.head;

    for (let i = this.level; i >= 0; i--) {
      while (
        current.forward[i] &&
        this.compare(current.forward[i].value, value) < 0
      ) {
        current = current.forward[i];
      }
    }

    current = current.forward[0];
    return current && this.compare(current.value, value) === 0;
  }

  // O(log n) average insert
  insert(value: T): void {
    const update = new Array(this.maxLevel + 1);
    let current = this.head;

    for (let i = this.level; i >= 0; i--) {
      while (
        current.forward[i] &&
        this.compare(current.forward[i].value, value) < 0
      ) {
        current = current.forward[i];
      }
      update[i] = current;
    }

    const newLevel = this.randomLevel();
    if (newLevel > this.level) {
      for (let i = this.level + 1; i <= newLevel; i++) {
        update[i] = this.head;
      }
      this.level = newLevel;
    }

    const newNode = new SkipListNode(value, newLevel);
    for (let i = 0; i <= newLevel; i++) {
      newNode.forward[i] = update[i].forward[i];
      update[i].forward[i] = newNode;
    }
  }

  // O(log n) average delete
  delete(value: T): boolean {
    const update = new Array(this.maxLevel + 1);
    let current = this.head;

    for (let i = this.level; i >= 0; i--) {
      while (
        current.forward[i] &&
        this.compare(current.forward[i].value, value) < 0
      ) {
        current = current.forward[i];
      }
      update[i] = current;
    }

    current = current.forward[0];
    if (!current || this.compare(current.value, value) !== 0) {
      return false;
    }

    for (let i = 0; i <= this.level; i++) {
      if (update[i].forward[i] !== current) break;
      update[i].forward[i] = current.forward[i];
    }

    while (this.level > 0 && !this.head.forward[this.level]) {
      this.level--;
    }

    return true;
  }

  private randomLevel(): number {
    let level = 0;
    while (Math.random() < 0.5 && level < this.maxLevel) {
      level++;
    }
    return level;
  }
}

class SkipListNode<T> {
  value: T;
  forward: SkipListNode<T>[];

  constructor(value: T, level: number) {
    this.value = value;
    this.forward = new Array(level + 1);
  }
}

/**
 * Bloom Filter - O(1) insert/query, O(m) space, probabilistic membership testing
 * Best for: Fast membership testing with false positives acceptable
 */
class BloomFilter {
  private bitArray: boolean[];
  private size: number;
  private hashFunctions: number;

  constructor(expectedElements: number, falsePositiveRate: number = 0.01) {
    // Validate input parameters
    if (expectedElements <= 0) {
      throw new Error('Expected elements must be greater than 0');
    }
    if (falsePositiveRate <= 0 || falsePositiveRate >= 1) {
      throw new Error(
        'False positive rate must be between 0 and 1 (exclusive)'
      );
    }

    // Calculate optimal size and hash functions
    this.size = Math.ceil(
      (-expectedElements * Math.log(falsePositiveRate)) / Math.log(2) ** 2
    );
    this.hashFunctions = Math.ceil(
      (this.size * Math.log(2)) / expectedElements
    );

    // Validate calculated size
    if (this.size <= 0 || !isFinite(this.size)) {
      throw new Error('Invalid calculated array size. Check input parameters.');
    }

    // Limit maximum size to prevent memory issues
    if (this.size > 10000000) {
      // 10M bits max
      this.size = 10000000;
      this.hashFunctions = Math.ceil(
        (this.size * Math.log(2)) / expectedElements
      );
    }

    this.bitArray = new Array(this.size).fill(false);
  }

  // O(1) insert
  add(item: string): void {
    for (let i = 0; i < this.hashFunctions; i++) {
      const hash = this.hash(item, i) % this.size;
      this.bitArray[hash] = true;
    }
  }

  // O(1) membership test (may have false positives, no false negatives)
  contains(item: string): boolean {
    for (let i = 0; i < this.hashFunctions; i++) {
      const hash = this.hash(item, i) % this.size;
      if (!this.bitArray[hash]) {
        return false;
      }
    }
    return true;
  }

  private hash(item: string, seed: number): number {
    let hash = seed;
    for (let i = 0; i < item.length; i++) {
      hash = (hash * 31 + item.charCodeAt(i)) >>> 0;
    }
    return hash;
  }

  // Get memory usage info
  getStats(): { size: number; setBits: number; utilization: number } {
    const setBits = this.bitArray.filter((bit) => bit).length;
    return {
      size: this.size,
      setBits,
      utilization: setBits / this.size,
    };
  }
}

/**
 * Count-Min Sketch - O(1) update/query, O(w * d) space
 * Best for: Frequency estimation in streams with bounded error
 */
class CountMinSketch {
  private table: number[][];
  private width: number;
  private depth: number;
  private hashSeeds: number[];

  constructor(epsilon: number = 0.01, delta: number = 0.01) {
    this.width = Math.ceil(Math.E / epsilon);
    this.depth = Math.ceil(Math.log(1 / delta));
    this.table = Array.from({ length: this.depth }, () =>
      new Array(this.width).fill(0)
    );
    this.hashSeeds = Array.from({ length: this.depth }, () =>
      Math.floor(Math.random() * 1000000)
    );
  }

  // O(1) update frequency
  update(item: string, count: number = 1): void {
    for (let i = 0; i < this.depth; i++) {
      const hash = this.hash(item, this.hashSeeds[i]) % this.width;
      this.table[i][hash] += count;
    }
  }

  // O(1) frequency estimation
  estimate(item: string): number {
    let minCount = Infinity;
    for (let i = 0; i < this.depth; i++) {
      const hash = this.hash(item, this.hashSeeds[i]) % this.width;
      minCount = Math.min(minCount, this.table[i][hash]);
    }
    return minCount;
  }

  private hash(item: string, seed: number): number {
    let hash = seed;
    for (let i = 0; i < item.length; i++) {
      hash = (hash * 31 + item.charCodeAt(i)) >>> 0;
    }
    return hash;
  }
}

/**
 * Van Emde Boas Tree - O(log log U) operations where U is universe size
 * Best for: Integer operations with small universe size
 */
class VEBTree {
  private universeSize: number;
  private min: number | null = null;
  private max: number | null = null;
  private summary: VEBTree | null = null;
  private clusters: VEBTree[] = [];

  constructor(universeSize: number) {
    this.universeSize = universeSize;

    if (universeSize > 2) {
      const clusterSize = Math.ceil(Math.sqrt(universeSize));
      const summarySize = Math.ceil(universeSize / clusterSize);

      this.summary = new VEBTree(summarySize);
      this.clusters = Array.from(
        { length: summarySize },
        () => new VEBTree(clusterSize)
      );
    }
  }

  // O(log log U) membership test
  member(x: number): boolean {
    if (x === this.min || x === this.max) return true;
    if (this.universeSize <= 2) return false;

    const cluster = Math.floor(x / Math.ceil(Math.sqrt(this.universeSize)));
    const position = x % Math.ceil(Math.sqrt(this.universeSize));

    return this.clusters[cluster].member(position);
  }

  // O(log log U) insert
  insert(x: number): void {
    if (this.min === null) {
      this.min = this.max = x;
      return;
    }

    if (x < this.min!) {
      [x, this.min] = [this.min, x];
    }

    if (this.universeSize > 2) {
      const cluster = Math.floor(x / Math.ceil(Math.sqrt(this.universeSize)));
      const position = x % Math.ceil(Math.sqrt(this.universeSize));

      if (this.clusters[cluster].min === null) {
        this.summary!.insert(cluster);
      }

      this.clusters[cluster].insert(position);
    }

    if (x > this.max!) {
      this.max = x;
    }
  }

  // O(log log U) successor
  successor(x: number): number | null {
    if (this.universeSize <= 2) {
      if (x === 0 && this.max === 1) return 1;
      return null;
    }

    if (this.min !== null && x < this.min) {
      return this.min;
    }

    const cluster = Math.floor(x / Math.ceil(Math.sqrt(this.universeSize)));
    const position = x % Math.ceil(Math.sqrt(this.universeSize));
    const maxInCluster = this.clusters[cluster].max;

    if (maxInCluster !== null && position < maxInCluster) {
      const offset = this.clusters[cluster].successor(position);
      return cluster * Math.ceil(Math.sqrt(this.universeSize)) + offset!;
    }

    const successorCluster = this.summary!.successor(cluster);
    if (successorCluster === null) return null;

    const offset = this.clusters[successorCluster].min;
    return successorCluster * Math.ceil(Math.sqrt(this.universeSize)) + offset!;
  }
}

/**
 * Complexity Analysis and Monitoring
 */
class ComplexityAnalyzer {
  private static measurements = new Map<
    string,
    Array<{ input_size: number; time: number; memory: number }>
  >();

  static measureComplexity<T>(
    operationName: string,
    inputSize: number,
    operation: () => T
  ): { result: T; time: number; memory: number } {
    const startMemory = this.getMemoryUsage();
    const startTime = performance.now();

    const result = operation();

    const endTime = performance.now();
    const endMemory = this.getMemoryUsage();

    const time = endTime - startTime;
    const memory = endMemory - startMemory;

    if (!this.measurements.has(operationName)) {
      this.measurements.set(operationName, []);
    }

    this.measurements
      .get(operationName)!
      .push({ input_size: inputSize, time, memory });

    return { result, time, memory };
  }

  static getComplexityProfile(operationName: string): {
    timeComplexity: string;
    spaceComplexity: string;
    measurements: Array<{ input_size: number; time: number; memory: number }>;
  } | null {
    const data = this.measurements.get(operationName);
    if (!data || data.length < 2) return null;

    // Analyze time complexity growth rate
    const timeGrowth = this.analyzeGrowthRate(
      data.map((d) => ({ x: d.input_size, y: d.time }))
    );
    const memoryGrowth = this.analyzeGrowthRate(
      data.map((d) => ({ x: d.input_size, y: d.memory }))
    );

    return {
      timeComplexity: this.classifyComplexity(timeGrowth),
      spaceComplexity: this.classifyComplexity(memoryGrowth),
      measurements: [...data],
    };
  }

  private static analyzeGrowthRate(
    points: Array<{ x: number; y: number }>
  ): number {
    if (points.length < 2) return 0;

    // Calculate average growth rate
    let totalGrowth = 0;
    let validPairs = 0;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];

      if (prev.x > 0 && curr.x > 0 && prev.y > 0 && curr.y > 0) {
        const inputRatio = curr.x / prev.x;
        const outputRatio = curr.y / prev.y;

        if (inputRatio > 1) {
          totalGrowth += Math.log(outputRatio) / Math.log(inputRatio);
          validPairs++;
        }
      }
    }

    return validPairs > 0 ? totalGrowth / validPairs : 0;
  }

  private static classifyComplexity(growthRate: number): string {
    if (growthRate < 0.1) return 'O(1)';
    if (growthRate < 0.7) return 'O(log n)';
    if (growthRate < 1.2) return 'O(n)';
    if (growthRate < 1.7) return 'O(n log n)';
    if (growthRate < 2.2) return 'O(n²)';
    if (growthRate < 3.2) return 'O(n³)';
    return 'O(exponential)';
  }

  private static getMemoryUsage(): number {
    // In browser environment, we can only approximate memory usage
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize || 0;
    }
    return 0;
  }

  static clearMeasurements(operationName?: string): void {
    if (operationName) {
      this.measurements.delete(operationName);
    } else {
      this.measurements.clear();
    }
  }

  static getAllProfiles(): Record<string, any> {
    const profiles: Record<string, any> = {};
    for (const [name] of this.measurements) {
      profiles[name] = this.getComplexityProfile(name);
    }
    return profiles;
  }
}

/**
 * Memory Pool for Object Recycling - O(1) allocation/deallocation
 * Reduces garbage collection overhead
 */
class MemoryPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;
  private maxSize: number;

  constructor(
    factory: () => T,
    reset: (obj: T) => void,
    maxSize: number = 1000
  ) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;
  }

  // O(1) object acquisition
  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.factory();
  }

  // O(1) object release
  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.reset(obj);
      this.pool.push(obj);
    }
  }

  // Pool statistics
  getStats(): { poolSize: number; maxSize: number; utilization: number } {
    return {
      poolSize: this.pool.length,
      maxSize: this.maxSize,
      utilization: this.pool.length / this.maxSize,
    };
  }
}

/**
 * Lazy Evaluation Wrapper - Defers computation until needed
 * O(1) creation, actual complexity depends on wrapped operation
 */
class Lazy<T> {
  private value: T | undefined;
  private computed = false;
  private computation: () => T;

  constructor(computation: () => T) {
    this.computation = computation;
  }

  // O(1) if already computed, otherwise depends on computation
  get(): T {
    if (!this.computed) {
      this.value = this.computation();
      this.computed = true;
    }
    return this.value!;
  }

  // Reset for re-computation
  reset(): void {
    this.computed = false;
    this.value = undefined;
  }

  isComputed(): boolean {
    return this.computed;
  }
}

// Export all classes
export {
  SegmentTree,
  FenwickTree,
  UnionFind,
  SuffixArray,
  SkipList,
  BloomFilter,
  CountMinSketch,
  VEBTree,
  ComplexityAnalyzer,
  MemoryPool,
  Lazy,
};
