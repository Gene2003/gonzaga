import React from "react";

const About = () => {
  return (
    <section className="w-full py-20 flex justify-center bg-white">
      <div className="max-w-4xl px-6 text-center md:text-left">

        {/* Heading */}
        <h2 className="text-2xl md:text-4xl font-semibold text-blue-night mb-10 animate-fade-in">
          Transforming Agriculture Through Digital Connection
        </h2>

        {/* Paragraphs */}
        <div className="space-y-6 animate-fade-in-delayed">
          <p className="text-lg leading-relaxed text-gray-700">
            024 Global Connect is transforming how agricultural value chain
            actors interact by creating a predictable, transparent, and
            effective digital marketplace across regions.
          </p>

          <p className="text-lg leading-relaxed text-gray-700">
            We leverage appropriate technologies to remove inefficiencies,
            reduce post-harvest losses, enhance profitability, and open
            meaningful employment opportunities for youth and women.
          </p>

          <p className="text-lg leading-relaxed text-gray-700 font-medium">
            Our marketplace is built on pillars of
            <span className="font-semibold text-blue-deep">
              {" "}QUALITY, QUANTITY, PLACE, and PRICE
            </span>
            — the 2Qs2Ps that ensure every transaction delivers exceptional
            value.
          </p>
        </div>

      </div>
    </section>
  );
};

export default About;
