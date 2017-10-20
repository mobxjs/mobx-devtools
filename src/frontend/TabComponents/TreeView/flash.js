export default function flash(node, flashColor, baseColor, duration) {
  node.style.transition = 'none';
  node.style.backgroundColor = flashColor;
  // force recalc
  void node.offsetTop; // eslint-disable-line no-void
  node.style.transition = `background-color ${duration}s ease`;
  node.style.backgroundColor = baseColor;
}
