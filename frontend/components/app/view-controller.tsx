'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { ConnectionState } from 'livekit-client';
import { AnimatePresence, motion } from 'motion/react';
import { useSessionContext } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { AgentSessionView_01 } from '@/components/agents-ui/blocks/agent-session-view-01';
import { MicPermissionModal } from '@/components/app/mic-permission-modal';
import { WelcomeView } from '@/components/app/welcome-view';

const MotionWelcomeView = motion.create(WelcomeView);
const MotionSessionView = motion.create(AgentSessionView_01);

const VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
    },
    hidden: {
      opacity: 0,
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.5,
    ease: 'linear',
  },
};

interface ViewControllerProps {
  appConfig: AppConfig;
}

export function ViewController({ appConfig }: ViewControllerProps) {
  const { isConnected, connectionState, start } = useSessionContext();
  const isConnecting = connectionState === ConnectionState.Connecting;
  const isDisconnected = connectionState === ConnectionState.Disconnected;
  const { resolvedTheme } = useTheme();
  const [micErrorOpen, setMicErrorOpen] = useState(false);
  const [hasHadSession, setHasHadSession] = useState(false);

  useEffect(() => {
    if (isConnected) {
      setHasHadSession(true);
    }
  }, [isConnected]);

  const handleStartCall = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      setMicErrorOpen(false);
      start();
    } catch (err: unknown) {
      console.error('Microphone permission error:', err);
      const errorObj = err as { name?: string; message?: string };
      if (
        errorObj?.name === 'NotAllowedError' ||
        errorObj?.name === 'PermissionDeniedError' ||
        errorObj?.message?.includes('Permission denied') ||
        errorObj?.message?.includes('NotAllowedError')
      ) {
        setMicErrorOpen(true);
      } else {
        start();
      }
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {/* Welcome & Pre-connect / Ended views */}
        {!isConnected && (
          <MotionWelcomeView
            key="welcome"
            {...VIEW_MOTION_PROPS}
            startButtonText={appConfig.startButtonText}
            onStartCall={handleStartCall}
            isConnecting={isConnecting}
            isDisconnected={isDisconnected}
            hasEnded={hasHadSession && isDisconnected}
          />
        )}
        {/* Session view */}
        {isConnected && (
          <MotionSessionView
            key="session-view"
            {...VIEW_MOTION_PROPS}
            supportsChatInput={appConfig.supportsChatInput}
            supportsVideoInput={appConfig.supportsVideoInput}
            supportsScreenShare={appConfig.supportsScreenShare}
            isPreConnectBufferEnabled={appConfig.isPreConnectBufferEnabled}
            audioVisualizerType={appConfig.audioVisualizerType}
            audioVisualizerColor={
              resolvedTheme === 'dark'
                ? appConfig.audioVisualizerColorDark
                : appConfig.audioVisualizerColor
            }
            audioVisualizerColorShift={appConfig.audioVisualizerColorShift}
            audioVisualizerBarCount={appConfig.audioVisualizerBarCount}
            audioVisualizerGridRowCount={appConfig.audioVisualizerGridRowCount}
            audioVisualizerGridColumnCount={appConfig.audioVisualizerGridColumnCount}
            audioVisualizerRadialBarCount={appConfig.audioVisualizerRadialBarCount}
            audioVisualizerRadialRadius={appConfig.audioVisualizerRadialRadius}
            audioVisualizerWaveLineWidth={appConfig.audioVisualizerWaveLineWidth}
            className="fixed inset-0"
          />
        )}
      </AnimatePresence>

      {/* Step 4: Microphone Permission Error Modal */}
      <MicPermissionModal
        isOpen={micErrorOpen}
        onClose={() => setMicErrorOpen(false)}
        onRetry={handleStartCall}
      />
    </>
  );
}
