'use client';

import React, { useState, useEffect, useRef } from 'react';

interface TooltipProps {
    children: React.ReactNode;
    content: string;
    shortcut?: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ children, content, shortcut, position = 'top' }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        // Small delay to prevent flashing when casually moving mouse across
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
        }, 400);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };

    // Helper to figure out absolute positioning classes
    const getPositionClasses = () => {
        switch (position) {
            case 'top':
                return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
            case 'bottom':
                return 'top-full left-1/2 -translate-x-1/2 mt-2';
            case 'left':
                return 'right-full top-1/2 -translate-y-1/2 mr-2';
            case 'right':
                return 'left-full top-1/2 -translate-y-1/2 ml-2';
            default:
                return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
        }
    };

    // Helper for tooltip arrow (triangle) positioning
    const getArrowClasses = () => {
        switch (position) {
            case 'top':
                return 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 border-l-transparent border-r-transparent border-b-transparent';
            case 'bottom':
                return 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 border-l-transparent border-r-transparent border-t-transparent';
            case 'left':
                return 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 border-t-transparent border-b-transparent border-r-transparent';
            case 'right':
                return 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 border-t-transparent border-b-transparent border-l-transparent';
            default:
                return 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 border-l-transparent border-r-transparent border-b-transparent';
        }
    };

    return (
        <div
            className="relative flex items-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            // removing title to disable the default browser tooltip
            title=""
        >
            {children}
            {isVisible && (
                <div
                    className={`absolute z-50 whitespace-nowrap bg-gray-900 text-white text-xs font-semibold py-1.5 px-3 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200 ${getPositionClasses()}`}
                >
                    <span>{content}</span>
                    {shortcut && (
                        <span className="bg-gray-700 text-gray-200 px-1.5 py-0.5 rounded border border-gray-600 text-[10px] tracking-widest font-mono">
                            {shortcut}
                        </span>
                    )}
                    {/* Arrow */}
                    <div className={`absolute border-[5px] ${getArrowClasses()}`} />
                </div>
            )}
        </div>
    );
}
