'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'w-full md:w-[480px]',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      aria-labelledby="drawer-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#171A1F]/40 backdrop-blur-[1px] transition-opacity duration-250"
        style={{ transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={`${width} bg-[#FFFFFF] border-l border-[#DFE2DF] shadow-xl flex flex-col h-full transform transition-transform duration-300`}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)',
          }}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#DFE2DF] flex items-center justify-between bg-[#F6F6F3]">
            <div>
              <h2
                id="drawer-title"
                className="text-[15px] font-semibold text-[#171A1F] leading-snug"
              >
                {title}
              </h2>
              {subtitle && (
                <p className="text-[12px] font-mono text-[#697078] mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-[4px] text-[#697078] hover:text-[#171A1F] hover:bg-[#FFFFFF] transition-colors cursor-pointer"
              aria-label="Close detail drawer"
            >
              <X size={17} />
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 overscroll-contain">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
