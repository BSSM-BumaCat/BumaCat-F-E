/**
 * 레이아웃 관련 타입 정의
 */

// 디바이스 타입
export type DeviceType = 'desktop' | 'ipadPro' | 'ipadAir' | 'mobile';

// 카드 크기 설정
export interface CardSize {
  width: string;
  height: string;
  maxWidth?: string;
  maxHeight?: string;
}

// 검색바 설정
export interface SearchBarConfig {
  position: string;
  compact: boolean;
}

// 컨테이너 설정
export interface ContainerConfig {
  width: string;
  height: string;
}

// 레이아웃 설정 (기존 인터페이스 개선)
export interface LayoutConfig {
  // 그리드 설정
  cols: number;
  rows: number | 'auto';
  
  // 카드 크기
  cardWidth: string;
  cardHeight: string;
  maxCardWidth?: string;
  maxCardHeight?: string;
  
  // 컨테이너 크기
  containerWidth: string;
  containerHeight: string;
  
  // 검색바 설정
  searchBarTop?: string;
  searchBarCompact?: boolean;
  
  // 여백 설정
  marginTop?: string;
  paddingBottom?: string;
}

// 디바이스별 레이아웃 설정
export type DeviceLayoutConfig = {
  [key in DeviceType]: LayoutConfig;
}

// 반응형 브레이크포인트
export interface Breakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  ipadPro: {
    minWidth: number;
    minHeight: number;
  };
}

// 그리드 관련
export interface GridConfig {
  gap: string;
  className: string;
  columns: string;
}

// 뷰포트 관련
export interface ViewportInfo {
  width: number;
  height: number;
  isTouch: boolean;
  deviceType: DeviceType;
}