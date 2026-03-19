import { useEffect, useRef, useState } from "react";
import { App, Button, Modal, Space, Typography} from "antd";
import { Camera, RefreshCcw } from "lucide-react";
import { checkIn } from "@/features/attendance/attendance.api";

const { Text } = Typography;

type AttendanceDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function AttendanceDialog({
  open,
  onClose,
  onSuccess,
}: AttendanceDialogProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [loadingCamera, setLoadingCamera] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {notification} = App.useApp();

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    try {
      setLoadingCamera(true);
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 720 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      notification.error({
        message: "Lỗi",
        description: "Không mở được camera. Hãy kiểm tra quyền truy cập.",
      });
    } finally {
      setLoadingCamera(false);
    }
  };

  const resetCapture = async () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setCapturedBlob(null);
    setPreviewUrl("");
    await startCamera();
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      notification.warning({
        message: "Cảnh báo",
        description: "Camera chưa sẵn sàng.",
      });
      return;
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          notification.error({
            message: "Lỗi",
            description: "Không thể chụp ảnh.",
          });
          return;
        }

        stopCamera();

        const url = URL.createObjectURL(blob);
        setCapturedBlob(blob);
        setPreviewUrl(url);
      },
      "image/jpeg",
      0.95
    );
  };

  const handleSubmitAttendance = async () => {
    if (!capturedBlob) {
      notification.warning({
        message: "Cảnh báo",
        description: "Bạn cần chụp ảnh trước khi điểm danh.",
      });
      return;
    }

    try {
      setSubmitting(true);

      await checkIn(capturedBlob);

      notification.success({
        message: "Điểm danh thành công",
        description: "Bạn đã điểm danh bằng khuôn mặt thành công.",
      });

      onSuccess?.();
      handleClose();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Điểm danh thất bại, vui lòng thử lại.";
      notification.error({
        message: "Điểm danh thất bại",
        description: msg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    stopCamera();

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    setCapturedBlob(null);

    onClose();
  };

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [open]);

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      title="Điểm danh bằng khuôn mặt"
      centered
      destroyOnHidden
      width={560}
    >
      <div className="space-y-4">
        <Text type="secondary">
          Đưa khuôn mặt vào giữa khung hình rồi chụp ảnh để điểm danh.
        </Text>

        <div className="overflow-hidden rounded-2xl border bg-black">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="attendance-preview"
              className="h-[360px] w-full object-cover"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-[360px] w-full object-cover"
            />
          )}
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />

        <Space wrap>
          {!capturedBlob ? (
            <Button
              type="primary"
              icon={<Camera size={16} />}
              onClick={capturePhoto}
              loading={loadingCamera}
            >
              Chụp ảnh
            </Button>
          ) : (
            <>
              <Button
                icon={<RefreshCcw size={16} />}
                onClick={resetCapture}
                disabled={submitting}
              >
                Chụp lại
              </Button>

              <Button
                type="primary"
                onClick={handleSubmitAttendance}
                loading={submitting}
              >
                Xác nhận điểm danh
              </Button>
            </>
          )}

          <Button onClick={handleClose} disabled={submitting}>
            Đóng
          </Button>
        </Space>
      </div>
    </Modal>
  );
}