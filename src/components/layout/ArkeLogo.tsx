interface ArkeLogoProps {
  variant?: 'vertical' | 'horizontal';
  width?: number;
  height?: number;
  className?: string;
}

export function ArkeLogo({ variant = 'horizontal', width, height, className }: ArkeLogoProps) {
  if (variant === 'vertical') {
    return (
      <svg
        width={width ?? 400}
        height={height ?? 460}
        viewBox="0 0 400 460"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Arké Tarot"
        role="img"
      >
        {/* Outer ring */}
        <circle cx="200" cy="148" r="90" fill="none" stroke="var(--primary)" strokeWidth="1.2" opacity="0.7" />
        {/* Inner ring */}
        <circle cx="200" cy="148" r="60" fill="none" stroke="var(--primary)" strokeWidth="0.9" opacity="0.55" />

        {/* Arch */}
        <path d="M172 162 Q200 118 228 162" fill="none" stroke="var(--primary)" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="172" y1="162" x2="228" y2="162" stroke="var(--primary)" strokeWidth="2.2" strokeLinecap="round" />

        {/* 4-point concave star at arch apex */}
        <path
          fill="var(--primary)"
          d="M 200,110 C 201.4,116.5 203.5,118.5 210,120 C 203.5,121.5 201.4,123.5 200,130 C 198.6,123.5 196.5,121.5 190,120 C 196.5,118.5 198.6,116.5 200,110 Z"
        />

        {/* Divider */}
        <line x1="60" y1="262" x2="340" y2="262" stroke="var(--border)" strokeWidth="0.6" />

        {/* Wordmark */}
        <text
          x="200"
          y="318"
          textAnchor="middle"
          fontFamily="'Cinzel Decorative', serif"
          fontSize="52"
          fontWeight="400"
          fill="var(--primary)"
          letterSpacing="5"
        >
          ARKÉ
        </text>
        <text
          x="202"
          y="356"
          textAnchor="middle"
          fontFamily="'Cinzel', serif"
          fontSize="17"
          fontWeight="400"
          fill="var(--primary)"
          letterSpacing="13"
          opacity="0.55"
        >
          TAROT
        </text>
      </svg>
    );
  }

  return (
    <svg
      width={width ?? 520}
      height={height ?? 160}
      viewBox="0 0 520 160"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Arké Tarot"
      role="img"
    >
      {/* Outer ring */}
      <circle cx="80" cy="80" r="62" fill="none" stroke="var(--primary)" strokeWidth="1.2" opacity="0.7" />
      {/* Inner ring */}
      <circle cx="80" cy="80" r="41" fill="none" stroke="var(--primary)" strokeWidth="0.9" opacity="0.55" />

      {/* Arch */}
      <path d="M61 89 Q80 58 99 89" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
      <line x1="61" y1="89" x2="99" y2="89" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />

      {/* 4-point concave star at arch apex */}
      <path
        fill="var(--primary)"
        d="M 80,51 C 81,56 82.8,57.8 88,59 C 82.8,60.2 81,62 80,67 C 79,62 77.2,60.2 72,59 C 77.2,57.8 79,56 80,51 Z"
      />

      {/* Vertical divider */}
      <line x1="165" y1="22" x2="165" y2="138" stroke="var(--border)" strokeWidth="0.6" opacity="0.8" />

      {/* Wordmark */}
      <text
        x="192"
        y="74"
        textAnchor="start"
        fontFamily="'Cinzel Decorative', serif"
        fontSize="44"
        fontWeight="400"
        fill="var(--primary)"
        letterSpacing="4"
      >
        ARKÉ
      </text>
      <text
        x="195"
        y="108"
        textAnchor="start"
        fontFamily="'Cinzel', serif"
        fontSize="15"
        fontWeight="400"
        fill="var(--primary)"
        letterSpacing="12"
        opacity="0.55"
      >
        TAROT
      </text>
    </svg>
  );
}
