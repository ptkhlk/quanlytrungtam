import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";

export default async function Home() {
  const session = await getUser();
  redirect(session ? "/dashboard" : "/login");
}