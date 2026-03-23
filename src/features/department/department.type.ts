
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

export interface DepartmentMemberRes {
    userId: number;
    avatarUrl: string;
    displayName: string;
    email: string;
    departmentName: string;
    positionName: string;
    isLeader?: boolean;
    isExecutive?: boolean;
    active?: boolean;
}
