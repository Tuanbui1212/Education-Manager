import type { PropsWithChildren } from "react";

function PrivateRoute({ children }: { children: PropsWithChildren }) {
  const token = localStorage.getItem("success");

  if (!token) {
    return 1;
  }

  return children;
}

export default PrivateRoute;
