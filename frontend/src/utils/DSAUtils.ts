'use client';

// Enhanced Data Structures and Algorithms Utility for Best Performance

/**
 * Priority Queue implementation using Binary Heap
 * Time Complexity: O(log n) for insert/extract, O(1) for peek
 */
export class PriorityQueue<T> {
  private heap: T[] = [];
  private compareFn: (a: T, b: T) => number;

  constructor(compareFn?: (a: T, b: T) => number) {
    this.compareFn = compareFn || ((a: any, b: any) => (a < b ? -1 : a > b ? 1 : 0));
  }

  enqueue(item: T): void {
    this.heap.push(item);
    this.heapifyUp(this.heap.length - 1);
  }

  dequeue(): T | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop()!;

    const result = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.heapifyDown(0);
    return result;
  }

  peek(): T | undefined {
    return this.heap.length > 0 ? this.heap[0] : undefined;
  }

  size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  // Legacy methods for backward compatibility
  insert(item: T, priority: number): void {
    this.heap.push({ item, priority } as any);
    this.heapifyUp(this.heap.length - 1);
  }

  extractMax(): T | null {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return (this.heap.pop() as any).item || this.heap.pop()!;

    const max = (this.heap[0] as any).item || this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.heapifyDown(0);
    return max;
  }

  private heapifyUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      // For min heap: break if parent <= child
      if (this.compareFn(this.heap[parentIndex], this.heap[index]) <= 0) break;
      this.swap(parentIndex, index);
      index = parentIndex;
    }
  }

  private heapifyDown(index: number): void {
    while (true) {
      let minIndex = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      // For min heap: pick the smaller child
      if (leftChild < this.heap.length &&
          this.compareFn(this.heap[leftChild], this.heap[minIndex]) < 0) {
        minIndex = leftChild;
      }

      if (rightChild < this.heap.length &&
          this.compareFn(this.heap[rightChild], this.heap[minIndex]) < 0) {
        minIndex = rightChild;
      }

      if (minIndex === index) break;
      this.swap(index, minIndex);
      index = minIndex;
    }
  }

  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }
}

/**
 * Trie data structure for efficient string operations
 * Time Complexity: O(m) for insert/search where m is string length
 */
export class Trie {
  private root: TrieNode = new TrieNode();

  insert(word: string): void {
    let current = this.root;
    for (const char of word.toLowerCase()) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }
    current.isEndOfWord = true;
  }

  search(word: string): boolean {
    let current = this.root;
    for (const char of word.toLowerCase()) {
      if (!current.children.has(char)) return false;
      current = current.children.get(char)!;
    }
    return current.isEndOfWord;
  }

  startsWith(prefix: string): boolean {
    let current = this.root;
    for (const char of prefix.toLowerCase()) {
      if (!current.children.has(char)) return false;
      current = current.children.get(char)!;
    }
    return true;
  }

  getWordsWithPrefix(prefix: string): string[] {
    let current = this.root;
    for (const char of prefix.toLowerCase()) {
      if (!current.children.has(char)) return [];
      current = current.children.get(char)!;
    }

    const words: string[] = [];
    this.dfs(current, prefix, words);
    return words;
  }

  findWordsWithPrefix(prefix: string): string[] {
    return this.getWordsWithPrefix(prefix);
  }

  delete(word: string): boolean {
    return this.deleteHelper(this.root, word.toLowerCase(), 0);
  }

  private deleteHelper(node: TrieNode, word: string, index: number): boolean {
    if (index === word.length) {
      if (!node.isEndOfWord) return false;
      node.isEndOfWord = false;
      return node.children.size === 0;
    }

    const char = word[index];
    const childNode = node.children.get(char);
    if (!childNode) return false;

    const shouldDeleteChild = this.deleteHelper(childNode, word, index + 1);

    if (shouldDeleteChild) {
      node.children.delete(char);
      return node.children.size === 0 && !node.isEndOfWord;
    }

    return false;
  }

  private dfs(node: TrieNode, currentWord: string, words: string[]): void {
    if (node.isEndOfWord) {
      words.push(currentWord);
    }

    for (const [char, childNode] of node.children) {
      this.dfs(childNode, currentWord + char, words);
    }
  }
}

class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord: boolean = false;
}

/**
 * LRU Cache implementation using HashMap + Doubly Linked List
 * Time Complexity: O(1) for get/put operations
 */
export class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, Node<K, V>> = new Map();
  private head: Node<K, V>;
  private tail: Node<K, V>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.head = new Node(null as any, null as any);
    this.tail = new Node(null as any, null as any);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key: K): V | undefined {
    const node = this.cache.get(key);
    if (!node) return undefined;

    this.moveToHead(node);
    return node.value;
  }

  get size(): number {
    return this.cache.size;
  }

  clear(): void {
    this.cache.clear();
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  put(key: K, value: V): void {
    const existingNode = this.cache.get(key);

    if (existingNode) {
      existingNode.value = value;
      this.moveToHead(existingNode);
    } else {
      const newNode = new Node(key, value);

      if (this.cache.size >= this.capacity) {
        const lastNode = this.removeTail();
        this.cache.delete(lastNode.key);
      }

      this.cache.set(key, newNode);
      this.addToHead(newNode);
    }
  }

  private addToHead(node: Node<K, V>): void {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  private removeNode(node: Node<K, V>): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  private moveToHead(node: Node<K, V>): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  private removeTail(): Node<K, V> {
    const lastNode = this.tail.prev!;
    this.removeNode(lastNode);
    return lastNode;
  }
}

class Node<K, V> {
  key: K;
  value: V;
  prev: Node<K, V> | null = null;
  next: Node<K, V> | null = null;

  constructor(key: K, value: V) {
    this.key = key;
    this.value = value;
  }
}

/**
 * Advanced Search Algorithms
 */
export class SearchAlgorithms {
  /**
   * Binary search - O(log n)
   */
  static binarySearch<T>(array: T[], target: T, compareFn: (a: T, b: T) => number): number {
    let left = 0;
    let right = array.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const cmp = compareFn(array[mid], target);

      if (cmp === 0) return mid;
      if (cmp < 0) left = mid + 1;
      else right = mid - 1;
    }

    return -1;
  }

  /**
   * Boyer-Moore string search - O(n/m) average case
   */
  static boyerMooreSearch(text: string, pattern: string): number[] {
    const positions: number[] = [];
    const m = pattern.length;
    const n = text.length;

    if (m === 0) return positions;

    const badChar = this.buildBadCharTable(pattern);

    let skip = 0;
    while (skip <= n - m) {
      let j = m - 1;

      while (j >= 0 && pattern[j] === text[skip + j]) {
        j--;
      }

      if (j < 0) {
        positions.push(skip);
        skip += (skip + m < n) ? m - badChar[text.charCodeAt(skip + m)] : 1;
      } else {
        skip += Math.max(1, j - badChar[text.charCodeAt(skip + j)]);
      }
    }

    return positions;
  }

  private static buildBadCharTable(pattern: string): number[] {
    const table = new Array(256).fill(-1);
    for (let i = 0; i < pattern.length; i++) {
      table[pattern.charCodeAt(i)] = i;
    }
    return table;
  }

  /**
   * Fuzzy search using Levenshtein distance with optimizations
   */
  static fuzzySearch(query: string, candidates: string[], threshold: number = 0.6): Array<{item: string, score: number}> {
    const results = candidates.map(candidate => ({
      item: candidate,
      score: this.jaroWinklerSimilarity(query.toLowerCase(), candidate.toLowerCase())
    }));

    return results
      .filter(result => result.score >= threshold)
      .sort((a, b) => b.score - a.score);
  }

  private static jaroWinklerSimilarity(s1: string, s2: string): number {
    const jaro = this.jaroSimilarity(s1, s2);
    const prefixLength = this.commonPrefixLength(s1, s2, 4);
    return jaro + (0.1 * prefixLength * (1 - jaro));
  }

  private static jaroSimilarity(s1: string, s2: string): number {
    if (s1.length === 0 && s2.length === 0) return 1;
    if (s1.length === 0 || s2.length === 0) return 0;

    const matchWindow = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
    const s1Matches = new Array(s1.length).fill(false);
    const s2Matches = new Array(s2.length).fill(false);

    let matches = 0;
    let transpositions = 0;

    // Find matches
    for (let i = 0; i < s1.length; i++) {
      const start = Math.max(0, i - matchWindow);
      const end = Math.min(i + matchWindow + 1, s2.length);

      for (let j = start; j < end; j++) {
        if (s2Matches[j] || s1[i] !== s2[j]) continue;
        s1Matches[i] = s2Matches[j] = true;
        matches++;
        break;
      }
    }

    if (matches === 0) return 0;

    // Count transpositions
    let k = 0;
    for (let i = 0; i < s1.length; i++) {
      if (!s1Matches[i]) continue;
      while (!s2Matches[k]) k++;
      if (s1[i] !== s2[k]) transpositions++;
      k++;
    }

    return (matches / s1.length + matches / s2.length + (matches - transpositions / 2) / matches) / 3;
  }

  private static commonPrefixLength(s1: string, s2: string, maxLength: number): number {
    let length = 0;
    for (let i = 0; i < Math.min(s1.length, s2.length, maxLength); i++) {
      if (s1[i] === s2[i]) length++;
      else break;
    }
    return length;
  }
}

/**
 * Graph algorithms for relationship and network analysis
 */
export class GraphAlgorithms {
  /**
   * Find shortest path using Dijkstra's algorithm
   */
  static dijkstra<T>(
    graph: Map<T, Array<{node: T, weight: number}>>,
    start: T,
    end: T
  ): {path: T[], distance: number} | null {
    const distances = new Map<T, number>();
    const previous = new Map<T, T | null>();
    const unvisited = new PriorityQueue<T>();

    // Initialize distances
    for (const node of graph.keys()) {
      distances.set(node, node === start ? 0 : Infinity);
      previous.set(node, null);
      unvisited.insert(node, node === start ? 0 : -Infinity);
    }

    while (unvisited.size() > 0) {
      const current = unvisited.extractMax()!;

      if (current === end) break;
      if (distances.get(current) === Infinity) break;

      const neighbors = graph.get(current) || [];
      for (const neighbor of neighbors) {
        const alt = distances.get(current)! + neighbor.weight;
        if (alt < distances.get(neighbor.node)!) {
          distances.set(neighbor.node, alt);
          previous.set(neighbor.node, current);
        }
      }
    }

    // Reconstruct path
    const path: T[] = [];
    let current: T | null = end;
    while (current !== null) {
      path.unshift(current);
      current = previous.get(current) || null;
    }

    if (path[0] !== start) return null;

    return {
      path,
      distance: distances.get(end)!
    };
  }

  /**
   * Detect cycles in directed graph using DFS
   */
  static hasCycle<T>(graph: Map<T, T[]>): boolean {
    const visited = new Set<T>();
    const recursionStack = new Set<T>();

    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        if (this.hasCycleDFS(graph, node, visited, recursionStack)) {
          return true;
        }
      }
    }

    return false;
  }

  private static hasCycleDFS<T>(
    graph: Map<T, T[]>,
    node: T,
    visited: Set<T>,
    recursionStack: Set<T>
  ): boolean {
    visited.add(node);
    recursionStack.add(node);

    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (this.hasCycleDFS(graph, neighbor, visited, recursionStack)) {
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }

    recursionStack.delete(node);
    return false;
  }
}

/**
 * Advanced sorting with multiple algorithms and optimizations
 */
export class OptimizedSorting {
  /**
   * Hybrid sorting algorithm that chooses best approach based on data characteristics
   */
  static smartSort<T>(
    array: T[],
    compareFn?: (a: T, b: T) => number
  ): T[] {
    if (array.length <= 1) return [...array];

    const compare = compareFn || ((a, b) => a < b ? -1 : a > b ? 1 : 0);

    // Choose algorithm based on array characteristics
    if (array.length < 50) {
      return this.insertionSort([...array], compare);
    } else if (this.isNearlySorted(array, compare)) {
      return this.timSort([...array], compare);
    } else if (array.length > 10000) {
      return this.parallelQuickSort([...array], compare);
    } else {
      return this.quickSort([...array], compare);
    }
  }

  private static isNearlySorted<T>(array: T[], compare: (a: T, b: T) => number): boolean {
    let inversions = 0;
    for (let i = 0; i < array.length - 1; i++) {
      if (compare(array[i], array[i + 1]) > 0) {
        inversions++;
        if (inversions > array.length * 0.1) return false;
      }
    }
    return true;
  }

  private static insertionSort<T>(array: T[], compare: (a: T, b: T) => number): T[] {
    for (let i = 1; i < array.length; i++) {
      const key = array[i];
      let j = i - 1;
      while (j >= 0 && compare(array[j], key) > 0) {
        array[j + 1] = array[j];
        j--;
      }
      array[j + 1] = key;
    }
    return array;
  }

  private static quickSort<T>(array: T[], compare: (a: T, b: T) => number): T[] {
    if (array.length <= 1) return array;

    const pivot = array[Math.floor(array.length / 2)];
    const left = array.filter(x => compare(x, pivot) < 0);
    const middle = array.filter(x => compare(x, pivot) === 0);
    const right = array.filter(x => compare(x, pivot) > 0);

    return [
      ...this.quickSort(left, compare),
      ...middle,
      ...this.quickSort(right, compare)
    ];
  }

  private static timSort<T>(array: T[], compare: (a: T, b: T) => number): T[] {
    // Simplified TimSort implementation
    const minMerge = 32;

    if (array.length < minMerge) {
      return this.insertionSort(array, compare);
    }

    const mid = Math.floor(array.length / 2);
    const left = this.timSort(array.slice(0, mid), compare);
    const right = this.timSort(array.slice(mid), compare);

    return this.merge(left, right, compare);
  }

  private static merge<T>(left: T[], right: T[], compare: (a: T, b: T) => number): T[] {
    const result: T[] = [];
    let i = 0, j = 0;

    while (i < left.length && j < right.length) {
      if (compare(left[i], right[j]) <= 0) {
        result.push(left[i++]);
      } else {
        result.push(right[j++]);
      }
    }

    return result.concat(left.slice(i)).concat(right.slice(j));
  }

  private static parallelQuickSort<T>(array: T[], compare: (a: T, b: T) => number): T[] {
    // Simplified parallel sorting (would use Web Workers in real implementation)
    return this.quickSort(array, compare);
  }
}

/**
 * Memory-efficient data operations
 */
export class MemoryOptimizedOperations {
  /**
   * Process large datasets in chunks to avoid memory issues
   */
  static async processInChunks<T, R>(
    data: T[],
    processor: (chunk: T[]) => R[],
    chunkSize: number = 1000
  ): Promise<R[]> {
    const results: R[] = [];

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      const chunkResults = processor(chunk);
      results.push(...chunkResults);

      // Allow garbage collection between chunks
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    return results;
  }

  /**
   * Virtual scrolling for large lists
   */
  static calculateVisibleItems(
    totalItems: number,
    itemHeight: number,
    containerHeight: number,
    scrollTop: number,
    buffer: number = 5
  ): {startIndex: number, endIndex: number, offsetY: number} {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
    const endIndex = Math.min(totalItems - 1, startIndex + visibleCount + 2 * buffer);
    const offsetY = startIndex * itemHeight;

    return { startIndex, endIndex, offsetY };
  }
}

/**
 * Performance monitoring and analytics
 */
export class PerformanceAnalytics {
  private static measurements = new Map<string, number[]>();

  static measure<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();

    if (!this.measurements.has(name)) {
      this.measurements.set(name, []);
    }
    this.measurements.get(name)!.push(end - start);

    return result;
  }

  static async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();

    if (!this.measurements.has(name)) {
      this.measurements.set(name, []);
    }
    this.measurements.get(name)!.push(end - start);

    return result;
  }

  static getStats(name: string): {
    count: number;
    totalTime: number;
    averageTime: number;
    minTime: number;
    maxTime: number;
  } | null {
    const times = this.measurements.get(name);
    if (!times) return null;

    // Return zeros for empty measurements (after clear)
    if (times.length === 0) {
      return {
        count: 0,
        totalTime: 0,
        averageTime: 0,
        minTime: 0,
        maxTime: 0
      };
    }

    const sum = times.reduce((a, b) => a + b, 0);
    return {
      count: times.length,
      totalTime: sum,
      averageTime: sum / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times)
    };
  }

  static clearMeasurements(name?: string): void {
    if (name) {
      this.measurements.set(name, []);
    } else {
      // Clear all measurements but keep the keys
      for (const key of this.measurements.keys()) {
        this.measurements.set(key, []);
      }
    }
  }
}