import { createContext } from "react";
import { tryRequest } from "@/config";
import { MessagesContext } from "./messages";
import { NotificationsContext } from "./notifications";
import type { ContextProviderProps } from "@/types";
import { createContextHook } from "@/hooks/createContextHook";
import { CatClientContext } from "./apiClientProvider";

interface MemoryContextType {
  wipeConversation: () => Promise<boolean>;
}

export const MemoryContext = createContext<MemoryContextType | undefined>(
  undefined
);

export const MemoryProvider = ({ children }: ContextProviderProps) => {
  const useMessages = createContextHook(MessagesContext, "Messages");
  const useNotifications = createContextHook(
    NotificationsContext,
    "Notifications"
  );
  const useApiClient = createContextHook(CatClientContext, "CatClient");
  const { client: apiClient } = useApiClient();

  const { currentState: messagesState } = useMessages();
  const { sendNotificationFromJSON } = useNotifications();

  const wipeConversation = async () => {
    const result = await tryRequest(
      apiClient?.api?.memory.wipeConversationHistory(),
      "The current conversation was wiped",
      "Unable to wipe the in-memory current conversation"
    );

    if (result.status === "success") {
      messagesState.messages = [];
    }

    return sendNotificationFromJSON(result);
  };

  return (
    <MemoryContext.Provider value={{ wipeConversation }}>
      {children}
    </MemoryContext.Provider>
  );
};
