import React from 'react';

const MissionVision = () => {
  return (
    <section id="mission" className="bg-white py-20">
      <div className="container mx-auto grid gap-10 grid-cols-1 md:grid-cols-2">
        <div className="mv-card bg-gray-50 p-10 rounded-lg shadow hover:-translate-y-2 transition">
          <h2 className="text-blue-700 text-2xl font-semibold mb-4">Our Mission</h2>
          <p>To leverage appropriate technologies to make agricultural value chain interactions efficient and profitable—while creating decent work opportunities for youth and women across Africa.</p>
          <i className="fas fa-bullseye absolute text-7xl text-blue-700 opacity-10 bottom-4 right-4"></i>
        </div>
        <div className="mv-card bg-gray-50 p-10 rounded-lg shadow hover:-translate-y-2 transition">
          <h2 className="text-blue-700 text-2xl font-semibold mb-4">Our Vision</h2>
          <p>To become the preferred Pan-African solution provider for a more efficient and profitable agricultural marketplace.</p>
          <i className="fas fa-eye absolute text-7xl text-blue-700 opacity-10 bottom-4 right-4"></i>
        </div>
      </div>
    </section>
  );
};

export default MissionVision;
