import { useEffect, useRef, useState } from "react";
import { Camera, RefreshCcw, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type FaceLoginDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  onSubmit?: (file: Blob) => Promise<void> | void;
};

export default function FaceLoginDialog({
  open,
  onOpenChange,
  loading = false,
  onSubmit,
}: FaceLoginDialogProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    try {
      setCameraLoading(true);
      setCameraError("");
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
      setCameraError("Không thể mở camera. Vui lòng cấp quyền truy cập camera.");
    } finally {
      setCameraLoading(false);
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
      setCameraError("Camera chưa sẵn sàng.");
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
          setCameraError("Không thể chụp ảnh.");
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

  const handleClose = () => {
    stopCamera();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setCapturedBlob(null);
    setPreviewUrl("");
    setCameraError("");
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!capturedBlob || loading) return;
    await onSubmit?.(capturedBlob);
  };

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(next) => !loading && (next ? onOpenChange(true) : handleClose())}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Đăng nhập bằng khuôn mặt</DialogTitle>
          <DialogDescription>
            Đưa khuôn mặt vào giữa khung hình rồi chụp ảnh để đăng nhập.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border bg-black">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="face-login-preview"
                className="h-[340px] w-full object-cover"
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-[340px] w-full object-cover"
              />
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {cameraError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {cameraError}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {!capturedBlob ? (
              <Button onClick={capturePhoto} disabled={cameraLoading || loading}>
                {cameraLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="mr-2 h-4 w-4" />
                )}
                Chụp ảnh
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={resetCapture}
                  disabled={loading}
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Chụp lại
                </Button>

                <Button onClick={handleSubmit} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Đăng nhập
                </Button>
              </>
            )}

            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}