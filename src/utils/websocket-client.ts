import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080/ws-coordination";

export type StompCallback = (message: IMessage) => void;

export class WebSocketClient {
  private client: Client | null = null;
  private subscriptions: Map<string, StompCallback> = new Map();

  public connect(onConnected?: () => void, onError?: (err: any) => void) {
    if (this.client && this.client.active) {
      if (onConnected) onConnected();
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 3000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (msg) => {
        if (process.env.NODE_ENV === "development") {
          // console.log("[STOMP Debug]", msg);
        }
      },
      onConnect: () => {
        console.log("⚡ STOMP WebSocket connected successfully to:", WS_URL);
        // Resubscribe all topics
        this.subscriptions.forEach((callback, topic) => {
          this.client?.subscribe(topic, callback);
        });
        if (onConnected) onConnected();
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"], frame.body);
        if (onError) onError(frame);
      },
      onWebSocketClose: () => {
        console.warn("WebSocket connection closed, attempting reconnect...");
      },
    });

    this.client.activate();
  }

  public subscribe(topic: string, callback: StompCallback) {
    this.subscriptions.set(topic, callback);

    if (this.client && this.client.connected) {
      return this.client.subscribe(topic, callback);
    }
    return null;
  }

  public disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }

  public isConnected(): boolean {
    return this.client ? this.client.connected : false;
  }
}

export const globalWebSocket = new WebSocketClient();
