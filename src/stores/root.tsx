import { ReactNode } from "react";
import { NotificationsProvider } from "./notifications";
import { MessagesProvider } from "./messages";
import { MemoryProvider } from "./memory";
import { RabbitHoleProvider } from "./rabbitHole";

export const RootProvider = ({ children }: { children: ReactNode }) => {
  return (
    <NotificationsProvider>
      <RabbitHoleProvider>
        <MessagesProvider>
          <MemoryProvider>{children}</MemoryProvider>
        </MessagesProvider>
      </RabbitHoleProvider>
    </NotificationsProvider>
  );
};
