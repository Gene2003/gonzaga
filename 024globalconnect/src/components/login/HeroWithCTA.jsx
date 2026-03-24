import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeroWithCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="relative h-screen w-full overflow-hidden text-white">
      {/* Background — vast banana plantation */}
      <img
        src="https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=1600&h=900&fit=crop"
        alt="Vast banana plantation"
        className="absolute inset-0 w-full h-full object-cover z-0 scale-105"
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/55 via-black/45 to-black/65" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 sm:px-8 pt-20">
        {/* Eyebrow */}
        <span className="inline-block bg-blue-600 text-white text-xs sm:text-sm font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6">
          Africa's Agricultural Marketplace
        </span>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 max-w-4xl drop-shadow-lg">
          Connecting Farmers, Vendors &amp; Buyers Across Africa
        </h1>

        <p className="text-base sm:text-xl text-white/85 max-w-2xl mb-10 leading-relaxed">
          Buy fresh produce directly from farmers. Sell your products to thousands of buyers.
          Earn commissions as an affiliate. One platform — endless opportunity.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/products')}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-base sm:text-lg transition-all shadow-lg hover:shadow-blue-900/40 hover:scale-105"
          >
            Browse Marketplace
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-4 bg-white/10 border-2 border-white text-white hover:bg-white hover:text-blue-800 font-bold rounded-lg text-base sm:text-lg transition-all shadow-lg hover:scale-105"
          >
            Join as Vendor
          </button>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce opacity-70">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default HeroWithCTA;
