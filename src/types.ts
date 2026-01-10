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
  computedWidth: number;
  computedHeight: number;
  originalWidth: number;
  originalHeight: number;
  rowIndex: number;
  imageIndex: number;
  isFirstInRow: boolean;
  isLastInRow: boolean;
}

export interface JustifiedGalleryProps {
  images: ImageData[][];
  gap?: number;
  renderImage?: (props: RenderImageProps) => ReactNode;
  resizeDebounce?: number;
  lazyLoad?: boolean;
  onImageLoad?: (image: ImageData, event: SyntheticEvent<HTMLImageElement>) => void;
  onImageError?: (image: ImageData, event: SyntheticEvent<HTMLImageElement>) => void;
  containerStyle?: CSSProperties;
  rowStyle?: CSSProperties;
}

export interface ComputedImage {
  image: ImageData;
  computedWidth: number;
  computedHeight: number;
}

export interface ComputedRow {
  images: ComputedImage[];
  height: number;
}
