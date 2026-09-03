'use client';

import { useEffect, useRef, useState } from 'react';

export type DeliveryDevice = 'desktop' | 'mobile' | 'compare';
export type DeliveryScaleMode = 'fit' | 'actual';

type Props = {
  html: string;
  title: string;
  device: DeliveryDevice;
  scaleMode: DeliveryScaleMode;
};

const devices = {
  desktop: { label: 'WEB', width: 1440, height: 900 },
  mobile: { label: 'MOBILE', width: 390, height: 844 },
} as const;

function containPreviewNavigation(iframe: HTMLIFrameElement) {
  const document = iframe.contentDocument;
  if (!document || document.documentElement.dataset.previewNavigationReady === 'true') return;
  document.documentElement.dataset.previewNavigationReady = 'true';
  document.addEventListener('click', (event) => {
    const target = event.target as { closest?: (selector: string) => HTMLAnchorElement | null } | null;
    const anchor = target?.closest?.('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href')?.trim() || '';
    event.preventDefault();
    if (!href.startsWith('#')) return;
    const id = decodeURIComponent(href.slice(1));
    const destination = id ? document.getElementById(id) : document.documentElement;
    const reducedMotion = iframe.contentWindow?.matchMedia('(prefers-reduced-motion: reduce)').matches;
    destination?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    anchor.focus({ preventScroll: true });
  });
  document.addEventListener('submit', (event) => event.preventDefault());
}

function DeviceFrame({ html, title, kind, availableWidth, scaleMode, fitHeight }: { html: string; title: string; kind: 'desktop' | 'mobile'; availableWidth: number; scaleMode: DeliveryScaleMode; fitHeight: number }) {
  const config = devices[kind];
  const scale = scaleMode === 'actual' ? 1 : Math.min(1, Math.max(.12, (availableWidth - 12) / config.width), fitHeight / config.height);
  return <section className={`delivery-device delivery-device-${kind}`} style={{ width: scaleMode === 'actual' ? config.width : Math.round(config.width * scale) }}>
    <header><b>{config.label}</b><span>{config.width} × {config.height}</span><i>{Math.round(scale * 100)}%</i></header>
    <div className="delivery-device-window" style={{ width: Math.round(config.width * scale), height: Math.round(config.height * scale) }}>
      <div className="delivery-device-canvas" style={{ width: config.width, height: config.height, transform: `scale(${scale})` }}>
        <iframe title={`${title} · ${config.label}`} sandbox="allow-same-origin" srcDoc={html} onLoad={(event) => containPreviewNavigation(event.currentTarget)}/>
      </div>
    </div>
  </section>;
}

export function ResponsiveDeliveryPreview({ html, title, device, scaleMode }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(760);

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;
    const update = () => setAvailableWidth(Math.max(280, element.clientWidth));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const compare = device === 'compare';
  const desktopWidth = compare ? availableWidth * .68 : availableWidth;
  const mobileWidth = compare ? availableWidth * .32 : availableWidth;
  return <div ref={rootRef} className={`delivery-preview-stage mode-${device} scale-${scaleMode}`}>
    <div className="delivery-preview-track">
      {(device === 'desktop' || compare) && <DeviceFrame html={html} title={title} kind="desktop" availableWidth={desktopWidth} scaleMode={scaleMode} fitHeight={compare ? 500 : 560}/>}
      {(device === 'mobile' || compare) && <DeviceFrame html={html} title={title} kind="mobile" availableWidth={mobileWidth} scaleMode={scaleMode} fitHeight={compare ? 500 : 590}/>}
    </div>
  </div>;
}
