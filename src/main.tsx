import { RootProvider } from "./stores/root";
import { Widget } from "./ChatWidget";

export const CheshireCatWidget = () => {
  return (
    <RootProvider>
      <Widget />
    </RootProvider>
  );
};
