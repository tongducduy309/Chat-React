
import type { ConversationRes, DetailConversationRes, MessageRes, MessageSearchRes, SendMessageReq } from "./chat.types";
import { http } from "../../lib/http";

export async function sendMessage(
  payload: Omit<SendMessageReq, "id" | "createdAt">
): Promise<MessageRes> {
  const {data} = await http.post(
    `/conversations/messages`,
    payload
  );

  return data.data;
}

export async function getDetailConversationById(conversationId: number): Promise<DetailConversationRes> {
  const {data} = await http.get(
    `/conversations/detail/${conversationId}`
  );

  return data.data;
}

export async function getConversationById(conversationId: number): Promise<ConversationRes> {
  const {data} = await http.get(
    `/conversations/${conversationId}`
  );

  return data.data;
}

export async function getAllConversationsByUserId(): Promise<ConversationRes[]> {
  const {data} = await http.get(
    `/conversations/user`
  );

  return data.data;
}

export async function deleteForMe(messageId: number) {
  const {data} = await http.delete(
    `/conversations/message/${messageId}/delete-for-me`
  );

  return data.data;
}

export async function readMessage(conversationId: number) {
  const {data} = await http.post(
    `/conversations/${conversationId}/message/read`
  );

  return data.data;
}

export async function searchMessage(conversationId: number, keyword: string): Promise<MessageSearchRes[]> {
  const {data} = await http.get(
    `/conversations/${conversationId}/messages/search?keyword=${keyword}`
  );

  return data.data;
}

export async function searchConversation(keyword: string): Promise<ConversationRes[]> {
  const {data} = await http.get(
    `/conversations/user/search?keyword=${keyword}`
  );

  return data.data;
}

export async function updateNickname(conversationId: number, userId: number, nickname: string) {
  const {data} = await http.put(
    `/conversations/${conversationId}/nickname`,
    { userId, name:nickname }
  );

  return data.data;
}

export async function updateTitle(conversationId: number, title: string) {
  const {data} = await http.put(
    `/conversations/${conversationId}/title`,
    { name:title }
  );

  return data.data;
}


