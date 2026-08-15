import NewsletterForm from '@/components/forms/NewsletterForm';
import { Reveal } from '@/components/motion/Reveal';

export default function JoinOrbit() {
  return (
    <section id="notify" className="border-t border-graphite py-16 md:py-24">
      <Reveal className="container-lunaro max-w-lg">
        <NewsletterForm />
      </Reveal>
    </section>
  );
}