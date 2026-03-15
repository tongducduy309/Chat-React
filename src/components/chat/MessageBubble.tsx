import { MessageType, type ConversationMember, type MessageRes } from "@/features/chat/chat.types";
import { Button } from "../ui/button";
import { Ellipsis, Reply } from "lucide-react";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";

interface MessageBubbleProps {
  message: MessageRes;
  userId?: number;
  onReplyClick?: (message: MessageRes) => void;
  onReplyJump?: (replyToId: number) => void;
  onDeleteForMe?: (messageId: number) => void;
  membersReadMessage?: ConversationMember[];
}

export function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const parts = [];

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
  onDeleteForMe
}: MessageBubbleProps) {
  const isMine = message.senderId === userId;

  const [visibleCreatedAt, setVisibleCreatedAt] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <div style={{ marginBottom: 10 }}>

      <div style={{ fontSize: 12, color: "#666" }} className="text-center">
        {visibleCreatedAt&&message.type !== MessageType.SYSTEM && (message.createdAt ?? "")}
        {
          message.type === MessageType.SYSTEM && (
            <div className="text-gray-800">{message.content}</div>

          )
        }
      </div>

      {message.type !== MessageType.SYSTEM && (
        <div className={`flex items-center gap-2 ${isMine ? "justify-end" : "justify-start"}`}>

        <div
          className={`max-w-[60%] rounded-xl border p-2 ${isMine ? "bg-blue-100 text-gray-700" : "bg-muted"
            }`} onDoubleClick={() => setVisibleCreatedAt((prev) => !prev)}
        >
          {message.replyTo && (
            <div className="mb-1 border-l-2 border-gray-400 pl-2 text-xs opacity-80 cursor-pointer" onClick={() => onReplyJump?.(message.replyTo?.id ?? 0)}>
              <div className="font-medium">
                {message.replyTo?.senderId === userId ? "Bạn" : message.replyTo?.senderNickname}
              </div>
              <div className="line-clamp-2">
                {message.replyTo?.content}
              </div>
            </div>
          )}

          {(message.type === MessageType.CALL_VOICE || message.type === MessageType.CALL_VIDEO) && (
            <div className="max-w-[220px] rounded-lg p-3 text-sm">
              <div className="font-medium text-gray-800">
                {
                (Number(message.content)==0) ? "Cuộc gọi nhỡ" : (message.type === MessageType.CALL_VOICE ? "Cuộc gọi thoại" : "Cuộc gọi video")
                }
              </div>

              <div className="flex items-center gap-2 text-gray-600 mt-1">
                <span className="text-green-600 text-lg">📞</span>
                <span>{formatDuration(Number(message.content))}</span>
              </div>

              <div className="border-t border-gray-300 mt-2 pt-2 text-center">
                <button
                  className="text-blue-600 font-medium hover:underline"
                  onClick={() => {
                    // gọi lại
                    console.log("call again");
                  }}
                >
                  Gọi lại
                </button>
              </div>
            </div>
          )}
          {
            message.type === MessageType.TEXT && (
              <div className="text-gray-800 break-all whitespace-pre-wrap">{message.content}</div>

            )
          }



        </div>


        {
          message.type == MessageType.TEXT && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onReplyClick?.(message)}
            >
              <Reply size={16} />
            </Button>
          )
        }

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onReplyClick?.(message)}
            >
              <Ellipsis size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem>Thu hồi</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDeleteForMe?.(message?.id ?? -1)}>Xóa phía tôi</DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopy}>Sao chép</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>



      </div>
        )}

      <div className={`text-[10px] ${isMine ? "text-end" : "text-start"}`}>
        {membersReadMessage?.filter((member) => member.id !== message.senderId).map((member) => member.nickname).join(", ")}
      </div>

    </div>
  );
}