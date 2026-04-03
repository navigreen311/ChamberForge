/**
 * Pusher client — singleton with graceful no-op when key is missing.
 */
import Pusher from "pusher-js";

let pusherInstance: Pusher | null = null;
let keyMissing = false;

export function getPusherClient(): Pusher | null {
  if (keyMissing) return null;
  if (pusherInstance) return pusherInstance;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY || "";
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2";

  if (!key) {
    console.warn(
      "[Pusher] No NEXT_PUBLIC_PUSHER_KEY set — realtime features disabled"
    );
    keyMissing = true;
    return null;
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

export type ConnectionState =
  | "initialized"
  | "connecting"
  | "connected"
  | "unavailable"
  | "failed"
  | "disconnected"
  | "disabled";

/**
 * Returns current Pusher connection state, or 'disabled' when no key is set.
 */
export function getConnectionState(): ConnectionState {
  const client = getPusherClient();
  if (!client) return "disabled";
  return client.connection.state as ConnectionState;
}
