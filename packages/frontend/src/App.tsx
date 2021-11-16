import React, { ReactNode, useEffect, useRef } from 'react';

export type AppProps = {
  quiet?: boolean;
  reloadSubscribe: any;
  inject: any;
  reload: any;
};

export const App = (props: AppProps) => {
  const { quiet, reloadSubscribe, inject, reload } = props;

  return <div>Hello world!</div>;
};
