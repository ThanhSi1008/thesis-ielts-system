"use client";

import Link from "next/link";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface PageHeaderProps {
    title: string;
    breadcrumbs: BreadcrumbItem[];
    backgroundImage?: string;
}

export default function PageHeader({ title, breadcrumbs, backgroundImage }: PageHeaderProps) {
    return (
        <div
            className="relative w-full pt-32 pb-14 flex flex-col items-center justify-center text-white overflow-hidden"
            style={
                backgroundImage
                    ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : { background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)" }
            }
        >
            {/* Dark overlay for readability when using a background image */}
            {backgroundImage ? (
                <div className="absolute inset-0 bg-black/50 pointer-events-none" />
            ) : (
                <>
                    {/* Decorative blurred circles (gradient fallback only) */}
                    <div className="absolute top-[-60px] left-[-60px] w-72 h-72 bg-yellow-400 opacity-10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-[-40px] right-[-40px] w-60 h-60 bg-blue-500 opacity-10 rounded-full blur-3xl pointer-events-none" />
                    {/* Subtle dot-grid overlay */}
                    <div
                        className="absolute inset-0 opacity-5 pointer-events-none"
                        style={{
                            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                            backgroundSize: "28px 28px",
                        }}
                    />
                </>
            )}

            {/* Title */}
            <h1 className="relative z-10 text-4xl md:text-5xl font-extrabold drop-shadow-lg text-center tracking-wide">
                {title}
            </h1>

            {/* Breadcrumbs */}
            <nav className="relative z-10 mt-4 flex items-center gap-2 text-sm md:text-base font-semibold flex-wrap justify-center">
                {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    return (
                        <span key={index} className="flex items-center gap-2">
                            {isLast ? (
                                <span className="text-[#FFC600]">{crumb.label}</span>
                            ) : (
                                <>
                                    {crumb.href ? (
                                        <Link
                                            href={crumb.href}
                                            className="text-white/80 hover:text-white transition-colors"
                                        >
                                            {crumb.label}
                                        </Link>
                                    ) : (
                                        <span className="text-white/80">{crumb.label}</span>
                                    )}
                                    {/* Separator dot */}
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFC600] inline-block" />
                                </>
                            )}
                        </span>
                    );
                })}
            </nav>
        </div>
    );
}
