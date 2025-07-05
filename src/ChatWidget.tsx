import CatClient, { CatSettings } from "ccat-api";
import { Feature, Features, updateClient } from "./config";
import "./index.css";
import { Message } from "./models/Message";
import { RootProvider } from "./stores/root";
import { useEffect, useMemo, useRef, useState } from "react";
import { createContextHook } from "./hooks/createContextHook";
import { MessagesContext } from "./stores/messages";
import { RabbitHoleContext } from "./stores/rabbitHole";
import { MemoryContext } from "./stores/memory";
import { NotificationsContext } from "./stores/notifications";

interface WidgetSettings {
  settings: CatSettings & {
    dark?: boolean;
    why?: boolean;
    thinking?: string;
    user?: string;
    placeholder?: string;
    primary?: string;
    callback?: (message: string) => Promise<string>;
    defaults?: string[];
    features?: Feature[];
  };
}

interface WidgetProps {
  settings?: WidgetSettings["settings"];
  onMessage?: (msg: Message) => void;
  onUpload?: (content: File | string) => void;
  onNotification?: (notification: Notification) => void;
}

const defaultSettings: WidgetSettings["settings"] = {
  host: "localhost",
  dark: false,
  why: false,
  user: "user",
  thinking: "Cheshire Cat is thinking...",
  placeholder: "Ask the Cheshire Cat...",
  primary: "",
  defaults: [],
  features: Object.values(Features),
};

export const CheshireCatWidget = ({
  settings = defaultSettings,
  onMessage,
  onUpload,
  onNotification,
}: WidgetProps) => {
  //Missing load theme hook
  const [userMessage, setUserMessage] = useState("");
  const [insertedURL, setInsertedURL] = useState("");
  const [isScrollable, setIsScrollable] = useState(false);
  const [isTwoLines, setIsTwoLines] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const widgetRoot = useRef(null);
  const chatRoot = useRef(null);

  //Missing useTextareaAutosize

  const useMessages = createContextHook(MessagesContext, "Messages");
  const useRabbitHole = createContextHook(RabbitHoleContext, "RabbitHole");
  const useMemory = createContextHook(MemoryContext, "Memory");
  const useNotifications = createContextHook(
    NotificationsContext,
    "NouseNotifications"
  );

  const messagesStore = useMessages();
  const {
    dispatchMessage,
    selectRandomDefaultMessages,
    currentState: messagesState,
  } = messagesStore;

  const filesStore = useRabbitHole();
  const {
    sendFile,
    sendWebsite,
    sendMemory,
    currentState: rabbitHoleState,
  } = filesStore;

  const { wipeConversation } = useMemory();

  useEffect(() => {
    updateClient(new CatClient(settings));
  }, [settings]);

  // Missing useSpeechRecognition
  // Missing useFileDialog

  /**
   * Calls the specific endpoints based on the mime type of the file
   */
  const contentHandler = (content: string | File[] | null) => {
    if (!content) return;
    if (typeof content === "string") {
      if (content.trim().length == 0) return;
      try {
        new URL(content);
        sendWebsite(content);
      } catch (_) {
        dispatchMessage(content, settings.user ?? "user", settings.callback);
      }
    } else content.forEach((f) => sendFile(f));
  };

  // Missing useDropzone

  // Computed values
  const inputDisabled = useMemo(() => {
    return (
      messagesState.loading ||
      !messagesState.ready ||
      Boolean(messagesState.error)
    );
  }, [messagesState]);

  const hasMenu = useMemo(() => {
    return (settings.features ?? []).filter((v) => v !== "record").length > 0;
  }, [settings.features]);

  const randomDefaultMessages = useMemo(() => {
    return selectRandomDefaultMessages(settings.defaults);
  }, [selectRandomDefaultMessages, settings.defaults]);

  return (
    <RootProvider>
      <div
        data-theme={settings.dark ? "dark" : "light"}
        style={{ height: "100%", width: "100%" }}
      ></div>
    </RootProvider>
  );
};
