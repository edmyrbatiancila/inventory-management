import type { SVGAttributes } from 'react';
export default function ApplicationLogo(props: SVGAttributes<SVGElement>) {
    return (
        <span className="flex items-center gap-2 select-none">
            <svg
                {...props}
                viewBox="0 0 40 40"
                xmlns="http://www.w3.org/2000/svg"
                className={(props.className ? props.className + ' ' : '') + 'h-8 w-8 sm:h-9 sm:w-9'}
            >
                {/* Box base */}
                <rect x="6" y="14" width="28" height="16" rx="3" fill="#2563eb"/>
                {/* Box lid */}
                <rect x="10" y="10" width="20" height="6" rx="2" fill="#3b82f6"/>
                {/* Checkmark accent */}
                <path d="M15 24l4 4 6-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <span className="hidden sm:inline font-extrabold text-xl tracking-tight text-blue-700 select-none">
                Inventrack
            </span>
        </span>
    );
}
