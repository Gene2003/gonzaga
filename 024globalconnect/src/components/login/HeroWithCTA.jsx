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
        <div className="relative z-10 h-full w-full flex flex-col justify-center items-center text-center px-6 bg-black/50 backdrop-blur-sm">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in-up max-w-3xl drop-shadow-md">
            Empowering African Communities Through Digital Solutions
          </h1>

          <p className="text-lg max-w-2xl mb-8 animate-fade-in-delayed text-blue-100">
            Bridging the gap between opportunities and communities through innovative technology solutions.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fade-in-buttons">
            <a
              href="#"
              className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg hover:scale-105 hover:shadow-lg transition"
            >
              Learn More
            </a>
            <a
              href="#"
              className="border border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-blue-700 hover:shadow-lg transition"
            >
              Watch Video
            </a>
          </div>

          {/* CTA Box */}
          <div className="bg-white/10 rounded-xl px-8 py-10 max-w-2xl w-full text-white backdrop-blur-md shadow-xl animate-fade-in-delayed">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Join the Digital Revolution?</h2>
            <p className="mb-6">
              Become part of our growing community and access opportunities through our platform.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="/login"
                className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:scale-105 hover:shadow-lg transition"
              >
                Login to Your Account
              </a>
              <a
                href="/register"
                className="border border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-blue-700 hover:shadow-lg transition"
              >
                Create New Account
              </a>
            </div>
          </div>
        </div>
      </section>

    </>
  );
};

export default HeroWithCTA;
