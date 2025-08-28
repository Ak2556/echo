'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowLeft, CreditCard, Truck, CheckCircle, Shield, Package } from 'lucide-react';

interface CheckoutPageProps {
  onBack: () => void;
}

// Declare Razorpay for TypeScript
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage({ onBack }: CheckoutPageProps) {
  const { cart, totalPrice, clearCart } = useCart();
  const { language } = useLanguage();
  const { colorMode } = useTheme();
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'razorpay'
  });

  const [orderId, setOrderId] = useState('');

  // Translations
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        title: 'Checkout',
        orderSummary: 'Order Summary',
        customerDetails: 'Customer Details',
        deliveryAddress: 'Delivery Address',
        paymentMethod: 'Payment Method',
        name: 'Full Name',
        email: 'Email',
        phone: 'Phone Number',
        address: 'Address',
        city: 'City',
        state: 'State',
        pincode: 'PIN Code',
        subtotal: 'Subtotal',
        delivery: 'Delivery',
        total: 'Total',
        placeOrder: 'Place Order',
        processing: 'Processing...',
        orderSuccess: 'Order Placed Successfully!',
        orderSuccessDesc: 'Thank you for your order. We will deliver it soon.',
        orderNumber: 'Order Number',
        continueShopping: 'Continue Shopping',
        backToCart: 'Back to Cart',
        free: 'FREE',
        required: 'Required field',
        securePayment: 'Secure Payment',
        fastDelivery: 'Fast Delivery',
        easyReturns: 'Easy Returns',
        razorpay: 'Credit/Debit Card (Razorpay)',
        cod: 'Cash on Delivery',
        upi: 'UPI Payment'
      },
      hi: {
        title: 'चेकआउट',
        orderSummary: 'ऑर्डर सारांश',
        customerDetails: 'ग्राहक विवरण',
        deliveryAddress: 'डिलीवरी पता',
        paymentMethod: 'भुगतान विधि',
        name: 'पूरा नाम',
        email: 'ईमेल',
        phone: 'फ़ोन नंबर',
        address: 'पता',
        city: 'शहर',
        state: 'राज्य',
        pincode: 'पिन कोड',
        subtotal: 'उपयोग',
        delivery: 'डिलीवरी',
        total: 'कुल',
        placeOrder: 'ऑर्डर करें',
        processing: 'प्रोसेस हो रहा है...',
        orderSuccess: 'ऑर्डर सफलतापूर्वक दिया गया!',
        orderSuccessDesc: 'आपके ऑर्डर के लिए धन्यवाद। हम जल्द ही इसे डिलीवर करेंगे।',
        orderNumber: 'ऑर्डर नंबर',
        continueShopping: 'खरीदारी जारी रखें',
        backToCart: 'कार्ट पर वापस जाएं',
        free: 'मुफ्त',
        required: 'आवश्यक फ़ील्ड',
        securePayment: 'सुरक्षित भुगतान',
        fastDelivery: 'त्वरित डिलीवरी',
        easyReturns: 'आसान रिटर्न',
        razorpay: 'क्रेडिट/डेबिट कार्ड (Razorpay)',
        cod: 'कैश ऑन डिलीवरी',
        upi: 'UPI भुगतान'
      },
      pa: {
        title: 'ਚੈੱਕਆਉਟ',
        orderSummary: 'ਆਰਡਰ ਸੰਖੇਪ',
        customerDetails: 'ਗਾਹਕ ਵੇਰਵਾ',
        deliveryAddress: 'ਡਿਲੀਵਰੀ ਪਤਾ',
        paymentMethod: 'ਭੁਗਤਾਨ ਵਿਧੀ',
        name: 'ਪੂਰਾ ਨਾਮ',
        email: 'ਈਮੇਲ',
        phone: 'ਫ਼ੋਨ ਨੰਬਰ',
        address: 'ਪਤਾ',
        city: 'ਸ਼ਹਿਰ',
        state: 'ਰਾਜ',
        pincode: 'ਪਿੰਨ ਕੋਡ',
        subtotal: 'ਉਪਯੋਗ',
        delivery: 'ਡਿਲੀਵਰੀ',
        total: 'ਕੁੱਲ',
        placeOrder: 'ਆਰਡਰ ਕਰੋ',
        processing: 'ਪ੍ਰੋਸੈਸ ਹੋ ਰਿਹਾ ਹੈ...',
        orderSuccess: 'ਆਰਡਰ ਸਫਲਤਾਪੂਰਵਕ ਦਿੱਤਾ ਗਿਆ!',
        orderSuccessDesc: 'ਤੁਹਾਡੇ ਆਰਡਰ ਲਈ ਧੰਨਵਾਦ। ਅਸੀਂ ਜਲਦੀ ਇਸਨੂੰ ਡਿਲੀਵਰ ਕਰਾਂਗੇ।',
        orderNumber: 'ਆਰਡਰ ਨੰਬਰ',
        continueShopping: 'ਖਰੀਦਦਾਰੀ ਜਾਰੀ ਰੱਖੋ',
        backToCart: 'ਕਾਰਟ \'ਤੇ ਵਾਪਸ ਜਾਓ',
        free: 'ਮੁਫਤ',
        required: 'ਲੋੜੀਂਦਾ ਖੇਤਰ',
        securePayment: 'ਸੁਰੱਖਿਅਤ ਭੁਗਤਾਨ',
        fastDelivery: 'ਤੇਜ਼ ਡਿਲੀਵਰੀ',
        easyReturns: 'ਆਸਾਨ ਰਿਟਰਨ',
        razorpay: 'ਕ੍ਰੈਡਿਟ/ਡੈਬਿਟ ਕਾਰਡ (Razorpay)',
        cod: 'ਕੈਸ਼ ਆਨ ਡਿਲੀਵਰੀ',
        upi: 'UPI ਭੁਗਤਾਨ'
      }
    };
    return translations[language]?.[key] || translations.en[key];
  };

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const required = ['name', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
    return required.every(field => formData[field as keyof typeof formData].trim() !== '');
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      alert(t('required'));
      return;
    }

    setLoading(true);

    // Generate order ID
    const newOrderId = 'ORD' + Date.now();
    setOrderId(newOrderId);

    if (formData.paymentMethod === 'razorpay') {
      // Razorpay integration
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_XXXXX', // Replace with your key
        amount: totalPrice * 100, // Amount in paise
        currency: 'INR',
        name: 'Echo Shop',
        description: 'Order Payment',
        order_id: newOrderId,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#667eea'
        },
        handler: function (response: any) {
          // Payment successful

          setStep('success');
          clearCart();
          setLoading(false);
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      if (typeof window !== 'undefined' && window.Razorpay) {
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        alert('Payment gateway not loaded. Please refresh and try again.');
        setLoading(false);
      }
    } else {
      // Cash on Delivery
      setTimeout(() => {
        setStep('success');
        clearCart();
        setLoading(false);
      }, 1500);
    }
  };

  // Success screen
  if (step === 'success') {
    return (
      <section id="checkout-success" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '3rem 2rem'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: '#22c55e',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <CheckCircle size={48} color="white" />
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', color: '#22c55e' }}>
            {t('orderSuccess')}
          </h1>
          <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
            {t('orderSuccessDesc')}
          </p>

          <div style={{
            background: colorMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '2rem'
          }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
              {t('orderNumber')}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'monospace' }}>
              {orderId}
            </div>
          </div>

          <button
            onClick={onBack}
            style={{
              padding: '1rem 2rem',
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {t('continueShopping')}
          </button>
        </div>
      </section>
    );
  }

  // Main checkout form
  return (
    <section id="checkout" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '1rem',
            color: 'var(--fg)'
          }}
        >
          <ArrowLeft size={20} />
          {t('backToCart')}
        </button>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>{t('title')}</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem', alignItems: 'start' }}>
        {/* Left Column - Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Customer Details */}
          <div style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
              {t('customerDetails')}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <input
                type="text"
                name="name"
                placeholder={t('name')}
                value={formData.name}
                onChange={handleInputChange}
                required
                style={{
                  padding: '0.875rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  background: 'var(--bg)',
                  color: 'var(--fg)',
                  gridColumn: '1 / -1'
                }}
              />
              <input
                type="email"
                name="email"
                placeholder={t('email')}
                value={formData.email}
                onChange={handleInputChange}
                required
                style={{
                  padding: '0.875rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  background: 'var(--bg)',
                  color: 'var(--fg)'
                }}
              />
              <input
                type="tel"
                name="phone"
                placeholder={t('phone')}
                value={formData.phone}
                onChange={handleInputChange}
                required
                style={{
                  padding: '0.875rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  background: 'var(--bg)',
                  color: 'var(--fg)'
                }}
              />
            </div>
          </div>

          {/* Delivery Address */}
          <div style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
              {t('deliveryAddress')}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <textarea
                name="address"
                placeholder={t('address')}
                value={formData.address}
                onChange={handleInputChange}
                required
                rows={3}
                style={{
                  padding: '0.875rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  background: 'var(--bg)',
                  color: 'var(--fg)',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input
                  type="text"
                  name="city"
                  placeholder={t('city')}
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  style={{
                    padding: '0.875rem',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: 'var(--bg)',
                    color: 'var(--fg)'
                  }}
                />
                <input
                  type="text"
                  name="state"
                  placeholder={t('state')}
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  style={{
                    padding: '0.875rem',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: 'var(--bg)',
                    color: 'var(--fg)'
                  }}
                />
              </div>
              <input
                type="text"
                name="pincode"
                placeholder={t('pincode')}
                value={formData.pincode}
                onChange={handleInputChange}
                required
                maxLength={6}
                style={{
                  padding: '0.875rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  background: 'var(--bg)',
                  color: 'var(--fg)',
                  maxWidth: '200px'
                }}
              />
            </div>
          </div>

          {/* Payment Method */}
          <div style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
              {t('paymentMethod')}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {['razorpay', 'cod', 'upi'].map((method) => (
                <label
                  key={method}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem',
                    border: `2px solid ${formData.paymentMethod === method ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={formData.paymentMethod === method}
                    onChange={handleInputChange}
                    style={{ cursor: 'pointer' }}
                  />
                  <CreditCard size={20} />
                  <span style={{ fontWeight: 500 }}>{t(method)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Trust Badges */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            padding: '1rem',
            background: colorMode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            borderRadius: '8px'
          }}>
            {[
              { icon: Shield, text: t('securePayment') },
              { icon: Truck, text: t('fastDelivery') },
              { icon: Package, text: t('easyReturns') }
            ].map((badge, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <badge.icon size={24} style={{ margin: '0 auto 0.5rem', color: 'var(--accent)' }} />
                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{badge.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div style={{
          position: 'sticky',
          top: '2rem',
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
            {t('orderSummary')}
          </h2>

          {/* Cart Items */}
          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
            {cart.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  marginBottom: '1rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid var(--border)'
                }}
              >
                <div style={{
                  position: 'relative',
                  width: '60px',
                  height: '60px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: '#f5f5f5'
                }}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="60px"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                    Qty: {item.quantity}
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent)' }}>
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--muted)' }}>{t('subtotal')}</span>
              <span style={{ fontWeight: 600 }}>₹{totalPrice}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--muted)' }}>{t('delivery')}</span>
              <span style={{ fontWeight: 600, color: '#22c55e' }}>{t('free')}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border)',
              marginTop: '0.5rem'
            }}>
              <span style={{ fontSize: '1.125rem', fontWeight: 700 }}>{t('total')}</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>
                ₹{totalPrice}
              </span>
            </div>
          </div>

          {/* Place Order Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              background: loading ? '#ccc' : 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1.125rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '1rem'
            }}
          >
            {loading ? t('processing') : t('placeOrder')}
          </button>
        </div>
      </div>
    </section>
  );
}
