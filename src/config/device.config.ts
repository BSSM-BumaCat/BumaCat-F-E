/**
 * 디바이스 감지 및 브레이크포인트 설정
 */

import type { Breakpoints, DeviceType } from '../types';

// 브레이크포인트 설정
export const BREAKPOINTS: Breakpoints = {
  mobile: 767,
  tablet: 1024,
  desktop: 1200,
  ipadPro: {
    minWidth: 1024,
    minHeight: 1366
  }
} as const;

// 디바이스 감지 조건
export const DEVICE_DETECTION = {
  hasTouch: () => 'ontouchstart' in window,
  getViewportSize: () => ({
    width: window.innerWidth,
    height: window.innerHeight
  }),
  
  // 아이패드 프로 감지
  isIpadPro: (width: number, height: number, isTouch: boolean) =>
    isTouch && width >= BREAKPOINTS.ipadPro.minWidth && height >= BREAKPOINTS.ipadPro.minHeight,
  
  // 아이패드 일반/에어 감지
  isIpadAir: (width: number, isTouch: boolean) =>
    isTouch && width >= 768 && width <= BREAKPOINTS.tablet,
  
  // 모바일 감지
  isMobile: (width: number, isTouch: boolean) =>
    isTouch && width <= BREAKPOINTS.mobile,
  
  // 태블릿 크기 데스크톱 감지
  isTabletDesktop: (width: number, isTouch: boolean) =>
    !isTouch && width <= BREAKPOINTS.tablet,
  
  // 데스크톱 감지
  isDesktop: (width: number, isTouch: boolean) =>
    !isTouch && width > BREAKPOINTS.tablet
} as const;

// 디바이스 타입 결정 함수
export const detectDeviceType = (): DeviceType => {
  const { width, height } = DEVICE_DETECTION.getViewportSize();
  const isTouch = DEVICE_DETECTION.hasTouch();

  if (DEVICE_DETECTION.isIpadPro(width, height, isTouch)) {
    return 'ipadPro';
  }
  
  if (DEVICE_DETECTION.isIpadAir(width, isTouch)) {
    return 'ipadAir';
  }
  
  if (DEVICE_DETECTION.isMobile(width, isTouch)) {
    return 'mobile';
  }
  
  // 데스크톱은 터치 여부와 관계없이 큰 화면으로 처리
  return 'desktop';
};