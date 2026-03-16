import type { User } from "../user/user.type";

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type FriendshipStatus = 'NONE' | 'PENDING' | 'ACCEPTED' | 'BLOCKED';
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
