import { toast } from "sonner";

type NotifyPayload = {
  title: string;
  description?: string;
  duration?: number;
};

export class Notify {
  static success({ title, description, duration }: NotifyPayload) {
    toast.success(title, {
      description,
      duration: duration ?? 3000,
    });
  }

  static error({ title, description, duration }: NotifyPayload) {
    toast.error(title, {
      description,
      duration: duration ?? 5000,
    });
  }

  static warning({ title, description, duration }: NotifyPayload) {
    toast.warning(title, {
      description,
      duration: duration ?? 4000,
    });
  }

  static info({ title, description, duration }: NotifyPayload) {
    toast(title, {
      description,
      duration: duration ?? 3000,
    });
  }
}