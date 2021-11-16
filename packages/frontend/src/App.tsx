import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { css, StyleSheet } from 'aphrodite';
import Blocker from './Blocker';
import Bridge from './Bridge';
import { createStores } from './stores';

export type AppProps = {
  quiet?: boolean;
  reloadSubscribe: any;
  inject: any;
  reload: any;
  children: React.ReactNode;
};

export const App = (props: AppProps) => {
  const { quiet, reloadSubscribe, inject, reload, children } = props;

  const [contentScriptInstallationError, setContentScriptInstallationError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [connected, setConnected] = useState(false);
  const [mobxFound, setMobxFound] = useState(false);

  const unsubscribeReloadRef = useRef(undefined);
  const teardownWallRef = useRef(undefined);
  const disposablesRef = useRef([]);
  const storesRef = useRef({});
  const unMountedRef = useRef(false);

  useEffect(() => {
    if (reloadSubscribe) {
      unsubscribeReloadRef.current = reloadSubscribe(() => reload());
    }
    inject((wall, teardownWall) => {
      teardownWallRef.current = teardownWall;
      const bridge = new Bridge(wall);

      disposablesRef.current.push(
        // @ts-ignore
        bridge.sub('capabilities', ({ mobxFound }) => {
          setMobxFound(mobxFound);
        }),
        bridge.sub('content-script-installation-error', () => {
          setContentScriptInstallationError(true);
        }),
      );

      bridge.send('backend:ping');
      const connectInterval = setInterval(() => bridge.send('backend:ping'), 500);
      bridge.once('frontend:pong', () => {
        clearInterval(connectInterval);
        storesRef.current = createStores(bridge);

        

        setConnected(true);
        bridge.send('get-capabilities');
      });

      if (!unMountedRef.current) {
        setLoaded(true);
      }
    });

    return () => {
      unMountedRef.current = true;
      reload();
    };
  }, []);

  const renderContent = () => {
    if (contentScriptInstallationError) {
      return <Blocker>Error while installing content-script</Blocker>;
    }
    if (!loaded) {
      return !quiet && <Blocker>Loading...</Blocker>;
    }
    if (!connected) {
      return !quiet && <Blocker>Connecting...</Blocker>;
    }
    if (mobxFound !== true) {
      return !quiet && <Blocker>Looking for mobx...</Blocker>;
    }
    return React.Children.only(children);
  };

  return <div>{renderContent()}</div>;
};

const styles = StyleSheet.create({});
