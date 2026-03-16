

import type { ResponseObject } from "@/lib/ResponseObject";
import { http } from "../../lib/http";


export async function checkTodayAttendance(): Promise<ResponseObject<boolean>> {
  const {data} = await http.get(`/attendance/checked-today`);
  return data;
}
