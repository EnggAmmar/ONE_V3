import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

export default function RouteTransition({ children }: { children: ReactNode }) {
  const loc = useLocation();
  return (
    <div key={loc.pathname} className="uiView">
      {children}
    </div>
  );
}

