import { useState } from "react";
import { Pencil, Check, X, UserRoundPlus, UserMinus, UserRoundKey, BadgeX, LogOut, PenLine, Search, Trash2, UserRoundPen, UsersRound } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from "../ui/item";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { updateNickname } from "@/features/chat/chat.api";
import { useConfirmDialog } from "@/hook/useConfirmDialog";
import { MemberRole, MemberRoleLabel } from "@/features/chat/chat.types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";


type MemberItem = {
    id: number;
    displayName?: string;
    avatarUrl?: string;
    role?: MemberRole;
    addByDisplayName?: string;
};

type MembersListProps = {
    items: MemberItem[];
    open: boolean;
    role?: MemberRole;
    onOpenChange: (open: boolean) => void;
    selectedId?: number | string;
    conversationId?: number;
    creatorId?: number;
    userId?: number;
    onSelect?: (item: MemberItem) => void;
};

export default function MembersList({
    items,
    open,
    role,
    conversationId,
    userId,
    creatorId,
    onOpenChange,
}: MembersListProps) {
    const [editingId, setEditingId] = useState<number | string | null>(null);
    const [nicknameValue, setNicknameValue] = useState("");

    const { confirm, ConfirmDialog } = useConfirmDialog();

    const handleStartEdit = (item: MemberItem) => {
        setEditingId(item.id);
        // setNicknameValue(item.nickname ?? "");
    };

    const handleDelete = async () => {
        const ok = await confirm({
            title: "Xóa người dùng",
            description: "Bạn có chắc chắn muốn xóa người dùng này khỏi cuộc trò chuyện không?",
            confirmText: "Xóa",
            cancelText: "Hủy",
            confirmVariant: "destructiveSoft",
            icon: <UserMinus />,
            mediaClassName: "bg-destructive/10 text-destructive"
        });

        if (!ok) return;

        console.log("Đã xác nhận xóa");
    };

    const handleEditRole = async (role: MemberRole) => {
        const ok = await confirm({
            title: "Chỉnh sửa vai trò",
            description: `Bạn có chắc chắn muốn chỉnh sửa vai trò của người dùng này thành ${MemberRoleLabel[role]} không?`,
            confirmText: "Chỉnh sửa",
            cancelText: "Hủy",
        });

        if (!ok) return;

        console.log("Đã xác nhận chỉnh sửa vai trò");
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setNicknameValue("");
    };

    const handleSubmitEdit = async (item: MemberItem) => {
        const value = nicknameValue.trim();
        if (!value) return;
        // item.nickname = value; 
        setEditingId(null);
        setNicknameValue("");

        await updateNickname(conversationId ?? -1, item.id, value);
    };

    const fallback = (title: string) => {
        return title?.trim()?.charAt(0)?.toUpperCase() ?? "C";
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Thành viên nhóm</DialogTitle>
                    </DialogHeader>
                    <Button>
                        <UserRoundPlus />Thêm thành viên
                    </Button>

                    <div className="overflow-hidden bg-white">
                        <div className="flex max-h-[360px] flex-col gap-2 overflow-y-auto">
                            {items.map((item) => {
                                const isEditing = editingId === item.id;

                                return (
                                    <div
                                        key={item.id}
                                        className="rounded-xl border border-border bg-background"
                                    >
                                        <Item className="border-0">
                                            <ItemMedia>
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={item?.avatarUrl ?? undefined} />
                                                    <AvatarFallback>{fallback(item.displayName ?? "")}</AvatarFallback>
                                                </Avatar>
                                            </ItemMedia>
                                            <ItemContent>

                                                <ItemTitle>{item.displayName} {item.role && (<span className="text-muted-foreground">({MemberRoleLabel[item.role]})</span>)}</ItemTitle>
                                                {
                                                    creatorId !== item.id ? (<ItemDescription>Thêm bởi {item.addByDisplayName}</ItemDescription>) : (<ItemDescription>Người tạo nhóm</ItemDescription>)
                                                }
                                            </ItemContent>

                                            {
                                                ((role === MemberRole.ADMIN || role === MemberRole.LEADER)&&userId !== item.id) && (
                                                    <ItemActions>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    
                                                                    title="Chỉnh sửa vai trò"
                                                                >
                                                                    <UserRoundKey />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent side="bottom" align="start">
                                                                <DropdownMenuGroup>
                                                                    {
                                                                        role === MemberRole.LEADER && (<DropdownMenuItem title="Trưởng nhóm" onClick={() => handleEditRole(MemberRole.LEADER)}>Trưởng nhóm</DropdownMenuItem>)
                                                                    }
                                                                    <DropdownMenuItem title="Quản trị viên" onClick={() => handleEditRole(MemberRole.ADMIN)}>Quản trị viên</DropdownMenuItem>
                                                                    <DropdownMenuItem title="Thành viên" onClick={() => handleEditRole(MemberRole.MEMBER)}>Thành viên</DropdownMenuItem>
                                                                </DropdownMenuGroup>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>

                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={handleDelete}
                                                            title="Xóa thành viên"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </ItemActions>
                                                )
                                            }
                                        </Item>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <ConfirmDialog />
        </>
    );
}