import React, { useRef, useEffect } from 'react';
import { startJetAnimation } from './007_F16';

const JetAnimation = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    let cleanupFunction;
    if (containerRef.current) {
      cleanupFunction = startJetAnimation(containerRef.current);
    }

    // Clean up the animation when the component unmounts
    return () => {
      if (cleanupFunction) cleanupFunction();
    };
  }, []);
  return (
      <div
      id="animation-container"
      ref={containerRef}
      style={{ width: '100%', overflow: 'hidden' }}
    >
      {/* The animation will render inside this div */}
    </div>
  );
};

export default JetAnimation;
