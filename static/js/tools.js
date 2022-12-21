export function removeAllChildNodes(parent, options = {}) {
  for (let i = 0; i < parent.childElementCount; i++) {
    if (options.filter)
      if (!parent.children[i].matches(options.filter)) continue;
    parent.removeChild(parent.children[i]);
    i--;
  }
}

export function getShadowHost(event) {
  for (let i of event.composedPath()) {
    if (i.host) {
      return i.host;
    }
  }
}

export default async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function findIndex(thisNode) {
  if (!thisNode.isConnected) return null;
  return Array.prototype.indexOf.call(thisNode.parentNode.children, thisNode);
}

export function objectFlip(obj) {
  return Object.entries(obj).reduce((ret, entry) => {
    const [key, value] = entry;
    ret[value] = key;
    return ret;
  }, {});
}
