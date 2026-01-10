import { useState } from 'react';
import { JustifiedGallery, type ImageData, type RenderImageProps } from '../src';

const App = () => {
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);

  const galleryData: ImageData[][] = [
    [
      { src: 'https://picsum.photos/id/10/800/600', width: 800, height: 600, alt: 'Landscape 1' },
      { src: 'https://picsum.photos/id/11/1200/800', width: 1200, height: 800, alt: 'Landscape 2' },
      { src: 'https://picsum.photos/id/12/900/700', width: 900, height: 700, alt: 'Landscape 3' },
    ],
    [
      { src: 'https://picsum.photos/id/13/1000/1000', width: 1000, height: 1000, alt: 'Square 1' },
      { src: 'https://picsum.photos/id/14/600/900', width: 600, height: 900, alt: 'Portrait 1' },
    ],
    [
      { src: 'https://picsum.photos/id/15/1400/900', width: 1400, height: 900, alt: 'Wide landscape' },
      { src: 'https://picsum.photos/id/16/800/800', width: 800, height: 800, alt: 'Square 2' },
      { src: 'https://picsum.photos/id/17/700/500', width: 700, height: 500, alt: 'Landscape 4' },
      { src: 'https://picsum.photos/id/18/500/700', width: 500, height: 700, alt: 'Portrait 2' },
    ],
    [
      { src: 'https://picsum.photos/id/19/1100/600', width: 1100, height: 600, alt: 'Landscape 5' },
      { src: 'https://picsum.photos/id/20/900/900', width: 900, height: 900, alt: 'Square 3' },
      { src: 'https://picsum.photos/id/21/1000/700', width: 1000, height: 700, alt: 'Landscape 6' },
    ],
  ];

  const renderImage = ({
    image,
    computedWidth,
    computedHeight,
    rowIndex,
    imageIndex,
  }: RenderImageProps) => {
    const imageKey = `${rowIndex}-${imageIndex}`;
    const isHovered = hoveredImage === imageKey;

    return (
      <div
        style={{
          position: 'relative',
          width: computedWidth,
          height: computedHeight,
          overflow: 'hidden',
          cursor: 'pointer',
        }}
        onMouseEnter={() => setHoveredImage(imageKey)}
        onMouseLeave={() => setHoveredImage(null)}
      >
        <img
          src={image.src}
          alt={image.alt ?? ''}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.3s ease',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          }}
        />
        {isHovered && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {image.alt}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '40px 20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#333', marginBottom: '8px' }}>
            React Justified Gallery
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#666', margin: 0 }}>
            A responsive image gallery with justified layout
          </p>
        </header>

        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <JustifiedGallery images={galleryData} gap={8} renderImage={renderImage} />
        </div>

        <footer style={{ marginTop: '40px', textAlign: 'center', color: '#999', fontSize: '0.875rem' }}>
          <p>Hover over images to see the custom render prop in action</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
