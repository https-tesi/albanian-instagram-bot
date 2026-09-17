import { HandoffReason } from "../services/conversation.service";

export const handoffReasonLabels: Record<HandoffReason, string> = {
  [HandoffReason.HUMAN_REQUESTED]: "Klienti kërkoi të flasë me një person",
  [HandoffReason.AI_UNCERTAIN]: "Asistenti nuk ishte i sigurt për përgjigjen",
  [HandoffReason.ACTION_FAILED]: "Një veprim automatik dështoi",
  [HandoffReason.COMPLAINT]: "Ankesë / problem që kërkon ndërhyrje njerëzore",
  [HandoffReason.USER_RATE_LIMIT]: "Klienti arriti kufirin e mesazheve automatike",
  [HandoffReason.BUSINESS_BUDGET_LIMIT]: "U arrit kufiri i buxhetit të AI"
};
