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
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // 터치 이벤트 관련 상태
  const touchStartYRef = useRef<number | null>(null);
  const isAtBottomRef = useRef(false);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (!enabled) return;

    const target = e.target as HTMLDivElement;
    const currentScrollTop = target.scrollTop;
    const maxScrollTop = target.scrollHeight - target.clientHeight;
    
    setScrollTop(currentScrollTop);

    // 맨 끝에 도달했는지 확인 (더 관대한 기준 적용)
    isAtBottomRef.current = currentScrollTop >= maxScrollTop - 50; // 50px 여유로 증가
    
    console.log('Scroll check:', { 
      currentScrollTop, 
      maxScrollTop, 
      diff: maxScrollTop - currentScrollTop,
      isAtBottom: isAtBottomRef.current 
    });

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

  // 터치 이벤트 핸들러들
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;
    touchStartYRef.current = e.touches[0]?.clientY || 0;
    console.log('Touch start:', touchStartYRef.current, 'isAtBottom:', isAtBottomRef.current);
  }, [enabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || touchStartYRef.current === null) return;

    const currentY = e.touches[0]?.clientY || 0;
    const deltaY = currentY - touchStartYRef.current;

    console.log('Touch move:', { currentY, deltaY, isAtBottom: isAtBottomRef.current });

    // 맨 위에서 더 위로 당기는 제스처 감지 (pull-to-refresh 스타일)
    const isAtTop = scrollTop <= 10; // 맨 위에 있는 상태
    
    if (isAtTop && deltaY > 30) {
      console.log('Show search bar from pull-to-refresh!', { scrollTop, deltaY });
      setIsVisible(true);
      
      // 터치 중에는 타이머 취소
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    }
  }, [enabled, scrollTop]);

  const handleTouchEnd = useCallback(() => {
    touchStartYRef.current = null;
    
    // 터치 종료 후 맨 위에 있으면 3초 타이머 설정
    if (scrollTop <= 10) {
      console.log('Setting 3s timer after touch end');
      hideTimeoutRef.current = setTimeout(() => {
        console.log('Hiding search bar after 3s (from touch end)');
        setIsVisible(false);
      }, 3000);
    }
  }, [scrollTop]);

  // 맨 위에서 정지 상태 감지를 위한 별도 effect
  useEffect(() => {
    console.log('useEffect triggered', { scrollTop, threshold, condition: scrollTop <= threshold * 2 });
    
    if (scrollTop <= threshold * 2) {
      // 기존 타이머 취소
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }

      console.log('Setting 3s timer to hide search bar');
      
      // 3초 후 숨김
      hideTimeoutRef.current = setTimeout(() => {
        console.log('Hiding search bar after 3s');
        setIsVisible(false);
      }, 3000);
    } else {
      // 맨 위가 아니면 타이머 취소
      if (hideTimeoutRef.current) {
        console.log('Clearing timer - not at top');
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    }
  }, [scrollTop, threshold]);

  // 초기 상태 설정
  useEffect(() => {
    if (!enabled) {
      setIsVisible(true);
    }
  }, [enabled]);

  // 터치 이벤트 리스너 등록
  useEffect(() => {
    if (!enabled) return;

    console.log('Setting up touch listeners');
    
    const options = { passive: false };
    document.addEventListener('touchstart', handleTouchStart, options);
    document.addEventListener('touchmove', handleTouchMove, options);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      console.log('Cleaning up touch listeners');
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

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