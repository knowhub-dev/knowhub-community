"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import type {
  CollaborationEvent,
  CollaborationParticipant,
  CollaborationSession,
  User,
} from "@/types";
import { Activity, Loader2, Save, Users } from "lucide-react";
import clsx from "clsx";

interface PostCollaborationPanelProps {
  postSlug: string;
  postOwnerId: number;
  initialContent: string;
}

type SyncState = "idle" | "saving" | "saved" | "error";

export default function PostCollaborationPanel({
  postSlug,
  postOwnerId,
  initialContent,
}: PostCollaborationPanelProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [session, setSession] = useState<CollaborationSession | null>(null);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState(initialContent);
  const [lastSyncedContent, setLastSyncedContent] = useState(initialContent);
  const [events, setEvents] = useState<CollaborationEvent[]>([]);
  const [syncState, setSyncState] = useState<SyncState>("idle");

  const mountedRef = useRef(true);
  const joinedRef = useRef(false);
  const currentUserIdRef = useRef<number | null>(null);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const syncStatusResetRef = useRef<NodeJS.Timeout | null>(null);
  const lastEventIdRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      stopRealtime();
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      if (syncStatusResetRef.current) {
        clearTimeout(syncStatusResetRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    currentUserIdRef.current = currentUser?.id ?? null;
  }, [currentUser?.id]);

  useEffect(() => {
    joinedRef.current = joined;
  }, [joined]);

  useEffect(() => {
    async function loadMe() {
      try {
        const res = await api.get("/profile/me");
        if (!mountedRef.current) return;
        const payload = res.data as { data?: User } | User;
        const userData = (payload as any)?.data ?? payload;
        setCurrentUser(userData as User);
      } catch (err: any) {
        if (err?.response?.status !== 401) {
          const message = err?.response?.data?.message ?? err?.message ?? "Profilni yuklashda xatolik";
          setError(message);
        }
      } finally {
        if (mountedRef.current) {
          setAuthChecked(true);
        }
      }
    }

    loadMe();
  }, []);

  useEffect(() => {
    if (!authChecked) return;

    if (!currentUser) {
      setLoading(false);
      stopRealtime();
      setSession(null);
      setJoined(false);
      setContent(initialContent);
      setLastSyncedContent(initialContent);
      setEvents([]);
      lastEventIdRef.current = null;
      return;
    }

    fetchActiveSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, currentUser?.id]);

  useEffect(() => {
    if (!joined || !session || session.status !== "active") return;

    if (content === lastSyncedContent) {
      return;
    }

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      if (!session || !joinedRef.current) return;
      setSyncState("saving");
      try {
        await api.post(`/collaborations/${session.id}/events`, {
          type: "content.sync",
          payload: { content },
        });
        if (!mountedRef.current) return;
        setLastSyncedContent(content);
        setSyncState("saved");
        if (syncStatusResetRef.current) {
          clearTimeout(syncStatusResetRef.current);
        }
        syncStatusResetRef.current = setTimeout(() => {
          if (mountedRef.current) {
            setSyncState("idle");
          }
        }, 1500);
      } catch (err: any) {
        if (!mountedRef.current) return;
        const message = err?.response?.data?.message ?? err?.message ?? "Sinxronlash jarayonida xatolik";
        setError(message);
        setSyncState("error");
      }
    }, 800);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, joined, session?.id]);

  useEffect(() => {
    if (session?.status !== "active") {
      stopRealtime();
      if (session && session.status === "ended") {
        setJoined(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.status]);

  const participantMap = useMemo(() => {
    const map = new Map<number, CollaborationParticipant>();
    session?.participants.forEach((participant) => {
      map.set(participant.user_id, participant);
    });
    return map;
  }, [session?.participants]);

  async function fetchActiveSession() {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const wasJoined = joinedRef.current;
      const res = await api.get<CollaborationSession>(`/posts/${postSlug}/collaborations/active`);
      if (!mountedRef.current) return;
      const sessionData = res.data;
      setSession(sessionData);
      const isParticipant = sessionData.participants.some((p) => p.user_id === currentUser.id);
      if (isParticipant) {
        if (!wasJoined) {
          setContent(sessionData.content_snapshot ?? initialContent);
          setLastSyncedContent(sessionData.content_snapshot ?? initialContent);
          setEvents([]);
          lastEventIdRef.current = null;
        }
        startRealtime(sessionData.id);
      } else {
        stopRealtime();
      }
      setJoined(isParticipant);
    } catch (err: any) {
      if (!mountedRef.current) return;
      if (err?.response?.status === 404) {
        setSession(null);
        setJoined(false);
        setContent(initialContent);
        setLastSyncedContent(initialContent);
        setEvents([]);
        lastEventIdRef.current = null;
        stopRealtime();
      } else {
        const message = err?.response?.data?.message ?? err?.message ?? "Hamkorlik sessiyasini yuklab bo'lmadi";
        setError(message);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }

  function stopRealtime() {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }

  function startRealtime(sessionId: number) {
    stopRealtime();
    scheduleHeartbeat(sessionId);
    schedulePolling(sessionId);
  }

  function scheduleHeartbeat(sessionId: number) {
    heartbeatIntervalRef.current = setInterval(async () => {
      try {
        await api.post(`/collaborations/${sessionId}/heartbeat`);
      } catch (err: any) {
        if (err?.response?.status === 404 || err?.response?.status === 409) {
          stopRealtime();
          setJoined(false);
          if (err?.response?.status === 404) {
            setSession(null);
          } else {
            setSession((prev) =>
              prev
                ? {
                    ...prev,
                    status: "ended",
                    ended_at: prev.ended_at ?? new Date().toISOString(),
                  }
                : prev
            );
          }
        }
      }
    }, 20000);
  }

  function schedulePolling(sessionId: number) {
    const poll = async () => {
      if (!mountedRef.current) return;
      let shouldContinue = true;
      try {
        const res = await api.get<CollaborationEvent[]>(`/collaborations/${sessionId}/events`, {
          params: lastEventIdRef.current ? { after_id: lastEventIdRef.current } : undefined,
        });
        if (!mountedRef.current) return;
        const data = Array.isArray(res.data) ? res.data : [];
        if (data.length > 0) {
          lastEventIdRef.current = data[data.length - 1].id;
          setEvents((prev) => {
            const merged = [...prev, ...data];
            return merged.slice(-50);
          });
          data.forEach((event) => {
            if (event.type === "content.sync" && event.payload?.content !== undefined) {
              if (currentUserIdRef.current === null || event.user_id !== currentUserIdRef.current) {
                setContent(event.payload.content);
                setLastSyncedContent(event.payload.content);
              }
            }
          });
        }
      } catch (err: any) {
        if (!mountedRef.current) return;
        if (err?.response?.status === 404) {
          shouldContinue = false;
          stopRealtime();
          setSession(null);
          setJoined(false);
        }
      } finally {
        if (!mountedRef.current) return;
        if (shouldContinue) {
          pollTimeoutRef.current = setTimeout(poll, 2500);
        }
      }
    };

    poll();
  }

  const isOwner = currentUser?.id === postOwnerId;

  async function handleStartSession() {
    if (!currentUser) {
      setError("Sessiyani boshlash uchun tizimga kiring");
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      const res = await api.post<CollaborationSession>(`/posts/${postSlug}/collaborations`);
      if (!mountedRef.current) return;
      const sessionData = res.data;
      setSession(sessionData);
      setJoined(true);
      setContent(sessionData.content_snapshot ?? initialContent);
      setLastSyncedContent(sessionData.content_snapshot ?? initialContent);
      setEvents([]);
      lastEventIdRef.current = null;
      startRealtime(sessionData.id);
    } catch (err: any) {
      if (!mountedRef.current) return;
      const message = err?.response?.data?.message ?? err?.message ?? "Sessiyani boshlashda xatolik";
      setError(message);
    } finally {
      if (mountedRef.current) {
        setActionLoading(false);
      }
    }
  }

  async function handleJoinSession() {
    if (!currentUser || !session) {
      setError("Sessiyaga qo'shilish uchun tizimga kiring");
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      const res = await api.post<CollaborationSession>(`/collaborations/${session.id}/join`, {
        role: "editor",
      });
      if (!mountedRef.current) return;
      const sessionData = res.data;
      setSession(sessionData);
      setJoined(true);
      setContent(sessionData.content_snapshot ?? initialContent);
      setLastSyncedContent(sessionData.content_snapshot ?? initialContent);
      setEvents([]);
      lastEventIdRef.current = null;
      startRealtime(sessionData.id);
    } catch (err: any) {
      if (!mountedRef.current) return;
      const message = err?.response?.data?.message ?? err?.message ?? "Sessiyaga qo'shilish muvaffaqiyatsiz";
      setError(message);
    } finally {
      if (mountedRef.current) {
        setActionLoading(false);
      }
    }
  }

  const participantCount = session?.participants.length ?? 0;
  const syncStatusLabel = {
    idle: "Sinxronlashishga tayyor",
    saving: "O'zgarishlar yuborilmoqda…",
    saved: "Hammasi sinxronlandi",
    error: "Sinxronlashda xatolik",
  }[syncState];

  return (
    <div className="mt-10 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Hamkorlikdagi tahrirlash</h2>
          <p className="text-sm text-gray-500">Real vaqt rejimida post ustida ishlash uchun sessiyani ishga tushiring.</p>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Users className="w-4 h-4 mr-2" />
          {participantCount} ishtirokchi
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Sessiya ma'lumotlari yuklanmoqda…
          </div>
        ) : !currentUser ? (
          <div className="rounded-md border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-700">
            Hamkorlik funksiyasidan foydalanish uchun tizimga kiring.
          </div>
        ) : session ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {session.participants.map((participant) => {
                  const name = participant.user?.name ?? `Foydalanuvchi #${participant.user_id}`;
                  return (
                    <span
                      key={participant.id}
                      className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700"
                    >
                      {name}
                      {participant.user_id === currentUser?.id && <span className="ml-2 text-xs text-indigo-600">(siz)</span>}
                    </span>
                  );
                })}
              </div>
              {session.status === "active" ? (
                joined ? (
                  <span className="inline-flex items-center text-sm text-green-600">
                    <Activity className="w-4 h-4 mr-1" /> Ulanib turibdi
                  </span>
                ) : (
                  <button
                    onClick={handleJoinSession}
                    disabled={actionLoading}
                    className="inline-flex items-center rounded-md border border-indigo-200 bg-white px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Qo'shilmoqda…
                      </>
                    ) : (
                      "Sessiyaga qo'shilish"
                    )}
                  </button>
                )
              ) : (
                <span className="text-sm text-gray-500">Sessiya yakunlangan</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Post kontenti</label>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                disabled={!joined || session.status !== "active"}
                className="w-full min-h-[220px] rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
              />
              <div className="mt-2 flex items-center text-xs text-gray-500">
                <Save className="w-4 h-4 mr-2" />
                <span className={clsx({ "text-green-600": syncState === "saved", "text-red-600": syncState === "error" })}>
                  {syncStatusLabel}
                </span>
              </div>
            </div>

            {events.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Oxirgi faoliyat</h3>
                <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {events
                    .slice()
                    .reverse()
                    .map((event) => {
                      const participant = participantMap.get(event.user_id);
                      const actorName = participant?.user?.name ?? `Foydalanuvchi #${event.user_id}`;
                      const description = describeEvent(event);
                      return (
                        <li key={event.id} className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{actorName}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(event.created_at).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <div className="mt-1 text-gray-600">{description}</div>
                        </li>
                      );
                    })}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-md border border-dashed border-indigo-200 bg-indigo-50 px-4 py-6">
            <div>
              <p className="font-medium text-indigo-700">Faol sessiya mavjud emas.</p>
              <p className="text-sm text-indigo-600">Hamkorlikni boshlash uchun sessiya yarating.</p>
            </div>
            {isOwner ? (
              <button
                onClick={handleStartSession}
                disabled={actionLoading}
                className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Sessiyani boshlash
              </button>
            ) : (
              <span className="text-sm text-gray-500">Sessiya hali yaratilmagan.</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function describeEvent(event: CollaborationEvent) {
  if (event.type === "content.sync") {
    return "Kontent yangilandi";
  }
  if (event.type === "participant.joined" && event.payload?.name) {
    return `${event.payload.name} sessiyaga qo'shildi`;
  }
  return event.type;
}
