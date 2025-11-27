'use client';

import { useEffect } from 'react';
import '@/lib/i18n/index'; // Initialize i18n system

export default function I18nInit() {
  useEffect(() => {
    // i18n is initialized by importing the module
    console.log('i18n system initialized');
  }, []);

  return null;
}