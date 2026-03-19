import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, MessageCircleMore } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { http } from "@/lib/http";

type LoginForm = {
  emailOrPhone: string;
  password: string;
};

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<LoginForm>({
    emailOrPhone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange =
    (field: keyof LoginForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
      if (error) setError("");
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.emailOrPhone.trim()) {
      setError("Vui lòng nhập email hoặc số điện thoại");
      return;
    }

    if (!form.password.trim()) {
      setError("Vui lòng nhập mật khẩu");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await http.post("/auth/login", {
        emailOrPhone: form.emailOrPhone.trim(),
        password: form.password,
      });

      const token =
        res.data?.data?.accessToken ||
        res.data?.accessToken ||
        res.data?.token;

      if (!token) {
        throw new Error("Không nhận được access token");
      }

      localStorage.setItem("access_token", token);

      const refreshToken =
        res.data?.data?.refreshToken || res.data?.refreshToken;
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }

      const user = res.data?.data?.user || res.data?.user;
      if (user) {
        localStorage.setItem("current_user", JSON.stringify(user));
      }

      navigate("/");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Đăng nhập thất bại";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      <div className="hidden w-1/2 flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/15 p-3">
            <MessageCircleMore className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl font-semibold">Chat App</div>
            <div className="text-sm text-primary-foreground/80">
              Kết nối và trò chuyện dễ dàng
            </div>
          </div>
        </div>

        <div className="max-w-md space-y-4">
          <h1 className="text-4xl font-bold leading-tight">
            Chào mừng bạn quay trở lại
          </h1>
          <p className="text-base text-primary-foreground/85">
            Đăng nhập để tiếp tục trò chuyện, quản lý bạn bè và sử dụng chức năng
            điểm danh trong hệ thống.
          </p>
        </div>

        <div className="text-sm text-primary-foreground/70">
          © 2026 Chat App
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border bg-background p-8 shadow-sm">
          <div className="mb-6 space-y-2 text-center">
            <h2 className="text-2xl font-bold">Đăng nhập</h2>
            <p className="text-sm text-muted-foreground">
              Nhập thông tin để truy cập hệ thống
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="emailOrPhone">Email hoặc số điện thoại</Label>
              <Input
                id="emailOrPhone"
                placeholder="Nhập email hoặc số điện thoại"
                value={form.emailOrPhone}
                onChange={handleChange("emailOrPhone")}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={form.password}
                onChange={handleChange("password")}
                disabled={loading}
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            ) : null}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Đăng nhập
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}