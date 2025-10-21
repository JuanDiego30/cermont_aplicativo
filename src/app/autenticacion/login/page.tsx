"use client";

import { useEffect, useRef } from "react";
import AnimatedLogo from "@/components/AnimatedLogo";
import LoginForm from "@/components/forms/LoginForm";

export default function PaginaLogin() {
  const auraRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const stackRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (prefersReducedMotion.matches) {
      return;
    }

    let dispose: (() => void) | undefined;

    const init = async () => {
      const { animate } = await import("animejs");
      type AnimationInstance = ReturnType<typeof animate>;

      const stop = (instance: AnimationInstance) => {
        if (instance && typeof instance.pause === "function") {
          instance.pause();
        }
      };

      const animations: AnimationInstance[] = [];
      const stack = stackRef.current;
      const card = cardRef.current;

      if (stack) {
        stack.style.opacity = "0";
        animations.push(
          animate(stack, {
            opacity: [0, 1],
            translateY: [24, 0],
            duration: 880,
            easing: "easeOutCubic",
          })
        );
      }

      if (card) {
        animations.push(
          animate(card, {
            boxShadow: [
              "0 18px 40px rgba(0,0,0,0.18)",
              "0 26px 48px rgba(25,118,210,0.28)",
            ],
            duration: 3600,
            easing: "easeInOutSine",
            direction: "alternate",
            loop: true,
            delay: 720,
          })
        );
      }

      const orbs = auraRefs.current.filter((element): element is HTMLSpanElement => Boolean(element));
      orbs.forEach((orb, index) => {
        const travel = 28 + index * 14;
        animations.push(
          animate(orb, {
            translateX: [-travel, travel],
            translateY: [-travel * 0.55, travel * 0.55],
            scale: [0.88 + index * 0.08, 1.16 + index * 0.1],
            opacity: [0.28, 0.66],
            duration: 5200 + index * 1100,
            easing: "easeInOutSine",
            direction: "alternate",
            loop: true,
            delay: 360 * index,
          })
        );
      });

      return () => {
        animations.forEach(stop);
      };
    };

    init()
      .then((cleanupFn) => {
        dispose = cleanupFn;
      })
      .catch((error) => {
        console.error("No se pudo animar la pantalla de login:", error);
      });

    return () => {
      dispose?.();
    };
  }, []);

  return (
    <main className="login-shell">
      <div className="login-auras" aria-hidden>
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            ref={(element) => {
              auraRefs.current[index] = element;
            }}
            className={`login-aura login-aura-${index + 1}`}
          />
        ))}
      </div>
      <div ref={stackRef} className="login-stack">
        <div className="brand-logo" aria-hidden>
          <AnimatedLogo size={124} />
        </div>
        <section ref={cardRef} className="login-card" aria-label="Tarjeta de inicio de sesión">
          <h1 className="login-title">Bienvenido</h1>
          <p className="login-subtitle">Ingresa con tu cuenta corporativa</p>
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
