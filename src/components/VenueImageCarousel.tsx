'use client'

import { useEffect, useState, useRef } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { VenueWithCount } from '@/lib/database.types';
import './Carousel.css';

interface VenueImageCarouselProps {
  venue: VenueWithCount;
  baseWidth?: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  showDetails?: boolean;
}

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS = { type: 'spring' as const, stiffness: 300, damping: 30 };

export default function VenueImageCarousel({
  venue,
  baseWidth = 300,
  autoplay = true,
  autoplayDelay = 4000,
  pauseOnHover = true,
  loop = true,
  showDetails = true
}: VenueImageCarouselProps): React.JSX.Element {
  const containerPadding = 16;
  const itemWidth = baseWidth - containerPadding * 2;
  const trackItemOffset = itemWidth + GAP;

  // Obtener las fotos del venue
  const photos = venue.photo_refs || (venue.photo_ref ? [venue.photo_ref] : []);
  
  // Si no hay fotos, usar imágenes de fallback según el tipo
  const getFallbackImage = () => {
    const type = venue.type;
    if (type === 'club') {
      return 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80';
    } else if (type === 'bar') {
      return 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80';
    } else {
      return 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80';
    }
  };

  const imageUrls = photos.length > 0 
    ? photos.map(photo => `/api/photo?ref=${photo}&type=${venue.type}`)
    : [getFallbackImage()];

  const carouselItems = loop && imageUrls.length > 1 ? [...imageUrls, imageUrls[0]] : imageUrls;
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current;
      const handleMouseEnter = () => setIsHovered(true);
      const handleMouseLeave = () => setIsHovered(false);
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
      return () => {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [pauseOnHover]);

  useEffect(() => {
    if (autoplay && imageUrls.length > 1 && (!pauseOnHover || !isHovered)) {
      const timer = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev === imageUrls.length - 1 && loop) {
            return prev + 1;
          }
          if (prev === carouselItems.length - 1) {
            return loop ? 0 : prev;
          }
          return prev + 1;
        });
      }, autoplayDelay);
      return () => clearInterval(timer);
    }
  }, [autoplay, autoplayDelay, isHovered, loop, imageUrls.length, carouselItems.length, pauseOnHover]);

  const effectiveTransition = isResetting ? { duration: 0 } : SPRING_OPTIONS;

  const handleAnimationComplete = () => {
    if (loop && currentIndex === carouselItems.length - 1) {
      setIsResetting(true);
      x.set(0);
      setCurrentIndex(0);
      setTimeout(() => setIsResetting(false), 50);
    }
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void => {
    if (imageUrls.length <= 1) return;
    
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
      if (loop && currentIndex === imageUrls.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(prev => Math.min(prev + 1, carouselItems.length - 1));
      }
    } else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
      if (loop && currentIndex === 0) {
        setCurrentIndex(imageUrls.length - 1);
      } else {
        setCurrentIndex(prev => Math.max(prev - 1, 0));
      }
    }
  };

  const dragProps = loop || imageUrls.length <= 1
    ? {}
    : {
        dragConstraints: {
          left: -trackItemOffset * (carouselItems.length - 1),
          right: 0
        }
      };

  const getTypeLabel = () => {
    switch(venue.type) {
      case 'club': return 'Club';
      case 'bar': return venue.avg_price_text || 'Bar';
      default: return 'Food & drink';
    }
  };

  return (
    <div
      ref={containerRef}
      className="carousel-container"
      style={{
        width: `${baseWidth}px`,
        borderRadius: '16px',
        padding: '12px',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        background: 'linear-gradient(135deg, rgba(13, 7, 22, 0.9) 0%, rgba(26, 26, 46, 0.9) 100%)'
      }}
    >
      <motion.div
        className="carousel-track"
        drag={imageUrls.length > 1 ? "x" : false}
        {...dragProps}
        style={{
          width: itemWidth,
          gap: `${GAP}px`,
          perspective: 1000,
          perspectiveOrigin: `${currentIndex * trackItemOffset + itemWidth / 2}px 50%`,
          x
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(currentIndex * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationComplete={handleAnimationComplete}
      >
        {carouselItems.map((imageUrl, index) => {
          const range = [-(index + 1) * trackItemOffset, -index * trackItemOffset, -(index - 1) * trackItemOffset];
          const outputRange = [90, 0, -90];
          const rotateY = useTransform(x, range, outputRange, { clamp: false });
          
          return (
            <motion.div
              key={index}
              className="carousel-item"
              style={{
                width: itemWidth,
                height: '200px',
                rotateY: rotateY,
                borderRadius: '12px',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}
              transition={effectiveTransition}
            >
              {/* Imagen de fondo */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'brightness(0.7)'
                }}
              />
              
              {/* Overlay gradient */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%)'
                }}
              />

              {showDetails && (
                <>
                  {/* Contador en la esquina superior izquierda */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#fbbf24',
                        textShadow: '0 0 10px rgba(251, 191, 36, 0.5)'
                      }}
                    >
                      {venue.count_today}
                    </div>
                  </div>

                  {/* Detalles del venue en la parte inferior */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      padding: '12px',
                      color: 'white',
                      zIndex: 10
                    }}
                  >
                    <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                      {venue.name}
                    </div>
                    <div style={{ fontSize: '14px', opacity: 0.8 }}>
                      {getTypeLabel()}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          );
        })}
      </motion.div>
      
      {/* Indicadores solo si hay más de una imagen */}
      {imageUrls.length > 1 && (
        <div className="carousel-indicators-container">
          <div className="carousel-indicators" style={{ width: 'auto', gap: '8px' }}>
            {imageUrls.map((_, index) => (
              <motion.div
                key={index}
                className={`carousel-indicator ${currentIndex % imageUrls.length === index ? 'active' : 'inactive'}`}
                animate={{
                  scale: currentIndex % imageUrls.length === index ? 1.2 : 1
                }}
                onClick={() => setCurrentIndex(index)}
                transition={{ duration: 0.15 }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
