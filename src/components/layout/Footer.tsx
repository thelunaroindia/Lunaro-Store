import Link from 'next/link';
import { nav, contact, site } from '@/lib/config';


export default function Footer() {
  return (
    <footer className="border-t border-graphite bg-obsidian pt-20">
      <div className="container-lunaro grid gap-14 pb-16 lg:grid-cols-[1.3fr_2fr]">
        <div>
          <p className="font-display text-3xl tracking-wider2 text-lunar">{site.name}</p>
          <p className="mt-4 max-w-xs text-sm text-mist">{site.tagline}</p>
          
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {nav.footerColumns.map((col) => (
            <div key={col.title}>
              <p className="eyebrow text-lunar">{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-mist link-underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="terminator" />

      <div className="container-lunaro flex flex-col gap-4 py-8 text-xs text-mist sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
        <div className="flex gap-6">
          <span>India · INR ₹</span>
          <a
            href={contact.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="link-underline"
          >
            {contact.instagram}
          </a>
        </div>
      </div>
    </footer>
  );
}
