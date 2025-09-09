// src/pages/Home.jsx
import React from 'react';
import Header from '../components/login/Header';
import MissionVision from '../components/login/MissionVision';
import Footer from '../components/login/Footer';
import HeroWithCTA from '../components/login/HeroWithCTA';
import ProductList from '../components/login/ProductList';

const Home = () => {
  return (
    <>
      <Header />
      <HeroWithCTA />
      <MissionVision />
      <ProductList />
      <Footer />
    </>
  );
};

export default Home;
