import { createContext, useContext } from "react";
import { NanotelemetryClient } from "nanotelemetry";

interface NanotelemetryContext {
  client: NanotelemetryClient | null;
}

const context = createContext<NanotelemetryContext>({ client: null });

interface NanotelemetryProviderProps {
  client: NanotelemetryClient;
  children?: React.ReactNode;
}

export function NanotelemetryProvider({ client, children }: NanotelemetryProviderProps) {
  return (
    <context.Provider value={{client}}>
      {children}
    </context.Provider>
  );
}

export function useNanotelemetry() {
  const { client } = useContext(context);
  if (!client) {
    throw new Error("useNanotelemetryClient must be used within a NanotelemetryProvider");
  }
  return {
    trace: client.trace.bind(client),
    log: client.log.bind(client),
    flush: client.flush.bind(client),
  };
}