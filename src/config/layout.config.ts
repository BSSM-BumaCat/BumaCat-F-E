/**
 * 레이아웃 설정 중앙 관리
 */

import type { DeviceLayoutConfig, LayoutConfig } from '../types';

// 디바이스별 레이아웃 설정
export const DEVICE_LAYOUTS: DeviceLayoutConfig = {
  desktop: {
    cols: 4,
    rows: 3,
    cardWidth: '12.5rem',
    cardHeight: '15.65rem',
    containerWidth: 'calc(4 * 12.5rem + 3 * 1rem)',
    containerHeight: 'calc(3 * 15.65rem + 2 * 1rem)',
    searchBarTop: 'top-34',
    searchBarCompact: false,
    paddingBottom: '1rem'
  },
  
  ipadPro: {
    cols: 4,
    rows: 5,
    cardWidth: '11rem',
    cardHeight: '13.75rem',
    containerWidth: 'calc(4 * 11rem + 3 * 1rem)',
    containerHeight: 'calc(5 * 13.75rem + 4 * 1rem)',
    searchBarTop: 'top-38',
    searchBarCompact: false,
    paddingBottom: '1rem'
  },
  
  ipadAir: {
    cols: 4,
    rows: 5,
    cardWidth: '9.5rem',
    cardHeight: '11.875rem',
    containerWidth: 'calc(4 * 9.5rem + 3 * 1rem)',
    containerHeight: 'calc(5 * 11.875rem + 4 * 1rem)',
    searchBarTop: 'top-34',
    searchBarCompact: false,
    paddingBottom: '1rem'
  },
  
  mobile: {
    cols: 2,
    rows: 'auto',
    cardWidth: 'calc((100vw - 2rem - 1rem) / 2)',
    cardHeight: 'calc(((100vw - 2rem - 1rem) / 2) * 1.252)',
    containerWidth: 'calc(100vw - 2rem)',
    containerHeight: 'calc(100vh - 2rem)',
    maxCardWidth: '12.5rem',
    maxCardHeight: '15.65rem',
    searchBarTop: 'top-16',
    searchBarCompact: true,
    paddingBottom: '3rem'
  }
} as const;

// 검색 시 상단 여백 계산
export const SEARCH_MARGIN_CONFIG = {
  'top-16': '4.5rem',  // 모바일
  'top-34': '5.5rem',  // 아이패드 에어
  'top-38': '6.5rem',  // 아이패드 프로
  default: '4.5rem'
} as const;

// 레이아웃 계산 함수
export const calculateSearchMargin = (
  layoutConfig: LayoutConfig,
  hasSearchTerm: boolean,
  isTouch: boolean
): string => {
  // 터치 디바이스에서 검색 결과가 있을 때만 여백 추가
  if (!isTouch || !hasSearchTerm || layoutConfig.cols > 4) {
    return '0';
  }

  const searchBarTop = layoutConfig.searchBarTop;
  if (!searchBarTop) return SEARCH_MARGIN_CONFIG.default;

  return SEARCH_MARGIN_CONFIG[searchBarTop as keyof typeof SEARCH_MARGIN_CONFIG] || 
         SEARCH_MARGIN_CONFIG.default;
};

// 그리드 스타일 계산
export const calculateGridStyles = (
  layoutConfig: LayoutConfig,
  searchTerm: string,
  isTouch: boolean
) => ({
  gridTemplateColumns: `repeat(${layoutConfig.cols}, minmax(0, 1fr))`,
  marginTop: calculateSearchMargin(layoutConfig, !!searchTerm, isTouch),
  paddingBottom: layoutConfig.paddingBottom || '1rem'
});