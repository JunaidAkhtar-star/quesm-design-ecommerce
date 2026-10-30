/**
 * Real-Time Network Activity & Slow Connection Tracker
 * Seamlessly monitors ongoing API requests across the entire QueS.M design storefront.
 * Triggers rotating loading indicators & slow-network alerts whenever connection is delayed.
 */

let activeRequestsCount = 0;
const listeners = new Set();
let isSlow = false;
let slowTimer = null;

const notify = () => {
  const isBusy = activeRequestsCount > 0;
  listeners.forEach(fn => {
    try {
      fn({ isBusy, isSlow, count: activeRequestsCount });
    } catch (e) {
      console.warn('Network listener error:', e);
    }
  });
};

export const subscribeToNetwork = (callback) => {
  listeners.add(callback);
  callback({ isBusy: activeRequestsCount > 0, isSlow, count: activeRequestsCount });
  return () => listeners.delete(callback);
};

export const initNetworkTracker = () => {
  if (typeof window === 'undefined' || window.__quesmNetworkTrackerInitialized) {
    return;
  }
  window.__quesmNetworkTrackerInitialized = true;

  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    activeRequestsCount++;
    notify();

    // If slowTimer is not active and we have requests running, start slow detector
    if (!slowTimer) {
      slowTimer = setTimeout(() => {
        if (activeRequestsCount > 0) {
          isSlow = true;
          notify();
        }
      }, 1600); // After 1.6s of waiting on slow network or Render wake-up
    }

    try {
      const response = await originalFetch(...args);
      return response;
    } finally {
      activeRequestsCount = Math.max(0, activeRequestsCount - 1);
      if (activeRequestsCount === 0) {
        if (slowTimer) {
          clearTimeout(slowTimer);
          slowTimer = null;
        }
        isSlow = false;
      }
      notify();
    }
  };
};

