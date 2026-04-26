export default function Skeleton({ width = '100%', height = '20px', borderRadius = 'var(--radius-base)', className = '', style = {} }) {
  return (
    <div 
      className={`skeleton-loader ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
    ></div>
  );
}
