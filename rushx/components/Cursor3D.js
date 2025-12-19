import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Spline (no SSR)
const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => null,
});

const Cursor3D = () => {
  const splineRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const targetPos = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Check for mobile/tablet
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      if (!mobile) {
        document.body.classList.add('cursor-active');
      } else {
        document.body.classList.remove('cursor-active');
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      document.body.classList.remove('cursor-active');
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Safe lerp function
  const lerp = useCallback((start, end, factor) => {
    return start + (end - start) * factor;
  }, []);

  // Safe performance optimization function
  const optimizeSplinePerformance = useCallback((app) => {
    if (!app) return;
    
    try {
      // Safely check for renderer
      if (app.renderer && typeof app.renderer.setPixelRatio === 'function') {
        app.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        app.renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Disable expensive features
        if (app.renderer.shadowMap) {
          app.renderer.shadowMap.enabled = false;
        }
        
        // Try to disable antialiasing if available
        if (typeof app.renderer.antialias !== 'undefined') {
          app.renderer.antialias = false;
        }
      }
      
      // Safely optimize scene objects
      if (app.scene && typeof app.scene.traverse === 'function') {
        app.scene.traverse((obj) => {
          if (obj) {
            // Disable shadows
            if (typeof obj.castShadow !== 'undefined') obj.castShadow = false;
            if (typeof obj.receiveShadow !== 'undefined') obj.receiveShadow = false;
            
            // Optimize materials if they exist
            if (obj.material) {
              if (typeof obj.material.precision !== 'undefined') {
                obj.material.precision = 'lowp';
              }
              if (typeof obj.material.needsUpdate !== 'undefined') {
                obj.material.needsUpdate = false;
              }
            }
          }
        });
      }
    } catch (error) {
      // Silent fail - don't break the cursor if optimization fails
      console.warn('Cursor optimization failed:', error.message);
    }
  }, []);

  // Mouse movement with lerp
  useEffect(() => {
    if (isMobile || !isLoaded) return;

    const handleMouseMove = (e) => {
      mousePos.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    const animateCursor = () => {
      // Smooth follow with lerp
      targetPos.current.x = lerp(targetPos.current.x, mousePos.current.x, 0.12);
      targetPos.current.y = lerp(targetPos.current.y, mousePos.current.y, 0.12);

      // Update Spline cursor position
      if (splineRef.current) {
        try {
          // Use Spline's built-in event system if available
          const spline = splineRef.current;
          
          // Alternative: Use Spline's emitEvent for position updates
          // This is more reliable than direct object manipulation
          spline.emitEvent('mouseHover', {
            x: targetPos.current.x / window.innerWidth,
            y: targetPos.current.y / window.innerHeight,
          });
          
        } catch (error) {
          // Fallback silent
        }
      }

      animationFrameRef.current = requestAnimationFrame(animateCursor);
    };

    // Initialize at center
    mousePos.current = { 
      x: window.innerWidth / 2, 
      y: window.innerHeight / 2 
    };
    targetPos.current = { 
      x: window.innerWidth / 2, 
      y: window.innerHeight / 2 
    };

    window.addEventListener('mousemove', handleMouseMove);
    animateCursor();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isMobile, isLoaded, lerp]);

  // Hover interactions
  useEffect(() => {
    if (isMobile || !isLoaded) return;

    const handleHoverStart = () => {
      if (splineRef.current) {
        try {
          splineRef.current.emitEvent('mouseDown', 'Cursor');
        } catch (e) {
          // Fallback silent
        }
      }
    };

    const handleHoverEnd = () => {
      if (splineRef.current) {
        try {
          splineRef.current.emitEvent('mouseUp', 'Cursor');
        } catch (e) {
          // Fallback silent
        }
      }
    };

    // Only add listeners to existing elements
    const addHoverListeners = () => {
      const elements = document.querySelectorAll(
        'a, button, [role="button"], input, textarea, select'
      );
      
      elements.forEach(el => {
        if (!el.dataset.cursorListener) {
          el.addEventListener('mouseenter', handleHoverStart);
          el.addEventListener('mouseleave', handleHoverEnd);
          el.dataset.cursorListener = 'true';
        }
      });
    };

    // Initial setup
    addHoverListeners();
    
    // Set up MutationObserver to handle dynamically added elements
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });

    return () => {
      observer.disconnect();
      const elements = document.querySelectorAll('[data-cursor-listener="true"]');
      elements.forEach(el => {
        el.removeEventListener('mouseenter', handleHoverStart);
        el.removeEventListener('mouseleave', handleHoverEnd);
        delete el.dataset.cursorListener;
      });
    };
  }, [isMobile, isLoaded]);

  // Handle Spline load
  const handleSplineLoad = useCallback((app) => {
    setIsLoaded(true);
    
    // Apply performance optimizations
    if (app) {
      // Use setTimeout to ensure app is fully loaded
      setTimeout(() => {
        optimizeSplinePerformance(app);
      }, 100);
    }
  }, [optimizeSplinePerformance]);

  if (isMobile) return null;

  return (
    <>
      {/* Spline 3D Cursor */}
      <div className="fixed inset-0 z-[9999] pointer-events-none">
        <Spline
          ref={splineRef}
          scene="https://prod.spline.design/ATNpR15AWwbFohO9/scene.splinecode"
          onLoad={handleSplineLoad}
          style={{
            width: '100%',
            height: '100%',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }}
        />
      </div>
      
      {/* Global cursor styles */}
      <style jsx global>{`
        body.cursor-active * {
          cursor: none !important;
        }
        
        @media (max-width: 767px) {
          body.cursor-active * {
            cursor: auto !important;
          }
        }
        
        /* Prevent cursor from interfering with inputs */
        body.cursor-active input:focus,
        body.cursor-active textarea:focus,
        body.cursor-active select:focus {
          cursor: text !important;
        }
      `}</style>
    </>
  );
};

// Lightweight wrapper with error boundary
const Cursor3DWithErrorBoundary = () => {
  const [hasError, setHasError] = useState(false);
  
  if (hasError) {
    return null;
  }
  
  return (
    <ErrorBoundary onError={() => setHasError(true)}>
      <Cursor3D />
    </ErrorBoundary>
  );
};

// Simple error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (this.props.onError) {
      this.props.onError();
    }
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

// Add React import if not already present
if (typeof React === 'undefined') {
  var React = require('react');
}

export default Cursor3DWithErrorBoundary;