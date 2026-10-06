const HamburgerIcon = ({ isOpen, className = 'w-5 h-5' }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {isOpen ? (
      <>
        <path d="M18 6L6 18" />
        <path d="M6 6l12 12" />
      </>
    ) : (
      <>
        <path d="M3 12h18" />
        <path d="M3 6h18" />
        <path d="M3 18h18" />
      </>
    )}
  </svg>
);

export default HamburgerIcon;