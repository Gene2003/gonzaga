// src/pages/Home.jsx
import React from 'react';
import Header from '../components/login/Header';
import About from '../components/login/About';
import Footer from '../components/login/Footer';
import HeroWithCTA from '../components/login/HeroWithCTA';


const Home = () => {
  return (
    <>
      <Header />
      <HeroWithCTA />
      <About />
      <Footer />
    </>
  );
};

export default Home;
