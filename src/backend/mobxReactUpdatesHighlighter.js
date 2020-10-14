import { hightlight, stopHighlighting } from './utils/highlight';

export default (bridge) => {
  let updatesEnabled = false;
  let updatesFilterByDuration = { slow: false, medium: false, fast: false };

  const collections = {};

  const disposables = [
    bridge.sub('backend-mobx-react:set-displaying-updates-enabled', (value) => {
      updatesEnabled = value;
    }),
    bridge.sub('backend-mobx-react:set-displaying-updates-filter-by-duration', (filter) => {
      updatesFilterByDuration = filter;
    }),
  ];

  return {
    setup(mobxid, collection) {
      collections[mobxid] = collection;
      if (collection.mobxReact) {
        collection.mobxReact.trackComponents();
        disposables.push(
          collection.mobxReact.renderReporter.on((report) => {
            if (updatesEnabled) {
              if (report.event === 'render') {
                const { slow, medium, fast } = updatesFilterByDuration;
                const isFast = report.totalTime < 25;
                const isMedium = !isFast && report.totalTime < 100;
                const isSlow = !isFast && !isMedium;
                let borderColor;
                let textBgColor;
                if (isFast) {
                  if (!fast) return;
                  borderColor = 'rgba(182, 218, 146, 0.75)';
                  textBgColor = 'rgba(182, 218, 146, 0.75)';
                } else if (isMedium) {
                  if (!medium) return;
                  borderColor = 'rgba(228, 195, 66, 0.85)';
                  textBgColor = 'rgba(228, 195, 66, 0.85)';
                } else if (isSlow) {
                  if (!slow) return;
                  borderColor = 'rgba(228, 171, 171, 0.95)';
                  textBgColor = 'rgba(228, 171, 171, 0.95)';
                }
                hightlight(report.node, {
                  delay: 900,
                  borderColor,
                  content: {
                    text: `${report.renderTime} / ${report.totalTime} ms`,
                    backgroundColor: textBgColor,
                  },
                });
              } else if (report.event === 'destroy') {
                stopHighlighting(report.node);
              }
            }
          })
        );
      }
    },
    dispose() {
      disposables.forEach((fn) => fn());
    },
  };
};
