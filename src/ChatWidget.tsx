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
  GlobeAltIcon,
  TrashIcon,
  DocumentTextIcon,
  ArrowDownIcon,
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
  const [isScrollable, setIsScrollable] = useState(false);
  const [isTwoLines, setIsTwoLines] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("light");

  const {
    transcript,
    listening: isListening,
    resetTranscript,
    browserSupportsSpeechRecognition: isSupported,
  } = useSpeechRecognition();

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const chatRootRef = useRef<HTMLDivElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const dragCounterRef = useRef(0);

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
  }, [notificationsState, onNotification]);

  useEffect(() => {
    const theme = settings?.dark ? "dark" : "light";
    setTheme(theme);
  }, [settings]);

  useEffect(() => {
    if (transcript) {
      setUserMessage(transcript);
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  useEffect(() => {
    if (textAreaRef.current) {
      const textarea = textAreaRef.current;
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
      setIsTwoLines(textarea.scrollHeight >= 72);
    }
  }, [userMessage]);

  useEffect(() => {
    if (messagesState.messages.length > 0) {
      onMessage?.(messagesState.messages.slice(-1)[0]);
    }

    if (chatRootRef.current) {
      setIsScrollable(
        chatRootRef.current.scrollHeight > chatRootRef.current.clientHeight
      );
    }

    scrollToBottom();
    textAreaRef.current?.focus();
  }, [messagesState.messages, onMessage]);

  const contentHandler = useCallback(
    (content: string | File[] | null) => {
      if (!content) return;

      if (typeof content === "string") {
        if (content.trim().length === 0) return;
        try {
          new URL(content);
          sendWebsite(content);
          onUpload?.(content);
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
      onUpload,
    ]
  );

  const handlePaste = useCallback(
    (evt: React.ClipboardEvent<HTMLDivElement>) => {
      const target = evt.target as HTMLElement;

      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const text = evt.clipboardData?.getData("text");
      const files = Array.from(evt.clipboardData?.files ?? []);

      contentHandler(text || files);
    },
    [contentHandler]
  );

  const handleDragEnter = useCallback(
    (evt: React.DragEvent<HTMLDivElement>) => {
      evt.preventDefault();
      dragCounterRef.current++;

      if (dragCounterRef.current === 1) {
        setIsOverDropZone(true);
      }
    },
    []
  );

  const handleDragLeave = useCallback(
    (evt: React.DragEvent<HTMLDivElement>) => {
      evt.preventDefault();
      dragCounterRef.current--;

      if (dragCounterRef.current === 0) {
        setIsOverDropZone(false);
      }
    },
    []
  );

  const handleDragOver = useCallback((evt: React.DragEvent<HTMLDivElement>) => {
    evt.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (evt: React.DragEvent<HTMLDivElement>) => {
      evt.preventDefault();

      dragCounterRef.current = 0;
      setIsOverDropZone(false);

      const text = evt.dataTransfer?.getData("text");
      const files = Array.from(evt.dataTransfer?.files ?? []);

      contentHandler(text || files);
    },
    [contentHandler]
  );

  const closeDragOverlay = useCallback(() => {
    dragCounterRef.current = 0;
    setIsOverDropZone(false);
  }, []);

  const dispatchWebsite = useCallback(() => {
    if (!insertedURL) return;
    try {
      new URL(insertedURL);
      sendWebsite(insertedURL);
      onUpload?.(insertedURL);
      setIsModalOpen(false);
      setInsertedURL("");
    } catch {
      setInsertedURL("");
    }
  }, [insertedURL, sendWebsite, onUpload]);

  const handleMemoryUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        sendMemory(file);
        onMemory?.(file);
      }
    },
    [sendMemory, onMemory]
  );

  const sendMessage = useCallback(
    (message: string) => {
      if (message === "") return;
      setUserMessage("");
      dispatchMessage(message, settings?.userId ?? "user", settings?.callback);
    },
    [dispatchMessage, settings?.userId, settings?.callback]
  );

  const preventSend = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(userMessage);
    }
  };

  const scrollToBottom = useCallback(() => {
    chatRootRef.current?.scrollTo({
      behavior: "smooth",
      left: 0,
      top: chatRootRef.current?.scrollHeight,
    });
  }, []);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        sendFile(file);
        onUpload?.(file);
      }
    },
    [sendFile, onUpload]
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

  return (
    <div
      ref={dropZoneRef}
      className="relative grow flex h-full min-h-full w-full flex-col scroll-smooth transition-colors selection:bg-primary"
      onPaste={handlePaste}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      data-theme={theme}
    >
      <NotificationStack />

      <div
        className={`relative flex h-full w-full flex-col justify-center gap-4 self-center text-sm ${
          !isTwoLines ? "pb-16 md:pb-20" : "pb-20 md:pb-24"
        }`}
      >
        {isOverDropZone && (
          <div className="flex h-full w-full grow flex-col items-center justify-center py-4 md:pb-0">
            <div className="relative flex w-full grow items-center justify-center rounded-md border-2 border-dashed border-primary p-2 md:p-4">
              <p className="text-lg md:text-xl">
                Drop <span className="font-medium text-primary">files</span> to
                send to the Cheshire Cat, meow!
              </p>
              <button
                className="btn btn-circle btn-error btn-sm absolute right-2 top-2"
                onClick={closeDragOverlay}
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
            <div
              ref={chatRootRef}
              className="flex grow flex-col overflow-y-auto"
            >
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
                ref={textAreaRef}
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                disabled={inputDisabled}
                className="textarea block max-h-20 w-full resize-none overflow-auto bg-base-200 !outline-offset-0"
                style={{
                  paddingRight: hasMenu
                    ? isTwoLines
                      ? "2.5rem"
                      : "5rem"
                    : "2.5rem",
                }}
                placeholder={settings?.placeholder}
                onKeyDown={preventSend}
                rows={1}
              />
              <div
                className={`absolute right-2 top-1/2 flex -translate-y-1/2 gap-1 ${
                  isTwoLines ? "flex-col-reverse" : ""
                }`}
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
                onClick={() => SpeechRecognition.startListening()}
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
