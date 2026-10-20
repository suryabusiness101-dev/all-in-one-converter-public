import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  onOpenFaq: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenFaq }) => (
  <footer className="mt-auto pt-6 pb-4 px-4 sm:px-6 md:px-8 border-t border-slate-800 light:border-slate-200">
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500 light:text-slate-500">
      <p>&copy; {new Date().getFullYear()} ConvertGrove. All conversions run 100% client-side.</p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={onOpenFaq}
          className="hover:text-cyan-400 transition-colors duration-200 light:hover:text-cyan-600"
        >
          FAQ
        </button>
        <Link to="/about" className="hover:text-cyan-400 transition-colors duration-200 light:hover:text-cyan-600">
          About
        </Link>
        <Link
          to="/privacy-policy"
          className="hover:text-cyan-400 transition-colors duration-200 light:hover:text-cyan-600"
        >
          Privacy Policy
        </Link>
        <Link
          to="/terms-of-service"
          className="hover:text-cyan-400 transition-colors duration-200 light:hover:text-cyan-600"
        >
          Terms of Service
        </Link>
        <Link to="/contact" className="hover:text-cyan-400 transition-colors duration-200 light:hover:text-cyan-600">
          Contact
        </Link>
      </div>
    </div>
  </footer>
);

export default Footer;
