import { Feature } from "@/config";
import { Message } from "@/models/Message";
import { Notification } from "@/models/Notification";
import { CatSettings } from "ccat-api";
import { ReactNode } from "react";

export interface ContextProviderProps {
  children: ReactNode;
}

export interface WidgetEvents {
  onMessage?: (msg: Message) => void;
  onUpload?: (content: File | string) => void;
  onNotification?: (notification: Notification) => void;
  onMemory?: (file: File) => void;
}

export interface WidgetSettings extends CatSettings, WidgetEvents {
  dark?: boolean;
  why?: boolean;
  thinking?: string;
  placeholder?: string;
  primary?: string;
  callback?: (message: string) => Promise<string>;
  defaults?: string[];
  features?: Feature[];
}
