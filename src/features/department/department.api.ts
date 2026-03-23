
import { http } from "../../lib/http";
import type { DepartmentMemberRes } from "./department.type";


export async function getAllEmployees(): Promise<DepartmentMemberRes[]> {
  const {data} = await http.get(`/departments/employees`);
  return data.data;
}