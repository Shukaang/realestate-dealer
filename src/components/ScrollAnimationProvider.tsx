// components/ScrollAnimationProvider.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import ScrollAnimationManager from "./ScrollAnimationManager";

export default function ScrollAnimationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  return (
    <>
      {isReady && <ScrollAnimationManager />}
      {children}
    </>
  );
}
