type MascotProps = {
  celebrate?: boolean;
  className?: string;
};

/** Our little reading buddy. All artwork is original, inline, and offline. */
export function Mascot({ celebrate = false, className = '' }: MascotProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 260 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse cx="137" cy="164" rx="84" ry="9" fill="#E6E9DB" />
      <path
        d="m195 33 26 7-4 10-26-7z"
        fill="#EDE5F3"
        transform="rotate(12 195 33)"
      />
      <path d="m207 27 5-7m10 18 9-1" stroke="#B6A2D0" strokeWidth="3" strokeLinecap="round" />
      <path d="M38 91c-10-16 17-18 9-31-4-7-12-4-10 2" stroke="#B6A2D0" strokeWidth="3" strokeLinecap="round" />
      <path d="m57 21 3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Z" fill="#EDBE60" />
      <path d="m229 95 2 6 7 2-7 3-2 6-3-6-6-3 6-2 3-6Z" fill="#EDBE60" />
      <circle cx="204" cy="77" r="3" fill="#B6A2D0" />
      <circle cx="59" cy="121" r="3" fill="#D2DDBF" />
      <circle cx="221" cy="145" r="2.5" fill="#ED876B" />
      {celebrate && (
        <g className="mascot-confetti">
          <path d="m23 37 4 8m205-28-5 8M38 150l-5 5" stroke="#ED876B" strokeWidth="4" strokeLinecap="round" />
          <path d="m183 12 2 7m57 105 5 5" stroke="#A9BD8A" strokeWidth="4" strokeLinecap="round" />
          <circle cx="20" cy="111" r="3" fill="#EDBE60" />
          <circle cx="171" cy="22" r="2" fill="#B6A2D0" />
        </g>
      )}

      {/* A sprout for every new thing we learn. */}
      <path d="M131 38c-1-11 0-18 6-25" stroke="#3D7656" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M132 26c-13 0-20-7-20-16 12-1 20 5 20 16Z" fill="#8CA879" />
      <path d="M133 23c-1-12 6-19 17-20 2 10-3 19-17 20Z" fill="#547D58" />

      {/* Softly pointed ears and a plump little owl silhouette. */}
      <path
        d="M79 79c-1-17-3-31 2-43 3-7 15 5 22 12 16-8 41-9 59-1 8-8 18-18 22-11 6 12 3 29 2 44 11 17 16 40 9 59-7 18-30 27-60 27-33 0-58-9-64-29-6-18-1-39 8-58Z"
        fill="#E78C70"
      />
      <path d="m83 44 4 23 13-14-17-9Zm95 0-17 10 13 14 4-24Z" fill="#C96F57" />
      <path d="M92 113c8-11 23-17 41-17 19 0 35 7 43 19l-1 30H93l-1-32Z" fill="#F5B99C" />
      <path d="M80 104c-14 6-23 21-16 32 3 6 14 3 24-7" fill="#D6785E" />
      <path d="M184 103c15 6 23 22 16 33-5 7-15 2-25-8" fill="#D6785E" />

      {/* The eye shapes overlap just a little, like a real owl's face. */}
      <path d="M131 67c-17-24-43-19-48 4-5 25 18 40 48 27 30 13 54-3 48-27-5-23-31-28-48-4Z" fill="#FFF5DA" />
      <ellipse cx="108" cy="79" rx="10" ry="12" fill="#2C4D3E" />
      <circle cx="111" cy="75" r="3.5" fill="white" />
      {celebrate ? (
        <path d="M147 80c4-6 10-6 14 0" stroke="#2C4D3E" strokeWidth="4" strokeLinecap="round" />
      ) : (
        <>
          <ellipse cx="153" cy="79" rx="10" ry="12" fill="#2C4D3E" />
          <circle cx="156" cy="75" r="3.5" fill="white" />
        </>
      )}
      <ellipse cx="94" cy="94" rx="6" ry="3" fill="#ECAA8B" />
      <ellipse cx="167" cy="94" rx="6" ry="3" fill="#ECAA8B" />
      <path d="M124 88c3-4 10-4 14 0l-7 10-7-10Z" fill="#D39B3E" />
      <path d="M119 104c7 5 15 5 22 0" stroke="#C16D54" strokeWidth="2.5" strokeLinecap="round" />

      {/* An open crossword book, held in both wings. */}
      <path d="m77 118 55 8 55-8v40l-55 8-55-8v-40Z" fill="#41694D" />
      <path d="M82 114c18-2 35 3 50 11v35c-16-7-33-9-50-6v-40Z" fill="#DDE9B9" />
      <path d="M182 114c-18-2-35 3-50 11v35c16-7 33-9 50-6v-40Z" fill="#ECF0D0" />
      <path d="M132 126v34" stroke="#8FA777" strokeWidth="1.5" />
      <g transform="matrix(1 .1 0 1 91 124)">
        <path d="M0 0h9v9H0V0Zm10 0h9v9h-9V0Zm10 0h9v9h-9V0ZM10 10h9v9h-9v-9ZM0 20h9v9H0v-9Z" fill="#97B480" />
        <path d="M20 20h9v9h-9v-9ZM10 20h9v9h-9v-9Z" fill="#FAF9E9" />
        <text x="12.4" y="7" fill="#41694D" fontFamily="sans-serif" fontSize="7" fontWeight="700">A</text>
        <text x="12.4" y="17" fill="#41694D" fontFamily="sans-serif" fontSize="7" fontWeight="700">B</text>
        <text x="12.4" y="27" fill="#41694D" fontFamily="sans-serif" fontSize="7" fontWeight="700">C</text>
      </g>
      <path d="m144 128 26-4m-26 12 26-4m-26 12 18-3" stroke="#B4C499" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M74 127c-7 0-7 11 1 13l10 2 2-11-13-4Zm115 0c7 0 7 11-1 13l-10 2-2-11 13-4Z" fill="#E78C70" />
      <path d="M104 164c-3-6-11-7-15-1m63 1c3-6 11-7 15-1" stroke="#CD9750" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export function SproutLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <rect width="40" height="40" rx="12" fill="#254F43" />
      <rect x="9" y="16" width="6" height="6" rx="1.5" fill="#FCF8EA" />
      <rect x="16.5" y="16" width="6" height="6" rx="1.5" fill="#FCF8EA" />
      <rect x="16.5" y="23.5" width="6" height="6" rx="1.5" fill="#FCF8EA" />
      <rect x="24" y="23.5" width="6" height="6" rx="1.5" fill="#BFD69B" />
      <path d="M24.5 16c-.5-6 3-9 8-9 .4 5-2.3 9-8 9Z" fill="#BFD69B" />
      <path d="M24.5 17c0-6-3-8.5-7.5-8.5 0 5 2.5 8.5 7.5 8.5Z" fill="#8EAC78" />
    </svg>
  );
}
