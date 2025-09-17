import {
  createContext as reactCreateContext,
  useContext as reactUseContext,
  type Context,
  type Provider,
} from 'react';

/**
 * Return type for the createContext helper function
 */
type CreateContext<T> = [Provider: Provider<T>, useContext: () => T];

/**
 * Helper function to create a context and a useContext hook
 * from a given default value
 * @param defaultValue default value for the context.
 *        empty object as `T` if not provided
 *
 * @returns [Context, useContext]
 */
export function createContext<T>(name = 'Custom', defaultValue: T = {} as T): CreateContext<T> {
  const Context = reactCreateContext<T>(defaultValue);
  const useTContext = () => {
    const context = reactUseContext(Context);
    if (context === undefined) {
      throw new Error(`${useTContext.name} must be used within a ${name}Provider`);
    }
    return context;
  };
  return [Context.Provider, useTContext];
}

export type { Context, Provider, CreateContext };
