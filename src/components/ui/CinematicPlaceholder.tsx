import clsx from 'clsx';

type Variant = 'hero' | 'campaign' | 'product' | 'lookbook' | 'fabric' | 'manifesto' | 'utility' | 'eclipse';

let grainInstanceCount = 0;

/**
 * Stands in for real photography/film wherever a Higgsfield asset or Shopify
 * product image hasn't landed yet. Every variant is a deliberate, on-brand
 * composition (gradient depth, a soft light source, restrained texture) —
 * never a flat grey box — so the site reads as finished today and simply
 * upgrades in place once real media exists at the referenced path.
 *
 * 'utility' is deliberately the quietest variant — a faint tonal gradient
 * for policy/contact/utility pages where the backdrop must support reading,
 * never compete with it. 'eclipse' is reserved for the 404 page.
 */
export function CinematicPlaceholder({
  variant,
  className,
}: {
  variant: Variant;
  className?: string;
}) {
  return (
    <div className={clsx('relative h-full w-full overflow-hidden bg-obsidian', className)}>
      <Grain />
      {variant === 'hero' && <HeroComposition />}
      {variant === 'campaign' && <CampaignComposition />}
      {variant === 'product' && <ProductComposition />}
      {variant === 'lookbook' && <LookbookComposition />}
      {variant === 'fabric' && <FabricComposition />}
      {variant === 'manifesto' && <ManifestoComposition />}
      {variant === 'utility' && <UtilityComposition />}
      {variant === 'eclipse' && <EclipseComposition />}
    </div>
  );
}

/** Shared fine film-grain texture — extremely low opacity, breaks up flat gradient fields. */
function Grain() {
  const id = `lunaro-grain-${++grainInstanceCount}`;
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05] mix-blend-overlay"
      aria-hidden
    >
      <filter id={id}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  );
}

function HeroComposition() {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_68%_32%,rgba(191,194,199,0.16),transparent_58%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 via-obsidian to-obsidian" />
      <div className="absolute left-1/2 top-[62%] h-px w-[85%] -translate-x-1/2 bg-terminator opacity-50" />
      <svg className="absolute inset-x-0 bottom-0 h-2/3 w-full opacity-70" viewBox="0 0 800 500" preserveAspectRatio="xMidYMax slice" aria-hidden>
        <path
          d="M0 500 L0 340 Q160 260 260 320 T480 300 Q600 260 680 330 T800 310 L800 500 Z"
          fill="url(#hero-fabric-grad)"
          className="animate-float"
        />
        <defs>
          <linearGradient id="hero-fabric-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#151515" />
            <stop offset="100%" stopColor="#050505" />
          </linearGradient>
        </defs>
      </svg>
    </>
  );
}

function CampaignComposition() {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(232,228,220,0.09),transparent_60%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal via-obsidian to-deepblack" />
      <div className="absolute left-1/2 top-1/2 h-[55%] w-[38%] -translate-x-1/2 -translate-y-1/2 rounded-[45%] bg-graphite/50 blur-3xl" />
    </>
  );
}

function ProductComposition() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal to-obsidian" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(191,194,199,0.10),transparent_65%)]" />
      <div className="absolute left-1/2 top-[58%] h-[40%] w-[55%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-graphite/40 blur-2xl" />
      <span className="absolute bottom-4 left-1/2 -translate-x-1/2 font-display text-xs italic tracking-wider2 text-mist/30">
        LUNARO
      </span>
    </>
  );
}

function LookbookComposition() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal via-deepblack to-obsidian" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_15%,rgba(191,194,199,0.12),transparent_55%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-obsidian to-transparent" />
    </>
  );
}

function FabricComposition() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-charcoal to-obsidian" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'repeating-linear-gradient(115deg, rgba(191,194,199,0.10) 0px, rgba(191,194,199,0.10) 1px, transparent 1px, transparent 6px)',
        }}
      />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'repeating-linear-gradient(25deg, rgba(5,5,5,0.5) 0px, rgba(5,5,5,0.5) 1px, transparent 1px, transparent 6px)',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(242,240,235,0.10),transparent_60%)]" />
    </>
  );
}

function ManifestoComposition() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal via-obsidian to-obsidian" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_85%,rgba(191,194,199,0.10),transparent_55%)]" />
      <div className="absolute left-1/2 bottom-[18%] h-[3%] w-[2.5%] -translate-x-1/2 rounded-full bg-lunar/30 blur-[2px]" />
    </>
  );
}

/** The quietest composition — a faint tonal gradient for utility pages
    (contact, policies, track order, search, wishlist, cart) where the
    backdrop must support reading, never compete with it. */
function UtilityComposition() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 via-obsidian to-obsidian" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_0%,rgba(191,194,199,0.06),transparent_60%)]" />
      <div className="absolute left-0 top-[40%] h-px w-[45%] bg-terminator opacity-30" />
    </>
  );
}

/** Reserved for the 404 page — a fading signal / lost orbital body. */
function EclipseComposition() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal via-obsidian to-obsidian" />
      <div className="absolute left-1/2 top-1/2 h-[22%] w-[22%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-graphite/70 shadow-[0_0_60px_20px_rgba(191,194,199,0.06)]" />
      <div className="absolute left-1/2 top-1/2 h-[24%] w-[24%] -translate-x-[58%] -translate-y-1/2 rounded-full bg-obsidian" />
      <div className="absolute inset-x-0 bottom-[30%] h-px bg-terminator opacity-40" />
    </>
  );
}
