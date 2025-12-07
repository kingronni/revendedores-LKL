import React from 'react';

export const Flags = {
    PT: () => (
        <svg viewBox="0 0 640 480" className="w-6 h-6 rounded-full border border-gray-700 hover:scale-110 transition cursor-pointer">
            <g fillRule="evenodd" strokeWidth="1pt">
                <path fill="#298422" d="M0 0h213.3v480H0z" />
                <path fill="#e62e3d" d="M213.3 0h426.7v480H213.3z" />
                <path fill="#ffc629" d="M213.3 240l-85.3-64h170.6z" />
            </g>
            {/* Simplified Brazil Flag Representation just to differentiate */}
            <rect width="640" height="480" fill="#009c3b" />
            <path fill="#ffdf00" d="M319.99 71.99L511.99 239.99L319.99 407.99L127.99 239.99L319.99 71.99Z" />
            <circle cx="319.99" cy="239.99" r="85.33" fill="#002776" />
        </svg>
    ),
    EN: () => (
        <svg viewBox="0 0 640 480" className="w-6 h-6 rounded-full border border-gray-700 hover:scale-110 transition cursor-pointer">
            <path fill="#012169" d="M0 0h640v480H0z" />
            <path fill="#FFF" d="M75 0l244 181h78L0 299v81l380-280H640v280H0v81h640v-81l-244-181h-78L640 181V0H0z" /> {/* Simplified Union Jack representation */}
            <path fill="#C8102E" d="M0 0v480h640V0H0zm552 42.5L347.5 195h-55L490.5 42.5h61.5zm-552 395L292.5 285h55L42.5 437.5H0z" />
            {/* Just using standard color blocks for simplicity if SVG paths fail */}
            <rect width="640" height="480" fill="#012169" />
            <path stroke="#FFF" strokeWidth="60" d="M0,0 L640,480 M640,0 L0,480" />
            <path stroke="#C8102E" strokeWidth="40" d="M0,0 L640,480 M640,0 L0,480" />
            <path stroke="#FFF" strokeWidth="100" d="M320,0 L320,480 M0,240 L640,240" />
            <path stroke="#C8102E" strokeWidth="60" d="M320,0 L320,480 M0,240 L640,240" />
        </svg>
    ),
    ZH: () => (
        <svg viewBox="0 0 640 480" className="w-6 h-6 rounded-full border border-gray-700 hover:scale-110 transition cursor-pointer">
            <rect width="640" height="480" fill="#de2910" />
            <path fill="#ffde00" d="M96 36.6l10.4 32h33.6l-27.2 19.8 10.4 32-27.2-19.8-27.2 19.8 10.4-32L52 68.6h33.6z" />
            <g transform="translate(192 24) rotate(23.04)">
                <path fill="#ffde00" d="M0-19.2l6.2 19.2h20.2l-16.3 11.9 6.2 19.2-16.3-11.9-16.3 11.9 6.2-19.2-16.3-11.9h20.2z" transform="scale(.33333)" />
            </g>
            <g transform="translate(240 48) rotate(45.6)">
                <path fill="#ffde00" d="M0-19.2l6.2 19.2h20.2l-16.3 11.9 6.2 19.2-16.3-11.9-16.3 11.9 6.2-19.2-16.3-11.9h20.2z" transform="scale(.33333)" />
            </g>
            <g transform="translate(240 96) rotate(69.6)">
                <path fill="#ffde00" d="M0-19.2l6.2 19.2h20.2l-16.3 11.9 6.2 19.2-16.3-11.9-16.3 11.9 6.2-19.2-16.3-11.9h20.2z" transform="scale(.33333)" />
            </g>
            <g transform="translate(192 120) rotate(18.24)">
                <path fill="#ffde00" d="M0-19.2l6.2 19.2h20.2l-16.3 11.9 6.2 19.2-16.3-11.9-16.3 11.9 6.2-19.2-16.3-11.9h20.2z" transform="scale(.33333)" />
            </g>
        </svg>
    ),
    RU: () => (
        <svg viewBox="0 0 640 480" className="w-6 h-6 rounded-full border border-gray-700 hover:scale-110 transition cursor-pointer">
            <g fillRule="evenodd" strokeWidth="1pt">
                <path fill="#fff" d="M0 0h640v480H0z" />
                <path fill="#0039a6" d="M0 160h640v320H0z" />
                <path fill="#d52b1e" d="M0 320h640v160H0z" />
            </g>
        </svg>
    ),
    AR: () => (
        <svg viewBox="0 0 640 480" className="w-6 h-6 rounded-full border border-gray-700 hover:scale-110 transition cursor-pointer">
            <path fill="#007a3d" d="M0 0h640v480H0z" />
            <path fill="#fff" d="M110 200h200v30H110zm0 60h200v30H110z" /> {/* Text placeholder */}
            <path fill="#fff" d="M120 280h10v60h-10zm-30 0h10v60H90z" /> {/* Sword placeholder */}
        </svg>
    )
};
