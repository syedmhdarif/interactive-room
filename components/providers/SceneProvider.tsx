'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { HotspotConfig, SceneContextValue } from '@/types/scene';

const SceneContext = createContext<SceneContextValue | null>(null);

export function SceneProvider({ children }: { children: ReactNode }) {
  const [isLocked, setIsLocked] = useState(false);
  const [showProjectList, setShowProjectList] = useState(false);
  const [nearHotspot, setNearHotspot] = useState<HotspotConfig | null>(null);

  return (
    <SceneContext.Provider
      value={{
        isLocked,
        setIsLocked,
        showProjectList,
        setShowProjectList,
        nearHotspot,
        setNearHotspot,
      }}
    >
      {children}
    </SceneContext.Provider>
  );
}

export function useScene(): SceneContextValue {
  const ctx = useContext(SceneContext);
  if (!ctx) throw new Error('useScene must be used within SceneProvider');
  return ctx;
}
