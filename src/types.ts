import type { CSSProperties, ReactNode, SyntheticEvent } from 'react';

export interface ImageData {
  src: string;
  width: number;
  height: number;
  alt?: string;
  [key: string]: unknown;
}

export interface RenderImageProps {
  image: ImageData;
  rowIndex: number;
  imageIndex: number;
}

export interface JustifiedGalleryProps {
  images: ImageData[][];
  gap?: number;
  renderImage?: (props: RenderImageProps) => ReactNode;
  lazyLoad?: boolean;
  onImageLoad?: (image: ImageData, event: SyntheticEvent<HTMLImageElement>) => void;
  onImageError?: (image: ImageData, event: SyntheticEvent<HTMLImageElement>) => void;
  containerStyle?: CSSProperties;
  rowStyle?: CSSProperties;
}
