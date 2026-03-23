import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Crown,
  Mail,
  MessageCircle,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { DepartmentMemberRes } from "@/features/department/department.type";
import { getAllEmployees } from "@/features/department/department.api";

// type Employee = {
//   id: number;
//   displayName: string;
//   email: string;
//   avatarUrl?: string | null;
//   departmentName: string;
//   positionName: string;
//   isLeader?: boolean;
//   isExecutive?: boolean;
//   active?: boolean;
// };

// const MOCK_EMPLOYEES: Employee[] = [
//   // {
//   //   id: 1,
//   //   displayName: "Nguyễn Văn A",
//   //   email: "a@company.com",
//   //   departmentName: "Ban điều hành",
//   //   positionName: "Tổng giám đốc",
//   //   isLeader: true,
//   //   isExecutive: true,
//   //   active: true,
//   // },
//   // {
//   //   id: 2,
//   //   displayName: "Trần Thị B",
//   //   email: "b@company.com",
//   //   departmentName: "Ban điều hành",
//   //   positionName: "Phó tổng giám đốc",
//   //   isExecutive: true,
//   //   active: true,
//   // },
//   // {
//   //   id: 3,
//   //   displayName: "Lê Văn C",
//   //   email: "c@company.com",
//   //   departmentName: "Công nghệ",
//   //   positionName: "Trưởng phòng Công nghệ",
//   //   isLeader: true,
//   //   active: true,
//   // },
//   // {
//   //   id: 4,
//   //   displayName: "Phạm Thị D",
//   //   email: "d@company.com",
//   //   departmentName: "Công nghệ",
//   //   positionName: "Frontend Developer",
//   //   active: true,
//   // },
//   // {
//   //   id: 5,
//   //   displayName: "Hoàng Văn E",
//   //   email: "e@company.com",
//   //   departmentName: "Công nghệ",
//   //   positionName: "Backend Developer",
//   //   active: false,
//   // },
//   // {
//   //   id: 6,
//   //   displayName: "Vũ Thị F",
//   //   email: "f@company.com",
//   //   departmentName: "Nhân sự",
//   //   positionName: "Trưởng phòng Nhân sự",
//   //   isLeader: true,
//   //   active: true,
//   // },
//   // {
//   //   id: 7,
//   //   displayName: "Đỗ Văn G",
//   //   email: "g@company.com",
//   //   departmentName: "Nhân sự",
//   //   positionName: "Chuyên viên nhân sự",
//   //   active: true,
//   // },
//   // {
//   //   id: 8,
//   //   displayName: "Bùi Thị H",
//   //   email: "h@company.com",
//   //   departmentName: "Kế toán",
//   //   positionName: "Kế toán trưởng",
//   //   isLeader: true,
//   //   active: true,
//   // },
//   // {
//   //   id: 9,
//   //   displayName: "Phan Văn I",
//   //   email: "i@company.com",
//   //   departmentName: "Kế toán",
//   //   positionName: "Kế toán viên",
//   //   active: false,
//   // },
// ];


function getFallback(name?: string) {
  return name?.trim()?.charAt(0)?.toUpperCase() || "U";
}

function normalizeVietnamese(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function sortDepartments(a: string, b: string) {
  const aExecutive = normalizeVietnamese(a) === "ban dieu hanh";
  const bExecutive = normalizeVietnamese(b) === "ban dieu hanh";

  if (aExecutive && !bExecutive) return -1;
  if (!aExecutive && bExecutive) return 1;

  return a.localeCompare(b, "vi");
}

function sortEmployees(a: DepartmentMemberRes, b: DepartmentMemberRes) {
  if (!!a.isLeader !== !!b.isLeader) {
    return a.isLeader ? -1 : 1;
  }

  if (!!a.isExecutive !== !!b.isExecutive) {
    return a.isExecutive ? -1 : 1;
  }

  return a.displayName.localeCompare(b.displayName, "vi");
}

function EmployeeCard({ employee }: { employee: DepartmentMemberRes }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-background p-3 transition hover:bg-muted/40">
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarImage src={employee.avatarUrl ?? undefined} />
          <AvatarFallback>{getFallback(employee.displayName)}</AvatarFallback>
        </Avatar>

        {/* <span
          className={`absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-background ${
            employee.active ? "bg-green-500" : "bg-slate-400"
          }`}
        /> */}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <div className="truncate font-semibold text-foreground">
            {employee.displayName}
          </div>

          {employee.isExecutive && (
            <Badge variant="secondary" className="gap-1">
              <Crown className="h-3.5 w-3.5" />
              Ban điều hành
            </Badge>
          )}

          {employee.isLeader && (
            <Badge variant="outline" className="gap-1 border-blue-200 text-blue-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Trưởng phòng
            </Badge>
          )}
        </div>

        <div className="mt-1 text-sm text-muted-foreground">
          {employee.positionName}
        </div>

        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          <span className="truncate">{employee.email}</span>
        </div>
      </div>
      <div className="flex items-center">
        <Button
          size="icon"
          variant="ghost"
          className="hover:bg-blue-50"
          title="Nhắn tin"
          onClick={() => {
            navigate(`/chat/?userId=${employee.userId}`)
          }}
        >
          <MessageCircle className="h-5 w-5 text-blue-600" />
        </Button>
      </div>
    </div>
  );
}

export const DirectoryPage = () => {
  const [keyword, setKeyword] = useState("");
  const [collapsedDepartments, setCollapsedDepartments] = useState<Record<string, boolean>>({
    "Ban điều hành": false,
  });

  const [employees, setEmployees] = useState<DepartmentMemberRes[]>([]);


  const groupedDepartments = useMemo(() => {
    const normalizedKeyword = normalizeVietnamese(keyword.trim());

    const filtered = employees.filter((employee) => {
      if (!normalizedKeyword) return true;

      const haystack = normalizeVietnamese(
        [
          employee.displayName,
          employee.email,
          employee.departmentName,
          employee.positionName,
        ].join(" ")
      );

      return haystack.includes(normalizedKeyword);
    });

    const map = new Map<string, DepartmentMemberRes[]>();

    for (const employee of filtered) {
      const current = map.get(employee.departmentName) ?? [];
      current.push(employee);
      map.set(employee.departmentName, current);
    }

    return Array.from(map.entries())
      .map(([departmentName, employees]) => ({
        departmentName,
        employees: employees.sort(sortEmployees),
      }))
      .sort((a, b) => sortDepartments(a.departmentName, b.departmentName));
  }, [keyword, employees]);

  const totalEmployees = groupedDepartments.reduce(
    (sum, department) => sum + department.employees.length,
    0
  );

  const toggleDepartment = (departmentName: string) => {
    setCollapsedDepartments((prev) => ({
      ...prev,
      [departmentName]: !prev[departmentName],
    }));
  };

  const expandAll = () => {
    setCollapsedDepartments({});
  };

  const collapseAll = () => {
    const next: Record<string, boolean> = {};
    for (const group of groupedDepartments) {
      next[group.departmentName] = true;
    }
    setCollapsedDepartments(next);
  };

  useEffect(() => {
    getAllEmployees().then((data) => {
      setEmployees(data);
    });
  }, []);

  return (
    <div className="h-full overflow-auto bg-muted/20 p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <Card className="rounded-2xl">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Building2 className="h-6 w-6 text-blue-600" />
                  Nhân Sự
                </CardTitle>
                <div className="mt-1 text-sm text-muted-foreground">
                  Danh bạ nội bộ công ty, hiển thị theo phòng ban
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={expandAll}>
                  Mở tất cả
                </Button>
                <Button variant="outline" onClick={collapseAll}>
                  Thu gọn tất cả
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm theo tên, email, chức vụ, phòng ban..."
                  className="pl-9"
                />
              </div>

              <div className="flex items-center rounded-xl border bg-background px-3 text-sm text-muted-foreground">
                <UserRound className="mr-2 h-4 w-4" />
                Tổng nhân sự: <span className="ml-1 font-semibold text-foreground">{totalEmployees}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {groupedDepartments.length === 0 ? (
          <Card className="rounded-2xl">
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Không tìm thấy nhân sự phù hợp.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {groupedDepartments.map((group) => {
              const collapsed = collapsedDepartments[group.departmentName] ?? false;

              return (
                <Card key={group.departmentName} className="rounded-2xl">
                  <CardHeader className="pb-3">
                    <button
                      type="button"
                      onClick={() => toggleDepartment(group.departmentName)}
                      className="flex w-full items-center justify-between rounded-xl text-left transition hover:bg-muted/40"
                    >
                      <div className="flex items-center gap-3 px-1 py-1">
                        {/* <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                          <Building2 className="h-5 w-5" />
                        </div> */}

                        <div>
                          <div className="font-semibold text-foreground">
                            {group.departmentName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {group.employees.length} nhân sự
                          </div>
                        </div>
                      </div>

                      <div className="pr-1 text-muted-foreground">
                        {collapsed ? (
                          <ChevronRight className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </div>
                    </button>
                  </CardHeader>

                  {!collapsed && (
                    <CardContent>
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {group.employees.map((employee) => (
                          <EmployeeCard key={employee.userId} employee={employee} />
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};