import NewsletterForm from '@/components/forms/NewsletterForm';
import { Reveal } from '@/components/motion/Reveal';

export default function JoinOrbit() {
  return (
    <section className="border-t border-graphite py-16 md:py-20">
      <Reveal className="container-lunaro max-w-md">
        <NewsletterForm />
      </Reveal>
    </section>
  );
}
