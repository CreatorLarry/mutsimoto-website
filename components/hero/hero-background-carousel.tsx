"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const slides = [
  {
    src: "/images/hero-carousel/heavy-commercial.webp",
    label: "Heavy commercial filtration",
    position: "center 65%",
  },
  {
    src: "/images/hero-carousel/light-commercial.webp",
    label: "Light commercial and bus filtration",
    position: "center 65%",
  },
  {
    src: "/images/hero-carousel/automotive.webp",
    label: "Automotive filtration",
    position: "center 66%",
  },
  {
    src: "/images/hero-carousel/passenger-vehicles.webp",
    label: "Passenger vehicle filtration",
    position: "center 64%",
  },
  {
    src: "/images/hero-carousel/pickups.webp",
    label: "Pick-up filtration",
    position: "center 63%",
  },
  {
    src: "/images/hero-carousel/trucks.webp",
    label: "Truck filtration",
    position: "center 65%",
  },
  {
    src: "/images/hero-carousel/industrial.webp",
    label: "Industrial filtration",
    position: "center 63%",
  },
  {
    src: "/images/hero-carousel/agriculture.webp",
    label: "Agricultural filtration",
    position: "center 63%",
  },
  {
    src: "/images/hero-carousel/generators.webp",
    label: "Generator filtration",
    position: "center 62%",
  },
  {
    src: "/images/hero-carousel/railway.webp",
    label: "Railway engine filtration",
    position: "center 62%",
  },
  {
    src: "/images/hero-carousel/motorcycles.webp",
    label: "Motorcycle filtration",
    position: "center 62%",
  },
  {
    src: "/images/hero-carousel/custom-filters.webp",
    label: "Custom filter engineering",
    position: "center 56%",
  },
  {
    src: "/images/hero-carousel/motokool-coolant.webp",
    label: "MotoKool cooling protection",
    position: "center 55%",
  },
] as const;

const DISPLAY_TIME = 6500;
const FADE_TIME = 500;

export function HeroBackgroundCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const transitionTimer = useRef<number | null>(null);
  const isTransitioning = useRef(false);

  const moveTo = useCallback((nextIndex: number) => {
    if (nextIndex === activeIndex || isTransitioning.current) return;

    isTransitioning.current = true;
    setIsVisible(false);
    transitionTimer.current = window.setTimeout(() => {
      setActiveIndex(nextIndex);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setIsVisible(true);
          isTransitioning.current = false;
        });
      });
    }, FADE_TIME);
  }, [activeIndex]);

  useEffect(() => {
    if (isPaused) return;

    const timer = window.setTimeout(() => {
      moveTo((activeIndex + 1) % slides.length);
    }, DISPLAY_TIME);

    return () => window.clearTimeout(timer);
  }, [activeIndex, isPaused, moveTo]);

  useEffect(() => () => {
    if (transitionTimer.current !== null) {
      window.clearTimeout(transitionTimer.current);
    }
  }, []);

  const moveBy = (direction: number) => {
    moveTo((activeIndex + direction + slides.length) % slides.length);
  };

  return (
    <div
      className="hero-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Filtration range image carousel"
    >
      <div className="hero-carousel__images" aria-hidden="true">
        {slides.map((slide, index) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            style={{ objectPosition: slide.position }}
            className={`hero-carousel__image ${index === activeIndex && isVisible ? "hero-carousel__image--visible" : ""}`}
          />
        ))}
      </div>

      <div className="hero-carousel__shade" aria-hidden="true" />
      <div className="hero-carousel__controls">
        <button type="button" onClick={() => moveBy(-1)} aria-label="Show previous filtration range">
          <ChevronLeft aria-hidden="true" />
        </button>
        <p aria-live="polite">
          <span>{String(activeIndex + 1).padStart(2, "0")}</span>
          {slides[activeIndex].label}
        </p>
        <button type="button" onClick={() => moveBy(1)} aria-label="Show next filtration range">
          <ChevronRight aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setIsPaused((paused) => !paused)}
          aria-label={isPaused ? "Resume filtration image carousel" : "Pause filtration image carousel"}
        >
          {isPaused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}
