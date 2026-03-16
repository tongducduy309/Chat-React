export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface User {
    id: number;
    phone: string;
    email: string;
    userCode: string;
    passwordHash?: string;
    displayName: string;
    avatarUrl?: string;
    status: UserStatus;
}

