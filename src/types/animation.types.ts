/**
 * 애니메이션 관련 타입 정의
 */

// 애니메이션 타입
export type AnimationType = 'shake' | 'bounce' | 'fade' | 'slide';

// 방향
export type Direction = 'up' | 'down' | 'left' | 'right';

// 애니메이션 상태
export type AnimationState = 'idle' | 'running' | 'completed';

// 기본 애니메이션 설정
export interface BaseAnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

// 흔들기 애니메이션 설정
export interface ShakeAnimationConfig extends BaseAnimationConfig {
  intensity: number; // 흔들림 강도 (px)
  frequency: number; // 흔들림 횟수
}

// 스크롤 애니메이션 설정
export interface ScrollAnimationConfig extends BaseAnimationConfig {
  threshold: number; // 스크롤 감지 임계값
  showDirection: Direction; // 보여질 때 스크롤 방향
  hideDirection: Direction; // 숨겨질 때 스크롤 방향
}

// 바운스 애니메이션 설정
export interface BounceAnimationConfig extends BaseAnimationConfig {
  direction: 'top' | 'bottom';
  height: string; // 바운스 높이
}

// 페이드 애니메이션 설정
export interface FadeAnimationConfig extends BaseAnimationConfig {
  from: number; // 시작 opacity
  to: number; // 끝 opacity
}

// 하트 효과 애니메이션
export interface HeartEffectConfig extends BaseAnimationConfig {
  type: 'like' | 'break';
  scale: number;
}

// 애니메이션 키프레임
export interface AnimationKeyframes {
  [key: string]: {
    transform?: string;
    opacity?: number;
    [property: string]: string | number | undefined;
  };
}

// 전체 애니메이션 설정
export interface AnimationConfigs {
  shake: ShakeAnimationConfig;
  scroll: ScrollAnimationConfig;
  bounce: BounceAnimationConfig;
  fade: FadeAnimationConfig;
  heartEffect: HeartEffectConfig;
}

// 애니메이션 상태 관리
export interface AnimationManager {
  activeAnimations: Set<string>;
  add: (id: string, type: AnimationType) => void;
  remove: (id: string) => void;
  clear: () => void;
  isActive: (id: string) => boolean;
}

// 애니메이션 훅 반환값
export interface UseAnimationReturn {
  isAnimating: boolean;
  trigger: () => void;
  reset: () => void;
  state: AnimationState;
}