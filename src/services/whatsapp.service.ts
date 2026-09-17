import axios, { AxiosError } from "axios";
import { logger } from "../utils/logger";

interface MetaWhatsappError { error?: { message?: string; type?: string; code?: number }; }
export type HttpPost = (url: string, body: unknown, config: { headers: Record<string, string> }) => Promise<unknown>;

export class WhatsAppCloudApiClient {
  constructor(private readonly apiVersion: string, private readonly phoneNumberId: string, private readonly accessToken: string, private readonly post: HttpPost = axios.post) {}
  async sendTextMessage(recipientPhone: string, text: string): Promise<void> {
    try {
      await this.post(`https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`, { messaging_product: "whatsapp", to: recipientPhone, type: "text", text: { body: text } }, { headers: { Authorization: `Bearer ${this.accessToken}`, "Content-Type": "application/json" } });
    } catch (error) {
      const axiosError = error as AxiosError<MetaWhatsappError>;
      const apiError = axiosError.response?.data?.error;
      logger.error("Failed to send WhatsApp handoff notification", { status: axiosError.response?.status, message: apiError?.message ?? axiosError.message, type: apiError?.type, code: apiError?.code });
      throw new Error("WhatsApp notification delivery failed");
    }
  }
}
