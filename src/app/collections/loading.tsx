export default function CollectionsIndexLoading() {
  return (
    <main
      className="container-lunaro pb-24 pt-32 md:pt-40"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading garments</span>

      <div aria-hidden="true" className="animate-pulse">
        <div className="mb-14">
          <div className="h-3 w-20 rounded bg-graphite" />
          <div className="mt-4 h-10 w-56 rounded bg-graphite sm:h-12 sm:w-72" />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="relative aspect-[4/5] media-rounded bg-charcoal"
            >
              <div className="absolute bottom-4 left-4 h-5 w-24 rounded bg-graphite sm:bottom-5 sm:left-5 lg:bottom-6 lg:left-6" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
