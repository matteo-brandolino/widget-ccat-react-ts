import { RootProvider } from "./stores/root";
import { Widget } from "./ChatWidget";
import { Features } from "./config";
import { WidgetSettings } from "./types";

export const CheshireCatWidget = ({
  host = "localhost",
  dark = false,
  why = false,
  userId = "user",
  thinking = "Cheshire Cat is thinking...",
  placeholder = "Ask the Cheshire Cat...",
  primary = "",
  defaults = [],
  features = Object.values(Features),
  onMessage,
  onUpload,
  onNotification,
  onMemory,
}: WidgetSettings) => {
  const settings: WidgetSettings = {
    host,
    dark,
    why,
    userId,
    thinking,
    placeholder,
    primary,
    defaults,
    features,
  };

  return (
    <RootProvider settings={settings}>
      <Widget
        onMessage={onMessage}
        onUpload={onUpload}
        onNotification={onNotification}
        onMemory={onMemory}
      />
    </RootProvider>
  );
};
