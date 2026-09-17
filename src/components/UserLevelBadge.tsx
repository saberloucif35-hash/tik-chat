import React from 'react';
import { getSupporterTierStyle, getAccountLevelBadgeStyle } from '../utils/levelService';

interface UserLevelBadgeProps {
  level?: number;
  supporterLevel?: number;
  size?: 'xs' | 'sm' | 'md';
  showSupporterOnly?: boolean;
  showAccountOnly?: boolean;
  className?: string;
}

export const UserLevelBadge: React.FC<UserLevelBadgeProps> = ({
  level = 1,
  supporterLevel = 1,
  size = 'xs',
  showSupporterOnly = false,
  showAccountOnly = false,
  className = '',
}) => {
  const safeLevel = Math.min(100, Math.max(1, Math.floor(level)));
  const safeSupporterLevel = Math.min(100, Math.max(1, Math.floor(supporterLevel)));

  const accStyle = getAccountLevelBadgeStyle(safeLevel);
  const suppStyle = getSupporterTierStyle(safeSupporterLevel);

  const sizeClasses = {
    xs: 'text-[9px] px-1.5 py-0.5 font-bold gap-0.5',
    sm: 'text-[10px] px-2 py-0.5 font-bold gap-1',
    md: 'text-xs px-2.5 py-1 font-black gap-1.5',
  }[size];

  return (
    <div className={`inline-flex items-center gap-1 ${className}`} dir="ltr">
      {/* 1. Dedicated Supporter / Gifter Badge (Always visible for gifters / supporters) */}
      {!showAccountOnly && (
        <span
          className={`inline-flex items-center rounded-full border shadow-sm select-none transition-transform hover:scale-105 ${sizeClasses} ${suppStyle.badgeBg} ${suppStyle.badgeBorder} ${suppStyle.badgeText} ${suppStyle.badgeShadow}`}
          title={`${suppStyle.tierNameAr} - المستوى ${safeSupporterLevel}/100`}
        >
          <span className="text-[10px] leading-none">{suppStyle.icon}</span>
          <span className="tracking-tight font-mono">Lv.{safeSupporterLevel}</span>
        </span>
      )}

      {/* 2. General Account Level Badge (1 to 100) */}
      {!showSupporterOnly && (
        <span
          className={`inline-flex items-center rounded-full border shadow-xs select-none ${sizeClasses} ${accStyle.badgeBg} ${accStyle.badgeBorder} ${accStyle.badgeText}`}
          title={`${accStyle.titleAr} - المستوى ${safeLevel}/100`}
        >
          <span className="text-[9px] opacity-80">⭐</span>
          <span className="tracking-tight font-mono">{safeLevel}</span>
        </span>
      )}
    </div>
  );
};
