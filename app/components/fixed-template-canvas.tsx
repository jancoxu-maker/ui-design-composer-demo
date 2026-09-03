'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  html: string;
  title: string;
  device: 'desktop' | 'mobile';
};

const viewports = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
} as const;

export function FixedTemplateCanvas({ html, title, device }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(760);
  const viewport = viewports[device];
  const fitHeight = device === 'mobile' ? 650 : 590;
  const scale = Math.min(1, Math.max(.12, (availableWidth - 18) / viewport.width), fitHeight / viewport.height);

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;
    const update = () => setAvailableWidth(Math.max(260, element.clientWidth));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={rootRef} className={`fixed-template-stage fixed-template-${device}`}>
    <div className="fixed-template-viewport" style={{ width: Math.round(viewport.width * scale), height: Math.round(viewport.height * scale) }}>
      <div className="fixed-template-canvas" style={{ width: viewport.width, height: viewport.height, transform: `scale(${scale})` }}>
        <iframe title={title} srcDoc={html} sandbox=""/>
      </div>
    </div>
  </div>;
}
