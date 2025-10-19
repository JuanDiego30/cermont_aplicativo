'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

/**
 * Logo animado CERMONT
 * Animaciones enriquecidas con anime.js para un efecto más sofisticado:
 * - Timeline de entrada con desplazamiento, escala y ligera rotación
 * - Pulso y flotación continuos opcionales
 * - Brillo lateral (shine) en bucle y halo dinámico
 * - Animación de hover con rebote elástico
 */

interface AnimatedLogoProps {
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  /** Habilitar animación de entrada (default: true) */
  enableEntrance?: boolean;
  /** Habilitar efecto de respiración y glow (default: true) */
  enablePulse?: boolean;
}

export function AnimatedLogo({
  width = 110,
  height = 26,
  priority = true,
  className = '',
  enableEntrance = true,
  enablePulse = true
}: AnimatedLogoProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let dispose: (() => void) | undefined;

    const initAnimations = async () => {
      // Carga dinámica para evitar problemas SSR y usar la API de v4
      const { animate } = await import('animejs');

      if (!wrapperRef.current) return;

      const wrapper = wrapperRef.current;
      const content = contentRef.current;
      const shine = shineRef.current;
      const glow = glowRef.current;
  const animations: Array<ReturnType<typeof animate>> = [];

      if (enableEntrance) {
        wrapper.style.opacity = '0';

        // 1) Primera parte de entrada
        const a1 = animate(wrapper, {
          opacity: [0, 1],
          translateY: [24, 0],
          scale: [0.92, 1],
          duration: 1100,
          easing: 'easeOutCubic'
        });
        animations.push(a1);

        // 2) Ligera rotación solapada (-=700) -> delay 400ms
        const a2 = animate(wrapper, {
          rotate: ['-2deg', '0deg'],
          duration: 600,
          easing: 'easeOutExpo',
          delay: 400
        });
        animations.push(a2);
      } else {
        wrapper.style.opacity = '1';
        wrapper.style.transform = 'none';
      }

      if (enablePulse) {
        const pulseDelay = enableEntrance ? 1400 : 200;

        const pulse = animate(wrapper, {
          scale: [1, 1.028, 1],
          duration: 3400,
          easing: 'easeInOutSine',
          loop: true,
          delay: pulseDelay
        });
        animations.push(pulse);

        const floaty = animate(wrapper, {
          translateY: [0, -2.5, 0],
          duration: 4600,
          easing: 'easeInOutQuad',
          loop: true,
          delay: pulseDelay
        });
        animations.push(floaty);

        if (glow) {
          const glowAnim = animate(glow, {
            opacity: [0.18, 0.45, 0.18],
            duration: 3600,
            easing: 'easeInOutSine',
            loop: true,
            delay: pulseDelay + 200
          });
          animations.push(glowAnim);
        }
      }

      if (shine) {
        const shineAnim = animate(shine, {
          translateX: ['-130%', '130%'],
          opacity: [0, 0.9, 0],
          duration: 2800,
          easing: 'easeInOutQuad',
          loop: true,
          delay: enableEntrance ? 900 : 200
        });
        animations.push(shineAnim);
      }

      let handleMouseEnter: (() => void) | undefined;
      let handleMouseLeave: (() => void) | undefined;

      if (content) {
        handleMouseEnter = () => {
          animate(content, {
            scale: 1.08,
            rotate: '-1.2deg',
            duration: 520,
            easing: 'easeOutElastic(1, 0.55)'
          });
        };

        handleMouseLeave = () => {
          animate(content, {
            scale: 1,
            rotate: '0deg',
            duration: 420,
            easing: 'easeOutExpo'
          });
        };

        content.addEventListener('mouseenter', handleMouseEnter);
        content.addEventListener('mouseleave', handleMouseLeave);
      }

      const cleanup = () => {
        animations.forEach(animation => {
          try { (animation as any).pause?.(); } catch {}
        });

        if (content && handleMouseEnter) {
          content.removeEventListener('mouseenter', handleMouseEnter);
        }

        if (content && handleMouseLeave) {
          content.removeEventListener('mouseleave', handleMouseLeave);
        }

        // No usamos remove en v4; dejamos pausadas y limpiamos listeners.
      };

      return cleanup;
    };

    initAnimations()
      .then(cleanupFn => {
        dispose = cleanupFn;
      })
      .catch(err => {
        console.error('Error cargando animaciones:', err);
      });

    return () => {
      dispose?.();
    };
  }, [enableEntrance, enablePulse]);

  return (
    <div
      ref={wrapperRef}
      className={`relative inline-block select-none drop-shadow-sm ${className}`}
      style={{ opacity: enableEntrance ? 0 : 1 }}
    >
      <div
        ref={contentRef}
        className="group relative inline-flex items-center justify-center overflow-visible rounded-lg px-2 py-1"
      >
        <span
          ref={glowRef}
          aria-hidden
          className="pointer-events-none absolute -inset-3 rounded-full bg-cyan-400/30 blur-xl transition-opacity"
          style={{ opacity: 0.25 }}
        />
        <Image
          src="/logo-cermont.png"
          alt="Cermont"
          width={width}
          height={height}
          priority={priority}
          className="relative z-10 transition-all duration-500"
        />
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-md">
          <div
            ref={shineRef}
            className="absolute inset-y-0 -left-1 w-1/3 -translate-x-full bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-0"
          />
        </div>
      </div>
    </div>
  );
}

export default AnimatedLogo;