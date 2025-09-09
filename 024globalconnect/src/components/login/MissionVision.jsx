import React from 'react';

const MissionVision = () => {
  return (
    <section id="mission" className="bg-white py-20">
      <div className="container mx-auto grid gap-10 grid-cols-1 md:grid-cols-2">
        <div className="mv-card bg-gray-50 p-10 rounded-lg shadow hover:-translate-y-2 transition">
          <h2 className="text-blue-700 text-2xl font-semibold mb-4">Our Mission</h2>
          <p>To leverage on ICT and other emerging technologies in providing our clients with the best solutions around employment opportunities, access to financial services and markets.</p>
          <i className="fas fa-bullseye absolute text-7xl text-blue-700 opacity-10 bottom-4 right-4"></i>
        </div>
        <div className="mv-card bg-gray-50 p-10 rounded-lg shadow hover:-translate-y-2 transition">
          <h2 className="text-blue-700 text-2xl font-semibold mb-4">Our Vision</h2>
          <p>Empowering African communities through smart digital linkage. We envision a continent where every individual has equal access to opportunities through technology.</p>
          <i className="fas fa-eye absolute text-7xl text-blue-700 opacity-10 bottom-4 right-4"></i>
        </div>
      </div>
    </section>
  );
};

export default MissionVision;
