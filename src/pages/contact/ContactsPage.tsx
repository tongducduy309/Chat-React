import { useEffect, useMemo, useState } from "react";
import {
  Search,
  UserRound,
  Users,
  UserPlus,
  Ellipsis,
  ArrowUpDown,
  Filter,
  Earth,
  UserCheck,
  UserRoundX,
  MessageCircleMore,
  CircleUser,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ContactItemRes } from "@/features/friendship/friendship.type";
import { getContacts, unfriend } from "@/features/friendship/friendship.api";
import { useNavigate } from "react-router-dom";
import { App } from "antd";
import { useConfirmDialog } from "@/hook/useConfirmDialog";



type MenuKey = "friends" | "groups" | "friend-requests" | "group-invites";
type SortKey = "az" | "za";
type FilterKey = "all" | "online";

function getFallback(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

function normalizeText(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getGroupLetter(name: string) {
  const normalized = normalizeText(name).trim();
  const first = normalized.charAt(0).toUpperCase();
  return /[A-Z]/.test(first) ? first : "#";
}

function ContactMenuItem({
  active,
  icon,
  label,
  onClick,
}: {
  active?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition",
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-700 hover:bg-slate-100",
      ].join(" ")}
    >
      <span className="text-current">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

function ContactRow({ item, onDelete }: { item: ContactItemRes, onDelete?: () => void }) {
  const navigate = useNavigate();
  const {notification} = App.useApp();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const handleDeleteFriend = async () => {
    const ok = await confirm({
      title: "Xóa bạn bè",
      description: "Bạn có chắc chắn muốn xóa bạn bè này?",
      confirmText: "Xóa",
      cancelText: "Quay lại",
      confirmVariant: "destructiveSoft"
    });
    if (!ok) return

    await unfriend(item.id).then(() => {
      notification.success({title: "Xóa bạn bè thành công"});
      onDelete?.();
    }).catch(() => {
      notification.error({title: "Xóa bạn bè thất bại"});
    })
  }
  return (
    <div className="group flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-slate-100">
      <div className="relative">
        <Avatar className="h-11 w-11">
          <AvatarImage src={item.avatarUrl ?? undefined} />
          <AvatarFallback>{getFallback(item.displayName)}</AvatarFallback>
        </Avatar>
        
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate font-medium text-slate-800">
          {item.displayName}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 transition group-hover:opacity-100"
          >
            <Ellipsis className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigate(`/chat?userId=${item.id}`)}><MessageCircleMore /> Nhắn tin</DropdownMenuItem>
          <DropdownMenuItem><CircleUser />Xem hồ sơ</DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={handleDeleteFriend}> <UserRoundX /> Xóa bạn</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog />
    </div>
  );
}

export const ContactsPage = () => {
  const [activeMenu, setActiveMenu] = useState<MenuKey>("friends");
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("az");
  const [filterBy, setFilterBy] = useState<FilterKey>("all");
  const [friends, setFriends] = useState<ContactItemRes[]>([]);

  const groupedFriends = useMemo(() => {
    let data = [...friends];

    if (keyword.trim()) {
      const kw = normalizeText(keyword.trim());
      data = data.filter((item) =>
        normalizeText(item.displayName).includes(kw)
      );
    }

    // if (filterBy === "online") {
    //   data = data.filter((item) => item.online);
    // }

    data.sort((a, b) => {
      const cmp = a.displayName.localeCompare(b.displayName, "vi");
      return sortBy === "az" ? cmp : -cmp;
    });

    const groups = new Map<string, ContactItemRes[]>();

    for (const item of data) {
      const letter = getGroupLetter(item.displayName);
      const arr = groups.get(letter) ?? [];
      arr.push(item);
      groups.set(letter, arr);
    }

    return Array.from(groups.entries()).sort(([a], [b]) =>
      a.localeCompare(b, "en")
    );
  }, [keyword, sortBy, filterBy, friends]);

  useEffect(() => {
    const fetchFriends = async () => {
      const res = await getContacts();
      setFriends(res);
    };
    fetchFriends();
  }, []);

  return (
    <div className="h-full bg-[#f3f5f7]">
      <div className="grid h-full grid-cols-[300px_minmax(0,1fr)]">
        <div className="border-r bg-white">
          <div className="border-b p-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm kiếm"
                  className="border-slate-200 bg-slate-50 pl-9"
                />
              </div>

              <Button variant="ghost" size="icon" title="Thêm bạn">
                <UserPlus className="h-5 w-5 text-slate-600" />
              </Button>

              <Button variant="ghost" size="icon" title="Tạo nhóm">
                <Users className="h-5 w-5 text-slate-600" />
              </Button>
            </div>
          </div>

          <div className="space-y-1 p-2">
            <ContactMenuItem
              active={activeMenu === "friends"}
              icon={<UserRound className="h-5 w-5" />}
              label="Danh sách bạn bè"
              onClick={() => setActiveMenu("friends")}
            />

            <ContactMenuItem
              active={activeMenu === "groups"}
              icon={<Users className="h-5 w-5" />}
              label="Danh sách nhóm và cộng đồng"
              onClick={() => setActiveMenu("groups")}
            />

            <ContactMenuItem
              active={activeMenu === "friend-requests"}
              icon={<UserPlus className="h-5 w-5" />}
              label="Lời mời kết bạn"
              onClick={() => setActiveMenu("friend-requests")}
            />

            <ContactMenuItem
              active={activeMenu === "group-invites"}
              icon={<UserCheck className="h-5 w-5" />}
              label="Lời mời vào nhóm và cộng đồng"
              onClick={() => setActiveMenu("group-invites")}
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="border-b bg-white px-6 py-4">
            <div className="flex items-center gap-3">
              <UserRound className="h-5 w-5 text-slate-700" />
              <h1 className="text-lg font-semibold text-slate-800">
                Danh sách bạn bè
              </h1>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-4">
            <Card className="border-none shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-800">
                  Bạn bè ({friends.length})
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-[minmax(0,1fr)_300px_220px] gap-3">
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="Tìm bạn"
                      className="pl-9"
                    />
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-between text-slate-700"
                      >
                        <span className="flex items-center gap-2">
                          <ArrowUpDown className="h-4 w-4" />
                          {sortBy === "az" ? "Tên (A-Z)" : "Tên (Z-A)"}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => setSortBy("az")}>
                        Tên (A-Z)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("za")}>
                        Tên (Z-A)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-between text-slate-700"
                      >
                        <span className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          {filterBy === "all" ? "Tất cả" : "Đang hoạt động"}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => setFilterBy("all")}>
                        Tất cả
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterBy("online")}>
                        Đang hoạt động
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-5">
                  {groupedFriends.length === 0 ? (
                    <div className="rounded-xl border border-dashed bg-white px-4 py-10 text-center text-sm text-slate-500">
                      Không tìm thấy bạn bè phù hợp.
                    </div>
                  ) : (
                    groupedFriends.map(([letter, items]) => (
                      <div key={letter} className="space-y-2">
                        <div className="px-2 text-lg font-semibold text-slate-700">
                          {letter}
                        </div>

                        <div className="space-y-1">
                          {items.map((item) => (
                            <ContactRow key={item.id} item={item} onDelete={() => setFriends(friends.filter((i) => i.id !== item.id))} />
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};