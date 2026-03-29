import type { User } from "../user/user.type";

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export const FriendshipStatus = {
    NONE: 'NONE',
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    BLOCKED: 'BLOCKED',
    SENT: 'SENT',
    RECEIVED: 'RECEIVED',
    BE_BLOCKED: 'BE_BLOCKED',
} as const;
export type FriendshipStatus = (typeof FriendshipStatus)[keyof typeof FriendshipStatus];
export interface UserSearchRes {
    id: number;
    displayName: string;
    avatarUrl: string;
    phone: string;
    userCode: string;
    status: FriendshipStatus;
    requestedById: number;
}

export interface Friendship {
    id: number;
    user1Id: number;
    user2Id: number;
    status: FriendshipStatus;
    requestedBy: User;
}

export interface UpdateFriendshipRes {
    targetUserId: number;
    friendshipStatus: FriendshipStatus;
}

export interface ContactItemRes {
  id: number;
  displayName: string;
  avatarUrl?: string | null;
};
