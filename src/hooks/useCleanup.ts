import { useEffect, useRef, useCallback } from 'react';

export const useCleanup = () => {
  const timeoutsRef = useRef<Set<number>>(new Set());
  const intervalsRef = useRef<Set<number>>(new Set());
  const animationFramesRef = useRef<Set<number>>(new Set());

  const addTimeout = useCallback((timeoutId: number) => {
    timeoutsRef.current.add(timeoutId);
    return timeoutId;
  }, []);

  const addInterval = useCallback((intervalId: number) => {
    intervalsRef.current.add(intervalId);
    return intervalId;
  }, []);

  const addAnimationFrame = useCallback((frameId: number) => {
    animationFramesRef.current.add(frameId);
    return frameId;
  }, []);

  const clearTimeout = useCallback((timeoutId: number) => {
    window.clearTimeout(timeoutId);
    timeoutsRef.current.delete(timeoutId);
  }, []);

  const clearInterval = useCallback((intervalId: number) => {
    window.clearInterval(intervalId);
    intervalsRef.current.delete(intervalId);
  }, []);

  const cancelAnimationFrame = useCallback((frameId: number) => {
    window.cancelAnimationFrame(frameId);
    animationFramesRef.current.delete(frameId);
  }, []);

  const safeSetTimeout = useCallback((callback: () => void, delay: number) => {
    const timeoutId = window.setTimeout(() => {
      callback();
      timeoutsRef.current.delete(timeoutId);
    }, delay);
    return addTimeout(timeoutId);
  }, [addTimeout]);

  const safeSetInterval = useCallback((callback: () => void, delay: number) => {
    const intervalId = window.setInterval(callback, delay);
    return addInterval(intervalId);
  }, [addInterval]);

  const safeRequestAnimationFrame = useCallback((callback: () => void) => {
    const frameId = window.requestAnimationFrame(() => {
      callback();
      animationFramesRef.current.delete(frameId);
    });
    return addAnimationFrame(frameId);
  }, [addAnimationFrame]);

  useEffect(() => {
    const timeouts = timeoutsRef.current;
    const intervals = intervalsRef.current;
    const animationFrames = animationFramesRef.current;
    
    return () => {
      timeouts.forEach(id => window.clearTimeout(id));
      intervals.forEach(id => window.clearInterval(id));
      animationFrames.forEach(id => window.cancelAnimationFrame(id));
      
      timeouts.clear();
      intervals.clear();
      animationFrames.clear();
    };
  }, []);

  return {
    safeSetTimeout,
    safeSetInterval,
    safeRequestAnimationFrame,
    clearTimeout,
    clearInterval,
    cancelAnimationFrame
  };
};