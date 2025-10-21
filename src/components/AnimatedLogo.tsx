'use client';

import { useEffect, useId, useRef } from 'react';
import Image from 'next/image';

interface AnimatedLogoProps {
  /**
   * Controla el tamaño cuadrado del badge del logo.
   * Si se omite, se usa 68px por defecto.
   */
  size?: number;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  /** Habilita animación de entrada (default: true) */
  enableEntrance?: boolean;
  /** Habilita pulso y glow continuo (default: true) */
  enablePulse?: boolean;
}

const INITIAL_POINTS = '64 128 8.574 96 8.574 32 64 0 119.426 32 119.426 96';
const ACCENT_POINTS = '64 68.64 8.574 100 63.446 67.68 64 4 64.554 67.68 119.426 100';

export function AnimatedLogo({
  size = 68,
  width,
  height,
  priority = true,
  className = '',
  enableEntrance = true,
  enablePulse = true,
}: AnimatedLogoProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const polygonRef = useRef<SVGPolygonElement>(null);
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);

  const filterId = useId();
  const gradientId = `${filterId}-gradient`;
  const displacementId = `${filterId}-displacement`;

  useEffect(() => {
    let dispose: (() => void) | undefined;

    const initAnimations = async () => {
      const { animate } = await import('animejs');
      type AnimationInstance = ReturnType<typeof animate>;

      const stop = (instance: AnimationInstance) => {
        if (typeof instance === 'object' && instance !== null && 'pause' in instance) {
          const candidate = instance as { pause?: unknown };
          if (typeof candidate.pause === 'function') {
            (candidate.pause as () => void)();
          }
        }
      };

      const wrapper = wrapperRef.current;
      const content = contentRef.current;
      const shine = shineRef.current;
      const glow = glowRef.current;
      const polygon = polygonRef.current;
      const turbulence = turbulenceRef.current;
      const displacement = displacementRef.current;
      const svg = svgRef.current;

      if (!wrapper) return;

      const animations: AnimationInstance[] = [];

      if (enableEntrance) {
        wrapper.style.opacity = '0';
        animations.push(
          animate(wrapper, {
            opacity: [0, 1],
            translateY: [24, 0],
            scale: [0.9, 1],
            duration: 1100,
            easing: 'easeOutCubic',
          })
        );
        animations.push(
          animate(wrapper, {
            rotate: ['-2deg', '0deg'],
            duration: 640,
            easing: 'easeOutExpo',
            delay: 420,
          })
        );
      } else {
        wrapper.style.opacity = '1';
        wrapper.style.transform = 'none';
      }

      if (enablePulse) {
        const pulseDelay = enableEntrance ? 1400 : 200;
        animations.push(
          animate(wrapper, {
            scale: [1, 1.028, 1],
            duration: 3400,
            easing: 'easeInOutSine',
            loop: true,
            delay: pulseDelay,
          })
        );
        animations.push(
          animate(wrapper, {
            translateY: [0, -2.5, 0],
            duration: 4600,
            easing: 'easeInOutQuad',
            loop: true,
            delay: pulseDelay,
          })
        );

        if (glow) {
          animations.push(
            animate(glow, {
              opacity: [0.18, 0.45, 0.18],
              duration: 3600,
              easing: 'easeInOutSine',
              loop: true,
              delay: pulseDelay + 200,
            })
          );
        }
      }

      if (shine) {
        animations.push(
          animate(shine, {
            translateX: ['-130%', '130%'],
            opacity: [0, 0.9, 0],
            duration: 2800,
            easing: 'easeInOutQuad',
            loop: true,
            delay: enableEntrance ? 900 : 200,
          })
        );
      }

      if (turbulence) {
        animations.push(
          animate(turbulence, {
            baseFrequency: [0.012, 0.055],
            duration: 4200,
            easing: 'easeInOutSine',
            direction: 'alternate',
            loop: true,
          })
        );
      }

      if (displacement) {
        animations.push(
          animate(displacement, {
            scale: [6, 18],
            duration: 4200,
            easing: 'easeInOutSine',
            direction: 'alternate',
            loop: true,
          })
        );
      }

      if (polygon) {
        polygon.setAttribute('points', INITIAL_POINTS);
        animations.push(
          animate(polygon, {
            points: [INITIAL_POINTS, ACCENT_POINTS],
            duration: 5200,
            easing: 'easeInOutCubic',
            direction: 'alternate',
            loop: true,
          })
        );
      }

      if (svg) {
        animations.push(
          animate(svg, {
            rotate: ['-2deg', '2deg'],
            duration: 6800,
            easing: 'easeInOutSine',
            direction: 'alternate',
            loop: true,
          })
        );
      }

      let handleMouseEnter: (() => void) | undefined;
      let handleMouseLeave: (() => void) | undefined;

      if (content) {
        handleMouseEnter = () => {
          animate(content, {
            scale: 1.08,
            duration: 520,
            easing: 'easeOutElastic(1, 0.55)',
          });
        };

        handleMouseLeave = () => {
          animate(content, {
            scale: 1,
            duration: 420,
            easing: 'easeOutExpo',
          });
        };

        content.addEventListener('mouseenter', handleMouseEnter);
        content.addEventListener('mouseleave', handleMouseLeave);
      }

      const cleanup = () => {
        animations.forEach(stop);

        if (content && handleMouseEnter) {
          content.removeEventListener('mouseenter', handleMouseEnter);
        }

        if (content && handleMouseLeave) {
          content.removeEventListener('mouseleave', handleMouseLeave);
        }
      };

      return cleanup;
    };

    initAnimations()
      .then((cleanupFn) => {
        dispose = cleanupFn;
      })
      .catch((error) => {
        console.error('Error cargando animaciones:', error);
      });

    return () => {
      dispose?.();
    };
  }, [enableEntrance, enablePulse]);

  const computedWidth = width ?? size;
  const computedHeight = height ?? size;

  const wrapperStyle = {
    opacity: enableEntrance ? 0 : 1,
    width: computedWidth,
    height: computedHeight,
  } as const;

  return (
    <div
      ref={wrapperRef}
      className={`relative inline-flex select-none transition-transform duration-500 ${className}`}
      style={wrapperStyle}
    >
      <div
        ref={contentRef}
        className="group relative flex h-full w-full items-center justify-center overflow-visible"
      >
        <span
          ref={glowRef}
          aria-hidden
          className="pointer-events-none absolute -inset-[35%] rounded-full blur-2xl transition-opacity"
          style={{
            opacity: 0.24,
            background:
              "radial-gradient(circle at 35% 35%, rgba(25,118,210,0.38) 0%, rgba(33,150,243,0.2) 45%, rgba(108,169,71,0.18) 75%, rgba(108,169,71,0.04) 100%)",
          }}
        />

        <svg
          ref={svgRef}
          className="absolute inset-0 z-0 h-full w-full text-[#64b5f6]"
          viewBox="0 0 128 128"
          role="presentation"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1976d2" />
              <stop offset="52%" stopColor="#2196f3" />
              <stop offset="100%" stopColor="#6ca947" />
            </linearGradient>
            <filter id={displacementId}>
              <feTurbulence
                ref={turbulenceRef}
                type="turbulence"
                numOctaves="2"
                baseFrequency="0.02"
                result="turbulence"
              />
              <feDisplacementMap
                ref={displacementRef}
                in2="turbulence"
                in="SourceGraphic"
                scale="12"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>

          <polygon
            ref={polygonRef}
            points={INITIAL_POINTS}
            fill={`url(#${gradientId})`}
            filter={`url(#${displacementId})`}
            opacity="0.9"
          />
          <polygon
            points={INITIAL_POINTS}
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1.5"
          />
        </svg>

        <div className="relative z-10 flex h-[64%] w-[64%] items-center justify-center">
          <Image
            src="/logo-cermont.png"
            alt="Cermont"
            fill
            sizes={`${Math.round(Math.min(computedWidth, computedHeight) * 0.64)}px`}
            priority={priority}
            className="object-contain drop-shadow-[0_6px_18px_rgba(15,23,42,0.45)] transition-transform duration-500 group-hover:scale-[1.05]"
          />
        </div>

        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
          <div
            ref={shineRef}
            className="absolute inset-y-0 -left-1 w-1/3 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-0"
          />
        </div>
      </div>
    </div>
  );
}

export default AnimatedLogo;