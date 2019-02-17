export default function changeDisplayName(change) {
  if (change.key) {
    return `${change.objectName}.${change.key}`;
  }
  return change.objectName;
}
