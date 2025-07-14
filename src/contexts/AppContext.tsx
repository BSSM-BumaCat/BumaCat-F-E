import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface AppState {
  hoveredProduct: { id: number; x: number; y: number } | null;
  announcement: string | null;
  showAnnouncement: boolean;
  bounceAnimation: 'top' | 'bottom' | null;
  keyPressed: string | null;
  searchQuery: string;
  shakingProducts: Set<number>;
}

interface AppContextType {
  state: AppState;
  setHoveredProduct: (product: { id: number; x: number; y: number } | null) => void;
  setAnnouncement: (announcement: string | null) => void;
  setShowAnnouncement: (show: boolean) => void;
  setBounceAnimation: (animation: 'top' | 'bottom' | null) => void;
  setKeyPressed: (key: string | null) => void;
  setSearchQuery: (query: string) => void;
  addShakingProduct: (productId: number) => void;
  removeShakingProduct: (productId: number) => void;
  clearShakingProducts: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    hoveredProduct: null,
    announcement: null,
    showAnnouncement: false,
    bounceAnimation: null,
    keyPressed: null,
    searchQuery: '',
    shakingProducts: new Set()
  });

  const setHoveredProduct = useCallback((product: { id: number; x: number; y: number } | null) => {
    setState(prev => ({ ...prev, hoveredProduct: product }));
  }, []);

  const setAnnouncement = useCallback((announcement: string | null) => {
    setState(prev => ({ ...prev, announcement }));
  }, []);

  const setShowAnnouncement = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showAnnouncement: show }));
  }, []);

  const setBounceAnimation = useCallback((animation: 'top' | 'bottom' | null) => {
    setState(prev => ({ ...prev, bounceAnimation: animation }));
  }, []);

  const setKeyPressed = useCallback((key: string | null) => {
    setState(prev => ({ ...prev, keyPressed: key }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const addShakingProduct = useCallback((productId: number) => {
    setState(prev => ({
      ...prev,
      shakingProducts: new Set([...prev.shakingProducts, productId])
    }));
  }, []);

  const removeShakingProduct = useCallback((productId: number) => {
    setState(prev => {
      const newShaking = new Set(prev.shakingProducts);
      newShaking.delete(productId);
      return { ...prev, shakingProducts: newShaking };
    });
  }, []);

  const clearShakingProducts = useCallback(() => {
    setState(prev => ({ ...prev, shakingProducts: new Set() }));
  }, []);

  const contextValue: AppContextType = {
    state,
    setHoveredProduct,
    setAnnouncement,
    setShowAnnouncement,
    setBounceAnimation,
    setKeyPressed,
    setSearchQuery,
    addShakingProduct,
    removeShakingProduct,
    clearShakingProducts
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};