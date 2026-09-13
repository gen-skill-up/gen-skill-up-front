import React from 'react';

export default function OwlLogo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Robot Antenna & Glowing Light */}
      <line x1="40" y1="16" x2="40" y2="7" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="40" cy="6" r="3.5" fill="#22D3EE" />

      {/* Robot Head (Rounded White Visor casing) */}
      <rect x="18" y="16" width="44" height="34" rx="14" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2.5" />
      {/* Dark visor display screen */}
      <rect x="22" y="20" width="36" height="26" rx="9" fill="#0F0D52" />

      {/* Glowing Cyan Eyes */}
      <ellipse cx="31" cy="33" rx="4.5" ry="5.5" fill="#22D3EE" />
      <ellipse cx="49" cy="33" rx="4.5" ry="5.5" fill="#22D3EE" />
      {/* Eye glint highlights */}
      <circle cx="32.5" cy="31" r="1.5" fill="#FFFFFF" />
      <circle cx="50.5" cy="31" r="1.5" fill="#FFFFFF" />

      {/* Cute Pink Blushing Cheek Lights */}
      <circle cx="27" cy="40" r="1.5" fill="#F472B6" opacity="0.75" />
      <circle cx="53" cy="40" r="1.5" fill="#F472B6" opacity="0.75" />

      {/* Side Headphone/Ears */}
      <rect x="13" y="25" width="5" height="16" rx="2.5" fill="#3B82F6" />
      <rect x="62" y="25" width="5" height="16" rx="2.5" fill="#3B82F6" />
      <circle cx="15.5" cy="33" r="1.5" fill="#FFFFFF" opacity="0.8" />
      <circle cx="64.5" cy="33" r="1.5" fill="#FFFFFF" opacity="0.8" />

      {/* Graduation Cap on top of head */}
      {/* Cap base band */}
      <polygon points="26,12 54,12 50,15 30,15" fill="#1E293B" />
      {/* Tilted diamond cap top */}
      <polygon points="40,3 58,8 40,13 22,8" fill="#1E293B" />
      {/* Cap tassel cord */}
      <path d="M40,8 C33,9 25,10 20,11" stroke="#FBBF24" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Tassel fringe dot */}
      <circle cx="19.5" cy="11.5" r="2.5" fill="#FBBF24" />

      {/* Robot Neck */}
      <rect x="34" y="49" width="12" height="6" rx="1.5" fill="#CBD5E1" />

      {/* Robot Body / Chest */}
      <path d="M24 54 C24 54, 21 73, 29 76 L51 76 C59 73, 56 54, 56 54 Z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.5" />
      {/* Glowing heart/energy core */}
      <circle cx="40" cy="65" r="5" fill="#3B82F6" />
      <circle cx="40" cy="65" r="2" fill="#22D3EE" />
    </svg>
  );
}
