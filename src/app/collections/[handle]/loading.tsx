export default function CollectionLoading() {
  return (
    <main
      className="container-lunaro pb-24 pt-32 md:pt-40"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading garments</span>

      <div aria-hidden="true" className="animate-pulse">
        <div className="mb-6">
          <div className="h-3 w-20 rounded bg-graphite" />
          <div className="mt-4 h-10 w-48 rounded bg-graphite sm:h-12 sm:w-64" />
        </div>

        <div className="mb-8 h-4 w-2/3 max-w-xl rounded bg-graphite md:mb-10" />

        <div className="mb-10 flex items-center justify-between border-b border-graphite pb-6">
          <div className="h-4 w-14 rounded bg-graphite" />
          <div className="h-4 w-24 rounded bg-graphite" />
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
