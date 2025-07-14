import { RootProvider } from "./stores/root";
import { Widget, WidgetSettings } from "./ChatWidget";
import { Features } from "./config";

export const CheshireCatWidget = ({
  host = "localhost",
  dark = false,
  why = false,
  user = "user",
  thinking = "Cheshire Cat is thinking...",
  placeholder = "Ask the Cheshire Cat...",
  primary = "",
  defaults = [],
  features = Object.values(Features),
}: Partial<WidgetSettings["settings"]> = {}) => {
  const settings = {
    host,
    dark,
    why,
    user,
    thinking,
    placeholder,
    primary,
    defaults,
    features,
  };

  return (
    <RootProvider settings={settings}>
      <Widget />
    </RootProvider>
  );
};
