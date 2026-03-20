import { useMemo, useState } from "react";
import { Ellipsis, Reply, SmilePlus } from "lucide-react";

import {
  MessageType,
  type ConversationMember,
  type MessageRes,
} from "@/features/chat/chat.types";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type MessageReaction = {
  userId: number;
  emoji: string;
};

interface MessageBubbleProps {
  message: MessageRes & {
    reactions?: MessageReaction[];
  };
  userId?: number;
  onReplyClick?: (message: MessageRes) => void;
  onReplyJump?: (replyToId: number) => void;
  onDeleteForMe?: (messageId: number) => void;
  onRecall?: (messageId: number) => void;
  onReact?: (messageId: number, emoji: string) => void;
  membersReadMessage?: ConversationMember[];
}

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

export function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const parts: string[] = [];

  if (h > 0) parts.push(`${h} giờ`);
  if (m > 0) parts.push(`${m} phút`);
  if (s > 0 || parts.length === 0) parts.push(`${s} giây`);

  return parts.join(" ");
}

export default function MessageBubble({
  message,
  userId,
  membersReadMessage,
  onReplyClick,
  onReplyJump,
  onDeleteForMe,
  onRecall,
  onReact,
}: MessageBubbleProps) {
  const isMine = message.senderId === userId;
  const [visibleCreatedAt, setVisibleCreatedAt] = useState(false);

  const reactionGroups = useMemo(() => {
    const grouped = new Map<
      string,
      {
        emoji: string;
        count: number;
        reactedByMe: boolean;
        userIds: number[];
      }
    >();

    for (const reaction of message.reactions ?? []) {
      const prev = grouped.get(reaction.emoji);

      if (prev) {
        prev.count += 1;
        prev.userIds.push(reaction.userId);
        if (reaction.userId === userId) {
          prev.reactedByMe = true;
        }
      } else {
        grouped.set(reaction.emoji, {
          emoji: reaction.emoji,
          count: 1,
          reactedByMe: reaction.userId === userId,
          userIds: [reaction.userId],
        });
      }
    }

    return Array.from(grouped.values());
  }, [message.reactions, userId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content ?? "");
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <div className="mb-[10px]">
      <div className="text-center text-[12px] text-[#666]">
        {visibleCreatedAt &&
          message.type !== MessageType.SYSTEM &&
          (message.createdAt ?? "")}

        {message.type === MessageType.SYSTEM && (
          <div className="text-gray-800">{message.content}</div>
        )}
      </div>

      {message.type !== MessageType.SYSTEM && (
        <div
          className={`flex items-center gap-2 ${
            isMine ? "justify-end" : "justify-start"
          }`}
        >
          {!isMine && (
            <MessageActions
              message={message}
              onReplyClick={onReplyClick}
              onDeleteForMe={onDeleteForMe}
              onRecall={onRecall}
              onCopy={handleCopy}
              onReact={onReact}
            />
          )}

          <div
            className={`max-w-[60%] rounded-xl border p-2 ${
              isMine ? "bg-blue-100 text-gray-700" : "bg-muted"
            }`}
            onDoubleClick={() => setVisibleCreatedAt((prev) => !prev)}
          >
            {message.replyTo && (
              <div
                className="mb-1 cursor-pointer border-l-2 border-gray-400 pl-2 text-xs opacity-80"
                onClick={() => onReplyJump?.(message.replyTo?.id ?? 0)}
              >
                <div className="font-medium">
                  {message.replyTo?.senderId === userId
                    ? "Bạn"
                    : message.replyTo?.senderNickname}
                </div>
                <div className="line-clamp-2">{message.replyTo?.content}</div>
              </div>
            )}

            {(message.type === MessageType.CALL_VOICE ||
              message.type === MessageType.CALL_VIDEO) && (
              <div className="max-w-[220px] rounded-lg p-3 text-sm">
                <div className="font-medium text-gray-800">
                  {Number(message.content) === 0
                    ? "Cuộc gọi nhỡ"
                    : message.type === MessageType.CALL_VOICE
                    ? "Cuộc gọi thoại"
                    : "Cuộc gọi video"}
                </div>

                <div className="mt-1 flex items-center gap-2 text-gray-600">
                  <span className="text-lg text-green-600">📞</span>
                  <span>{formatDuration(Number(message.content))}</span>
                </div>

                <div className="mt-2 border-t border-gray-300 pt-2 text-center">
                  <button
                    className="font-medium text-blue-600 hover:underline"
                    onClick={() => {
                      console.log("call again");
                    }}
                  >
                    Gọi lại
                  </button>
                </div>
              </div>
            )}

            {message.type === MessageType.TEXT && (
              <div className="break-all whitespace-pre-wrap text-gray-800">
                {message.content}
              </div>
            )}

            {reactionGroups.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {reactionGroups.map((reaction) => (
                  <button
                    key={reaction.emoji}
                    type="button"
                    onClick={() => onReact?.(message.id??-1, reaction.emoji)}
                    className={[
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition",
                      reaction.reactedByMe
                        ? "border-blue-300 bg-blue-100 text-blue-700"
                        : "bg-background hover:bg-muted",
                    ].join(" ")}
                    title={`${reaction.count} reaction`}
                  >
                    <span>{reaction.emoji}</span>
                    <span>{reaction.count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {isMine && (
            <MessageActions
              message={message}
              onReplyClick={onReplyClick}
              onDeleteForMe={onDeleteForMe}
              onRecall={onRecall}
              onCopy={handleCopy}
              onReact={onReact}
            />
          )}
        </div>
      )}

      <div className={`text-[10px] ${isMine ? "text-end" : "text-start"}`}>
        {membersReadMessage
          ?.filter((member) => member.id !== message.senderId)
          .map((member) => member.nickname)
          .join(", ")}
      </div>
    </div>
  );
}

interface MessageActionsProps {
  message: MessageRes;
  onReplyClick?: (message: MessageRes) => void;
  onDeleteForMe?: (messageId: number) => void;
  onRecall?: (messageId: number) => void;
  onCopy?: () => void;
  onReact?: (messageId: number, emoji: string) => void;
}

function MessageActions({
  message,
  onReplyClick,
  onDeleteForMe,
  onRecall,
  onCopy,
  onReact,
}: MessageActionsProps) {
  return (
    <div className="flex items-center gap-1">
      {message.type === MessageType.TEXT && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onReplyClick?.(message)}
        >
          <Reply size={16} />
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <SmilePlus size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="flex gap-1 p-2">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="rounded-md p-1 text-lg transition hover:scale-125 hover:bg-muted"
              onClick={() => onReact?.(message.id??-1, emoji)}
            >
              {emoji}
            </button>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Ellipsis size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => onRecall?.(message.id??-1)}>
              Thu hồi
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDeleteForMe?.(message.id??-1)}>
              Xóa phía tôi
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCopy}>Sao chép</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}