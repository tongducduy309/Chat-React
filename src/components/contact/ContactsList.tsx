import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Search, UserRoundKey, X } from "lucide-react";
import { InputGroup, InputGroupInput, InputGroupAddon } from "../ui/input-group";
import { Button } from "../ui/button";
import { getUserByPhoneOrUserCode } from "@/features/user/user.api";
import type { User } from "@/features/user/user.type";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "../ui/item";
import { MemberRoleLabel, MemberRole } from "@/features/chat/chat.types";
import { AvatarImage, AvatarFallback, Avatar } from "../ui/avatar";
import type { DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem } from "../ui/dropdown-menu";

interface ContactsListProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ContactsList({ open, onOpenChange }: ContactsListProps) {
    const [searchKeyword, setSearchKeyword] = useState("");
    const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState("");
    const [searchResults, setSearchResults] = useState<User[]>([]);

    const fallback = (value: string) => value?.trim()?.charAt(0)?.toUpperCase() ?? "C";

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
                const res = (await getUserByPhoneOrUserCode(keyword)) as unknown as User[];

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
                    <DialogTitle>Thêm bạn mới</DialogTitle>
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
                {searchResults.map((item: User) => {

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
                                    <Button variant="outline" size="sm" className="border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-500">
                                        Kết bạn
                                    </Button>
                                </ItemActions>
                            </Item>
                        </div>
                    );
                })}
            </DialogContent>
        </Dialog>
    );
}
