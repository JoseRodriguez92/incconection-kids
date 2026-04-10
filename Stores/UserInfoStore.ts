"use client";

import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import { persist, createJSONStorage } from "zustand/middleware";

const CURRENT_ROLE_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

/** Escribe o elimina la cookie current_role en el navegador */
export function syncRoleCookie(role: string | null) {
    if (typeof document === "undefined") return;
    if (role) {
        document.cookie = `current_role=${encodeURIComponent(role)}; path=/; max-age=${CURRENT_ROLE_COOKIE_MAX_AGE}; SameSite=Lax`;
    } else {
        document.cookie = `current_role=; path=/; max-age=0; SameSite=Lax`;
    }
}

/** Lee la cookie current_role desde el navegador */
export function getStoredRoleCookie(): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/(?:^|;\s*)current_role=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

type UserInfoStoreState = {
    user: User | null;
    setUser: (user: User | null) => void;

    roles: string[];
    setRoles: (roles: string[]) => void;

    current_role: string | null;
    setCurrentRole: (role: string | null) => void;

    hydrated: boolean;
    setHydrated: (v: boolean) => void;
    clear: () => void;
};

export const UserInfoStore = create<UserInfoStoreState>()(

    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),

            roles: [],
            setRoles: (roles) => set({ roles }),

            current_role: null,
            setCurrentRole: (role) => {
                syncRoleCookie(role);
                set({ current_role: role });
            },

            hydrated: false,
            setHydrated: (v) => set({ hydrated: v }),

            clear: () => {
                syncRoleCookie(null);
                set({ user: null, roles: [], current_role: null });
            },
        }),
        {
            name: "user-info",
            storage: createJSONStorage(() => localStorage),

            partialize: (state) => ({
                user: state.user,
                roles: state.roles,
                current_role: state.current_role,
            }),

            version: 1,
            onRehydrateStorage: () => (state) => {
                state?.setHydrated(true);
            },
        }
    )

);
