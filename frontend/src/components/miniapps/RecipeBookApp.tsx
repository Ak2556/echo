'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useThemeColors } from '@/hooks/useThemeColors';

interface Recipe {
  id: string;
  name: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prepTime: number;
  cookTime: number;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string[];
  image: string;
  favorite?: boolean;
  rating: number;
  tags: string[];
}

interface RecipeBookAppProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function RecipeBookApp({
  isVisible,
  onClose,
}: RecipeBookAppProps) {
  const colors = useThemeColors();
  const [activeTab, setActiveTab] = useState<
    'browse' | 'favorites' | 'suggestions'
  >('browse');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [showNutrition, setShowNutrition] = useState(false);

  const [recipes, setRecipes] = useState<Recipe[]>([
    {
      id: '1',
      name: 'Butter Chicken',
      category: 'Indian',
      difficulty: 'medium',
      prepTime: 20,
      cookTime: 40,
      servings: 4,
      calories: 490,
      protein: 35,
      carbs: 12,
      fat: 32,
      ingredients: [
        '500g chicken',
        '2 cups tomato puree',
        '1 cup cream',
        'Spices',
        'Butter',
      ],
      instructions: [
        'Marinate chicken',
        'Cook in butter',
        'Add tomato puree',
        'Simmer with cream',
      ],
      image: '🍛',
      rating: 4.8,
      tags: ['curry', 'creamy', 'popular'],
    },
    {
      id: '2',
      name: 'Caesar Salad',
      category: 'Salads',
      difficulty: 'easy',
      prepTime: 15,
      cookTime: 0,
      servings: 2,
      calories: 320,
      protein: 12,
      carbs: 18,
      fat: 24,
      ingredients: [
        'Romaine lettuce',
        'Croutons',
        'Parmesan',
        'Caesar dressing',
        'Lemon',
      ],
      instructions: [
        'Wash and chop lettuce',
        'Make dressing',
        'Toss together',
        'Add croutons',
      ],
      image: '🥗',
      rating: 4.5,
      tags: ['healthy', 'quick', 'vegetarian'],
    },
    {
      id: '3',
      name: 'Spaghetti Carbonara',
      category: 'Italian',
      difficulty: 'medium',
      prepTime: 10,
      cookTime: 20,
      servings: 4,
      calories: 580,
      protein: 25,
      carbs: 65,
      fat: 22,
      ingredients: [
        '400g spaghetti',
        '200g pancetta',
        '4 egg yolks',
        'Pecorino cheese',
        'Black pepper',
      ],
      instructions: [
        'Cook pasta',
        'Fry pancetta',
        'Mix eggs with cheese',
        'Combine quickly',
      ],
      image: '🍝',
      rating: 4.9,
      tags: ['pasta', 'classic', 'comfort'],
    },
    {
      id: '4',
      name: 'Grilled Salmon',
      category: 'Seafood',
      difficulty: 'easy',
      prepTime: 10,
      cookTime: 15,
      servings: 2,
      calories: 420,
      protein: 46,
      carbs: 2,
      fat: 25,
      ingredients: ['2 salmon fillets', 'Olive oil', 'Lemon', 'Dill', 'Garlic'],
      instructions: [
        'Season salmon',
        'Preheat grill',
        'Grill 6-8 min per side',
        'Serve with lemon',
      ],
      image: '🐟',
      rating: 4.7,
      tags: ['healthy', 'protein', 'keto'],
    },
    {
      id: '5',
      name: 'Chocolate Lava Cake',
      category: 'Desserts',
      difficulty: 'hard',
      prepTime: 15,
      cookTime: 12,
      servings: 4,
      calories: 450,
      protein: 8,
      carbs: 48,
      fat: 26,
      ingredients: [
        '200g dark chocolate',
        '100g butter',
        '2 eggs',
        'Sugar',
        'Flour',
      ],
      instructions: [
        'Melt chocolate with butter',
        'Whisk eggs with sugar',
        'Fold together',
        'Bake 12 min',
      ],
      image: '🍫',
      rating: 4.9,
      tags: ['dessert', 'indulgent', 'chocolate'],
    },
    {
      id: '6',
      name: 'Vegetable Stir Fry',
      category: 'Asian',
      difficulty: 'easy',
      prepTime: 15,
      cookTime: 10,
      servings: 3,
      calories: 180,
      protein: 8,
      carbs: 22,
      fat: 8,
      ingredients: [
        'Mixed vegetables',
        'Soy sauce',
        'Ginger',
        'Garlic',
        'Sesame oil',
      ],
      instructions: [
        'Prep vegetables',
        'Heat wok',
        'Stir fry quickly',
        'Add sauce',
      ],
      image: '🥘',
      rating: 4.4,
      tags: ['vegan', 'quick', 'healthy'],
    },
  ]);

  const categories = [
    'All',
    'Indian',
    'Italian',
    'Asian',
    'Salads',
    'Seafood',
    'Desserts',
  ];

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesSearch =
        searchQuery === '' ||
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesCategory =
        selectedCategory === 'All' || recipe.category === selectedCategory;
      const matchesDifficulty =
        selectedDifficulty === 'All' ||
        recipe.difficulty === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [recipes, searchQuery, selectedCategory, selectedDifficulty]);

  const favoriteRecipes = useMemo(
    () => recipes.filter((r) => r.favorite),
    [recipes]
  );

  const toggleFavorite = useCallback((id: string) => {
    setRecipes((prev) =>
      prev.map((recipe) =>
        recipe.id === id ? { ...recipe, favorite: !recipe.favorite } : recipe
      )
    );
  }, []);

  const aiSuggestions = useMemo(() => {
    const hour = new Date().getHours();
    return [
      {
        title:
          hour < 11
            ? 'Quick Breakfast Ideas'
            : hour < 15
              ? 'Light Lunch Options'
              : 'Dinner Recommendations',
        recipes: recipes
          .filter(
            (r) =>
              (hour < 11 && r.prepTime + r.cookTime < 20) ||
              (hour >= 11 && hour < 15 && r.calories < 400) ||
              (hour >= 15 && r.protein > 20)
          )
          .slice(0, 3),
        reason:
          hour < 11
            ? 'Quick to prepare'
            : hour < 15
              ? 'Light and nutritious'
              : 'Protein-rich meals',
      },
      {
        title: 'Healthy Options',
        recipes: recipes.filter((r) => r.calories < 400).slice(0, 3),
        reason: 'Low-calorie recipes',
      },
      {
        title: 'Quick & Easy',
        recipes: recipes
          .filter(
            (r) => r.difficulty === 'easy' && r.prepTime + r.cookTime < 30
          )
          .slice(0, 3),
        reason: 'Ready in under 30 minutes',
      },
    ];
  }, [recipes]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#2ed573';
      case 'medium':
        return '#ffa502';
      case 'hard':
        return '#ff4757';
      default:
        return '#888';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background:
          'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#ffffff',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px 24px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span>📚</span> Recipe Book Pro
          </h2>
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: '0.85rem',
              color: 'rgba(255, 255, 255, 0.6)',
            }}
          >
            AI-powered meal planning & nutrition
          </p>
        </div>
        <button
          onClick={() => setShowNutrition(!showNutrition)}
          style={{
            background: showNutrition
              ? 'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)'
              : 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '10px',
            padding: '8px 12px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          🥗 Nutrition
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', padding: '12px 24px', gap: '8px' }}>
        {[
          { id: 'browse', label: 'Browse', icon: '📖' },
          {
            id: 'favorites',
            label: `Favorites (${favoriteRecipes.length})`,
            icon: '❤️',
          },
          { id: 'suggestions', label: 'AI Suggestions', icon: '🤖' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: 'none',
              background:
                activeTab === tab.id
                  ? 'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)'
                  : 'rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: activeTab === tab.id ? '600' : '400',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      {activeTab === 'browse' && (
        <div
          style={{
            padding: '0 24px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recipes..."
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              color: 'white',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                flex: 1,
                padding: '10px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.85rem',
              }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              style={{
                flex: 1,
                padding: '10px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.85rem',
              }}
            >
              <option value="All">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
        {activeTab === 'browse' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '12px',
            }}
          >
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => setSelectedRecipe(recipe)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '16px',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    fontSize: '3rem',
                    textAlign: 'center',
                    marginBottom: '12px',
                  }}
                >
                  {recipe.image}
                </div>
                <div
                  style={{
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    marginBottom: '4px',
                  }}
                >
                  {recipe.name}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '8px',
                  }}
                >
                  {recipe.category}
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: '600',
                      background: getDifficultyColor(recipe.difficulty),
                      textTransform: 'uppercase',
                    }}
                  >
                    {recipe.difficulty}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#ffd700' }}>
                    ⭐ {recipe.rating}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(recipe.id);
                  }}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                  }}
                >
                  {recipe.favorite ? '❤️' : '🤍'}
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'favorites' &&
          (favoriteRecipes.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '48px',
                color: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>❤️</div>
              <div>No favorite recipes yet</div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: '12px',
              }}
            >
              {favoriteRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  onClick={() => setSelectedRecipe(recipe)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '16px',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      fontSize: '3rem',
                      textAlign: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    {recipe.image}
                  </div>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                    {recipe.name}
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                    }}
                  >
                    {recipe.prepTime + recipe.cookTime} min
                  </div>
                </div>
              ))}
            </div>
          ))}

        {activeTab === 'suggestions' && (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {aiSuggestions.map((suggestion, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '16px',
                }}
              >
                <div
                  style={{
                    fontWeight: '600',
                    fontSize: '1rem',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span>🤖</span> {suggestion.title}
                </div>
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '12px',
                  }}
                >
                  {suggestion.reason}
                </div>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
                  {suggestion.recipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      onClick={() => setSelectedRecipe(recipe)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '12px',
                        minWidth: '120px',
                        textAlign: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>
                        {recipe.image}
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: '500' }}>
                        {recipe.name}
                      </div>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: 'rgba(255, 255, 255, 0.5)',
                        }}
                      >
                        {recipe.calories} cal
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recipe Modal */}
      {selectedRecipe && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
          onClick={() => setSelectedRecipe(null)}
        >
          <div
            style={{
              background: 'rgba(26, 26, 46, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              padding: '24px',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '8px' }}>
                {selectedRecipe.image}
              </div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.3rem' }}>
                {selectedRecipe.name}
              </h3>
              <div
                style={{
                  fontSize: '0.85rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                }}
              >
                {selectedRecipe.category}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '8px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1rem', fontWeight: '700' }}>
                  {selectedRecipe.prepTime}
                </div>
                <div
                  style={{
                    fontSize: '0.65rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  Prep
                </div>
              </div>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '8px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1rem', fontWeight: '700' }}>
                  {selectedRecipe.cookTime}
                </div>
                <div
                  style={{
                    fontSize: '0.65rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  Cook
                </div>
              </div>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '8px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1rem', fontWeight: '700' }}>
                  {selectedRecipe.servings}
                </div>
                <div
                  style={{
                    fontSize: '0.65rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  Serve
                </div>
              </div>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '8px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: getDifficultyColor(selectedRecipe.difficulty),
                  }}
                >
                  {selectedRecipe.difficulty.charAt(0).toUpperCase()}
                </div>
                <div
                  style={{
                    fontSize: '0.65rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  Level
                </div>
              </div>
            </div>

            {showNutrition && (
              <div
                style={{
                  background: 'rgba(102, 126, 234, 0.1)',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    marginBottom: '8px',
                  }}
                >
                  Nutrition
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '8px',
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: '700',
                        color: '#ff6b6b',
                      }}
                    >
                      {selectedRecipe.calories}
                    </div>
                    <div
                      style={{
                        fontSize: '0.65rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                      }}
                    >
                      Cal
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: '700',
                        color: '#4ecdc4',
                      }}
                    >
                      {selectedRecipe.protein}g
                    </div>
                    <div
                      style={{
                        fontSize: '0.65rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                      }}
                    >
                      Protein
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: '700',
                        color: '#45b7d1',
                      }}
                    >
                      {selectedRecipe.carbs}g
                    </div>
                    <div
                      style={{
                        fontSize: '0.65rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                      }}
                    >
                      Carbs
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: '700',
                        color: '#f9ca24',
                      }}
                    >
                      {selectedRecipe.fat}g
                    </div>
                    <div
                      style={{
                        fontSize: '0.65rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                      }}
                    >
                      Fat
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  marginBottom: '8px',
                }}
              >
                Ingredients
              </div>
              {selectedRecipe.ingredients.map((ing, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: '0.8rem',
                    padding: '6px 0',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ color: 'colors.brand.primary' }}>•</span> {ing}
                </div>
              ))}
            </div>

            <div>
              <div
                style={{
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  marginBottom: '8px',
                }}
              >
                Instructions
              </div>
              {selectedRecipe.instructions.map((step, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: '0.8rem',
                    padding: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    marginBottom: '6px',
                    display: 'flex',
                    gap: '10px',
                  }}
                >
                  <span
                    style={{
                      background:
                        'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedRecipe(null)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.9rem',
                marginTop: '16px',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
