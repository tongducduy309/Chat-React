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
import { updateNickname, updateTitle } from "@/features/chat/chat.api";
import { Notify } from "@/lib/notify";

type TitleAvatarItem = {
    title: string;
    avatarUrl?: string;
    conversationId?: number;
};

type TitleAvatarListProps = {
    item: TitleAvatarItem;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function TitleAvatarList({
    item,
    open,
    onOpenChange,
}: TitleAvatarListProps) {
    const [editing, setEditing] = useState<boolean>(false);
    const [titleValue, setTitleValue] = useState("");

    const handleStartEdit = (item: TitleAvatarItem) => {
        setEditing(true);
        setTitleValue(item.title ?? "");
    };

    const handleCancelEdit = () => {
        setEditing(false);
        setTitleValue("");
    };

    const handleSubmitEditTitle = async () => {
        const value = titleValue.trim();
        if (!value) return;
        item.title = value;
        setEditing(false);
        setTitleValue("");

        await updateTitle(item.conversationId ?? -1, value).then(() => {
            Notify.info({ title: "Cập nhật thành công", description: "Tên nhóm đã được cập nhật." });
        }).catch((e) => {
            Notify.error({ title: "Cập nhật thất bại", description: e });
        });

        // await updateNickname(item.conversationId ?? -1, item.id, value);
    };

    const fallback = (title: string) => {
        return title?.trim()?.charAt(0)?.toUpperCase() ?? "C";
    }


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa thông tin</DialogTitle>
                    <DialogDescription>
                        Chọn mục để xem hoặc chỉnh sửa.
                    </DialogDescription>
                </DialogHeader>

                <div className="overflow-hidden bg-white">
                    <div className="flex max-h-[360px] flex-col gap-2 overflow-y-auto">
                        <div
                            className="rounded-xl bg-background"
                        >
                            <div className="flex flex-col items-center gap-2 p-2">
                                <Avatar className="h-25 w-25">
                                <AvatarImage src={item?.avatarUrl ?? undefined} />
                                <AvatarFallback>{fallback(item.title ?? "")}</AvatarFallback>
                            </Avatar>
                            <div className="flex items-center justify-center w-full gap-2">
                                <div className="text-sm font-medium">{item.title}</div>
                                {
                                    !editing && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleStartEdit(item)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    )
                                }
                            </div>
                            </div>

                            <div
                                className={`grid transition-all duration-300 ease-in-out ${editing
                                    ? "grid-rows-[1fr] opacity-100"
                                    : "grid-rows-[0fr] opacity-0"
                                    }`}
                            >
                                <div className="overflow-hidden">
                                    <div className="border-t px-3 pb-3 pt-2">
                                        <div className="flex items-center gap-2">
                                            <Input
                                                value={titleValue}
                                                onChange={(e) => setTitleValue(e.target.value)}
                                                placeholder="Nhập tiêu đề mới"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        handleSubmitEditTitle();
                                                    }
                                                }}
                                            />

                                            <Button
                                                size="icon"
                                                onClick={handleSubmitEditTitle}
                                                disabled={!titleValue.trim()}
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
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}