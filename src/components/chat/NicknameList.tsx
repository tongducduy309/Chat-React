import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
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
import { Notify } from "@/lib/notify";

type NicknameItem = {
    id: number;
    nickname: string;
    displayName?: string;
    avatarUrl?: string;
    conversationId?: number;
};

type NicknameListProps = {
    items: NicknameItem[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function NicknameList({
    items,
    open,
    onOpenChange,
}: NicknameListProps) {
    const [editingId, setEditingId] = useState<number | string | null>(null);
    const [nicknameValue, setNicknameValue] = useState("");

    const handleStartEdit = (item: NicknameItem) => {
        setEditingId(item.id);
        setNicknameValue(item.nickname ?? "");
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setNicknameValue("");
    };

    const handleSubmitEdit = async (item: NicknameItem) => {
        const value = nicknameValue.trim();
        if (!value) return;
        item.nickname = value; 
        setEditingId(null);
        setNicknameValue("");

        await updateNickname(item.conversationId ?? -1, item.id, value).then(() => {
            Notify.info({ title: "Cập nhật thành công", description: "Biệt danh đã được cập nhật." });
        }).catch((e) => {
            Notify.error({ title: "Cập nhật thất bại", description: e });
        });
    };

    const fallback = (title: string) => {
        return title?.trim()?.charAt(0)?.toUpperCase() ?? "C";
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Danh sách biệt danh</DialogTitle>
                    <DialogDescription>
                        Chọn một biệt danh để xem hoặc chỉnh sửa.
                    </DialogDescription>
                </DialogHeader>

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

                                            <ItemTitle>{item.displayName}</ItemTitle>
                                            <ItemDescription>{item.nickname}</ItemDescription>
                                        </ItemContent>

                                        <ItemActions>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleStartEdit(item)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </ItemActions>
                                    </Item>

                                    <div
                                        className={`grid transition-all duration-300 ease-in-out ${isEditing
                                                ? "grid-rows-[1fr] opacity-100"
                                                : "grid-rows-[0fr] opacity-0"
                                            }`}
                                    >
                                        <div className="overflow-hidden">
                                            <div className="border-t px-3 pb-3 pt-2">
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        value={nicknameValue}
                                                        onChange={(e) => setNicknameValue(e.target.value)}
                                                        placeholder="Nhập biệt danh mới"
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                handleSubmitEdit(item);
                                                            }
                                                        }}
                                                    />

                                                    <Button
                                                        size="icon"
                                                        onClick={() => handleSubmitEdit(item)}
                                                        disabled={!nicknameValue.trim()}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        onClick={handleCancelEdit}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}