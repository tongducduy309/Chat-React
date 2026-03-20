import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Search, UserRoundCheck, X } from "lucide-react";
import { InputGroup, InputGroupInput, InputGroupAddon } from "../ui/input-group";
import { Button } from "../ui/button";
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from "../ui/item";
import { AvatarImage, AvatarFallback, Avatar } from "../ui/avatar";
import type { Friendship, UserSearchRes } from "@/features/friendship/friendship.type";
import { acceptFriendRequest, cancelFriendRequest, getUserByPhoneOrUserCode, sendFriendRequest } from "@/features/friendship/friendship.api";
import { Notify } from "@/lib/notify";
import { useConfirmDialog } from "@/hook/useConfirmDialog";
import type { ResponseObject } from "@/lib/ResponseObject";
interface ContactsListProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: number;
    onOpenChat: (targetUserId: number) => void;
}



export default function ContactsList({ open, onOpenChange, userId, onOpenChat }: ContactsListProps) {
    
    const [searchKeyword, setSearchKeyword] = useState("");
    const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState("");
    const [searchResults, setSearchResults] = useState<UserSearchRes[]>([]);
    const { confirm, ConfirmDialog } = useConfirmDialog();

    const fallback = (value: string) => value?.trim()?.charAt(0)?.toUpperCase() ?? "C";

    const handleSendFriendRequest = async (userId: number) => {
        try {
            await sendFriendRequest(userId).then((res:ResponseObject<Friendship>)=>{
                Notify.success({ title: "Thành công", description: "Đã gửi yêu cầu kết bạn." });
                setSearchResults(
                    searchResults.map((item:UserSearchRes) =>
                        item.id === userId ? { ...item, status: "PENDING", requestedById: res.data.requestedBy.id } : item
                    )
                );
            });
            
        } catch (err:any) {Notify.error({ title: "Thất bại", description: err.message??"Lỗi không xác định" });
        }
    };

    const handleCancelFriendRequest = async (userId: number) => {
        console.log(userId)
        const ok = await confirm({
            title: "Hủy yêu cầu kết bạn",
            description: "Bạn có chắc chắn muốn hủy yêu cầu kết bạn này không?",
            confirmText: "Hủy yêu cầu",
            cancelText: "Quay lại",
            confirmVariant: "destructiveSoft"
        });
        if (!ok) return;
        try {
            await cancelFriendRequest(userId).then(()=>{Notify.success({ title: "Thành công", description: "Đã hủy yêu cầu kết bạn." });});
            setSearchResults(
                searchResults.map((item:UserSearchRes) =>
                    item.id === userId ? { ...item, status: "NONE" } : item
                )
            );
        } catch (err:any) {Notify.error({ title: "Thất bại", description: err.message??"Lỗi không xác định" });
        }

    };
    
    const handleAcceptFriendRequest = async (userId: number) => {
        try {
            await acceptFriendRequest(userId).then(()=>{Notify.success({ title: "Thành công", description: "Đã chấp nhận yêu cầu kết bạn." });});
            setSearchResults(
                searchResults.map((item:UserSearchRes) =>
                    item.id === userId ? { ...item, status: "ACCEPTED" } : item
                )
            );
        } catch (err:any) {Notify.error({ title: "Thất bại", description: err.message??"Lỗi không xác định" });
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchKeyword(searchKeyword);
        }, 400);

        return () => clearTimeout(timer);
    }, [searchKeyword]);

    useEffect(() => {
        let mounted = true;

        const doSearch = async () => {
            const keyword = debouncedSearchKeyword.trim().toLowerCase();
            if (!keyword) {
                if (mounted) setSearchResults([]);
                return;
            }

            try {
                const res = (await getUserByPhoneOrUserCode(keyword)) as unknown as UserSearchRes[];

                if (mounted) {
                    setSearchResults(res);
                }
            } catch (err) {
                console.error("Error searching conversations:", err);
                if (mounted) setSearchResults([]);
            }
        };

        doSearch();

        return () => {
            mounted = false;
        };
    }, [debouncedSearchKeyword]);
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tìm kiếm bạn bè</DialogTitle>
                </DialogHeader>
                <InputGroup>
                    <InputGroupInput placeholder="Tìm bằng mã NV hoặc số điện thoại..."
                        value={searchKeyword} onChange={(e) => {
                            const value = e.target.value;
                            setSearchKeyword(value);
                        }}
                    />
                    <InputGroupAddon align="inline-start">
                        <Search />
                    </InputGroupAddon>
                    {
                        searchKeyword.length > 0 && (
                            <InputGroupAddon align="inline-end" onClick={() => setSearchKeyword("")}>
                                <Button variant="ghost" size="icon">
                                    <X />
                                </Button>
                            </InputGroupAddon>
                        )
                    }
                </InputGroup>

                {
                    (searchKeyword.length > 0 && searchResults.length === 0) && (
                        <div className="px-4 py-6 text-sm text-slate-500 text-center">
                            Không tìm thấy người dùng phù hợp.
                        </div>
                    )
                }
                {searchResults.map((item: UserSearchRes) => {

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

                                </ItemContent>

                                <ItemActions>
                                    {
                                        item.status === "NONE" && (
                                            <Button onClick={() => handleSendFriendRequest(item.id)} variant="outline" size="sm" className="border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-500">
                                                Kết bạn
                                            </Button>
                                        )
                                    }
                                    {
                                        (item.status === "PENDING" && item.requestedById == userId) && (
                                            <Button onClick={() => handleCancelFriendRequest(item.id)} variant="outline" size="sm" className="border-gray-500 text-gray-500 hover:bg-gray-50 hover:text-gray-500">
                                                Đã yêu cầu
                                            </Button>
                                        )
                                    }
                                    {
                                        (item.status === "PENDING" && item.requestedById !== userId) && (
                                            <Button onClick={() => handleAcceptFriendRequest(item.id)} variant="outline" size="sm" className="border-green-500 text-green-500 hover:bg-green-50 hover:text-green-500">
                                                Chấp nhận
                                            </Button>
                                        )
                                    }
                                    {
                                        item.status === "ACCEPTED" && (
                                            <Button disabled variant="outline" size="sm" className="border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-500">
                                                <UserRoundCheck /> Bạn bè
                                            </Button>
                                        )
                                    }
                                    {
                                        item.status === "BLOCKED" && (
                                            <Button variant="outline" size="sm" className="border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-500">
                                                Đã chặn
                                            </Button>
                                        )
                                    }
                                    <Button variant="outline" size="sm" onClick={() => onOpenChat(item.id)}>
                                        Nhắn tin
                                    </Button>
                                </ItemActions>
                            </Item>
                        </div>
                    );
                })}

            </DialogContent>
            <ConfirmDialog />
        </Dialog>
    );
}
