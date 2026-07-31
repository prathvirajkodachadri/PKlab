/**
 * Minimal ambient typing for KaTeX (bundle ships without official .d.ts).
 */
declare module "katex" {
  interface KatexOptions {
    displayMode?: boolean;
    throwOnError?: boolean;
    output?: string;
    strict?: boolean | string;
  }
  const katex: {
    renderToString(tex: string, options?: KatexOptions): string;
  };
  export default katex;
}
