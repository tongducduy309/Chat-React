import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  AttendanceStatus,
  CalendarEvent,
  CalendarMonthItemRes,
  CheckInRes,
} from "@/features/attendance/attendance.type";
import EventCalendarDialog from "./EventCalendarDialog";

type CalendarCell = {
  date: Date;
  isCurrentMonth: boolean;
};

type Props = {
  events?: CalendarMonthItemRes[];
  onSelectDate?: (date: Date) => void;
  currentDate?: (month: number, year: number) => void;
  onCreateEvent?: (date: Date) => void;
  onAddEvent?: (date: Date) => void;
  onEditEvent?: (event: CalendarEvent, date: Date) => void;
};

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday first
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek(date: Date) {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 6);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getAttendanceLabel(status?: AttendanceStatus | null) {
  switch (status) {
    case "PRESENT":
      return "Đã điểm danh";
    case "LATE":
      return "Đi muộn";
    case "ABSENT":
      return "Vắng mặt";
    case "NOT_CHECKED_IN":
      return "Chưa điểm danh";
    default:
      return "Không có dữ liệu";
  }
}

function getAttendanceClass(status?: AttendanceStatus | null) {
  switch (status) {
    case "PRESENT":
      return "bg-green-100 text-green-700 border-green-200";
    case "LATE":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "ABSENT":
      return "bg-red-100 text-red-700 border-red-200";
    case "NOT_CHECKED_IN":
      return "bg-blue-100 text-blue-700 border-blue-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export default function Calendar({
  events = [],
  onSelectDate,
  currentDate,
  onCreateEvent,
  onAddEvent,
  onEditEvent,
}: Props) {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [openEventDialog, setOpenEventDialog] = useState(false);

  const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  const cells = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const result: CalendarCell[] = [];
    let cursor = new Date(calendarStart);

    while (cursor <= calendarEnd) {
      result.push({
        date: new Date(cursor),
        isCurrentMonth: cursor.getMonth() === currentMonth.getMonth(),
      });
      cursor = addDays(cursor, 1);
    }

    return result;
  }, [currentMonth]);

  useEffect(() => {
    currentDate?.(currentMonth.getMonth() + 1, currentMonth.getFullYear());
  }, [currentMonth, currentDate]);

  const { eventsByDate, attendanceByDate } = useMemo(() => {
    const eventsByDate = new Map<string, CalendarEvent[]>();
    const attendanceByDate = new Map<string, CheckInRes | null>();

    for (const item of events) {
      eventsByDate.set(item.date, item.events ?? []);
      attendanceByDate.set(
        item.date,
        {
          attendanceStatus: item.attendanceMonthItemRes?.attendanceStatus,
          checkInAt: item.attendanceMonthItemRes?.checkInAt,
        }
      );
    }

    return { eventsByDate, attendanceByDate };
  }, [events]);

  const selectedKey = formatKey(selectedDate);
  const selectedEvents = eventsByDate.get(selectedKey) ?? [];
  const selectedAttendanceStatus = attendanceByDate.get(selectedKey)?.attendanceStatus;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      {/* Calendar */}
      <div className="w-full overflow-hidden rounded-2xl border bg-background shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="text-lg font-semibold">
            {currentMonth
              .toLocaleString("vi-VN", {
                month: "long",
                year: "numeric",
              })
              .toUpperCase()}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() - 1,
                    1
                  )
                )
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                const now = new Date();
                setCurrentMonth(now);
                setSelectedDate(now);
                onSelectDate?.(now);
              }}
            >
              Hôm nay
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() + 1,
                    1
                  )
                )
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Weekday header */}
        <div className="grid grid-cols-7 border-b">
          {weekDays.map((day) => (
            <div
              key={day}
              className="px-3 py-2 text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {cells.map((cell) => {
            const key = formatKey(cell.date);
            const dayEvents = eventsByDate.get(key) ?? [];
            const attendanceStatus = attendanceByDate.get(key)?.attendanceStatus;
            const isToday = isSameDay(cell.date, today);
            const isSelected = isSameDay(cell.date, selectedDate);

            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelectedDate(cell.date);
                  onSelectDate?.(cell.date);
                }}
                className={[
                  "min-h-[120px] border-r border-b p-2 text-left align-top transition",
                  "hover:bg-muted/40",
                  !cell.isCurrentMonth
                    ? "bg-muted/20 text-muted-foreground"
                    : "",
                  isSelected ? "bg-muted" : "",
                  attendanceStatus === "PRESENT" ? "bg-green-50" : "",
                  attendanceStatus === "LATE" ? "bg-yellow-50" : "",
                  attendanceStatus === "ABSENT" ? "bg-red-50" : "",
                  attendanceStatus === "NOT_CHECKED_IN" ? "bg-blue-50" : "",
                ].join(" ")}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div
                    className={[
                      "flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium",
                      attendanceStatus == null && isToday
                        ? "bg-foreground text-background"
                        : "",
                      attendanceStatus === "PRESENT"
                        ? "bg-green-300 text-white"
                        : "",
                      attendanceStatus === "LATE"
                        ? "bg-yellow-300 text-white"
                        : "",
                      attendanceStatus === "ABSENT"
                        ? "bg-red-300 text-white"
                        : "",
                      attendanceStatus === "NOT_CHECKED_IN"
                        ? "bg-blue-300 text-white"
                        : "",
                    ].join(" ")}
                  >
                    {cell.date.getDate()}
                  </div>
                </div>

                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="truncate rounded-md bg-muted px-2 py-1 text-xs"
                    >
                      {event.title}
                    </div>
                  ))}

                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

            {/* Right panel */}
      <div className="h-fit rounded-2xl border bg-background p-4 shadow-sm">
        <div className="mb-4">
          <div className="text-lg font-semibold">
            {selectedDate.toLocaleDateString("vi-VN", {
              weekday: "long",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Thông tin điểm danh và sự kiện trong ngày
          </div>
        </div>

        <div className="mb-6">
          <div className="mb-2 text-sm font-medium">Trạng thái điểm danh</div>
          <div className="flex flex-wrap items-end gap-2">
            <div
              className={[
                "inline-flex rounded-lg border px-3 py-2 text-sm font-medium",
                getAttendanceClass(selectedAttendanceStatus),
              ].join(" ")}
            >
              {getAttendanceLabel(selectedAttendanceStatus)}
            </div>

            {attendanceByDate.get(selectedKey)?.checkInAt ? (
              <p className="text-sm italic text-muted-foreground">
                {attendanceByDate.get(selectedKey)?.checkInAt}
              </p>
            ) : null}
          </div>
        </div>


        <div>
          <div className="mb-2 text-sm font-medium flex items-center justify-between">
            Sự kiện trong ngày ({selectedEvents.length})
            <Button size="icon" variant="outline" title="Thêm sự kiện trong ngày" onClick={() => setOpenEventDialog(true)}>
              <PlusIcon />
            </Button>
          </div>

          {selectedEvents.length === 0 ? (
            <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
              Không có sự kiện nào trong ngày này.
            </div>
          ) : (
            <div className="space-y-3">
              {selectedEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-xl border bg-muted/30 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{event.title}</div>

                      {"description" in event && event.description ? (
                        <div className="mt-1 text-sm text-muted-foreground">
                          {event.title}
                        </div>
                      ) : null}

                      {"startTime" in event && event.startTime ? (
                        <div className="mt-2 text-xs text-muted-foreground">
                          {/* Bắt đầu: {event.startTime} */}
                        </div>
                      ) : null}

                      {"endTime" in event && event.endTime ? (
                        <div className="text-xs text-muted-foreground">
                          {/* Kết thúc: {event.endTime} */}
                        </div>
                      ) : null}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditEvent?.(event, selectedDate)}
                    >
                      Sửa
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <EventCalendarDialog open={openEventDialog} onOpenChange={setOpenEventDialog} date={selectedDate}/>
    </div>
  );
}