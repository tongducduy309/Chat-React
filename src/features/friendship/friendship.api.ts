

import type { ResponseObject } from "@/lib/ResponseObject";
import { http } from "../../lib/http";
import type { Friendship, UserSearchRes } from "./friendship.type";


export async function getUserByPhoneOrUserCode(value: string): Promise<UserSearchRes[]> {
  const {data} = await http.get(`/friends/search/${value}/phone-or-userCode`);
  return data.data;
}

export async function sendFriendRequest(userId: number): Promise<ResponseObject<Friendship>> {
  const {data} = await http.post(`/friends/request/${userId}`);
  return data
}

export async function acceptFriendRequest(userId: number): Promise<ResponseObject<void>> {
  const {data} = await http.post(`/friends/accept/${userId}`);
  return data
}

export async function rejectFriendRequest(userId: number): Promise<ResponseObject<void>> {
  const {data} = await http.post(`/friends/reject/${userId}`);
  return data
}

export async function cancelFriendRequest(userId: number): Promise<ResponseObject<void>> {
  const {data} = await http.post(`/friends/cancel/${userId}`);
  return data
}

export async function unfriend(userId: number): Promise<ResponseObject<void>> {
  const {data} = await http.post(`/friends/unfriend/${userId}`);
  return data
}

export async function blockUser(userId: number): Promise<ResponseObject<void>> {
  const {data} = await http.post(`/friends/block/${userId}`);
  return data
}

export async function unblockUser(userId: number): Promise<ResponseObject<void>> {
  const {data} = await http.post(`/friends/unblock/${userId}`);
  return data
}