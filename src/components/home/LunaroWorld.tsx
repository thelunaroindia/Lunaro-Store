import { LinkButton } from '@/components/ui/Button';
import { Reveal } from '@/components/motion/Reveal';

export default function LunaroWorld() {
  return (
    <section className="border-t border-graphite py-16 md:py-28">
      <Reveal className="container-lunaro">
        <div className="max-w-[360px] md:max-w-xl">
          <p className="eyebrow text-silver">The LUNARO World</p>

          <h2 className="mt-5 font-display text-[1.75rem] italic leading-[1.15] text-editorial sm:text-3xl md:text-[2.25rem]">
            Crafted in darkness. Designed for the unknown.
          </h2>

          <p className="mt-4 max-w-md text-sm leading-7 text-mist md:text-base">
            Built beyond trends, limited by nothing — LUNARO is worn by
            those who move without a map.
          </p>

          <LinkButton
            href="/about"
            variant="underline"
            className="mt-6"
          >
            Enter the World
          </LinkButton>
        </div>
      </Reveal>
    </section>
  );
}
