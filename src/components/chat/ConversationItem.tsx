import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";

type ConversationItemProps = {
  title: string;
  lastMessage?: string | null;
  updatedAt?: string | null;      
  avatarUrl?: string | null;      
  isCall?: boolean;          
  onClick: () => void;
  skipMessages?: number;
};

function formatDateShort(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}


export default function ConversationItem({
  title,
  lastMessage,
  updatedAt,
  avatarUrl,
  isCall,
  onClick,
  skipMessages,
}: ConversationItemProps) {
  const dateText = formatDateShort(updatedAt);
  const fallback = title?.trim()?.charAt(0)?.toUpperCase() ?? "C";
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        gap: 12,
        padding: "10px 12px",
        cursor: "pointer",
        userSelect: "none",
        alignItems: "center",
        borderBottom: "1px solid #f0f0f0",
      }}
      onMouseEnter={(e) => ((e.currentTarget.style.backgroundColor = "#f7f7f7"))}
      onMouseLeave={(e) => ((e.currentTarget.style.backgroundColor = "transparent"))}
    >
      {/* Avatar */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          overflow: "hidden",
          flexShrink: 0,
          backgroundColor: "#f4b400", // vàng kiểu Zalo
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: 700,
          fontSize: 18,
        }}
      >
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatarUrl ?? undefined} />
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Row 1: Title + Date */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "baseline",
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#111",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              minWidth: 0,
            }}
            title={title}
          >
            {title}
          </div>

          <div style={{ fontSize: 12, color: "#8a8a8a", flexShrink: 0 }}>
            {dateText}
          </div>
        </div>

        {/* Row 2: Preview */}
        <div
          style={{
            marginTop: 4,
            fontSize: 13,
            color: "#6f6f6f",
            display: "flex",
            gap: 6,
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          {isCall ? (
            // icon điện thoại (SVG inline)
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              style={{ flexShrink: 0 }}
            >
              <path
                d="M6.6 10.8c1.4 2.6 3.5 4.7 6.1 6.1l2-2c.3-.3.8-.4 1.2-.2 1 .4 2 .6 3.1.6.7 0 1.1.4 1.1 1.1V20c0 .7-.4 1.1-1.1 1.1C10 21.1 2.9 14 2.9 5.1 2.9 4.4 3.3 4 4 4h3.5c.7 0 1.1.4 1.1 1.1 0 1.1.2 2.1.6 3.1.1.4 0 .9-.2 1.2l-2 2z"
                fill="#6f6f6f"
              />
            </svg>
          ) : null}

          <div
            className={`overflow-hidden text-ellipsis whitespace-nowrap min-w-0 line-clamp-1 ${(skipMessages ?? 0) > 0 ? "font-bold" : ""}`}
            title={lastMessage ?? ""}
          >
            {lastMessage ?? "Đoạn tin nhắn vừa được tạo"}
            
          </div>
          {(skipMessages ?? 0) > 0 && (
            <Badge variant="destructive">{skipMessages}</Badge>
          )}
        </div>
      </div>
    </div>
  );
}