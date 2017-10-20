import { hightlight, stopHighlightingAll } from './highlight';

export default (collections, done) => {
  const find = (target) => {
    let node = target;
    while (node) {
      for (const mobxid in collections) {
        if (collections[mobxid].mobxReact) {
          const component = collections[mobxid].mobxReact.componentByNodeRegistery.get(node);
          if (component) {
            return component;
          }
        }
      }
      node = node.parentNode;
    }
    return undefined;
  };

  const handleMouseMove = (e) => {
    stopHighlightingAll();
    if (find(e.target)) {
      hightlight(e.target, { borderColor: 'lightBlue' });
    }
  };

  const handleClick = (e) => {
    const found = find(e.target);
    if (found) {
      e.stopPropagation();
      e.preventDefault();
      dispose();
      done(found);
    }
  };

  document.addEventListener('mousemove', handleMouseMove, true);
  document.addEventListener('click', handleClick, true);

  const dispose = () => {
    document.removeEventListener('mousemove', handleMouseMove, true);
    document.removeEventListener('click', handleClick, true);
    stopHighlightingAll();
  };

  return dispose;
};
