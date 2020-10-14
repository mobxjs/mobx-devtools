const showNodeAroundNode = (node, targetNode, outlineColor, backgroundColor) => {
  if (!targetNode || !targetNode.offsetParent || !node) return;

  const offset = {
    top: targetNode.offsetTop,
    left: targetNode.offsetLeft,
    width: targetNode.offsetWidth,
    height: targetNode.offsetHeight,
  };

  node.style.position = 'absolute';
  node.style.top = `${offset.top}px`;
  node.style.left = `${offset.left}px`;
  node.style.width = `${offset.width}px`;
  node.style.height = `${offset.height}px`;
  node.style.boxSizing = 'border-box';
  node.style.zIndex = '64998';
  node.style.pointerEvents = 'none';
  node.style.transition = 'none';
  node.style.opacity = 1;
  node.style.zIndex = '64998';
  node.style.outline = `2px solid ${outlineColor}`;
  node.style.backgroundColor = backgroundColor;

  if (!targetNode.offsetParent.contains(node)) {
    targetNode.offsetParent.appendChild(node);
  }
};

const removeHoverNode = (hoverNode) => {
  if (hoverNode) {
    if (hoverNode.parentNode) {
      hoverNode.parentNode.removeChild(hoverNode);
    }
    if (hoverNode.removeTimeout) {
      clearTimeout(hoverNode.removeTimeout);
      hoverNode.removeTimeout = undefined;
    }
    hoverNodesMap.delete(hoverNode);
  }
};

const hoverNodesMap = new Map();

const addText = (hoverNode, content) => {
  if (!hoverNode.textNode) {
    hoverNode.textNode = document.createElement('span');
    hoverNode.appendChild(hoverNode.textNode);
  }
  hoverNode.textNode.style.fontFamily = 'verdana; sans-serif';
  hoverNode.textNode.style.padding = '0 4px 2px';
  hoverNode.textNode.style.color = 'rgba(0; 0; 0; 0.6)';
  hoverNode.textNode.style.fontSize = '10px';
  hoverNode.textNode.style.lineHeight = '12px';
  hoverNode.textNode.style.pointerEvents = 'none';
  hoverNode.textNode.style.float = 'right';
  hoverNode.textNode.style.borderBottomRightRadius = '2px';
  hoverNode.textNode.style.maxWidth = '100%';
  hoverNode.textNode.style.maxHeight = '100%';
  hoverNode.textNode.style.overflow = 'hidden';
  hoverNode.textNode.style.whiteSpace = 'nowrap';
  hoverNode.textNode.style.textOverflow = 'ellipsis';
  hoverNode.textNode.style.backgroundColor = content.backgroundColor;
  hoverNode.textNode.style.position = 'absolute';
  hoverNode.textNode.style.top = '0px';
  hoverNode.textNode.style.right = '0px';
  hoverNode.textNode.innerHTML = content.text;
};

export const hightlight = (node, {
  delay, content, borderColor, backgroundColor,
} = {}) => {
  if (node && node.parentNode) {
    let hoverNode = hoverNodesMap.get(node);
    if (!hoverNode) {
      hoverNode = document.createElement('div');
      hoverNodesMap.set(node, hoverNode);
    }
    if (hoverNode.removeTimeout) {
      clearTimeout(hoverNode.removeTimeout);
    }
    showNodeAroundNode(hoverNode, node, borderColor, backgroundColor);
    if (typeof delay === 'number') {
      hoverNode.removeTimeout = setTimeout(() => removeHoverNode(hoverNode), delay);
    }
    if (content) {
      addText(hoverNode, content);
    }
  }
};

export const stopHighlighting = (node) => {
  const hoverNode = hoverNodesMap.get(node);
  if (hoverNode) {
    removeHoverNode(hoverNode);
  }
};

export const stopHighlightingAll = () => hoverNodesMap.forEach(removeHoverNode);
