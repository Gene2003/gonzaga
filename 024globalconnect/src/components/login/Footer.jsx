import React from 'react';


const Footer = () => {
  return (
    <footer className="bg-slate-800 text-white py-16">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        <div>
          <h3 className="text-lg font-semibold mb-4">024 GLOBAL CONNECT</h3>
          <p>Empowering African communities through smart digital linkage.</p>
          <div className="flex gap-3 mt-4">
            <a href="https://www.facebook.com/profile.php?id=61577324699595"><i className="fab fa-facebook-f text-xl"></i></a>
           <div className="flex gap-4 items-center">
  <a
    href="https://x.com/024Global"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="X (Twitter)"
  >
    <svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 1200 1227"
  className="w-4 h-4 fill-white hover:fill-gray-300 transition"
>

      <path d="M535 597 0 0h251l388 448 438-448h123L695 654l492 573H937L524 728 53 1227H0l461-504zm118-131 323 372h120l-328-377 334-354h-119L653 452 318 0H200l335 384z" />
    </svg>
  </a>
</div>
            <a href="https://www.linkedin.com/company/107689468/admin/dashboard/"><i className="fab fa-linkedin-in text-xl"></i></a>
            <a href="https://www.instagram.com/024globalconnect/"><i className="fab fa-instagram text-xl"></i></a>
            <a href="https://www.tiktok.com/@024globalconnect?lang=en"><i className="fab fa-tiktok text-x1"></i></a>
            <a href="https://www.youtube.com/@024GlobalConnect"><i className="fab fa-youtube text-xl"></i></a>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Solutions</h3>
          <ul>
            <li><a href="#" className="hover:text-white text-gray-400">Employment Services</a></li>
            <li><a href="#" className="hover:text-white text-gray-400">Financial Inclusion</a></li>
            <li><a href="#" className="hover:text-white text-gray-400">Market Access</a></li>
            <li><a href="#" className="hover:text-white text-gray-400">Digital Training</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Company</h3>
          <ul>
            <li><a href="/aboutus" className="hover:text-white text-gray-400">About Us</a></li>
            <li><a href="#" className="hover:text-white text-gray-400">Our Team</a></li>
            <li><a href="#" className="hover:text-white text-gray-400">Partners</a></li>
            <li><a href="#" className="hover:text-white text-gray-400">Careers</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Contact</h3>
          <ul>
            <li><a href="#" className="hover:text-white text-gray-400">Support Center</a></li>
            <li><a href="/contact" className="hover:text-white text-gray-400">Contact Us</a></li>
            <li><a href="#" className="hover:text-white text-gray-400">Regional Offices</a></li>
            <li><a href="#" className="hover:text-white text-gray-400">Feedback</a></li>
          </ul>
        </div>
      </div>
      <div className="text-center text-gray-400 text-sm border-t border-slate-600 pt-4">
        &copy; 2025 024 GLOBAL CONNECT. All rights reserved. | <a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a>
      </div>
    </footer>
  );
};

export default Footer;
