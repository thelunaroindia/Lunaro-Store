import Link from 'next/link';

// Launch-mode-only trust/conversion strip. Every line is sourced from real
// store facts, confirmed via live Fastr checkout testing — no invented
// return windows, no generic shield-icon spam. "COD Where Eligible" (not
// an unconditional "COD Available") deliberately keeps the caveat, since
// COD serviceability can still vary by pincode/courier even though the
// COD payment method itself is confirmed working. "Eligible Exchanges
// Only" (not "Easy Exchange & Returns") matches the current no-returns,
// exchange-only policy — see src/lib/config.ts → policies.shipping/refund.
// Text renders uppercase via CSS below, so copy is written in normal case.
const items = [
  { label: 'Free Standard Shipping' },
  { label: '5% Off Prepaid' },
  { label: 'COD Where Eligible' },
  { label: 'Eligible Exchanges Only', href: '/shipping-returns' },
];

export default function TrustStrip() {
  return (
    <section
      aria-label="Store policies"
      className="border-t border-graphite bg-charcoal/40 py-5"
    >
      <div className="container-lunaro flex gap-x-8 gap-y-2 overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:justify-center sm:whitespace-normal [&::-webkit-scrollbar]:hidden">
        {items.map((item, index) => (
          <div key={item.label} className="flex items-center gap-x-8">
            {item.href ? (
              <Link
                href={item.href}
                className="link-underline text-[11px] uppercase tracking-wider2 text-mist"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-[11px] uppercase tracking-wider2 text-mist">
                {item.label}
              </span>
            )}

            {index < items.length - 1 && (
              <span className="hidden text-graphite sm:inline" aria-hidden="true">
                /
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
