import { useCallback, useEffect, useMemo, useState } from "react";
import { createContextHook } from "./hooks/createContextHook";
import { MessagesContext } from "./stores/messages";
import { RabbitHoleContext } from "./stores/rabbitHole";
import { MemoryContext } from "./stores/memory";
import { NotificationsContext } from "./stores/notifications";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import {
  PaperAirplaneIcon,
  XMarkIcon,
  BoltIcon,
  MicrophoneIcon,
  GlobeAltIcon,
  TrashIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/solid";
import { Brain } from "lucide-react";
import ModalBox from "./components/ModalBox";
import NotificationStack from "./components/NotificationStack";
import MessageBox from "./components/MessageBox";
import { CatClientContext } from "./stores/apiClientProvider";
import "./main.css";
import { WidgetEvents } from "./types";
import FileInputWithIcon from "./components/FileInputWithIcon";

export const Widget = ({
  onMessage,
  onUpload,
  onMemory,
  onNotification,
}: WidgetEvents) => {
  const [userMessage, setUserMessage] = useState("");
  const [insertedURL, setInsertedURL] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOverDropZone, setIsOverDropZone] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("light");

  const {
    transcript,
    listening: isListening,
    resetTranscript,
    browserSupportsSpeechRecognition: isSupported,
  } = useSpeechRecognition();

  const useApiClient = createContextHook(CatClientContext, "CatClient");
  const { settings } = useApiClient();

  const useMessages = createContextHook(MessagesContext, "Messages");
  const messagesStore = useMessages();
  const {
    dispatchMessage,
    selectRandomDefaultMessages,
    currentState: messagesState,
  } = messagesStore;

  const useRabbitHole = createContextHook(RabbitHoleContext, "RabbitHole");
  const filesStore = useRabbitHole();
  const {
    sendFile,
    sendWebsite,
    sendMemory,
    currentState: rabbitHoleState,
  } = filesStore;

  const useMemory = createContextHook(MemoryContext, "Memory");
  const { wipeConversation } = useMemory();

  const useNotifications = createContextHook(
    NotificationsContext,
    "Notifications"
  );
  const { currentState: notificationsState } = useNotifications();
  useEffect(() => {
    const lastNotification = notificationsState.history.slice(-1)[0];
    if (lastNotification && !lastNotification.hidden) {
      onNotification?.(lastNotification);
    }
  }, [notificationsState]);

  useEffect(() => {
    const theme = settings?.dark ? "dark" : "light";
    setTheme(theme);
  }, [settings]);

  const contentHandler = useCallback(
    (content: string | File[] | null) => {
      if (!content) return;

      if (typeof content === "string") {
        if (content.trim().length === 0) return;
        try {
          new URL(content);
          sendWebsite(content);
        } catch {
          dispatchMessage(
            content,
            settings?.userId ?? "user",
            settings?.callback
          );
        }
      } else {
        content.forEach((f) => sendFile(f));
      }
    },
    [
      sendWebsite,
      sendFile,
      dispatchMessage,
      settings?.userId,
      settings?.callback,
    ]
  );

  const handlePaste = (evt: React.ClipboardEvent<HTMLDivElement>) => {
    const target = evt.target as HTMLElement;
    if (
      target.tagName === "TEXTAREA" &&
      (target as HTMLTextAreaElement).dataset.skipPaste !== undefined
    ) {
      return;
    }

    const clipboardData = evt.clipboardData;
    const text = clipboardData?.getData("text");
    const files = clipboardData?.files ? Array.from(clipboardData.files) : [];

    contentHandler(text || files);
  };

  const dispatchWebsite = useCallback(() => {
    if (!insertedURL) return;
    try {
      new URL(insertedURL);
      sendWebsite(insertedURL);
      setIsModalOpen(false);
      setInsertedURL("");
    } catch {
      setInsertedURL("");
    }
  }, [insertedURL, sendWebsite]);

  const handleMemoryUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        sendMemory(file);
        onMemory?.(file);
      }
    },
    [sendMemory]
  );
  const inputDisabled = useMemo(() => {
    return (
      messagesState.loading ||
      !messagesState.ready ||
      Boolean(messagesState.error)
    );
  }, [messagesState]);

  const hasMenu = useMemo(() => {
    return (settings?.features ?? []).filter((v) => v !== "record").length > 0;
  }, [settings?.features]);

  const randomDefaultMessages = useMemo(() => {
    return selectRandomDefaultMessages(settings?.defaults);
  }, [selectRandomDefaultMessages, settings?.defaults]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsOverDropZone(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsOverDropZone(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsOverDropZone(false);
      const text = e.dataTransfer.getData("text");
      const files = Array.from(e.dataTransfer.files);
      contentHandler(text || files);
    },
    [contentHandler]
  );

  const sendMessage = useCallback(
    (message: string) => {
      if (message === "") return;
      setUserMessage("");
      dispatchMessage(message, settings?.userId ?? "user", settings?.callback);
      onMessage?.(message);
    },
    [dispatchMessage, settings?.userId, settings?.callback]
  );

  const preventSend = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage(userMessage);
      }
    },
    [sendMessage, userMessage]
  );

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        sendFile(file);
        onUpload?.(file);
      }
    },
    [sendFile]
  );

  const handleListening = () => {
    SpeechRecognition.startListening();
  };

  useEffect(() => {
    if (transcript) {
      setUserMessage(transcript);
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  return (
    <div
      className="relative grow flex h-full min-h-full w-full flex-col scroll-smooth transition-colors selection:bg-primary"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onPaste={handlePaste}
      data-theme={theme}
    >
      <NotificationStack />

      <div className="relative grow flex h-full w-full flex-col justify-center gap-4 self-center text-sm">
        {isOverDropZone && (
          <div className="flex h-full w-full grow flex-col items-center justify-center py-4 md:pb-0">
            <div className="relative flex w-full grow items-center justify-center rounded-md border-2 border-dashed border-primary p-2 md:p-4">
              <p className="text-lg md:text-xl">
                Drop <span className="font-medium text-primary">files</span> to
                send to the Cheshire Cat, meow!
              </p>
              <button
                className="btn btn-circle btn-error btn-sm absolute right-2 top-2"
                onClick={() => setIsOverDropZone(false)}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}
        {!isOverDropZone && !messagesState.ready && (
          <div className="flex grow items-center justify-center self-center">
            {messagesState.error ? (
              <p className="w-fit rounded-md bg-error p-4 font-semibold text-base-100">
                {messagesState.error}
              </p>
            ) : (
              <p className="flex flex-col items-center justify-center gap-2">
                <span className="loading loading-spinner loading-lg text-primary" />
                <span className="text-lg font-medium text-neutral">
                  Getting ready...
                </span>
              </p>
            )}
          </div>
        )}

        {!isOverDropZone &&
          messagesState.ready &&
          messagesState.messages.length > 0 && (
            <div className="flex grow flex-col overflow-y-auto">
              {messagesState.messages.map((msg) => (
                <MessageBox
                  key={msg.id}
                  sender={msg.sender}
                  text={msg.text}
                  why={settings?.why && msg.sender === "bot" ? msg.why : ""}
                />
              ))}
              {messagesState.error && (
                <p className="w-fit rounded-md bg-error p-4 font-semibold text-base-100">
                  {messagesState.error}
                </p>
              )}
              {!messagesState.error && messagesState.loading && (
                <div className="mb-2 ml-2 flex items-center gap-2">
                  <span className="text-lg">😺</span>
                  <p className="flex items-center gap-2">
                    <span className="loading loading-dots loading-xs" />
                    {settings?.thinking}
                  </p>
                </div>
              )}
            </div>
          )}

        {!isOverDropZone &&
          messagesState.ready &&
          messagesState.messages.length === 0 && (
            <div className="flex grow cursor-pointer flex-col items-center justify-center gap-4 overflow-y-auto p-4">
              {randomDefaultMessages.map((msg, index) => (
                <div
                  key={index}
                  className="btn btn-neutral font-medium normal-case text-base-100 shadow-lg"
                  onClick={() => sendMessage(msg)}
                >
                  {msg}
                </div>
              ))}
            </div>
          )}

        <div className="fixed bottom-0 left-0 flex w-full items-center justify-center">
          <div className="flex w-full items-center gap-2 md:gap-4">
            <div className="relative w-full">
              <textarea
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                disabled={inputDisabled}
                className="textarea block max-h-20 w-full resize-none overflow-auto bg-base-200 !outline-offset-0"
                placeholder={settings?.placeholder}
                onKeyDown={preventSend}
                rows={1}
              />
              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1">
                <button
                  disabled={inputDisabled || userMessage.length === 0}
                  className="btn btn-circle btn-ghost btn-sm self-center"
                  onClick={() => sendMessage(userMessage)}
                >
                  <PaperAirplaneIcon className="h-6 w-6" />
                </button>

                {hasMenu && (
                  <div className="dropdown dropdown-end dropdown-top self-center">
                    <button
                      tabIndex={0}
                      disabled={inputDisabled}
                      className="btn btn-circle btn-ghost btn-sm"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <BoltIcon className="h-6 w-6" />
                    </button>

                    {isDropdownOpen && (
                      <ul className="dropdown-content join join-vertical !-right-1/4 z-10 mb-5 p-0">
                        {settings?.features?.includes("memory") && (
                          <li>
                            <FileInputWithIcon
                              label="Upload memories"
                              className="bg-success"
                              disabled={rabbitHoleState.loading}
                              handleFileUpload={handleMemoryUpload}
                              icon={Brain}
                            />
                          </li>
                        )}
                        {settings?.features?.includes("web") && (
                          <li>
                            <button
                              disabled={rabbitHoleState.loading}
                              className="btn join-item w-full flex-nowrap px-2"
                              onClick={() => setIsModalOpen(true)}
                            >
                              <span className="grow normal-case">
                                Upload url
                              </span>
                              <span className="rounded-lg bg-info p-1 text-base-100">
                                <GlobeAltIcon className="h-6 w-6" />
                              </span>
                            </button>
                          </li>
                        )}
                        {settings?.features?.includes("file") && (
                          <li>
                            <FileInputWithIcon
                              label="Upload a file"
                              className="bg-warning"
                              disabled={rabbitHoleState.loading}
                              handleFileUpload={handleFileUpload}
                              icon={DocumentTextIcon}
                            />
                          </li>
                        )}
                        {settings?.features?.includes("reset") && (
                          <li>
                            <button
                              disabled={messagesState.messages.length === 0}
                              className="btn join-item w-full flex-nowrap px-2"
                              onClick={wipeConversation}
                            >
                              <span className="grow normal-case">
                                Clear conversation
                              </span>
                              <span className="rounded-lg bg-error p-1 text-base-100">
                                <TrashIcon className="h-6 w-6" />
                              </span>
                            </button>
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
            {isSupported && settings?.features?.includes("record") && (
              <button
                className={`btn btn-circle btn-primary ${
                  isListening ? "glass btn-outline" : ""
                }`}
                disabled={inputDisabled}
                onClick={handleListening}
              >
                <MicrophoneIcon className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>
        <ModalBox isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="flex flex-col items-center justify-center gap-4 text-neutral">
            <h3 className="text-lg font-bold">Insert URL</h3>
            <p>Write down the URL you want the Cat to digest:</p>
            <input
              value={insertedURL}
              onChange={(e) => setInsertedURL(e.target.value)}
              type="text"
              placeholder="Enter url..."
              className="input input-primary input-sm w-full !transition-all"
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={dispatchWebsite}
            >
              Send
            </button>
          </div>
        </ModalBox>
      </div>
    </div>
  );
};
