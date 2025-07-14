/**
 * 유틸리티 함수 통합 export
 */

// Device Detection
export {
  getViewportInfo,
  deviceTypeCheckers,
  createDeviceChangeListener,
  deviceCapabilities
} from './deviceDetection';

// Layout Calculator
export {
  getLayoutConfig,
  calculateGridConfig,
  calculateGridStyles,
  calculateCardStyles,
  calculateContainerStyles,
  getResponsivePaddingClass,
  calculateSearchBarClasses
} from './layoutCalculator';