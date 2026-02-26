export default function LeadsLogo({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-label="Epochs Lead"
    >
      {/* Headset arc */}
      <path
        d="M6 16C6 10.477 10.477 6 16 6C21.523 6 26 10.477 26 16"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Left ear cup */}
      <rect x="4" y="15" width="4" height="7" rx="2" fill="currentColor" />
      {/* Right ear cup */}
      <rect x="24" y="15" width="4" height="7" rx="2" fill="currentColor" />
      {/* Mic boom */}
      <path
        d="M8 22 C8 25 11 27 14 27"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Mic dot */}
      <circle cx="14.5" cy="27" r="1.5" fill="currentColor" />
    </svg>
  );
}
