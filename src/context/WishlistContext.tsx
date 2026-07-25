'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type WishlistItem = {
  handle: string;
  title: string;
  price: string; // formatted, e.g. "₹1,199"
  imageUrl: string | null;
};

type WishlistContextValue = {
  items: WishlistItem[];
  has: (handle: string) => boolean;
  toggle: (item: WishlistItem) => void;
  remove: (handle: string) => void;
};

const STORAGE_KEY = 'lunaro_wishlist';
const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage may be unavailable (private browsing) — wishlist just won't persist
    }
  }, [items, hydrated]);

  function has(handle: string) {
    return items.some((i) => i.handle === handle);
  }

  function toggle(item: WishlistItem) {
    setItems((prev) =>
      prev.some((i) => i.handle === item.handle)
        ? prev.filter((i) => i.handle !== item.handle)
        : [...prev, item]
    );
  }

  function remove(handle: string) {
    setItems((prev) => prev.filter((i) => i.handle !== handle));
  }

  return (
    <WishlistContext.Provider value={{ items, has, toggle, remove }}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
