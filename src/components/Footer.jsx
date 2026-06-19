import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100 py-6 px-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span className="text-base" role="img" aria-label="footer-logo">🍽️</span>
          <span className="font-bold text-slate-700">SmartCanteen</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 font-medium">Order Smart. Skip the Queue.</span>
        </div>
        
        <div className="flex gap-4">
          <a href="#faq" className="hover:text-orange-500 transition-colors">FAQ</a>
          <a href="#terms" className="hover:text-orange-500 transition-colors">Terms of Service</a>
          <a href="#support" className="hover:text-orange-500 transition-colors">Support Desk</a>
        </div>
        
        <p className="text-[11px] text-slate-400/80 font-normal">
          &copy; {new Date().getFullYear()} SmartCanteen Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
