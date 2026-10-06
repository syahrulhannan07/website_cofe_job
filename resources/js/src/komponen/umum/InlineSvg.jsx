const InlineSvg = ({ paths, className = 'w-4 h-4', viewBox = '0 0 24 24', fill = 'none', stroke = 'currentColor', strokeWidth = 2, strokeLinecap = 'round', strokeLinejoin = 'round', ...props }) => (
  <svg
    className={className}
    viewBox={viewBox}
    fill={fill}
    stroke={stroke}
    strokeWidth={strokeWidth}
    strokeLinecap={strokeLinecap}
    strokeLinejoin={strokeLinejoin}
    {...props}
  >
    {Array.isArray(paths) ? paths.map((d, i) => <path key={i} d={d} />) : <path d={paths} />}
  </svg>
);

export default InlineSvg;