import type { NotificationInstance } from "antd/es/notification/interface";

let notificationApi: NotificationInstance | null = null;

export function setNotificationApi(api: NotificationInstance) {
  notificationApi = api;
}

type NotifyArgs = {
  message: string;
  description?: string;
};

export const notify = {
  success: ({ message, description }: NotifyArgs) => {
    notificationApi?.success({ message, description });
  },

  info: ({ message, description }: NotifyArgs) => {
    notificationApi?.info({ message, description });
  },

  warning: ({ message, description }: NotifyArgs) => {
    notificationApi?.warning({ message, description });
  },

  error: ({ message, description }: NotifyArgs) => {
    notificationApi?.error({ message, description });
  },
};