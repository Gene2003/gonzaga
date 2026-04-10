import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import img1 from "../../assets/1.png";
import img2 from "../../assets/2.png";
import img3 from "../../assets/3.png";
import img4 from "../../assets/4.png";
import img5 from "../../assets/5.png";
import img6 from "../../assets/6.png";
import img7 from "../../assets/7.png";
import img8 from "../../assets/8.png";
import img9 from "../../assets/9.png";

/* ── animated counter hook ── */
function useCounter(target, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        let start = 0;
        const step = Math.ceil(target / (duration / 16));
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(start);
        }, 16);
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return [count, ref];
}

/* ── stat item ── */
function Stat({ value, suffix = "", label }) {
  const [count, ref] = useCounter(value);
  return (
    <div ref={ref} className="text-center px-6">
      <p className="text-4xl sm:text-5xl font-extrabold text-white">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="mt-2 text-blue-100 text-sm sm:text-base font-medium">{label}</p>
    </div>
  );
}

/* ── deal product card ── */
function DealCard({ img, name, price, badge, badgeColor = "bg-blue-600" }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate('/products')}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow cursor-pointer group overflow-hidden border border-gray-100"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={img}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
          onError={(e) => { e.target.src = '/images/1.png'; }}
        />
        <span className={`absolute top-2 left-2 ${badgeColor} text-white text-xs font-bold px-2 py-0.5 rounded-full`}>
          {badge}
        </span>
      </div>
      <div className="p-3">
        <p className="font-semibold text-gray-900 text-sm truncate">{name}</p>
        <p className="text-blue-600 font-bold text-sm mt-0.5">{price}</p>
      </div>
    </div>
  );
}

const dealProducts = [
  { img: '/products/tomato.jpg',       name: 'Fresh Tomatoes',         price: 'From KES 80/kg',  badge: 'Hot Deal',    badgeColor: 'bg-red-500' },
  { img: '/products/watermelon.jpg',   name: 'Sweet Watermelon',       price: 'From KES 45/kg',  badge: 'Top Seller',  badgeColor: 'bg-blue-600' },
  { img: '/products/sukumawiki.jpg',   name: 'Sukuma Wiki (Kales)',     price: 'From KES 30/kg',  badge: 'Popular',     badgeColor: 'bg-green-500' },
  { img: '/products/potato.jpg',       name: 'Irish Potatoes',         price: 'From KES 60/kg',  badge: 'Fresh',       badgeColor: 'bg-blue-500' },
  { img: '/products/beans.jpg',        name: 'Beans',                  price: 'From KES 120/kg', badge: 'Best Value',  badgeColor: 'bg-blue-600' },
  { img: '/products/carrots.jpg',      name: 'Fresh Carrots',          price: 'From KES 70/kg',  badge: 'New',         badgeColor: 'bg-purple-500' },
  { img: '/products/ginger.jpg',       name: 'Fresh Ginger',           price: 'From KES 200/kg', badge: 'Premium',     badgeColor: 'bg-yellow-600' },
  { img: '/products/garlic.jpg',       name: 'Garlic',                 price: 'From KES 350/kg', badge: 'Organic',     badgeColor: 'bg-green-600' },
];

const featuredProducts = [
  { img: '/products/managu.jpg',       name: 'Managu (Black Nightshade)', price: 'From KES 40/kg',  badge: 'Fresh',  badgeColor: 'bg-green-500' },
  { img: '/products/strawberry.jpg',   name: 'Strawberries',              price: 'From KES 300/kg', badge: 'Sweet',  badgeColor: 'bg-red-500' },
  { img: '/products/capsicum.jpg',     name: 'Green Capsicum',            price: 'From KES 150/kg', badge: 'Crisp',  badgeColor: 'bg-green-600' },
  { img: '/products/sweetpotato.jpg',  name: 'Sweet Potatoes',            price: 'From KES 55/kg',  badge: 'Local',  badgeColor: 'bg-blue-600' },
  { img: '/products/dania.jpg',        name: 'Coriander (Dania)',         price: 'From KES 25/bunch',badge: 'Aromatic', badgeColor: 'bg-green-500' },
  { img: '/products/pumpkin.jpg',      name: 'Pumpkin',                   price: 'From KES 35/kg',  badge: 'Big',    badgeColor: 'bg-yellow-600' },
  { img: '/products/terere.jpg',       name: 'Terere (Amaranth)',         price: 'From KES 30/kg',  badge: 'Healthy', badgeColor: 'bg-green-600' },
  { img: '/products/mrenda.jpg',       name: 'Mrenda (Jute Mallow)',      price: 'From KES 30/kg',  badge: 'Nutritious', badgeColor: 'bg-blue-500' },
];

/* ── Countdown timer (resets daily at midnight) ── */
function useCountdown() {
  const getSecondsUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return Math.floor((midnight - now) / 1000);
  };
  const [secs, setSecs] = useState(getSecondsUntilMidnight);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => s > 0 ? s - 1 : getSecondsUntilMidnight()), 1000);
    return () => clearInterval(t);
  }, []);
  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return { h, m, s };
}

function TimeBlock({ val, label }) {
  return (
    <div className="flex flex-col items-center">
      <span className="bg-gray-900 text-white font-mono font-bold text-xl sm:text-2xl px-3 py-1.5 rounded-lg min-w-[2.8rem] text-center">{val}</span>
      <span className="text-blue-200 text-xs mt-1">{label}</span>
    </div>
  );
}

const About = () => {
  const navigate = useNavigate();
  const { h, m, s } = useCountdown();

  const steps = [
    { num: "01", title: "Register",      body: "Sign up as a farmer, wholesaler, retailer, or affiliate in minutes.", img: img4, imgAlt: "Person registering on phone" },
    { num: "02", title: "List or Browse", body: "Vendors list products with photos and prices. Buyers browse fresh farm produce and goods.", img: img6, imgAlt: "Vendor listing products" },
    { num: "03", title: "Pay & Earn",    body: "Buyers pay securely via M-Pesa. Vendors earn. Affiliates get commissions.", img: img9, imgAlt: "Buyer receiving order" },
  ];

  const ecosystem = [
    { img: img5, title: "Farmers",    desc: "List your crops, set your price, reach buyers across Kenya and beyond." },
    { img: img1, title: "Vendors",    desc: "Grow your market stall into a digital store accessible 24/7." },
    { img: img9, title: "Buyers",     desc: "Order fresh produce and goods delivered straight to your door." },
    { img: img4, title: "Affiliates", desc: "Refer vendors, earn 50% registration commission plus sales commissions." },
  ];

  return (
    <>
      {/* ── FLASH DEALS ── */}
      <section className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <span className="text-blue-600">⚡</span> Flash Deals
              </h2>
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-sm text-gray-500 font-medium">Ends in:</span>
                <div className="flex gap-1 items-center">
                  <TimeBlock val={h} label="HRS" />
                  <span className="text-blue-600 font-bold text-xl mb-4">:</span>
                  <TimeBlock val={m} label="MIN" />
                  <span className="text-blue-600 font-bold text-xl mb-4">:</span>
                  <TimeBlock val={s} label="SEC" />
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="text-blue-600 font-semibold text-sm hover:underline self-start sm:self-auto"
            >
              See All Deals →
            </button>
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
            {dealProducts.map(p => <DealCard key={p.name} {...p} />)}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-blue-600 py-14">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x-0 md:divide-x divide-blue-600">
          <Stat value={5000}  suffix="+" label="Farmers Connected" />
          <Stat value={200}   suffix="+" label="Active Vendors" />
          <Stat value={50000} suffix="+" label="Products Listed" />
          <Stat value={10}    suffix="+" label="Counties Served" />
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <span className="text-blue-600">🌿</span> Featured Products
            </h2>
            <button
              onClick={() => navigate('/products')}
              className="text-blue-600 font-semibold text-sm hover:underline"
            >
              View All →
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map(p => <DealCard key={p.name} {...p} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="mission" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Simple &amp; Fast</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.num} className="flex flex-col rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all overflow-hidden">
                <div className="relative h-52 overflow-hidden">
                  <img src={s.img} alt={s.imgAlt} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold tracking-widest px-3 py-1 rounded-full">
                    STEP {s.num}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUR ECOSYSTEM ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Who We Serve</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">Built for Everyone in the Value Chain</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ecosystem.map((e) => (
              <div key={e.title} className="group bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition-shadow">
                <div className="overflow-hidden h-44">
                  <img src={e.img} alt={e.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{e.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FULL-WIDTH FEATURE: MARKET VENDORS ── */}
      <section className="relative h-[420px] overflow-hidden">
        <img src={img2} alt="Market vendor" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
          <div className="px-8 sm:px-16 max-w-xl text-white">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight">
              From the Market Stall to the Digital Shelf
            </h2>
            <p className="text-white/80 text-base sm:text-lg mb-7">
              Whether you sell meat, produce, or packaged goods — your store is open to the whole country, 24 hours a day.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
            >
              Start Selling Today
            </button>
          </div>
        </div>
      </section>

      {/* ── DIGITAL AGRI FEATURE ── */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Technology + Agriculture</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3 mb-5">
              A Phone Is All You Need to Grow Your Business
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Our platform is built for African farmers and vendors. List products, receive orders, track stock,
              and get paid — all from your mobile phone. No laptop required.
            </p>
            <ul className="space-y-3 text-gray-700">
              {[
                "Receive instant SMS &amp; email order notifications",
                "Accept M-Pesa payments securely via Paystack",
                "Track your stock and sales in real time",
                "Earn affiliate commissions by referring vendors",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span dangerouslySetInnerHTML={{ __html: item }} />
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img src={img4} alt="Vendor with phone" className="rounded-2xl h-56 w-full object-cover" />
            <img src={img3} alt="Market"             className="rounded-2xl h-56 w-full object-cover mt-8" />
            <img src={img6} alt="Farm tech"          className="rounded-2xl h-56 w-full object-cover -mt-4" />
            <img src={img9} alt="Buyers"             className="rounded-2xl h-56 w-full object-cover mt-4" />
          </div>
        </div>
      </section>

      {/* ── BANNER AD ROW ── */}
      <section className="bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { img: img7, label: 'Fresh From the Farm',     sub: 'Order direct, save more' },
            { img: img8, label: 'Meet Our Top Farmers',    sub: '5,000+ farmers ready to sell' },
            { img: img6, label: 'Become a Vendor Today',   sub: 'Easy setup, start in minutes' },
          ].map(b => (
            <div
              key={b.label}
              onClick={() => navigate('/products')}
              className="relative h-36 rounded-xl overflow-hidden cursor-pointer group shadow-sm"
            >
              <img src={b.img} alt={b.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <div>
                  <p className="text-white font-bold text-sm">{b.label}</p>
                  <p className="text-white/75 text-xs">{b.sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── JOIN CTA ── */}
      <section className="relative py-20 text-center text-white overflow-hidden">
        <img
          src={img5}
          alt="Farmers together"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative max-w-3xl mx-auto px-4">
          <h2 className="text-3xl sm:text-5xl font-extrabold mb-5 leading-tight">
            Ready to Transform Your Business?
          </h2>
          <p className="text-blue-100 text-base sm:text-lg mb-10">
            Join thousands of farmers, vendors, and buyers already using 024 Global Connect to grow their income.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/products')}
              className="px-8 py-4 bg-white text-blue-700 font-bold rounded-lg hover:bg-blue-50 transition text-lg"
            >
              Browse Marketplace
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-blue-600 border-2 border-blue-400 text-white font-bold rounded-lg hover:bg-blue-700 transition text-lg"
            >
              Join Free
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
