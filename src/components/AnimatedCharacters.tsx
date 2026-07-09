"use client";

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

/**
 * 1. チョキチョキ動くハサミキャラクター
 */
export function AnimatedScissors() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // スクロールに合わせて刃を開閉（0度〜15度）
  const leftBladeAngle = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.6, 0.8, 1], [0, -15, 0, -15, 0, -15]);
  const rightBladeAngle = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.6, 0.8, 1], [0, 15, 0, 15, 0, 15]);

  return (
    <div ref={ref} style={{ width: '120px', height: '150px', position: 'relative' }}>
      <motion.div
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ width: '100%', height: '100%' }}
      >
        <svg viewBox="0 0 100 150" width="100%" height="100%" style={{ overflow: 'visible' }}>
        {/* 手足 */}
        <path d="M 20 120 Q 10 140 0 135" stroke="#444" strokeWidth="3" fill="none" />
        <path d="M 80 120 Q 90 140 100 135" stroke="#444" strokeWidth="3" fill="none" />
        <path d="M 40 140 L 40 160" stroke="#444" strokeWidth="3" fill="none" />
        <path d="M 60 140 L 60 160" stroke="#444" strokeWidth="3" fill="none" />
        
        {/* 左刃 (ピボットは x=50, y=90) */}
        <motion.g style={{ originX: '50px', originY: '90px', rotate: leftBladeAngle }}>
          <path d="M 50 90 L 30 10 Q 40 5 50 90 Z" fill="url(#metalGrad)" />
          <circle cx="35" cy="115" r="15" fill="none" stroke="url(#metalGrad)" strokeWidth="6" />
          <path d="M 50 90 L 35 100" stroke="url(#metalGrad)" strokeWidth="6" />
        </motion.g>

        {/* 右刃 (ピボットは x=50, y=90) */}
        <motion.g style={{ originX: '50px', originY: '90px', rotate: rightBladeAngle }}>
          <path d="M 50 90 L 70 10 Q 60 5 50 90 Z" fill="url(#metalGrad)" />
          <circle cx="65" cy="115" r="15" fill="none" stroke="url(#metalGrad)" strokeWidth="6" />
          <path d="M 50 90 L 65 100" stroke="url(#metalGrad)" strokeWidth="6" />
        </motion.g>

        {/* 留め具（ピボット） */}
        <circle cx="50" cy="90" r="4" fill="#333" />

        {/* 目（可愛い表情） */}
        <circle cx="43" cy="70" r="2.5" fill="#222" />
        <circle cx="57" cy="70" r="2.5" fill="#222" />

        <defs>
          <linearGradient id="metalGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#dcdcdc" />
            <stop offset="50%" stopColor="#f0f0f0" />
            <stop offset="100%" stopColor="#b0b0b0" />
          </linearGradient>
        </defs>
      </svg>
      </motion.div>
    </div>
  );
}

/**
 * 2. くるくる回るサインポールキャラクター
 */
export function AnimatedSignPole() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // 中の模様を上下に移動させて回転しているような錯覚を作る
  const stripeY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <div ref={ref} style={{ width: '80px', height: '160px', position: 'relative' }}>
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        style={{ width: '100%', height: '100%' }}
      >
        <svg viewBox="0 0 60 160" width="100%" height="100%" style={{ overflow: 'visible' }}>
        {/* 手足 */}
        <path d="M 10 90 Q -5 100 -10 90" stroke="#444" strokeWidth="3" fill="none" />
        <path d="M 50 90 Q 65 100 70 90" stroke="#444" strokeWidth="3" fill="none" />
        <path d="M 20 140 L 20 160" stroke="#444" strokeWidth="3" fill="none" />
        <path d="M 40 140 L 40 160" stroke="#444" strokeWidth="3" fill="none" />

        {/* ポール土台と天井 */}
        <rect x="5" y="10" width="50" height="15" rx="3" fill="url(#metalGrad)" />
        <rect x="5" y="125" width="50" height="15" rx="3" fill="url(#metalGrad)" />
        
        {/* ガラス筒の中のストライプ（クリッピングマスク） */}
        <defs>
          <clipPath id="glassClip">
            <rect x="15" y="25" width="30" height="100" />
          </clipPath>
          <linearGradient id="metalGrad2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#silver" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#999999" />
          </linearGradient>
        </defs>

        <rect x="15" y="25" width="30" height="100" fill="#fff" />
        
        <g clipPath="url(#glassClip)">
          <motion.g style={{ y: stripeY }}>
            {/* 縞模様を連続して描画 (縦に十分長く) */}
            {[...Array(6)].map((_, i) => (
              <g key={i} transform={`translate(0, ${i * -30})`}>
                <polygon points="15,40 45,10 45,25 15,55" fill="#D32F2F" />
                <polygon points="15,55 45,25 45,40 15,70" fill="#1976D2" />
              </g>
            ))}
          </motion.g>
        </g>

        {/* ガラスの反射ハイライト */}
        <rect x="15" y="25" width="30" height="100" fill="url(#glassHighlight)" opacity="0.6" />
        <defs>
          <linearGradient id="glassHighlight" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="20%" stopColor="rgba(255,255,255,0.8)" />
            <stop offset="40%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* ガラス筒の枠線 */}
        <rect x="15" y="25" width="30" height="100" fill="none" stroke="url(#metalGrad2)" strokeWidth="2" />

        {/* 目（ポールの中央あたりに浮遊） */}
        <circle cx="25" cy="75" r="2.5" fill="#222" />
        <circle cx="35" cy="75" r="2.5" fill="#222" />
      </svg>
      </motion.div>
    </div>
  );
}

/**
 * 3. ペコリとお辞儀するシェーバー（両刃カミソリ）キャラクター
 */
export function AnimatedShaver() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"]
  });

  // スクロールに合わせて頭部を前に倒す（お辞儀 0度〜35度）
  const bowAngle = useTransform(scrollYProgress, [0, 1], [0, 35]);

  return (
    <div ref={ref} style={{ width: '100px', height: '140px', position: 'relative' }}>
      <motion.div
        animate={{ y: [-3, 3, -3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        style={{ width: '100%', height: '100%' }}
      >
        <svg viewBox="0 0 80 140" width="100%" height="100%" style={{ overflow: 'visible' }}>
        
        {/* 手足 */}
        <path d="M 25 80 Q 5 90 -5 80" stroke="#444" strokeWidth="3" fill="none" />
        <path d="M 55 80 Q 75 90 85 80" stroke="#444" strokeWidth="3" fill="none" />
        <path d="M 30 120 L 30 140" stroke="#444" strokeWidth="3" fill="none" />
        <path d="M 50 120 L 50 140" stroke="#444" strokeWidth="3" fill="none" />

        {/* ボディ（木目調） */}
        <rect x="35" y="40" width="10" height="80" rx="3" fill="url(#woodGrad)" />
        
        {/* 頭部（金属）お辞儀アニメーション (ピボットは首の付け根 x=40, y=40) */}
        <motion.g style={{ originX: '40px', originY: '40px', rotate: bowAngle }}>
          <rect x="25" y="15" width="30" height="25" rx="5" fill="url(#metalGrad3)" />
          <rect x="20" y="25" width="40" height="5" rx="2" fill="#555" /> {/* 刃の部分 */}
          
          {/* 目（顔） */}
          <circle cx="33" cy="22" r="2" fill="#222" />
          <circle cx="47" cy="22" r="2" fill="#222" />
          <path d="M 38 27 Q 40 29 42 27" fill="none" stroke="#222" strokeWidth="1" /> {/* 笑顔 */}
        </motion.g>

        <defs>
          <linearGradient id="woodGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8D6E63" />
            <stop offset="30%" stopColor="#A1887F" />
            <stop offset="70%" stopColor="#6D4C41" />
            <stop offset="100%" stopColor="#5D4037" />
          </linearGradient>
          <linearGradient id="metalGrad3" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#dcdcdc" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#999999" />
          </linearGradient>
        </defs>
      </svg>
      </motion.div>
    </div>
  );
}
