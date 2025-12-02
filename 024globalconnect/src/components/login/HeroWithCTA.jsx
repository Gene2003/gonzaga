import React, { useRef, useEffect } from 'react';
import landingVideo from '../../assets/landing.mp4';

const HeroWithCTA = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5; // 🎬 slower speed (0.5x)
    }
  }, []);

  return (
    <>
      <section className="relative h-screen w-full overflow-hidden text-white">
        {/* Background Video */}
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          src={landingVideo}
          autoPlay
          loop
          muted
          playsInline
        />

        {/* Overlay Content */}
        <div className="relative z-10 h-full w-full flex flex-col justify-center items-center text-center px-6 bg-black/50 backdrop-blur-sm pt-36">
          <h1 className="text-3xl md:text-4xl lg:text-5x1 font-bold mb-6 animate-fade-in-up max-w-2xl drop-shadow-md">
            BUILDING AFRICA'S MOST EFFICIENT AND PROFITABLE AGRICULTURAL MARKETPLACE.
          </h1>

          <p className="text-lg max-w-2xl mb-8 animate-fade-in-delayed text-blue-100">
            024 Global Connect is transforming how agricultural value chain actors interact by creating a predictable,transparent and effective digital marketplace across.
          </p>

          <p className="text-lg max-w-2xl mb-8 animate-fade-in-delayed text-blue-100">
            We levarage appropriate technologies to remove inefficiencies, educe post harvest losses,enhance profitability,and open meaningfull employment oppotunities for youth and women.
          </p>
          <p className="text-lg max-w-2xl mb-8 animate-fade-in-delayed text-blue-100">
            Our marketplace is build on pillers of QUALITY,QUANTITY,PLACE AND PRICE- the 2Qs2Ps that ensures every transaction delivers exceptional value.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fade-in-buttons">
            <a
              href="#"
              className="border border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-blue-700 hover:shadow-lg transition"
            >
             💡  WE'RE NOT JUST BUILDING A PLATFORM.WE'RE BUILDING OPPOTUNITIES.
            </a>
          </div>
        </div>
      </section>

    </>
  );
};

export default HeroWithCTA;
