/**
 * 디바이스 감지 및 레이아웃 관리 Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { detectDeviceType } from '../config';
import { 
  getViewportInfo, 
  createDeviceChangeListener, 
  getLayoutConfig 
} from '../utils';
import type { DeviceType, LayoutConfig, ViewportInfo } from '../types';

export interface UseDeviceLayoutReturn {
  deviceType: DeviceType;
  layoutConfig: LayoutConfig;
  viewportInfo: ViewportInfo;
  isTouch: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * 디바이스 감지 및 레이아웃 설정 관리 훅
 */
export const useDeviceLayout = (): UseDeviceLayoutReturn => {
  const [deviceType, setDeviceType] = useState<DeviceType>(() => detectDeviceType());
  const [viewportInfo, setViewportInfo] = useState<ViewportInfo>(() => getViewportInfo());

  // 디바이스 변경 감지
  const handleDeviceChange = useCallback((newDeviceType: DeviceType) => {
    setDeviceType(newDeviceType);
    setViewportInfo(getViewportInfo());
  }, []);

  // 디바이스 변경 리스너 등록
  useEffect(() => {
    const cleanup = createDeviceChangeListener(handleDeviceChange, 150);
    return cleanup;
  }, [handleDeviceChange]);

  // 레이아웃 설정 계산
  const layoutConfig = getLayoutConfig(deviceType);

  // 편의 속성들
  const isTouch = viewportInfo.isTouch;
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'ipadAir' || deviceType === 'ipadPro';
  const isDesktop = deviceType === 'desktop';

  return {
    deviceType,
    layoutConfig,
    viewportInfo,
    isTouch,
    isMobile,
    isTablet,
    isDesktop
  };
};