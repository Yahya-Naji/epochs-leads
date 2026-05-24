// Eye-themed logo for Epochs Optometry.
// Keeping the export name "LeadsLogo" to avoid touching every import.
export default function LeadsLogo({
  size = 28,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-label="Epochs Optometry"
    >
      {/* Outer eye shape */}
      <path
        d="M2.5 16C5.5 9 10.5 5 16 5C21.5 5 26.5 9 29.5 16C26.5 23 21.5 27 16 27C10.5 27 5.5 23 2.5 16Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Iris */}
      <circle cx="16" cy="16" r="5" fill="currentColor" />
      {/* Pupil highlight */}
      <circle cx="14" cy="14" r="1.4" fill="white" />
    </svg>
  );
}
