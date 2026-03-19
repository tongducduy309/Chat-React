

export const AttendanceStatus = {
  PRESENT: "PRESENT",
  LATE: "LATE",
  NOT_CHECKED_IN: "NOT_CHECKED_IN",
  ABSENT: "ABSENT",
} as const;

export type AttendanceStatus = (typeof AttendanceStatus)[keyof typeof AttendanceStatus];

export interface CalendarEvent {
  id: number;
  title: string;
  date: string; 
};

export interface AttendanceMonthItemRes {
    checkInAt: string;
    attendanceStatus: AttendanceStatus;
    note: string;
}

export interface CalendarMonthItemRes {
    date: string;
    attendanceMonthItemRes: AttendanceMonthItemRes;
    events: CalendarEvent[];

}

export interface CheckInRes {
    date?: string;
    userId?: number;
    checkInAt?: string;
    attendanceStatus?: AttendanceStatus;
    note?: string;
}