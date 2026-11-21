/**
 * The house mark — the arch-and-calligraphy lockup from the brand file,
 * drawn as a CSS mask so it takes whatever colour its parent sets.
 */
export default function Logo({ className = 'h-14 w-[46px]', title = 'Pak Arabian Fragrances' }) {
  return (
    <span
      role="img"
      aria-label={title}
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        WebkitMaskImage: 'url(/logo.svg)',
        maskImage: 'url(/logo.svg)',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
      }}
    />
  );
}
