/**
 * Web Vitals Monitor
 *
 * Real-time monitoring of Core Web Vitals in production.
 * Reports metrics to console, analytics, or monitoring service.
 *
 * Usage:
 *   npm install web-vitals
 *   Import this module in your app entry point
 */

import { onCLS, onFID, onLCP, onFCP, onTTFB, onINP } from 'web-vitals';

/**
 * Configuration
 */
const CONFIG = {
  // Enable console logging
  debug: process.env.NODE_ENV === 'development',

  // Analytics endpoint (optional)
  analyticsEndpoint: '/api/analytics/web-vitals',

  // Enable analytics reporting
  reportToAnalytics: process.env.NODE_ENV === 'production',

  // Sampling rate (0-1, 1 = 100% of sessions)
  samplingRate: 1.0,

  // Thresholds for warnings
  thresholds: {
    LCP: { good: 2500, needsImprovement: 4000 },
    FID: { good: 100, needsImprovement: 300 },
    CLS: { good: 0.1, needsImprovement: 0.25 },
    FCP: { good: 1800, needsImprovement: 3000 },
    TTFB: { good: 800, needsImprovement: 1800 },
    INP: { good: 200, needsImprovement: 500 },
  },
};

/**
 * Get rating for a metric
 */
function getRating(name, value) {
  const threshold = CONFIG.thresholds[name];
  if (!threshold) return 'unknown';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Get color for console output
 */
function getColor(rating) {
  const colors = {
    good: '\x1b[32m', // Green
    'needs-improvement': '\x1b[33m', // Yellow
    poor: '\x1b[31m', // Red
    unknown: '\x1b[37m', // White
  };

  return colors[rating] || colors.unknown;
}

/**
 * Format metric value
 */
function formatValue(name, value) {
  // CLS has no unit
  if (name === 'CLS') {
    return value.toFixed(3);
  }

  // Everything else is in milliseconds
  return `${Math.round(value)}ms`;
}

/**
 * Log metric to console (debug mode)
 */
function logMetric(metric) {
  if (!CONFIG.debug) return;

  const { name, value, rating, delta, id, navigationType } = metric;
  const formattedValue = formatValue(name, value);
  const color = getColor(rating);
  const reset = '\x1b[0m';

  console.log(
    `${color}[Web Vitals]${reset} ${name}: ${color}${formattedValue}${reset} (${rating})`,
    {
      delta: formatValue(name, delta),
      id,
      navigationType,
    }
  );
}

/**
 * Send metric to analytics
 */
async function sendToAnalytics(metric) {
  if (!CONFIG.reportToAnalytics) return;

  // Sampling
  if (Math.random() > CONFIG.samplingRate) return;

  const { name, value, rating, delta, id, navigationType } = metric;

  const body = {
    name,
    value,
    rating,
    delta,
    id,
    navigationType,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
  };

  try {
    // Use sendBeacon for better reliability
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
      navigator.sendBeacon(CONFIG.analyticsEndpoint, blob);
    } else {
      // Fallback to fetch
      await fetch(CONFIG.analyticsEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        keepalive: true,
      });
    }
  } catch (error) {
    console.error('Failed to send Web Vitals to analytics:', error);
  }
}

/**
 * Send to Google Analytics 4 (optional)
 */
function sendToGA4(metric) {
  if (typeof gtag === 'undefined') return;

  const { name, value, delta, id, rating } = metric;

  gtag('event', name, {
    event_category: 'Web Vitals',
    event_label: id,
    value: Math.round(name === 'CLS' ? value * 1000 : value),
    metric_delta: Math.round(name === 'CLS' ? delta * 1000 : delta),
    metric_rating: rating,
    non_interaction: true,
  });
}

/**
 * Handle metric report
 */
function handleMetric(metric) {
  // Add rating based on thresholds
  metric.rating = getRating(metric.name, metric.value);

  // Log to console (debug mode)
  logMetric(metric);

  // Send to analytics
  sendToAnalytics(metric);

  // Send to Google Analytics 4 (if available)
  sendToGA4(metric);

  // Custom event for other listeners
  window.dispatchEvent(
    new CustomEvent('web-vitals', {
      detail: metric,
    })
  );
}

/**
 * Initialize Web Vitals monitoring
 */
export function initWebVitals(options = {}) {
  // Merge options
  Object.assign(CONFIG, options);

  // Core Web Vitals
  onCLS(handleMetric);
  onFID(handleMetric); // Deprecated, use INP
  onLCP(handleMetric);

  // Additional metrics
  onFCP(handleMetric);
  onTTFB(handleMetric);
  onINP(handleMetric); // Replaces FID

  if (CONFIG.debug) {
    console.log('[Web Vitals] Monitoring initialized');
  }
}

/**
 * Get current metrics (for debugging)
 */
export async function getCurrentMetrics() {
  const metrics = {};

  const promises = [
    new Promise((resolve) => onLCP(resolve, { reportAllChanges: true })),
    new Promise((resolve) => onFID(resolve, { reportAllChanges: true })),
    new Promise((resolve) => onCLS(resolve, { reportAllChanges: true })),
    new Promise((resolve) => onFCP(resolve, { reportAllChanges: true })),
    new Promise((resolve) => onTTFB(resolve, { reportAllChanges: true })),
    new Promise((resolve) => onINP(resolve, { reportAllChanges: true })),
  ];

  const results = await Promise.allSettled(promises);

  results.forEach((result) => {
    if (result.status === 'fulfilled' && result.value) {
      const metric = result.value;
      metrics[metric.name] = {
        value: metric.value,
        rating: getRating(metric.name, metric.value),
        formatted: formatValue(metric.name, metric.value),
      };
    }
  });

  return metrics;
}

/**
 * Create performance observer for custom metrics
 */
export function observeCustomMetric(entryType, callback) {
  if (!('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        callback(entry);
      }
    });

    observer.observe({ entryTypes: [entryType] });
    return observer;
  } catch (error) {
    console.error('Failed to create PerformanceObserver:', error);
  }
}

/**
 * Monitor Long Tasks (blocking main thread)
 */
export function monitorLongTasks(threshold = 50) {
  return observeCustomMetric('longtask', (entry) => {
    const duration = entry.duration;

    if (duration > threshold) {
      console.warn(`[Performance] Long task detected: ${Math.round(duration)}ms`);

      if (CONFIG.reportToAnalytics) {
        sendToAnalytics({
          name: 'long-task',
          value: duration,
          url: window.location.href,
          timestamp: Date.now(),
        });
      }
    }
  });
}

/**
 * Monitor Navigation Timing
 */
export function getNavigationTiming() {
  if (!('performance' in window) || !performance.getEntriesByType) {
    return null;
  }

  const [navigation] = performance.getEntriesByType('navigation');
  if (!navigation) return null;

  return {
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp: navigation.connectEnd - navigation.connectStart,
    ttfb: navigation.responseStart - navigation.requestStart,
    download: navigation.responseEnd - navigation.responseStart,
    domInteractive: navigation.domInteractive - navigation.fetchStart,
    domComplete: navigation.domComplete - navigation.fetchStart,
    loadComplete: navigation.loadEventEnd - navigation.fetchStart,
  };
}

/**
 * Display metrics overlay (development only)
 */
export function showMetricsOverlay() {
  if (CONFIG.debug) {
    const overlay = document.createElement('div');
    overlay.id = 'web-vitals-overlay';
    overlay.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.85);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 999999;
      min-width: 200px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;

    const title = document.createElement('div');
    title.textContent = 'Core Web Vitals';
    title.style.cssText = 'font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #444; padding-bottom: 4px;';
    overlay.appendChild(title);

    const metricsDiv = document.createElement('div');
    overlay.appendChild(metricsDiv);

    document.body.appendChild(overlay);

    // Update metrics
    window.addEventListener('web-vitals', (event) => {
      const metric = event.detail;
      const color = getColor(metric.rating);

      let metricEl = overlay.querySelector(`[data-metric="${metric.name}"]`);
      if (!metricEl) {
        metricEl = document.createElement('div');
        metricEl.setAttribute('data-metric', metric.name);
        metricEl.style.cssText = 'margin: 4px 0;';
        metricsDiv.appendChild(metricEl);
      }

      metricEl.innerHTML = `
        ${metric.name}: <span style="color: ${color}">${formatValue(metric.name, metric.value)}</span>
        <span style="color: #888; font-size: 10px;">(${metric.rating})</span>
      `;
    });
  }
}

// Auto-initialize if not imported as module
if (typeof window !== 'undefined' && !window.__WEB_VITALS_INITIALIZED__) {
  window.__WEB_VITALS_INITIALIZED__ = true;
  initWebVitals();
}

// Export for manual initialization
export default initWebVitals;


/**
 * USAGE EXAMPLES
 */

// 1. Auto-initialize (import in main.js)
//    import './web-vitals-monitor.js';

// 2. Custom configuration
/*
import initWebVitals from './web-vitals-monitor.js';

initWebVitals({
  debug: true,
  analyticsEndpoint: '/api/metrics',
  reportToAnalytics: true,
  samplingRate: 0.5, // Report 50% of sessions
});
*/

// 3. Show overlay in development
/*
import { initWebVitals, showMetricsOverlay } from './web-vitals-monitor.js';

if (import.meta.env.DEV) {
  initWebVitals({ debug: true });
  showMetricsOverlay();
}
*/

// 4. Listen to custom events
/*
window.addEventListener('web-vitals', (event) => {
  const { name, value, rating } = event.detail;
  console.log(`${name}: ${value} (${rating})`);
});
*/

// 5. Monitor long tasks
/*
import { monitorLongTasks } from './web-vitals-monitor.js';
monitorLongTasks(50); // Warn if task > 50ms
*/

// 6. Get current metrics
/*
import { getCurrentMetrics } from './web-vitals-monitor.js';

const metrics = await getCurrentMetrics();
console.log('Current metrics:', metrics);
*/
