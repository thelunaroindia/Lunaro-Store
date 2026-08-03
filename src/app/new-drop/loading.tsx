export default function NewDropLoading() {
  return (
    <main
      className="container-lunaro pb-24 pt-32 md:pt-40"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading garments</span>

      <div aria-hidden="true" className="animate-pulse">
        <div className="mb-12">
          <div className="h-3 w-20 rounded bg-graphite" />
          <div className="mt-4 h-10 w-64 rounded bg-graphite sm:h-12 sm:w-80" />
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[4/5] media-rounded bg-charcoal" />
              <div className="mt-3 h-3 w-3/4 rounded bg-graphite" />
              <div className="mt-2 h-3 w-1/3 rounded bg-graphite" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
