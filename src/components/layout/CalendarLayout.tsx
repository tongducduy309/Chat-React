import { type CalendarMonthItemRes, type CheckInRes } from "@/features/attendance/attendance.type";
import Calendar from "../celendar/Calendar";
import { useCallback, useEffect, useState } from "react";
import { getMyAttendanceInMonth } from "@/features/attendance/attendance.api";
import { useCalendarWs } from "@/features/calendar/useCalendarWs";


export default function CalendarLayout() {
  const [events, setEvents] = useState<CalendarMonthItemRes[]>([]);

  const getAttendanceInMonth = useCallback(async (month: number, year: number) => {
    const res = await getMyAttendanceInMonth(month, year);
    setEvents(res)
  }, [])

  const onAttendanceCheckIn = useCallback((data: CheckInRes) => {
    console.log("Check in", data);
    setEvents((prev) => {
      const index = prev.findIndex((item) => item.date === data.date);
      
      if (index !== -1) {
        const newEvents = [...prev];
        newEvents[index] = {
          ...newEvents[index],
          attendanceMonthItemRes: {
            ...newEvents[index].attendanceMonthItemRes,
            attendanceStatus: data.attendanceStatus!,
            checkInAt: data.checkInAt!,
            note: data.note!,
          },
        };
        return newEvents;
      }

      return [
        ...prev,
        {
          date: data.date,
          events: [],
          attendanceMonthItemRes: {
            attendanceStatus: data.attendanceStatus,
            checkInAt: data.checkInAt,
            note: data.note,
          },
        } as CalendarMonthItemRes,
      ];
    });
  }, []);

  const {ready} = useCalendarWs({onAttendanceCheckIn})

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-7xl p-4 bg-white rounded-lg shadow">
        <Calendar events={events} currentDate={getAttendanceInMonth} />
      </div>
    </div>
  );
}
