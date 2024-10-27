declare module 'mobx-devtools-mst' {
  export default function makeInspectable<T extends object>(root: T): T;
}
