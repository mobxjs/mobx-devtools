import { symbols } from '../Bridge';

const deduplicateDependencies = (depTree) => {
  if (!depTree.dependencies) return;

  for (let i = depTree.dependencies.length - 1; i >= 0; i -= 1) {
    const name = depTree.dependencies[i].name;
    for (let i2 = i - 1; i2 >= 0; i2 -= 1) {
      if (depTree.dependencies[i2].name === name) {
        depTree.dependencies[i2].dependencies = [].concat(
          depTree.dependencies[i2].dependencies || [],
          depTree.dependencies[i].dependencies || []
        );
        depTree.dependencies.splice(i, 1);
        break;
      }
    }
  }
  depTree.dependencies.forEach(deduplicateDependencies);
};

const unique = (list) => {
  const seen = new Set();
  return list.filter((item) => {
    if (seen.has(item)) return false;
    seen.add(item);
    return true;
  });
};

const getDepsTree = node => ({
  dependencies: node.observing ? unique(node.observing).map(n => getDepsTree(n)) : [],
  node,
  constructorName: node.constructor.name,
  [symbols.name]: node.name,
  [symbols.type]: 'deptreeNode',
});

export default (node, dedupe = false) => {
  const tree = getDepsTree(node);
  if (dedupe) deduplicateDependencies(tree);
  return tree;
};
