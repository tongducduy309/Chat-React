

import type { ResponseObject } from "@/lib/ResponseObject";
import { http } from "../../lib/http";
import type { CalendarMonthItemRes } from "./attendance.type";


export async function checkTodayAttendance(): Promise<ResponseObject<boolean>> {
  const {data} = await http.get(`/attendance/checked-today`);
  return data;
}

export async function getMyAttendanceInMonth(month: number, year: number): Promise<CalendarMonthItemRes[]> {
  const {data} = await http.get(`/attendance/month?month=${month}&year=${year}`);
  return data.data;
}

export async function checkIn(): Promise<void> {
  await http.post("/attendance/check-in");
}