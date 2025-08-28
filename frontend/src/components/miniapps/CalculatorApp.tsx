'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef, memo } from 'react';
import { useThemeColors } from '@/hooks/useThemeColors';

interface CalculatorAppProps {
  isVisible: boolean;
  onClose: () => void;
}

interface HistoryEntry {
  expression: string;
  result: string;
  timestamp: number;
  id: string;
}

// LRU Cache for memoization - O(1) time complexity
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize = 50) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Optimized factorial with iterative approach
const factorialCache = new LRUCache<number, number>(100);

type UnitType = 'length' | 'weight' | 'temperature';
type LengthUnit = 'meter' | 'feet' | 'inch' | 'cm' | 'mm' | 'km' | 'yard' | 'mile';
type WeightUnit = 'kg' | 'lb' | 'g' | 'oz' | 'ton' | 'stone';
type TempUnit = 'celsius' | 'fahrenheit' | 'kelvin';
type Unit = LengthUnit | WeightUnit | TempUnit;

const factorial = (n: number): number => {
  if (!Number.isInteger(n) || n < 0) return NaN;
  if (n > 170) return Infinity;
  if (n <= 1) return 1;

  const cached = factorialCache.get(n);
  if (cached !== undefined) return cached;

  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }

  factorialCache.set(n, result);
  return result;
};

const formatDisplay = (val: number): string => {
  if (!isFinite(val)) return 'Error';
  if (isNaN(val)) return 'Error';

  if (Math.abs(val) > 1e12) return val.toExponential(6);
  if (Math.abs(val) < 1e-9 && val !== 0) return val.toExponential(6);

  const str = val.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 10,
    useGrouping: false
  });

  return str.replace(/\.?0+$/, '');
};

const UNIT_CONVERSIONS = {
  length: {
    meter: 1, feet: 3.28084, inch: 39.3701, cm: 100, mm: 1000, km: 0.001, yard: 1.09361, mile: 0.000621371
  },
  weight: {
    kg: 1, lb: 2.20462, g: 1000, oz: 35.274, ton: 0.001, stone: 0.157473
  },
  temperature: {
    celsius: (c: number) => c,
    fahrenheit: (c: number) => (c * 9 / 5) + 32,
    kelvin: (c: number) => c + 273.15
  }
} as const;

// Generate AI calculation insights
const generateCalculationInsights = (history: HistoryEntry[]): { text: string; tips: string[] } => {
  if (history.length === 0) {
    return { text: 'Start calculating to get insights!', tips: ['Try using scientific functions', 'Use memory functions for complex calculations'] };
  }

  const recentOps = history.slice(0, 10);
  const hasScientific = recentOps.some(h => /sin|cos|tan|log|sqrt/i.test(h.expression));
  const hasLargeNumbers = recentOps.some(h => parseFloat(h.result) > 1000000);

  const tips: string[] = [];
  let text = `You've performed ${history.length} calculations. `;

  if (hasScientific) {
    text += 'Great use of scientific functions! ';
    tips.push('Try using RAD mode for advanced trigonometry');
  } else {
    tips.push('Explore scientific mode for advanced calculations');
  }

  if (hasLargeNumbers) {
    tips.push('Use scientific notation for very large numbers');
  }

  tips.push('Use Ctrl+C to copy results quickly');
  tips.push('Access history to reuse previous calculations');

  return { text, tips: tips.slice(0, 3) };
};

const CalculatorApp = memo(({ isVisible, onClose }: CalculatorAppProps) => {
  const colors = useThemeColors();
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const [memory, setMemory] = useState<number>(0);
  const [mode, setMode] = useState<'basic' | 'scientific' | 'converter' | 'history'>('basic');
  const [shake, setShake] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [expression, setExpression] = useState('');
  const [isDegreeMode, setIsDegreeMode] = useState(true);
  const [copiedResult, setCopiedResult] = useState(false);

  // Converter states
  const [converterType, setConverterType] = useState<UnitType>('length');
  const [fromUnit, setFromUnit] = useState<Unit>('meter');
  const [toUnit, setToUnit] = useState<Unit>('feet');
  const [converterValue, setConverterValue] = useState('1');

  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shakeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hasError = display === 'Error';

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('calc-history-v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        setHistory(parsed.slice(0, 100));
      }
    } catch (e) {}
  }, []);

  // Save history with debouncing
  useEffect(() => {
    if (history.length === 0) return;

    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
    }

    historyTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem('calc-history-v2', JSON.stringify(history.slice(0, 100)));
      } catch (e) {}
    }, 500);

    return () => {
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current);
      }
    };
  }, [history]);

  useEffect(() => {
    return () => {
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
      if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);
    };
  }, []);

  const calculate = useCallback((firstOperand: number, secondOperand: number, op: string) => {
    switch (op) {
      case '+': return firstOperand + secondOperand;
      case '-': return firstOperand - secondOperand;
      case '×': case '*': return firstOperand * secondOperand;
      case '÷': case '/': return secondOperand === 0 ? Infinity : firstOperand / secondOperand;
      case '^': return Math.pow(firstOperand, secondOperand);
      case 'mod': case '%': return firstOperand % secondOperand;
      case '=': return secondOperand;
      default: return secondOperand;
    }
  }, []);

  const evaluateExpression = useCallback((exprRaw: string): number => {
    if (!exprRaw) return 0;
    let expr = exprRaw.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
    expr = expr.replace(/\s+/g, '');

    type Token = { type: 'num' | 'op' | 'func' | 'paren' | 'var'; value: string };
    const tokens: Token[] = [];

    for (let i = 0; i < expr.length;) {
      const ch = expr[i];
      if (/[0-9.]/.test(ch) || (ch === '-' && (i === 0 || /[+\-*/^%(]/.test(expr[i - 1])) && /[0-9.]/.test(expr[i + 1]))) {
        let j = i + (ch === '-' ? 1 : 0);
        if (ch === '-') i++;
        while (j < expr.length && /[0-9.eE+-]/.test(expr[j])) j++;
        const n = expr.slice(i, j);
        tokens.push({ type: 'num', value: n });
        i = j;
        continue;
      }
      if (/[a-zA-Z]/.test(ch)) {
        let j = i;
        while (j < expr.length && /[a-zA-Z0-9_]/.test(expr[j])) j++;
        const id = expr.slice(i, j);
        if (id.toLowerCase() === 'ans') {
          tokens.push({ type: 'var', value: 'Ans' });
        } else if (id.toLowerCase() === 'mod') {
          tokens.push({ type: 'op', value: 'mod' });
        } else {
          tokens.push({ type: 'func', value: id.toLowerCase() });
        }
        i = j;
        continue;
      }
      if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '^' || ch === '%') {
        tokens.push({ type: 'op', value: ch });
        i++; continue;
      }
      if (ch === '(' || ch === ')') {
        tokens.push({ type: 'paren', value: ch });
        i++; continue;
      }
      if (ch === '!') {
        tokens.push({ type: 'op', value: '!' });
        i++; continue;
      }
      i++;
    }

    const prec: Record<string, number> = {
      '!': 5, 'func': 5, '^': 4, '*': 3, '/': 3, '%': 3, 'mod': 3, '+': 2, '-': 2
    };
    const rightAssoc = new Set(['^']);

    const output: Token[] = [];
    const ops: Token[] = [];

    tokens.forEach((t) => {
      if (t.type === 'num' || t.type === 'var') {
        output.push(t);
      } else if (t.type === 'func') {
        ops.push(t);
      } else if (t.type === 'op') {
        const o1 = t;
        while (ops.length) {
          const o2 = ops[ops.length - 1];
          if (o2.type === 'func' || (o2.type === 'op' && ((prec[o2.value] || 0) > (prec[o1.value] || 0) || ((prec[o2.value] || 0) === (prec[o1.value] || 0) && !rightAssoc.has(o1.value))))) {
            output.push(ops.pop() as Token);
          } else break;
        }
        ops.push(o1);
      } else if (t.type === 'paren') {
        if (t.value === '(') {
          ops.push(t);
        } else {
          while (ops.length && ops[ops.length - 1].value !== '(') {
            output.push(ops.pop() as Token);
          }
          if (ops.length && ops[ops.length - 1].value === '(') ops.pop();
          if (ops.length && ops[ops.length - 1].type === 'func') {
            output.push(ops.pop() as Token);
          }
        }
      }
    });
    while (ops.length) {
      const op = ops.pop() as Token;
      if (op.value === '(' || op.value === ')') throw new Error('Mismatched parentheses');
      output.push(op);
    }

    const stack: number[] = [];
    const getAns = () => {
      const last = history[0];
      if (last) return parseFloat(last.result) || 0;
      return 0;
    };
    const pop1 = () => {
      if (!stack.length) throw new Error('Malformed expression');
      return stack.pop() as number;
    };
    const pop2 = () => {
      const b = pop1(); const a = pop1(); return [a, b];
    };

    for (const tok of output) {
      if (tok.type === 'num') {
        stack.push(parseFloat(tok.value));
      } else if (tok.type === 'var' && tok.value === 'Ans') {
        stack.push(getAns());
      } else if (tok.type === 'func') {
        const fn = tok.value;
        const a = pop1();
        let res = NaN;
        switch (fn) {
          case 'sin': res = isDegreeMode ? Math.sin(a * Math.PI / 180) : Math.sin(a); break;
          case 'cos': res = isDegreeMode ? Math.cos(a * Math.PI / 180) : Math.cos(a); break;
          case 'tan': res = isDegreeMode ? Math.tan(a * Math.PI / 180) : Math.tan(a); break;
          case 'asin': res = isDegreeMode ? Math.asin(a) * 180 / Math.PI : Math.asin(a); break;
          case 'acos': res = isDegreeMode ? Math.acos(a) * 180 / Math.PI : Math.acos(a); break;
          case 'atan': res = isDegreeMode ? Math.atan(a) * 180 / Math.PI : Math.atan(a); break;
          case 'ln': res = a <= 0 ? Infinity : Math.log(a); break;
          case 'log': case 'log10': res = a <= 0 ? Infinity : Math.log10(a); break;
          case 'log2': res = a <= 0 ? Infinity : Math.log2(a); break;
          case 'sqrt': res = a < 0 ? Infinity : Math.sqrt(a); break;
          case 'abs': res = Math.abs(a); break;
          case 'exp': res = Math.exp(a); break;
          case '10^x': res = Math.pow(10, a); break;
          default: res = parseFloat(String(a));
        }
        stack.push(res);
      } else if (tok.type === 'op') {
        if (tok.value === '!') {
          const a = pop1();
          stack.push(factorial(a));
          continue;
        }
        const [a, b] = pop2();
        let out = NaN;
        switch (tok.value) {
          case '+': out = a + b; break;
          case '-': out = a - b; break;
          case '*': out = a * b; break;
          case '/': out = b === 0 ? Infinity : a / b; break;
          case '^': out = Math.pow(a, b); break;
          case '%': out = a % b; break;
          case 'mod': out = a % b; break;
        }
        stack.push(out);
      }
    }

    if (stack.length !== 1) throw new Error('Malformed expression');
    return stack[0];
  }, [history, isDegreeMode]);

  const addToHistory = useCallback((expr: string, result: string) => {
    const entry: HistoryEntry = {
      id: `${Date.now()}-${Math.random()}`,
      expression: expr,
      result,
      timestamp: Date.now()
    };
    setHistory(prev => [entry, ...prev.slice(0, 99)]);
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedResult(true);
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      setTimeout(() => setCopiedResult(false), 2000);
    } catch (e) {}
  }, []);

  const exportHistory = useCallback(() => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `calculator-history-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [history]);

  const commitResult = useCallback((val: number, expr?: string) => {
    const str = formatDisplay(val);
    setDisplay(str);

    if (str === 'Error') {
      setShake(true);
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
      shakeTimeoutRef.current = setTimeout(() => setShake(false), 400);
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    } else if (expr) {
      addToHistory(expr, str);
    }
  }, [addToHistory]);

  const inputNumber = useCallback((num: string) => {
    if (hasError) return;
    if (waitingForNewValue) {
      setDisplay(num === '.' ? '0.' : num);
      setWaitingForNewValue(false);
      return;
    }
    if (num === '.') {
      if (display.includes('.')) return;
      setDisplay(display + '.');
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  }, [display, waitingForNewValue, hasError]);

  const inputOperation = useCallback((nextOperation: string) => {
    if (hasError) return;
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
      setExpression(`${inputValue} ${nextOperation}`);
    } else if (operation && !waitingForNewValue) {
      // Only calculate if we have a new value entered (not just changing operation)
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);
      setPreviousValue(newValue);
      const expr = `${expression} ${inputValue}`;
      setExpression(`${newValue} ${nextOperation}`);
      commitResult(newValue, expr);
    } else if (operation && waitingForNewValue) {
      // Just change the operation without calculating
      setExpression(`${previousValue} ${nextOperation}`);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  }, [display, previousValue, operation, calculate, commitResult, hasError, expression, waitingForNewValue]);

  const evaluateEquals = useCallback(() => {
    if (hasError) return;

    try {
      // If we have a pending operation, calculate it directly
      if (previousValue !== null && operation) {
        const secondOperand = parseFloat(display);
        const firstOperand = previousValue;

        // Perform the calculation based on operation
        let result: number;
        switch (operation) {
          case '+': result = firstOperand + secondOperand; break;
          case '-': result = firstOperand - secondOperand; break;
          case '×': case '*': result = firstOperand * secondOperand; break;
          case '÷': case '/': result = secondOperand === 0 ? Infinity : firstOperand / secondOperand; break;
          case '^': result = Math.pow(firstOperand, secondOperand); break;
          case 'mod': case '%': result = firstOperand % secondOperand; break;
          default: result = secondOperand;
        }

        const expr = `${firstOperand} ${operation} ${secondOperand}`;

        if (!isFinite(result) || isNaN(result)) {
          throw new Error('Invalid result');
        }

        commitResult(result, expr);
        setPreviousValue(null);
        setOperation(null);
        setExpression('');
        setWaitingForNewValue(true);
      } else {
        // No pending operation, just show current display
        const result = parseFloat(display);
        if (!isFinite(result) || isNaN(result)) {
          throw new Error('Invalid result');
        }
        commitResult(result);
        setWaitingForNewValue(true);
      }
    } catch (e) {
      commitResult(NaN);
    }
  }, [display, hasError, previousValue, operation, commitResult]);

  const clearAll = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
    setExpression('');
  }, []);

  const clearEntry = useCallback(() => {
    setDisplay('0');
  }, []);

  const backspace = useCallback(() => {
    if (hasError) return;
    setDisplay((d) => (d.length <= 1 || (d.length === 2 && d.startsWith('-')) ? '0' : d.slice(0, -1)));
  }, [hasError]);

  const inputPercent = useCallback(() => {
    if (hasError) return;
    const value = parseFloat(display) / 100;
    commitResult(value);
  }, [display, commitResult, hasError]);

  const toggleSign = useCallback(() => {
    if (hasError) return;
    setDisplay((d) => (d === '0' ? '0' : d.startsWith('-') ? d.slice(1) : '-' + d));
  }, [hasError]);

  const applyUnary = useCallback((fn: string) => {
    if (hasError) return;
    const x = parseFloat(display);
    let v = x;
    const expr = `${fn}(${x})`;

    switch (fn) {
      case '√': v = x < 0 ? Infinity : Math.sqrt(x); break;
      case 'x²': v = x * x; break;
      case 'x³': v = x * x * x; break;
      case '1/x': v = x === 0 ? Infinity : 1 / x; break;
      case 'sin': v = isDegreeMode ? Math.sin(x * Math.PI / 180) : Math.sin(x); break;
      case 'cos': v = isDegreeMode ? Math.cos(x * Math.PI / 180) : Math.cos(x); break;
      case 'tan': v = isDegreeMode ? Math.tan(x * Math.PI / 180) : Math.tan(x); break;
      case 'asin': v = isDegreeMode ? Math.asin(x) * 180 / Math.PI : Math.asin(x); break;
      case 'acos': v = isDegreeMode ? Math.acos(x) * 180 / Math.PI : Math.acos(x); break;
      case 'atan': v = isDegreeMode ? Math.atan(x) * 180 / Math.PI : Math.atan(x); break;
      case 'ln': v = x <= 0 ? Infinity : Math.log(x); break;
      case 'log10': v = x <= 0 ? Infinity : Math.log10(x); break;
      case 'log2': v = x <= 0 ? Infinity : Math.log2(x); break;
      case 'exp': v = Math.exp(x); break;
      case '10^x': v = Math.pow(10, x); break;
      case '2^x': v = Math.pow(2, x); break;
      case 'x!': v = factorial(x); break;
      case 'abs': v = Math.abs(x); break;
      case 'floor': v = Math.floor(x); break;
      case 'ceil': v = Math.ceil(x); break;
      case 'round': v = Math.round(x); break;
    }
    commitResult(v, expr);
    setWaitingForNewValue(true);
  }, [display, commitResult, hasError, isDegreeMode]);

  const insertConstant = useCallback((k: 'π' | 'e') => {
    const v = k === 'π' ? Math.PI : Math.E;
    setDisplay(formatDisplay(v));
    setWaitingForNewValue(false);
  }, []);

  const inputMemoryAdd = useCallback(() => {
    if (hasError) return;
    setMemory((m) => m + parseFloat(display));
  }, [display, hasError]);

  const inputMemoryRecall = useCallback(() => {
    setDisplay(formatDisplay(memory));
    setWaitingForNewValue(false);
  }, [memory]);

  const inputMemoryClear = useCallback(() => {
    setMemory(0);
  }, []);

  // Keyboard support
  useEffect(() => {
    if (!isVisible) return;
    const onKey = (e: KeyboardEvent) => {
      const key = e.key;
      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && key === 'c' && !hasError) { e.preventDefault(); copyToClipboard(display); return; }
      if (ctrl && key === 'e') { e.preventDefault(); exportHistory(); return; }

      if (key === 'Escape') { onClose(); return; }
      if ((/^[0-9]$/).test(key)) { e.preventDefault(); inputNumber(key); return; }
      if (key === '.') { e.preventDefault(); inputNumber('.'); return; }
      if (key === '+' || key === '-') { e.preventDefault(); inputOperation(key); return; }
      if (key === '*') { e.preventDefault(); inputOperation('×'); return; }
      if (key === '/') { e.preventDefault(); inputOperation('÷'); return; }
      if (key === 'Enter' || key === '=') { e.preventDefault(); evaluateEquals(); return; }
      if (key === '%') { e.preventDefault(); inputPercent(); return; }
      if (key === 'Backspace') { e.preventDefault(); backspace(); return; }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isVisible, onClose, inputNumber, inputOperation, inputPercent, evaluateEquals, backspace, display, hasError, copyToClipboard, exportHistory]);

  const displayClass = useMemo(() => {
    const len = display.length;
    if (len > 14) return 'xs';
    if (len > 10) return 'sm';
    if (len > 6) return 'md';
    return 'lg';
  }, [display]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('calc-history-v2');
  }, []);

  const convertUnits = useMemo(() => {
    const value = parseFloat(converterValue);
    if (isNaN(value)) return '0';

    if (converterType === 'temperature') {
      let celsius = 0;
      if (fromUnit === 'fahrenheit') {
        celsius = (value - 32) * 5 / 9;
      } else if (fromUnit === 'kelvin') {
        celsius = value - 273.15;
      } else {
        celsius = value;
      }
      const tempConversions = UNIT_CONVERSIONS.temperature;
      const result = tempConversions[toUnit as keyof typeof tempConversions](celsius);
      return formatDisplay(result);
    } else if (converterType === 'weight') {
      const kgValue = value / UNIT_CONVERSIONS.weight[fromUnit as keyof typeof UNIT_CONVERSIONS.weight];
      const result = kgValue * UNIT_CONVERSIONS.weight[toUnit as keyof typeof UNIT_CONVERSIONS.weight];
      return formatDisplay(result);
    } else {
      const meterValue = value / UNIT_CONVERSIONS.length[fromUnit as keyof typeof UNIT_CONVERSIONS.length];
      const result = meterValue * UNIT_CONVERSIONS.length[toUnit as keyof typeof UNIT_CONVERSIONS.length];
      return formatDisplay(result);
    }
  }, [converterValue, fromUnit, toUnit, converterType]);

  // AI Insights
  const aiInsights = useMemo(() => generateCalculationInsights(history), [history]);

  // Calculator stats
  const calcStats = useMemo(() => {
    const totalCalcs = history.length;
    const avgResultLength = history.length > 0
      ? (history.reduce((sum, h) => sum + h.result.length, 0) / history.length).toFixed(1)
      : '0';
    return { totalCalcs, avgResultLength };
  }, [history]);

  if (!isVisible) return null;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Controls Bar */}
      <div style={{
        padding: '0.5rem 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.2)',
        flexShrink: 0
      }}>
        <div style={{
          color: 'white',
          fontSize: '0.85rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>🧮</span>
          Calculator Pro
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {memory !== 0 && (
            <span style={{
              background: 'rgba(52, 199, 89, 0.3)',
              padding: '0.25rem 0.5rem',
              borderRadius: '6px',
              fontSize: '0.65rem',
              color: 'colors.status.success'
            }}>M</span>
          )}
        </div>
      </div>

      {/* Mode Tabs */}
      <div style={{
        display: 'flex',
        background: 'rgba(0, 0, 0, 0.2)',
        padding: '0.5rem',
        gap: '0.5rem'
      }}>
        {[
          { id: 'basic', label: '123', name: 'Basic' },
          { id: 'scientific', label: 'fx', name: 'Scientific' },
          { id: 'converter', label: '⇄', name: 'Convert' },
          { id: 'history', label: '⟲', name: 'History' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id as typeof mode)}
            style={{
              flex: 1,
              padding: '0.5rem',
              background: mode === tab.id
                ? 'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)'
                : 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.15rem'
            }}
          >
            <span style={{ fontSize: '0.85rem' }}>{tab.label}</span>
            <span style={{ opacity: 0.8 }}>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '0.5rem',
        WebkitOverflowScrolling: 'touch'
      }}>
        {mode !== 'history' && mode !== 'converter' && (
          <>
            {/* Display */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '0.5rem',
              color: 'white'
            }}>
              <div style={{
                fontSize: '0.75rem',
                opacity: 0.6,
                textAlign: 'right',
                minHeight: '1rem',
                marginBottom: '0.25rem'
              }}>
                {expression || ''}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  flex: 1,
                  fontSize: displayClass === 'lg' ? '2.5rem' : displayClass === 'md' ? '2rem' : displayClass === 'sm' ? '1.5rem' : '1.25rem',
                  fontWeight: 300,
                  textAlign: 'right',
                  fontFamily: 'SF Mono, monospace',
                  wordBreak: 'break-all',
                  animation: shake ? 'shake 0.3s ease' : 'none'
                }}>
                  {display}
                </div>
                <button
                  onClick={() => copyToClipboard(display)}
                  style={{
                    background: copiedResult ? 'rgba(52, 199, 89, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.5rem',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  {copiedResult ? '✓' : '📋'}
                </button>
              </div>
            </div>

            {/* AI Insights */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: '12px',
              padding: '0.75rem',
              marginBottom: '0.5rem',
              color: 'white',
              border: '1px solid rgba(139, 92, 246, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span>🤖</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>AI Calculator Assistant</span>
              </div>
              <p style={{ fontSize: '0.7rem', margin: '0 0 0.5rem 0', opacity: 0.9 }}>
                {aiInsights.text}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                {aiInsights.tips.map((tip, i) => (
                  <span key={i} style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '4px',
                    padding: '0.2rem 0.4rem',
                    fontSize: '0.6rem'
                  }}>
                    {tip}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* History View */}
        {mode === 'history' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>
                Calculation History ({history.length})
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={exportHistory}
                  style={{
                    background: 'rgba(0, 122, 255, 0.3)',
                    border: '1px solid rgba(0, 122, 255, 0.5)',
                    borderRadius: '6px',
                    padding: '0.3rem 0.5rem',
                    color: 'colors.status.info',
                    fontSize: '0.65rem',
                    cursor: 'pointer'
                  }}
                >
                  Export
                </button>
                <button
                  onClick={clearHistory}
                  style={{
                    background: 'rgba(255, 59, 48, 0.3)',
                    border: '1px solid rgba(255, 59, 48, 0.5)',
                    borderRadius: '6px',
                    padding: '0.3rem 0.5rem',
                    color: 'colors.status.error',
                    fontSize: '0.65rem',
                    cursor: 'pointer'
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Stats Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '12px',
              padding: '0.75rem',
              marginBottom: '0.5rem',
              color: 'white',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.5rem'
            }}>
              <div>
                <div style={{ fontSize: '0.6rem', opacity: 0.7 }}>Total Calculations</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'colors.brand.primary' }}>
                  {calcStats.totalCalcs}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.6rem', opacity: 0.7 }}>Avg Result Length</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'colors.status.success' }}>
                  {calcStats.avgResultLength}
                </div>
              </div>
            </div>

            {history.length === 0 ? (
              <div style={{
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.5)',
                padding: '2rem',
                fontSize: '0.85rem'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                No calculations yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {history.map((entry) => (
                  <div key={entry.id} style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setDisplay(entry.result);
                    setMode('basic');
                  }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{entry.expression}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600 }}>= {entry.result}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Converter View */}
        {mode === 'converter' && (
          <div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '12px',
              padding: '0.75rem',
              marginBottom: '0.5rem',
              color: 'white'
            }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                opacity: 0.7,
                marginBottom: '0.5rem'
              }}>
                Unit Converter
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {(['length', 'weight', 'temperature'] as UnitType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      setConverterType(type);
                      if (type === 'length') { setFromUnit('meter'); setToUnit('feet'); }
                      else if (type === 'weight') { setFromUnit('kg'); setToUnit('lb'); }
                      else { setFromUnit('celsius'); setToUnit('fahrenheit'); }
                    }}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      background: converterType === type
                        ? 'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)'
                        : 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div style={{ marginBottom: '0.5rem' }}>
                <input
                  type="number"
                  value={converterValue}
                  onChange={(e) => setConverterValue(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '1rem',
                    marginBottom: '0.25rem'
                  }}
                />
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value as Unit)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '0.85rem'
                  }}
                >
                  {converterType === 'length' && (
                    <>
                      <option value="meter">Meter</option>
                      <option value="feet">Feet</option>
                      <option value="inch">Inch</option>
                      <option value="cm">Centimeter</option>
                      <option value="km">Kilometer</option>
                      <option value="mile">Mile</option>
                    </>
                  )}
                  {converterType === 'weight' && (
                    <>
                      <option value="kg">Kilogram</option>
                      <option value="lb">Pound</option>
                      <option value="g">Gram</option>
                      <option value="oz">Ounce</option>
                    </>
                  )}
                  {converterType === 'temperature' && (
                    <>
                      <option value="celsius">Celsius</option>
                      <option value="fahrenheit">Fahrenheit</option>
                      <option value="kelvin">Kelvin</option>
                    </>
                  )}
                </select>
              </div>

              <div style={{ textAlign: 'center', fontSize: '1.5rem', margin: '0.5rem 0' }}>⇓</div>

              <div style={{
                background: 'rgba(52, 199, 89, 0.2)',
                borderRadius: '8px',
                padding: '0.75rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'colors.status.success' }}>
                  {convertUnits}
                </div>
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value as Unit)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '0.85rem',
                    marginTop: '0.5rem'
                  }}
                >
                  {converterType === 'length' && (
                    <>
                      <option value="meter">Meter</option>
                      <option value="feet">Feet</option>
                      <option value="inch">Inch</option>
                      <option value="cm">Centimeter</option>
                      <option value="km">Kilometer</option>
                      <option value="mile">Mile</option>
                    </>
                  )}
                  {converterType === 'weight' && (
                    <>
                      <option value="kg">Kilogram</option>
                      <option value="lb">Pound</option>
                      <option value="g">Gram</option>
                      <option value="oz">Ounce</option>
                    </>
                  )}
                  {converterType === 'temperature' && (
                    <>
                      <option value="celsius">Celsius</option>
                      <option value="fahrenheit">Fahrenheit</option>
                      <option value="kelvin">Kelvin</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Calculator Buttons */}
        {(mode === 'basic' || mode === 'scientific') && (
          <div>
            {/* Scientific Functions */}
            {mode === 'scientific' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '0.25rem',
                marginBottom: '0.25rem'
              }}>
                {[
                  { label: isDegreeMode ? 'DEG' : 'RAD', action: () => setIsDegreeMode(!isDegreeMode) },
                  { label: 'π', action: () => insertConstant('π') },
                  { label: 'e', action: () => insertConstant('e') },
                  { label: 'ln', action: () => applyUnary('ln') },
                  { label: 'log', action: () => applyUnary('log10') },
                  { label: 'sin', action: () => applyUnary('sin') },
                  { label: 'cos', action: () => applyUnary('cos') },
                  { label: 'tan', action: () => applyUnary('tan') },
                  { label: '√', action: () => applyUnary('√') },
                  { label: 'x²', action: () => applyUnary('x²') },
                  { label: 'x!', action: () => applyUnary('x!') },
                  { label: '(', action: () => setDisplay(d => d === '0' ? '(' : d + '(') },
                  { label: ')', action: () => setDisplay(d => d + ')') },
                  { label: '^', action: () => inputOperation('^') },
                  { label: 'mod', action: () => inputOperation('mod') },
                ].map((btn, i) => (
                  <button
                    key={i}
                    onClick={btn.action}
                    style={{
                      padding: '0.5rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      borderRadius: '6px',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '0.7rem',
                      cursor: 'pointer'
                    }}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            )}

            {/* Basic Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.25rem'
            }}>
              {/* Row 1 */}
              <button onClick={inputMemoryClear} style={memBtnStyle}>MC</button>
              <button onClick={inputMemoryRecall} style={memBtnStyle}>MR</button>
              <button onClick={inputMemoryAdd} style={memBtnStyle}>M+</button>
              <button onClick={() => inputOperation('÷')} style={opBtnStyle}>÷</button>

              {/* Row 2 */}
              <button onClick={clearAll} style={funcBtnStyle}>C</button>
              <button onClick={clearEntry} style={funcBtnStyle}>CE</button>
              <button onClick={toggleSign} style={funcBtnStyle}>±</button>
              <button onClick={() => inputOperation('×')} style={opBtnStyle}>×</button>

              {/* Row 3 */}
              <button onClick={() => inputNumber('7')} style={numBtnStyle}>7</button>
              <button onClick={() => inputNumber('8')} style={numBtnStyle}>8</button>
              <button onClick={() => inputNumber('9')} style={numBtnStyle}>9</button>
              <button onClick={() => inputOperation('-')} style={opBtnStyle}>−</button>

              {/* Row 4 */}
              <button onClick={() => inputNumber('4')} style={numBtnStyle}>4</button>
              <button onClick={() => inputNumber('5')} style={numBtnStyle}>5</button>
              <button onClick={() => inputNumber('6')} style={numBtnStyle}>6</button>
              <button onClick={() => inputOperation('+')} style={opBtnStyle}>+</button>

              {/* Row 5 */}
              <button onClick={() => inputNumber('1')} style={numBtnStyle}>1</button>
              <button onClick={() => inputNumber('2')} style={numBtnStyle}>2</button>
              <button onClick={() => inputNumber('3')} style={numBtnStyle}>3</button>
              <button onClick={evaluateEquals} style={{...equalsBtnStyle, gridRow: 'span 2'}}>
                =
              </button>

              {/* Row 6 */}
              <button onClick={() => inputNumber('0')} style={{...numBtnStyle, gridColumn: 'span 2'}}>0</button>
              <button onClick={() => inputNumber('.')} style={numBtnStyle}>.</button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
});

// Button styles
const baseBtnStyle: React.CSSProperties = {
  padding: '0.75rem',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const numBtnStyle: React.CSSProperties = {
  ...baseBtnStyle,
  background: 'rgba(255, 255, 255, 0.15)',
  color: 'white'
};

const opBtnStyle: React.CSSProperties = {
  ...baseBtnStyle,
  background: 'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)',
  color: 'white',
  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
};

const funcBtnStyle: React.CSSProperties = {
  ...baseBtnStyle,
  background: 'rgba(255, 255, 255, 0.25)',
  color: 'white'
};

const memBtnStyle: React.CSSProperties = {
  ...baseBtnStyle,
  background: 'rgba(0, 0, 0, 0.3)',
  color: 'rgba(255, 255, 255, 0.7)',
  fontSize: '0.8rem'
};

const equalsBtnStyle: React.CSSProperties = {
  ...baseBtnStyle,
  background: 'linear-gradient(135deg, colors.status.success 0%, colors.chart[1] 100%)',
  color: 'white',
  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
};

CalculatorApp.displayName = 'CalculatorApp';

export default CalculatorApp;
