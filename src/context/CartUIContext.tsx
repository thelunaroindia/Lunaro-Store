'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Cart } from '@/lib/types';

type CartUIContextValue = {
  cart: Cart | null;
  setCart: (cart: Cart | null) => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const CartUIContext = createContext<CartUIContextValue | null>(null);

export function CartUIProvider({
  children,
  initialCart,
}: {
  children: ReactNode;
  initialCart: Cart | null;
}) {
  const [cart, setCart] = useState<Cart | null>(initialCart);
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  return (
    <CartUIContext.Provider value={{ cart, setCart, isOpen, open, close, toggle }}>
      {children}
    </CartUIContext.Provider>
  );
}

export function useCartUI() {
  const ctx = useContext(CartUIContext);
  if (!ctx) throw new Error('useCartUI must be used within CartUIProvider');
  return ctx;
}
