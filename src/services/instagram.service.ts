import axios, { AxiosError } from "axios";

import { env } from "../config/env";
import { logger } from "../utils/logger";

interface MetaApiErrorResponse {
  error?: {
    message?: string;
    type?: string;
    code?: number;
    fbtrace_id?: string;
  };
}

const getMessagingApiUrl = (): string => {
  return `https://graph.instagram.com/${env.metaApiVersion}/${env.instagramAccountId}/messages`;
};

export const instagramService = {
  async sendTextMessage(recipientId: string, text: string): Promise<void> {
    try {
      await axios.post(
        getMessagingApiUrl(),
        {
          recipient: {
            id: recipientId
          },
          message: {
            text
          }
        },
        {
          headers: {
            Authorization: `Bearer ${env.instagramAccessToken}`,
            "Content-Type": "application/json"
          }
        }
      );
    } catch (error) {
      const axiosError = error as AxiosError<MetaApiErrorResponse>;
      const metaError = axiosError.response?.data?.error;

      logger.error("Failed to send Instagram message", {
        status: axiosError.response?.status,
        message: metaError?.message ?? axiosError.message,
        type: metaError?.type,
        code: metaError?.code,
        fbtraceId: metaError?.fbtrace_id
      });

      throw new Error("Instagram message delivery failed");
    }
  }
};
