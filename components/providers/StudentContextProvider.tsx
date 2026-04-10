"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStudentContextStore } from "@/Stores/studentContextStore";

export function StudentContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const load = useStudentContextStore((state) => state.load);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) load(user.id);
    });
  }, [load]);

  return <>{children}</>;
}
