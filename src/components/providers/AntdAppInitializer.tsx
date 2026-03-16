import { App } from "antd";
import { useEffect } from "react";
import { setNotificationApi } from "@/lib/antd-notification";

export function AntdAppInitializer() {
  const { notification } = App.useApp();

  useEffect(() => {
    setNotificationApi(notification);
  }, [notification]);

  return null;
}