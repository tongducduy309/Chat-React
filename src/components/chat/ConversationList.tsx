
import { CirclePlus, Search, UserPlus, X } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import ConversationItem from "./ConversationItem";
import { MessageType, type ConversationRes } from "@/features/chat/chat.types";
import { useEffect, useState } from "react";
import { getAllConversationsByUserId, searchConversation } from "@/features/chat/chat.api";
import { Button } from "../ui/button";
import ContactsList from "../contact/ContactsList";

interface ConversationListProps {
  handleConversationClick: (conversationId: number) => void;
  conversations?: ConversationRes[];
  onSearchResults?: (results: ConversationRes[]) => void;
  userId: number;
}

export default function ConversationList({ handleConversationClick, conversations = [], onSearchResults, userId }: ConversationListProps) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState("");
  const [openContacts, setOpenContacts] = useState(false);

  const fetchConversations = async () => {
    await getAllConversationsByUserId().then((res: ConversationRes[]) => {

      onSearchResults?.(res);
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchKeyword(searchKeyword);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchKeyword]);

  useEffect(() => {
    let mounted = true;

    const doSearch = async () => {
      const keyword = debouncedSearchKeyword.trim().toLowerCase();
      if (!keyword) {
        if (mounted) fetchConversations();
        return;
      }

      try {
        const res = (await searchConversation(
          keyword
        )) as ConversationRes[];

        if (mounted) {
          console.log("Search results:", res);
          onSearchResults?.(res);
        }
      } catch (err) {
        console.error("Error searching conversations:", err);
        if (mounted) fetchConversations();
      }
    };

    doSearch();

    return () => {
      mounted = false;
    };
  }, [debouncedSearchKeyword]);


  return (
    <div className="w-1/4 h-full border-r p-2" style={{ overflowY: "auto" }}>
      <div className="flex w-full h-10 mb-1 gap-1">
        <InputGroup>
          <InputGroupInput placeholder="Tìm cuộc trò chuyện..."
            value={searchKeyword} onChange={(e) => {
              const value = e.target.value;
              setSearchKeyword(value);
            }}
          />
          <InputGroupAddon align="inline-start">
            <Search />
          </InputGroupAddon>
          {
            searchKeyword.length > 0 && (
              <InputGroupAddon align="inline-end" onClick={() => setSearchKeyword("")}>
                <Button variant="ghost" size="icon">
                  <X />
                </Button>
              </InputGroupAddon>
            )
          }
        </InputGroup>
        <Button variant="ghost" size="icon" title="Thêm bạn bè" onClick={() => setOpenContacts(true)}>
          <UserPlus />
        </Button>
        <Button variant="ghost" size="icon" title="Tạo cuộc trò chuyện mới">
          <CirclePlus />
        </Button>
      </div>

      {
        conversations.length === 0 && (
          <div className="px-4 py-6 text-sm text-slate-500 text-center">
            Không tìm thấy cuộc trò chuyện phù hợp.
          </div>
        )
      }
      {
        conversations.map((conversation: ConversationRes) => (
          <ConversationItem
            key={conversation.id}
            title={conversation.title ?? "Ẩn danh"}
            skipMessages={conversation.skipMessages}
            lastMessage={(conversation.lastMessage?.type === MessageType.CALL_VOICE || conversation.lastMessage?.type === MessageType.CALL_VIDEO) ? "Cuộc gọi" : conversation.lastMessage?.content}
            onClick={() => handleConversationClick(conversation.id)}
          />
        ))
      }
      <ContactsList 
        open={openContacts} onOpenChange={setOpenContacts} userId={userId}
      />
    </div>
  );
}
