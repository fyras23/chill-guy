import React from "react";

export function Skyline() {
  return (
    <div
      aria-hidden="true"
      className="w-full pointer-events-none mt-auto overflow-hidden select-none"
    >
      <svg
        viewBox="0 0 1440 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full h-12 md:h-20 lg:h-24 block"
      >
        {/* Ultramarine city silhouette */}
        <path
          d="M0 120V80H60V55H110V90H170V35H230V120H280V70H330V40H390V120H450V60H510V25H570V120H630V75H690V45H750V120H810V65H870V30H930V120H990V85H1050V50H1110V120H1170V70H1230V35H1290V120H1350V60H1440V120H0Z"
          fill="#1A2A86"
        />

        {/* Lit windows in Lava Orange (#FF8A4C) and Mustard (#E0A200) */}
        {/* Building 1 */}
        <rect x="75" y="65" width="8" height="10" rx="1" fill="#FF8A4C" />
        <rect x="90" y="65" width="8" height="10" rx="1" fill="#E0A200" />
        {/* Building 2 (tall) */}
        <rect x="185" y="45" width="8" height="10" rx="1" fill="#FF8A4C" />
        <rect x="205" y="45" width="8" height="10" rx="1" fill="#E0A200" />
        <rect x="185" y="65" width="8" height="10" rx="1" fill="#E0A200" />
        <rect x="205" y="85" width="8" height="10" rx="1" fill="#FF8A4C" />
        {/* Building 3 */}
        <rect x="345" y="55" width="8" height="10" rx="1" fill="#E0A200" />
        <rect x="365" y="55" width="8" height="10" rx="1" fill="#FF8A4C" />
        <rect x="345" y="75" width="8" height="10" rx="1" fill="#E0A200" />
        {/* Building 4 (spire / tall) */}
        <rect x="525" y="38" width="8" height="10" rx="1" fill="#FF8A4C" />
        <rect x="545" y="38" width="8" height="10" rx="1" fill="#E0A200" />
        <rect x="525" y="60" width="8" height="10" rx="1" fill="#E0A200" />
        <rect x="545" y="80" width="8" height="10" rx="1" fill="#FF8A4C" />
        {/* Building 5 */}
        <rect x="705" y="60" width="8" height="10" rx="1" fill="#E0A200" />
        <rect x="725" y="80" width="8" height="10" rx="1" fill="#FF8A4C" />
        {/* Building 6 */}
        <rect x="885" y="45" width="8" height="10" rx="1" fill="#FF8A4C" />
        <rect x="905" y="45" width="8" height="10" rx="1" fill="#E0A200" />
        <rect x="885" y="70" width="8" height="10" rx="1" fill="#E0A200" />
        {/* Building 7 */}
        <rect x="1065" y="65" width="8" height="10" rx="1" fill="#FF8A4C" />
        <rect x="1085" y="85" width="8" height="10" rx="1" fill="#E0A200" />
        {/* Building 8 */}
        <rect x="1245" y="50" width="8" height="10" rx="1" fill="#E0A200" />
        <rect x="1265" y="70" width="8" height="10" rx="1" fill="#FF8A4C" />
      </svg>
    </div>
  );
}

