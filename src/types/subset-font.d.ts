declare module "subset-font" {
  type SubsetFontOptions = {
    targetFormat?: "woff2" | "woff" | "truetype";
  };

  export default function subsetFont(
    buffer: Buffer | Uint8Array,
    text: string,
    options?: SubsetFontOptions,
  ): Promise<Buffer>;
}
