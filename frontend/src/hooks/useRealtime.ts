/**
 * Hook for subscribing to Pusher realtime channels and handling events.
 */
"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { Channel } from "pusher-js";
import { getPusherClient } from "@/lib/pusher";

export interface RealtimeNotification {
  id: string;
  type: "info" | "warning" | "critical" | "crisis";
  title: string;
  body: string;
  action_url?: string;
}

interface UseRealtimeOptions {
  workspaceId: string;
  userId: string;
  onNotification?: (notification: RealtimeNotification) => void;
  onCrisis?: (incident: Record<string, unknown>) => void;
}

export function useRealtime({
  workspaceId,
  userId,
  onNotification,
  onCrisis,
}: UseRealtimeOptions) {
  const channelsRef = useRef<Channel[]>([]);
  const [connected, setConnected] = useState(false);

  const subscribe = useCallback(() => {
    const pusher = getPusherClient();

    // Workspace channel
    const wsChannel = pusher.subscribe(`workspace-${workspaceId}`);
    wsChannel.bind("notification", (data: RealtimeNotification) => {
      onNotification?.(data);
    });

    // User private channel
    const userChannel = pusher.subscribe(`private-user-${userId}`);
    userChannel.bind("notification", (data: RealtimeNotification) => {
      onNotification?.(data);
    });

    // Crisis channel
    const crisisChannel = pusher.subscribe(`crisis-${workspaceId}`);
    crisisChannel.bind("crisis-alert", (data: { incident: Record<string, unknown> }) => {
      onCrisis?.(data.incident);
    });

    channelsRef.current = [wsChannel, userChannel, crisisChannel];
    setConnected(true);
  }, [workspaceId, userId, onNotification, onCrisis]);

  const unsubscribe = useCallback(() => {
    const pusher = getPusherClient();
    pusher.unsubscribe(`workspace-${workspaceId}`);
    pusher.unsubscribe(`private-user-${userId}`);
    pusher.unsubscribe(`crisis-${workspaceId}`);
    channelsRef.current = [];
    setConnected(false);
  }, [workspaceId, userId]);

  useEffect(() => {
    subscribe();
    return () => unsubscribe();
  }, [subscribe, unsubscribe]);

  return { connected, unsubscribe };
}
