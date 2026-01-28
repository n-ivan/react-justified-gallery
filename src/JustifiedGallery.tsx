import type { JustifiedGalleryProps } from './types';

const DEFAULT_GAP = 8;

export function JustifiedGallery({
  images,
  gap = DEFAULT_GAP,
  renderImage,
  lazyLoad = true,
  onImageLoad,
  onImageError,
  containerStyle,
  rowStyle,
}: JustifiedGalleryProps) {
  return (
    <div
      role="region"
      aria-label="Image gallery"
      style={{
        width: '100%',
        ...containerStyle,
      }}
    >
      {images.map((row, rowIndex) => (
        <div
          key={rowIndex}
          role="group"
          aria-label={`Gallery row ${rowIndex + 1}`}
          style={{
            display: 'flex',
            gap,
            marginBottom: rowIndex < images.length - 1 ? gap : 0,
            ...rowStyle,
          }}
        >
          {row.map((image, imageIndex) => {
            const aspectRatio = image.width / image.height;

            if (renderImage) {
              return (
                <div
                  key={imageIndex}
                  tabIndex={0}
                  role="img"
                  aria-label={image.alt || `Image ${rowIndex + 1}-${imageIndex + 1}`}
                  style={{
                    flex: `${aspectRatio} 1 0`,
                    aspectRatio: `${image.width} / ${image.height}`,
                  }}
                >
                  {renderImage({ image, rowIndex, imageIndex })}
                </div>
              );
            }

            return (
              <img
                key={imageIndex}
                src={image.src}
                alt={image.alt ?? ''}
                tabIndex={0}
                role="img"
                aria-label={image.alt || `Image ${rowIndex + 1}-${imageIndex + 1}`}
                loading={lazyLoad ? 'lazy' : undefined}
                onLoad={(e) => onImageLoad?.(image, e)}
                onError={(e) => onImageError?.(image, e)}
                style={{
                  flex: `${aspectRatio} 1 0`,
                  aspectRatio: `${image.width} / ${image.height}`,
                  objectFit: 'cover',
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
