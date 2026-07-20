import {
  AuthenticationCreds,
  AuthenticationState,
  BufferJSON,
  SignalDataTypeMap,
  initAuthCreds,
} from "@whiskeysockets/baileys";
import { AppDataSource } from "../../data-source";
import { WhatsappSession } from "../../entities/whatsappSession.entity";

const repository = AppDataSource.getRepository(WhatsappSession);

export const useTypeormAuthState = async (
  tenantId: string,
): Promise<{
  state: AuthenticationState;
  saveCreds: () => Promise<void>;
}> => {
  const writeData = async (data: any, id: string) => {
    try {
      const informationToStore = JSON.stringify(data, BufferJSON.replacer);
      const session = new WhatsappSession();
      session.id = id;
      session.tenantId = tenantId;
      session.data = informationToStore;
      await repository.save(session);
    } catch (error) {
      console.log("Error saving WhatsApp session data:", error);
    }
  };

  const readData = async (id: string) => {
    try {
      const data = await repository.findOne({ where: { id, tenantId } });
      if (data && data.data) {
        return JSON.parse(data.data, BufferJSON.reviver);
      }
      return null;
    } catch (error) {
      console.log("Error reading WhatsApp session data:", error);
      return null;
    }
  };

  const removeData = async (id: string) => {
    try {
      await repository.delete({ id, tenantId });
    } catch (error) {
      console.log("Error removing WhatsApp session data:", error);
    }
  };

  const creds: AuthenticationCreds =
    (await readData("creds")) || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data: { [key: string]: SignalDataTypeMap[typeof type] } = {};
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(`${type}-${id}`);
              if (type === "app-state-sync-key" && value) {
                value = Buffer.from(value.b64, "base64");
              }
              if (value) {
                data[id] = value;
              }
            }),
          );
          return data;
        },
        set: async (data) => {
          const tasks: Promise<void>[] = [];
          for (const category of Object.keys(data)) {
            const categoryData = data[category as keyof typeof data];
            if (categoryData) {
              for (const id of Object.keys(categoryData)) {
                const value = categoryData[id as keyof typeof categoryData];
                const key = `${category}-${id}`;
                tasks.push(value ? writeData(value, key) : removeData(key));
              }
            }
          }
          await Promise.all(tasks);
        },
      },
    },
    saveCreds: () => {
      return writeData(creds, "creds");
    },
  };
};
