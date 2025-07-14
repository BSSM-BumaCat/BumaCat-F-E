/**
 * 설정 파일 통합 export
 */

// Device config
export {
  BREAKPOINTS,
  DEVICE_DETECTION,
  detectDeviceType
} from './device.config';

// Layout config
export {
  DEVICE_LAYOUTS,
  SEARCH_MARGIN_CONFIG,
  calculateSearchMargin,
  calculateGridStyles
} from './layout.config';

// Animation config
export {
  ANIMATION_DURATIONS,
  EASING_FUNCTIONS,
  SHAKE_KEYFRAMES,
  HEART_LIKE_KEYFRAMES,
  BOUNCE_KEYFRAMES,
  ANIMATION_CONFIGS,
  ANIMATION_CLASSES,
  generateAnimationCSS
} from './animation.config';