import React, { useState, useEffect } from "react";

const About = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Images only
  const slides = [
    '/images/1.png',
    '/images/2.png',
    '/images/3.png',
    '/images/4.png',
    '/images/5.png',
  ];

  // Auto-slide every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Background Images - Change automatically */}
      {slides.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={image}
            alt={`Slide ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Fixed overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
      
      {/* Fixed Text Overlay - Stays the same */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 z-10">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up drop-shadow-2xl max-w-4xl">
          Transforming Agriculture Through Digital Connection
        </h1>
        <p className="text-xl md:text-3xl text-white/95 animate-fade-in-up drop-shadow-xl max-w-3xl mb-8">
          Building Africa's Most Efficient and Profitable Agricultural Marketplace
        </p>
        <div className="space-y-4 text-lg md:text-xl text-white/90 max-w-2xl">
          <p className="drop-shadow-lg">
            💡 Quality, Quantity, Place, and Price - The 2Qs2Ps
          </p>
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default About;