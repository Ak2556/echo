'use client';

import { useThemeColors } from '@/hooks/useThemeColors';
import React, { useState, useCallback, useMemo, useEffect, memo } from 'react';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  recurring?: boolean;
}

interface Budget {
  category: string;
  limit: number;
  spent: number;
}

interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  icon: string;
}

interface FinanceManagerAppProps {
  isVisible: boolean;
  onClose: () => void;
}

// Generate AI financial insights
const generateFinancialInsights = (
  transactions: Transaction[],
  totalIncome: number,
  totalExpenses: number,
  balance: number
): { text: string; tips: string[]; alerts: string[] } => {
  const insights: string[] = [];
  const tips: string[] = [];
  const alerts: string[] = [];

  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  // Savings rate analysis
  if (savingsRate >= 30) {
    insights.push(
      `Excellent! You're saving ${savingsRate.toFixed(0)}% of your income.`
    );
    tips.push('Consider investing surplus in index funds');
  } else if (savingsRate >= 20) {
    insights.push(`Good savings rate of ${savingsRate.toFixed(0)}%.`);
    tips.push('Try to increase savings to 30%');
  } else if (savingsRate >= 10) {
    insights.push(
      `Your savings rate is ${savingsRate.toFixed(0)}% - room for improvement.`
    );
    tips.push('Review subscriptions for cuts');
    tips.push('Set up automatic savings');
  } else if (savingsRate > 0) {
    alerts.push(`Low savings rate: ${savingsRate.toFixed(0)}%`);
    tips.push('Create emergency fund first');
    tips.push('Track daily expenses');
  } else {
    alerts.push('You are spending more than you earn!');
    tips.push('Reduce non-essential spending');
    tips.push('Find additional income sources');
  }

  // Expense pattern analysis
  const expensesByCategory: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      expensesByCategory[t.category] =
        (expensesByCategory[t.category] || 0) + t.amount;
    });

  const topCategory = Object.entries(expensesByCategory).sort(
    ([, a], [, b]) => b - a
  )[0];

  if (topCategory) {
    const percentage = ((topCategory[1] / totalExpenses) * 100).toFixed(0);
    insights.push(
      `${topCategory[0]} is your highest expense at ${percentage}% of spending.`
    );
  }

  // General tips
  if (tips.length < 3) {
    tips.push('Review and cancel unused subscriptions');
    tips.push('Use 50/30/20 budgeting rule');
    tips.push('Build 3-6 months emergency fund');
  }

  return {
    text:
      insights.join(' ') ||
      'Add more transactions to get personalized insights.',
    tips: tips.slice(0, 4),
    alerts,
  };
};

// Get financial health score
const getFinancialHealthScore = (
  savingsRate: number,
  expenseRatio: number,
  hasEmergencyFund: boolean
): { score: number; grade: string; color: string } => {
  let score = 50;

  // Savings rate contribution (max 30 points)
  score += Math.min(savingsRate, 30);

  // Expense ratio contribution (max 20 points)
  if (expenseRatio < 50) score += 20;
  else if (expenseRatio < 70) score += 15;
  else if (expenseRatio < 90) score += 10;
  else score += 5;

  // Emergency fund bonus
  if (hasEmergencyFund) score += 10;

  score = Math.min(100, Math.max(0, score));

  let grade = 'F';
  let color = 'colors.status.error';

  if (score >= 90) {
    grade = 'A+';
    color = 'colors.status.success';
  } else if (score >= 80) {
    grade = 'A';
    color = 'colors.status.success';
  } else if (score >= 70) {
    grade = 'B';
    color = '#30d158';
  } else if (score >= 60) {
    grade = 'C';
    color = 'colors.status.warning';
  } else if (score >= 50) {
    grade = 'D';
    color = 'colors.brand.secondary';
  }

  return { score, grade, color };
};

// Category icons
const categoryIcons: Record<string, string> = {
  Salary: '💼',
  Freelance: '💻',
  Investment: '📈',
  Rent: '🏠',
  Food: '🍔',
  Transport: '🚗',
  Entertainment: '🎬',
  Health: '🏥',
  Shopping: '🛍️',
  Utilities: '💡',
  Education: '📚',
  Travel: '✈️',
  Insurance: '🛡️',
  Savings: '🏦',
  Other: '📦',
};

const FinanceManagerApp: React.FC<FinanceManagerAppProps> = memo(
  ({ isVisible, onClose }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([
      {
        id: '1',
        type: 'income',
        amount: 75000,
        category: 'Salary',
        description: 'Monthly salary',
        date: '2024-01-01',
      },
      {
        id: '2',
        type: 'expense',
        amount: 25000,
        category: 'Rent',
        description: 'Monthly rent',
        date: '2024-01-02',
      },
      {
        id: '3',
        type: 'expense',
        amount: 8500,
        category: 'Food',
        description: 'Groceries',
        date: '2024-01-03',
      },
      {
        id: '4',
        type: 'expense',
        amount: 3000,
        category: 'Transport',
        description: 'Fuel',
        date: '2024-01-04',
      },
      {
        id: '5',
        type: 'expense',
        amount: 2500,
        category: 'Entertainment',
        description: 'Movies & dining',
        date: '2024-01-05',
      },
      {
        id: '6',
        type: 'expense',
        amount: 5000,
        category: 'Utilities',
        description: 'Electricity & internet',
        date: '2024-01-06',
      },
      {
        id: '7',
        type: 'income',
        amount: 15000,
        category: 'Freelance',
        description: 'Side project',
        date: '2024-01-10',
      },
    ]);

    const [budgets] = useState<Budget[]>([
      { category: 'Food', limit: 10000, spent: 8500 },
      { category: 'Transport', limit: 5000, spent: 3000 },
      { category: 'Entertainment', limit: 5000, spent: 2500 },
      { category: 'Shopping', limit: 8000, spent: 0 },
      { category: 'Utilities', limit: 6000, spent: 5000 },
    ]);

    const [savingsGoals] = useState<SavingsGoal[]>([
      {
        id: '1',
        name: 'Emergency Fund',
        target: 300000,
        current: 150000,
        deadline: '2024-12-31',
        icon: '🛡️',
      },
      {
        id: '2',
        name: 'Vacation',
        target: 100000,
        current: 35000,
        deadline: '2024-06-30',
        icon: '✈️',
      },
      {
        id: '3',
        name: 'New Laptop',
        target: 80000,
        current: 45000,
        deadline: '2024-04-30',
        icon: '💻',
      },
    ]);

    const [newTransaction, setNewTransaction] = useState({
      type: 'expense' as 'income' | 'expense',
      amount: '',
      category: '',
      description: '',
    });

    const [showAddTransaction, setShowAddTransaction] = useState(false);

    const categories = {
      income: ['Salary', 'Freelance', 'Investment', 'Other'],
      expense: [
        'Rent',
        'Food',
        'Transport',
        'Entertainment',
        'Health',
        'Shopping',
        'Utilities',
        'Education',
        'Travel',
        'Insurance',
        'Other',
      ],
    };

    // Calculate totals
    const totalIncome = useMemo(
      () =>
        transactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0),
      [transactions]
    );

    const totalExpenses = useMemo(
      () =>
        transactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0),
      [transactions]
    );

    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;
    const expenseRatio =
      totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

    // Group expenses by category
    const expensesByCategory = useMemo(() => {
      const grouped: Record<string, number> = {};
      transactions
        .filter((t) => t.type === 'expense')
        .forEach((t) => {
          grouped[t.category] = (grouped[t.category] || 0) + t.amount;
        });
      return Object.entries(grouped).sort(([, a], [, b]) => b - a);
    }, [transactions]);

    // Financial health
    const healthScore = useMemo(
      () =>
        getFinancialHealthScore(
          savingsRate,
          expenseRatio,
          savingsGoals[0]?.current >= 100000
        ),
      [savingsRate, expenseRatio, savingsGoals]
    );

    // AI insights
    const aiInsights = useMemo(
      () =>
        generateFinancialInsights(
          transactions,
          totalIncome,
          totalExpenses,
          balance
        ),
      [transactions, totalIncome, totalExpenses, balance]
    );

    const addTransaction = useCallback(() => {
      if (newTransaction.amount && newTransaction.category) {
        const transaction: Transaction = {
          id: Date.now().toString(),
          type: newTransaction.type,
          amount: parseFloat(newTransaction.amount),
          category: newTransaction.category,
          description: newTransaction.description,
          date: new Date().toISOString().split('T')[0],
        };
        setTransactions((prev) => [transaction, ...prev]);
        setNewTransaction({
          type: 'expense',
          amount: '',
          category: '',
          description: '',
        });
        setShowAddTransaction(false);
      }
    }, [newTransaction]);

    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    if (!isVisible) return null;

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background:
            'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Controls Bar */}
        <div
          style={{
            padding: '0.5rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.2)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              color: 'white',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>💰</span>
            Finance Manager
          </div>
          <button
            onClick={() => setShowAddTransaction(true)}
            style={{
              background: 'rgba(52, 199, 89, 0.3)',
              border: '1px solid rgba(52, 199, 89, 0.5)',
              borderRadius: '8px',
              padding: '0.4rem 0.75rem',
              color: 'colors.status.success',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <span>+</span> Add
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '0 1rem 1rem',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* Financial Health Score */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '12px',
              padding: '1rem',
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
              color: 'white',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: `conic-gradient(${healthScore.color} ${healthScore.score * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'rgba(26, 26, 46, 0.9)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: healthScore.color,
                    }}
                  >
                    {healthScore.grade}
                  </div>
                  <div style={{ fontSize: '0.6rem', opacity: 0.7 }}>
                    {healthScore.score}
                  </div>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    opacity: 0.7,
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Financial Health
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                  {healthScore.score >= 80
                    ? 'Excellent'
                    : healthScore.score >= 60
                      ? 'Good'
                      : healthScore.score >= 40
                        ? 'Fair'
                        : 'Needs Improvement'}
                </div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    opacity: 0.7,
                    marginTop: '0.25rem',
                  }}
                >
                  Savings: {savingsRate.toFixed(0)}% | Expenses:{' '}
                  {expenseRatio.toFixed(0)}%
                </div>
              </div>
            </div>
          </div>

          {/* Balance Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              marginBottom: '0.5rem',
            }}
          >
            <div
              style={{
                background: 'rgba(52, 199, 89, 0.15)',
                backdropFilter: 'blur(20px)',
                borderRadius: '12px',
                padding: '0.75rem',
                color: 'white',
                border: '1px solid rgba(52, 199, 89, 0.3)',
              }}
            >
              <div
                style={{
                  fontSize: '0.65rem',
                  opacity: 0.7,
                  marginBottom: '0.25rem',
                }}
              >
                Income
              </div>
              <div
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'colors.status.success',
                }}
              >
                {formatCurrency(totalIncome)}
              </div>
              <div
                style={{
                  fontSize: '0.6rem',
                  opacity: 0.6,
                  marginTop: '0.25rem',
                }}
              >
                This month
              </div>
            </div>
            <div
              style={{
                background: 'rgba(255, 59, 48, 0.15)',
                backdropFilter: 'blur(20px)',
                borderRadius: '12px',
                padding: '0.75rem',
                color: 'white',
                border: '1px solid rgba(255, 59, 48, 0.3)',
              }}
            >
              <div
                style={{
                  fontSize: '0.65rem',
                  opacity: 0.7,
                  marginBottom: '0.25rem',
                }}
              >
                Expenses
              </div>
              <div
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'colors.status.error',
                }}
              >
                {formatCurrency(totalExpenses)}
              </div>
              <div
                style={{
                  fontSize: '0.6rem',
                  opacity: 0.6,
                  marginTop: '0.25rem',
                }}
              >
                This month
              </div>
            </div>
            <div
              style={{
                background: 'rgba(0, 122, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                borderRadius: '12px',
                padding: '0.75rem',
                color: 'white',
                border: '1px solid rgba(0, 122, 255, 0.3)',
              }}
            >
              <div
                style={{
                  fontSize: '0.65rem',
                  opacity: 0.7,
                  marginBottom: '0.25rem',
                }}
              >
                Balance
              </div>
              <div
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color:
                    balance >= 0
                      ? 'colors.status.success'
                      : 'colors.status.error',
                }}
              >
                {formatCurrency(balance)}
              </div>
              <div
                style={{
                  fontSize: '0.6rem',
                  opacity: 0.6,
                  marginTop: '0.25rem',
                }}
              >
                Available
              </div>
            </div>
          </div>

          {/* AI Financial Insights */}
          <div
            style={{
              background:
                'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(59, 130, 246, 0.3) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: '12px',
              padding: '0.75rem',
              marginBottom: '0.5rem',
              color: 'white',
              border: '1px solid rgba(139, 92, 246, 0.3)',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>🤖</span> AI Financial Advisor
            </div>

            {aiInsights.alerts.length > 0 && (
              <div
                style={{
                  background: 'rgba(255, 59, 48, 0.2)',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  marginBottom: '0.5rem',
                  fontSize: '0.75rem',
                }}
              >
                {aiInsights.alerts.map((alert, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span>⚠️</span> {alert}
                  </div>
                ))}
              </div>
            )}

            <p
              style={{
                fontSize: '0.8rem',
                lineHeight: 1.5,
                margin: '0 0 0.5rem 0',
                opacity: 0.95,
              }}
            >
              {aiInsights.text}
            </p>

            <div
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                marginBottom: '0.35rem',
                opacity: 0.8,
              }}
            >
              Smart Tips:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {aiInsights.tips.map((tip, i) => (
                <span
                  key={i}
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    padding: '0.3rem 0.5rem',
                    fontSize: '0.65rem',
                  }}
                >
                  {tip}
                </span>
              ))}
            </div>
          </div>

          {/* Expense Breakdown */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '12px',
              padding: '0.75rem',
              marginBottom: '0.5rem',
              color: 'white',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                opacity: 0.7,
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              📊 Expense Breakdown
            </div>
            {expensesByCategory.slice(0, 5).map(([category, amount], i) => {
              const percentage = (amount / totalExpenses) * 100;
              return (
                <div
                  key={category}
                  style={{ marginBottom: i < 4 ? '0.5rem' : 0 }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span>{categoryIcons[category] || '📦'}</span>
                      <span style={{ fontSize: '0.75rem' }}>{category}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                      {formatCurrency(amount)}
                    </div>
                  </div>
                  <div
                    style={{
                      height: '4px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${percentage}%`,
                        background: `hsl(${200 - i * 30}, 70%, 60%)`,
                        borderRadius: '2px',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: '0.6rem',
                      opacity: 0.6,
                      marginTop: '0.15rem',
                      textAlign: 'right',
                    }}
                  >
                    {percentage.toFixed(1)}% of expenses
                  </div>
                </div>
              );
            })}
          </div>

          {/* Budget Tracking */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '12px',
              padding: '0.75rem',
              marginBottom: '0.5rem',
              color: 'white',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                opacity: 0.7,
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              🎯 Budget Tracking
            </div>
            {budgets.map((budget, i) => {
              const percentage = (budget.spent / budget.limit) * 100;
              const isOverBudget = percentage > 100;
              const isNearLimit = percentage > 80;
              return (
                <div
                  key={budget.category}
                  style={{
                    marginBottom: i < budgets.length - 1 ? '0.5rem' : 0,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span>{categoryIcons[budget.category] || '📦'}</span>
                      <span style={{ fontSize: '0.75rem' }}>
                        {budget.category}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.7rem' }}>
                      <span
                        style={{
                          fontWeight: 600,
                          color: isOverBudget ? 'colors.status.error' : 'white',
                        }}
                      >
                        {formatCurrency(budget.spent)}
                      </span>
                      <span style={{ opacity: 0.6 }}>
                        {' '}
                        / {formatCurrency(budget.limit)}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      height: '4px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(percentage, 100)}%`,
                        background: isOverBudget
                          ? 'colors.status.error'
                          : isNearLimit
                            ? 'colors.brand.secondary'
                            : 'colors.status.success',
                        borderRadius: '2px',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.6rem',
                      opacity: 0.6,
                      marginTop: '0.15rem',
                    }}
                  >
                    <span>
                      {isOverBudget
                        ? 'Over budget!'
                        : `${formatCurrency(budget.limit - budget.spent)} left`}
                    </span>
                    <span>{percentage.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Savings Goals */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '12px',
              padding: '0.75rem',
              marginBottom: '0.5rem',
              color: 'white',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                opacity: 0.7,
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              🏦 Savings Goals
            </div>
            {savingsGoals.map((goal, i) => {
              const percentage = (goal.current / goal.target) * 100;
              const remaining = goal.target - goal.current;
              return (
                <div
                  key={goal.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    marginBottom: i < savingsGoals.length - 1 ? '0.5rem' : 0,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span style={{ fontSize: '1.25rem' }}>{goal.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          {goal.name}
                        </div>
                        <div style={{ fontSize: '0.6rem', opacity: 0.6 }}>
                          Due: {goal.deadline}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'colors.status.success',
                        }}
                      >
                        {formatCurrency(goal.current)}
                      </div>
                      <div style={{ fontSize: '0.6rem', opacity: 0.6 }}>
                        of {formatCurrency(goal.target)}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      height: '6px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${percentage}%`,
                        background:
                          'linear-gradient(90deg, colors.status.success, #30d158)',
                        borderRadius: '3px',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.6rem',
                      marginTop: '0.25rem',
                    }}
                  >
                    <span style={{ opacity: 0.6 }}>
                      {formatCurrency(remaining)} to go
                    </span>
                    <span
                      style={{
                        fontWeight: 600,
                        color: 'colors.status.success',
                      }}
                    >
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Transactions */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '12px',
              padding: '0.75rem',
              marginBottom: '0.5rem',
              color: 'white',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                opacity: 0.7,
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              💳 Recent Transactions
            </div>
            {transactions.slice(0, 5).map((transaction, i) => (
              <div
                key={transaction.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem 0',
                  borderBottom:
                    i < 4 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background:
                      transaction.type === 'income'
                        ? 'rgba(52, 199, 89, 0.2)'
                        : 'rgba(255, 59, 48, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                  }}
                >
                  {categoryIcons[transaction.category] ||
                    (transaction.type === 'income' ? '💰' : '💸')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    {transaction.category}
                  </div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>
                    {transaction.description || 'No description'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color:
                        transaction.type === 'income'
                          ? 'colors.status.success'
                          : 'colors.status.error',
                    }}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </div>
                  <div style={{ fontSize: '0.6rem', opacity: 0.6 }}>
                    {transaction.date}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.5rem',
            }}
          >
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: '12px',
                padding: '0.75rem',
                color: 'white',
              }}
            >
              <div
                style={{
                  fontSize: '0.65rem',
                  opacity: 0.7,
                  marginBottom: '0.25rem',
                }}
              >
                Daily Average
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                {formatCurrency(totalExpenses / 30)}
              </div>
              <div
                style={{
                  fontSize: '0.6rem',
                  opacity: 0.6,
                  marginTop: '0.25rem',
                }}
              >
                Expenses per day
              </div>
            </div>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: '12px',
                padding: '0.75rem',
                color: 'white',
              }}
            >
              <div
                style={{
                  fontSize: '0.65rem',
                  opacity: 0.7,
                  marginBottom: '0.25rem',
                }}
              >
                Transactions
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                {transactions.length}
              </div>
              <div
                style={{
                  fontSize: '0.6rem',
                  opacity: 0.6,
                  marginTop: '0.25rem',
                }}
              >
                This month
              </div>
            </div>
          </div>
        </div>

        {/* Add Transaction Modal */}
        {showAddTransaction && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(20px)',
              display: 'flex',
              flexDirection: 'column',
              padding: '1.5rem',
              zIndex: 100,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <h3
                style={{
                  color: 'white',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                Add Transaction
              </h3>
              <button
                onClick={() => setShowAddTransaction(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 0.75rem',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}
            >
              <button
                onClick={() =>
                  setNewTransaction((prev) => ({
                    ...prev,
                    type: 'expense',
                    category: '',
                  }))
                }
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: 'none',
                  background:
                    newTransaction.type === 'expense'
                      ? 'rgba(255, 59, 48, 0.3)'
                      : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                💸 Expense
              </button>
              <button
                onClick={() =>
                  setNewTransaction((prev) => ({
                    ...prev,
                    type: 'income',
                    category: '',
                  }))
                }
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: 'none',
                  background:
                    newTransaction.type === 'income'
                      ? 'rgba(52, 199, 89, 0.3)'
                      : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                💰 Income
              </button>
            </div>

            <input
              type="number"
              placeholder="Amount"
              value={newTransaction.amount}
              onChange={(e) =>
                setNewTransaction((prev) => ({
                  ...prev,
                  amount: e.target.value,
                }))
              }
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                fontSize: '1rem',
                marginBottom: '0.75rem',
                outline: 'none',
              }}
            />

            <select
              value={newTransaction.category}
              onChange={(e) =>
                setNewTransaction((prev) => ({
                  ...prev,
                  category: e.target.value,
                }))
              }
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                fontSize: '1rem',
                marginBottom: '0.75rem',
                outline: 'none',
              }}
            >
              <option value="">Select Category</option>
              {categories[newTransaction.type].map((cat) => (
                <option key={cat} value={cat}>
                  {categoryIcons[cat] || '📦'} {cat}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Description (optional)"
              value={newTransaction.description}
              onChange={(e) =>
                setNewTransaction((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                fontSize: '1rem',
                marginBottom: '1rem',
                outline: 'none',
              }}
            />

            <button
              onClick={addTransaction}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '10px',
                border: 'none',
                background:
                  newTransaction.type === 'income'
                    ? 'linear-gradient(135deg, colors.status.success, #30d158)'
                    : 'linear-gradient(135deg, colors.status.error, #ff453a)',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Add {newTransaction.type === 'income' ? 'Income' : 'Expense'}
            </button>
          </div>
        )}
      </div>
    );
  }
);

FinanceManagerApp.displayName = 'FinanceManagerApp';

export default FinanceManagerApp;
