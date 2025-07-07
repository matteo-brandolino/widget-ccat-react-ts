import { CSSTransition, TransitionGroup } from "react-transition-group";
import "./NotificationStack.module.css";
import { createContextHook } from "@/hooks/createContextHook";
import { NotificationsContext } from "@/stores/notifications";

export default function NotificationStack() {
  const useNotifications = createContextHook(
    NotificationsContext,
    "Notifications"
  );
  const { getNotifications } = useNotifications();

  const notifications = getNotifications();

  return (
    <div className="toast toast-center toast-top z-50">
      <TransitionGroup className="notifications">
        {notifications.map((notification) => (
          <CSSTransition
            key={notification.id}
            timeout={500}
            classNames="notifications"
          >
            <div
              className={`alert grid-cols-none py-2 font-medium text-base-100 ${
                notification.hidden ? "hidden" : ""
              } ${
                notification.type === "info"
                  ? "alert-info"
                  : notification.type === "error"
                  ? "alert-error"
                  : notification.type === "success"
                  ? "alert-success"
                  : ""
              }`}
            >
              <span>{notification.text}</span>
            </div>
          </CSSTransition>
        ))}
      </TransitionGroup>
    </div>
  );
}
