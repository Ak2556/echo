'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowLeft, Star, ShoppingCart, Minus, Plus, Truck, Shield, RotateCcw, Heart, Share2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  nameHi: string;
  namePa: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  rating: number;
  reviews: number;
  stock: number;
  description: string;
  descriptionHi: string;
  descriptionPa: string;
  specifications?: { key: string; value: string; keyHi?: string; valuePa?: string }[];
  relatedProducts?: string[];
}

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onProductClick?: (productId: string) => void;
}

// Mock reviews data
const MOCK_REVIEWS = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    nameHi: 'राजेश कुमार',
    namePa: 'ਰਾਜੇਸ਼ ਕੁਮਾਰ',
    rating: 5,
    date: '2025-09-15',
    comment: 'Excellent quality! Fresh and delivered on time.',
    commentHi: 'उत्कृष्ट गुणवत्ता! ताज़ा और समय पर वितरित।',
    commentPa: 'ਸ਼ਾਨਦਾਰ ਗੁਣਵੱਤਾ! ਤਾਜ਼ਾ ਅਤੇ ਸਮੇਂ ਸਿਰ ਡਿਲਿਵਰ ਕੀਤਾ।'
  },
  {
    id: 2,
    name: 'Priya Singh',
    nameHi: 'प्रिया सिंह',
    namePa: 'ਪ੍ਰਿਆ ਸਿੰਘ',
    rating: 4,
    date: '2025-09-10',
    comment: 'Good product, value for money. Will order again!',
    commentHi: 'अच्छा उत्पाद, पैसे की कीमत। फिर से ऑर्डर करूंगी!',
    commentPa: 'ਵਧੀਆ ਉਤਪਾਦ, ਪੈਸੇ ਦੀ ਕੀਮਤ। ਦੁਬਾਰਾ ਆਰਡਰ ਕਰਾਂਗੀ!'
  },
  {
    id: 3,
    name: 'Harpreet Kaur',
    nameHi: 'हरप्रीत कौर',
    namePa: 'ਹਰਪ੍ਰੀਤ ਕੌਰ',
    rating: 5,
    date: '2025-09-05',
    comment: 'Very fresh and organic. Highly recommend!',
    commentHi: 'बहुत ताज़ा और जैविक। अत्यधिक अनुशंसित!',
    commentPa: 'ਬਹੁਤ ਤਾਜ਼ਾ ਅਤੇ ਜੈਵਿਕ। ਬਹੁਤ ਸਿਫਾਰਸ਼ ਕੀਤੀ!'
  }
];

export default function ProductDetailPage({ product, onBack, onProductClick }: ProductDetailPageProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { language } = useLanguage();
  const { colorMode } = useTheme();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const inWishlist = isInWishlist(product.id);

  const toggleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: getName(),
        price: product.price,
        image: product.images[0]
      });
    }
  };

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        backToShop: 'Back to Shop',
        inStock: 'In Stock',
        outOfStock: 'Out of Stock',
        addToCart: 'Add to Cart',
        addedToCart: 'Added to Cart!',
        quantity: 'Quantity',
        description: 'Description',
        specifications: 'Specifications',
        reviews: 'Reviews',
        relatedProducts: 'Related Products',
        freeShipping: 'Free Shipping on orders above ₹500',
        securePayment: 'Secure Payment',
        easyReturns: '7-Day Easy Returns',
        shareProduct: 'Share Product',
        addToWishlist: 'Add to Wishlist',
      },
      hi: {
        backToShop: 'दुकान पर वापस जाएं',
        inStock: 'स्टॉक में उपलब्ध',
        outOfStock: 'स्टॉक में नहीं',
        addToCart: 'कार्ट में जोड़ें',
        addedToCart: 'कार्ट में जोड़ा गया!',
        quantity: 'मात्रा',
        description: 'विवरण',
        specifications: 'विशेषताएं',
        reviews: 'समीक्षा',
        relatedProducts: 'संबंधित उत्पाद',
        freeShipping: '₹500 से अधिक के ऑर्डर पर मुफ्त शिपिंग',
        securePayment: 'सुरक्षित भुगतान',
        easyReturns: '7-दिन आसान रिटर्न',
        shareProduct: 'उत्पाद साझा करें',
        addToWishlist: 'विशलिस्ट में जोड़ें',
      },
      pa: {
        backToShop: 'ਦੁਕਾਨ \'ਤੇ ਵਾਪਸ ਜਾਓ',
        inStock: 'ਸਟਾਕ ਵਿੱਚ ਉਪਲਬਧ',
        outOfStock: 'ਸਟਾਕ ਵਿੱਚ ਨਹੀਂ',
        addToCart: 'ਕਾਰਟ ਵਿੱਚ ਜੋੜੋ',
        addedToCart: 'ਕਾਰਟ ਵਿੱਚ ਜੋੜਿਆ ਗਿਆ!',
        quantity: 'ਮਾਤਰਾ',
        description: 'ਵੇਰਵਾ',
        specifications: 'ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ',
        reviews: 'ਸਮੀਖਿਆਵਾਂ',
        relatedProducts: 'ਸੰਬੰਧਿਤ ਉਤਪਾਦ',
        freeShipping: '₹500 ਤੋਂ ਵੱਧ ਦੇ ਆਰਡਰਾਂ \'ਤੇ ਮੁਫਤ ਸ਼ਿਪਿੰਗ',
        securePayment: 'ਸੁਰੱਖਿਅਤ ਭੁਗਤਾਨ',
        easyReturns: '7-ਦਿਨ ਆਸਾਨ ਰਿਟਰਨ',
        shareProduct: 'ਉਤਪਾਦ ਸਾਂਝਾ ਕਰੋ',
        addToWishlist: 'ਵਿਸ਼ਲਿਸਟ ਵਿੱਚ ਜੋੜੋ',
      }
    };
    return translations[language]?.[key] || translations.en[key];
  };

  const getName = () => {
    switch (language) {
      case 'hi': return product.nameHi;
      case 'pa': return product.namePa;
      default: return product.name;
    }
  };

  const getDescription = () => {
    switch (language) {
      case 'hi': return product.descriptionHi;
      case 'pa': return product.descriptionPa;
      default: return product.description;
    }
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: getName(),
        price: product.price,
        image: product.images[0]
      });
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <section style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      padding: '2rem 1rem',
      position: 'relative'
    }}>
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          background: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          color: 'var(--fg)',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: '2rem',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--accent)';
          e.currentTarget.style.color = 'white';
          e.currentTarget.style.borderColor = 'var(--accent)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--fg)';
          e.currentTarget.style.borderColor = 'var(--border)';
        }}
      >
        <ArrowLeft size={20} />
        {t('backToShop')}
      </button>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
          gap: '3rem'
        }}>
          {/* Product Images */}
          <div>
            {/* Main Image */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '500px',
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#f5f5f5',
              marginBottom: '1rem'
            }}>
              <Image
                src={product.images[selectedImage]}
                alt={getName()}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>

            {/* Image Thumbnails */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              overflowX: 'auto',
              paddingBottom: '0.5rem'
            }}>
              {product.images.map((image, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  style={{
                    position: 'relative',
                    width: '80px',
                    height: '80px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: selectedImage === index ? '3px solid var(--accent)' : '1px solid var(--border)',
                    flexShrink: 0,
                    transition: 'all 0.2s'
                  }}
                >
                  <Image
                    src={image}
                    alt={`${getName()} - ${index + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="80px"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 700,
              marginBottom: '1rem',
              color: 'var(--fg)'
            }}>
              {getName()}
            </h1>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    fill={i < Math.floor(product.rating) ? '#fbbf24' : 'none'}
                    color="#fbbf24"
                  />
                ))}
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 600 }}>{product.rating}</span>
              <span style={{ color: 'var(--muted)' }}>({product.reviews} {t('reviews')})</span>
            </div>

            {/* Price */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent)' }}>
                  ₹{product.price}
                </span>
                {product.originalPrice && (
                  <span style={{
                    fontSize: '1.5rem',
                    color: 'var(--muted)',
                    textDecoration: 'line-through'
                  }}>
                    ₹{product.originalPrice}
                  </span>
                )}
                {product.originalPrice && (
                  <span style={{
                    padding: '4px 12px',
                    background: '#22c55e',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}>
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div style={{ marginBottom: '1.5rem' }}>
              {product.stock > 0 ? (
                <span style={{ color: '#22c55e', fontWeight: 600, fontSize: '1rem' }}>
                  ✓ {t('inStock')} ({product.stock} available)
                </span>
              ) : (
                <span style={{ color: '#ef4444', fontWeight: 600, fontSize: '1rem' }}>
                  ✗ {t('outOfStock')}
                </span>
              )}
            </div>

            {/* Quantity Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                {t('quantity')}
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '2px solid var(--border)',
                borderRadius: '10px',
                width: 'fit-content'
              }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    width: '48px',
                    height: '48px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Minus size={20} />
                </button>
                <span style={{
                  minWidth: '60px',
                  textAlign: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 700
                }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  style={{
                    width: '48px',
                    height: '48px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: addedToCart ? '#22c55e' : 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                  opacity: product.stock === 0 ? 0.5 : 1
                }}
              >
                <ShoppingCart size={20} />
                {addedToCart ? t('addedToCart') : t('addToCart')}
              </button>

              <button
                onClick={toggleWishlist}
                style={{
                  width: '56px',
                  height: '56px',
                  background: inWishlist ? '#fef2f2' : 'transparent',
                  border: `2px solid ${inWishlist ? '#ef4444' : 'var(--border)'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#ef4444';
                  e.currentTarget.style.background = '#fef2f2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = inWishlist ? '#ef4444' : 'var(--border)';
                  e.currentTarget.style.background = inWishlist ? '#fef2f2' : 'transparent';
                }}
              >
                <Heart size={24} fill={inWishlist ? '#ef4444' : 'none'} color="#ef4444" />
              </button>

              <button
                style={{
                  width: '56px',
                  height: '56px',
                  background: 'transparent',
                  border: '2px solid var(--border)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                <Share2 size={24} />
              </button>
            </div>

            {/* Trust Badges */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                padding: '1rem',
                background: colorMode === 'dark' ? 'rgba(102, 126, 234, 0.1)' : '#f8f9ff',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <Truck size={24} color="var(--accent)" style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: 0 }}>
                  {t('freeShipping')}
                </p>
              </div>

              <div style={{
                padding: '1rem',
                background: colorMode === 'dark' ? 'rgba(102, 126, 234, 0.1)' : '#f8f9ff',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <Shield size={24} color="var(--accent)" style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: 0 }}>
                  {t('securePayment')}
                </p>
              </div>

              <div style={{
                padding: '1rem',
                background: colorMode === 'dark' ? 'rgba(102, 126, 234, 0.1)' : '#f8f9ff',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <RotateCcw size={24} color="var(--accent)" style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: 0 }}>
                  {t('easyReturns')}
                </p>
              </div>
            </div>

            {/* Description */}
            <div style={{
              padding: '1.5rem',
              background: colorMode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f9fafb',
              borderRadius: '12px',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
                {t('description')}
              </h3>
              <p style={{ color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>
                {getDescription()}
              </p>
            </div>

            {/* Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <div style={{
                padding: '1.5rem',
                background: colorMode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f9fafb',
                borderRadius: '12px'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
                  {t('specifications')}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {product.specifications.map((spec, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingBottom: '0.75rem',
                        borderBottom: index < product.specifications!.length - 1 ? '1px solid var(--border)' : 'none'
                      }}
                    >
                      <span style={{ color: 'var(--muted)', fontWeight: 600 }}>{spec.key}</span>
                      <span style={{ color: 'var(--fg)' }}>{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Reviews */}
            <div style={{
              padding: '1.5rem',
              background: colorMode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f9fafb',
              borderRadius: '12px',
              marginTop: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                  {t('reviews')} ({MOCK_REVIEWS.length})
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ display: 'flex' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        fill={i < Math.floor(product.rating) ? '#fbbf24' : 'none'}
                        color="#fbbf24"
                      />
                    ))}
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>{product.rating}</span>
                </div>
              </div>

              {/* Reviews List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {MOCK_REVIEWS.map((review) => (
                  <div
                    key={review.id}
                    style={{
                      padding: '1rem',
                      background: 'var(--bg)',
                      borderRadius: '8px',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                          {language === 'hi' ? review.nameHi : language === 'pa' ? review.namePa : review.name}
                        </div>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={i < review.rating ? '#fbbf24' : 'none'}
                              color="#fbbf24"
                            />
                          ))}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
                        {new Date(review.date).toLocaleDateString(
                          language === 'hi' ? 'hi-IN' : language === 'pa' ? 'pa-IN' : 'en-US',
                          { year: 'numeric', month: 'short', day: 'numeric' }
                        )}
                      </span>
                    </div>
                    <p style={{ color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
                      {language === 'hi' ? review.commentHi : language === 'pa' ? review.commentPa : review.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
