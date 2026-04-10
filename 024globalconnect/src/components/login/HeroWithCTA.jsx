import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import img1 from '../../assets/1.png';
import img2 from '../../assets/2.png';
import img3 from '../../assets/3.png';
import img4 from '../../assets/4.png';
import img5 from '../../assets/5.png';
import img6 from '../../assets/6.png';
import img7 from '../../assets/7.png';
import img8 from '../../assets/8.png';

const banners = [
  {
    img: img5,
    badge: 'Best Deals Today',
    title: 'Fresh Farm Produce',
    subtitle: 'Direct from farmers to your table — guaranteed freshness',
    cta: 'Shop Now',
    to: '/products',
  },
  {
    img: img1,
    badge: 'New Vendors',
    title: 'Start Selling Online',
    subtitle: 'Join thousands of vendors selling fresh produce 24/7',
    cta: 'Join as Vendor',
    to: '/register',
  },
  {
    img: img7,
    badge: 'Earn Commissions',
    title: 'Become an Affiliate',
    subtitle: 'Refer vendors and earn 50% registration commission',
    cta: 'Learn More',
    to: '/register',
  },
];

const categoryLinks = [
  { name: 'Vegetables',   img: img1 },
  { name: 'Tomatoes',     img: img2 },
  { name: 'Fruits',       img: img3 },
  { name: 'Root Crops',   img: img4 },
  { name: 'Herbs',        img: img5 },
  { name: 'Legumes',      img: img6 },
  { name: 'Leafy Greens', img: img7 },
  { name: 'Spices',       img: img8 },
];

const sideCategories = [
  'Farm Products',
  'Vegetables & Greens',
  'Fruits & Berries',
  'Grains & Cereals',
  'Herbs & Spices',
  'Root Vegetables',
  'Legumes & Pulses',
  'Dairy & Eggs',
];

const HeroWithCTA = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setCurrent(p => (p + 1) % banners.length), 4500);
    return () => clearInterval(iv);
  }, []);

  return (
    <section className="bg-gray-100">

      {/* ── MAIN HERO BLOCK ── */}
      <div className="max-w-7xl mx-auto px-3 pt-3 pb-2">
        <div className="flex gap-3">

          {/* Left: Category sidebar */}
          <div className="hidden lg:flex flex-col w-52 flex-shrink-0 h-[340px] bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="bg-blue-600 text-white text-sm font-bold px-4 py-3 flex-shrink-0">
              All Categories
            </div>
            <ul className="overflow-y-auto py-1">
              {sideCategories.map(cat => (
                <li key={cat}>
                  <button
                    onClick={() => navigate('/products')}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex justify-between items-center transition"
                  >
                    <span>{cat}</span>
                    <span className="text-gray-400">›</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Center: Banner carousel */}
          <div className="flex-1 relative h-[340px] rounded-xl overflow-hidden shadow-sm">
            {banners.map((b, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                <img src={b.img} alt={b.title} className="w-full h-full object-cover object-top" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/65 to-transparent flex items-center">
                  <div className="px-8 sm:px-12 text-white max-w-md">
                    <span className="inline-block bg-blue-600 text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-3">
                      {b.badge}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight mb-2">{b.title}</h2>
                    <p className="text-white/80 text-sm mb-5">{b.subtitle}</p>
                    <button
                      onClick={() => navigate(b.to)}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition shadow-lg"
                    >
                      {b.cta}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Slide dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${i === current ? 'bg-blue-600 w-6' : 'bg-white/60 w-2.5'}`}
                />
              ))}
            </div>

            {/* Prev / Next arrows */}
            <button
              onClick={() => setCurrent(p => (p - 1 + banners.length) % banners.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center transition"
            >‹</button>
            <button
              onClick={() => setCurrent(p => (p + 1) % banners.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center transition"
            >›</button>
          </div>

          {/* Right: Mini banners */}
          <div className="hidden xl:flex flex-col gap-3 w-44 flex-shrink-0">
            <div
              onClick={() => navigate('/register')}
              className="relative flex-1 rounded-xl overflow-hidden cursor-pointer group shadow-sm"
            >
              <img src={img4} alt="Sell on platform" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                <p className="text-white text-xs font-bold">Sell on 024 Global →</p>
              </div>
            </div>
            <div
              onClick={() => navigate('/products')}
              className="relative flex-1 rounded-xl overflow-hidden cursor-pointer group shadow-sm"
            >
              <img src={img2} alt="Browse deals" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                <p className="text-white text-xs font-bold">Browse Deals →</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── CATEGORY ICONS ROW ── */}
      <div className="max-w-7xl mx-auto px-3 pb-3">
        <div className="bg-white rounded-xl shadow-sm px-4 py-4">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {categoryLinks.map(cat => (
              <button
                key={cat.name}
                onClick={() => navigate('/products')}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-transparent group-hover:border-blue-400 transition bg-blue-50">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <span className="text-xs font-medium text-gray-700 group-hover:text-blue-600 leading-tight text-center">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
};

export default HeroWithCTA;
