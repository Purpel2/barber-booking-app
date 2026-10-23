"use client";

import { ReactNode } from "react";
import { motion, HTMLMotionProps } from "motion/react";

interface MotionFadeProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
}

/**
 * Płynny komponent wejścia wyzwalany po wejściu elementu w pole widzenia użytkownika (scroll reveal).
 * @param props - Właściwości komponentu: dzieci, opóźnienie, czas trwania, przesunięcie Y i klasy CSS.
 * @returns - Animowany kontener motion.div.
 */
export function MotionFade({
  children,
  className = "",
  delay = 0,
  duration = 0.65,
  yOffset = 24,
  ...props
}: MotionFadeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Kontener kaskadowy (stagger) dla siatek kafelków i list (np. barberzy, usługi, cechy).
 * Automatycznie animuje dzieci jedno po drugim z zachowaniem płynnego odstępu czasowego.
 * @param props - Właściwości kontenera: dzieci, opóźnienie kaskady i klasy CSS.
 * @returns - Kontener motion.div zarządzający czasem wejścia dzieci.
 */
export function MotionStaggerContainer({
  children,
  className = "",
  staggerDelay = 0.12,
  ...props
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
} & HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Pojedynczy element siatki kaskadowej dziedziczący animację z MotionStaggerContainer.
 * @param props - Właściwości elementu: dzieci, przesunięcie Y i klasy CSS.
 * @returns - Animowany element siatki motion.div.
 */
export function MotionStaggerItem({
  children,
  className = "",
  yOffset = 24,
  ...props
}: {
  children: ReactNode;
  className?: string;
  yOffset?: number;
} & HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: yOffset },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            ease: [0.21, 0.47, 0.32, 0.98],
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Komponent wyzwalający animację natychmiast po załadowaniu widoku (dla sekcji Hero).
 * @param props - Właściwości komponentu Hero: dzieci, opóźnienie, czas trwania i przesunięcie Y.
 * @returns - Animowany kontener sekcji Hero.
 */
export function MotionHeroFade({
  children,
  className = "",
  delay = 0,
  duration = 0.8,
  yOffset = 28,
  ...props
}: MotionFadeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
