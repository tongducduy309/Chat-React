

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConversationType } from "@/features/chat/chat.types";
import { unblockUser } from "@/features/friendship/friendship.api";
import { FriendshipStatus } from "@/features/friendship/friendship.type";
import { App } from "antd";
import { Paperclip, Globe, AtSign, ArrowUp, X } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

interface ReplyPreview {
  id: number;
  senderName?: string;
  content: string;
};

interface ChatComposerProps {
  value: string;
  onChange: (v: string) => void;
  onSend: (payload: { text: string; replyToId?: number }) => void;
  disabled?: boolean;
  friendshipStatus?: FriendshipStatus;
  replyTo?: ReplyPreview | null;
  onCancelReply?: () => void;
  targetUserId: number;
  type ?: ConversationType;
};

export function ChatComposer({ value, onChange, onSend, disabled, friendshipStatus, replyTo, onCancelReply, targetUserId, type }: ChatComposerProps) {
    
  const canSend = !disabled && value.trim().length > 0;

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {notification} = App.useApp();

  const handleSend = () => {
    const text = value.trim();
    if (!text) return;
    onSend({ text, replyToId: replyTo?.id });
  };

  const handleUnblockUser = async () => {
    try {
      await unblockUser(targetUserId).then(() => {
        notification.success({ title: "Thành công", description: "Đã bỏ chặn người dùng." });
      });

    } catch (err: any) {
      notification.error({ title: "Thất bại", description: err.message ?? "Lỗi không xác định" });
    }
  };

  useEffect(() => {
    if (replyTo) {
      inputRef.current?.focus();
    }
  }, [replyTo]);

  const isBlocked = useMemo(() => {
    return friendshipStatus === FriendshipStatus.BLOCKED || friendshipStatus === FriendshipStatus.BE_BLOCKED;
  }, [friendshipStatus]);
  return (
    <div className="w-full">
      {isBlocked && type === ConversationType.DIRECT ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">{friendshipStatus === FriendshipStatus.BE_BLOCKED ? "Bạn đã bị chặn bởi người này" : "Bạn đã chặn người này"}</p>
          {friendshipStatus === FriendshipStatus.BLOCKED && <Button variant="ghost" onClick={handleUnblockUser} className="text-blue-500 hover:text-blue-700 hover:bg-transparent">Bỏ chặn</Button>}
        </div>
      )  : (
        <div className="relative rounded-2xl border bg-background p-3 shadow-sm">

          {/* <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm text-muted-foreground hover:bg-muted"
        >
          <AtSign className="h-4 w-4" />
          <span>Add context</span>
        </button> */}

          {replyTo ? (
            <div className="mt-3 flex items-start justify-between gap-3 rounded-xl border bg-muted/40 px-3 py-2">
              <div className="min-w-0">
                <div className="text-xs font-medium text-foreground">
                  Phản hồi {replyTo.senderName ?? "message"}
                </div>
                <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {replyTo.content}
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={onCancelReply}
                aria-label="Cancel reply"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : null}

          {/* textarea */}
          <div className="mt-2">
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Trả lời tin nhắn..."
              className="min-h-[84px] resize-none border-0 p-0 shadow-none focus-visible:ring-0"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (canSend) handleSend();
                }
              }}
              ref={inputRef}
            />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>

            <Button
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={handleSend}
              disabled={!canSend}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}