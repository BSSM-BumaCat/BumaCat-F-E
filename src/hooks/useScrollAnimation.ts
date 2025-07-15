/**
 * 스크롤 기반 애니메이션 관리 Hook
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { ANIMATION_CONFIGS } from '../config';
import type { Direction } from '../types';

export interface UseScrollAnimationOptions {
  threshold?: number;
  showDirection?: Direction;
  hideDirection?: Direction;
  enabled?: boolean;
}

export interface UseScrollAnimationReturn {
  isVisible: boolean;
  scrollDirection: Direction;
  scrollTop: number;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

/**
 * 스크롤 방향에 따른 요소 표시/숨김 애니메이션 훅
 */
export const useScrollAnimation = (
  options: UseScrollAnimationOptions = {}
): UseScrollAnimationReturn => {
  const {
    threshold = ANIMATION_CONFIGS.scroll.threshold,
    showDirection = 'up',
    hideDirection = 'down',
    enabled = true
  } = options;

  const [isVisible, setIsVisible] = useState(true);
  const [scrollDirection, setScrollDirection] = useState<Direction>('up');
  const [scrollTop, setScrollTop] = useState(0);
  
  const lastScrollTopRef = useRef(0);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (!enabled) return;

    const target = e.target as HTMLDivElement;
    const currentScrollTop = target.scrollTop;
    
    setScrollTop(currentScrollTop);

    // 스크롤 방향 계산
    const scrollDifference = currentScrollTop - lastScrollTopRef.current;
    
    // 임계값보다 큰 스크롤만 처리
    if (Math.abs(scrollDifference) > threshold) {
      const newDirection: Direction = scrollDifference > 0 ? 'down' : 'up';
      setScrollDirection(newDirection);

      // 스크롤 중일 때는 타이머 취소
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }

      // 표시/숨김 결정
      if (newDirection === hideDirection) {
        setIsVisible(false);
      } else if (newDirection === showDirection) {
        setIsVisible(true);
      }

      lastScrollTopRef.current = currentScrollTop;
    }

    // 맨 위에 있을 때는 항상 표시
    if (currentScrollTop <= threshold * 2) {
      setIsVisible(true);
    }
  }, [enabled, threshold, showDirection, hideDirection]);

  // 맨 위에서 정지 상태 감지를 위한 별도 effect
  useEffect(() => {
    if (scrollTop <= threshold * 2) {
      // 기존 타이머 취소
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }

      // 3초 후 숨김
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    }
  }, [scrollTop, threshold]);

  // 초기 상태 설정
  useEffect(() => {
    if (!enabled) {
      setIsVisible(true);
    }
  }, [enabled]);

  // cleanup
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  return {
    isVisible,
    scrollDirection,
    scrollTop,
    handleScroll
  };
};