import CatClient, { CatSettings } from "ccat-api";
import { Feature, Features, updateClient } from "./config";
import "./index.css";
import { Message } from "./models/Message";
import { RootProvider } from "./stores/root";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  ArrowDownIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import ModalBox from "./components/ModalBox";
import NotificationStack from "./components/NotificationStack";
import MessageBox from "./components/MessageBox";

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
  const [userMessage, setUserMessage] = useState("");
  const [insertedURL, setInsertedURL] = useState("");
  const [isScrollable, setIsScrollable] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [textArea, setTextArea] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOverDropZone, setIsOverDropZone] = useState(false);
  const [files, setFiles] = useState([]);
  const [memory, setMemory] = useState([]);

  const {
    transcript,
    listening: isListening,
    resetTranscript,
    browserSupportsSpeechRecognition: isSupported,
  } = useSpeechRecognition();

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

  const contentHandler = useCallback(
    (content: string | File[] | null) => {
      if (!content) return;

      if (typeof content === "string") {
        if (content.trim().length === 0) return;
        try {
          new URL(content);
          sendWebsite(content);
        } catch {
          dispatchMessage(content, settings.user ?? "user", settings.callback);
        }
      } else {
        content.forEach((f) => sendFile(f));
      }
    },
    [sendWebsite, sendFile, dispatchMessage, settings.user, settings.callback]
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
    return (settings.features ?? []).filter((v) => v !== "record").length > 0;
  }, [settings.features]);

  const randomDefaultMessages = useMemo(() => {
    return selectRandomDefaultMessages(settings.defaults);
  }, [selectRandomDefaultMessages, settings.defaults]);

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
      dispatchMessage(message, settings.user ?? "user", settings.callback);
    },
    [dispatchMessage, settings.user, settings.callback]
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
      }
    },
    [sendFile]
  );

  return (
    <RootProvider>
      <div
        data-theme={settings.dark ? "dark" : "light"}
        style={{ height: "100%", width: "100%" }}
      >
        <div
          data-theme={settings.dark ? "dark" : "light"}
          className="relative flex h-full min-h-full w-full flex-col scroll-smooth transition-colors selection:bg-primary"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onPaste={handlePaste}
        >
          <NotificationStack />

          <div
            className={
              "relative flex h-full w-full flex-col justify-center gap-4 self-center text-sm"
            }
          >
            {isOverDropZone && (
              <div className="flex h-full w-full grow flex-col items-center justify-center py-4 md:pb-0">
                <div className="relative flex w-full grow items-center justify-center rounded-md border-2 border-dashed border-primary p-2 md:p-4">
                  <p className="text-lg md:text-xl">
                    Drop <span className="font-medium text-primary">files</span>{" "}
                    to send to the Cheshire Cat, meow!
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
                      why={settings.why && msg.sender === "bot" ? msg.why : ""}
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
                        {settings.thinking}
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
                    className={`textarea block max-h-20 w-full resize-none overflow-auto bg-base-200 !outline-offset-0`}
                    placeholder={settings.placeholder}
                    onKeyDown={preventSend}
                    rows={1}
                  />

                  <div
                    className={
                      "absolute right-2 top-1/2 flex -translate-y-1/2 gap-1"
                    }
                  >
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
                            {settings.features?.includes("memory") && (
                              <li>
                                <input
                                  type="file"
                                  disabled={rabbitHoleState.loading}
                                  className="btn join-item w-full flex-nowrap px-2"
                                  onChange={handleMemoryUpload}
                                >
                                  <span className="grow normal-case">
                                    Upload memories
                                  </span>
                                  <span className="rounded-lg bg-success p-1 text-base-100">
                                    🧠
                                  </span>
                                </input>
                              </li>
                            )}

                            {settings.features?.includes("web") && (
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

                            {settings.features?.includes("file") && (
                              <li>
                                <input
                                  type="file"
                                  disabled={rabbitHoleState.loading}
                                  className="btn join-item w-full flex-nowrap px-2"
                                  onChange={handleFileUpload}
                                >
                                  <span className="grow normal-case">
                                    Upload file
                                  </span>
                                  <span className="rounded-lg bg-warning p-1 text-base-100">
                                    <DocumentTextIcon className="h-6 w-6" />
                                  </span>
                                </input>
                              </li>
                            )}

                            {settings.features?.includes("reset") && (
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

                {isSupported && settings.features?.includes("record") && (
                  <button
                    className={`btn btn-circle btn-primary ${
                      isListening ? "glass btn-outline" : ""
                    }`}
                    disabled={inputDisabled}
                    onClick={() => SpeechRecognition.startListening}
                  >
                    <MicrophoneIcon className="h-6 w-6" />
                  </button>
                )}
              </div>

              {isScrollable && (
                <button
                  className="btn btn-circle btn-primary btn-outline btn-sm absolute bottom-28 right-4 bg-base-100"
                  onClick={scrollToBottom}
                >
                  <ArrowDownIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            <ModalBox
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            >
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

          <input
            value={files}
            type="file"
            className="hidden"
            onChange={handleFileUpload}
          />

          <input
            value={memory}
            type="file"
            className="hidden"
            accept=".txt,.pdf,.doc,.docx"
            onChange={handleMemoryUpload}
          />
        </div>
      </div>
    </RootProvider>
  );
};
