import { useEffect, useRef } from 'react';

function fitFrameToGuide(frame: HTMLIFrameElement | null) {
  const guideDocument = frame?.contentDocument;
  if (!frame || !guideDocument) return;
  const documentElement = guideDocument.documentElement;
  const body = guideDocument.body;
  const nextHeight = Math.max(
    documentElement.scrollHeight,
    documentElement.offsetHeight,
    body?.scrollHeight ?? 0,
    body?.offsetHeight ?? 0,
    780
  );
  frame.style.height = `${nextHeight}px`;
}

export function AfterHoursAutumnLeavesApp() {
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    let guideObserver: ResizeObserver | undefined;
    const observeGuide = () => {
      fitFrameToGuide(element);
      const guideDocument = element.contentDocument;
      if (!guideDocument?.body) return;
      guideObserver?.disconnect();
      guideObserver = new ResizeObserver(() => fitFrameToGuide(element));
      guideObserver.observe(guideDocument.body);
      guideObserver.observe(guideDocument.documentElement);
    };
    element.addEventListener('load', observeGuide);
    if (element.contentDocument?.readyState === 'complete') observeGuide();
    return () => {
      element.removeEventListener('load', observeGuide);
      guideObserver?.disconnect();
    };
  }, []);

  return <section className="after-hours-route after-hours-restored">
    <iframe
      ref={frame}
      className="after-hours-guide-frame restored"
      title="After Hours — Autumn Leaves"
      src="after-hours/autumn-leaves/guide/"
      scrolling="no"
    />
  </section>;
}
