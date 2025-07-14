import React, { useState, useRef, useEffect } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholderClassName = '',
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleImageLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleImageError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div ref={imgRef} className={`${className} relative overflow-hidden`}>
      {!isLoaded && !hasError && (
        <div 
          className={`absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse ${placeholderClassName}`}
        />
      )}
      
      {isInView && !hasError && (
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url(${src})` }}
        />
      )}
      
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          className="sr-only"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
      
      {hasError && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500 text-sm">이미지 로드 실패</span>
        </div>
      )}
    </div>
  );
};

export default React.memo(LazyImage);