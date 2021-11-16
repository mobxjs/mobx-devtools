import React, { ReactNode, createContext } from 'react';

export const StoresContext = createContext<any>({});

type StoresProviderProps = {
  children: ReactNode;
};

export const StoresProvider = (props: StoresProviderProps) => {
  const { children } = props;

  return <StoresContext.Provider value={{}}>{children}</StoresContext.Provider>;
};
