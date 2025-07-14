/**
 * 애니메이션 설정 중앙 관리
 */

import type { AnimationConfigs, AnimationKeyframes } from '../types';

// 애니메이션 지속 시간
export const ANIMATION_DURATIONS = {
  shake: 600,
  scroll: 500,
  bounce: 400,
  fade: 300,
  heartEffect: 1000,
  transition: 300
} as const;

// 이징 함수
export const EASING_FUNCTIONS = {
  easeInOut: 'ease-in-out',
  easeOut: 'ease-out',
  easeIn: 'ease-in',
  linear: 'linear',
  bouncy: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
} as const;

// 흔들기 애니메이션 키프레임
export const SHAKE_KEYFRAMES: AnimationKeyframes = {
  '0%': { transform: 'scale(1.1) translateX(0)', opacity: 1 },
  '10%, 30%, 50%': { transform: 'scale(1.1) translateX(-6px)', opacity: 1 },
  '20%, 40%': { transform: 'scale(1.1) translateX(6px)', opacity: 1 },
  '60%': { transform: 'scale(1.1) translateX(0)', opacity: 1 },
  '100%': { transform: 'scale(1.1) translateX(0)', opacity: 0 }
};

// 하트 라이크 애니메이션 키프레임
export const HEART_LIKE_KEYFRAMES: AnimationKeyframes = {
  '0%': { transform: 'scale(0)', opacity: 0 },
  '15%': { transform: 'scale(1.2)', opacity: 1 },
  '30%': { transform: 'scale(0.95)', opacity: 1 },
  '45%': { transform: 'scale(1.1)', opacity: 1 },
  '80%': { transform: 'scale(1)', opacity: 1 },
  '100%': { transform: 'scale(1)', opacity: 0 }
};

// 바운스 애니메이션 키프레임
export const BOUNCE_KEYFRAMES = {
  top: {
    '0%': { transform: 'translateY(0)' },
    '15%': { transform: 'translateY(-12px)' },
    '30%': { transform: 'translateY(-8px)' },
    '45%': { transform: 'translateY(-4px)' },
    '60%': { transform: 'translateY(-2px)' },
    '75%': { transform: 'translateY(-1px)' },
    '90%': { transform: 'translateY(-0.5px)' },
    '100%': { transform: 'translateY(0)' }
  },
  bottom: {
    '0%': { transform: 'translateY(0)' },
    '15%': { transform: 'translateY(12px)' },
    '30%': { transform: 'translateY(8px)' },
    '45%': { transform: 'translateY(4px)' },
    '60%': { transform: 'translateY(2px)' },
    '75%': { transform: 'translateY(1px)' },
    '90%': { transform: 'translateY(0.5px)' },
    '100%': { transform: 'translateY(0)' }
  }
};

// 전체 애니메이션 설정
export const ANIMATION_CONFIGS: AnimationConfigs = {
  shake: {
    duration: ANIMATION_DURATIONS.shake,
    easing: EASING_FUNCTIONS.easeInOut,
    fillMode: 'forwards',
    intensity: 6,
    frequency: 3
  },
  
  scroll: {
    duration: ANIMATION_DURATIONS.scroll,
    easing: EASING_FUNCTIONS.easeInOut,
    threshold: 10,
    showDirection: 'up',
    hideDirection: 'down'
  },
  
  bounce: {
    duration: ANIMATION_DURATIONS.bounce,
    easing: EASING_FUNCTIONS.bouncy,
    direction: 'top',
    height: '12px'
  },
  
  fade: {
    duration: ANIMATION_DURATIONS.fade,
    easing: EASING_FUNCTIONS.easeInOut,
    from: 0,
    to: 1
  },
  
  heartEffect: {
    duration: ANIMATION_DURATIONS.heartEffect,
    easing: EASING_FUNCTIONS.easeOut,
    type: 'like',
    scale: 1.2
  }
};

// CSS 클래스명 상수
export const ANIMATION_CLASSES = {
  shake: 'animate-shake-heart',
  shakeReset: 'animate-shake-heart-reset',
  bounceTop: 'animate-bounce-top',
  bounceBottom: 'animate-bounce-bottom',
  pulse: 'animate-pulse',
  transition: 'transition-all duration-300 ease-in-out'
} as const;

// 애니메이션 CSS 생성 함수
export const generateAnimationCSS = (
  name: string,
  keyframes: AnimationKeyframes,
  duration: number,
  easing: string = EASING_FUNCTIONS.easeInOut,
  fillMode: string = 'forwards'
) => `
  @keyframes ${name} {
    ${Object.entries(keyframes)
      .map(([key, value]) => `
        ${key} {
          ${Object.entries(value)
            .map(([prop, val]) => `${prop}: ${val};`)
            .join(' ')}
        }
      `)
      .join('')}
  }
  
  .animate-${name} {
    animation: ${name} ${duration}ms ${easing} ${fillMode};
  }
`;