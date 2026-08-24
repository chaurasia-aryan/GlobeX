import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { appwriteService } from "@/services/appwrite/client";

/**
 * ProtectedRoute — PLACEHOLDER auth gate, not a real security boundary.
 *
 * There is no real authentication backend wired into this app yet (see
 * docs/product/user_flow.md §5 and §"What could not be determined without a
 * live session"): `AuthPage` / `AuthAccordion` make zero network calls, and
 * `appwriteService` (src/services/appwrite/client.ts) is a local mock store
 * that seeds a `DEFAULT_USER` with `isLoggedIn: true` into localStorage the
 * very first time the app loads — and its `logout()` resets back to that
 * same `DEFAULT_USER`, which is *also* `isLoggedIn: true`. In other words,
 * the only "session" flag that exists today can never actually be false in
 * the current implementation, so this guard is currently an inert
 * passthrough for every visitor.
 *
 * It is still wired up (rather than left absent) so that:
 *   1. The route table already declares which routes are meant to require
 *      a session (everything except "/", "/onboarding", "/role-select",
 *      "/signup", "/login") — that intent shouldn't disappear.
 *   2. The moment `appwriteService` (or a real Supabase Auth session check)
 *      starts genuinely flipping `isLoggedIn` to false — on logout, on
 *      session expiry, on first-ever visit with no session at all — this
 *      component starts enforcing it with no route-table changes required.
 *
 * Do not represent this as "the app now has authentication." It does not.
 * This closes the gap between "some routes assume a logged-in user" and
 * "the router enforces that," using the only signal the codebase has, while
 * that signal itself remains a placeholder pending real Supabase Auth.
 */
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const currentUser = appwriteService.getCurrentUser();

  if (!currentUser || !currentUser.isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
