import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { deleteForMe, getAllConversationsByUserId, getConversationById, getDetailConversationById, getDetailConversationTemp, readMessage, searchMessage, sendMessage } from "../../features/chat/chat.api";
import { type MessageRes, type DetailConversationRes, type ConversationRes, type ConversationMember, MessageType, type ConversationCreate, type ReadMessageRes, type MessageSearchRes, type NameUpdateRes, ConversationType } from "../../features/chat/chat.types";
import { useChatWs } from "../../features/chat/useChatWs";
import type { User } from "../../features/user/user.type";
import ConversationList from "../../components/chat/ConversationList";
import { ChatComposer } from "../../components/chat/ChatComposer";
import MessageBubble from "../../components/chat/MessageBubble";
import { useVoiceCall } from "@/features/call/useVoiceCall";
import { CallModal } from "../../components/call/CallModal";
import type { CallRes } from "@/features/call/call.types";
import ConversationHeader from "../../components/chat/ConversationHeader";
import MessageSearchResults from "../../components/chat/MessageSearchResults";
import NicknameList from "../../components/chat/NicknameList";
import MembersList from "../../components/chat/MembersList";
import TitleAvatarList from "../../components/chat/TitleAvatarGroup";
import { type UpdateFriendshipRes } from "@/features/friendship/friendship.type";
import { App } from "antd";
import { useSearchParams } from "react-router-dom";
interface ChatPageProps {
  user: User | null;
}

function updateConversationLastMessageAfterDelete(
  conversations: ConversationRes[],
  conversationId: number,
  deletedMessageId: number,
  remainingMessages: MessageRes[]
): ConversationRes[] {
  return conversations.map((conversation) => {
    if (conversation.id !== conversationId) return conversation;

    // nếu lastMessage hiện tại không phải message vừa xóa thì giữ nguyên
    if (conversation.lastMessage?.id !== deletedMessageId) {
      return conversation;
    }

    // lấy các message còn lại của đúng conversation
    const messagesOfConversation = remainingMessages
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => {
        const timeA = new Date(a.createdAt ?? 0).getTime();
        const timeB = new Date(b.createdAt ?? 0).getTime();
        return timeB - timeA; // mới nhất trước
      });

    const newLastMessage = messagesOfConversation[0] ?? null;

    return {
      ...conversation,
      lastMessage: newLastMessage,
      // updatedAt: newLastMessage?.createdAt ?? conversation.updatedAt,
    };
  });
}

function updateMessagesAfterDelete(
  messages: MessageRes[],
  deletedMessageId: number
): MessageRes[] {
  return messages
    .filter((m) => m.id !== deletedMessageId) // xóa message gốc
    .map((m) => {
      if (m.replyTo?.id === deletedMessageId) {
        return {
          ...m,
          replyTo: {
            ...m.replyTo,
            content: "Tin nhắn đã bị xóa",
            deleted: true,
          },
        };
      }
      return m;
    });
}

export default function ChatPage({ user }: ChatPageProps) {
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<MessageRes[]>([]);
  const [conversation, setConversation] = useState<DetailConversationRes>();

  const [conversations, setConversations] = useState<ConversationRes[]>([]);
  const [replyTo, setReplyTo] = useState<{ id: number; senderName?: string; content: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef(new Map<number, HTMLDivElement>());
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const [titleCall, setTitleCall] = useState<string | null>(null);
  const [callData, setCallData] = useState<CallRes | null>(null);

  const [searchMessageOpen, setSearchMessageOpen] = useState(false);
  const [openNickname, setOpenNickname] = useState(false);
  const [openMembers, setOpenMembers] = useState(false);
  const [openTitleAvatar, setOpenTitleAvatar] = useState(false);

  const { notification } = App.useApp();

  const [searchParams, setSearchParams] = useSearchParams();

  const userIdParam = searchParams.get("userId");
  const conversationIdParam = searchParams.get("conversationId");

  const userIdNumber = userIdParam ? Number(userIdParam) : null;
  const conversationIdNumber = conversationIdParam ? Number(conversationIdParam) : null;




  const scrollToMessage = useCallback((id: number) => {
    const el = messageRefs.current.get(id);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });

    setHighlightId(id);

    window.setTimeout(() => {
      setHighlightId((cur) => (cur === id ? null : cur));
    }, 800);
  }, []);


  const applyMessageToConversationList = useCallback((m: MessageRes) => {
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.id === m.conversationId);

      if (idx === -1) return prev;

      const old = prev[idx];
      const updated: ConversationRes = {
        ...old,
        lastMessage: { ...m },
        skipMessages: (conversationId !== m.conversationId ? (old.skipMessages ?? 0) + 1 : 0),
      };
      const next = prev.slice();
      next.splice(idx, 1);
      next.unshift(updated);
      return next;
    });
  }, [conversationId]);

  const onMessage = useCallback(async (m: MessageRes) => {
    applyMessageToConversationList(m);
    if (m.conversationId !== conversationId) return;


    await readMessage(m.conversationId);
    setMessages((prev) => {

      return [...prev, m];
    });
  }, [conversationId, applyMessageToConversationList]);

  const onConversationCreate = useCallback(async (m: ConversationCreate) => {
    await getConversationById(m.conversationId).then((res) => {
      setConversations((prev) => [res, ...prev]);
    });
  }, []);


  const onCall = useCallback((m: CallRes) => {
    if (m.event === "INCOMING_CALL" || m.event === "CALL_RINGING") {
      setTitleCall(m.data.title);
      setCallData(m);
    }
  }, []);

  const onReadMessage = useCallback((m: ReadMessageRes) => {
    setMessages((prev) => {
      return prev.map((msg) => {
        if (msg.id === m.messageId) {
          return {
            ...msg,
            membersReadMessage: [
              ...(msg.membersReadMessage ?? []),
              m.member,
            ],
          };
        }
        return {
          ...msg,
          membersReadMessage: (msg.membersReadMessage ?? []).filter(
            (mem: ConversationMember) => mem.user?.id !== m.member.user?.id
          ),
        };
      });
    });
  }, [messages]);

  const onNameUpdate = useCallback(async (n: NameUpdateRes, m: MessageRes) => {
    await getConversationById(n.conversationId).then(async (res) => {
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === n.conversationId);

        if (index === -1) return prev;

        const next = [...prev];
        next[index] = res;
        return next;
      });
      applyMessageToConversationList(m);

      if (n.conversationId !== conversationId) return;


      fetchMessages();
    });
  }, [conversationId]);

  const onUpdateFriendship = useCallback(async (u: UpdateFriendshipRes) => {
    if (!conversation || conversation.type !== ConversationType.DIRECT) return;
    if (u.targetUserId !== conversation?.targetUserId) return;

    if (conversationId){
      await getDetailConversationById(conversationId ).then((res: DetailConversationRes) => {
      setConversation(res);
    });
    }
    else {
      await getDetailConversationTemp(conversation?.targetUserId ?? -1).then((res: DetailConversationRes) => {
      setConversation(res);
    });
    }
  }, [conversation]);



  const { ready, sendRaw, subscribeRaw } = useChatWs({
    onMessage,
    onCall,
    onConversationCreate,
    onReadMessage,
    onNameUpdate,
    onUpdateFriendship,
  });



  const handleSend = async () => {
    if (!text.trim()) return;

    await sendMessage({
      type: MessageType.TEXT,
      conversationId: conversationId ?? null,
      content: text,
      replyToId: replyTo?.id ?? null,
      receiverId: conversation?.targetUserId
    }).then((res: MessageRes) => {
      if (!conversationIdNumber){
        searchParams.set("conversationId", res?.conversationId?.toString() ?? "");
        setSearchParams(searchParams);
      }
      setText("");
      setReplyTo(null);

    }).catch((err) => {
      console.error("Error sending message:", err);
    });





  };

  const handleDeleteForMe = async (messageId: number) => {
    await deleteForMe(messageId).then(() => {
      setMessages((prev) => {
        const nextMessages = updateMessagesAfterDelete(prev, messageId);


        setConversations((prevConversations) =>
          updateConversationLastMessageAfterDelete(
            prevConversations,
            conversationId ?? -1,
            messageId,
            nextMessages
          )
        );

        return nextMessages;
      });
    });
  };

  useEffect(() => {
    // console.log("openConversation", conversationIdNumber, userIdNumber);
    
    const getDetail = async ()=>{
      setConversationId(conversationIdNumber??null);
      if (conversationIdNumber) {
      
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === conversationIdNumber);
        if (index !== -1) {
          const updated = { ...prev[index], skipMessages: 0 };
          return [...prev.slice(0, index), updated, ...prev.slice(index + 1)];
        }
        return prev;
      });
    } else {
      await getDetailConversationTemp(userIdNumber ?? -1).then((res: DetailConversationRes) => {
        setConversation(res);
        // res.members.forEach((member) => {
        //   if (member.user?.id !== user?.id) {
        //     if (map.has(member.lastReadMessageId ?? -1)) {
        //       map.set(member.lastReadMessageId ?? -1, [...map.get(member.lastReadMessageId ?? -1) ?? [], member]);
        //     } else {
        //       map.set(member.lastReadMessageId ?? -1, [member]);
        //     }
        //   }
        // });
        // const messages: MessageRes[] = res.messages.map((message) => {
        //   return {
        //     ...message,
        //     membersReadMessage: map.has(message.id ?? -1) ? map.get(message.id ?? -1) : [],
        //   };
        // });
        setMessages([]);
      });
    }
    }

    if (conversationIdNumber || userIdNumber) getDetail();
  }, [userIdNumber,conversationIdNumber]);





  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {

    if (conversationId) {
      await getDetailConversationById(conversationId ?? -1).then((res: DetailConversationRes) => {
        setConversation(res);
        let map = new Map<number, ConversationMember[]>();
        res.members.forEach((member) => {
          if (member.user?.id !== user?.id) {
            if (map.has(member.lastReadMessageId ?? -1)) {
              map.set(member.lastReadMessageId ?? -1, [...map.get(member.lastReadMessageId ?? -1) ?? [], member]);
            } else {
              map.set(member.lastReadMessageId ?? -1, [member]);
            }
          }
        });
        const messages: MessageRes[] = res.messages.map((message) => {
          return {
            ...message,
            membersReadMessage: map.has(message.id ?? -1) ? map.get(message.id ?? -1) : [],
          };
        });
        setMessages(messages);
      });
    }

  };

  useEffect(() => {


    fetchMessages();
  }, [conversationId]);





  const fetchConversations = async () => {
    await getAllConversationsByUserId().then((res: ConversationRes[]) => {
      setConversations(res);
    });
  };


  useEffect(() => {


    fetchConversations();
  }, []);

  const peerId = useMemo(
    () =>
      conversation?.members?.find(
        (m: ConversationMember) => m.user?.id !== user?.id
      )?.user?.id,
    [conversation?.members, user?.id]
  );

  const {
    callState,
    startCall,
    accept,
    reject,
    hangup,
    remoteAudioRef,
    runtimePeerId
  } = useVoiceCall({
    userId: user?.id,
    defaultPeerId: peerId,
    conversationId: conversationId ?? undefined,
    sendRaw,
    subscribeRaw,
    callId: callData?.data.callId
  });

  const canSend = ready && text.trim().length > 0;




  // mở modal khi có call
  const callOpen = callState !== "IDLE" && callState !== "ENDED";

  // mode UI
  const callMode =
    callState === "INCOMING" ? "INCOMING" :
      callState === "CALLING" || callState === "ACCEPTING" ? "OUTGOING" :
        callState === "ONGOING" ? "INCALL" : "OUTGOING";

  return (
    <div className="h-full">
      {/* <h2>Tài khoản: {user?.displayName} - Id:{user?.id} - WS: {ready ? "CONNECTED" : "DISCONNECTED"}</h2> */}

      <div className="flex items-start w-full h-full gap-2">
        <ConversationList
          conversations={conversations}
          userId={user?.id ?? -1}
          onSearchResults={(results) => setConversations(results)}
        />

        {conversation && (
          <div
            className="flex h-full w-full flex-col rounded-2xl border border-[#eee] overflow-hidden"
          >
            <div className="shrink-0">
              <ConversationHeader
                title={conversation.title ?? "Cuộc trò chuyện"}
                avatarUrl={conversation?.avatarUrl ?? null}
                subtitle=""
                type={conversation?.type}
                role={conversation?.role}
                onCall={() => {

                  startCall();
                }}
                onVideoCall={() => {
                  // startCall();
                }}
                onOpenSearch={() => {
                  setSearchMessageOpen(true);
                }}
                onOpenNickname={() => setOpenNickname(true)}
                onOpenMembers={() => setOpenMembers(true)}
                onOpenTitleAvatar={() => setOpenTitleAvatar(true)}
                friendshipStatus={conversation.friendshipStatus}
                targetUserId={conversation.targetUserId ?? -1}
                conversationId={conversationId}
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  ref={(node) => {
                    if (!m.id) return;
                    if (node) messageRefs.current.set(m.id, node);
                    else messageRefs.current.delete(m.id);
                  }}
                  className={[
                    "rounded-xl border p-2 transition-colors",
                    highlightId === m.id ? "reply-flash" : "border-transparent",
                  ].join(" ")}
                >
                  <MessageBubble
                    message={m}
                    userId={user?.id}
                    onReplyClick={(msg) =>
                      setReplyTo({
                        id: msg.id!,
                        senderName: msg.senderNickname,
                        content: msg.content,
                      })
                    }
                    onReplyJump={(replyToId) => scrollToMessage(replyToId)}
                    onDeleteForMe={(messageId) => handleDeleteForMe(messageId)}
                    membersReadMessage={m.membersReadMessage}
                  />
                </div>
              ))}

              <div ref={bottomRef} />
            </div>

            <div className="shrink-0 border-t bg-white p-3">
              <ChatComposer
                value={text}
                onChange={setText}
                onSend={handleSend}
                replyTo={replyTo}
                onCancelReply={() => setReplyTo(null)}
                disabled={!canSend}
                friendshipStatus={conversation.friendshipStatus}
                targetUserId={conversation.targetUserId ?? -1}
                type={conversation.type}
              />
            </div>
          </div>
        )}
      </div>

      <CallModal
        open={callOpen}
        onOpenChange={(v) => {
          if (!v && callState !== "IDLE") hangup(true);
        }}
        name={` ${titleCall ?? ""}`}
        mode={callMode as any}
        onAccept={() => accept()}
        onReject={() => reject()}
        onEnd={() => hangup(true)}
        remoteAudioRef={remoteAudioRef}
      />

      {searchMessageOpen && (
        <div className="absolute top-1 right-1 w-[320px] shrink-0">
          <MessageSearchResults
            openSearch={searchMessageOpen}
            onClose={() => {
              setSearchMessageOpen(false);
            }}
            onSelect={(messageId) => {
              scrollToMessage(messageId);
              setSearchMessageOpen(false);
            }}
            conversationId={conversationId ?? -1}
          />
        </div>
      )}

      <NicknameList
        open={openNickname}
        onOpenChange={setOpenNickname}
        items={
          conversation?.members?.map((member) => ({
            id: member.user?.id ?? 0,
            nickname: member.nickname ?? member.user?.displayName ?? "Chưa có biệt danh",
            displayName: member.user?.displayName,
            avatarUrl: member.user?.avatarUrl,
            conversationId: conversationId ?? -1,
          })) ?? []
        }
      />

      <MembersList
        open={openMembers}
        onOpenChange={setOpenMembers}
        items={
          conversation?.members?.map((member) => ({
            id: member.user?.id ?? 0,
            displayName: member.user?.id === user?.id ? "Bạn" : member.user?.displayName,
            avatarUrl: member.user?.avatarUrl,

            addByDisplayName: member.addByUser?.displayName,
            role: member.role,
          })) ?? []
        }
        conversationId={conversationId ?? -1}
        creatorId={conversation?.creatorId ?? -1}
        role={conversation?.role ?? undefined}
        userId={user?.id}
      />

      <TitleAvatarList
        open={openTitleAvatar}
        onOpenChange={setOpenTitleAvatar}
        item={{
          title: conversation?.title ?? "Cuộc trò chuyện",
          avatarUrl: conversation?.avatarUrl ?? undefined,
          conversationId: conversationId ?? -1,
        }}
      />
    </div>

  );
}