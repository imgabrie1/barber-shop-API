import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  type WASocket,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal";
import pino from "pino";
import path from "path";

const AUTH_FOLDER = path.resolve(__dirname, "../../../.whatsapp_session");

let client: WASocket | null = null;
let isConnected = false;
let isConnecting = false;

const logger = pino({ level: "silent" });

export const getWhatsAppClient = (): WASocket | null => client;
export const isWhatsAppConnected = (): boolean => isConnected;

export const initWhatsApp = async (): Promise<void> => {
  if (isConnecting || isConnected) return;
  isConnecting = true;

  try {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
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
        console.log("\n========================================");
        console.log("  ESCANEIE O QR CODE ABAIXO COM SEU WHATSAPP");
        console.log("  (Configurações > Dispositivos conectados)");
        console.log("========================================\n");
        qrcode.generate(qr, { small: true });
      }

      if (connection === "close") {
        isConnected = false;
        client = null;
        isConnecting = false;

        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        console.log(`[WhatsApp] Desconectado. Código: ${statusCode}. Reconectando: ${shouldReconnect}`);

        if (shouldReconnect) {
          setTimeout(() => initWhatsApp(), 5000);
        } else {
          console.log("[WhatsApp] Sessão encerrada. Delete a pasta .whatsapp_session e reinicie.");
        }
      }

      if (connection === "open") {
        isConnected = true;
        isConnecting = false;
        client = sock;
        console.log("\n✅ [WhatsApp] Conectado com sucesso! Notificações ativadas.\n");
      }
    });

    sock.ev.on("creds.update", saveCreds);
  } catch (error) {
    isConnecting = false;
    console.error("[WhatsApp] Erro ao inicializar:", error);
  }
};
