export default bridge => {
  let mobxFound = false;
  let mobxReactFound = false;
  let mstFound = false;

  const sendCapabilities = () =>
    bridge.send('capabilities', {
      mobxFound,
      mobxReactFound,
      mstFound,
    });

  sendCapabilities();

  const disposables = [bridge.sub('get-capabilities', sendCapabilities)];

  return {
    setup(mobxid, collection) {
      if (collection.mobx) {
        mobxFound = true;
      }
      if (collection.mobxReact) {
        mobxReactFound = true;
      }
      if (collection.mst) {
        mstFound = true;
      }
      sendCapabilities();
    },
    dispose() {
      disposables.forEach(fn => fn());
    },
  };
};
