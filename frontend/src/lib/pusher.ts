/**
 * Pusher client configuration for realtime WebSocket connections.
 */
import Pusher from "pusher-js";

let pusherInstance: Pusher | null = null;

export function getPusherClient(): Pusher {
  if (pusherInstance) return pusherInstance;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY || "";
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2";

  if (!key) {
    console.warn(
      "[Pusher] No NEXT_PUBLIC_PUSHER_KEY set — realtime features disabled"
    );
  }

  pusherInstance = new Pusher(key, {
    cluster,
    forceTLS: true,
  });

  return pusherInstance;
}

export function disconnectPusher(): void {
  if (pusherInstance) {
    pusherInstance.disconnect();
    pusherInstance = null;
  }
}
