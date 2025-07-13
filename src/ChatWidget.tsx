import CatClient, { CatSettings } from "ccat-api";
import { Feature, Features, updateClient } from "./config";
import { Message } from "./models/Message";
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
  ArrowDownIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import ModalBox from "./components/ModalBox";
import NotificationStack from "./components/NotificationStack";
import MessageBox from "./components/MessageBox";
import "./main.css";

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

export const Widget = ({
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
    <div
      data-theme={settings.dark ? "dark" : "light"}
      style={{ height: "100%", width: "100%" }}
    >
      <div
        data-theme={settings.dark ? "dark" : "light"}
        className="ccat-relative ccat-flex ccat-h-full ccat-min-h-full ccat-w-full ccat-flex-col ccat-scroll-smooth ccat-transition-colors ccat-selection:bg-primary"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
      >
        <NotificationStack />

        <div className="ccat-relative ccat-flex ccat-h-full ccat-w-full ccat-flex-col ccat-justify-center ccat-gap-4 ccat-self-center ccat-text-sm">
          {isOverDropZone && (
            <div className="ccat-flex ccat-h-full ccat-w-full ccat-grow ccat-flex-col ccat-items-center ccat-justify-center ccat-py-4 md:ccat-pb-0">
              <div className="ccat-relative ccat-flex ccat-w-full ccat-grow ccat-items-center ccat-justify-center ccat-rounded-md ccat-border-2 ccat-border-dashed ccat-border-primary ccat-p-2 md:ccat-p-4">
                <p className="ccat-text-lg md:ccat-text-xl">
                  Drop{" "}
                  <span className="ccat-font-medium ccat-text-primary">
                    files
                  </span>{" "}
                  to send to the Cheshire Cat, meow!
                </p>
                <button
                  className="ccat-btn ccat-btn-circle ccat-btn-error ccat-btn-sm ccat-absolute ccat-right-2 ccat-top-2"
                  onClick={() => setIsOverDropZone(false)}
                >
                  <XMarkIcon className="ccat-h-6 ccat-w-6" />
                </button>
              </div>
            </div>
          )}

          {!isOverDropZone && !messagesState.ready && (
            <div className="ccat-flex ccat-grow ccat-items-center ccat-justify-center ccat-self-center">
              {messagesState.error ? (
                <p className="ccat-w-fit ccat-rounded-md ccat-bg-error ccat-p-4 ccat-font-semibold ccat-text-base-100">
                  {messagesState.error}
                </p>
              ) : (
                <p className="ccat-flex ccat-flex-col ccat-items-center ccat-justify-center ccat-gap-2">
                  <span className="ccat-loading ccat-loading-spinner ccat-loading-lg ccat-text-primary" />
                  <span className="ccat-text-lg ccat-font-medium ccat-text-neutral">
                    Getting ready...
                  </span>
                </p>
              )}
            </div>
          )}

          {!isOverDropZone &&
            messagesState.ready &&
            messagesState.messages.length > 0 && (
              <div className="ccat-flex ccat-grow ccat-flex-col ccat-overflow-y-auto">
                {messagesState.messages.map((msg) => (
                  <MessageBox
                    key={msg.id}
                    sender={msg.sender}
                    text={msg.text}
                    why={settings.why && msg.sender === "bot" ? msg.why : ""}
                  />
                ))}
                {messagesState.error && (
                  <p className="ccat-w-fit ccat-rounded-md ccat-bg-error ccat-p-4 ccat-font-semibold ccat-text-base-100">
                    {messagesState.error}
                  </p>
                )}
                {!messagesState.error && messagesState.loading && (
                  <div className="ccat-mb-2 ccat-ml-2 ccat-flex ccat-items-center ccat-gap-2">
                    <span className="ccat-text-lg">😺</span>
                    <p className="ccat-flex ccat-items-center ccat-gap-2">
                      <span className="ccat-loading ccat-loading-dots ccat-loading-xs" />
                      {settings.thinking}
                    </p>
                  </div>
                )}
              </div>
            )}

          {!isOverDropZone &&
            messagesState.ready &&
            messagesState.messages.length === 0 && (
              <div className="ccat-flex ccat-grow ccat-cursor-pointer ccat-flex-col ccat-items-center ccat-justify-center ccat-gap-4 ccat-overflow-y-auto ccat-p-4">
                {randomDefaultMessages.map((msg, index) => (
                  <div
                    key={index}
                    className="ccat-btn ccat-btn-neutral ccat-font-medium ccat-normal-case ccat-text-base-100 ccat-shadow-lg"
                    onClick={() => sendMessage(msg)}
                  >
                    {msg}
                  </div>
                ))}
              </div>
            )}

          <div className="ccat-fixed ccat-bottom-0 ccat-left-0 ccat-flex ccat-w-full ccat-items-center ccat-justify-center">
            <div className="ccat-flex ccat-w-full ccat-items-center ccat-gap-2 md:ccat-gap-4">
              <div className="ccat-relative ccat-w-full">
                <textarea
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  disabled={inputDisabled}
                  className="ccat-textarea ccat-block ccat-max-h-20 ccat-w-full ccat-resize-none ccat-overflow-auto ccat-bg-base-200 !ccat-outline-offset-0"
                  placeholder={settings.placeholder}
                  onKeyDown={preventSend}
                  rows={1}
                />
                <div className="ccat-absolute ccat-right-2 ccat-top-1/2 ccat-flex -ccat-translate-y-1/2 ccat-gap-1">
                  <button
                    disabled={inputDisabled || userMessage.length === 0}
                    className="ccat-btn ccat-btn-circle ccat-btn-ghost ccat-btn-sm ccat-self-center"
                    onClick={() => sendMessage(userMessage)}
                  >
                    <PaperAirplaneIcon className="ccat-h-6 ccat-w-6" />
                  </button>

                  {hasMenu && (
                    <div className="ccat-dropdown ccat-dropdown-end ccat-dropdown-top ccat-self-center">
                      <button
                        tabIndex={0}
                        disabled={inputDisabled}
                        className="ccat-btn ccat-btn-circle ccat-btn-ghost ccat-btn-sm"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      >
                        <BoltIcon className="ccat-h-6 ccat-w-6" />
                      </button>

                      {isDropdownOpen && (
                        <ul className="ccat-dropdown-content ccat-join ccat-join-vertical !-ccat-right-1/4 ccat-z-10 ccat-mb-5 ccat-p-0">
                          {settings.features?.includes("memory") && (
                            <li>
                              <input
                                type="file"
                                disabled={rabbitHoleState.loading}
                                className="ccat-btn ccat-join-item ccat-w-full ccat-flex-nowrap ccat-px-2"
                                onChange={handleMemoryUpload}
                              />
                            </li>
                          )}
                          {settings.features?.includes("web") && (
                            <li>
                              <button
                                disabled={rabbitHoleState.loading}
                                className="ccat-btn ccat-join-item ccat-w-full ccat-flex-nowrap ccat-px-2"
                                onClick={() => setIsModalOpen(true)}
                              >
                                <span className="ccat-grow ccat-normal-case">
                                  Upload url
                                </span>
                                <span className="ccat-rounded-lg ccat-bg-info ccat-p-1 ccat-text-base-100">
                                  <GlobeAltIcon className="ccat-h-6 ccat-w-6" />
                                </span>
                              </button>
                            </li>
                          )}
                          {settings.features?.includes("file") && (
                            <li>
                              <input
                                type="file"
                                disabled={rabbitHoleState.loading}
                                className="ccat-btn ccat-join-item ccat-w-full ccat-flex-nowrap ccat-px-2"
                                onChange={handleFileUpload}
                              />
                            </li>
                          )}
                          {settings.features?.includes("reset") && (
                            <li>
                              <button
                                disabled={messagesState.messages.length === 0}
                                className="ccat-btn ccat-join-item ccat-w-full ccat-flex-nowrap ccat-px-2"
                                onClick={wipeConversation}
                              >
                                <span className="ccat-grow ccat-normal-case">
                                  Clear conversation
                                </span>
                                <span className="ccat-rounded-lg ccat-bg-error ccat-p-1 ccat-text-base-100">
                                  <TrashIcon className="ccat-h-6 ccat-w-6" />
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
                  className={`ccat-btn ccat-btn-circle ccat-btn-primary ${
                    isListening ? "ccat-glass ccat-btn-outline" : ""
                  }`}
                  disabled={inputDisabled}
                  onClick={() => SpeechRecognition.startListening}
                >
                  <MicrophoneIcon className="ccat-h-6 ccat-w-6" />
                </button>
              )}
            </div>

            {isScrollable && (
              <button
                className="ccat-btn ccat-btn-circle ccat-btn-primary ccat-btn-outline ccat-btn-sm ccat-absolute ccat-bottom-28 ccat-right-4 ccat-bg-base-100"
                onClick={scrollToBottom}
              >
                <ArrowDownIcon className="ccat-h-5 ccat-w-5" />
              </button>
            )}
          </div>

          <ModalBox isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className="ccat-flex ccat-flex-col ccat-items-center ccat-justify-center ccat-gap-4 ccat-text-neutral">
              <h3 className="ccat-text-lg ccat-font-bold">Insert URL</h3>
              <p>Write down the URL you want the Cat to digest:</p>
              <input
                value={insertedURL}
                onChange={(e) => setInsertedURL(e.target.value)}
                type="text"
                placeholder="Enter url..."
                className="ccat-input ccat-input-primary ccat-input-sm ccat-w-full !ccat-transition-all"
              />
              <button
                className="ccat-btn ccat-btn-primary ccat-btn-sm"
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
          className="ccat-hidden"
          onChange={handleFileUpload}
        />

        <input
          value={memory}
          type="file"
          className="ccat-hidden"
          accept=".txt,.pdf,.doc,.docx"
          onChange={handleMemoryUpload}
        />
      </div>
    </div>
  );
};
