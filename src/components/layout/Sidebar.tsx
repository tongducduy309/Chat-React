import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageCircleMore,
  ContactRound,
  Cloud,
  Settings,
  Calendar,
  Building2,
  Mail,
  BadgeCheck,
  BriefcaseBusiness,
  IdCard,
  User,
  KeyRound,
  LogOut,
  Cog,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import type { User as UserType } from "@/features/user/user.type";
import { useEffect, useRef, useState } from "react";
import { Badge } from "antd";
import { Separator } from "../ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const SidebarTab = {
  CHAT: "CHAT",
  CONTACT: "CONTACT",
  CLOUD: "CLOUD",
  CALENDAR: "CALENDAR",
  SETTING: "SETTING",
  DIRECTORY: "DIRECTORY",
} as const;

export type SidebarTab = (typeof SidebarTab)[keyof typeof SidebarTab];

interface Props {
  user: UserType | null;
  activeTab: SidebarTab;
  skipNotifications: Map<SidebarTab, number>;
  onChangeTab: (tab: SidebarTab) => void;
  activeUser: boolean;
  onOpenProfile?: () => void;
  onOpenAccountSettings?: () => void;
  onChangePassword?: () => void;
  onLogout?: () => void;
}

function NavButton({
  active,
  onClick,
  icon,
  title,
}: {
  active?: boolean;
  onClick?: () => void;
  icon: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`flex h-12 w-12 items-center justify-center rounded-xl transition ${
        active
          ? "bg-white/15 text-white"
          : "text-white/85 hover:bg-white/10"
      }`}
    >
      {icon}
    </button>
  );
}

function ProfileInfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-muted/50">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-medium text-foreground">
          {value || "Chưa cập nhật"}
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({
  activeTab,
  onChangeTab,
  user,
  skipNotifications,
  activeUser,
  onOpenProfile,
  onOpenAccountSettings,
  onChangePassword,
  onLogout,
}: Props) {
  const [openSettingProfile, setOpenSettingProfile] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const fallback = user?.displayName?.trim()?.charAt(0)?.toUpperCase() ?? "C";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        avatarRef.current?.contains(target) ||
        cardRef.current?.contains(target)
      ) {
        return;
      }

      setOpenSettingProfile(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("current_user");
    onLogout?.();
    window.location.href = "/login";
  };

  return (
    <div className="relative">
      <div className="flex h-full w-[72px] flex-col items-center bg-[#005AE0] py-3">
        <div ref={avatarRef} className="relative inline-block">
          <Avatar
            className="h-12 w-12 cursor-pointer overflow-visible"
            onClick={() => setOpenSettingProfile((prev) => !prev)}
          >
            <AvatarImage src={user?.avatarUrl} />
            <AvatarFallback>{fallback}</AvatarFallback>
            <AvatarBadge
              className={
                activeUser
                  ? "bg-green-600 dark:bg-green-800"
                  : "bg-gray-400 dark:bg-gray-300"
              }
            />
          </Avatar>
        </div>

        <div className="mt-5 flex flex-1 flex-col items-center gap-3">
          <Badge
            count={skipNotifications.get(SidebarTab.CHAT) || 0}
            overflowCount={99}
          >
            <NavButton
              title="Tin nhắn"
              active={activeTab === SidebarTab.CHAT}
              onClick={() => onChangeTab(SidebarTab.CHAT)}
              icon={<MessageCircleMore className="h-6 w-6" />}
            />
          </Badge>

          <NavButton
            title="Danh bạ"
            active={activeTab === SidebarTab.CONTACT}
            onClick={() => onChangeTab(SidebarTab.CONTACT)}
            icon={<ContactRound className="h-6 w-6" />}
          />

          <NavButton
            title="Lịch và sự kiện"
            active={activeTab === SidebarTab.CALENDAR}
            onClick={() => onChangeTab(SidebarTab.CALENDAR)}
            icon={<Calendar className="h-6 w-6" />}
          />

          <NavButton
            title="Phòng ban"
            active={activeTab === SidebarTab.DIRECTORY}
            onClick={() => onChangeTab(SidebarTab.DIRECTORY)}
            icon={<Building2 className="h-6 w-6" />}
          />
        </div>

        <div className="flex flex-col items-center gap-3">
          <NavButton
            active={activeTab === SidebarTab.CLOUD}
            onClick={() => onChangeTab(SidebarTab.CLOUD)}
            icon={<Cloud className="h-6 w-6" />}
            title="Cloud"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div>
                <NavButton
                  active={activeTab === SidebarTab.SETTING}
                  onClick={() => {}}
                  icon={<Settings className="h-6 w-6" />}
                  title="Cài đặt"
                />
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side="right"
              align="end"
              className="ml-3 w-56 rounded-xl"
            >
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => {
                    setOpenSettingProfile(true);
                    onOpenProfile?.();
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  Hồ sơ cá nhân
                </DropdownMenuItem>

                <DropdownMenuItem onClick={onOpenAccountSettings}>
                  <Cog className="mr-2 h-4 w-4" />
                  Cài đặt tài khoản
                </DropdownMenuItem>

                <DropdownMenuItem onClick={onChangePassword}>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Đổi mật khẩu
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4 text-red-600" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {openSettingProfile && (
        <div ref={cardRef} className="absolute top-2 left-[84px] z-20">
          <Card className="w-[320px] rounded-2xl border pt-0 shadow-xl">
            <CardContent className="p-0">
              <div className="rounded-t-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-5 text-white">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16 border-2 border-white/60">
                      <AvatarImage src={user?.avatarUrl} />
                      <AvatarFallback className="text-lg">
                        {fallback}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`absolute right-0 bottom-0 h-4 w-4 rounded-full border-2 border-white ${
                        activeUser ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 truncate text-lg font-semibold">
                      {user?.displayName || "Chưa có tên"}

                      {user?.verified ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex cursor-pointer items-center gap-1 rounded-full bg-white/10 px-2 py-1">
                                <BadgeCheck className="h-4 w-4 text-white" />
                                <p className="text-sm text-white">Đã xác minh</p>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              Đã định danh khuôn mặt
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex cursor-pointer items-center gap-1 rounded-full bg-white/10 px-2 py-1">
                                <p className="text-sm text-white">
                                  Chưa xác thực
                                </p>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              Chưa định danh khuôn mặt
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>

                    <div className="mt-1 text-sm text-white/85">
                      {activeUser ? "Đang hoạt động" : "Không hoạt động"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="mb-3 text-sm font-semibold text-foreground">
                  Thông tin cá nhân
                </div>

                <div className="space-y-1">
                  <ProfileInfoRow
                    icon={<IdCard className="h-4 w-4" />}
                    label="Mã nhân viên"
                    value={user?.userCode}
                  />

                  <ProfileInfoRow
                    icon={<Mail className="h-4 w-4" />}
                    label="Email"
                    value={user?.email}
                  />

                  <ProfileInfoRow
                    icon={<Building2 className="h-4 w-4" />}
                    label="Phòng ban"
                    value={user?.departmentName}
                  />

                  <ProfileInfoRow
                    icon={<BriefcaseBusiness className="h-4 w-4" />}
                    label="Chức vụ"
                    value={user?.positionName}
                  />

                  <ProfileInfoRow
                    icon={<BadgeCheck className="h-4 w-4" />}
                    label="Trạng thái"
                    value={activeUser ? "Online" : "Offline"}
                  />
                </div>

                <Separator className="my-4" />

                <div className="text-xs leading-5 text-muted-foreground">
                  Thông tin này dùng để nhận diện tài khoản và hiển thị trong hệ
                  thống trò chuyện nội bộ.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}