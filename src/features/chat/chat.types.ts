import type { FriendshipStatus } from "../friendship/friendship.type";
import type { User } from "../user/user.type";

export const MessageType = {
  TEXT: "TEXT",
  CALL_VOICE: "CALL_VOICE",
  CALL_VIDEO: "CALL_VIDEO",
  SYSTEM: "SYSTEM",
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export const ConversationType = {
  DIRECT: "DIRECT",
  GROUP: "GROUP",
} as const;

export type ConversationType = (typeof ConversationType)[keyof typeof ConversationType];

export const MemberRole = {
  LEADER: "LEADER",
  MEMBER: "MEMBER",
  ADMIN: "ADMIN",
} as const;

export const MemberRoleLabel: Record<MemberRole, string> = {
  LEADER: "Trưởng nhóm",
  ADMIN: "Quản trị viên",
  MEMBER: "Thành viên",
};

export type MemberRole = (typeof MemberRole)[keyof typeof MemberRole];


export interface ConversationRes {
  id: number;
  title?: string;
  skipMessages?: number;
  lastMessage?: MessageRes;
};


export interface DetailConversationRes {
  id: number;
  title?: string;
  avatarUrl?: string | null;
  type?: ConversationType;
  role?: MemberRole;
  messages: MessageRes[];
  members: ConversationMember[];
  creatorId: number;
  friendshipStatus?: FriendshipStatus;
  targetUserId?: number;
};

export interface ConversationCreate {
  conversationId: number;
};

export interface ConversationMember {
  id?: number;
  conversationId?: number;
  user?: User;
  role?: MemberRole;
  nickname?: string | null;
  passwordConversation?: string | null;
  joinedAt?: string;
  leftAt?: string | null;
  isMuted?: boolean;
  mutedUntil?: string | null;
  lastReadMessageId?: number | null;
  addByUser?: User;
};

export interface MessageRes {
  type: MessageType;
  conversationId?: number;
  senderId?: number;
  senderNickname?: string;
  content: string;
  id?: number;
  createdAt?: string;
  replyTo?: MessageRes | null;
  membersReadMessage?: ConversationMember[];
  seq?: number;
};

export interface SendMessageReq {
  type: MessageType;
  receiverId?: number;
  conversationId?: number | null;
  content?: string;
  replyToId?: number | null;
};

export interface ReadMessageRes {
  messageId: number;
  member: ConversationMember;
}

export interface MessageSearchRes {
  id: number;
  createdAt: string;
  content: string;
};

export interface NameUpdateRes {
  conversationId: number;
};
