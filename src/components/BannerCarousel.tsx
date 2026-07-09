'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './BannerCarousel.module.css';

type Banner = {
  image: string;
  link: string;
};

export default function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoPlay = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000); // 4秒ごとにスライド
  };

  const stopAutoPlay = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    if (banners.length <= 1) return;
    startAutoPlay();
    return stopAutoPlay;
  }, [banners.length]);

  const handleDragStart = () => {
    setIsDragging(true);
    stopAutoPlay();
  };

  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    startAutoPlay();
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    } else if (info.offset.x > swipeThreshold) {
      setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    }
  };

  const getCardStyle = (index: number) => {
    const diff = (index - currentIndex + banners.length) % banners.length;
    // 0: Center, 1: Right, banners.length - 1: Left
    if (diff === 0) {
      return { x: '0%', scale: 1, zIndex: 3, opacity: 1 };
    } else if (diff === 1 || (banners.length === 2 && diff !== 0)) {
      return { x: '50%', scale: 0.8, zIndex: 2, opacity: 0.6 };
    } else if (diff === banners.length - 1) {
      return { x: '-50%', scale: 0.8, zIndex: 2, opacity: 0.6 };
    } else {
      return { x: '0%', scale: 0, zIndex: 1, opacity: 0 };
    }
  };

  if (banners.length === 0) return null;

  if (banners.length === 1) {
    return (
      <div className={styles.carouselContainer}>
        <div className={styles.singleBanner}>
          {banners[0].link ? (
            <a href={banners[0].link} target="_blank" rel="noopener noreferrer">
              <img src={banners[0].image} alt="Banner" className={styles.bannerImage} />
            </a>
          ) : (
            <img src={banners[0].image} alt="Banner" className={styles.bannerImage} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.carouselContainer}>
      <div className={styles.carouselTrack}>
        <AnimatePresence initial={false}>
          {banners.map((banner, index) => {
            const style = getCardStyle(index);
            return (
              <motion.div
                key={index}
                className={styles.bannerCard}
                initial={false}
                animate={{
                  x: style.x,
                  scale: style.scale,
                  zIndex: style.zIndex,
                  opacity: style.opacity
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onClick={() => {
                  if (!isDragging && index !== currentIndex) {
                    setCurrentIndex(index);
                    startAutoPlay();
                  }
                }}
              >
                {/* リンクが設定されていて、かつ中央（アクティブ）の場合のみクリック可能にする */}
                {banner.link && index === currentIndex ? (
                  <a href={banner.link} target="_blank" rel="noopener noreferrer" style={{ pointerEvents: isDragging ? 'none' : 'auto', display: 'block', height: '100%' }}>
                    <img src={banner.image} alt={`Banner ${index + 1}`} className={styles.bannerImage} draggable={false} />
                  </a>
                ) : (
                  <img src={banner.image} alt={`Banner ${index + 1}`} className={styles.bannerImage} draggable={false} />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {/* ページネーション（ドット） */}
      <div className={styles.pagination}>
        {banners.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === currentIndex ? styles.activeDot : ''}`}
            onClick={() => {
              setCurrentIndex(i);
              startAutoPlay();
            }}
          />
        ))}
      </div>
    </div>
  );
}
