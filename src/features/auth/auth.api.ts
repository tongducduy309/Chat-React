import { http } from "@/lib/http";
import type { LoginRes } from "./auth.type";

export async function faceLogin(file: File | Blob): Promise<LoginRes>  {
  const formData = new FormData();
  formData.append("file", file, "attendance.jpg");

  const {data} = await http.post("/auth/face-login", formData);

  return data.data;
}

export async function registerFace(file: File | Blob): Promise<void> {
  const formData = new FormData();
  formData.append("file", file, "attendance.jpg");

  await http.post("/face/register", formData);
}

export async function login(body: { emailOrPhone: string; password: string }): Promise<LoginRes> {
  const {data} = await http.post("/auth/login", body);
  return data.data;
}