import { createContext, useEffect, useMemo, useState } from "react";
import CatClient from "ccat-api";
import { WidgetSettings } from "@/ChatWidget";

interface CatClientContextValue {
  client: CatClient | null;
  settings: WidgetSettings["settings"] | null;
}

export const CatClientContext = createContext<
  CatClientContextValue | undefined
>(undefined);

interface CatClientProviderProps {
  settings: WidgetSettings["settings"];
  children: React.ReactNode;
}

export const CatClientProvider = ({
  settings,
  children,
}: CatClientProviderProps) => {
  const [client, setClient] = useState<CatClient | null>(null);
  const [, setCatSettings] = useState<WidgetSettings["settings"] | null>(null);

  useEffect(() => {
    const newClient = new CatClient(settings);
    setClient(newClient);
    setCatSettings(settings);
  }, [settings]);

  const value = useMemo(() => ({ client, settings }), [client, settings]);

  return (
    <CatClientContext.Provider value={value}>
      {children}
    </CatClientContext.Provider>
  );
};
