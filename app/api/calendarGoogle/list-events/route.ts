// import { NextResponse } from "next/server";
// import { cookies } from "next/headers";
// import { createServerClient } from "@supabase/ssr";

// export async function GET() {

//     const cookieStore = cookies();
//     const supabase = createServerClient(
//         process.env.NEXT_PUBLIC_SUPABASE_URL!,
//         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//         {
//             cookies: {
//                 getAll() {
//                     //@ts-ignore
//                     return cookieStore.get(name)?.value;
//                 },
//                 // setAll(name: string, value: string, options: CookieOptions) {
//                 //     cookieStore.set({ name, value, ...options });
//                 // },
//                 // remove(name: string, options: CookieOptions) {
//                 //     cookieStore.set({ name, value: "", ...options });
//                 // },
//             },
//         }
//     );

//     const { data: { session } } = await supabase.auth.getSession();
//     const accessToken = session?.provider_token;
//     if (!accessToken) return NextResponse.json({ error: "No Google token" }, { status: 401 });

//     // Rango: próxima semana (puedes leer timeMin/timeMax desde req.url si quieres)
//     const timeMin = new Date().toISOString();
//     const timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

//     const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
//     url.searchParams.set("timeMin", timeMin);
//     url.searchParams.set("timeMax", timeMax);
//     url.searchParams.set("singleEvents", "true");
//     url.searchParams.set("orderBy", "startTime");
//     url.searchParams.set("maxResults", "50");
//     url.searchParams.set("conferenceDataVersion", "1");

//     const r = await fetch(url.toString(), {
//         headers: { Authorization: `Bearer ${accessToken}` },
//         cache: "no-store",
//     });

//     const json = await r.json();
//     if (!r.ok) return NextResponse.json(json, { status: r.status });

//     return NextResponse.json({ items: json.items, nextPageToken: json.nextPageToken });
// }
