import { ReactNode } from "react";
import { NotificationsProvider } from "./notifications";
import { MessagesProvider } from "./messages";

export const RootProvider = ({ children }: { children: ReactNode }) => {
  return (
    <NotificationsProvider>
      <MessagesProvider>{children}</MessagesProvider>
    </NotificationsProvider>
  );
};
