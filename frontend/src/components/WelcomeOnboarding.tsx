'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Users, MessageCircle, Search, Bell, Settings,
  Heart, Share2, Bookmark, TrendingUp, X, ArrowRight, ArrowLeft, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface WelcomeOnboardingProps {
  onComplete: () => void;
}

const onboardingSteps = [
  {
    icon: Users,
    title: 'Connect with Friends',
    description: 'Follow people you know and discover new connections based on your interests',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['Find friends by email', 'Get friend suggestions', 'Build your network'],
  },
  {
    icon: MessageCircle,
    title: 'Share Your Moments',
    description: 'Post photos, videos, and thoughts. Express yourself in your own unique way',
    gradient: 'from-purple-500 to-pink-500',
    features: ['Upload photos & videos', 'Write posts', 'Share stories'],
  },
  {
    icon: Heart,
    title: 'Engage & Interact',
    description: 'Like, comment, and share posts from people you follow. Start conversations',
    gradient: 'from-rose-500 to-red-500',
    features: ['Like posts', 'Leave comments', 'Share with friends'],
  },
  {
    icon: Bell,
    title: 'Stay Updated',
    description: 'Get notifications about activity on your posts and updates from friends',
    gradient: 'from-amber-500 to-orange-500',
    features: ['Real-time notifications', 'Never miss updates', 'Customizable alerts'],
  },
  {
    icon: TrendingUp,
    title: 'Discover Trending',
    description: 'Explore what\'s popular, discover new content, and stay in the loop',
    gradient: 'from-green-500 to-emerald-500',
    features: ['Trending topics', 'Popular posts', 'Personalized feed'],
  },
];

export default function WelcomeOnboarding({ onComplete }: WelcomeOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setIsVisible(true);
    } else {
      onComplete();
    }
  }, [onComplete]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');

    // Fire confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 300);
  };

  const handleSkip = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  const step = onboardingSteps[currentStep];
  const Icon = step.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && handleSkip()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full p-8 md:p-12 relative overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>

          {/* Progress indicator */}
          <div className="flex gap-2 mb-8">
            {onboardingSteps.map((_, index) => (
              <motion.div
                key={index}
                className={`h-2 rounded-full flex-1 transition-all duration-300 ${
                  index === currentStep
                    ? `bg-gradient-to-r ${step.gradient}`
                    : index < currentStep
                    ? 'bg-green-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: index * 0.1 }}
              />
            ))}
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
                className={`w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg`}
              >
                <Icon className="w-12 h-12 text-white" />
              </motion.div>

              {/* Title */}
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {step.title}
              </h2>

              {/* Description */}
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                {step.description}
              </p>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {step.features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-center gap-3 text-left max-w-md mx-auto"
                  >
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center flex-shrink-0`}>
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {feature}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-6 py-3 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-0 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            <div className="flex items-center gap-2">
              {currentStep < onboardingSteps.length - 1 && (
                <button
                  onClick={handleSkip}
                  className="px-6 py-3 rounded-xl font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Skip
                </button>
              )}

              <button
                onClick={handleNext}
                className={`px-8 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all flex items-center gap-2 bg-gradient-to-r ${step.gradient}`}
              >
                {currentStep === onboardingSteps.length - 1 ? (
                  <>
                    Get Started
                    <Sparkles className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step indicator */}
          <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
            {currentStep + 1} of {onboardingSteps.length}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
