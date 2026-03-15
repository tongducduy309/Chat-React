
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Globe, AtSign, ArrowUp, X } from "lucide-react";

interface ReplyPreview {
  id: number;
  senderName?: string;
  content: string;
};

interface ChatComposerProps {
  value: string;
  onChange: (v: string) => void;
  onSend: (payload: { text: string; replyToId?: number }) => void;
  disabled?: boolean;

  replyTo?: ReplyPreview | null;
  onCancelReply?: () => void;
};

export function ChatComposer({ value, onChange, onSend, disabled, replyTo, onCancelReply }: ChatComposerProps) {
    
  const canSend = !disabled && value.trim().length > 0;

  const handleSend = () => {
    const text = value.trim();
    if (!text) return;
    onSend({ text, replyToId: replyTo?.id });
  };
  return (
    <div className="w-full">
      <div className="relative rounded-2xl border bg-background p-3 shadow-sm">

        {/* <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm text-muted-foreground hover:bg-muted"
        >
          <AtSign className="h-4 w-4" />
          <span>Add context</span>
        </button> */}

        {replyTo ? (
          <div className="mt-3 flex items-start justify-between gap-3 rounded-xl border bg-muted/40 px-3 py-2">
            <div className="min-w-0">
              <div className="text-xs font-medium text-foreground">
                Phản hồi {replyTo.senderName ?? "message"}
              </div>
              <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {replyTo.content}
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={onCancelReply}
              aria-label="Cancel reply"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : null}

        {/* textarea */}
        <div className="mt-2">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Trả lời tin nhắn..."
            className="min-h-[84px] resize-none border-0 p-0 shadow-none focus-visible:ring-0"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (canSend) handleSend();
              }
            }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>

          <Button
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={handleSend}
            disabled={!canSend}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}