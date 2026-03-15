

import { http } from "../../lib/http";
import type { User } from "./user.type";

export async function getProfile(): Promise<User> {
  const {data} = await http.get(`/users/profile`);
  return data.data;
}

export async function getUserByPhoneOrUserCode(value: string): Promise<User[]> {
  const {data} = await http.get(`/users/search/${value}/phone-or-userCode`);
  return data.data;
}