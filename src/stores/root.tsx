import { ReactNode } from "react";
import { NotificationsProvider } from "./notifications";
import { MessagesProvider } from "./messages";
import { MemoryProvider } from "./memory";
import { RabbitHoleProvider } from "./rabbitHole";
import { CatClientProvider } from "./apiClientProvider";
import { WidgetSettings } from "@/ChatWidget";

export const RootProvider = ({
  children,
  settings,
}: {
  children: ReactNode;
  settings: WidgetSettings["settings"];
}) => {
  return (
    <CatClientProvider settings={settings}>
      <NotificationsProvider>
        <RabbitHoleProvider>
          <MessagesProvider>
            <MemoryProvider>{children}</MemoryProvider>
          </MessagesProvider>
        </RabbitHoleProvider>
      </NotificationsProvider>
    </CatClientProvider>
  );
};
