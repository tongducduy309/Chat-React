import type { MessageRes, MessageSearchRes } from "@/features/chat/chat.types";
import { Button } from "@/components/ui/button";
import { X, Search } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import { useEffect, useRef, useState } from "react";
import { searchMessage } from "@/features/chat/chat.api";

type Props = {
  openSearch: boolean;
  onClose: () => void;
  onSelect: (messageId: number) => void;
  conversationId?: number;
};

export default function MessageSearchResults({
  onClose,
  onSelect,
  openSearch,
  conversationId
}: Props) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<MessageSearchRes[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

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
        if (mounted) setSearchResults([]);
        return;
      }
  
      try {
        const res = (await searchMessage(
          conversationId ?? -1,
          keyword
        )) as MessageSearchRes[];
  
        if (mounted) {
          
          setSearchResults(res);
        }
      } catch (err) {
        console.error("Error searching messages:", err);
        if (mounted) setSearchResults([]);
      }
    };
  
    doSearch();
  
    return () => {
      mounted = false;
    };
  }, [debouncedSearchKeyword, conversationId]);


  useEffect(() => {
  if (openSearch) {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }
}, [openSearch]);

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
          <InputGroup className="w-full h-10">
              <InputGroupInput ref={inputRef} placeholder="Tìm trong cuộc trò chuyện..."
                value={searchKeyword} onChange={(e) => {
                  const value = e.target.value;
                  setSearchKeyword(value);
                }} />
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              {searchResults?.length > 0 && (
                <InputGroupAddon align="inline-end">{searchResults.length} kết quả</InputGroupAddon>
              )}
            </InputGroup>
        </div>

        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="max-h-[420px] overflow-y-auto">
        {searchResults.length === 0 ? (
          <div className="px-4 py-6 text-sm text-slate-500 text-center">
            Không tìm thấy tin nhắn phù hợp.
          </div>
        ) : (
          <div className="divide-y">
            {searchResults.map((message) => (
              <button
                key={message.id}
                onClick={() => message.id && onSelect(message.id)}
                className="block w-full px-4 py-3 text-left hover:bg-slate-50"
              >
                <div className="text-xs text-slate-500">
                  {message.createdAt ?? ""}
                </div>

                <div className="mt-1 line-clamp-2 text-sm text-slate-800">
                  {message.content}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}