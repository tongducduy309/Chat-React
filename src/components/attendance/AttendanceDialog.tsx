import { useEffect, useRef, useState } from "react";
import { Button, Modal, Space, Typography, message, notification } from "antd";
import { Camera, RefreshCcw } from "lucide-react";
import { http } from "@/lib/http";
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
    } catch (error) {
      message.error("Không mở được camera. Hãy kiểm tra quyền truy cập.");
    } finally {
      setLoadingCamera(false);
    }
  };

  const resetCapture = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setCapturedBlob(null);
    setPreviewUrl("");
    startCamera();
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      message.warning("Camera chưa sẵn sàng.");
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
          message.error("Không thể chụp ảnh.");
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
      message.warning("Bạn cần chụp ảnh trước khi điểm danh.");
      return;
    }

    try {
      setSubmitting(true);
      await checkIn().then(() => {
        notification.success({
        title: "Điểm danh thành công",
      });
      onSuccess?.();
      handleClose();
      }).catch((error) => {
        const msg =
        error?.response?.data?.message || "Điểm danh thất bại, vui lòng thử lại.";
      message.error(msg);
      }).finally(()=>{
        setSubmitting(false);
      })

      // const formData = new FormData();
      // formData.append("file", capturedBlob, "attendance.jpg");

      // // đổi endpoint này theo backend của bạn
      // await http.post("/attendance/check-in", formData, {
      //   headers: {
      //     "Content-Type": "multipart/form-data",
      //   },
      // });

      
    } catch (error: any) {
      
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