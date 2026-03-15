

export interface CallRes{
  event: "INCOMING_CALL" | "CALL_ACCEPTED" | "CALL_REJECTED" | "CALL_ENDED" | "CALL_RINGING";
  data: {
    callId: number;
    conversationId: number;
    callerId: number;
    receiverId: number;
    title: string;
    type: "VOICE" | "VIDEO";
  };
}


