import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { dates } from "../data/dates";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../styles/Main.scss";

function Main() {
  const numberOfEvents = dates.length;
  const distanceBetweenPoints = 360 / numberOfEvents;

  const [currentEvent, setCurrentEvent] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const defaultTurnTime = 300;
  const [turnTime, setTurnTime] = useState<number>(defaultTurnTime);
  const [angle, setAngle] = useState<number>(distanceBetweenPoints);

  const yearStartRef = useRef<HTMLDivElement>(null);
  const [startYear, setStartYear] = useState<number>(
    Number(dates[0].events[0].date)
  );

  const yearEndRef = useRef<HTMLDivElement>(null);
  const [endYear, setEndYear] = useState<number>(
    Number(dates[0].events[dates.length - 1].date)
  );

  const bgCircleRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      sliderRef.current?.classList.add("slider_show");
      clearTimeout(timer);
    }, 300);
    return () => clearTimeout(timer);
  }, [currentEvent]);

  function hideSlider(func: () => void): void {
    sliderRef.current?.classList.remove("slider_show");
    const timer = setTimeout(() => {
      func();
      clearTimeout(timer);
    }, 300);
  }

  function amountOfPoints(index: number, total: number) {
    return `${(index + 1).toString().padStart(2, "0")}/${total
      .toString()
      .padStart(2, "0")}`;
  }

  function yearsAnimation(index: number): void {
    const newStartYear = Number(dates[index].events[0].date);
    const newEndYear = Number(
      dates[index].events[dates[index].events.length - 1].date
    );
    const startYears = newStartYear - startYear;
    const endYears = newEndYear - endYear;
    const animationTime = (turnTime + 300) / 2000;

    gsap.killTweensOf(yearStartRef.current);
    gsap.killTweensOf(yearEndRef.current);

    gsap.to(yearStartRef.current, {
      duration: animationTime,
      textContent: `+=${startYears}`,
      roundProps: "textContent",
      ease: "in",
      onUpdate: () => setStartYear(newStartYear),
    });

    gsap.to(yearEndRef.current, {
      duration: animationTime,
      textContent: `+=${endYears}`,
      roundProps: "textContent",
      ease: "out",
      onUpdate: () => setEndYear(newEndYear),
    });
  }

  function loadEvent(index: number): void {
    if (isAnimating || index < 0 || index >= numberOfEvents) return;
    setIsAnimating(true);

    gsap.killTweensOf(yearStartRef.current);
    gsap.killTweensOf(yearEndRef.current);

    yearsAnimation(index);

    bgCircleRef.current?.children[currentEvent].classList.remove(
      "spinner__area_active"
    );
    bgCircleRef.current?.children[index].classList.add("spinner__area_active");

    const angleOfRotation =
      distanceBetweenPoints - index * distanceBetweenPoints;
    setTurnTime(Math.abs(currentEvent - index) * defaultTurnTime);

    const timer = setTimeout(() => {
      setAngle(angleOfRotation);
      setIsAnimating(false);
      clearTimeout(timer);
    }, turnTime + 300);

    hideSlider(() => setCurrentEvent(index));
  }

  function loadNext() {
    loadEvent(currentEvent + 1);
  }

  function loadPrev() {
    loadEvent(currentEvent - 1);
  }

  return (
    <main className="main">
      <section className="main-content">
        <h1 className="main-content__heading heading">Исторические события</h1>
        <div className="main-content__years years">
          <p className="years_start" ref={yearStartRef}>
            {startYear}
          </p>
          <p className="years_end" ref={yearEndRef}>
            {endYear}
          </p>
        </div>
        <div className="main-content__spinner spinner">
          <div
            ref={bgCircleRef}
            className="spinner__bg-circle"
            style={
              {
                "--count": numberOfEvents,
                "--angle": angle + "deg",
                "--time": turnTime + "ms",
                "--delay": turnTime + 300 + "ms",
              } as React.CSSProperties
            }
          >
            {dates.map((item, index) => {
              const { category } = item;
              const id = index + 1;
              return (
                <div
                  key={index}
                  className={
                    "spinner__area " +
                    (currentEvent === index ? "spinner__area_active" : "")
                  }
                  style={{ "--i": id } as React.CSSProperties}
                  onClick={() => loadEvent(index)}
                >
                  <div className="spinner__circle-area">
                    <p className="spinner__circle">
                      {id}
                      <span className="spinner__title">{category}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="main-content__navigation navigation">
          <p className="navigation__pages">
            {amountOfPoints(currentEvent, numberOfEvents)}
          </p>
          <div className="navigation__buttons control-buttons">
            <button
              className="control-buttons__default control-buttons__prev"
              onClick={loadPrev}
              disabled={currentEvent === 0 || isAnimating}
            ></button>
            <button
              className="control-buttons__default control-buttons__next"
              onClick={loadNext}
              disabled={currentEvent === numberOfEvents - 1 || isAnimating}
            ></button>
          </div>
        </div>
        <div ref={sliderRef} className="main-content__slider slider">
          <p className="slider__mobile-title">{dates[currentEvent].category}</p>
          <button className="slider__btn slider__btn_prev"></button>
          <Swiper
            key={currentEvent}
            modules={[Navigation]}
            spaceBetween={80}
            slidesPerView={4}
            breakpoints={{
              1024: {
                slidesPerView: 3,
                spaceBetween: 30,
              },
              526: {
                slidesPerView: 2,
                spaceBetween: 25,
              },
              320: {
                slidesPerView: 1.5,
                spaceBetween: 20,
              },
            }}
            navigation={{
              nextEl: ".slider__btn_next",
              prevEl: ".slider__btn_prev",
            }}
          >
            {dates[currentEvent].events.map((item, index) => {
              const { date, event } = item;
              return (
                <SwiperSlide key={index} className="slider__slide">
                  <p className="slider__year">{date}</p>
                  <p className="slider__event-description">{event}</p>
                </SwiperSlide>
              );
            })}
          </Swiper>
          <button className="slider__btn slider__btn_next"></button>
        </div>
        <div className="events__control-buttons">
          {dates.map((item, index) => {
            return (
              <button
                className={
                  "events__button " +
                  (currentEvent === index ? "events__button_active" : "")
                }
                key={index}
                onClick={() => loadEvent(index)}
              ></button>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default Main;
