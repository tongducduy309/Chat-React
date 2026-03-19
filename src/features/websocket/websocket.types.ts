export const ConversationEvents = {
  MESSAGE: "MESSAGE",
  CONVERSATION_CREATE: "CONVERSATION_CREATE",
  READ_MESSAGE: "READ_MESSAGE",
  NAME_UPDATE: "NAME_UPDATE",
} as const;

export type ConversationEvents = (typeof ConversationEvents)[keyof typeof ConversationEvents];

export const CalendarEvents = {
  ATTENDANCE_CHECK_IN: "ATTENDANCE_CHECK_IN",
} as const;

export type CalendarEvents = (typeof CalendarEvents)[keyof typeof CalendarEvents];

export const FriendshipEvents = {
  FRIENDSHIP_UPDATE: "FRIENDSHIP_UPDATE",
} as const;

export type FriendshipEvents = (typeof FriendshipEvents)[keyof typeof FriendshipEvents];