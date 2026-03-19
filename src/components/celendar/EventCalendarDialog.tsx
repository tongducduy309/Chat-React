import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, FileText, Loader2, Type } from "lucide-react";
import dayjs from "dayjs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { DatePicker } from "antd";

type EventFormData = {
    id?: string | number;
    title: string;
    description: string;
    date: Date;
    startTime: string;
    endTime: string;
};

type EventCalendarDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode?: "create" | "edit";
    initialData?: Partial<EventFormData>;
    loading?: boolean;
    onSubmit?: (data: EventFormData) => void;
    date?: Date;
};

function toDateInputValue(date?: Date | string) {
    if (!date) return "";

    if (typeof date === "string") {
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
        const parsed = new Date(date);
        if (Number.isNaN(parsed.getTime())) return "";
        const y = parsed.getFullYear();
        const m = String(parsed.getMonth() + 1).padStart(2, "0");
        const d = String(parsed.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export default function EventCalendarDialog({
    open,
    onOpenChange,
    mode = "create",
    initialData,
    loading = false,
    onSubmit,
    date,
}: EventCalendarDialogProps) {
    const [form, setForm] = useState<EventFormData>({
        id: undefined,
        title: "",
        description: "",
        date: new Date(),
        startTime: "",
        endTime: "",
    });

    const [errors, setErrors] = useState<Partial<Record<keyof EventFormData, string>>>({});

    useEffect(() => {

        if (date) {
            setForm((prev) => ({
                ...prev,
                date: date,
            }));
        }
    }, [date,open]);

    useEffect(() => {
        if (!open) return;

        setForm({
            id: initialData?.id,
            title: initialData?.title ?? "",
            description: initialData?.description ?? "",
            date: initialData?.date ?? new Date(),
            startTime: initialData?.startTime ?? "",
            endTime: initialData?.endTime ?? "",
        });

        setErrors({});
    }, [open, initialData]);

    const dialogTitle = useMemo(() => {
        return mode === "edit" ? "Chỉnh sửa sự kiện" : "Tạo sự kiện";
    }, [mode]);

    const dialogDescription = useMemo(() => {
        return mode === "edit"
            ? "Cập nhật thông tin sự kiện trong lịch."
            : "Tạo một sự kiện mới cho ngày đã chọn.";
    }, [mode]);

    const submitLabel = useMemo(() => {
        return mode === "edit" ? "Lưu thay đổi" : "Tạo sự kiện";
    }, [mode]);

    const handleChange =
        (field: keyof EventFormData) =>
            (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                const value = e.target.value;
                setForm((prev) => ({
                    ...prev,
                    [field]: value,
                }));

                if (errors[field]) {
                    setErrors((prev) => ({
                        ...prev,
                        [field]: "",
                    }));
                }
            };

    const validate = () => {
        const nextErrors: Partial<Record<keyof EventFormData, string>> = {};

        if (!form.title.trim()) {
            nextErrors.title = "Vui lòng nhập tiêu đề sự kiện";
        }

        if (!form.date) {
            nextErrors.date = "Vui lòng chọn ngày";
        }

        if (!form.startTime) {
            nextErrors.startTime = "Vui lòng chọn giờ bắt đầu";
        }

        if (!form.endTime) {
            nextErrors.endTime = "Vui lòng chọn giờ kết thúc";
        }

        if (form.startTime && form.endTime && form.startTime >= form.endTime) {
            nextErrors.endTime = "Giờ kết thúc phải lớn hơn giờ bắt đầu";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        onSubmit?.(form);
    };

    const handleClose = (nextOpen: boolean) => {
        if (loading) return;
        onOpenChange(nextOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{dialogTitle}</DialogTitle>
                    <DialogDescription>{dialogDescription}</DialogDescription>
                </DialogHeader>

                <div className="grid gap-5 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="event-title">Tiêu đề sự kiện</Label>
                        <div className="relative">
                            <Type className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="event-title"
                                placeholder="Ví dụ: Họp nội bộ"
                                value={form.title}
                                onChange={handleChange("title")}
                                className="pl-9"
                                disabled={loading}
                            />
                        </div>
                        {errors.title ? (
                            <p className="text-sm text-destructive">{errors.title}</p>
                        ) : null}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="event-description">Mô tả</Label>
                        <div className="relative">
                            <FileText className="pointer-events-none absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                            <Textarea
                                id="event-description"
                                placeholder="Nhập mô tả ngắn cho sự kiện"
                                value={form.description}
                                onChange={handleChange("description")}
                                className="min-h-[100px] pl-9"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-1">
            <div className="space-y-2">
              <Label htmlFor="event-date">Ngày</Label>
              <div className="relative">
                <DatePicker className="w-full"
                                    value={form.date ? dayjs(form.date) : null}
                                    picker="date"
                                    placeholder="Chọn ngày"
                                    format="DD-MM-YYYY"
                                    onChange={(value) => {
                                        setForm((prev) => ({
                                            ...prev,
                                            date: value ? value.toDate() : new Date(),
                                        }));
                                    }}
                                    allowClear = {false}
                                    disabled={loading}
                                />
              </div>
              {errors.date ? (
                <p className="text-sm text-destructive">{errors.date}</p>
              ) : null}
            </div>
          </div>



                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="event-start-time">Giờ bắt đầu</Label>
                            <div className="relative">
                                <DatePicker
                                className="w-full"
                                    value={form.startTime ? dayjs(form.startTime, "HH:mm") : null}
                                    picker="time"
                                    placeholder="Chọn giờ bắt đầu"
                                    format="HH:mm"
                                    onChange={(value) => {
                                        setForm((prev) => ({
                                            ...prev,
                                            startTime: value ? value.format("HH:mm") : "",
                                        }));
                                    }}
                                    disabled={loading}
                                />
                            </div>
                            {errors.startTime ? (
                                <p className="text-sm text-destructive">{errors.startTime}</p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="event-end-time">Giờ kết thúc</Label>
                            <div className="relative">
                                <DatePicker
                                className="w-full"
                                    value={form.endTime ? dayjs(form.endTime, "HH:mm") : null}
                                    picker="time"
                                    placeholder="Chọn giờ kết thúc"
                                    format="HH:mm"
                                    onChange={(value) => {
                                        setForm((prev) => ({
                                            ...prev,
                                            endTime: value ? value.format("HH:mm") : "",
                                        }));
                                    }}
                                    disabled={loading}
                                />
                            </div>
                            {errors.endTime ? (
                                <p className="text-sm text-destructive">{errors.endTime}</p>
                            ) : null}
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:justify-end">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Hủy
                    </Button>

                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {submitLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}