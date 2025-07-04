import { useContext, Context } from "react";

/**
 * Generic hook to create context hooks with error handling
 * @param context - The React context to use
 * @param contextName - Name of the context for error message
 * @returns The context value or throws an error if not available
 */
export const createContextHook = <T>(
  context: Context<T | undefined>,
  contextName: string
) => {
  return (): T => {
    const contextValue = useContext(context);
    if (contextValue === undefined) {
      throw new Error(
        `use${contextName} must be used within a ${contextName}Provider`
      );
    }
    return contextValue;
  };
};
