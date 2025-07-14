/**
 * 검색 동작 관리 Hook
 */

import { useState, useRef, useCallback } from 'react';

export interface UseSearchBehaviorOptions {
  hideDelay?: number;
}

export interface UseSearchBehaviorReturn {
  isSearchVisible: boolean;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  showSearch: () => void;
  hideSearch: () => void;
}

/**
 * 검색바 표시/숨김 동작 관리 훅
 */
export const useSearchBehavior = (
  options: UseSearchBehaviorOptions = {}
): UseSearchBehaviorReturn => {
  const { hideDelay = 1000 } = options;
  
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const hideTimeoutRef = useRef<number | null>(null);

  // 검색바 표시
  const showSearch = useCallback(() => {
    // 기존 타이머가 있으면 취소
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setIsSearchVisible(true);
  }, []);

  // 검색바 숨김
  const hideSearch = useCallback(() => {
    setIsSearchVisible(false);
  }, []);

  // 마우스 진입 시
  const handleMouseEnter = useCallback(() => {
    showSearch();
  }, [showSearch]);

  // 마우스 떠날 시 (지연 후 숨김)
  const handleMouseLeave = useCallback(() => {
    hideTimeoutRef.current = window.setTimeout(() => {
      hideSearch();
    }, hideDelay);
  }, [hideSearch, hideDelay]);

  return {
    isSearchVisible,
    handleMouseEnter,
    handleMouseLeave,
    showSearch,
    hideSearch
  };
};