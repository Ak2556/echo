'use client';

import React from 'react';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartSidebar({
  isOpen,
  onClose,
  onCheckout,
}: CartSidebarProps) {
  const { cart, removeFromCart, updateQuantity, totalItems, totalPrice } =
    useCart();
  const { language } = useLanguage();

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        title: 'Shopping Cart',
        empty: 'Your cart is empty',
        emptyDesc: 'Add some products to get started',
        continueShopping: 'Continue Shopping',
        subtotal: 'Subtotal',
        shipping: 'Shipping',
        total: 'Total',
        checkout: 'Proceed to Checkout',
        remove: 'Remove',
        freeShipping: 'FREE',
        items: 'items',
      },
      hi: {
        title: 'शॉपिंग कार्ट',
        empty: 'आपकी कार्ट खाली है',
        emptyDesc: 'शुरू करने के लिए कुछ उत्पाद जोड़ें',
        continueShopping: 'खरीदारी जारी रखें',
        subtotal: 'उपयोग',
        shipping: 'शिपिंग',
        total: 'कुल',
        checkout: 'चेकआउट पर जाएं',
        remove: 'हटाएं',
        freeShipping: 'मुफ्त',
        items: 'आइटम',
      },
      pa: {
        title: 'ਸ਼ੌਪਿੰਗ ਕਾਰਟ',
        empty: 'ਤੁਹਾਡੀ ਕਾਰਟ ਖਾਲੀ ਹੈ',
        emptyDesc: 'ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਕੁਝ ਉਤਪਾਦ ਜੋੜੋ',
        continueShopping: 'ਖਰੀਦਦਾਰੀ ਜਾਰੀ ਰੱਖੋ',
        subtotal: 'ਉਪਯੋਗ',
        shipping: 'ਸ਼ਿਪਿੰਗ',
        total: 'ਕੁੱਲ',
        checkout: "ਚੈੱਕਆਉਟ 'ਤੇ ਜਾਓ",
        remove: 'ਹਟਾਓ',
        freeShipping: 'ਮੁਫਤ',
        items: 'ਆਈਟਮਾਂ',
      },
    };
    return translations[language]?.[key] || translations.en[key];
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 99998,
          animation: 'fadeIn 0.2s ease',
        }}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '450px',
          background: 'var(--bg)',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.3s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            <ShoppingBag size={24} color="var(--accent)" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
              {t('title')}
            </h2>
            {totalItems > 0 && (
              <span
                style={{
                  background: 'var(--accent)',
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {cart.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center',
                padding: '2rem',
              }}
            >
              <ShoppingBag
                size={64}
                color="var(--muted)"
                style={{ marginBottom: '1rem' }}
              />
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: 'var(--fg)',
                }}
              >
                {t('empty')}
              </h3>
              <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
                {t('emptyDesc')}
              </p>
              <button
                onClick={onClose}
                style={{
                  padding: '0.875rem 1.75rem',
                  background: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {t('continueShopping')}
              </button>
            </div>
          ) : (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {cart.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    padding: '1rem',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                  }}
                >
                  {/* Product Image */}
                  <div
                    style={{
                      position: 'relative',
                      width: '80px',
                      height: '80px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: '#f5f5f5',
                    }}
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="80px"
                    />
                  </div>

                  {/* Product Info */}
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <h4
                      style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}
                    >
                      {item.name}
                    </h4>
                    {item.variant && (
                      <p
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--muted)',
                          margin: 0,
                        }}
                      >
                        {item.variant}
                      </p>
                    )}

                    {/* Quantity Controls */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          overflow: 'hidden',
                        }}
                      >
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          style={{
                            width: '32px',
                            height: '32px',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Minus size={16} />
                        </button>
                        <span
                          style={{
                            minWidth: '40px',
                            textAlign: 'center',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                          }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          style={{
                            width: '32px',
                            height: '32px',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{
                          padding: '0.5rem',
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.875rem',
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Price */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '1.125rem',
                          fontWeight: 700,
                          color: 'var(--accent)',
                        }}
                      >
                        ₹{item.price * item.quantity}
                      </span>
                      <span
                        style={{ fontSize: '0.875rem', color: 'var(--muted)' }}
                      >
                        ₹{item.price} each
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Summary & Checkout */}
        {cart.length > 0 && (
          <div
            style={{
              padding: '1.5rem',
              borderTop: '1px solid var(--border)',
              background: 'var(--bg)',
            }}
          >
            {/* Summary */}
            <div style={{ marginBottom: '1rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                }}
              >
                <span style={{ color: 'var(--muted)' }}>{t('subtotal')}</span>
                <span style={{ fontWeight: 600 }}>₹{totalPrice}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                }}
              >
                <span style={{ color: 'var(--muted)' }}>{t('shipping')}</span>
                <span style={{ fontWeight: 600, color: '#22c55e' }}>
                  {t('freeShipping')}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border)',
                  marginTop: '0.5rem',
                }}
              >
                <span style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                  {t('total')}
                </span>
                <span
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: 'var(--accent)',
                  }}
                >
                  ₹{totalPrice}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={onCheckout}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.125rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 8px 24px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {t('checkout')}
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
