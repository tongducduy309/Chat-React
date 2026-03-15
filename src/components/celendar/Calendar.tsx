import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type CalendarEvent = {
  id: string | number;
  title: string;
  date: string; // yyyy-mm-dd
};

type CalendarCell = {
  date: Date;
  isCurrentMonth: boolean;
};

type Props = {
  events?: CalendarEvent[];
  onSelectDate?: (date: Date) => void;
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

export default function Calendar({
  events = [],
  onSelectDate,
}: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

  const eventMap = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const arr = map.get(event.date) ?? [];
      arr.push(event);
      map.set(event.date, arr);
    }
    return map;
  }, [events]);

  const today = new Date();

  return (
    <div className="w-full rounded-2xl overflow-hidden border bg-background shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="text-lg font-semibold">
          {currentMonth.toLocaleString("vi-VN", {
            month: "long",
            year: "numeric",
          }).toLocaleUpperCase()}
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
            onClick={() => setCurrentMonth(new Date())}
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
          const dayEvents = eventMap.get(key) ?? [];
          const isToday = isSameDay(cell.date, today);
          const isSelected = selectedDate && isSameDay(cell.date, selectedDate);

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
                !cell.isCurrentMonth ? "bg-muted/20 text-muted-foreground" : "",
                isSelected ? "bg-muted" : "",
              ].join(" ")}
            >
              <div className="mb-2 flex items-center justify-between">
                <div
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium",
                    isToday ? "bg-foreground text-background" : "",
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
  );
}