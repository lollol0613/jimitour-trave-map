"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase-client";

type AdminOnlyProps = {
  children: ReactNode;
};

export default function AdminOnly({ children }: AdminOnlyProps) {
  const supabase = createBrowserSupabaseClient();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(Boolean(data.user));
      setChecked(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session?.user));
      setChecked(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!checked || !isLoggedIn) {
    return null;
  }

  return <>{children}</>;
}
