import { supabase } from "@/lib/supabase";

export async function getUserMenu(userId: string) {
  if (!userId) return;

  const { data, error } = await supabase
    .from("gtp_user_menu")
    .select(`*`)
    .eq("user_id", userId)
    .order("order", { ascending: true });
  if (error) {
    console.error(error);
    return [];
  }
  return data;
}
