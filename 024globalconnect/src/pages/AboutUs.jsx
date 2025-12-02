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
      role: 'CEO & CoFounder',
      image: '',
      bio: '10+ years in digital marketing and affiliate networks'
    },

    {
      name: 'Gonzaga Shyachi',
      role: 'Software Maintenance Assistant',
      image: '',
      bio: 'software developer'
    },
    {
      name: 'John ',
      role: 'IT and System Manager',
      image: '',
      bio: ''
    },
    {
      name: 'Stacy Jahenda',  
      role: 'Agribusiness Manager',
      image: '',
      bio: ''
    },
    {
      name: 'Francescah Wanja',
      role: 'Affiliate Program Manager',
      image: '',
      bio: ''
    },
    {
      name: 'Janet Mackenzie',
      role: 'Human Resource Manager',
      image: '',
      bio: ''
    }
  ];


  return (
    <div className="min-h-screen bg-white">
  
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-indigo-400/20 rounded-full blur-xl"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
            024GlobalConnect
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Empowering African Communities through Smart Digital Linkages.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 text-sm font-medium">
              Est. 2025
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 text-sm font-medium">
              Global Leader
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 text-sm font-medium">
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
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
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
    <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
      Our Core Values
    </h2>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

      {/* People-Centred */}
      <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <span className="text-white text-2xl font-bold">1</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">People-Centred</h3>
        <p className="text-gray-600 leading-relaxed">
          We place people at the heart of every innovation.
        </p>
      </div>

      {/* Technology-Driven */}
      <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <span className="text-white text-2xl font-bold">2</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Technology-Driven</h3>
        <p className="text-gray-600 leading-relaxed">
          We embrace solutions that enhance efficiency and transparency.
        </p>
      </div>

      {/* Customer Satisfaction */}
      <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <span className="text-white text-2xl font-bold">3</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Customer Satisfaction</h3>
        <p className="text-gray-600 leading-relaxed">
          We listen, improve, and deliver value.
        </p>
      </div>

      {/* Integrity & Trust */}
      <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <span className="text-white text-2xl font-bold">4</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Integrity & Trust</h3>
        <p className="text-gray-600 leading-relaxed">
          We keep our word and build lasting relationships.
        </p>
      </div>

      {/* Environmental Care */}
      <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2 md:col-span-2 lg:col-span-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <span className="text-white text-2xl font-bold">5</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Environmental Care</h3>
        <p className="text-gray-600 leading-relaxed">
          We work towards a responsible and sustainable agricultural future.
        </p>
      </div>

    </div>
  </div>
</section>


{/* What We Do Section */}
<section className="py-20 px-4 bg-gray-50">
  <div className="max-w-6xl mx-auto">
    <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
      What We Do
    </h2>

    <div className="grid md:grid-cols-2 gap-8">
      {/* Service Items */}
      {[
        {
          icon: '🌱',
          title: 'Digital Agricultural Marketplace',
          description: (
            <>
              We onboard and connect all key actors across the agricultural ecosystem, including:
              <ul className="list-disc ml-5 mt-2">
                <li>Input providers</li>
                <li>Service providers</li>
                <li>Producers</li>
                <li>Aggregators</li>
                <li>Processors</li>
                <li>Wholesalers & retailers</li>
                <li>Logistics and transport service providers</li>
              </ul>
              Our platform ensures seamless, efficient, and profitable interactions.
            </>
          )
        },
        {
          icon: '📊',
          title: 'Real-Time Market Information',
          description: (
            <>
              We provide reliable access to:
              <ul className="list-disc ml-5 mt-2">
                <li>Market prices</li>
                <li>Weather updates</li>
                <li>Local and regional trends</li>
                <li>Demand and supply insights</li>
              </ul>
              This empowers actors to make informed decisions that reduce risks and increase profits.
            </>
          )
        },
        {
          icon: '📉',
          title: 'Reducing Post-Harvest Losses',
          description: (
            <>
              Our model is engineered to bring post-harvest losses down to 5% or less through:
              <ul className="list-disc ml-5 mt-2">
                <li>Structured supply chains</li>
                <li>Timely market linkages</li>
                <li>Efficient logistics</li>
                <li>Better handling practices</li>
              </ul>
            </>
          )
        },
        {
          icon: '📚',
          title: 'Upskilling, Mentorship & Capacity Building',
          description: (
            <>
              We partner with development agencies, training institutions, and private sector actors to offer:
              <ul className="list-disc ml-5 mt-2">
                <li>Agribusiness training</li>
                <li>Digital marketing skills</li>
                <li>Financial literacy</li>
                <li>Technical mentorship</li>
                <li>Value chain coaching</li>
              </ul>
              This empowers youth, women, and SMEs to grow strong, resilient agribusinesses.
            </>
          )
        },
        {
          icon: '💸',
          title: 'Linkage to Affordable Finance',
          description: (
            <>
              We collaborate with financial service providers to help actors access:
              <ul className="list-disc ml-5 mt-2">
                <li>Tailor-made financing</li>
                <li>Credit for inputs and operations</li>
                <li>Asset financing</li>
                <li>Working capital facilities</li>
              </ul>
              Our goal is to unlock growth for agricultural entrepreneurs.
            </>
          )
        },
        {
          icon: '🤝',
          title: 'Affiliate Program',
          description: (
            <>
              Our affiliate system allows youth, producers, and digital marketers to earn from:
              <ul className="list-disc ml-5 mt-2">
                <li>Referrals</li>
                <li>Linking buyers and sellers</li>
                <li>Promoting agricultural products and services</li>
              </ul>
              This program creates a new earning frontier in agriculture through digital participation.
            </>
          )
        }
      ].map((service, index) => (
        <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="text-4xl mb-4">{service.icon}</div>
          <h3 className="text-2xl font-bold mb-3 text-gray-900">{service.title}</h3>
          <p className="text-gray-700">{service.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>

{/*features and Goals Section */}
<section className="py-20 px-4 bg-gray-50">
  <div className="max-w-6xl mx-auto">
    <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">System Features
      & Goals
    </h2>
    <p className="text-center text-gray-700 mb-16 max-w-3xl mx-auto">
      our platform is designed to support aan end to end agricultural ecosystem with features such as:
    </p>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

    {/* Features*/}
    <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <span className="text-white text-2xl font-bold">1</span>
        </div>
        <p className="text-gray-600 leading-relaxed">
         SEAMLESS ONBOARDING OF ALL THE VALUE CHAIN ACTORS.
        </p>
      </div>
      <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <span className="text-white text-2xl font-bold">2</span>
        </div>
        <p className="text-gray-600 leading-relaxed">
          SEAMLESS REALTIME TRANSACTIONS.
        </p>
      </div>

       <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <span className="text-white text-2xl font-bold">3</span>
        </div>
        <p className="text-gray-600 leading-relaxed">
          REAL-TIME DATA AND ANALYTICS.
        </p>
      </div>

       <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <span className="text-white text-2xl font-bold">4</span>
        </div>
        <p className="text-gray-600 leading-relaxed">
          AFFILIATE EARNING DASHBOARD.
        </p>
      </div>

       <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <span className="text-white text-2xl font-bold">5</span>
        </div>
        <p className="text-gray-600 leading-relaxed">
          PRODUCT LISTING & SERVICE MARKETPLACE.
        </p>
      </div>

       <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <span className="text-white text-2xl font-bold">6</span>
        </div>
        <p className="text-gray-600 leading-relaxed">
          VERIFIED LOGISTICS & DELIVERY INTERGRATION.
        </p>
      </div>
    </div>
  </div>
</section>

{/*GOALS SECTION*/}
<section className="py-20 px-4">
  <div className="max-w-6xl mx-auto">
    <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Our Goals</h2>


    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

      {/* Goal Items */}
      <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <span className="text-white text-2xl font-bold">1</span>
        </div>
        <p className="text-gray-600 leading-relaxed">
         ESTABLISHING A PREDICTABLE,PROFITABLE AND EFFICIENT MARKETPLACE SYSTEM LEADING TO A PAN-AFRICAN AGRICULTURAL NETWORK POWERED BY TECHNOLOGY.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <span className="text-white text-2xl font-bold">2</span>
        </div>
        <p className="text-gray-600 leading-relaxed">
          PROVIDIND ACCURATE MARKET INFORMATION AND REAL-TIME INSIGHTS.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <span className="text-white text-2xl font-bold">3</span>
        </div>
        <p className="text-gray-600 leading-relaxed">
          REDUCING POST HERVEST LOSSES TO 5%.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <span className="text-white text-2xl font-bold">4</span>
        </div>
        <p className="text-gray-600 leading-relaxed">
          ENHANCING THE CAPACTY OF VALUE CHAIN ACTORS THROUGH TRAINING AND MENTORSHIP.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <span className="text-white text-2xl font-bold">5</span>
        </div>
        <p className="text-gray-600 leading-relaxed">
          CREATING LINKAGES TO AFFORDABLE FINANCIAL SERVICES.
        </p>
      </div>
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
          
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center group hover:-translate-y-2">
                <div className="relative mb-6">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name || 'Team member'}
                      className="w-24 h-24 rounded-full mx-auto object-cover ring-4 ring-blue-100 group-hover:ring-blue-200 transition-all"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full mx-auto bg-gray-200 flex items-center justify-center ring-4 ring-blue-100 group-hover:ring-blue-200 text-gray-500">
                      N/A
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-indigo-600 w-8 h-8 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name || 'Unnamed'}</h3>
                <p className="text-blue-600 font-semibold mb-4">{member.role || 'Unknown Role'}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*Gallary Section*/}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Gallary</h2>
          <p className="text-xl text-gray-600 mb-12">
            A glimpse into our journey and the vibrant community we serve.
            </p>

            <div className="max-w-4xl mx-auto">
              <Slider
                dots={true}
                infinite={true}
                speed={800}
                slidesToShow={1}
                slidesToScroll={1}
                autoplay={true}
                autoplaySpeed={3000}
                arrows={true}
                className="rounded-2xl shadow-lg overflow-hidden"
              >

                {[
                  '/images/1.png',
                  '/images/2.png',
                  '/images/3.png',
                  '/images/4.png',
                  '/images/5.png',
                  '/images/6.png',
                  '/images/7.png',
                  '/images/8.png',
                  '/images/9.png',
                ].map((src, index) => (
                  <div key={index} className="relative">
                    <img
                    src={src}
                    alt={`Gallary image ${index + 1}`}
                    className="w-full h-[500px] object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white text-2x1 font-semibold">024GlobalConnect</p>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </div>
        </section>
     

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Join 024GlobalConnect?</h2>
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
