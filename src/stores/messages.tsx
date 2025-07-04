import { createContext, useState, useCallback, useEffect } from "react";
import { now, uniqueId } from "lodash";
import { apiClient } from "@/config";
import type { MessagesState } from "@stores/types";
import type { BotMessage, UserMessage } from "@models/Message";
import { ContextProviderProps } from "@/types";
import { createContextHook } from "@/hooks/createContextHook";
import { NotificationsContext } from "./notifications";

const DEFAULT_MESSAGES = [
  "What's up?",
  "Who's the Queen of Hearts?",
  "Where is the white rabbit?",
  "What is Python?",
  "How do I write my own AI app?",
  "Does pineapple belong on pizza?",
  "What is the meaning of life?",
  "What is the best programming language?",
  "What is the best pizza topping?",
  "What is a language model?",
  "What is a neural network?",
  "What is a chatbot?",
  "What time is it?",
  "Is AI capable of creating art?",
  "What is the best way to learn AI?",
  "Is it worth learning AI?",
  "Who is the Cheshire Cat?",
  "Is Alice in Wonderland a true story?",
  "Who is the Mad Hatter?",
  "How do I find my way to Wonderland?",
  "Is Wonderland a real place?",
];

interface MessagesContextType {
  currentState: MessagesState;
  addMessage: (
    message: Omit<BotMessage, "id"> | Omit<UserMessage, "id">
  ) => void;
  selectRandomDefaultMessages: (defaults?: string[]) => string[];
  dispatchMessage: (
    message: string,
    userId: string,
    callback?: (message: string) => Promise<string>
  ) => Promise<void>;
}

const MessagesContext = createContext<MessagesContextType | undefined>(
  undefined
);

export const MessagesProvider = ({ children }: ContextProviderProps) => {
  const [currentState, setCurrentState] = useState<MessagesState>({
    ready: false,
    loading: false,
    messages: [],
    defaultMessages: DEFAULT_MESSAGES,
  });
  const useNotifications = createContextHook(
    NotificationsContext,
    "Notifications"
  );
  const { showNotification } = useNotifications();

  useEffect(() => {
    apiClient
      .onConnected(() => {
        setCurrentState((state) => ({ ...state, ready: true }));
      })
      .onMessage(({ content, type, why }) => {
        if (type === "chat") {
          addMessage({
            text: content,
            sender: "bot",
            timestamp: now(),
            why,
          });
        } else if (type === "notification") {
          showNotification({
            type: "info",
            text: content,
          });
        }
      })
      .onError((error) => {
        setCurrentState((state) => ({
          ...state,
          loading: false,
          ready: false,
          error: error.description,
        }));
      })
      .onDisconnected(() => {
        setCurrentState((state) => ({ ...state, ready: false }));
      });

    return () => {
      apiClient.close();
    };
  }, [showNotification]);

  const addMessage = useCallback(
    (message: Omit<BotMessage, "id"> | Omit<UserMessage, "id">) => {
      const msg = {
        id: uniqueId("m_"),
        ...message,
      };
      setCurrentState((state) => ({
        ...state,
        error: undefined,
        messages: [...state.messages, msg],
        loading: msg.sender === "user",
      }));
    },
    []
  );

  const selectRandomDefaultMessages = useCallback(
    (defaults?: string[]) => {
      const messages =
        defaults && defaults.length > 0
          ? [...defaults]
          : [...currentState.defaultMessages];
      const shuffled = messages.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 5);
    },
    [currentState.defaultMessages]
  );

  const dispatchMessage = useCallback(
    async (
      message: string,
      userId: string,
      callback?: (message: string) => Promise<string>
    ) => {
      if (callback) {
        const msg = await callback(message);
        apiClient.send({ text: msg }, userId);
      } else {
        apiClient.send({ text: message }, userId);
      }
      addMessage({
        text: message.trim(),
        timestamp: now(),
        sender: "user",
      });
    },
    [addMessage]
  );

  const value: MessagesContextType = {
    currentState,
    addMessage,
    selectRandomDefaultMessages,
    dispatchMessage,
  };

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  );
};
