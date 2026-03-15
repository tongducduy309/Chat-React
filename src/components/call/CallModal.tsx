import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, PhoneOff, User } from "lucide-react";

type Mode = "INCOMING" | "OUTGOING" | "INCALL";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  name: string;
  mode: Mode;

  onAccept?: () => void;
  onReject?: () => void;
  onEnd?: () => void;

  remoteAudioRef: React.RefObject<HTMLAudioElement | null>;
};

export function CallModal({
  open,
  onOpenChange,
  name,
  mode,
  onAccept,
  onReject,
  onEnd,
  remoteAudioRef,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="relative">
          <div className="h-72 w-full bg-gradient-to-br from-slate-950 to-slate-800" />

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
            <div className="absolute left-0 right-0 top-0 p-4 flex items-center justify-between">
            <Badge variant="secondary">
              {mode === "INCOMING" && "Incoming call"}
              {mode === "OUTGOING" && "Calling..."}
              {mode === "INCALL" && "In call"}
            </Badge>
            <Badge variant="outline" className="bg-black/20 text-white border-white/20">
              {mode === "INCALL" ? "Connected" : "Ringing"}
            </Badge>
          </div>

            <div className="h-20 w-20 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
              <User className="h-10 w-10 opacity-80" />
            </div>

            <div className="text-xl font-semibold">{name}</div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            {mode === "INCOMING" ? (
              <div className="flex gap-3">
                <Button variant="destructive" className="flex-1" onClick={onReject}>
                  <PhoneOff className="mr-2 h-4 w-4" />
                  Reject
                </Button>

                <Button className="flex-1 bg-green-600" onClick={onAccept}>
                  <Phone className="mr-2 h-4 w-4" />
                  Accept
                </Button>
              </div>
            ) : (
              <div className="flex justify-center">
                <Button variant="destructive" onClick={onEnd}>
                  <PhoneOff className="mr-2 h-4 w-4" />
                  End Call
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* remote audio */}
        <audio ref={remoteAudioRef} autoPlay playsInline controls />
      </DialogContent>
    </Dialog>
  );
}