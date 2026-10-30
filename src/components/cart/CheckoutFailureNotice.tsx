'use client';

export default function CheckoutFailureNotice({
  onRetry,
  onFallback,
}: {
  onRetry: () => void;
  onFallback: () => void;
}) {
  return (
    <div className="mt-3 text-center text-xs text-silver first:mt-0" role="alert">
      <p>Checkout couldn&apos;t load. Your bag is safe.</p>
      <div className="mt-2 flex flex-wrap justify-center gap-4">
        <button type="button" onClick={onRetry} className="link-underline text-lunar">
          Try Again
        </button>
        <button type="button" onClick={onFallback} className="link-underline text-lunar">
          Continue to Secure Checkout
        </button>
      </div>
    </div>
  );
}
