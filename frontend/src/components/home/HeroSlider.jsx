import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ChevronLeft = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRight = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export default function HeroSlider({ slides, autoplay = true, interval = 5000 }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    if (!autoplay || slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoplay, interval, slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();

    setTouchStart(0);
    setTouchEnd(0);
  };

  if (slides.length === 0) return null;

  const getPrevIndex = () => (currentSlide - 1 + slides.length) % slides.length;
  const getNextIndex = () => (currentSlide + 1) % slides.length;

  return (
    <section className="relative w-full bg-[#111111] overflow-hidden pb-[14px]">
      {/* Mobile View - Full Width */}
      <div className="block md:hidden">
        <div 
          className="relative w-full"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Link to={slides[currentSlide].link} className="block relative group">
            <img
              src={slides[currentSlide].mobileImage || slides[currentSlide].image}
              alt={slides[currentSlide].title || 'Banner'}
              className="w-full h-auto object-cover"
            />
            {/* Overlay for mobile */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </Link>
        </div>
      </div>

      {/* Desktop View - Full Width */}
      <div className="hidden md:block relative w-full">
        {/* Main Slide - Full Width */}
        <Link to={slides[currentSlide].link} className="block relative group z-10">
          <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title || 'Banner'}
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          {/* Overlay for desktop */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        </Link>

        {/* Navigation Arrows - Desktop */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#111111]/80 backdrop-blur-sm hover:bg-gradient-to-r hover:from-[#E08713] hover:to-[#C72C15] border border-[#C72C15] flex items-center justify-center transition-all z-20 shadow-lg"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#111111]/80 backdrop-blur-sm hover:bg-gradient-to-r hover:from-[#E08713] hover:to-[#C72C15] border border-[#C72C15] flex items-center justify-center transition-all z-20 shadow-lg"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all ${
                index === currentSlide
                  ? 'w-8 h-2 bg-gradient-to-r from-[#E08713] to-[#C72C15]'
                  : 'w-2 h-2 bg-gray-500 hover:bg-[#C72C15]'
              } rounded-full`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
