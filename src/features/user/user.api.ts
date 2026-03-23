

import { http } from "../../lib/http";
import type { User } from "./user.type";

export async function getProfile(): Promise<User> {
  const {data} = await http.get(`/users/profile`);
  return data.data;
}

export async function isOnline(userId: number): Promise<boolean> {
  const {data} = await http.get(`/presence/${userId}`);
  return data.data;
}

export async function verifyUser(): Promise<boolean> {
  const {data} = await http.get(`/face/me`);
  return data.data;
}
