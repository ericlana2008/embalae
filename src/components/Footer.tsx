import React from 'react';
import { Copyright, MapPin, Phone } from 'lucide-react';
import { DistributorConfig } from '../types';

interface FooterProps {
  config?: DistributorConfig;
  hasCartItems?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ config, hasCartItems = false }) => {
  const phone = config?.phone?.trim();
  const address = config?.addressInfo?.trim();
  const footerYear = config?.footerYear?.trim();
  const name = config?.name?.trim();

  const copyrightText = [footerYear, name].filter(Boolean).join(' - ');

  // If no contact or name info is set, render a clean minimal bar
  if (!copyrightText && !address && !phone) {
    return (
      <footer
        className={`bg-gradient-to-r from-orange-700 via-orange-800 to-orange-900 text-white text-center select-none shadow-md transition-all ${
          hasCartItems ? 'pt-4 pb-24 px-4' : 'py-3 px-4'
        }`}
      >
        <div className="flex items-center justify-center gap-1.5 text-xs text-orange-200/70 max-w-md mx-auto">
          <span>Catálogo</span>
        </div>
      </footer>
    );
  }

  return (
    <footer
      className={`bg-gradient-to-r from-orange-700 via-orange-800 to-orange-900 text-white text-center select-none shadow-md transition-all ${
        hasCartItems ? 'pt-4 pb-24 px-4' : 'py-4 px-4'
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-1.5 text-xs text-orange-100 max-w-md mx-auto">
        {copyrightText ? (
          <div className="flex items-center justify-center gap-1.5 font-bold tracking-wide text-white text-xs sm:text-[13px]">
            <Copyright className="w-3.5 h-3.5 shrink-0 text-white" />
            <span>{copyrightText}</span>
          </div>
        ) : null}

        {address ? (
          <div className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-orange-200">
            <MapPin className="w-3.5 h-3.5 text-orange-300 shrink-0" />
            <span>{address}</span>
          </div>
        ) : null}

        {phone ? (
          <a
            href={`tel:${phone.replace(/\D/g, '')}`}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-orange-100 hover:text-white transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-white shrink-0" />
            <span>{phone}</span>
          </a>
        ) : null}
      </div>
    </footer>
  );
};
