/**
 * 레이아웃 계산 유틸리티 함수
 */

import { DEVICE_LAYOUTS, calculateSearchMargin } from '../config';
import type { DeviceType, LayoutConfig, GridConfig } from '../types';

/**
 * 디바이스 타입에 따른 레이아웃 설정 조회
 */
export const getLayoutConfig = (deviceType: DeviceType): LayoutConfig => {
  const config = DEVICE_LAYOUTS[deviceType as keyof typeof DEVICE_LAYOUTS];
  if (!config) {
    throw new Error(`Unsupported device type: ${deviceType}`);
  }
  return { ...config };
};

/**
 * 그리드 설정 계산
 */
export const calculateGridConfig = (
  layoutConfig: LayoutConfig
): GridConfig => {
  return {
    gap: '1rem',
    className: 'grid gap-4 w-fit relative z-20 transition-all duration-300 ease-in-out',
    columns: `repeat(${layoutConfig.cols}, minmax(0, 1fr))`
  };
};

/**
 * 그리드 인라인 스타일 계산
 */
export const calculateGridStyles = (
  layoutConfig: LayoutConfig,
  searchTerm: string = '',
  isTouch: boolean = false
) => ({
  gridTemplateColumns: `repeat(${layoutConfig.cols}, minmax(0, 1fr))`,
  marginTop: calculateSearchMargin(layoutConfig, !!searchTerm, isTouch),
  paddingBottom: layoutConfig.paddingBottom || '1rem'
});

/**
 * 카드 스타일 계산
 */
export const calculateCardStyles = (layoutConfig: LayoutConfig) => ({
  width: layoutConfig.cardWidth,
  height: layoutConfig.cardHeight,
  maxWidth: layoutConfig.maxCardWidth,
  maxHeight: layoutConfig.maxCardHeight
});

/**
 * 컨테이너 스타일 계산
 */
export const calculateContainerStyles = (layoutConfig: LayoutConfig) => ({
  width: layoutConfig.containerWidth,
  height: layoutConfig.containerHeight,
  maxWidth: layoutConfig.maxCardWidth
    ? `calc(${layoutConfig.cols} * ${layoutConfig.maxCardWidth} + ${layoutConfig.cols - 1} * 1rem)`
    : undefined
});

/**
 * 반응형 패딩 클래스 생성
 */
export const getResponsivePaddingClass = (deviceType: DeviceType): string => {
  const baseClass = 'responsive-padding';
  
  switch (deviceType) {
    case 'mobile':
      return `${baseClass} p-0`;
    case 'ipadAir':
    case 'ipadPro':
      return `${baseClass} p-4`;
    default:
      return `${baseClass} p-8`;
  }
};

/**
 * 검색바 위치 클래스 계산
 */
export const calculateSearchBarClasses = (
  layoutConfig: LayoutConfig,
  isVisible: boolean,
  isTouch: boolean
): string => {
  const baseClasses = [
    'fixed',
    layoutConfig.searchBarTop || 'top-4',
    'left-1/2',
    'transform',
    '-translate-x-1/2',
    'z-50',
    'w-fit'
  ];

  if (isTouch) {
    baseClasses.push(
      'transition-all',
      'duration-500',
      'ease-in-out',
      isVisible ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'
    );
  } else {
    baseClasses.push('h-20');
  }

  return baseClasses.join(' ');
};