import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';

interface ClippyEyesProps {
  mood: 'happy' | 'thinking' | 'surprised' | 'sleeping' | 'wink' | 'normal';
  size?: number;
}

export function ClippyEyes({ mood, size = 1 }: ClippyEyesProps) {
  const [lookDir, setLookDir] = useState({ x: 0, y: 0 });
  const leftEyeCtrl = useAnimation();
  const rightEyeCtrl = useAnimation();

  // Random eye movement (looking around)
  useEffect(() => {
    if (mood === 'sleeping') return;
    const interval = setInterval(() => {
      const x = (Math.random() - 0.5) * 3;
      const y = (Math.random() - 0.5) * 2;
      setLookDir({ x, y });
    }, 2000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [mood]);

  // Blinking
  useEffect(() => {
    if (mood === 'sleeping') return;
    const blink = async () => {
      await Promise.all([
        leftEyeCtrl.start({ scaleY: 0.05, transition: { duration: 0.08 } }),
        rightEyeCtrl.start({ scaleY: 0.05, transition: { duration: 0.08 } }),
      ]);
      await Promise.all([
        leftEyeCtrl.start({ scaleY: 1, transition: { duration: 0.08 } }),
        rightEyeCtrl.start({ scaleY: 1, transition: { duration: 0.08 } }),
      ]);
    };
    const interval = setInterval(blink, 2500 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, [leftEyeCtrl, rightEyeCtrl, mood]);

  // Wink effect
  useEffect(() => {
    if (mood === 'wink') {
      rightEyeCtrl.start({ scaleY: 0.05, transition: { duration: 0.1 } });
      const timer = setTimeout(() => {
        rightEyeCtrl.start({ scaleY: 1, transition: { duration: 0.1 } });
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [mood, rightEyeCtrl]);

  const eyeSize = 10 * size;
  const pupilSize = 4.5 * size;
  const eyeSpacing = 14 * size;

  const getMouthPath = () => {
    switch (mood) {
      case 'happy':
        return `M ${-5 * size} ${8 * size} Q ${0} ${14 * size} ${5 * size} ${8 * size}`;
      case 'surprised':
        return `M ${-3 * size} ${10 * size} Q ${0} ${14 * size} ${3 * size} ${10 * size}`;
      case 'thinking':
        return `M ${-4 * size} ${10 * size} Q ${-2 * size} ${8 * size} ${4 * size} ${11 * size}`;
      case 'sleeping':
        return `M ${-4 * size} ${10 * size} L ${4 * size} ${10 * size}`;
      default:
        return `M ${-4 * size} ${9 * size} Q ${0} ${12 * size} ${4 * size} ${9 * size}`;
    }
  };

  return (
    <svg
      width={40 * size}
      height={30 * size}
      viewBox={`${-20 * size} ${-8 * size} ${40 * size} ${30 * size}`}
      className="pointer-events-none"
    >
      {/* Left eye */}
      <motion.g animate={leftEyeCtrl} style={{ transformOrigin: `${-eyeSpacing / 2}px 0px` }}>
        <ellipse
          cx={-eyeSpacing / 2}
          cy={0}
          rx={eyeSize / 2}
          ry={mood === 'surprised' ? eyeSize / 1.6 : eyeSize / 2}
          fill="white"
          stroke="#555"
          strokeWidth={0.8 * size}
        />
        <motion.circle
          cx={-eyeSpacing / 2}
          cy={0}
          r={pupilSize / 2}
          fill="#1a1a2e"
          animate={{ cx: -eyeSpacing / 2 + lookDir.x, cy: lookDir.y }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
        {/* Eye shine */}
        <circle
          cx={-eyeSpacing / 2 + 1.5 * size}
          cy={-1.5 * size}
          r={1.2 * size}
          fill="white"
          opacity={0.8}
        />
      </motion.g>

      {/* Right eye */}
      <motion.g animate={rightEyeCtrl} style={{ transformOrigin: `${eyeSpacing / 2}px 0px` }}>
        <ellipse
          cx={eyeSpacing / 2}
          cy={0}
          rx={eyeSize / 2}
          ry={mood === 'surprised' ? eyeSize / 1.6 : eyeSize / 2}
          fill="white"
          stroke="#555"
          strokeWidth={0.8 * size}
        />
        <motion.circle
          cx={eyeSpacing / 2}
          cy={0}
          r={pupilSize / 2}
          fill="#1a1a2e"
          animate={{ cx: eyeSpacing / 2 + lookDir.x, cy: lookDir.y }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
        <circle
          cx={eyeSpacing / 2 + 1.5 * size}
          cy={-1.5 * size}
          r={1.2 * size}
          fill="white"
          opacity={0.8}
        />
      </motion.g>

      {/* Eyebrows */}
      {mood === 'thinking' && (
        <>
          <line
            x1={-eyeSpacing / 2 - 4 * size}
            y1={-7 * size}
            x2={-eyeSpacing / 2 + 4 * size}
            y2={-8 * size}
            stroke="#555"
            strokeWidth={1.2 * size}
            strokeLinecap="round"
          />
          <line
            x1={eyeSpacing / 2 - 4 * size}
            y1={-9 * size}
            x2={eyeSpacing / 2 + 4 * size}
            y2={-6 * size}
            stroke="#555"
            strokeWidth={1.2 * size}
            strokeLinecap="round"
          />
        </>
      )}
      {mood === 'surprised' && (
        <>
          <line
            x1={-eyeSpacing / 2 - 4 * size}
            y1={-9 * size}
            x2={-eyeSpacing / 2 + 4 * size}
            y2={-9 * size}
            stroke="#555"
            strokeWidth={1.2 * size}
            strokeLinecap="round"
          />
          <line
            x1={eyeSpacing / 2 - 4 * size}
            y1={-9 * size}
            x2={eyeSpacing / 2 + 4 * size}
            y2={-9 * size}
            stroke="#555"
            strokeWidth={1.2 * size}
            strokeLinecap="round"
          />
        </>
      )}

      {/* Mouth */}
      <motion.path
        d={getMouthPath()}
        fill="none"
        stroke="#555"
        strokeWidth={1.2 * size}
        strokeLinecap="round"
        initial={false}
        animate={{ d: getMouthPath() }}
        transition={{ duration: 0.3 }}
      />

      {/* Sleeping eyes (closed) */}
      {mood === 'sleeping' && (
        <>
          <line
            x1={-eyeSpacing / 2 - 4 * size}
            y1={0}
            x2={-eyeSpacing / 2 + 4 * size}
            y2={0}
            stroke="#555"
            strokeWidth={1.5 * size}
            strokeLinecap="round"
          />
          <line
            x1={eyeSpacing / 2 - 4 * size}
            y1={0}
            x2={eyeSpacing / 2 + 4 * size}
            y2={0}
            stroke="#555"
            strokeWidth={1.5 * size}
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}
