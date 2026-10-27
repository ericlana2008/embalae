import React from 'react';
import { DistributorConfig } from '../types';

interface HeaderProps {
  config: DistributorConfig;
}

export const Header: React.FC<HeaderProps> = ({ config }) => {
  const hasName = Boolean(config.name && config.name.trim());
  const hasSlogan = Boolean(config.slogan && config.slogan.trim());
  const hasBrandImage = Boolean(config.brandNameImage && config.brandNameImage.trim());
  const hasLogo = Boolean(config.logoImage && config.logoImage.trim());

  return (
    <header className="bg-gradient-to-r from-orange-700 via-orange-800 to-orange-900 text-white px-4 pt-4 pb-4 shadow-md">
      {/* Main Brand row: Logo + Name + Slogan */}
      <div className="flex items-center gap-3">
        {/* Optional uploaded logo if configured */}
        {hasLogo && (
          <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center overflow-hidden relative">
            <img
              src={config.logoImage}
              alt={config.name || 'Logo'}
              className="w-full h-full object-contain transition-transform duration-150"
              style={{
                transform: `scale(${Math.max(30, Math.min(250, config.logoZoom ?? 100)) / 100})`,
                transformOrigin: 'center center',
              }}
            />
          </div>
        )}

        {/* Brand Name (Image or Text) + Slogan */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {hasBrandImage ? (
              <div className="inline-flex items-center overflow-visible max-w-full min-h-[44px] py-1">
                <img
                  src={config.brandNameImage}
                  alt={config.name || 'Catálogo'}
                  className="w-auto max-w-full object-contain drop-shadow-sm select-none transition-all duration-150"
                  style={{
                    height: `${Math.round(38 * (Math.max(40, Math.min(200, config.brandNameZoom ?? 100)) / 100))}px`,
                    maxHeight: '96px',
                  }}
                />
              </div>
            ) : hasName ? (
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white leading-tight truncate uppercase drop-shadow-sm">
                {config.name}
              </h1>
            ) : (
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white/90 leading-tight truncate uppercase drop-shadow-sm">
                Catálogo
              </h1>
            )}
          </div>

          {/* Slogan */}
          {hasSlogan && (
            <p className="text-xs text-orange-100 font-normal leading-snug line-clamp-1 mt-1">
              {config.slogan}
            </p>
          )}
        </div>
      </div>
    </header>
  );
};
