import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    MessageCircleMore,
    ContactRound,
    Cloud,
    Settings,
    Calendar,
} from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import type { User } from "@/features/user/user.type";
import { useEffect, useRef, useState } from "react";
import { Badge } from 'antd';
import { Separator } from "../ui/separator";


export const SidebarTab = {
    CHAT: "CHAT",
    CONTACT: "CONTACT",
    CLOUD: "CLOUD",
    CALENDAR: "CALENDAR",
    SETTING: "SETTING",
} as const;

export type SidebarTab =
    (typeof SidebarTab)[keyof typeof SidebarTab];

interface Props {
    user: User | null;
    activeTab: SidebarTab;
    skipNotifications: Map<SidebarTab, number>;
    onChangeTab: (tab: SidebarTab) => void;
};

function NavButton({
    active,
    onClick,
    icon,
}: {
    active?: boolean;
    onClick?: () => void;
    icon: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex h-12 w-12 items-center justify-center rounded-xl transition ${active
                ? "bg-white/15 text-white"
                : "text-white/85 hover:bg-white/10"
                }`}
        >
            {icon}
        </button>
    );
}

export default function Sidebar({ activeTab, onChangeTab, user, skipNotifications }: Props) {
    const [openSettingProfile, setOpenSettingProfile] = useState(false);
    const avatarRef = useRef<HTMLDivElement>(null);
    const fallback = user?.displayName?.trim()?.charAt(0)?.toUpperCase() ?? "C";
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (!avatarRef.current) return;

            if (!avatarRef.current.contains(event.target as Node)) {
                setOpenSettingProfile(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    return (
        <div>
            <div className="flex h-full w-[72px] flex-col items-center bg-[#005AE0] py-3">
                <Avatar ref={avatarRef} className="h-12 w-12" onClick={() => setOpenSettingProfile(true)}>
                    <AvatarImage />
                    <AvatarFallback>{fallback}</AvatarFallback>
                </Avatar>


                <div className="mt-5 flex flex-1 flex-col items-center gap-3">
                    <Badge count={skipNotifications.get(SidebarTab.CHAT) || 0} overflowCount={99}>
                        <NavButton
                            active={activeTab === SidebarTab.CHAT}
                            onClick={() => onChangeTab(SidebarTab.CHAT)}
                            icon={<MessageCircleMore className="h-6 w-6" />}
                        />
                    </Badge>

                    <NavButton
                        active={activeTab === SidebarTab.CONTACT}
                        onClick={() => onChangeTab(SidebarTab.CONTACT)}
                        icon={<ContactRound className="h-6 w-6" />}
                    />

                    <NavButton
                        active={activeTab === SidebarTab.CALENDAR}
                        onClick={() => onChangeTab(SidebarTab.CALENDAR)}
                        icon={<Calendar className="h-6 w-6" />}
                    />
                </div>

                <div className="flex flex-col items-center gap-3">
                    <NavButton
                        active={activeTab === SidebarTab.CLOUD}
                        onClick={() => onChangeTab(SidebarTab.CLOUD)}
                        icon={<Cloud className="h-6 w-6" />}
                    />
                    <NavButton
                        active={activeTab === SidebarTab.SETTING}
                        onClick={() => onChangeTab(SidebarTab.SETTING)}
                        icon={<Settings className="h-6 w-6" />}
                    />
                </div>

                {
                    openSettingProfile && (
                        <Card className="absolute top-0 left-[75px] w-[170px] z-10">
                            <CardHeader>
                                <CardTitle>{user?.displayName}</CardTitle>
                                <Separator />
                                <CardDescription>MNV: {user?.userCode}</CardDescription>
                            </CardHeader>
                            {/* <CardContent>
                                <p>Card Content</p>
                            </CardContent>
                            <CardFooter>
                                <p>Card Footer</p>
                            </CardFooter> */}
                        </Card>
                    )
                }
            </div>

        </div>
    );
}