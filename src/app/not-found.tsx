import { LinkButton } from '@/components/ui/Button';
import { CinematicPlaceholder } from '@/components/ui/CinematicPlaceholder';

export default function NotFound() {
  return (
    <div className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      <CinematicPlaceholder variant="eclipse" className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/50 to-obsidian/20" />

      <div className="relative z-10">
        <p className="eyebrow text-silver">404</p>
        <h1 className="mt-5 font-display text-display-lg text-lunar">SIGNAL LOST.</h1>
        <p className="mt-4 text-mist">This transmission no longer exists.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <LinkButton href="/" variant="primary">
            Return Home
          </LinkButton>
          <LinkButton href="/shop" variant="ghost">
            Continue Shopping
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
