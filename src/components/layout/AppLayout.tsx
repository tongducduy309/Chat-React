import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatPage from "../../pages/chat/ChatPage";
import Sidebar from "./Sidebar";
import type { User } from "@/features/user/user.type";
import { getProfile } from "@/features/user/user.api";
import { ContactsPage } from "../../pages/contact/ContactsPage";
import CalendarPage from "../../pages/calendar/CalendarPage";
import { Toaster } from "../ui/sonner";
import { App, notification } from "antd";
import { checkTodayAttendance } from "@/features/attendance/attendance.api";
import AttendanceDialog from "../attendance/AttendanceDialog";
import { Button } from "../ui/button";
import { useAppWs } from "@/features/app/useAppWs";
import { SidebarTab } from "./Sidebar";
import { DirectoryPage } from "@/pages/directory/DirectoryPage";

const TAB_TO_PATH: Record<SidebarTab, string> = {
  CHAT: "/chat",
  CONTACT: "/contact",
  CLOUD: "/cloud",
  CALENDAR: "/calendar",
  SETTING: "/setting",
  DIRECTORY: "/directory",
};

const PATH_TO_TAB: Record<string, SidebarTab> = {
  "/chat": SidebarTab.CHAT,
  "/contact": SidebarTab.CONTACT,
  "/cloud": SidebarTab.CLOUD,
  "/calendar": SidebarTab.CALENDAR,
  "/setting": SidebarTab.SETTING,
  "/directory": SidebarTab.DIRECTORY,
};

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { notification } = App.useApp();

  const [user, setUser] = useState<User>();
  const [openAttendance, setOpenAttendance] = useState(false);

  const activeTab = useMemo<SidebarTab>(() => {
    return PATH_TO_TAB[location.pathname] ?? SidebarTab.CHAT;
  }, [location.pathname]);

  const handleChangeTab = useCallback(
    (tab: SidebarTab) => {
      navigate(TAB_TO_PATH[tab]);
    },
    [navigate]
  );

  const renderPage = () => {
    switch (activeTab) {
      case SidebarTab.CHAT:
        return <ChatPage user={user ?? null} />;
      case SidebarTab.CONTACT:
        return <ContactsPage />;
      case SidebarTab.CALENDAR:
        return <CalendarPage />;
      case SidebarTab.DIRECTORY:
        return <DirectoryPage />;
      default:
        return <ChatPage user={user ?? null} />;
    }
  };

  const attendance = async () => {
    const res = await checkTodayAttendance();
    if (!res.data) {
      notification.warning({
        title: "Điểm danh",
        description: "Bạn chưa điểm danh.",
        duration: 0,
        actions: (
          <Button
            onClick={() => {
              setOpenAttendance(true);
              notification.destroy();
            }}
            className="bg-yellow-500 text-white hover:bg-yellow-300"
          >
            Điểm danh ngay
          </Button>
        ),
      });
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getProfile();
      setUser(user);
    };

    fetchUser();
    attendance();
  }, []);

  const { ready } = useAppWs()

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      <Toaster richColors position="top-right" />

      <Sidebar
        user={user ?? null}
        activeUser={ready}
        activeTab={activeTab}
        onChangeTab={handleChangeTab}
        skipNotifications={new Map()}
      />
      <div className="min-w-0 flex-1 p-2 overflow-auto">{renderPage()}</div>
      <AttendanceDialog
        open={openAttendance}
        onClose={() => setOpenAttendance(false)}
        onSuccess={() => {
          setOpenAttendance(false);
        }}
      />
    </div>
  );
}