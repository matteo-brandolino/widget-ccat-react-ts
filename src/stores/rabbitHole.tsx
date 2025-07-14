import { createContext, useState, ReactNode } from "react";
import type { FileUploaderState } from "@stores/types";
import { tryRequest } from "@/config";
import { createContextHook } from "@/hooks/createContextHook";
import { NotificationsContext } from "./notifications";
import { CatClientContext } from "./apiClientProvider";

interface RabbitHoleContextType {
  currentState: FileUploaderState;
  sendFile: (file: File) => void;
  sendMemory: (file: File) => void;
  sendWebsite: (url: string) => void;
}

export const RabbitHoleContext = createContext<
  RabbitHoleContextType | undefined
>(undefined);

export const RabbitHoleProvider = ({ children }: { children: ReactNode }) => {
  const [currentState, setCurrentState] = useState<FileUploaderState>({
    loading: false,
  });
  const useNotifications = createContextHook(
    NotificationsContext,
    "Notifications"
  );
  const useApiClient = createContextHook(CatClientContext, "CatClient");
  const { sendNotificationFromJSON } = useNotifications();
  const { client: apiClient } = useApiClient();

  const sendFile = (file: File) => {
    setCurrentState({ loading: true });
    tryRequest(
      apiClient?.api?.rabbitHole.uploadFile({ file }),
      `File ${file.name} successfully sent down the rabbit hole!`,
      "Unable to send the file to the rabbit hole"
    ).then((res) => {
      setCurrentState({ loading: false, data: res.data });
      sendNotificationFromJSON(res);
    });
  };

  const sendMemory = (file: File) => {
    setCurrentState({ loading: true });
    tryRequest(
      apiClient?.api?.rabbitHole.uploadMemory({ file }),
      "Memories file successfully sent down the rabbit hole!",
      "Unable to send the memories to the rabbit hole"
    ).then((res) => {
      setCurrentState({ loading: false, data: res.data });
      sendNotificationFromJSON(res);
    });
  };

  const sendWebsite = (url: string) => {
    setCurrentState({ loading: true });
    tryRequest(
      apiClient?.api?.rabbitHole.uploadUrl({ url }),
      "Website successfully sent down the rabbit hole",
      "Unable to send the website to the rabbit hole"
    ).then((res) => {
      setCurrentState({ loading: false, data: res.data });
      sendNotificationFromJSON(res);
    });
  };

  return (
    <RabbitHoleContext.Provider
      value={{ currentState, sendFile, sendMemory, sendWebsite }}
    >
      {children}
    </RabbitHoleContext.Provider>
  );
};
