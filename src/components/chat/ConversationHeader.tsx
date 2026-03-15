import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, Video, Search, EllipsisVertical, UserRoundPen, UsersRound, LogOut, Trash2, BadgeX, PenLine, Trash } from "lucide-react";

import { MemberRole, type ConversationType} from "@/features/chat/chat.types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useConfirmDialog } from "@/hook/useConfirmDialog";

type Props = {
  title: string;
  type?: ConversationType;
  avatarUrl?: string | null;
  subtitle?: string;
  role?: MemberRole;
  onCall?: () => void;
  onVideoCall?: () => void;
  onOpenSearch?: () => void;
  onOpenNickname?: () => void;
  onOpenMembers?: () => void;
  onOpenTitleAvatar?: () => void;
};

export default function ConversationHeader({
  title,
  avatarUrl,
  subtitle,
  type,
  role,
  onCall,
  onVideoCall,
  onOpenSearch,
  onOpenNickname,
  onOpenMembers,
  onOpenTitleAvatar
}: Props) {
  const fallback = title?.trim()?.charAt(0)?.toUpperCase() ?? "C";
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const handleDeleteConversation = async () => {
        const ok = await confirm({
            title: "Xóa cuộc trò chuyện",
            description: "Bạn có chắc chắn muốn xóa cuộc trò chuyện này không?",
            confirmText: "Xóa",
            cancelText: "Hủy",
            confirmVariant: "destructiveSoft",
            icon: <Trash />,
            mediaClassName: "bg-destructive/10 text-destructive"
        });

        if (!ok) return;

        console.log("Đã xác nhận xóa");
    };


  return (
    <div className="border-b bg-white">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl ?? undefined} />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>

          <div className="leading-tight">
            <div className="text-base font-semibold text-slate-900">{title}</div>
            {subtitle ? <div className="text-xs text-slate-500">{subtitle}</div> : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onCall} title="Gọi thoại">
            <Phone className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" onClick={onVideoCall} title="Gọi video">
            <Video className="h-5 w-5" />
          </Button>

          

          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
            variant="ghost"
            size="icon"
            title="Tùy chọn"
          >
            <EllipsisVertical  className="h-5 w-5"/>
          </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              {type === "GROUP" && (
                <DropdownMenuItem title="Tên nhóm, Ảnh đại diện" onClick={onOpenTitleAvatar}><PenLine />Tên nhóm, Ảnh đại diện</DropdownMenuItem>
              )}
              <DropdownMenuItem title="Biệt danh" onClick={onOpenNickname}><UserRoundPen />Biệt danh</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onOpenSearch} title="Tìm trong cuộc trò chuyện"><Search />Tìm kiếm</DropdownMenuItem>
              {type === "GROUP" && (
                <DropdownMenuItem title="Xem danh sách thành viên" onClick={onOpenMembers}><UsersRound />Thành viên</DropdownMenuItem>
              )}
              
              <DropdownMenuItem title="Xóa cuộc trò chuyện" onClick={handleDeleteConversation}><Trash2 />Xóa cuộc trò chuyện</DropdownMenuItem>
              
              {type === "GROUP"&&(<DropdownMenuSeparator />)}
                {(type === "GROUP"&&role===MemberRole.LEADER) && (<DropdownMenuItem title="Giải tán nhóm"><BadgeX />Giải tán nhóm</DropdownMenuItem>)}
              {type === "GROUP" && (
                <DropdownMenuItem title="Rời khỏi nhóm" variant="destructive"><LogOut />Rời khỏi nhóm</DropdownMenuItem>
              )}

            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
              <ConfirmDialog />

      
    </div>
  );
}