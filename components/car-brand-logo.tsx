'use client';

import * as simpleIcons from 'simple-icons';

interface CarBrandLogoProps {
  merk: string;
  size?: number;
  className?: string;
}

// Map Dutch car brand names to Simple Icons slugs
// Note: Simple Icons uses specific naming conventions, some brands may not be available
const brandMap: Record<string, string> = {
  'audi': 'audi',
  'bmw': 'bmw',
  'mercedes-benz': 'mercedes',
  'mercedes': 'mercedes',
  'volkswagen': 'volkswagen',
  'vw': 'volkswagen',
  'ford': 'ford',
  'opel': 'opel',
  'peugeot': 'peugeot',
  'renault': 'renault',
  'citroën': 'citroen',
  'citroen': 'citroen',
  'fiat': 'fiat',
  'toyota': 'toyota',
  'nissan': 'nissan',
  'honda': 'honda',
  'mazda': 'mazda',
  'hyundai': 'hyundai',
  'kia': 'kia',
  'volvo': 'volvo',
  'skoda': 'skoda',
  'seat': 'seat',
  'mini': 'mini',
  'porsche': 'porsche',
  'tesla': 'tesla',
  'tesla motors': 'tesla',
  'land rover': 'landrover',
  'landrover': 'landrover',
  'jaguar': 'jaguar',
  'alfa romeo': 'alfaromeo',
  'alfaromeo': 'alfaromeo',
  'ferrari': 'ferrari',
  'lamborghini': 'lamborghini',
  'maserati': 'maserati',
  'bentley': 'bentley',
  'rolls-royce': 'rollsroyce',
  'rollsroyce': 'rollsroyce',
  'aston martin': 'astonmartin',
  'astonmartin': 'astonmartin',
  'mclaren': 'mclaren',
  'dacia': 'dacia',
  'suzuki': 'suzuki',
  'mitsubishi': 'mitsubishi',
  'subaru': 'subaru',
  'lexus': 'lexus',
  'infiniti': 'infiniti',
  'acura': 'acura',
  'genesis': 'genesis',
  'ds': 'dsautomobiles',
  'ds automobiles': 'dsautomobiles',
  'cupra': 'cupra',
  'lynk & co': 'lynkco',
  'lynkco': 'lynkco',
};

export function CarBrandLogo({ merk, size = 80, className = '' }: CarBrandLogoProps) {
  if (!merk) {
    return (
      <div 
        className={`flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 rounded-lg ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-2xl">🚗</span>
      </div>
    );
  }

  // Normalize brand name
  const normalizedMerk = merk.toLowerCase().trim();
  const iconSlug = brandMap[normalizedMerk] || normalizedMerk.replace(/\s+/g, '').toLowerCase();
  
  // Simple Icons exports with 'si' prefix and capitalized first letter
  const iconKey = `si${iconSlug.charAt(0).toUpperCase() + iconSlug.slice(1)}`;
  
  // Try to get the icon
  const icon = (simpleIcons as any)[iconKey];

  if (icon) {
    return (
      <div 
        className={`flex items-center justify-center bg-white dark:bg-slate-900 rounded-lg p-3 ${className}`}
        style={{ width: size, height: size }}
      >
        <svg
          role="img"
          viewBox="0 0 24 24"
          width={size * 0.7}
          height={size * 0.7}
          fill={`#${icon.hex}`}
          className="shrink-0"
        >
          <path d={icon.path} />
        </svg>
      </div>
    );
  }

  // Fallback: show brand name
  return (
    <div 
      className={`flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 rounded-lg p-3 ${className}`}
      style={{ width: size, height: size }}
    >
      <span className="text-xs font-semibold text-center leading-tight">{merk}</span>
    </div>
  );
}

