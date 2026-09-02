import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import {
  fetchAuthSnapshot,
  signIn as authSignIn,
  signOut as authSignOut,
  signUp as authSignUp,
  type AppUser,
  type OrgProfile,
  type RegistrationDocumentPayload,
  type OrganizationLoginUser,
} from "@/services/auth/authService";

export type AppState = "NO_SESSION" | "AUTH_LOADING" | "ONBOARDING" | "DASHBOARD";

export interface UseAuthResult {
  appState: AppState;
  session: Session | null;
  appUser: AppUser | null;
  organization: OrgProfile | null;
  error: string | null;
  signUp: (email: string, password: string, firstName: string, lastName: string, organizationName: string, document?: RegistrationDocumentPayload | null) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const [session, setSession] = useState<Session | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [organization, setOrganization] = useState<OrgProfile | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSnapshot = useCallback(async (nextSession: Session | null) => {
    try {
      const snapshot = await fetchAuthSnapshot(nextSession);
      setSession(snapshot.session);
      setAppUser(snapshot.appUser);
      setOrganization(snapshot.organization);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load session.");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    // First, check for cached standalone session
    try {
      const cached = localStorage.getItem("globex_standalone_session");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.session && parsed?.user) {
          const u = parsed.user;
          setSession(parsed.session);
          setAppUser({
            id: u.userId,
            authId: parsed.session.user.id,
            email: u.email,
            firstName: u.name.split(" ")[0] || "Demo",
            lastName: u.name.split(" ").slice(1).join(" ") || "User",
          });
          setOrganization({
            id: u.organizationId,
            legalName: u.companyName,
            tradeName: u.tradeName || null,
            businessType: u.businessType || "EXPORTER",
            country: u.country || "India",
            organizationRole: "ORGANIZATION_ADMIN",
            onboardingStep: "DONE",
            onboardingCompleted: true,
            verificationStatus: u.verificationStatus || "VERIFIED",
          });
          setInitializing(false);
          return;
        }
      }
    } catch (_) {}

    supabase.auth.getSession()
      .then(({ data }) => {
        if (cancelled) return;
        if (data && data.session) {
          loadSnapshot(data.session).finally(() => {
            if (!cancelled) setInitializing(false);
          });
        } else {
          setInitializing(false);
        }
      })
      .catch((err) => {
        console.warn("Supabase auth session check fallback:", err);
        if (!cancelled) setInitializing(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!nextSession) {
        // Only clear if no standalone cached session
        const cached = localStorage.getItem("globex_standalone_session");
        if (!cached) {
          setSession(null);
          setAppUser(null);
          setOrganization(null);
        }
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [loadSnapshot]);

  const refresh = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getSession();
      await loadSnapshot(data?.session || null);
    } catch (_) {
      await loadSnapshot(null);
    }
  }, [loadSnapshot]);

  const signUp = useCallback(async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    organizationName: string,
    document?: RegistrationDocumentPayload | null
  ) => {
    setError(null);
    try {
      const authData = await authSignUp(email, password, firstName, lastName, organizationName, document);
      if (authData?.session) {
        setSession(authData.session);
        setAppUser({
          id: authData.session.user.id,
          authId: authData.session.user.id,
          email,
          firstName,
          lastName,
        });
        setOrganization({
          id: "org_" + Math.random().toString(36).substring(2, 9),
          legalName: organizationName,
          tradeName: organizationName,
          businessType: "EXPORTER",
          country: "India",
          organizationRole: "ORGANIZATION_ADMIN",
          onboardingStep: "DONE",
          onboardingCompleted: true,
          verificationStatus: "VERIFIED",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
      throw err;
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const authData = await authSignIn(email, password);
      setSession(authData.session);
      const loginUser: OrganizationLoginUser = authData.user;
      setAppUser({
        id: loginUser.userId,
        authId: authData.session.user.id,
        email: loginUser.email,
        firstName: loginUser.name.split(" ")[0] || "Trader",
        lastName: loginUser.name.split(" ").slice(1).join(" ") || "",
      });
      setOrganization({
        id: loginUser.organizationId,
        legalName: loginUser.companyName,
        tradeName: loginUser.tradeName || null,
        businessType: loginUser.businessType || "EXPORTER",
        country: loginUser.country || "India",
        organizationRole: loginUser.role === "admin" ? "ORGANIZATION_ADMIN" : "SALES",
        onboardingStep: loginUser.onboardingStep || "DONE",
        onboardingCompleted: loginUser.onboardingCompleted ?? true,
        verificationStatus: loginUser.verificationStatus || "VERIFIED",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    try {
      await authSignOut();
    } catch (_) {}
    localStorage.removeItem("globex_standalone_session");
    setSession(null);
    setAppUser(null);
    setOrganization(null);
  }, []);

  const appState: AppState = initializing
      ? "AUTH_LOADING"
      : !session
        ? "NO_SESSION"
        : !appUser
          ? "AUTH_LOADING"
          : !organization || !organization.onboardingCompleted
            ? "ONBOARDING"
            : "DASHBOARD";

  return {
    appState,
    session,
    appUser,
    organization,
    error,
    signUp,
    signIn,
    signOut,
    refresh,
  };
}
