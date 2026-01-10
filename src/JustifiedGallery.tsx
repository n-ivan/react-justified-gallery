import { useMemo, type SyntheticEvent } from 'react';
import { useContainerWidth } from './useContainerWidth';
import { calculateLayout } from './calculateLayout';
import type { JustifiedGalleryProps, ImageData, RenderImageProps } from './types';

const DEFAULT_GAP = 8;
const DEFAULT_RESIZE_DEBOUNCE = 150;

export function JustifiedGallery({
  images,
  gap = DEFAULT_GAP,
  renderImage,
  resizeDebounce = DEFAULT_RESIZE_DEBOUNCE,
  lazyLoad = true,
  onImageLoad,
  onImageError,
  containerStyle,
  rowStyle,
}: JustifiedGalleryProps) {
  const { containerRef, width } = useContainerWidth(resizeDebounce);

  const layout = useMemo(() => {
    if (width === 0 || images.length === 0) {
      return [];
    }
    return calculateLayout(images, width, gap);
  }, [images, width, gap]);

  const handleImageLoad = (image: ImageData) => (event: SyntheticEvent<HTMLImageElement>) => {
    onImageLoad?.(image, event);
  };

  const handleImageError = (image: ImageData) => (event: SyntheticEvent<HTMLImageElement>) => {
    onImageError?.(image, event);
  };

  const renderDefaultImage = (props: RenderImageProps) => {
    const { image, computedWidth, computedHeight } = props;

    return (
      <img
        src={image.src}
        alt={image.alt ?? ''}
        width={computedWidth}
        height={computedHeight}
        loading={lazyLoad ? 'lazy' : undefined}
        onLoad={handleImageLoad(image)}
        onError={handleImageError(image)}
        style={{
          display: 'block',
          width: computedWidth,
          height: computedHeight,
        }}
      />
    );
  };

  if (width === 0) {
    return (
      <div
        ref={containerRef}
        role="region"
        aria-label="Image gallery"
        style={{
          width: '100%',
          ...containerStyle,
        }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Image gallery"
      style={{
        width: '100%',
        ...containerStyle,
      }}
    >
      {layout.map((row, rowIndex) => (
        <div
          key={rowIndex}
          role="group"
          aria-label={`Gallery row ${rowIndex + 1}`}
          style={{
            display: 'flex',
            gap: gap,
            marginBottom: rowIndex < layout.length - 1 ? gap : 0,
            ...rowStyle,
          }}
        >
          {row.images.map((computedImage, imageIndex) => {
            const { image, computedWidth, computedHeight } = computedImage;
            const isFirstInRow = imageIndex === 0;
            const isLastInRow = imageIndex === row.images.length - 1;

            const renderProps: RenderImageProps = {
              image,
              computedWidth,
              computedHeight,
              originalWidth: image.width,
              originalHeight: image.height,
              rowIndex,
              imageIndex,
              isFirstInRow,
              isLastInRow,
            };

            const content = renderImage
              ? renderImage(renderProps)
              : renderDefaultImage(renderProps);

            return (
              <div
                key={`${rowIndex}-${imageIndex}`}
                tabIndex={0}
                role="img"
                aria-label={image.alt || `Image ${rowIndex + 1}-${imageIndex + 1}`}
                style={{
                  width: computedWidth,
                  height: computedHeight,
                  flexShrink: 0,
                }}
              >
                {content}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
