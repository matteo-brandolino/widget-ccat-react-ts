import { RootProvider } from "./stores/root";
import { Widget } from "./Widget";

export const CheshireCatWidget = () => {
  return (
    <RootProvider>
      <Widget />
    </RootProvider>
  );
};
