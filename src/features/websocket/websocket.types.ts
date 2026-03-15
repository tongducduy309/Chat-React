export const MessageEvent = {
  MESSAGE: "MESSAGE",
  CONVERSATION_CREATE: "CONVERSATION_CREATE",
  READ_MESSAGE: "READ_MESSAGE",
  NAME_UPDATE: "NAME_UPDATE",
} as const;

export type MessageEvent = (typeof MessageEvent)[keyof typeof MessageEvent];