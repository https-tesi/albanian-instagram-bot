export interface InstagramWebhookPayload {
  object?: string;
  entry?: InstagramWebhookEntry[];
}

export interface InstagramWebhookEntry {
  id?: string;
  time?: number;
  messaging?: InstagramMessagingEvent[];
}

export interface InstagramMessagingEvent {
  sender?: InstagramUserRef;
  recipient?: InstagramUserRef;
  timestamp?: number;
  message?: InstagramMessage;
}

export interface InstagramUserRef {
  id?: string;
}

export interface InstagramMessage {
  mid?: string;
  text?: string;
  is_echo?: boolean;
}

export interface IncomingInstagramTextMessage {
  senderId: string;
  messageId?: string;
  text: string;
}
