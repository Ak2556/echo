'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from 'framer-motion';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  ArrowRight,
  Check,
  Heart,
  Music,
  Camera,
  Book,
  Gamepad,
  Coffee,
  PartyPopper,
  Eye,
  EyeOff,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { useThemeColors } from '@/hooks/useThemeColors';

type Step = 'welcome' | 'account' | 'personalize' | 'success';

const interests = [
  { icon: Heart, label: 'Lifestyle', color: 'from-pink-500 to-rose-500' },
  { icon: Music, label: 'Music', color: 'from-purple-500 to-indigo-500' },
  { icon: Camera, label: 'Photography', color: 'from-blue-500 to-cyan-500' },
  { icon: Book, label: 'Reading', color: 'from-amber-500 to-orange-500' },
  { icon: Gamepad, label: 'Gaming', color: 'from-green-500 to-emerald-500' },
  {
    icon: Coffee,
    label: 'Food & Drink',
    color: 'from-yellow-500 to-amber-500',
  },
];

export default function SignupExperiencePage() {
  const colors = useThemeColors();
  const router = useRouter();
  const [step, setStep] = useState<Step>('welcome');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    interests: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      size: number;
      duration: number;
      delay: number;
    }>
  >([]);

  const { scrollY } = useScroll();
  const parallaxY1 = useTransform(scrollY, [0, 500], [0, 150]);
  const parallaxY2 = useTransform(scrollY, [0, 500], [0, -100]);

  // Set mounted state after component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Mouse tracking for interactive background
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  // Create particle burst effect on click
  const createParticleBurst = (e: React.MouseEvent) => {
    if (!mounted) return;

    const x = e.clientX;
    const y = e.clientY;

    confetti({
      particleCount: 40,
      spread: 70,
      origin: {
        x: x / window.innerWidth,
        y: y / window.innerHeight,
      },
      colors: [
        colors.brand.primary,
        colors.brand.secondary,
        colors.brand.secondary,
        colors.status.warning,
      ],
      ticks: 100,
      gravity: 1.2,
      decay: 0.94,
      startVelocity: 25,
    });
  };

  // Epic confetti celebration
  const fireConfetti = () => {
    const duration = 4000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 80,
      zIndex: 9999,
    };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    // Initial burst from center
    confetti({
      particleCount: 200,
      spread: 160,
      origin: { y: 0.6 },
      colors: [
        colors.brand.primary,
        colors.brand.secondary,
        colors.brand.secondary,
        colors.status.warning,
        colors.status.warning,
      ],
      ticks: 120,
    });

    // Side bursts after 200ms
    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 60,
        spread: 80,
        origin: { x: 0, y: 0.6 },
        colors: [
          colors.brand.primary,
          colors.brand.secondary,
          colors.brand.secondary,
        ],
      });
      confetti({
        particleCount: 100,
        angle: 120,
        spread: 80,
        origin: { x: 1, y: 0.6 },
        colors: [
          colors.status.warning,
          colors.status.warning,
          colors.brand.secondary,
        ],
      });
    }, 200);

    // Continuous rain effect
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: [colors.brand.primary, colors.brand.secondary],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: [colors.status.warning, colors.status.warning],
      });
    }, 250);
  };

  const handleRegisterAndLogin = async () => {
    // Validate form data
    if (!formData.full_name.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!formData.password) {
      toast.error('Please enter a password');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumbers = /\d/.test(formData.password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      toast.error(
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      );
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Register
      console.log('Step 1: Registering user...');
      const registerResponse = await fetch(
        'http://localhost:8000/api/auth/register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            full_name: formData.full_name,
          }),
        }
      );

      const registerData = await registerResponse.json();
      console.log('Registration response:', registerData);

      if (!registerResponse.ok) {
        // Handle different error formats
        let errorMessage = 'Registration failed';

        if (registerResponse.status === 409) {
          errorMessage = 'An account with this email already exists';
        } else if (registerResponse.status === 422) {
          errorMessage = 'Invalid input data. Please check your information';
        } else if (typeof registerData.detail === 'string') {
          errorMessage = registerData.detail;
        } else if (Array.isArray(registerData.detail)) {
          // Pydantic validation errors
          errorMessage = registerData.detail
            .map((err: any) => err.msg)
            .join(', ');
        } else if (registerData.message) {
          errorMessage = registerData.message;
        }

        throw new Error(errorMessage);
      }

      // Step 2: Auto-verify (using any code since it's a demo)
      console.log('Step 2: Verifying email...');
      const verifyResponse = await fetch(
        'http://localhost:8000/api/auth/verify-email',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            code: '123456',
          }),
        }
      );

      const verifyData = await verifyResponse.json();
      console.log('Verification response:', verifyData);

      if (!verifyResponse.ok) {
        throw new Error(
          'Email verification failed: ' + (verifyData.detail || 'Unknown error')
        );
      }

      // Step 3: Auto-login
      console.log('Step 3: Logging in...');
      const loginResponse = await fetch(
        'http://localhost:8000/api/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            remember_me: true,
          }),
        }
      );

      const loginData = await loginResponse.json();
      console.log('Login response:', loginData);

      if (!loginResponse.ok) {
        throw new Error(
          'Auto-login failed: ' + (loginData.detail || 'Unknown error')
        );
      }

      // Store tokens and user data with interests
      localStorage.setItem('access_token', loginData.access_token);
      localStorage.setItem('refresh_token', loginData.refresh_token);
      localStorage.setItem(
        'user',
        JSON.stringify({
          ...loginData.user,
          interests: formData.interests,
        })
      );

      // Move to personalization step
      toast.success('Account created successfully!');
      setIsLoading(false);
      setStep('personalize');
    } catch (error: any) {
      console.error('Registration error:', error);

      // Show user-friendly error message
      let errorMessage = 'Registration failed. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      } else if (
        error.name === 'TypeError' &&
        error.message.includes('fetch')
      ) {
        errorMessage =
          'Unable to connect to server. Please check your internet connection.';
      }

      toast.error(errorMessage, {
        duration: 4000,
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#fff',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 8px 32px rgba(239, 68, 68, 0.4)',
        },
      });
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    setStep('success');
    fireConfetti();

    setTimeout(() => {
      router.push('/');
    }, 3000);
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const stepVariants = {
    enter: {
      opacity: 0,
      x: 50,
      scale: 0.95,
      rotateY: 15,
    },
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
      rotateY: 0,
    },
    exit: {
      opacity: 0,
      x: -50,
      scale: 0.95,
      rotateY: -15,
    },
  };

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
          success: {
            iconTheme: {
              primary: colors.status.success,
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: colors.status.error,
              secondary: '#fff',
            },
          },
        }}
      />

      <div
        className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.15), transparent 50%), linear-gradient(135deg, #faf5ff 0%, #fdf4ff 25%, #fce7f3 50%, #fef3c7 75%, #fef9c3 100%)`,
        }}
      >
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full bg-gradient-to-br from-violet-400/40 to-fuchsia-400/40 backdrop-blur-sm"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, Math.random() * 20 - 10, 0],
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Parallax Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            style={{ y: parallaxY1 }}
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-violet-400/30 to-fuchsia-400/30 rounded-full blur-3xl"
          />
          <motion.div
            style={{ y: parallaxY2 }}
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-10 right-10 w-[32rem] h-[32rem] bg-gradient-to-br from-pink-400/30 to-rose-400/30 rounded-full blur-3xl"
          />
          <motion.div
            style={{ y: parallaxY1 }}
            animate={{
              scale: [1, 1.3, 1],
              rotate: [180, 270, 180],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl"
          />
        </div>

        <div className="w-full max-w-2xl relative z-10">
          {/* Enhanced Progress indicator */}
          {step !== 'welcome' && step !== 'success' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center justify-center gap-3">
                {['account', 'personalize'].map((s, i) => {
                  const isActive =
                    ['account', 'personalize'].indexOf(step) >= i;
                  return (
                    <motion.div key={s} className="relative">
                      <motion.div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          isActive
                            ? 'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 w-32 shadow-lg shadow-violet-500/50'
                            : 'bg-gray-300 dark:bg-gray-700 w-20'
                        }`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{
                          delay: i * 0.15,
                          type: 'spring',
                          stiffness: 100,
                        }}
                      />
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400"
                          animate={{
                            opacity: [0.5, 0, 0.5],
                            scale: [1, 1.5, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center mt-3 text-sm font-medium text-violet-600 dark:text-violet-400"
              >
                Step {['account', 'personalize'].indexOf(step) + 1} of 2
              </motion.p>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* Welcome Step */}
            {step === 'welcome' && (
              <motion.div
                key="welcome"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.6, type: 'spring', stiffness: 80 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="mb-8 relative"
                  onClick={createParticleBurst}
                >
                  <div className="w-28 h-28 mx-auto bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-violet-500/50 relative overflow-hidden cursor-pointer">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{
                        x: ['-100%', '200%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                    />
                    <Sparkles className="w-14 h-14 text-white relative z-10" />
                  </div>
                  <motion.div
                    className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-400 to-fuchsia-400"
                    animate={{
                      opacity: [0, 0.5, 0],
                      scale: [1, 1.2, 1.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                  />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent"
                >
                  Welcome to Echo
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-xl mx-auto leading-relaxed"
                >
                  Join millions connecting, sharing, and discovering amazing
                  content
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-5"
                >
                  <motion.button
                    onClick={(e) => {
                      createParticleBurst(e);
                      setStep('account');
                    }}
                    className="group relative px-10 py-5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white rounded-2xl font-semibold text-lg shadow-lg transition-all duration-300 flex items-center gap-3 mx-auto overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{
                        x: ['-100%', '200%'],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 0.5,
                      }}
                    />
                    <span className="relative z-10">Get Started</span>
                    <ArrowRight className="w-5 h-5 relative z-10" />
                  </motion.button>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-sm text-gray-500 dark:text-gray-400"
                  >
                    Already have an account?{' '}
                    <a
                      href="/auth/login-experience"
                      className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 font-semibold transition-colors"
                    >
                      Sign in
                    </a>
                  </motion.p>
                </motion.div>
              </motion.div>
            )}

            {/* Account Creation Step */}
            {step === 'account' && (
              <motion.div
                key="account"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.6, type: 'spring', stiffness: 80 }}
                className="relative"
              >
                {/* Animated gradient border */}
                <motion.div
                  className="absolute -inset-1 rounded-3xl opacity-75 blur"
                  animate={{
                    backgroundImage: [
                      'linear-gradient(0deg, #8b5cf6, #d946ef, #ec4899)',
                      'linear-gradient(90deg, #d946ef, #ec4899, #8b5cf6)',
                      'linear-gradient(180deg, #ec4899, #8b5cf6, #d946ef)',
                      'linear-gradient(270deg, #8b5cf6, #d946ef, #ec4899)',
                      'linear-gradient(360deg, #d946ef, #ec4899, #8b5cf6)',
                    ],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                />

                <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 md:p-10">
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="relative w-18 h-18 mx-auto mb-4"
                    >
                      <div className="w-18 h-18 mx-auto bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/50">
                        <User className="w-9 h-9 text-white" />
                      </div>
                      <motion.div
                        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-400 to-fuchsia-400"
                        animate={{
                          opacity: [0, 0.5, 0],
                          scale: [1, 1.3, 1.6],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeOut',
                        }}
                      />
                    </motion.div>
                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2"
                    >
                      Create Your Account
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-gray-600 dark:text-gray-400"
                    >
                      Let's get you started in seconds
                    </motion.p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleRegisterAndLogin();
                    }}
                    className="space-y-6"
                  >
                    {/* Full Name Input */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                          <User className="w-5 h-5 text-violet-500" />
                        </div>
                        <input
                          type="text"
                          value={formData.full_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              full_name: e.target.value,
                            })
                          }
                          className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 outline-none transition-all"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                    </motion.div>

                    {/* Email Input */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                          <Mail className="w-5 h-5 text-violet-500" />
                        </div>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 outline-none transition-all"
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                    </motion.div>

                    {/* Password Input */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                          <Lock className="w-5 h-5 text-violet-500" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          className="w-full pl-12 pr-12 py-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 outline-none transition-all"
                          placeholder="••••••••"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-violet-500 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-2 text-xs text-gray-500 dark:text-gray-400"
                      >
                        At least 6 characters
                      </motion.p>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={
                        !formData.full_name ||
                        !formData.email ||
                        !formData.password ||
                        isLoading
                      }
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="group relative w-full py-5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{
                          x: ['-100%', '200%'],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          repeatDelay: 0.5,
                        }}
                      />
                      {isLoading ? (
                        <div className="relative z-10 flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Creating account...</span>
                        </div>
                      ) : (
                        <>
                          <span className="relative z-10">Continue</span>
                          <ArrowRight className="w-5 h-5 relative z-10" />
                        </>
                      )}
                    </motion.button>
                  </form>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400"
                  >
                    Already have an account?{' '}
                    <a
                      href="/auth/login-experience"
                      className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 font-semibold transition-colors"
                    >
                      Sign in
                    </a>
                  </motion.p>
                </div>
              </motion.div>
            )}

            {/* Personalization Step */}
            {step === 'personalize' && (
              <motion.div
                key="personalize"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.6, type: 'spring', stiffness: 80 }}
                className="relative"
              >
                {/* Animated gradient border */}
                <motion.div
                  className="absolute -inset-1 rounded-3xl opacity-75 blur"
                  animate={{
                    backgroundImage: [
                      'linear-gradient(0deg, #f59e0b, #f97316, #ef4444)',
                      'linear-gradient(90deg, #f97316, #ef4444, #f59e0b)',
                      'linear-gradient(180deg, #ef4444, #f59e0b, #f97316)',
                      'linear-gradient(270deg, #f59e0b, #f97316, #ef4444)',
                      'linear-gradient(360deg, #f97316, #ef4444, #f59e0b)',
                    ],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                />

                <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 md:p-10">
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="relative w-18 h-18 mx-auto mb-4"
                    >
                      <div className="w-18 h-18 mx-auto bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/50">
                        <Sparkles className="w-9 h-9 text-white" />
                      </div>
                      <motion.div
                        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400"
                        animate={{
                          opacity: [0, 0.5, 0],
                          scale: [1, 1.3, 1.6],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeOut',
                        }}
                      />
                    </motion.div>
                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2"
                    >
                      What interests you?
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-gray-600 dark:text-gray-400"
                    >
                      Choose your interests to personalize your feed
                    </motion.p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {interests.map((interest, index) => {
                      const Icon = interest.icon;
                      const isSelected = formData.interests.includes(
                        interest.label
                      );

                      return (
                        <motion.button
                          key={interest.label}
                          initial={{ opacity: 0, y: 20, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{
                            delay: index * 0.1,
                            type: 'spring',
                            stiffness: 150,
                          }}
                          onClick={(e) => {
                            createParticleBurst(e);
                            toggleInterest(interest.label);
                          }}
                          type="button"
                          className={`relative p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                            isSelected
                              ? `bg-gradient-to-br ${interest.color} border-transparent text-white shadow-xl`
                              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800 hover:shadow-lg'
                          }`}
                        >
                          {isSelected && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                              animate={{
                                x: ['-100%', '200%'],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                repeatDelay: 1,
                              }}
                            />
                          )}
                          <motion.div
                            animate={
                              isSelected ? { rotate: [0, 10, -10, 0] } : {}
                            }
                            transition={{ duration: 0.5 }}
                          >
                            <Icon
                              className={`w-8 h-8 mx-auto mb-2 relative z-10 ${!isSelected && 'text-gray-600 dark:text-gray-400'}`}
                            />
                          </motion.div>
                          <p
                            className={`font-semibold relative z-10 ${!isSelected && 'text-gray-700 dark:text-gray-300'}`}
                          >
                            {interest.label}
                          </p>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: 'spring', stiffness: 300 }}
                              className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg z-10"
                            >
                              <Check className="w-4 h-4 text-green-500" />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  <motion.button
                    onClick={(e) => {
                      createParticleBurst(e);
                      handleComplete();
                    }}
                    disabled={formData.interests.length === 0}
                    className="group relative w-full py-5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{
                        x: ['-100%', '200%'],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 0.5,
                      }}
                    />
                    <span className="relative z-10">Complete Setup</span>
                    <Sparkles className="w-5 h-5 relative z-10" />
                  </motion.button>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4"
                  >
                    You can always change these later
                  </motion.p>
                </div>
              </motion.div>
            )}

            {/* Success Step */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
                className="text-center relative"
              >
                {/* Pulsing background rings */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-green-400/30"
                    initial={{ scale: 0, opacity: 0.8 }}
                    animate={{
                      scale: [0, 2.5, 3.5],
                      opacity: [0.8, 0.4, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.4,
                      ease: 'easeOut',
                    }}
                    style={{
                      width: '200px',
                      height: '200px',
                    }}
                  />
                ))}

                <motion.div
                  initial={{ scale: 0, rotate: -360 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
                  className="relative w-40 h-40 mx-auto mb-8"
                >
                  <div className="w-40 h-40 mx-auto bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/50 relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      animate={{
                        x: ['-100%', '200%'],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 0.3,
                      }}
                    />
                    <motion.div
                      animate={{
                        rotate: [0, 20, -20, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        repeatDelay: 2,
                      }}
                    >
                      <PartyPopper className="w-20 h-20 text-white relative z-10" />
                    </motion.div>
                  </div>
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-emerald-400"
                    animate={{
                      opacity: [0, 0.6, 0],
                      scale: [1, 1.3, 1.6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                  />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 bg-clip-text text-transparent"
                >
                  You're All Set!
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-2xl md:text-3xl text-gray-700 dark:text-gray-200 mb-4 font-semibold"
                >
                  Welcome to Echo, {formData.full_name}!
                </motion.p>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                  className="text-6xl mb-8"
                >
                  🎉
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-gray-600 dark:text-gray-300"
                >
                  <div className="flex items-center justify-center gap-3 mb-2">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-3 h-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                        animate={{
                          y: [0, -20, 0],
                          opacity: [1, 0.5, 1],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.15,
                          ease: 'easeInOut',
                        }}
                      />
                    ))}
                  </div>
                  <motion.p
                    animate={{
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="text-lg font-medium"
                  >
                    Taking you to your feed...
                  </motion.p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
