import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Sun, X, Globe, LocateFixed, Loader2 } from 'lucide-react';
import { formatAccuracy, GeoStatus } from '../lib/geo';
import { fetchUsdToKhr, formatKhr, UsdKhrRate, usdToKhr } from '../lib/fx';
import { UserLocation } from '../types/contracts';

interface GeoTimeFooterBarProps {
  /** Browser geolocation status (detecting / errors / last detection). */
  geoStatus: GeoStatus;
  isSignedIn: boolean;
  /** The signed-in person's location: registered, then updated by each auto-detection. */
  sessionLocation: UserLocation | null;
  onDetectLocation: () => void;
  onRequestRegister: () => void;
}

// "Siem Reap, Cambodia 🇰🇭" → suburb "Siem Reap", region "Cambodia 🇰🇭" (split at the last comma).
function splitLocationLabel(label: string): [string, string] {
  const cut = label.lastIndexOf(',');
  return cut > 0 ? [label.slice(0, cut).trim(), label.slice(cut + 1).trim()] : [label.trim(), ''];
}

const DEFAULT_SUBURB = 'BKK1 (បឹងកេងកងទី១)';
const DEFAULT_STATE_REGION = 'Phnom Penh, Cambodia 🇰🇭';

export const GeoTimeFooterBar: React.FC<GeoTimeFooterBarProps> = ({
  geoStatus,
  isSignedIn,
  sessionLocation,
  onDetectLocation,
  onRequestRegister,
}) => {
  const [now, setNow] = useState(new Date());
  const [suburb, setSuburb] = useState(DEFAULT_SUBURB);
  const [stateRegion, setStateRegion] = useState(DEFAULT_STATE_REGION);
  const [weather, setWeather] = useState('31°C Tropical Angkor Sun ☀️');
  const [use24Hour, setUse24Hour] = useState(false);
  const [dateFormat, setDateFormat] = useState<'short' | 'iso'>('short');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  // True while suburb/region show the signed-in person's location (cleared by manual edits).
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  // US$1 → KHR rate (prices across the app are USD only)
  const [fx, setFx] = useState<UsdKhrRate | null>(null);
  const [fxFailed, setFxFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetchUsdToKhr(controller.signal)
      .then(setFx)
      .catch(() => {
        if (!controller.signal.aborted) setFxFailed(true);
      });
    return () => controller.abort();
  }, []);

  const showAutoBadge =
    isAutoFilled && sessionLocation?.source === 'auto-detected' && sessionLocation.accuracyM !== undefined;

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Registering, signing in and each re-detect fill the footer; people can still adjust it in the popup.
  useEffect(() => {
    if (!sessionLocation) return;
    const [place, region] = splitLocationLabel(sessionLocation.label);
    setSuburb(place);
    setStateRegion(region);
    setIsAutoFilled(true);
  }, [sessionLocation]);

  // Don't leave someone's detected location on screen after they sign out.
  useEffect(() => {
    if (isSignedIn || !isAutoFilled) return;
    setSuburb(DEFAULT_SUBURB);
    setStateRegion(DEFAULT_STATE_REGION);
    setIsAutoFilled(false);
  }, [isSignedIn, isAutoFilled]);

  const formattedTime = now.toLocaleTimeString('en-US', {
    hour12: !use24Hour,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const formattedDate =
    dateFormat === 'iso'
      ? now.toISOString().slice(0, 10)
      : now.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });

  // Locked to US$1: the footer shows the day's rate, e.g. "$1 = 4,081 ៛".
  const khrText = fx ? formatKhr(usdToKhr(1, fx.rate)) : fxFailed ? 'rate unavailable' : '…';

  return (
    <>
      {/* Thin Geo, USD→KHR & Time Footer Bar */}
      <footer
        data-testid="site-footer"
        className="fixed bottom-0 inset-x-0 z-40 bg-[#0F2557] dark:bg-slate-950 text-amber-100 border-t border-amber-500/30 px-3 sm:px-4 py-1 text-[11px] font-semibold flex items-center justify-between gap-2 shadow-lg"
      >
        <button
          type="button"
          onClick={() => setIsPopupOpen(true)}
          data-agent-id="geo-time-footer-bar"
          data-testid="geo-time-footer-bar"
          aria-label="Open location, weather and time settings"
          className="min-w-0 flex items-center gap-2 py-0.5 rounded hover:text-white text-left"
        >
          {geoStatus.state === 'detecting' ? (
            <Loader2 className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-spin" />
          ) : (
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          )}
          <span className="truncate" data-testid="footer-location-label">
            {geoStatus.state === 'detecting' && isSignedIn
              ? 'Detecting your location…'
              : stateRegion
                ? `${suburb}, ${stateRegion}`
                : suburb}
          </span>
          {showAutoBadge && sessionLocation?.accuracyM !== undefined && (
            <span
              data-testid="footer-location-auto-badge"
              className="hidden sm:inline shrink-0 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/25 text-emerald-200 border border-emerald-400/40"
              title={`Auto-detected ${formatAccuracy(sessionLocation.accuracyM)}`}
            >
              AUTO {formatAccuracy(sessionLocation.accuracyM)}
            </span>
          )}
          <span className="hidden lg:inline-flex items-center gap-1 text-amber-300 shrink-0">
            <span className="opacity-40 mr-1">•</span>
            <Sun className="w-3 h-3" /> {weather}
          </span>
        </button>

        {/* US$1 in riel (rate: Frankfurter), locked at $1 */}
        <div
          data-agent-id="footer-fx"
          data-testid="footer-fx"
          title={
            fx
              ? `1 USD = ${fx.rate.toLocaleString('en-US', { maximumFractionDigits: 2 })} KHR · rate of ${fx.date} · Frankfurter`
              : undefined
          }
          className="shrink-0 flex items-center gap-1 tabular-nums"
        >
          <span aria-hidden="true">💱</span>
          <span className="sr-only">One US dollar equals</span>
          <span aria-hidden="true" data-testid="footer-usd" className="text-amber-300 font-bold">
            $1
          </span>
          <span aria-hidden="true" className="opacity-60">
            =
          </span>
          <span data-testid="footer-khr" className="font-extrabold text-amber-300 whitespace-nowrap">
            {khrText}
          </span>
          <span className="hidden md:inline text-[9px] opacity-60">
            KHR<span className="sr-only"> (Cambodian riel)</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsPopupOpen(true)}
          aria-label="Open date and time settings"
          className="hidden sm:flex items-center gap-2 tabular-nums shrink-0 py-0.5 rounded hover:text-white"
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">{formattedDate}</span>
          <span className="opacity-40 hidden md:inline">•</span>
          <span className="text-amber-300 font-bold">{formattedTime}</span>
        </button>
      </footer>

      {/* Centered Popup Modal (No Scrollbar) */}
      {isPopupOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPopupOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="geo-modal-title"
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-amber-500/40 space-y-4 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3
                  id="geo-modal-title"
                  className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2"
                >
                  <Globe className="w-4 h-4 text-amber-500" />
                  Suburb, Weather &amp; Time Settings
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Adapted from KhmerApp GeoTime Widget • Zero Scrollbar
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPopupOpen(false)}
                data-agent-id="close-geo-time-modal-btn"
                data-testid="close-geo-time-modal-btn"
                aria-label="Close Geo and Time Settings"
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-amber-500 hover:text-slate-950 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Auto-detected geolocation */}
            <div
              aria-live="polite"
              className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2"
            >
              {!isSignedIn ? (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-700 dark:text-slate-300">
                    📍 Register to auto-detect your location.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPopupOpen(false);
                      onRequestRegister();
                    }}
                    data-agent-id="geo-register-to-detect-btn"
                    data-testid="geo-register-to-detect-btn"
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-[#0F2557] text-amber-300 text-[11px] font-extrabold"
                  >
                    Register
                  </button>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-700 dark:text-slate-300">
                    {geoStatus.state === 'detecting' && 'Detecting your location…'}
                    {geoStatus.state === 'error' && (
                      <span className="font-bold text-rose-700 dark:text-rose-300">
                        {geoStatus.message}
                      </span>
                    )}
                    {geoStatus.state !== 'detecting' && geoStatus.state !== 'error' &&
                      (sessionLocation ? (
                        <>
                          📍 Your location: <strong>{sessionLocation.label}</strong>{' '}
                          {sessionLocation.source === 'auto-detected' && sessionLocation.accuracyM !== undefined
                            ? `(auto-detected ${formatAccuracy(sessionLocation.accuracyM)})`
                            : '(entered by you)'}
                          . Adjust below if it's not quite right.
                        </>
                      ) : (
                        '📍 Location not detected yet.'
                      ))}
                  </span>
                  <button
                    type="button"
                    onClick={onDetectLocation}
                    disabled={geoStatus.state === 'detecting'}
                    data-agent-id="geo-redetect-location-btn"
                    data-testid="geo-redetect-location-btn"
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-extrabold flex items-center gap-1 disabled:opacity-50"
                  >
                    <LocateFixed className="w-3 h-3" />
                    {geoStatus.state === 'idle' ? 'Detect' : 'Re-detect'}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Suburb / Sangkat / District (សង្កាត់ / ខណ្ឌ)
                </label>
                <input
                  type="text"
                  value={suburb}
                  onChange={(e) => {
                    setSuburb(e.target.value);
                    setIsAutoFilled(false);
                  }}
                  data-agent-id="geo-suburb-input"
                  data-testid="geo-suburb-input"
                  aria-label="Suburb or Sangkat"
                  className="w-full h-9 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    City / State
                  </label>
                  <input
                    type="text"
                    value={stateRegion}
                    onChange={(e) => {
                      setStateRegion(e.target.value);
                      setIsAutoFilled(false);
                    }}
                    data-agent-id="geo-state-input"
                    data-testid="geo-state-input"
                    aria-label="City or State"
                    className="w-full h-9 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Local WeatherPreset
                  </label>
                  <select
                    value={weather}
                    onChange={(e) => setWeather(e.target.value)}
                    data-agent-id="geo-weather-select"
                    data-testid="geo-weather-select"
                    aria-label="Weather Condition"
                    className="w-full h-9 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="31°C Tropical Angkor Sun ☀️">31°C Angkor Sun ☀️</option>
                    <option value="28°C Mekong River Breeze 🌤️">28°C Mekong Breeze 🌤️</option>
                    <option value="26°C Monsoon Afternoon Rain 🌧️">26°C Monsoon Rain 🌧️</option>
                    <option value="22°C Sydney Coastal Cool 🇦🇺">22°C Sydney Cool 🇦🇺</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUse24Hour(!use24Hour)}
                  data-agent-id="toggle-24h-time-btn"
                  data-testid="toggle-24h-time-btn"
                  aria-label="Toggle 12-hour or 24-hour clock"
                  className="h-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-amber-500"
                >
                  Clock: {use24Hour ? '24-Hour' : '12-Hour (AM/PM)'}
                </button>
                <button
                  type="button"
                  onClick={() => setDateFormat(dateFormat === 'short' ? 'iso' : 'short')}
                  data-agent-id="toggle-date-format-btn"
                  data-testid="toggle-date-format-btn"
                  aria-label="Toggle Date Format"
                  className="h-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-amber-500"
                >
                  Date: {dateFormat === 'short' ? 'DD MMM YYYY' : 'YYYY-MM-DD'}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsPopupOpen(false)}
              data-agent-id="save-geo-time-settings-btn"
              data-testid="save-geo-time-settings-btn"
              aria-label="Save Suburb and Time Preferences"
              className="w-full h-10 rounded-xl bg-[#0F2557] dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-extrabold shadow-md hover:opacity-95 transition-opacity"
            >
              Save Geo &amp; Time Preferences
            </button>
          </div>
        </div>
      )}
    </>
  );
};
