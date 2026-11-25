import { useEffect, useState } from 'react';

/** Phones (below Tailwind's sm breakpoint). */
export const PHONE_MEDIA_QUERY = '(max-width: 639px)';
/** The phone header only slides away once the page is scrolled past this point. */
export const HEADER_AUTOHIDE_AFTER_PX = 160;
const SCROLL_DELTA_PX = 6;

/**
 * Phones: the sticky header slides away while scrolling down — so 3 rows of postcards fit on one
 * screen — and comes back on any scroll up. Larger screens keep it in place.
 */
export function useAutoHideHeader(): [hidden: boolean, reveal: () => void] {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const phone = window.matchMedia(PHONE_MEDIA_QUERY);
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - lastY;
      if (!phone.matches || y < HEADER_AUTOHIDE_AFTER_PX) setHidden(false);
      else if (delta > SCROLL_DELTA_PX) setHidden(true);
      else if (delta < -SCROLL_DELTA_PX) setHidden(false);
      if (Math.abs(delta) > SCROLL_DELTA_PX || y < HEADER_AUTOHIDE_AFTER_PX) lastY = y;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const onBreakpoint = () => {
      if (!phone.matches) setHidden(false);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    phone.addEventListener('change', onBreakpoint);
    return () => {
      window.removeEventListener('scroll', onScroll);
      phone.removeEventListener('change', onBreakpoint);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return [hidden, () => setHidden(false)];
}

/**
 * Smoothly scrolls so `element` sits `gap` px below the sticky header — or, scrolling down on a
 * phone (where the header slides away), `gap` px below the top of the screen.
 */
export function scrollBelowHeader(element: HTMLElement, gap = 12): void {
  const header = document.getElementById('site-header');
  let target = element.getBoundingClientRect().top + window.scrollY - gap;
  const headerSlidesAway =
    target > window.scrollY && target > HEADER_AUTOHIDE_AFTER_PX && window.matchMedia(PHONE_MEDIA_QUERY).matches;
  if (header && !headerSlidesAway) target -= header.getBoundingClientRect().height;
  window.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
}
