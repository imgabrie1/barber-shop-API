import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  type WASocket,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import { useTypeormAuthState } from "./useTypeormAuthState";
import { AppDataSource } from "../../data-source";
import { WhatsappSession } from "../../entities/whatsappSession.entity";

interface ClientState {
  client: WASocket | null;
  isConnected: boolean;
  isConnecting: boolean;
  currentQrCode: string | null;
}

const clients = new Map<string, ClientState>();

const logger = pino({ level: "silent" });

const getState = (tenantId: string): ClientState => {
  let state = clients.get(tenantId);
  if (!state) {
    state = { client: null, isConnected: false, isConnecting: false, currentQrCode: null };
    clients.set(tenantId, state);
  }
  return state;
};

export const getWhatsAppClient = (tenantId: string): WASocket | null => {
  return getState(tenantId).client;
};

export const isWhatsAppConnected = (tenantId: string): boolean => {
  return getState(tenantId).isConnected;
};

export const getWhatsAppQrCode = (tenantId: string): string | null => {
  return getState(tenantId).currentQrCode;
};

export const initWhatsApp = async (tenantId: string, forceStart = false): Promise<void> => {
  const state = getState(tenantId);
  if (state.isConnecting || state.isConnected) return;

  try {
    const repository = AppDataSource.getRepository(WhatsappSession);
    const hasSession = await repository.findOne({ where: { id: "creds", tenantId } });

    if (!hasSession && !forceStart) {
      console.log(
        `[WhatsApp][${tenantId}] Nenhuma sessão ativa encontrada. Aguardando comando do Frontend para iniciar...`,
      );
      return;
    }

    state.isConnecting = true;
    const { state: authState, saveCreds } = await useTypeormAuthState(tenantId);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: authState,
      logger,
      printQRInTerminal: false,
      browser: ["BarberShop Bot", "Chrome", "1.0.0"],
    });

    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        state.currentQrCode = qr;
      }

      if (connection === "close") {
        state.isConnected = false;
        state.client = null;
        state.isConnecting = false;
        state.currentQrCode = null;

        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        console.log(
          `[WhatsApp][${tenantId}] Status: Desconectado. Código: ${statusCode}. Reconectando: ${shouldReconnect}`,
        );

        if (shouldReconnect) {
          setTimeout(() => initWhatsApp(tenantId, forceStart), 5000);
        } else {
          console.log(
            `[WhatsApp][${tenantId}] Sessão encerrada manualmente. Limpando dados...`,
          );
          AppDataSource.getRepository(WhatsappSession)
            .createQueryBuilder()
            .delete()
            .from(WhatsappSession)
            .where("tenant_id = :tenantId", { tenantId })
            .execute()
            .then(() => {
              console.log(
                `[WhatsApp][${tenantId}] Pronto para uma nova inicialização sob demanda.`,
              );
            })
            .catch((err) => {
              console.error(`[WhatsApp][${tenantId}] Erro ao limpar sessão do banco:`, err);
            });
        }
      }

      if (connection === "open") {
        state.isConnected = true;
        state.isConnecting = false;
        state.currentQrCode = null;
        state.client = sock;
        console.log(
          `\n✅ [WhatsApp][${tenantId}] Conectado com sucesso! Notificações ativadas.\n`,
        );
      }
    });

    sock.ev.on("creds.update", saveCreds);
  } catch (error) {
    state.isConnecting = false;
    console.error(`[WhatsApp][${tenantId}] Erro ao inicializar:`, error);
  }
};
