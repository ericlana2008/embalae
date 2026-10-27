import React from 'react';

interface BannerProps {
  bannerImage?: string;
  bannerZoom?: number;
  distributorName?: string;
}

export const Banner: React.FC<BannerProps> = ({
  bannerImage,
  bannerZoom = 100,
  distributorName = 'Distribuidora',
}) => {
  // If user uploaded an image
  if (bannerImage && bannerImage.trim() !== '') {
    return (
      <div
        className="w-full h-32 sm:h-36 overflow-hidden relative bg-white border-b border-slate-200/80 shadow-xs select-none flex items-center justify-center p-1"
        aria-label="Banner promocional da distribuidora"
      >
        <img
          src={bannerImage}
          alt={`Banner ${distributorName}`}
          className="w-full h-full object-contain transition-transform duration-100 ease-out"
          style={{
            transform: `scale(${Math.max(50, Math.min(200, bannerZoom)) / 100})`,
            transformOrigin: 'center center',
          }}
          loading="eager"
        />
      </div>
    );
  }

  // When no custom image is configured, return null to keep catalog totally clean
  return null;
};
