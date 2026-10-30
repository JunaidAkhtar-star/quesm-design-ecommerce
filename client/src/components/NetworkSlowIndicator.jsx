import React, { useState, useEffect } from 'react';
import { Sparkles, Wifi, X } from 'lucide-react';
import { initNetworkTracker, subscribeToNetwork } from '../utils/networkTracker';

/**
 * Global Network Activity & Slow Connection Indicator
 * Mounts at top-level. Renders a sleek golden top loading bar and
 * a rotating notification whenever the connection is slow or cold-starting.
 */
const NetworkSlowIndicator = () => {
  const [networkState, setNetworkState] = useState({ isBusy: false, isSlow: false });
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    initNetworkTracker();

    const unsubscribe = subscribeToNetwork((state) => {
      setNetworkState(state);
      if (!state.isSlow) {
        setIsDismissed(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      {/* 1. Sleek Top-Level Gold Shimmer Loading Line (Shows whenever requests run) */}
      {networkState.isBusy && (
        <div className="top-network-progress-bar" role="progressbar" aria-label="Loading content">
          <div className="top-network-progress-glow" />
        </div>
      )}

      {/* 2. Floating Slow Network Rotating Banner (Shows when request takes > 1.6s) */}
      {networkState.isSlow && !isDismissed && (
        <div className="slow-network-floating-toast" role="alert">
          <div className="slow-network-spinner-ring" />

          <div className="slow-network-content">
            <div className="slow-network-header">
              <Sparkles size={13} className="gold-text" />
              <span className="slow-network-title">Connecting to QueS.M Studio</span>
            </div>
            <p className="slow-network-desc">
              Your network connection is running slow. We are weaving your handcrafted collection...
            </p>
          </div>

          <button
            onClick={() => setIsDismissed(true)}
            className="slow-network-close-btn"
            aria-label="Dismiss slow network alert"
            title="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </>
  );
};

export default NetworkSlowIndicator;

