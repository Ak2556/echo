'use client';

/**
 * COMPREHENSIVE DATA STRUCTURES & ALGORITHMS LIBRARY
 * Enterprise-grade implementation with full TypeScript support
 * Author: Echo Team
 * Performance: Optimized for production use
 */

// ============================================================================
// LINEAR DATA STRUCTURES
// ============================================================================

/**
 * Stack - LIFO (Last In First Out)
 * Time Complexity: O(1) for all operations
 */
export class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }

  toArray(): T[] {
    return [...this.items];
  }
}

/**
 * Queue - FIFO (First In First Out)
 * Time Complexity: O(1) for enqueue/dequeue
 */
export class Queue<T> {
  private items: T[] = [];
  private head: number = 0;

  enqueue(item: T): void {
    this.items.push(item);
  }

  dequeue(): T | undefined {
    if (this.isEmpty()) return undefined;
    const item = this.items[this.head];
    this.head++;

    // Optimize memory by resetting when queue is empty
    if (this.head > 100 && this.head > this.items.length / 2) {
      this.items = this.items.slice(this.head);
      this.head = 0;
    }

    return item;
  }

  peek(): T | undefined {
    return this.items[this.head];
  }

  isEmpty(): boolean {
    return this.head >= this.items.length;
  }

  size(): number {
    return this.items.length - this.head;
  }

  clear(): void {
    this.items = [];
    this.head = 0;
  }

  toArray(): T[] {
    return this.items.slice(this.head);
  }
}

/**
 * Deque - Double-Ended Queue
 * Time Complexity: O(1) for all operations
 */
export class Deque<T> {
  private items: T[] = [];

  addFront(item: T): void {
    this.items.unshift(item);
  }

  addRear(item: T): void {
    this.items.push(item);
  }

  removeFront(): T | undefined {
    return this.items.shift();
  }

  removeRear(): T | undefined {
    return this.items.pop();
  }

  peekFront(): T | undefined {
    return this.items[0];
  }

  peekRear(): T | undefined {
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }
}

/**
 * Circular Buffer - Fixed-size ring buffer
 * Time Complexity: O(1) for all operations
 */
export class CircularBuffer<T> {
  private buffer: (T | undefined)[];
  private head: number = 0;
  private tail: number = 0;
  private count: number = 0;

  constructor(private capacity: number) {
    this.buffer = new Array(capacity);
  }

  enqueue(item: T): boolean {
    if (this.isFull()) return false;

    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;
    this.count++;
    return true;
  }

  dequeue(): T | undefined {
    if (this.isEmpty()) return undefined;

    const item = this.buffer[this.head];
    this.buffer[this.head] = undefined;
    this.head = (this.head + 1) % this.capacity;
    this.count--;
    return item;
  }

  peek(): T | undefined {
    return this.isEmpty() ? undefined : this.buffer[this.head];
  }

  isEmpty(): boolean {
    return this.count === 0;
  }

  isFull(): boolean {
    return this.count === this.capacity;
  }

  size(): number {
    return this.count;
  }

  clear(): void {
    this.buffer = new Array(this.capacity);
    this.head = 0;
    this.tail = 0;
    this.count = 0;
  }
}

/**
 * Singly Linked List
 * Time Complexity: O(1) insert at head, O(n) for search/delete
 */
class ListNode<T> {
  constructor(
    public value: T,
    public next: ListNode<T> | null = null
  ) {}
}

export class LinkedList<T> {
  private head: ListNode<T> | null = null;
  private tail: ListNode<T> | null = null;
  private length: number = 0;

  addFirst(value: T): void {
    const newNode = new ListNode(value, this.head);
    this.head = newNode;
    if (!this.tail) this.tail = newNode;
    this.length++;
  }

  addLast(value: T): void {
    const newNode = new ListNode(value);
    if (!this.head) {
      this.head = this.tail = newNode;
    } else {
      this.tail!.next = newNode;
      this.tail = newNode;
    }
    this.length++;
  }

  removeFirst(): T | undefined {
    if (!this.head) return undefined;

    const value = this.head.value;
    this.head = this.head.next;
    if (!this.head) this.tail = null;
    this.length--;
    return value;
  }

  find(value: T): ListNode<T> | null {
    let current = this.head;
    while (current) {
      if (current.value === value) return current;
      current = current.next;
    }
    return null;
  }

  remove(value: T): boolean {
    if (!this.head) return false;

    if (this.head.value === value) {
      this.removeFirst();
      return true;
    }

    let current = this.head;
    while (current.next) {
      if (current.next.value === value) {
        current.next = current.next.next;
        if (!current.next) this.tail = current;
        this.length--;
        return true;
      }
      current = current.next;
    }
    return false;
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  size(): number {
    return this.length;
  }

  isEmpty(): boolean {
    return this.length === 0;
  }

  clear(): void {
    this.head = this.tail = null;
    this.length = 0;
  }
}

/**
 * Doubly Linked List
 * Time Complexity: O(1) for add/remove at both ends
 */
class DoublyListNode<T> {
  constructor(
    public value: T,
    public next: DoublyListNode<T> | null = null,
    public prev: DoublyListNode<T> | null = null
  ) {}
}

export class DoublyLinkedList<T> {
  private head: DoublyListNode<T> | null = null;
  private tail: DoublyListNode<T> | null = null;
  private length: number = 0;

  addFirst(value: T): void {
    const newNode = new DoublyListNode(value, this.head);
    if (this.head) this.head.prev = newNode;
    this.head = newNode;
    if (!this.tail) this.tail = newNode;
    this.length++;
  }

  addLast(value: T): void {
    const newNode = new DoublyListNode(value, null, this.tail);
    if (this.tail) this.tail.next = newNode;
    this.tail = newNode;
    if (!this.head) this.head = newNode;
    this.length++;
  }

  removeFirst(): T | undefined {
    if (!this.head) return undefined;

    const value = this.head.value;
    this.head = this.head.next;
    if (this.head) this.head.prev = null;
    else this.tail = null;
    this.length--;
    return value;
  }

  removeLast(): T | undefined {
    if (!this.tail) return undefined;

    const value = this.tail.value;
    this.tail = this.tail.prev;
    if (this.tail) this.tail.next = null;
    else this.head = null;
    this.length--;
    return value;
  }

  size(): number {
    return this.length;
  }

  isEmpty(): boolean {
    return this.length === 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  clear(): void {
    this.head = this.tail = null;
    this.length = 0;
  }
}

// ============================================================================
// TREE DATA STRUCTURES
// ============================================================================

/**
 * Binary Search Tree
 * Time Complexity: O(log n) average, O(n) worst case
 */
class BSTNode<T> {
  constructor(
    public value: T,
    public left: BSTNode<T> | null = null,
    public right: BSTNode<T> | null = null
  ) {}
}

export class BinarySearchTree<T> {
  private root: BSTNode<T> | null = null;
  private compareFn: (a: T, b: T) => number;
  private count: number = 0;

  constructor(compareFn?: (a: T, b: T) => number) {
    this.compareFn =
      compareFn || ((a: any, b: any) => (a < b ? -1 : a > b ? 1 : 0));
  }

  insert(value: T): void {
    this.root = this.insertNode(this.root, value);
    this.count++;
  }

  private insertNode(node: BSTNode<T> | null, value: T): BSTNode<T> {
    if (!node) return new BSTNode(value);

    const cmp = this.compareFn(value, node.value);
    if (cmp < 0) {
      node.left = this.insertNode(node.left, value);
    } else if (cmp > 0) {
      node.right = this.insertNode(node.right, value);
    }

    return node;
  }

  search(value: T): boolean {
    return this.searchNode(this.root, value) !== null;
  }

  private searchNode(node: BSTNode<T> | null, value: T): BSTNode<T> | null {
    if (!node) return null;

    const cmp = this.compareFn(value, node.value);
    if (cmp === 0) return node;
    if (cmp < 0) return this.searchNode(node.left, value);
    return this.searchNode(node.right, value);
  }

  delete(value: T): boolean {
    const initialCount = this.count;
    this.root = this.deleteNode(this.root, value);
    return this.count < initialCount;
  }

  private deleteNode(node: BSTNode<T> | null, value: T): BSTNode<T> | null {
    if (!node) return null;

    const cmp = this.compareFn(value, node.value);

    if (cmp < 0) {
      node.left = this.deleteNode(node.left, value);
    } else if (cmp > 0) {
      node.right = this.deleteNode(node.right, value);
    } else {
      this.count--;

      // Node with one or no child
      if (!node.left) return node.right;
      if (!node.right) return node.left;

      // Node with two children: get inorder successor
      const minRight = this.findMin(node.right);
      node.value = minRight.value;
      node.right = this.deleteNode(node.right, minRight.value);
      this.count++; // Adjust since we'll decrement again
    }

    return node;
  }

  private findMin(node: BSTNode<T>): BSTNode<T> {
    while (node.left) node = node.left;
    return node;
  }

  inorder(): T[] {
    const result: T[] = [];
    this.inorderTraversal(this.root, result);
    return result;
  }

  private inorderTraversal(node: BSTNode<T> | null, result: T[]): void {
    if (!node) return;
    this.inorderTraversal(node.left, result);
    result.push(node.value);
    this.inorderTraversal(node.right, result);
  }

  preorder(): T[] {
    const result: T[] = [];
    this.preorderTraversal(this.root, result);
    return result;
  }

  private preorderTraversal(node: BSTNode<T> | null, result: T[]): void {
    if (!node) return;
    result.push(node.value);
    this.preorderTraversal(node.left, result);
    this.preorderTraversal(node.right, result);
  }

  postorder(): T[] {
    const result: T[] = [];
    this.postorderTraversal(this.root, result);
    return result;
  }

  private postorderTraversal(node: BSTNode<T> | null, result: T[]): void {
    if (!node) return;
    this.postorderTraversal(node.left, result);
    this.postorderTraversal(node.right, result);
    result.push(node.value);
  }

  levelOrder(): T[][] {
    if (!this.root) return [];

    const result: T[][] = [];
    const queue: BSTNode<T>[] = [this.root];

    while (queue.length > 0) {
      const levelSize = queue.length;
      const currentLevel: T[] = [];

      for (let i = 0; i < levelSize; i++) {
        const node = queue.shift()!;
        currentLevel.push(node.value);

        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
      }

      result.push(currentLevel);
    }

    return result;
  }

  size(): number {
    return this.count;
  }

  isEmpty(): boolean {
    return this.count === 0;
  }

  height(): number {
    return this.getHeight(this.root);
  }

  private getHeight(node: BSTNode<T> | null): number {
    if (!node) return -1;
    return 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
  }

  min(): T | undefined {
    if (!this.root) return undefined;
    return this.findMin(this.root).value;
  }

  max(): T | undefined {
    if (!this.root) return undefined;
    let node = this.root;
    while (node.right) node = node.right;
    return node.value;
  }
}

/**
 * AVL Tree - Self-balancing BST
 * Time Complexity: O(log n) for all operations (guaranteed)
 */
class AVLNode<T> {
  height: number = 1;
  constructor(
    public value: T,
    public left: AVLNode<T> | null = null,
    public right: AVLNode<T> | null = null
  ) {}
}

export class AVLTree<T> {
  private root: AVLNode<T> | null = null;
  private compareFn: (a: T, b: T) => number;
  private count: number = 0;

  constructor(compareFn?: (a: T, b: T) => number) {
    this.compareFn =
      compareFn || ((a: any, b: any) => (a < b ? -1 : a > b ? 1 : 0));
  }

  insert(value: T): void {
    this.root = this.insertNode(this.root, value);
  }

  private insertNode(node: AVLNode<T> | null, value: T): AVLNode<T> {
    if (!node) {
      this.count++;
      return new AVLNode(value);
    }

    const cmp = this.compareFn(value, node.value);
    if (cmp < 0) {
      node.left = this.insertNode(node.left, value);
    } else if (cmp > 0) {
      node.right = this.insertNode(node.right, value);
    } else {
      return node; // Duplicate values not allowed
    }

    this.updateHeight(node);
    return this.balance(node);
  }

  delete(value: T): boolean {
    const initialCount = this.count;
    this.root = this.deleteNode(this.root, value);
    return this.count < initialCount;
  }

  private deleteNode(node: AVLNode<T> | null, value: T): AVLNode<T> | null {
    if (!node) return null;

    const cmp = this.compareFn(value, node.value);

    if (cmp < 0) {
      node.left = this.deleteNode(node.left, value);
    } else if (cmp > 0) {
      node.right = this.deleteNode(node.right, value);
    } else {
      this.count--;

      if (!node.left) return node.right;
      if (!node.right) return node.left;

      const minRight = this.findMin(node.right);
      node.value = minRight.value;
      node.right = this.deleteNode(node.right, minRight.value);
      this.count++;
    }

    this.updateHeight(node);
    return this.balance(node);
  }

  private findMin(node: AVLNode<T>): AVLNode<T> {
    while (node.left) node = node.left;
    return node;
  }

  private updateHeight(node: AVLNode<T>): void {
    node.height =
      1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
  }

  private getHeight(node: AVLNode<T> | null): number {
    return node ? node.height : 0;
  }

  private getBalance(node: AVLNode<T> | null): number {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
  }

  private balance(node: AVLNode<T>): AVLNode<T> {
    const balance = this.getBalance(node);

    // Left heavy
    if (balance > 1) {
      if (this.getBalance(node.left) < 0) {
        node.left = this.rotateLeft(node.left!);
      }
      return this.rotateRight(node);
    }

    // Right heavy
    if (balance < -1) {
      if (this.getBalance(node.right) > 0) {
        node.right = this.rotateRight(node.right!);
      }
      return this.rotateLeft(node);
    }

    return node;
  }

  private rotateRight(y: AVLNode<T>): AVLNode<T> {
    const x = y.left!;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    this.updateHeight(y);
    this.updateHeight(x);

    return x;
  }

  private rotateLeft(x: AVLNode<T>): AVLNode<T> {
    const y = x.right!;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    this.updateHeight(x);
    this.updateHeight(y);

    return y;
  }

  search(value: T): boolean {
    return this.searchNode(this.root, value) !== null;
  }

  private searchNode(node: AVLNode<T> | null, value: T): AVLNode<T> | null {
    if (!node) return null;

    const cmp = this.compareFn(value, node.value);
    if (cmp === 0) return node;
    if (cmp < 0) return this.searchNode(node.left, value);
    return this.searchNode(node.right, value);
  }

  inorder(): T[] {
    const result: T[] = [];
    this.inorderTraversal(this.root, result);
    return result;
  }

  private inorderTraversal(node: AVLNode<T> | null, result: T[]): void {
    if (!node) return;
    this.inorderTraversal(node.left, result);
    result.push(node.value);
    this.inorderTraversal(node.right, result);
  }

  size(): number {
    return this.count;
  }

  isEmpty(): boolean {
    return this.count === 0;
  }

  height(): number {
    return this.getHeight(this.root);
  }
}

// ============================================================================
// HEAP DATA STRUCTURES
// ============================================================================

/**
 * Min Heap
 * Time Complexity: O(log n) for insert/extract, O(1) for peek
 */
export class MinHeap<T> {
  private heap: T[] = [];
  private compareFn: (a: T, b: T) => number;

  constructor(compareFn?: (a: T, b: T) => number) {
    this.compareFn =
      compareFn || ((a: any, b: any) => (a < b ? -1 : a > b ? 1 : 0));
  }

  insert(value: T): void {
    this.heap.push(value);
    this.heapifyUp(this.heap.length - 1);
  }

  extractMin(): T | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.heapifyDown(0);
    return min;
  }

  peek(): T | undefined {
    return this.heap[0];
  }

  size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private heapifyUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.compareFn(this.heap[index], this.heap[parentIndex]) >= 0) break;

      [this.heap[index], this.heap[parentIndex]] = [
        this.heap[parentIndex],
        this.heap[index],
      ];
      index = parentIndex;
    }
  }

  private heapifyDown(index: number): void {
    while (true) {
      let minIndex = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (
        leftChild < this.heap.length &&
        this.compareFn(this.heap[leftChild], this.heap[minIndex]) < 0
      ) {
        minIndex = leftChild;
      }

      if (
        rightChild < this.heap.length &&
        this.compareFn(this.heap[rightChild], this.heap[minIndex]) < 0
      ) {
        minIndex = rightChild;
      }

      if (minIndex === index) break;

      [this.heap[index], this.heap[minIndex]] = [
        this.heap[minIndex],
        this.heap[index],
      ];
      index = minIndex;
    }
  }

  toArray(): T[] {
    return [...this.heap];
  }
}

/**
 * Max Heap
 * Time Complexity: O(log n) for insert/extract, O(1) for peek
 */
export class MaxHeap<T> {
  private heap: T[] = [];
  private compareFn: (a: T, b: T) => number;

  constructor(compareFn?: (a: T, b: T) => number) {
    this.compareFn =
      compareFn || ((a: any, b: any) => (a < b ? -1 : a > b ? 1 : 0));
  }

  insert(value: T): void {
    this.heap.push(value);
    this.heapifyUp(this.heap.length - 1);
  }

  extractMax(): T | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();

    const max = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.heapifyDown(0);
    return max;
  }

  peek(): T | undefined {
    return this.heap[0];
  }

  size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private heapifyUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.compareFn(this.heap[index], this.heap[parentIndex]) <= 0) break;

      [this.heap[index], this.heap[parentIndex]] = [
        this.heap[parentIndex],
        this.heap[index],
      ];
      index = parentIndex;
    }
  }

  private heapifyDown(index: number): void {
    while (true) {
      let maxIndex = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (
        leftChild < this.heap.length &&
        this.compareFn(this.heap[leftChild], this.heap[maxIndex]) > 0
      ) {
        maxIndex = leftChild;
      }

      if (
        rightChild < this.heap.length &&
        this.compareFn(this.heap[rightChild], this.heap[maxIndex]) > 0
      ) {
        maxIndex = rightChild;
      }

      if (maxIndex === index) break;

      [this.heap[index], this.heap[maxIndex]] = [
        this.heap[maxIndex],
        this.heap[index],
      ];
      index = maxIndex;
    }
  }

  toArray(): T[] {
    return [...this.heap];
  }
}

// ============================================================================
// GRAPH DATA STRUCTURES
// ============================================================================

/**
 * Graph - Adjacency List representation
 * Supports both directed and undirected graphs
 */
export class Graph<T> {
  private adjacencyList: Map<T, Set<T>> = new Map();
  private weights: Map<string, number> = new Map();
  private isDirected: boolean;

  constructor(isDirected: boolean = false) {
    this.isDirected = isDirected;
  }

  addVertex(vertex: T): void {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, new Set());
    }
  }

  addEdge(from: T, to: T, weight: number = 1): void {
    this.addVertex(from);
    this.addVertex(to);

    this.adjacencyList.get(from)!.add(to);
    this.weights.set(`${from}-${to}`, weight);

    if (!this.isDirected) {
      this.adjacencyList.get(to)!.add(from);
      this.weights.set(`${to}-${from}`, weight);
    }
  }

  removeEdge(from: T, to: T): void {
    this.adjacencyList.get(from)?.delete(to);
    this.weights.delete(`${from}-${to}`);

    if (!this.isDirected) {
      this.adjacencyList.get(to)?.delete(from);
      this.weights.delete(`${to}-${from}`);
    }
  }

  removeVertex(vertex: T): void {
    this.adjacencyList.get(vertex)?.forEach((neighbor) => {
      this.removeEdge(vertex, neighbor);
    });
    this.adjacencyList.delete(vertex);
  }

  getNeighbors(vertex: T): T[] {
    return Array.from(this.adjacencyList.get(vertex) || []);
  }

  getWeight(from: T, to: T): number | undefined {
    return this.weights.get(`${from}-${to}`);
  }

  hasVertex(vertex: T): boolean {
    return this.adjacencyList.has(vertex);
  }

  hasEdge(from: T, to: T): boolean {
    return this.adjacencyList.get(from)?.has(to) || false;
  }

  getVertices(): T[] {
    return Array.from(this.adjacencyList.keys());
  }

  getEdgeCount(): number {
    let count = 0;
    for (const neighbors of this.adjacencyList.values()) {
      count += neighbors.size;
    }
    return this.isDirected ? count : count / 2;
  }

  getVertexCount(): number {
    return this.adjacencyList.size;
  }

  // Breadth-First Search
  bfs(start: T): T[] {
    if (!this.hasVertex(start)) return [];

    const visited = new Set<T>();
    const queue: T[] = [start];
    const result: T[] = [];

    visited.add(start);

    while (queue.length > 0) {
      const vertex = queue.shift()!;
      result.push(vertex);

      for (const neighbor of this.adjacencyList.get(vertex)!) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    return result;
  }

  // Depth-First Search
  dfs(start: T): T[] {
    if (!this.hasVertex(start)) return [];

    const visited = new Set<T>();
    const result: T[] = [];

    this.dfsHelper(start, visited, result);
    return result;
  }

  private dfsHelper(vertex: T, visited: Set<T>, result: T[]): void {
    visited.add(vertex);
    result.push(vertex);

    for (const neighbor of this.adjacencyList.get(vertex)!) {
      if (!visited.has(neighbor)) {
        this.dfsHelper(neighbor, visited, result);
      }
    }
  }

  // Detect cycle in directed graph
  hasCycle(): boolean {
    const visited = new Set<T>();
    const recursionStack = new Set<T>();

    for (const vertex of this.adjacencyList.keys()) {
      if (!visited.has(vertex)) {
        if (this.hasCycleHelper(vertex, visited, recursionStack)) {
          return true;
        }
      }
    }

    return false;
  }

  private hasCycleHelper(
    vertex: T,
    visited: Set<T>,
    recursionStack: Set<T>
  ): boolean {
    visited.add(vertex);
    recursionStack.add(vertex);

    for (const neighbor of this.adjacencyList.get(vertex)!) {
      if (!visited.has(neighbor)) {
        if (this.hasCycleHelper(neighbor, visited, recursionStack)) {
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }

    recursionStack.delete(vertex);
    return false;
  }

  // Topological Sort (for DAG only)
  topologicalSort(): T[] | null {
    if (this.hasCycle()) return null;

    const visited = new Set<T>();
    const stack: T[] = [];

    for (const vertex of this.adjacencyList.keys()) {
      if (!visited.has(vertex)) {
        this.topologicalSortHelper(vertex, visited, stack);
      }
    }

    return stack.reverse();
  }

  private topologicalSortHelper(vertex: T, visited: Set<T>, stack: T[]): void {
    visited.add(vertex);

    for (const neighbor of this.adjacencyList.get(vertex)!) {
      if (!visited.has(neighbor)) {
        this.topologicalSortHelper(neighbor, visited, stack);
      }
    }

    stack.push(vertex);
  }

  // Dijkstra's Shortest Path
  dijkstra(start: T, end: T): { path: T[]; distance: number } | null {
    if (!this.hasVertex(start) || !this.hasVertex(end)) return null;

    const distances = new Map<T, number>();
    const previous = new Map<T, T | null>();
    const pq = new MinHeap<{ vertex: T; distance: number }>(
      (a, b) => a.distance - b.distance
    );

    for (const vertex of this.adjacencyList.keys()) {
      distances.set(vertex, vertex === start ? 0 : Infinity);
      previous.set(vertex, null);
    }

    pq.insert({ vertex: start, distance: 0 });

    while (!pq.isEmpty()) {
      const { vertex: current } = pq.extractMin()!;

      if (current === end) break;

      for (const neighbor of this.adjacencyList.get(current)!) {
        const weight = this.getWeight(current, neighbor) || 1;
        const alt = distances.get(current)! + weight;

        if (alt < distances.get(neighbor)!) {
          distances.set(neighbor, alt);
          previous.set(neighbor, current);
          pq.insert({ vertex: neighbor, distance: alt });
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
      distance: distances.get(end)!,
    };
  }
}

// ============================================================================
// HASH TABLE / SET
// ============================================================================

/**
 * Hash Set - Custom implementation
 * Time Complexity: O(1) average for add/remove/contains
 */
export class HashSet<T> {
  private buckets: Map<number, T[]>;
  private count: number = 0;
  private bucketCount: number = 16;

  constructor() {
    this.buckets = new Map();
  }

  add(value: T): boolean {
    const hash = this.hash(value);
    if (!this.buckets.has(hash)) {
      this.buckets.set(hash, []);
    }

    const bucket = this.buckets.get(hash)!;
    if (!bucket.includes(value)) {
      bucket.push(value);
      this.count++;
      return true;
    }
    return false;
  }

  remove(value: T): boolean {
    const hash = this.hash(value);
    const bucket = this.buckets.get(hash);

    if (!bucket) return false;

    const index = bucket.indexOf(value);
    if (index !== -1) {
      bucket.splice(index, 1);
      this.count--;
      return true;
    }
    return false;
  }

  has(value: T): boolean {
    const hash = this.hash(value);
    const bucket = this.buckets.get(hash);
    return bucket ? bucket.includes(value) : false;
  }

  size(): number {
    return this.count;
  }

  clear(): void {
    this.buckets.clear();
    this.count = 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    for (const bucket of this.buckets.values()) {
      result.push(...bucket);
    }
    return result;
  }

  private hash(value: T): number {
    const str = String(value);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash % this.bucketCount);
  }
}

// ============================================================================
// DISJOINT SET (UNION-FIND)
// ============================================================================

/**
 * Disjoint Set / Union-Find
 * Time Complexity: O(α(n)) - nearly constant (inverse Ackermann)
 */
export class DisjointSet<T> {
  private parent: Map<T, T> = new Map();
  private rank: Map<T, number> = new Map();

  makeSet(value: T): void {
    if (!this.parent.has(value)) {
      this.parent.set(value, value);
      this.rank.set(value, 0);
    }
  }

  find(value: T): T {
    if (!this.parent.has(value)) {
      this.makeSet(value);
    }

    if (this.parent.get(value) !== value) {
      this.parent.set(value, this.find(this.parent.get(value)!));
    }

    return this.parent.get(value)!;
  }

  union(a: T, b: T): boolean {
    const rootA = this.find(a);
    const rootB = this.find(b);

    if (rootA === rootB) return false;

    const rankA = this.rank.get(rootA)!;
    const rankB = this.rank.get(rootB)!;

    if (rankA < rankB) {
      this.parent.set(rootA, rootB);
    } else if (rankA > rankB) {
      this.parent.set(rootB, rootA);
    } else {
      this.parent.set(rootB, rootA);
      this.rank.set(rootA, rankA + 1);
    }

    return true;
  }

  connected(a: T, b: T): boolean {
    return this.find(a) === this.find(b);
  }
}

// ============================================================================
// BLOOM FILTER
// ============================================================================

/**
 * Bloom Filter - Probabilistic data structure
 * Space-efficient, allows false positives but no false negatives
 */
export class BloomFilter {
  private bits: boolean[];
  private hashFunctions: ((value: string) => number)[];

  constructor(size: number = 1000, numHashes: number = 3) {
    this.bits = new Array(size).fill(false);
    this.hashFunctions = this.createHashFunctions(numHashes, size);
  }

  add(value: string): void {
    for (const hash of this.hashFunctions) {
      this.bits[hash(value)] = true;
    }
  }

  mightContain(value: string): boolean {
    for (const hash of this.hashFunctions) {
      if (!this.bits[hash(value)]) return false;
    }
    return true;
  }

  private createHashFunctions(
    count: number,
    size: number
  ): ((value: string) => number)[] {
    const functions: ((value: string) => number)[] = [];

    for (let i = 0; i < count; i++) {
      functions.push((value: string) => {
        let hash = 0;
        const seed = i + 1;
        for (let j = 0; j < value.length; j++) {
          hash = (hash << 5) - hash + value.charCodeAt(j) * seed;
          hash = hash & hash;
        }
        return Math.abs(hash % size);
      });
    }

    return functions;
  }
}

// ============================================================================
// SEGMENT TREE
// ============================================================================

/**
 * Segment Tree - For range queries
 * Time Complexity: O(log n) for query/update, O(n) for build
 */
export class SegmentTree {
  private tree: number[];
  private n: number;

  constructor(arr: number[]) {
    this.n = arr.length;
    this.tree = new Array(4 * this.n);
    this.build(arr, 0, 0, this.n - 1);
  }

  private build(arr: number[], node: number, start: number, end: number): void {
    if (start === end) {
      this.tree[node] = arr[start];
      return;
    }

    const mid = Math.floor((start + end) / 2);
    const leftChild = 2 * node + 1;
    const rightChild = 2 * node + 2;

    this.build(arr, leftChild, start, mid);
    this.build(arr, rightChild, mid + 1, end);

    this.tree[node] = this.tree[leftChild] + this.tree[rightChild];
  }

  query(left: number, right: number): number {
    return this.queryHelper(0, 0, this.n - 1, left, right);
  }

  private queryHelper(
    node: number,
    start: number,
    end: number,
    left: number,
    right: number
  ): number {
    if (right < start || left > end) return 0;
    if (left <= start && end <= right) return this.tree[node];

    const mid = Math.floor((start + end) / 2);
    const leftSum = this.queryHelper(2 * node + 1, start, mid, left, right);
    const rightSum = this.queryHelper(2 * node + 2, mid + 1, end, left, right);

    return leftSum + rightSum;
  }

  update(index: number, value: number): void {
    this.updateHelper(0, 0, this.n - 1, index, value);
  }

  private updateHelper(
    node: number,
    start: number,
    end: number,
    index: number,
    value: number
  ): void {
    if (start === end) {
      this.tree[node] = value;
      return;
    }

    const mid = Math.floor((start + end) / 2);
    const leftChild = 2 * node + 1;
    const rightChild = 2 * node + 2;

    if (index <= mid) {
      this.updateHelper(leftChild, start, mid, index, value);
    } else {
      this.updateHelper(rightChild, mid + 1, end, index, value);
    }

    this.tree[node] = this.tree[leftChild] + this.tree[rightChild];
  }
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
  // Linear
  Stack,
  Queue,
  Deque,
  CircularBuffer,
  LinkedList,
  DoublyLinkedList,

  // Trees
  BinarySearchTree,
  AVLTree,

  // Heaps
  MinHeap,
  MaxHeap,

  // Graphs
  Graph,

  // Hash-based
  HashSet,

  // Advanced
  DisjointSet,
  BloomFilter,
  SegmentTree,
};
