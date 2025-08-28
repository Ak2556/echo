'use client';

/**
 * COMPREHENSIVE ALGORITHMS LIBRARY
 * Enterprise-grade implementations with optimal time complexity
 */

// ============================================================================
// SORTING ALGORITHMS
// ============================================================================

export class SortingAlgorithms {
  /**
   * Quick Sort - O(n log n) average, O(n²) worst
   * In-place, not stable
   */
  static quickSort<T>(arr: T[], compareFn?: (a: T, b: T) => number): T[] {
    const compare = compareFn || ((a: any, b: any) => (a < b ? -1 : a > b ? 1 : 0));
    const result = [...arr];
    this.quickSortHelper(result, 0, result.length - 1, compare);
    return result;
  }

  private static quickSortHelper<T>(
    arr: T[],
    low: number,
    high: number,
    compare: (a: T, b: T) => number
  ): void {
    if (low < high) {
      const pi = this.partition(arr, low, high, compare);
      this.quickSortHelper(arr, low, pi - 1, compare);
      this.quickSortHelper(arr, pi + 1, high, compare);
    }
  }

  private static partition<T>(
    arr: T[],
    low: number,
    high: number,
    compare: (a: T, b: T) => number
  ): number {
    const pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      if (compare(arr[j], pivot) <= 0) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
  }

  /**
   * Merge Sort - O(n log n) guaranteed
   * Stable, requires O(n) extra space
   */
  static mergeSort<T>(arr: T[], compareFn?: (a: T, b: T) => number): T[] {
    const compare = compareFn || ((a: any, b: any) => (a < b ? -1 : a > b ? 1 : 0));

    if (arr.length <= 1) return [...arr];

    const mid = Math.floor(arr.length / 2);
    const left = this.mergeSort(arr.slice(0, mid), compare);
    const right = this.mergeSort(arr.slice(mid), compare);

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

  /**
   * Heap Sort - O(n log n) guaranteed
   * In-place, not stable
   */
  static heapSort<T>(arr: T[], compareFn?: (a: T, b: T) => number): T[] {
    const compare = compareFn || ((a: any, b: any) => (a < b ? -1 : a > b ? 1 : 0));
    const result = [...arr];
    const n = result.length;

    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      this.heapify(result, n, i, compare);
    }

    // Extract elements from heap
    for (let i = n - 1; i > 0; i--) {
      [result[0], result[i]] = [result[i], result[0]];
      this.heapify(result, i, 0, compare);
    }

    return result;
  }

  private static heapify<T>(
    arr: T[],
    n: number,
    i: number,
    compare: (a: T, b: T) => number
  ): void {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < n && compare(arr[left], arr[largest]) > 0) {
      largest = left;
    }

    if (right < n && compare(arr[right], arr[largest]) > 0) {
      largest = right;
    }

    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      this.heapify(arr, n, largest, compare);
    }
  }

  /**
   * Insertion Sort - O(n²)
   * Efficient for small arrays, stable
   */
  static insertionSort<T>(arr: T[], compareFn?: (a: T, b: T) => number): T[] {
    const compare = compareFn || ((a: any, b: any) => (a < b ? -1 : a > b ? 1 : 0));
    const result = [...arr];

    for (let i = 1; i < result.length; i++) {
      const key = result[i];
      let j = i - 1;

      while (j >= 0 && compare(result[j], key) > 0) {
        result[j + 1] = result[j];
        j--;
      }

      result[j + 1] = key;
    }

    return result;
  }

  /**
   * Counting Sort - O(n + k) where k is range
   * Only for integers, stable
   */
  static countingSort(arr: number[]): number[] {
    if (arr.length === 0) return [];

    const max = Math.max(...arr);
    const min = Math.min(...arr);
    const range = max - min + 1;
    const count = new Array(range).fill(0);
    const output = new Array(arr.length);

    // Store count of each element
    for (const num of arr) {
      count[num - min]++;
    }

    // Change count[i] to contain actual position
    for (let i = 1; i < count.length; i++) {
      count[i] += count[i - 1];
    }

    // Build output array
    for (let i = arr.length - 1; i >= 0; i--) {
      output[count[arr[i] - min] - 1] = arr[i];
      count[arr[i] - min]--;
    }

    return output;
  }

  /**
   * Radix Sort - O(d * n) where d is number of digits
   * Only for integers, stable
   */
  static radixSort(arr: number[]): number[] {
    if (arr.length === 0) return [];

    const max = Math.max(...arr.map(Math.abs));
    let exp = 1;
    let result = [...arr];

    while (Math.floor(max / exp) > 0) {
      result = this.countingSortByDigit(result, exp);
      exp *= 10;
    }

    return result;
  }

  private static countingSortByDigit(arr: number[], exp: number): number[] {
    const output = new Array(arr.length);
    const count = new Array(10).fill(0);

    for (const num of arr) {
      const digit = Math.floor(Math.abs(num) / exp) % 10;
      count[digit]++;
    }

    for (let i = 1; i < 10; i++) {
      count[i] += count[i - 1];
    }

    for (let i = arr.length - 1; i >= 0; i--) {
      const digit = Math.floor(Math.abs(arr[i]) / exp) % 10;
      output[count[digit] - 1] = arr[i];
      count[digit]--;
    }

    return output;
  }
}

// ============================================================================
// SEARCHING ALGORITHMS
// ============================================================================

export class SearchingAlgorithms {
  /**
   * Binary Search - O(log n)
   * Array must be sorted
   */
  static binarySearch<T>(arr: T[], target: T, compareFn?: (a: T, b: T) => number): number {
    const compare = compareFn || ((a: any, b: any) => (a < b ? -1 : a > b ? 1 : 0));
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const cmp = compare(arr[mid], target);

      if (cmp === 0) return mid;
      if (cmp < 0) left = mid + 1;
      else right = mid - 1;
    }

    return -1;
  }

  /**
   * Linear Search - O(n)
   */
  static linearSearch<T>(arr: T[], target: T): number {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === target) return i;
    }
    return -1;
  }

  /**
   * Jump Search - O(√n)
   * Array must be sorted
   */
  static jumpSearch(arr: number[], target: number): number {
    const n = arr.length;
    let step = Math.floor(Math.sqrt(n));
    let prev = 0;

    while (arr[Math.min(step, n) - 1] < target) {
      prev = step;
      step += Math.floor(Math.sqrt(n));
      if (prev >= n) return -1;
    }

    while (arr[prev] < target) {
      prev++;
      if (prev === Math.min(step, n)) return -1;
    }

    return arr[prev] === target ? prev : -1;
  }

  /**
   * Interpolation Search - O(log log n) for uniformly distributed data
   * Array must be sorted
   */
  static interpolationSearch(arr: number[], target: number): number {
    let low = 0;
    let high = arr.length - 1;

    while (low <= high && target >= arr[low] && target <= arr[high]) {
      if (low === high) {
        return arr[low] === target ? low : -1;
      }

      const pos = low + Math.floor(
        ((high - low) / (arr[high] - arr[low])) * (target - arr[low])
      );

      if (arr[pos] === target) return pos;
      if (arr[pos] < target) low = pos + 1;
      else high = pos - 1;
    }

    return -1;
  }

  /**
   * Exponential Search - O(log n)
   * Array must be sorted
   */
  static exponentialSearch(arr: number[], target: number): number {
    if (arr[0] === target) return 0;

    let i = 1;
    while (i < arr.length && arr[i] <= target) {
      i *= 2;
    }

    return this.binarySearchRange(arr, target, i / 2, Math.min(i, arr.length - 1));
  }

  private static binarySearchRange(arr: number[], target: number, left: number, right: number): number {
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      if (arr[mid] === target) return mid;
      if (arr[mid] < target) left = mid + 1;
      else right = mid - 1;
    }

    return -1;
  }
}

// ============================================================================
// STRING ALGORITHMS
// ============================================================================

export class StringAlgorithms {
  /**
   * KMP Pattern Matching - O(n + m)
   */
  static kmpSearch(text: string, pattern: string): number[] {
    const positions: number[] = [];
    if (pattern.length === 0) return positions;

    const lps = this.computeLPS(pattern);
    let i = 0; // text index
    let j = 0; // pattern index

    while (i < text.length) {
      if (pattern[j] === text[i]) {
        i++;
        j++;
      }

      if (j === pattern.length) {
        positions.push(i - j);
        j = lps[j - 1];
      } else if (i < text.length && pattern[j] !== text[i]) {
        if (j !== 0) {
          j = lps[j - 1];
        } else {
          i++;
        }
      }
    }

    return positions;
  }

  private static computeLPS(pattern: string): number[] {
    const lps = new Array(pattern.length).fill(0);
    let len = 0;
    let i = 1;

    while (i < pattern.length) {
      if (pattern[i] === pattern[len]) {
        len++;
        lps[i] = len;
        i++;
      } else {
        if (len !== 0) {
          len = lps[len - 1];
        } else {
          lps[i] = 0;
          i++;
        }
      }
    }

    return lps;
  }

  /**
   * Rabin-Karp Pattern Matching - O(n + m) average
   */
  static rabinKarpSearch(text: string, pattern: string): number[] {
    const positions: number[] = [];
    const d = 256; // Number of characters in alphabet
    const q = 101; // A prime number
    const m = pattern.length;
    const n = text.length;

    if (m > n) return positions;

    let p = 0; // Hash value for pattern
    let t = 0; // Hash value for text
    let h = 1;

    // Calculate h = d^(m-1) % q
    for (let i = 0; i < m - 1; i++) {
      h = (h * d) % q;
    }

    // Calculate initial hash values
    for (let i = 0; i < m; i++) {
      p = (d * p + pattern.charCodeAt(i)) % q;
      t = (d * t + text.charCodeAt(i)) % q;
    }

    // Slide pattern over text
    for (let i = 0; i <= n - m; i++) {
      if (p === t) {
        // Check characters one by one
        let match = true;
        for (let j = 0; j < m; j++) {
          if (text[i + j] !== pattern[j]) {
            match = false;
            break;
          }
        }
        if (match) positions.push(i);
      }

      // Calculate hash for next window
      if (i < n - m) {
        t = (d * (t - text.charCodeAt(i) * h) + text.charCodeAt(i + m)) % q;
        if (t < 0) t += q;
      }
    }

    return positions;
  }

  /**
   * Longest Common Subsequence - O(m * n)
   */
  static longestCommonSubsequence(str1: string, str2: string): string {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Reconstruct LCS
    let lcs = '';
    let i = m, j = n;

    while (i > 0 && j > 0) {
      if (str1[i - 1] === str2[j - 1]) {
        lcs = str1[i - 1] + lcs;
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }

    return lcs;
  }

  /**
   * Longest Common Substring - O(m * n)
   */
  static longestCommonSubstring(str1: string, str2: string): string {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
    let maxLength = 0;
    let endIndex = 0;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
          if (dp[i][j] > maxLength) {
            maxLength = dp[i][j];
            endIndex = i;
          }
        }
      }
    }

    return str1.substring(endIndex - maxLength, endIndex);
  }

  /**
   * Edit Distance (Levenshtein) - O(m * n)
   */
  static editDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(
            dp[i - 1][j],     // Delete
            dp[i][j - 1],     // Insert
            dp[i - 1][j - 1]  // Replace
          );
        }
      }
    }

    return dp[m][n];
  }

  /**
   * Z Algorithm - O(n)
   * For pattern matching
   */
  static zAlgorithm(text: string, pattern: string): number[] {
    const str = pattern + '$' + text;
    const n = str.length;
    const z = new Array(n).fill(0);
    const positions: number[] = [];

    let left = 0, right = 0;

    for (let i = 1; i < n; i++) {
      if (i > right) {
        left = right = i;
        while (right < n && str[right] === str[right - left]) {
          right++;
        }
        z[i] = right - left;
        right--;
      } else {
        const k = i - left;
        if (z[k] < right - i + 1) {
          z[i] = z[k];
        } else {
          left = i;
          while (right < n && str[right] === str[right - left]) {
            right++;
          }
          z[i] = right - left;
          right--;
        }
      }

      if (z[i] === pattern.length) {
        positions.push(i - pattern.length - 1);
      }
    }

    return positions;
  }
}

// ============================================================================
// DYNAMIC PROGRAMMING
// ============================================================================

export class DynamicProgramming {
  /**
   * Fibonacci - O(n) with memoization
   */
  static fibonacci(n: number): number {
    if (n <= 1) return n;

    const dp = new Array(n + 1);
    dp[0] = 0;
    dp[1] = 1;

    for (let i = 2; i <= n; i++) {
      dp[i] = dp[i - 1] + dp[i - 2];
    }

    return dp[n];
  }

  /**
   * 0/1 Knapsack - O(n * W)
   */
  static knapsack(weights: number[], values: number[], capacity: number): number {
    const n = weights.length;
    const dp: number[][] = Array(n + 1).fill(0).map(() => Array(capacity + 1).fill(0));

    for (let i = 1; i <= n; i++) {
      for (let w = 1; w <= capacity; w++) {
        if (weights[i - 1] <= w) {
          dp[i][w] = Math.max(
            values[i - 1] + dp[i - 1][w - weights[i - 1]],
            dp[i - 1][w]
          );
        } else {
          dp[i][w] = dp[i - 1][w];
        }
      }
    }

    return dp[n][capacity];
  }

  /**
   * Coin Change - O(n * amount)
   */
  static coinChange(coins: number[], amount: number): number {
    const dp = new Array(amount + 1).fill(Infinity);
    dp[0] = 0;

    for (let i = 1; i <= amount; i++) {
      for (const coin of coins) {
        if (coin <= i) {
          dp[i] = Math.min(dp[i], dp[i - coin] + 1);
        }
      }
    }

    return dp[amount] === Infinity ? -1 : dp[amount];
  }

  /**
   * Longest Increasing Subsequence - O(n log n)
   */
  static longestIncreasingSubsequence(arr: number[]): number {
    const tails: number[] = [];

    for (const num of arr) {
      let left = 0;
      let right = tails.length;

      while (left < right) {
        const mid = Math.floor((left + right) / 2);
        if (tails[mid] < num) {
          left = mid + 1;
        } else {
          right = mid;
        }
      }

      if (left === tails.length) {
        tails.push(num);
      } else {
        tails[left] = num;
      }
    }

    return tails.length;
  }

  /**
   * Matrix Chain Multiplication - O(n³)
   */
  static matrixChainMultiplication(dimensions: number[]): number {
    const n = dimensions.length - 1;
    const dp: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

    for (let len = 2; len <= n; len++) {
      for (let i = 0; i < n - len + 1; i++) {
        const j = i + len - 1;
        dp[i][j] = Infinity;

        for (let k = i; k < j; k++) {
          const cost = dp[i][k] + dp[k + 1][j] +
                      dimensions[i] * dimensions[k + 1] * dimensions[j + 1];
          dp[i][j] = Math.min(dp[i][j], cost);
        }
      }
    }

    return dp[0][n - 1];
  }

  /**
   * Rod Cutting Problem - O(n²)
   */
  static rodCutting(prices: number[], n: number): number {
    const dp = new Array(n + 1).fill(0);

    for (let i = 1; i <= n; i++) {
      let maxVal = -Infinity;
      for (let j = 0; j < i; j++) {
        maxVal = Math.max(maxVal, prices[j] + dp[i - j - 1]);
      }
      dp[i] = maxVal;
    }

    return dp[n];
  }
}

// ============================================================================
// MATHEMATICAL ALGORITHMS
// ============================================================================

export class MathAlgorithms {
  /**
   * GCD - Euclidean Algorithm - O(log min(a,b))
   */
  static gcd(a: number, b: number): number {
    while (b !== 0) {
      [a, b] = [b, a % b];
    }
    return a;
  }

  /**
   * LCM - O(log min(a,b))
   */
  static lcm(a: number, b: number): number {
    return (a * b) / this.gcd(a, b);
  }

  /**
   * Prime Number Check - O(√n)
   */
  static isPrime(n: number): boolean {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;

    for (let i = 5; i * i <= n; i += 6) {
      if (n % i === 0 || n % (i + 2) === 0) return false;
    }

    return true;
  }

  /**
   * Sieve of Eratosthenes - O(n log log n)
   */
  static sieveOfEratosthenes(n: number): number[] {
    const isPrime = new Array(n + 1).fill(true);
    isPrime[0] = isPrime[1] = false;

    for (let i = 2; i * i <= n; i++) {
      if (isPrime[i]) {
        for (let j = i * i; j <= n; j += i) {
          isPrime[j] = false;
        }
      }
    }

    return isPrime.map((val, idx) => val ? idx : -1).filter(x => x !== -1);
  }

  /**
   * Fast Exponentiation - O(log n)
   */
  static power(base: number, exp: number, mod?: number): number {
    if (exp === 0) return 1;

    let result = 1;
    base = mod ? base % mod : base;

    while (exp > 0) {
      if (exp % 2 === 1) {
        result = mod ? (result * base) % mod : result * base;
      }
      exp = Math.floor(exp / 2);
      base = mod ? (base * base) % mod : base * base;
    }

    return result;
  }

  /**
   * Factorial - O(n)
   */
  static factorial(n: number): number {
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  /**
   * Combinations (nCr) - O(min(r, n-r))
   */
  static combinations(n: number, r: number): number {
    if (r > n) return 0;
    if (r === 0 || r === n) return 1;

    r = Math.min(r, n - r); // Optimization

    let result = 1;
    for (let i = 0; i < r; i++) {
      result = result * (n - i) / (i + 1);
    }

    return Math.round(result);
  }

  /**
   * Permutations (nPr) - O(1)
   */
  static permutations(n: number, r: number): number {
    if (r > n) return 0;
    let result = 1;
    for (let i = 0; i < r; i++) {
      result *= (n - i);
    }
    return result;
  }
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
  Sorting: SortingAlgorithms,
  Searching: SearchingAlgorithms,
  String: StringAlgorithms,
  DP: DynamicProgramming,
  Math: MathAlgorithms
};
