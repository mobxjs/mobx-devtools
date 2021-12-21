import React, { createContext, FC, useContext, ReactNode } from 'react';
import { RootStore } from '../stores';

const rootStore = new RootStore();

export const StoresContext = createContext<RootStore>(rootStore);

export const useStores = () => useContext(StoresContext);

type StoresProviderProps = {
  children?: ReactNode;
};

export const StoreProvider: FC<StoresProviderProps> = (props: StoresProviderProps) => {
  const { children } = props;

  return <StoresContext.Provider value={rootStore}>{children}</StoresContext.Provider>;
};
