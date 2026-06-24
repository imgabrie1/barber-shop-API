import { getWhatsAppClient, isWhatsAppConnected } from "./whatsapp.client";
import { formatDateTimeInTimeZone, APP_TIME_ZONE } from "../../utils/timezone";

const normalizePhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("55")) return digits;

  return `55${digits}`;
};

const sendMessage = async (phone: string, message: string): Promise<void> => {
  if (!isWhatsAppConnected()) {
    console.warn("[WhatsApp] Notificação ignorada: cliente não conectado.");
    return;
  }

  const client = getWhatsAppClient();
  if (!client) return;

  try {
    const normalized = normalizePhone(phone);

    const results = await client.onWhatsApp(normalized);
    const result = results?.[0];

    if (!result?.exists) {
      console.warn(`[WhatsApp] ⚠️ Número ${phone} não encontrado no WhatsApp.`);
      return;
    }

    await client.sendMessage(result.jid, { text: message });
    console.log(`[WhatsApp] ✅ Mensagem enviada para ${phone} → JID: ${result.jid}`);
  } catch (error) {
    console.error(`[WhatsApp] ❌ Erro ao enviar mensagem para ${phone}:`, error);
  }
};


// ─────────────────────────────────── Templates de Notificação ────────────────────────────────────────

/**
 * envia notificação imediata após agendamento criado pelo cliente.
 */
export const notifyAppointmentCreated = async (params: {
  clientPhone: string;
  clientName: string;
  barberName: string;
  shopName: string;
  startTime: Date;
  services: string[];
}): Promise<void> => {
  const { clientPhone, clientName, barberName, shopName, startTime, services } = params;

  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    timeZone: APP_TIME_ZONE,
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(startTime);

  const formattedTime = formatDateTimeInTimeZone(startTime, APP_TIME_ZONE).slice(11, 16);

  const serviceList = services.join(", ");

  const message =
    `✅ *Agendamento criado com sucesso!*\n\n` +
    `Olá, *${clientName}*! Seu agendamento foi registrado com sucesso.\n\n` +
    `Aguardando confirmação do(a) *${barberName}*.\n\n` +
    `💈 *Serviço(s):* ${serviceList}\n` +
    `👤 *Profissional:* ${barberName}\n` +
    `📍 *Unidade:* ${shopName}\n` +
    `📅 *Data:* ${formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}\n` +
    `⏰ *Horário:* ${formattedTime}\n\n` +
    `_Se precisar cancelar, faça isso com antecedência pelo site. Até lá!_ 🙌`;

  await sendMessage(clientPhone, message);
};

/**
 * envia lembrete antes do horário agendado (usado pelo cron job).
 */
export const notifyAppointmentReminder = async (params: {
  clientPhone: string;
  clientName: string;
  barberName: string;
  shopName: string;
  startTime: Date;
}): Promise<void> => {
  const { clientPhone, clientName, barberName, shopName, startTime } = params;

  const formattedTime = formatDateTimeInTimeZone(startTime, APP_TIME_ZONE).slice(11, 16);

  const message =
    `⏰ *Lembrete de agendamento!*\n\n` +
    `Fala, *${clientName}*! Passando pra lembrar que você tem horário hoje às *${formattedTime}* com o *${barberName}* na unidade *${shopName}*.\n\n` +
    `_Não se esqueça! Se não puder comparecer, avise o quanto antes pelo site._ 🙏`;

  await sendMessage(clientPhone, message);
};

/**
 * avisa o cliente quando o barbeiro cancela/rejeita o agendamento.
 */
export const notifyAppointmentCancelled = async (params: {
  clientPhone: string;
  clientName: string;
  shopName: string;
  startTime: Date;
}): Promise<void> => {
  const { clientPhone, clientName, shopName, startTime } = params;

  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    timeZone: APP_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
  }).format(startTime);

  const formattedTime = formatDateTimeInTimeZone(startTime, APP_TIME_ZONE).slice(11, 16);

  const message =
    `❌ *Agendamento cancelado*\n\n` +
    `Olá, *${clientName}*. Infelizmente o seu agendamento do dia *${formattedDate}* às *${formattedTime}* na unidade *${shopName}* foi cancelado.\n\n` +
    `_Que tal agendar um novo horário pelo site?_ 💈`;

  await sendMessage(clientPhone, message);
};


/**
 * avisa o cliente quando o agendamento é confirmado pelo barbeiro/sistema.
 */
export const notifyAppointmentConfirmed = async (params: {
  clientPhone: string;
  clientName: string;
  barberName: string;
  shopName: string;
  startTime: Date;
}): Promise<void> => {
  const { clientPhone, clientName, barberName, shopName, startTime } = params;

  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    timeZone: APP_TIME_ZONE,
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(startTime);

  const formattedTime = formatDateTimeInTimeZone(startTime, APP_TIME_ZONE).slice(11, 16);

  const message =
    `✨ *Agendamento Confirmado!*\n\n` +
    `Olá, *${clientName}*! Seu horário foi confirmado pelo(a) *${shopName}*.\n\n` +
    `👤 *Profissional:* ${barberName}\n` +
    `📍 *Unidade:* ${shopName}\n` +
    `📅 *Data:* ${formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}\n` +
    `⏰ *Horário:* ${formattedTime}\n\n` +
    `_Tudo pronto para te receber! Se houver algum imprevisto, avise com antecedência pelo site._ 💈🤙`;

  await sendMessage(clientPhone, message);
};
