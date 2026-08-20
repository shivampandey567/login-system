import { cookies } from "next/headers";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  picture: string;
  hasPassword: boolean;
}

export async function getUser(): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) return null;

  return res.json();
}