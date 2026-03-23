import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, Video, Search, EllipsisVertical, UserRoundPen, UsersRound, LogOut, Trash2, BadgeX, PenLine, Trash, UserPlus, UserCheck, Ban } from "lucide-react";

import { ConversationType, MemberRole } from "@/features/chat/chat.types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useConfirmDialog } from "@/hook/useConfirmDialog";
import { FriendshipStatus, type Friendship } from "@/features/friendship/friendship.type";
import { acceptFriendRequest, blockUser, cancelFriendRequest, rejectFriendRequest, sendFriendRequest, unblockUser } from "@/features/friendship/friendship.api";
import { Notify } from "@/lib/notify";
import type { ResponseObject } from "@/lib/ResponseObject";
import { App } from "antd";
import { isOnline } from "@/features/user/user.api";

type Props = {
  title: string;
  type?: ConversationType;
  avatarUrl?: string | null;
  subtitle?: string;
  role?: MemberRole;
  activeUser?: boolean;
  onCall?: () => void;
  onVideoCall?: () => void;
  onOpenSearch?: () => void;
  onOpenNickname?: () => void;
  onOpenMembers?: () => void;
  onOpenTitleAvatar?: () => void;
  friendshipStatus?: FriendshipStatus;
  targetUserId: number;
  conversationId: number | null;
};

function getFriendshipStatusLabel(status?: FriendshipStatus | null) {
  switch (status) {
    case FriendshipStatus.PENDING:
      return "Đang chờ xử lý";
    case FriendshipStatus.SENT:
      return "Đã gửi lời mời kết bạn";
    case FriendshipStatus.RECEIVED:
      return "Đã nhận lời mời kết bạn";
    case FriendshipStatus.NONE:
      return "Gửi yêu cầu kết bạn tới người này";
    case FriendshipStatus.ACCEPTED:
      return "Đã chấp nhận";
    default:
      return "";
  }
}

function getFriendshipStatusIcon(status?: FriendshipStatus | null): ReactNode {
  switch (status) {
    case FriendshipStatus.SENT:
      return <UserCheck className="w-4 h-4" />;
    case FriendshipStatus.RECEIVED:
      return <UserCheck className="w-4 h-4" />;
    case FriendshipStatus.NONE:
      return <UserPlus className="w-4 h-4" />;
    default:
      return null;
  }
}

interface getFriendshipStatusActionProps {
  status?: FriendshipStatus | null;
  handleSendFriendRequest?: () => void;
  handleAcceptFriendRequest?: () => void;
  handleCancelFriendRequest?: () => void;
  handleRejectFriendRequest?: () => void;
}

function getFriendshipStatusAction({ status, handleSendFriendRequest, handleAcceptFriendRequest, handleCancelFriendRequest, handleRejectFriendRequest }: getFriendshipStatusActionProps): ReactNode {
  switch (status) {
    case FriendshipStatus.SENT:
      return <Button onClick={handleCancelFriendRequest} variant="outline" size="sm" className="border-gray-500 text-gray-500 hover:bg-gray-50 hover:text-gray-500">
        Đã yêu cầu
      </Button>;
    case FriendshipStatus.RECEIVED:
      return <div className="flex items-center gap-2">
        <Button onClick={handleAcceptFriendRequest} variant="outline" size="sm" className="border-green-500 text-green-500 hover:bg-green-50 hover:text-green-500">
          Chấp nhận
        </Button>
        <Button onClick={handleRejectFriendRequest} variant="outline" size="sm" className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-500">
          Từ chối
        </Button>
      </div>;
    case FriendshipStatus.NONE:
      return <Button onClick={handleSendFriendRequest} variant="outline" size="sm" className="border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-500">
        Kết bạn
      </Button>;
    default:
      return null;
  }
}

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
  onOpenTitleAvatar,
  friendshipStatus,
  targetUserId,
  conversationId
}: Props) {
  const fallback = title?.trim()?.charAt(0)?.toUpperCase() ?? "C";
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const { notification } = App.useApp();
  const [currentFriendshipStatus, setCurrentFriendshipStatus] = useState<FriendshipStatus>(friendshipStatus ?? FriendshipStatus.NONE);
  const [activeUser, setActiveUser] = useState<boolean>(false);

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

  const handleSendFriendRequest = async () => {
    try {
      await sendFriendRequest(targetUserId).then((res: ResponseObject<Friendship>) => {
        // notification.success({ title: "Thành công", description: "Đã gửi yêu cầu kết bạn." });
        setCurrentFriendshipStatus(FriendshipStatus.SENT);
      });

    } catch (err: any) {
      notification.error({ title: "Thất bại", description: err.message ?? "Lỗi không xác định" });
    }
  };

  const handleCancelFriendRequest = async () => {
    const ok = await confirm({
      title: "Hủy yêu cầu kết bạn",
      description: "Bạn có chắc chắn muốn hủy yêu cầu kết bạn này không?",
      confirmText: "Hủy yêu cầu",
      cancelText: "Quay lại",
      confirmVariant: "destructiveSoft"
    });
    if (!ok) return;
    try {
      await cancelFriendRequest(targetUserId).then(() => {
        // notification.success({ title: "Thành công", description: "Đã hủy yêu cầu kết bạn." });
        setCurrentFriendshipStatus(FriendshipStatus.NONE);
      });

    } catch (err: any) {
      notification.error({ title: "Thất bại", description: err.message ?? "Lỗi không xác định" });
    }

  };

  const handleAcceptFriendRequest = async () => {
    try {
      await acceptFriendRequest(targetUserId).then(() => {
        // notification.success({ title: "Thành công", description: "Đã chấp nhận yêu cầu kết bạn." });
        setCurrentFriendshipStatus(FriendshipStatus.ACCEPTED);
      });

    } catch (err: any) {
      notification.error({ title: "Thất bại", description: err.message ?? "Lỗi không xác định" });
    }
  };

  const handleRejectFriendRequest = async () => {
    const ok = await confirm({
      title: "Từ chối yêu cầu kết bạn",
      description: "Bạn có chắc chắn muốn từ chối yêu cầu kết bạn này không?",
      confirmText: "Từ chối",
      cancelText: "Quay lại",
      confirmVariant: "destructiveSoft"
    });
    if (!ok) return;
    try {
      await rejectFriendRequest(targetUserId).then(() => {
        // notification.success({ title: "Thành công", description: "Đã từ chối yêu cầu kết bạn." });
        setCurrentFriendshipStatus(FriendshipStatus.NONE);
      });

    } catch (err: any) {
      notification.error({ title: "Thất bại", description: err.message ?? "Lỗi không xác định" });
    }
  };

  const handleBlockUser = async () => {
    const ok = await confirm({
      title: "Chặn người dùng",
      description: "Bạn có chắc chắn muốn chặn người dùng này không?",
      confirmText: "Chặn",
      cancelText: "Quay lại",
      confirmVariant: "destructiveSoft"
    });
    if (!ok) return;
    try {
      await blockUser(targetUserId).then(() => {
        // notification.success({ title: "Thành công", description: "Đã chặn người dùng." });
        setCurrentFriendshipStatus(FriendshipStatus.BLOCKED);
      });

    } catch (err: any) {
      notification.error({ title: "Thất bại", description: err.message ?? "Lỗi không xác định" });
    }
  };

  const isBlocked = useMemo(() => {
    return friendshipStatus === FriendshipStatus.BLOCKED || friendshipStatus === FriendshipStatus.BE_BLOCKED;
  }, [friendshipStatus]);

  useEffect(() => {
    setCurrentFriendshipStatus(friendshipStatus ?? FriendshipStatus.NONE);
  }, [friendshipStatus]);

  useEffect(() => {
    if (type !== ConversationType.DIRECT || currentFriendshipStatus!==FriendshipStatus.ACCEPTED) return;
    const checkActiveUser = async () => {
      const activeUser = await isOnline(targetUserId);
      setActiveUser(activeUser);
    };
    checkActiveUser();
    const interval = setInterval(() => {
      checkActiveUser();
    }, 90000);
  }, [targetUserId, currentFriendshipStatus]);



  return (
    <div className="border-b bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl ?? undefined} />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>

          <div className="leading-tight">
            <div className="text-base font-semibold text-slate-900">{title}</div>

            {type === ConversationType.DIRECT && currentFriendshipStatus===FriendshipStatus.ACCEPTED ? (
              <div className="mt-0.5 flex items-center gap-2 text-xs">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${activeUser ? "bg-green-500" : "bg-slate-400"
                    }`}
                />
                <span className={activeUser ? "text-green-600" : "text-slate-500"}>
                  {activeUser ? "Đang hoạt động" : "Offline"}
                </span>
              </div>
            ) : subtitle ? (
              <div className="text-xs text-slate-500">{subtitle}</div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {
            !isBlocked && (
              <>
                <Button variant="ghost" size="icon" onClick={onCall} title="Gọi thoại">
                  <Phone className="h-5 w-5" />
                </Button>

                <Button variant="ghost" size="icon" onClick={onVideoCall} title="Gọi video">
                  <Video className="h-5 w-5" />
                </Button>
              </>
            )
          }



          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                title="Tùy chọn"
              >
                <EllipsisVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                {type === "GROUP" && (
                  <DropdownMenuItem title="Tên nhóm, Ảnh đại diện" onClick={onOpenTitleAvatar}><PenLine />Tên nhóm, Ảnh đại diện</DropdownMenuItem>
                )}
                {
                  !isBlocked && conversationId && (
                    <DropdownMenuItem title="Biệt danh" onClick={onOpenNickname}><UserRoundPen />Biệt danh</DropdownMenuItem>
                  )
                }
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onOpenSearch} title="Tìm trong cuộc trò chuyện"><Search />Tìm kiếm</DropdownMenuItem>
                {type === "GROUP" && (
                  <DropdownMenuItem title="Xem danh sách thành viên" onClick={onOpenMembers}><UsersRound />Thành viên</DropdownMenuItem>
                )}

                <DropdownMenuItem title="Xóa cuộc trò chuyện" onClick={handleDeleteConversation}><Trash2 />Xóa cuộc trò chuyện</DropdownMenuItem>
                {type === ConversationType.DIRECT && !isBlocked && (
                  <DropdownMenuItem title="Chặn" variant="destructive" onClick={handleBlockUser}><Ban />Chặn</DropdownMenuItem>
                )}

                {type === "GROUP" && (<DropdownMenuSeparator />)}
                {(type === "GROUP" && role === MemberRole.LEADER) && (<DropdownMenuItem title="Giải tán nhóm"><BadgeX />Giải tán nhóm</DropdownMenuItem>)}
                {type === "GROUP" && (
                  <DropdownMenuItem title="Rời khỏi nhóm" variant="destructive"><LogOut />Rời khỏi nhóm</DropdownMenuItem>
                )}

              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {
        type === ConversationType.DIRECT && friendshipStatus !== FriendshipStatus.ACCEPTED && !isBlocked && (
          <div className="px-4 py-1 flex items-center justify-between gap-2 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              {getFriendshipStatusIcon(currentFriendshipStatus)}
              {getFriendshipStatusLabel(currentFriendshipStatus)}
            </div>
            {getFriendshipStatusAction({ status: currentFriendshipStatus, handleSendFriendRequest, handleAcceptFriendRequest, handleCancelFriendRequest, handleRejectFriendRequest })}
          </div>
        )
      }
      <ConfirmDialog />


    </div>
  );
}