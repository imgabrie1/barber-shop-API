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

let client: WASocket | null = null;
let isConnected = false;
let isConnecting = false;
let currentQrCode: string | null = null;

const logger = pino({ level: "silent" });

export const getWhatsAppClient = (): WASocket | null => client;
export const isWhatsAppConnected = (): boolean => isConnected;
export const getWhatsAppQrCode = (): string | null => currentQrCode;

export const initWhatsApp = async (forceStart = false): Promise<void> => {
  if (isConnecting || isConnected) return;

  try {
    const repository = AppDataSource.getRepository(WhatsappSession);
    const hasSession = await repository.findOne({ where: { id: "creds" } });

    if (!hasSession && !forceStart) {
      console.log(
        "[WhatsApp] Nenhuma sessão ativa encontrada. Aguardando comando do Frontend para iniciar...",
      );
      return;
    }

    isConnecting = true;
    const { state, saveCreds } = await useTypeormAuthState();
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: state,
      logger,
      printQRInTerminal: false,
      browser: ["BarberShop Bot", "Chrome", "1.0.0"],
    });

    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        currentQrCode = qr;
      }

      if (connection === "close") {
        isConnected = false;
        client = null;
        isConnecting = false;
        currentQrCode = null;

        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        console.log(
          `[WhatsApp] Status: Desconectado. Código: ${statusCode}. Reconectando: ${shouldReconnect}`,
        );

        if (shouldReconnect) {
          setTimeout(() => initWhatsApp(forceStart), 5000);
        } else {
          console.log(
            "[WhatsApp] Sessão encerrada manualmente. Limpando dados...",
          );
          AppDataSource.getRepository(WhatsappSession)
            .clear()
            .then(() => {
              console.log(
                "[WhatsApp] Pronto para uma nova inicialização sob demanda.",
              );
            })
            .catch((err) => {
              console.error("Erro ao limpar sessão do banco:", err);
            });
        }
      }

      if (connection === "open") {
        isConnected = true;
        isConnecting = false;
        currentQrCode = null;
        client = sock;
        console.log(
          "\n✅ [WhatsApp] Conectado com sucesso! Notificações ativadas.\n",
        );
      }
    });

    sock.ev.on("creds.update", saveCreds);
  } catch (error) {
    isConnecting = false;
    console.error("[WhatsApp] Erro ao inicializar:", error);
  }
};
