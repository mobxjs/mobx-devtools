declare module 'mobx-devtools-mst' {
  type Root = object;
  export default function makeInspectable(root: Root): Root;
}
