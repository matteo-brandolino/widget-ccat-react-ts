import { useState, useCallback, createContext } from "react";
import { uniqueId } from "lodash";
import type { JSONResponse } from "@models/JSONSchema";
import type { Notification } from "@models/Notification";
import type { NotificationsState } from "@stores/types";
import { ContextProviderProps } from "@/types";

export interface NotificationsContextType {
  currentState: NotificationsState;
  hideNotification: (id: Notification["id"]) => void;
  getNotifications: () => Notification[];
  showNotification: (
    notification: Omit<Notification, "id">,
    timeout?: number
  ) => void;
  sendNotificationFromJSON: <T>(result: JSONResponse<T>) => boolean;
}

export const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

export const NotificationsProvider = ({ children }: ContextProviderProps) => {
  const [currentState, setCurrentState] = useState<NotificationsState>({
    history: [],
  });

  const getNotifications = () => {
    return currentState.history.filter((notification) => !notification.hidden);
  };

  const hideNotification = (id: Notification["id"]) => {
    setCurrentState((prevState) => {
      const notificationIndex = prevState.history.findIndex(
        (notification) => notification.id === id
      );
      if (
        notificationIndex >= 0 &&
        notificationIndex < prevState.history.length
      ) {
        const newHistory = [...prevState.history];
        newHistory[notificationIndex] = {
          ...newHistory[notificationIndex],
          hidden: true,
        };
        return {
          ...prevState,
          history: newHistory,
        };
      }
      return prevState;
    });
  };

  const showNotification = useCallback(
    (notification: Omit<Notification, "id">, timeout = 3000) => {
      const newNotification = {
        id: uniqueId("n_"),
        ...notification,
      };

      setCurrentState((prevState) => ({
        ...prevState,
        history: [...prevState.history, newNotification],
      }));

      setTimeout(() => {
        hideNotification(newNotification.id);
      }, timeout);
    },
    [hideNotification]
  );

  const sendNotificationFromJSON = <T,>(result: JSONResponse<T>) => {
    showNotification({
      type: result.status,
      text: result.message,
    });
    return result.status !== "error";
  };

  const value: NotificationsContextType = {
    currentState,
    hideNotification,
    getNotifications,
    showNotification,
    sendNotificationFromJSON,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
