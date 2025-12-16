'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import {
  ShoppingCart,
  Search,
  Filter,
  Star,
  TrendingUp,
  Heart,
  Share2,
} from 'lucide-react';
import CartSidebar from './CartSidebar';
import CheckoutPage from './CheckoutPage';
import ProductDetailPage from './ProductDetailPage';
import { PRODUCTS as SAMPLE_PRODUCTS, CATEGORIES } from '@/data/products';
import HoverCard3D from './3d/HoverCard3D';

/* OLD PRODUCT DATA REMOVED - NOW IMPORTED FROM /src/data/products.ts */

export default function ShopPage() {
  const colors = useThemeColors();
  const { addToCart, totalItems } = useCart();
  const { t, language } = useLanguage();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products] = useState(SAMPLE_PRODUCTS);
  const [searchPatterns, setSearchPatterns] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<
    (typeof SAMPLE_PRODUCTS)[0] | null
  >(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState<
    'featured' | 'price-low' | 'price-high' | 'rating'
  >('featured');

  useEffect(() => {
    setIsClient(true);
    // Load search patterns from localStorage
    const saved = localStorage.getItem('search-patterns');
    if (saved) {
      setSearchPatterns(JSON.parse(saved));
    }
  }, []);

  // Track search patterns for AI/ML
  const trackSearch = (query: string) => {
    if (query.trim()) {
      const newPatterns = [query, ...searchPatterns.slice(0, 99)];
      setSearchPatterns(newPatterns);
      localStorage.setItem('search-patterns', JSON.stringify(newPatterns));

      // In production, send to analytics/ML service
    }
  };

  // Get search suggestions
  const getSuggestions = () => {
    if (!searchQuery) return [];

    const suggestions = products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.nameHi.includes(searchQuery) ||
          p.namePa.includes(searchQuery)
      )
      .map((p) => getProductName(p))
      .slice(0, 5);

    return [...new Set(suggestions)]; // Remove duplicates
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchQuery === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.nameHi.includes(searchQuery) ||
      product.namePa.includes(searchQuery);

    const matchesCategory =
      selectedCategory === 'all' ||
      product.category === selectedCategory ||
      (selectedCategory === 'trending' && product.trending);

    return matchesSearch && matchesCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0; // Featured - keep original order
    }
  });

  const handleAddToCart = (product: (typeof SAMPLE_PRODUCTS)[0]) => {
    addToCart({
      id: product.id,
      name:
        language === 'hi'
          ? product.nameHi
          : language === 'pa'
            ? product.namePa
            : product.name,
      price: product.price,
      image: product.image,
    });
    toast.success('Added to cart! 🛒');
  };

  const getProductName = (product: (typeof SAMPLE_PRODUCTS)[0]) => {
    if (language === 'hi') return product.nameHi;
    if (language === 'pa') return product.namePa;
    return product.name;
  };

  const getProductDescription = (product: (typeof SAMPLE_PRODUCTS)[0]) => {
    if (language === 'hi') return product.descriptionHi;
    if (language === 'pa') return product.descriptionPa;
    return product.description;
  };

  const getCategoryName = (category: (typeof CATEGORIES)[0]) => {
    if (language === 'hi') return category.nameHi;
    if (language === 'pa') return category.namePa;
    return category.name;
  };

  // Show product detail if product is selected
  if (selectedProduct) {
    return (
      <ProductDetailPage
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
      />
    );
  }

  // Show checkout if user clicked checkout
  if (showCheckout) {
    return <CheckoutPage onBack={() => setShowCheckout(false)} />;
  }

  return (
    <section
      id="shop"
      data-route="shop"
      className="active animate-fade-in"
      style={{ position: 'relative' }}
    >
      <div
        className="container"
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '2rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <h1
              className="animate-fade-in-down"
              style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }}
            >
              {isClient
                ? language === 'hi'
                  ? 'दुकान'
                  : language === 'pa'
                    ? 'ਦੁਕਾਨ'
                    : 'Shop'
                : 'Shop'}
            </h1>

            {/* Cart Button - Enhanced with gradient */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="btn-gradient hover-lift transition-smooth focus-ring animate-slide-in-right"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 600,
                position: 'relative',
              }}
            >
              <ShoppingCart size={20} />
              <span>
                {isClient
                  ? language === 'hi'
                    ? 'कार्ट'
                    : language === 'pa'
                      ? 'ਕਾਰਟ'
                      : 'Cart'
                  : 'Cart'}
              </span>
              {totalItems > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: 'colors.status.error',
                    color: 'white',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {totalItems}
                </span>
              )}
            </button>
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <Search
              size={20}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--muted)',
                zIndex: 1,
              }}
            />
            <input
              type="text"
              className="input-enhanced transition-smooth"
              placeholder={
                isClient
                  ? language === 'hi'
                    ? 'उत्पाद खोजें...'
                    : language === 'pa'
                      ? 'ਉਤਪਾਦ ਖੋਜੋ...'
                      : 'Search products...'
                  : 'Search products...'
              }
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 200);
                trackSearch(searchQuery);
              }}
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3rem',
                fontSize: '1rem',
              }}
            />

            {/* Search Suggestions */}
            {showSuggestions && searchQuery && getSuggestions().length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  marginTop: '0.5rem',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  zIndex: 1000,
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}
              >
                {getSuggestions().map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSearchQuery(suggestion);
                      setShowSuggestions(false);
                    }}
                    style={{
                      padding: '0.875rem 1rem',
                      cursor: 'pointer',
                      borderBottom:
                        index < getSuggestions().length - 1
                          ? '1px solid var(--border)'
                          : 'none',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        'rgba(102, 126, 234, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Search size={16} color="var(--muted)" />
                      <span style={{ color: 'var(--fg)' }}>{suggestion}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Categories */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background:
                    selectedCategory === category.id
                      ? 'var(--accent)'
                      : 'var(--bg)',
                  color:
                    selectedCategory === category.id ? 'white' : 'var(--fg)',
                  border: `1px solid ${selectedCategory === category.id ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>{category.icon}</span>
                <span>
                  {isClient ? getCategoryName(category) : category.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Advertisement Banner - Enhanced with animations */}
        <div
          className="gradient-secondary elevation-3 animate-scale-in"
          style={{
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem',
            color: 'white',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2
              className="animate-bounce"
              style={{
                fontSize: '1.75rem',
                marginBottom: '0.5rem',
                fontWeight: 700,
              }}
            >
              {isClient
                ? language === 'hi'
                  ? '🎉 विशेष ऑफर - इलेक्ट्रॉनिक्स पर 50% तक की छूट!'
                  : language === 'pa'
                    ? "🎉 ਵਿਸ਼ੇਸ਼ ਪੇਸ਼ਕਸ਼ - ਇਲੈਕਟ੍ਰਾਨਿਕਸ 'ਤੇ 50% ਤੱਕ ਦੀ ਛੋਟ!"
                    : '🎉 Special Offer - Up to 50% Off on Electronics!'
                : '🎉 Special Offer - Up to 50% Off on Electronics!'}
            </h2>
            <p style={{ opacity: 0.9 }}>
              {isClient
                ? language === 'hi'
                  ? 'आज ही ऑर्डर करें और मुफ्त डिलीवरी पाएं'
                  : language === 'pa'
                    ? 'ਅੱਜ ਆਰਡਰ ਕਰੋ ਅਤੇ ਮੁਫਤ ਡਿਲਿਵਰੀ ਪ੍ਰਾਪਤ ਕਰੋ'
                    : 'Order today and get free delivery'
                : 'Order today and get free delivery'}
            </p>
          </div>
        </div>

        {/* Sort and Filter Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <p style={{ color: 'var(--muted)', margin: 0 }}>
            {sortedProducts.length}{' '}
            {isClient
              ? language === 'hi'
                ? 'उत्पाद मिले'
                : language === 'pa'
                  ? 'ਉਤਪਾਦ ਮਿਲੇ'
                  : 'products found'
              : 'products found'}
          </p>

          {/* Sort Dropdown */}
          <div style={{ position: 'relative' }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                padding: '0.75rem 2.5rem 0.75rem 1rem',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                background: 'var(--bg)',
                color: 'var(--fg)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                appearance: 'none',
              }}
            >
              <option value="featured">
                {isClient
                  ? language === 'hi'
                    ? 'विशेष रुप से प्रदर्शित'
                    : language === 'pa'
                      ? 'ਵਿਸ਼ੇਸ਼ ਰੂਪ'
                      : 'Featured'
                  : 'Featured'}
              </option>
              <option value="price-low">
                {isClient
                  ? language === 'hi'
                    ? 'कीमत: कम से अधिक'
                    : language === 'pa'
                      ? 'ਕੀਮਤ: ਘੱਟ ਤੋਂ ਵੱਧ'
                      : 'Price: Low to High'
                  : 'Price: Low to High'}
              </option>
              <option value="price-high">
                {isClient
                  ? language === 'hi'
                    ? 'कीमत: अधिक से कम'
                    : language === 'pa'
                      ? 'ਕੀਮਤ: ਵੱਧ ਤੋਂ ਘੱਟ'
                      : 'Price: High to Low'
                  : 'Price: High to Low'}
              </option>
              <option value="rating">
                {isClient
                  ? language === 'hi'
                    ? 'रेटिंग: उच्चतम'
                    : language === 'pa'
                      ? 'ਰੇਟਿੰਗ: ਸਭ ਤੋਂ ਉੱਚੀ'
                      : 'Rating: Highest'
                  : 'Rating: Highest'}
              </option>
            </select>
            <Filter
              size={16}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--muted)',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        {/* Products Grid - Enhanced with animations */}
        <div
          className="custom-scrollbar"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          {sortedProducts.map((product, index) => (
            <HoverCard3D
              key={product.id}
              intensity={10}
              glowColor="rgba(77, 171, 247, 0.2)"
              enableGlow
            >
              <div
                onClick={() => setSelectedProduct(product)}
                className="modern-card hover-lift transition-smooth focus-ring animate-fade-in-up"
                style={{
                  overflow: 'hidden',
                  cursor: 'pointer',
                  animationDelay: `${index * 0.05}s`,
                  animationFillMode: 'backwards',
                  position: 'relative',
                }}
              >
              {/* Product Image */}
              <div
                style={{
                  position: 'relative',
                  paddingTop: '100%',
                  background: 'colors.bg.tertiary',
                }}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {product.trending && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'colors.status.error',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <TrendingUp size={14} />
                    {isClient
                      ? language === 'hi'
                        ? 'ट्रेंडिंग'
                        : language === 'pa'
                          ? 'ਟ੍ਰੈਂਡਿੰਗ'
                          : 'Trending'
                      : 'Trending'}
                  </div>
                )}
                <button
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <Heart size={18} color="#666" />
                </button>
              </div>

              {/* Product Info */}
              <div style={{ padding: '1.25rem' }}>
                <h3
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                  }}
                >
                  {isClient ? getProductName(product) : product.name}
                </h3>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--muted)',
                    marginBottom: '0.75rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {isClient
                    ? getProductDescription(product)
                    : product.description}
                </p>

                {/* Brand */}
                {product.brand && (
                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--muted)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Brand: {product.brand}
                  </p>
                )}

                {/* Rating */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Star
                      size={16}
                      fill="colors.status.warning"
                      color="colors.status.warning"
                    />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      {product.rating}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
                    ({product.reviews}{' '}
                    {isClient
                      ? language === 'hi'
                        ? 'समीक्षाएं'
                        : language === 'pa'
                          ? 'ਸਮੀਖਿਆਵਾਂ'
                          : 'reviews'
                      : 'reviews'}
                    )
                  </span>
                </div>

                {/* Price */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '1rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: 'var(--accent)',
                    }}
                  >
                    ₹{product.price}
                  </span>
                  <span
                    style={{
                      fontSize: '1rem',
                      color: 'var(--muted)',
                      textDecoration: 'line-through',
                    }}
                  >
                    ₹{product.originalPrice}
                  </span>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      color: 'colors.status.success',
                      fontWeight: 600,
                    }}
                  >
                    {Math.round(
                      (1 - product.price / product.originalPrice) * 100
                    )}
                    %{' '}
                    {isClient
                      ? language === 'hi'
                        ? 'छूट'
                        : language === 'pa'
                          ? 'ਛੋਟ'
                          : 'off'
                      : 'off'}
                  </span>
                </div>

                {/* Stock Status */}
                <div style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
                  {product.stock > 50 ? (
                    <span style={{ color: 'colors.status.success' }}>
                      ✓{' '}
                      {isClient
                        ? language === 'hi'
                          ? 'स्टॉक में'
                          : language === 'pa'
                            ? 'ਸਟਾਕ ਵਿੱਚ'
                            : 'In stock'
                        : 'In stock'}
                    </span>
                  ) : product.stock > 0 ? (
                    <span style={{ color: 'colors.status.warning' }}>
                      ⚠{' '}
                      {isClient
                        ? language === 'hi'
                          ? `केवल ${product.stock} बचे`
                          : language === 'pa'
                            ? `ਸਿਰਫ਼ ${product.stock} ਬਚੇ`
                            : `Only ${product.stock} left`
                        : `Only ${product.stock} left`}
                    </span>
                  ) : (
                    <span style={{ color: 'colors.status.error' }}>
                      ✗{' '}
                      {isClient
                        ? language === 'hi'
                          ? 'स्टॉक में नहीं'
                          : language === 'pa'
                            ? 'ਸਟਾਕ ਖਤਮ'
                            : 'Out of stock'
                        : 'Out of stock'}
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                  disabled={product.stock === 0}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    background: product.stock === 0 ? '#ccc' : 'var(--accent)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (product.stock > 0) {
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <ShoppingCart size={18} />
                  {isClient
                    ? language === 'hi'
                      ? 'कार्ट में जोड़ें'
                      : language === 'pa'
                        ? 'ਕਾਰਟ ਵਿੱਚ ਜੋੜੋ'
                        : 'Add to Cart'
                    : 'Add to Cart'}
                </button>
              </div>
            </div>
            </HoverCard3D>
          ))}
        </div>

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: 'var(--muted)',
            }}
          >
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              {isClient
                ? language === 'hi'
                  ? 'कोई उत्पाद नहीं मिला'
                  : language === 'pa'
                    ? 'ਕੋਈ ਉਤਪਾਦ ਨਹੀਂ ਮਿਲਿਆ'
                    : 'No products found'
                : 'No products found'}
            </h3>
            <p>
              {isClient
                ? language === 'hi'
                  ? 'अपनी खोज बदलने का प्रयास करें'
                  : language === 'pa'
                    ? 'ਆਪਣੀ ਖੋਜ ਬਦਲਣ ਦੀ ਕੋਸ਼ਿਸ਼ ਕਰੋ'
                    : 'Try changing your search or filters'
                : 'Try changing your search or filters'}
            </p>
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false);
          setShowCheckout(true);
        }}
      />
    </section>
  );
}
