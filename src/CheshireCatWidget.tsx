import { CatSettings } from "ccat-api";
import { Feature, Features } from "./config";
import "./index.css";
import { Message } from "./models/Message";
import { useEffect, useRef, useState } from "react";
import { RootProvider } from "./stores/root";

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
  return (
    <RootProvider>
      <div
        data-theme={settings.dark ? "dark" : "light"}
        style={{ height: "100%", width: "100%" }}
      ></div>
    </RootProvider>
  );
};
