"use client";
import { useState, useCallback } from "react";

export function useAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggle = useCallback((index: number) => {
    setOpenIndex(prev => prev === index ? null : index);
  }, []);
  return { openIndex, toggle };
}

export function useReadMore() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const toggle = useCallback((index: number) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);
  return { openItems, toggle };
}

export function useHeart() {
  const [hearts, setHearts] = useState<Set<number>>(new Set());
  const toggle = useCallback((index: number) => {
    setHearts(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);
  return { hearts, toggle };
}