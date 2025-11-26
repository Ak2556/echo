'use client';

import React from 'react';
import MiniAppManager from './miniapps/MiniAppManager';

interface SimpleMiniAppsProps {
  activeApp: string | null;
  onClose: () => void;
}

export default function SimpleMiniApps({
  activeApp,
  onClose,
}: SimpleMiniAppsProps) {
  if (!activeApp) {
    return null;
  }

  // ALL apps are now routed through MiniAppManager for consistent dropdown rendering
  // MiniAppManager handles all 15 final mini apps + Tuition Marketplace
  return <MiniAppManager activeApp={activeApp} onClose={onClose} />;
}
