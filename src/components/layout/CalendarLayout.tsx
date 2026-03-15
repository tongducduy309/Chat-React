import Calendar from "../celendar/Calendar";


export default function CalendarLayout() {
    const mockEvents = [
  { id: 1, title: "Design review", date: "2026-03-10" },
  { id: 2, title: "Call with team", date: "2026-03-10" },
  { id: 3, title: "Ship feature", date: "2026-03-14" },
  { id: 4, title: "Interview", date: "2026-03-18" },
];
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-4xl p-4 bg-white rounded-lg shadow">
        <Calendar events={mockEvents}/>
      </div>
    </div>
  );
}
