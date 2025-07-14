/**
 * 디바이스 감지 유틸리티 함수
 */

import { detectDeviceType, DEVICE_DETECTION } from '../config';
import type { DeviceType, ViewportInfo } from '../types';

/**
 * 현재 뷰포트 정보 조회
 */
export const getViewportInfo = (): ViewportInfo => {
  const { width, height } = DEVICE_DETECTION.getViewportSize();
  const isTouch = DEVICE_DETECTION.hasTouch();
  const deviceType = detectDeviceType();

  return {
    width,
    height,
    isTouch,
    deviceType
  };
};

/**
 * 디바이스 타입별 조건 확인
 */
export const deviceTypeCheckers = {
  isMobile: (deviceType: DeviceType) => deviceType === 'mobile',
  isTablet: (deviceType: DeviceType) => 
    deviceType === 'ipadAir' || deviceType === 'ipadPro',
  isTouch: (deviceType: DeviceType) => 
    deviceType === 'mobile' || deviceType === 'ipadAir' || deviceType === 'ipadPro',
  isDesktop: (deviceType: DeviceType) => deviceType === 'desktop'
};

/**
 * 디바이스 변경 감지를 위한 이벤트 리스너
 */
export const createDeviceChangeListener = (
  callback: (deviceType: DeviceType) => void,
  debounceMs: number = 150
) => {
  let timeoutId: number | null = null;

  const handleResize = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = window.setTimeout(() => {
      const newDeviceType = detectDeviceType();
      callback(newDeviceType);
    }, debounceMs);
  };

  window.addEventListener('resize', handleResize);
  
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    window.removeEventListener('resize', handleResize);
  };
};

/**
 * 디바이스별 기능 지원 확인
 */
export const deviceCapabilities = {
  supportsTouch: () => DEVICE_DETECTION.hasTouch(),
  supportsHover: () => window.matchMedia('(hover: hover)').matches,
  supportsPointer: () => 'PointerEvent' in window,
  prefersDarkMode: () => 
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
  prefersReducedMotion: () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
};