

import { http } from "../../lib/http";
import type { User } from "./user.type";

export async function getProfile(): Promise<User> {
  const {data} = await http.get(`/users/profile`);
  return data.data;
}
