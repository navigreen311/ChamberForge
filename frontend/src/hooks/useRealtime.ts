/**
 * Realtime hooks — subscribe to Pusher channels and events with auto-cleanup.
 */
"use client";

import { useEffect, useRef, useState } from "react";
import type { Channel } from "pusher-js";
import {
  getPusherClient,
  getConnectionState,
  type ConnectionState,
} from "@/lib/pusher";

/* ------------------------------------------------------------------ */
/*  useConnectionStatus                                                */
/* ------------------------------------------------------------------ */

export function useConnectionStatus(): ConnectionState {
  const [status, setStatus] = useState<ConnectionState>(() =>
    getConnectionState()
  );

  useEffect(() => {
    const client = getPusherClient();
    if (!client) {
      setStatus("disabled");
      return;
    }

    function onChange(states: { current: string }) {
      setStatus(states.current as ConnectionState);
    }

    client.connection.bind("state_change", onChange);
    // sync initial
    setStatus(client.connection.state as ConnectionState);

    return () => {
      client.connection.unbind("state_change", onChange);
    };
  }, []);

  return status;
}

/* ------------------------------------------------------------------ */
/*  useChannel                                                         */
/* ------------------------------------------------------------------ */

export function useChannel(channelName: string | null): Channel | null {
  const channelRef = useRef<Channel | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);

  useEffect(() => {
    if (!channelName) return;

    const client = getPusherClient();
    if (!client) return;

    const ch = client.subscribe(channelName);
    channelRef.current = ch;
    setChannel(ch);

    return () => {
      client.unsubscribe(channelName);
      channelRef.current = null;
      setChannel(null);
    };
  }, [channelName]);

  return channel;
}

/* ------------------------------------------------------------------ */
/*  useEvent                                                           */
/* ------------------------------------------------------------------ */

export function useEvent<T = unknown>(
  channel: Channel | null,
  eventName: string,
  callback: (data: T) => void
): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!channel) return;

    function handler(data: T) {
      callbackRef.current(data);
    }

    channel.bind(eventName, handler);
    return () => {
      channel.unbind(eventName, handler);
    };
  }, [channel, eventName]);
}

/* ------------------------------------------------------------------ */
/*  Domain-specific channel hooks                                      */
/* ------------------------------------------------------------------ */

export function useWorkspaceEvents(workspaceId: string | null): Channel | null {
  return useChannel(workspaceId ? `workspace-${workspaceId}` : null);
}

export function useUserEvents(userId: string | null): Channel | null {
  return useChannel(userId ? `private-user-${userId}` : null);
}

export function useCrisisChannel(workspaceId: string | null): Channel | null {
  return useChannel(workspaceId ? `crisis-${workspaceId}` : null);
}

/* ------------------------------------------------------------------ */
/*  Legacy export — keep backward compat                               */
/* ------------------------------------------------------------------ */

export interface RealtimeNotification {
  id: string;
  type: "info" | "warning" | "critical" | "crisis";
  title: string;
  body: string;
  action_url?: string;
}
