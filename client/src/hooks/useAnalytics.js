import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ANALYTICS_ENDPOINT = process.env.REACT_APP_ANALYTICS_URL;

const sendEvent = (eventName, properties = {}) => {
  if (!ANALYTICS_ENDPOINT) return;

  const payload = {
    event: eventName,
    properties: {
      ...properties,
      url: window.location.href,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
    },
  };

  if (navigator.sendBeacon) {
    navigator.sendBeacon(ANALYTICS_ENDPOINT, JSON.stringify(payload));
  } else {
    fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }
};

export const usePageView = () => {
  const location = useLocation();

  useEffect(() => {
    sendEvent('page_view', { path: location.pathname });
  }, [location.pathname]);
};

export const useTrack = () => {
  return useCallback((eventName, properties) => {
    sendEvent(eventName, properties);
  }, []);
};

export default useTrack;
