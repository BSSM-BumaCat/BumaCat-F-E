/**
 * 흔들기 애니메이션 관리 Hook
 */

import { useState, useRef, useCallback } from 'react';
import { ANIMATION_CONFIGS } from '../config';
// 필요한 타입만 import

export interface UseShakeAnimationOptions {
  duration?: number;
  autoReset?: boolean;
}

export interface UseShakeAnimationReturn {
  shakingItems: Set<string>;
  triggerShake: (id: string) => void;
  isShaking: (id: string) => boolean;
  resetShake: (id: string) => void;
  resetAll: () => void;
}

/**
 * 흔들기 애니메이션 상태 관리 훅
 */
export const useShakeAnimation = (
  options: UseShakeAnimationOptions = {}
): UseShakeAnimationReturn => {
  const {
    duration = ANIMATION_CONFIGS.shake.duration,
    autoReset = true
  } = options;

  const [shakingItems, setShakingItems] = useState<Set<string>>(new Set());
  const timeoutsRef = useRef<Map<string, number>>(new Map());

  // 흔들기 애니메이션 트리거
  const triggerShake = useCallback((id: string) => {
    // 기존 타이머가 있으면 취소
    const existingTimeout = timeoutsRef.current.get(id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      timeoutsRef.current.delete(id);
    }

    // 이미 흔들리고 있으면 강제 리셋 후 재시작
    if (shakingItems.has(id)) {
      setShakingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });

      // DOM 업데이트를 위한 짧은 지연
      setTimeout(() => {
        setShakingItems(prev => new Set(prev).add(id));
        
        if (autoReset) {
          const timeoutId = window.setTimeout(() => {
            setShakingItems(prev => {
              const newSet = new Set(prev);
              newSet.delete(id);
              return newSet;
            });
            timeoutsRef.current.delete(id);
          }, duration);
          
          timeoutsRef.current.set(id, timeoutId);
        }
      }, 10);
    } else {
      // 새로운 흔들기 시작
      setShakingItems(prev => new Set(prev).add(id));
      
      if (autoReset) {
        const timeoutId = window.setTimeout(() => {
          setShakingItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
          timeoutsRef.current.delete(id);
        }, duration);
        
        timeoutsRef.current.set(id, timeoutId);
      }
    }
  }, [shakingItems, duration, autoReset]);

  // 특정 아이템이 흔들리고 있는지 확인
  const isShaking = useCallback((id: string): boolean => {
    return shakingItems.has(id);
  }, [shakingItems]);

  // 특정 아이템 흔들기 중단
  const resetShake = useCallback((id: string) => {
    const timeoutId = timeoutsRef.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }
    
    setShakingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  // 모든 흔들기 중단
  const resetAll = useCallback(() => {
    // 모든 타이머 취소
    timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
    timeoutsRef.current.clear();
    
    // 상태 초기화
    setShakingItems(new Set());
  }, []);

  return {
    shakingItems,
    triggerShake,
    isShaking,
    resetShake,
    resetAll
  };
};