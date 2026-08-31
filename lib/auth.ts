import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  full_name: string;
  role: "admin" | "staff";
};

export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile: profile as Profile | null };
});

export const isRegistrationClosed = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("has_any_profile");
  if (error) return true;
  return data !== false;
});