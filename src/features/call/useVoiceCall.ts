import { http } from "@/lib/http";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type WsEnvelope = { event: string; data?: any };

type UseVoiceCallParams = {
    userId?: number;
    defaultPeerId?: number;
    conversationId?: number;
    sendRaw: (data: any) => void;
    subscribeRaw: (fn: (raw: string) => void) => void;
    callId?: number;
    callerId?: number;
};

export function useVoiceCall({
    userId,
    defaultPeerId,
    conversationId,
    sendRaw,
    subscribeRaw,
    callId,
    callerId
}: UseVoiceCallParams) {
    const [callState, setCallState] = useState<
        "IDLE" | "INCOMING" | "CALLING" | "ACCEPTING" | "ONGOING" | "REJECTED" | "ENDED"
    >("IDLE");

    const pcRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

    const incomingOfferRef = useRef<any>(null);
    // const callIdRef = useRef<number | null>(conversationId ?? null);

    const [runtimePeerId, setRuntimePeerId] = useState<number | undefined>(defaultPeerId);
    // const [callId, setCallId] = useState<number | null>(null);

    useEffect(() => {
        if (defaultPeerId) setRuntimePeerId(defaultPeerId);
    }, [defaultPeerId]);

    const rtcConfig: RTCConfiguration = useMemo(
        () => ({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun1.l.google.com:19302" },
            ],
        }),
        []
    );

    const wsSend = useCallback(
        (event: string, toUserId: number, data: any) => {
            sendRaw({
                event,
                toUserId,
                data,
            });
        },
        [sendRaw]
    );

    const ensurePC = useCallback(async () => {
        if (pcRef.current) return pcRef.current;

        const pc = new RTCPeerConnection(rtcConfig);

        pc.onicecandidate = (ev) => {
            if (ev.candidate && runtimePeerId) {
                wsSend("ICE_CANDIDATE", runtimePeerId, {
                    callId: callId,
                    candidate: ev.candidate.candidate,
                    sdpMid: ev.candidate.sdpMid,
                    sdpMLineIndex: ev.candidate.sdpMLineIndex,
                });
            }
        };

        pc.ontrack = async (ev) => {

            const audio = remoteAudioRef.current;
            if (!audio) return;

            const stream = new MediaStream();
            stream.addTrack(ev.track);

            audio.srcObject = stream;

            try {
                await audio.play();
            } catch { }
        };

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === "connected") {
                setCallState("ONGOING");
            }
        };

        pcRef.current = pc;
        return pc;
    }, [runtimePeerId, rtcConfig, wsSend]);

    const enableMic = useCallback(async () => {
        if (localStreamRef.current) return;

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
        });

        localStreamRef.current = stream;

        const pc = await ensurePC();

        for (const track of stream.getTracks()) {
            const exists = pc.getSenders().some((s) => s.track?.id === track.id);
            if (!exists) pc.addTrack(track, stream);
        }
    }, [ensurePC]);

    const cleanup = () => {
        pcRef.current?.close();
        pcRef.current = null;
    };

    const hangup = useCallback(
        (notify = true) => {
            if (notify && runtimePeerId && callId) {
                wsSend("CALL_HANGUP", runtimePeerId, { callId: callId });
            }
            
            cleanup();
            setCallState("ENDED");
        },
        [runtimePeerId, wsSend, callId]
    );

    const onWsMessage = useCallback(
        async (raw: string) => {


            let msg: WsEnvelope;

            try {
                msg = JSON.parse(raw);
            } catch {
                return;
            }

            const event = msg.event;
            const payload = msg?.data?.data ?? msg.data;



            if (event === "RTC_OFFER") {
                const fromUserId = msg?.data?.fromUserId ?? payload?.fromUserId;

                if (fromUserId) setRuntimePeerId(Number(fromUserId));

                incomingOfferRef.current = payload;
                // callId = payload.callId;
                setCallState("INCOMING");


                return;
            }

            if (event === "RTC_ANSWER") {
                const pc = await ensurePC();
                await pc.setRemoteDescription({ type: "answer", sdp: payload.sdp });
                return;
            }

            if (event === "ICE_CANDIDATE") {
                const pc = await ensurePC();

                if (payload.candidate) {
                    await pc.addIceCandidate({
                        candidate: payload.candidate,
                        sdpMid: payload.sdpMid,
                        sdpMLineIndex: payload.sdpMLineIndex,
                    });
                }
                return;
            }

            if (event === "CALL_HANGUP") {
                http.post(`/calls/${callId}/end`);
                hangup(false);
                return;
            }

            if (event === "CALL_REJECT") {
                setCallState("REJECTED");
                cleanup();
                return;
            }
        },
        [ensurePC, hangup]
    );

    useEffect(() => {
        const unsub = subscribeRaw(onWsMessage);
        return unsub;
    }, [subscribeRaw, onWsMessage]);

    const startCall = useCallback(async () => {
        if (!runtimePeerId || !userId) return;

        await http.post("/calls", {
            callerId: userId,
            receiverId: runtimePeerId,
            conversationId: conversationId
        }).then((res) => {
            callId = res.data.callId;
        });

        await enableMic();

        const pc = await ensurePC();

        setCallState("CALLING");

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        wsSend("RTC_OFFER", runtimePeerId, {
            callId: callId,
            sdp: offer.sdp,
        });
    }, [enableMic, ensurePC, runtimePeerId, wsSend]);

    const accept = useCallback(async () => {
        const offer = incomingOfferRef.current;
        if (!offer || !runtimePeerId) return;

        await enableMic();

        const pc = await ensurePC();

        await pc.setRemoteDescription({
            type: "offer",
            sdp: offer.sdp,
        });

        if (userId !== offer.callerId) {
            http.post(`/calls/${callId}/accept`, { userId: userId });
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        wsSend("RTC_ANSWER", runtimePeerId, {
            callId: offer.callId,
            sdp: answer.sdp,
        });

        incomingOfferRef.current = null;
    }, [enableMic, ensurePC, runtimePeerId, wsSend, callId]);

    const reject = useCallback(() => {
        if (!runtimePeerId) return;

        const offer = incomingOfferRef.current;

        wsSend("CALL_REJECT", runtimePeerId, {
            callId: offer?.callId,
        });

        incomingOfferRef.current = null;
        setCallState("IDLE");
    }, [runtimePeerId, wsSend]);

    return {
        callState,
        startCall,
        accept,
        reject,
        hangup,
        remoteAudioRef,
        runtimePeerId,
    };
}