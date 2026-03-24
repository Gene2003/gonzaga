import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Users, TrendingUp, Shield, Award, Target, ArrowRight, Check, Sliders } from 'lucide-react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const AboutUs = () => {
  const stats = [
    { number: '50K+', label: 'Active Affiliates', icon: Users },
    { number: '10+', label: 'Countries Served', icon: Globe },
    { number: '98%', label: 'Success Rate', icon: TrendingUp },
    { number: '24/7', label: 'Support Available', icon: Shield }
  ];

  const values = [
    {
      icon: Target,
      title: 'Performance Driven',
      description: 'We focus on measurable results and ROI optimization for all our partners.'
    },
    {
      icon: Shield,
      title: 'Trust & Transparency',
      description: 'Complete transparency in tracking, reporting, and commission structures.'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Connecting brands with audiences across every continent and culture.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Committed to delivering exceptional service and innovative solutions.'
    }
  ];

  const teamMembers = [
    {
      name: 'Jimmy Murigi',
      role: 'CEO & Co-Founder',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face',
      bio: '10+ years in digital marketing and agricultural value chain development.'
    },
    {
      name: 'Gonzaga Shyachi',
      role: 'Software Maintenance Assistant',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&h=300&fit=crop&crop=face',
      bio: 'Full-stack software developer building the platform infrastructure.'
    },
    {
      name: 'John',
      role: 'IT & System Manager',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=face',
      bio: 'Overseeing system reliability, security, and technical operations.'
    },
    {
      name: 'Scovian',
      role: 'Agribusiness Manager',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face',
      bio: 'Driving agribusiness strategy and farmer partnerships across the network.'
    },
  ];


  return (
    <div className="min-h-screen bg-white">
  
      {/* Hero Section */}
        <section className="relative text-white py-20 px-4 overflow-hidden h-screen flex items-center">
  {/* Background Image */}
  <div className="absolute inset-0">
    <img
      src="/images/7.png"
      className="w-full h-full object-cover"
    />
  </div>


  {/* Decorative blurred circles */}
  <div className="absolute top-0 left-0 w-full h-full">
    <div className="absolute top-20 left-10 w-32 h-32 bg-black/20 rounded-full blur-xl"></div>
    <div className="absolute bottom-20 right-10 w-48 h-48 bg-indigo-400/20 rounded-full blur-xl"></div>
  </div>
  
  <div className="relative max-w-6xl mx-auto text-center z-10">
    <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent drop-shadow-2xl">
      024GlobalConnect
    </h1>
    <p className="text-base sm:text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto drop-shadow-lg">
      Empowering African Communities through Smart Digital Linkages.
    </p>
    <div className="flex flex-wrap justify-center gap-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 text-sm font-medium border border-white/20">
        Est. 2025
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 text-sm font-medium border border-white/20">
        Global Leader
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 text-sm font-medium border border-white/20">
        Trusted Network
      </div>
    </div>
  </div>
</section>
      

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                    <Icon className="w-8 h-8 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                    <div className="text-gray-600 font-medium">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  024 GLOBAL CONNECT is a pan african agritech company dedicated to building an EFFICIENT,PROFITABLE AND AGRICULTURAL MARKETPLACE.We connect producers, services providers,traders,input suppliers,processors, and logistics partners through a tech-enabled ecosystem that enhances trust,transparency, and business growth.</p>
                <p>
                  We focus on creating an enabling environment  where agricultural becomes a SUSTAINABLE LIVELIHOOD-Especially for youth and women.
                </p>
              </div>
              <div className="mt-8">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6">
                  <div className="flex items-center mb-3">
                    <Award className="w-6 h-6 mr-2" />
                    <span className="font-semibold">Our Mission</span>
                  </div>
                  <p className="text-blue-100">
                    To leverage appropriate technologies to make agricultural value chain interactions efficient and profitable—while creating decent work opportunities for youth and women across Africa.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/50 rounded-full blur-2xl"></div>
                <div className="relative">
                  <Globe className="w-24 h-24 text-blue-600 mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Global Impact</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-700">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      <span>50,000+ active affiliate partners</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      <span>$100M+ in partner commissions paid</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      <span>1000+ successful brand partnerships</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-green-600 font-semibold text-sm uppercase tracking-widest">What Guides Us</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mt-2">Our Core Values</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                num: 1, title: "People-Centred",
                desc: "We place people at the heart of every innovation.",
                img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=280&fit=crop",
              },
              {
                num: 2, title: "Technology-Driven",
                desc: "We embrace solutions that enhance efficiency and transparency.",
                img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=280&fit=crop",
              },
              {
                num: 3, title: "Customer Satisfaction",
                desc: "We listen, improve, and deliver value.",
                img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=280&fit=crop",
              },
              {
                num: 4, title: "Integrity & Trust",
                desc: "We keep our word and build lasting relationships.",
                img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&h=280&fit=crop",
              },
            ].map((v) => (
              <div key={v.num} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
                <div className="h-44 overflow-hidden">
                  <img src={v.img} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-white text-sm font-bold">{v.num}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{v.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Environmental Care — full width */}
          <div className="mt-8 bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="grid md:grid-cols-2">
              <div className="h-56 md:h-auto overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=400&fit=crop"
                  alt="Environmental Care"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-8 flex flex-col justify-center">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-white text-sm font-bold">5</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Environmental Care</h3>
                <p className="text-gray-600 leading-relaxed">
                  We work towards a responsible and sustainable agricultural future — protecting land, water, and communities for generations to come.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


{/* What We Do Section */}
<section className="py-20 px-4 bg-white">
  <div className="max-w-6xl mx-auto">
    <div className="text-center mb-14">
      <span className="text-green-600 font-semibold text-sm uppercase tracking-widest">Our Services</span>
      <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mt-2">What We Do</h2>
    </div>
    <div className="grid md:grid-cols-2 gap-8">
      {[
        {
          icon: '🌱', title: 'Digital Agricultural Marketplace',
          img: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&h=260&fit=crop',
          bullets: ['Input providers', 'Service providers', 'Producers & Aggregators', 'Wholesalers & retailers', 'Logistics & transport'],
          summary: 'Our platform ensures seamless, efficient, and profitable interactions across the full value chain.',
        },
        {
          icon: '📊', title: 'Real-Time Market Information',
          img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=260&fit=crop',
          bullets: ['Live market prices', 'Weather updates', 'Local & regional trends', 'Demand and supply insights'],
          summary: 'Empowering actors to make informed decisions that reduce risks and increase profits.',
        },
        {
          icon: '📉', title: 'Reducing Post-Harvest Losses',
          img: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&h=260&fit=crop',
          bullets: ['Structured supply chains', 'Timely market linkages', 'Efficient logistics', 'Better handling practices'],
          summary: 'Engineered to bring post-harvest losses down to 5% or less.',
        },
        {
          icon: '📚', title: 'Upskilling & Capacity Building',
          img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=260&fit=crop',
          bullets: ['Agribusiness training', 'Digital marketing skills', 'Financial literacy', 'Value chain coaching'],
          summary: 'Empowering youth, women, and SMEs to grow strong, resilient agribusinesses.',
        },
        {
          icon: '💸', title: 'Linkage to Affordable Finance',
          img: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=260&fit=crop',
          bullets: ['Tailor-made financing', 'Credit for inputs & operations', 'Asset financing', 'Working capital facilities'],
          summary: 'Unlocking growth capital for agricultural entrepreneurs across Africa.',
        },
        {
          icon: '🤝', title: 'Affiliate Program',
          img: 'https://images.unsplash.com/photo-1553484771-047a44eee27a?w=600&h=260&fit=crop',
          bullets: ['Referral commissions', 'Linking buyers and sellers', 'Promoting agri products & services'],
          summary: 'A new earning frontier in agriculture through digital participation.',
        },
      ].map((service, index) => (
        <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group border border-gray-100">
          <div className="h-48 overflow-hidden">
            <img src={service.img} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{service.icon}</span>
              <h3 className="text-xl font-bold text-gray-900">{service.title}</h3>
            </div>
            <ul className="space-y-1 mb-3">
              {service.bullets.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            <p className="text-gray-500 text-sm italic">{service.summary}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

{/* System Features Section */}
<section className="py-20 px-4 bg-gray-50">
  <div className="max-w-6xl mx-auto">
    <div className="text-center mb-14">
      <span className="text-green-600 font-semibold text-sm uppercase tracking-widest">Platform Capabilities</span>
      <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mt-2">System Features</h2>
      <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
        Our platform supports an end-to-end agricultural ecosystem with powerful tools built for Africa.
      </p>
    </div>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[
        { num: 1, title: 'Seamless Onboarding', text: 'All value chain actors can register and get verified quickly.', img: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600&h=240&fit=crop' },
        { num: 2, title: 'Real-Time Transactions', text: 'Instant payments and confirmations via M-Pesa and Paystack.', img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=240&fit=crop' },
        { num: 3, title: 'Data & Analytics', text: 'Live dashboards with sales trends, stock levels, and market insights.', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=240&fit=crop' },
        { num: 4, title: 'Affiliate Dashboard', text: 'Track referrals, commissions earned, and payout status in one place.', img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=240&fit=crop' },
        { num: 5, title: 'Product & Service Marketplace', text: 'List farm produce, goods, and agri-services for buyers across Africa.', img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=240&fit=crop' },
        { num: 6, title: 'Logistics Integration', text: 'Connect with verified transporters for last-mile delivery solutions.', img: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=600&h=240&fit=crop' },
      ].map((f) => (
        <div key={f.num} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
          <div className="h-44 overflow-hidden">
            <img src={f.img} alt={f.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0">{f.num}</span>
              <h3 className="font-bold text-gray-900">{f.title}</h3>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">{f.text}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

{/* Goals Section */}
<section className="py-20 px-4 bg-white">
  <div className="max-w-6xl mx-auto">
    <div className="text-center mb-14">
      <span className="text-green-600 font-semibold text-sm uppercase tracking-widest">Where We're Headed</span>
      <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mt-2">Our Goals</h2>
    </div>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[
        { num: 1, title: 'Pan-African Network', text: 'Establish a predictable, profitable agricultural marketplace network powered by technology across Africa.', img: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&h=240&fit=crop' },
        { num: 2, title: 'Accurate Market Data', text: 'Provide farmers and traders with accurate market information and real-time pricing insights.', img: 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=600&h=240&fit=crop' },
        { num: 3, title: 'Reduce Post-Harvest Losses', text: 'Cut post-harvest losses to 5% or less through smart logistics and timely market linkages.', img: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=240&fit=crop' },
        { num: 4, title: 'Capacity Building', text: 'Enhance the capacity of value chain actors through hands-on training and mentorship programs.', img: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=240&fit=crop' },
        { num: 5, title: 'Financial Inclusion', text: 'Create accessible linkages to affordable financial services for every agricultural entrepreneur.', img: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=600&h=240&fit=crop' },
      ].map((g) => (
        <div key={g.num} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group border border-gray-100 hover:-translate-y-1">
          <div className="h-44 overflow-hidden">
            <img src={g.img} alt={g.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-gradient-to-br from-green-500 to-green-700 text-white text-xs font-bold w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0">{g.num}</span>
              <h3 className="font-bold text-gray-900">{g.title}</h3>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">{g.text}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* Team Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Leadership</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The visionary team driving innovation in affiliate marketing
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2 text-center">
                <div className="h-56 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-green-600 text-sm font-semibold mb-3">{member.role}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
     

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-4xl font-bold mb-6">Ready to Join 024GlobalConnect?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
           ARE YOU A FARMER ,TRADER TRANSPORTER ,INPUT SUPPLIER ,PROCESSOR OR YOUTH LOOKING FOR OPPORTUNITIES IN AGRIBUSINESS? 024GLOBALCONNECT IS YOUR GROWTH PARTNER.
          </p>
          <ul className="list-disc list-inside text-blue-100 mb-8 max-w-2xl mx-auto">
            <li>🔗 Get onboard.</li>
            <li>💼 Grow your business.</li>
            <li>📈 Unlock new opportunities.</li>
            <li>🌍 Be part of Africa’s agricultural transformation.</li>
          </ul>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-white text-blue-600 font-bold py-4 px-8 rounded-xl hover:bg-blue-50 transition-all duration-200 flex items-center justify-center group text-decoration-none"
            >
             Become an Affiliate
    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
  </Link>

  <Link 
    to="/affiliate-partner" 
    className="border-2 border-white text-white font-bold py-4 px-8 rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-200 flex items-center justify-center group"
  >
    Partner with Us
    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
  </Link>
</div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
