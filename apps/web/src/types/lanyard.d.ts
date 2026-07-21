// Type declarations needed for the Lanyard component (components/profile/lanyard).
// The card model and its texture are served as plain files from /public and
// referenced by URL string (see Lanyard.tsx) rather than imported as JS
// modules, so no .glb module declaration is needed. What TypeScript doesn't
// know about on its own is the JSX elements `meshline` registers via
// react-three-fiber's `extend()`.
//
// NOTE: this project is on @react-three/fiber v8 (React 18-compatible).
// v8's extension point for custom `extend()`'d elements is the global
// JSX.IntrinsicElements namespace directly — `ThreeElements` is a v9-only
// interface and augmenting it here is a silent no-op on v8, which is why
// meshLineMaterial fell back to a stricter default type missing `color`.

declare module 'meshline' {
  export const MeshLineGeometry: any;
  export const MeshLineMaterial: any;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: any;
      meshLineMaterial: any;
    }
  }
}

export {};