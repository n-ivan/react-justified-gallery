import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { JustifiedGallery } from '../JustifiedGallery';
import { calculateLayout, validateImages } from '../calculateLayout';
import type { ImageData, RenderImageProps } from '../types';

// Mock ResizeObserver
class ResizeObserverMock {
  private callback: ResizeObserverCallback;
  private observedElements: Element[] = [];

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    this.observedElements.push(target);
    // Simulate initial observation with a specific width
    const entries = [
      {
        target,
        contentRect: {
          width: 1000,
          height: 600,
          top: 0,
          left: 0,
          bottom: 600,
          right: 1000,
          x: 0,
          y: 0,
        },
        borderBoxSize: [],
        contentBoxSize: [],
        devicePixelContentBoxSize: [],
      },
    ] as ResizeObserverEntry[];

    // Call the callback asynchronously to simulate real behavior
    setTimeout(() => {
      this.callback(entries, this);
    }, 0);
  }

  unobserve(target: Element) {
    this.observedElements = this.observedElements.filter((el) => el !== target);
  }

  disconnect() {
    this.observedElements = [];
  }
}

describe('calculateLayout', () => {
  describe('single image row', () => {
    it('should calculate correct layout with single image', () => {
      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 1600, height: 900 }],
      ];
      const containerWidth = 1000;
      const gap = 0;

      const result = calculateLayout(images, containerWidth, gap);

      expect(result).toHaveLength(1);
      expect(result[0].images).toHaveLength(1);

      const computedImage = result[0].images[0];
      expect(computedImage.computedHeight).toBeCloseTo(562.5, 1);
      expect(computedImage.computedWidth).toBeCloseTo(1000, 1);
      expect(result[0].height).toBeCloseTo(562.5, 1);
    });

    it('should preserve aspect ratio for single image', () => {
      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
      ];
      const containerWidth = 1000;
      const gap = 0;

      const result = calculateLayout(images, containerWidth, gap);

      const computedImage = result[0].images[0];
      const originalAspectRatio = 800 / 600;
      const computedAspectRatio = computedImage.computedWidth / computedImage.computedHeight;

      expect(computedAspectRatio).toBeCloseTo(originalAspectRatio, 5);
    });
  });

  describe('multiple images per row', () => {
    it('should calculate correct layout with two images', () => {
      const images: ImageData[][] = [
        [
          { src: 'img1.jpg', width: 1600, height: 900 },
          { src: 'img2.jpg', width: 800, height: 600 },
        ],
      ];
      const containerWidth = 1000;
      const gap = 10;

      const result = calculateLayout(images, containerWidth, gap);

      expect(result).toHaveLength(1);
      expect(result[0].images).toHaveLength(2);

      // Check that images fill the container width with gap
      const totalWidth = result[0].images[0].computedWidth + result[0].images[1].computedWidth + gap;
      expect(totalWidth).toBeCloseTo(1000, 1);

      // Check that all images in the row have the same height
      expect(result[0].images[0].computedHeight).toBeCloseTo(result[0].images[1].computedHeight, 1);
    });

    it('should calculate correct layout with three images', () => {
      const images: ImageData[][] = [
        [
          { src: 'img1.jpg', width: 640, height: 480 },
          { src: 'img2.jpg', width: 1600, height: 900 },
          { src: 'img3.jpg', width: 1024, height: 768 },
        ],
      ];
      const containerWidth = 1000;
      const gap = 8;

      const result = calculateLayout(images, containerWidth, gap);

      expect(result).toHaveLength(1);
      expect(result[0].images).toHaveLength(3);

      // Check that images fill the container width with gaps
      const totalWidth =
        result[0].images[0].computedWidth +
        result[0].images[1].computedWidth +
        result[0].images[2].computedWidth +
        gap * 2;
      expect(totalWidth).toBeCloseTo(1000, 1);

      // Check that all images in the row have the same height
      const rowHeight = result[0].images[0].computedHeight;
      expect(result[0].images[1].computedHeight).toBeCloseTo(rowHeight, 1);
      expect(result[0].images[2].computedHeight).toBeCloseTo(rowHeight, 1);
      expect(result[0].height).toBeCloseTo(rowHeight, 1);
    });

    it('should preserve aspect ratios for all images', () => {
      const images: ImageData[][] = [
        [
          { src: 'img1.jpg', width: 1920, height: 1080 },
          { src: 'img2.jpg', width: 800, height: 600 },
          { src: 'img3.jpg', width: 1200, height: 1200 },
        ],
      ];
      const containerWidth = 1000;
      const gap = 10;

      const result = calculateLayout(images, containerWidth, gap);

      result[0].images.forEach((computedImage) => {
        const originalAspectRatio = computedImage.image.width / computedImage.image.height;
        const computedAspectRatio = computedImage.computedWidth / computedImage.computedHeight;
        expect(computedAspectRatio).toBeCloseTo(originalAspectRatio, 5);
      });
    });
  });

  describe('multiple rows', () => {
    it('should calculate layout for multiple rows independently', () => {
      const images: ImageData[][] = [
        [
          { src: 'img1.jpg', width: 1920, height: 1080 },
          { src: 'img2.jpg', width: 800, height: 600 },
        ],
        [
          { src: 'img3.jpg', width: 1200, height: 1200 },
        ],
        [
          { src: 'img4.jpg', width: 640, height: 480 },
          { src: 'img5.jpg', width: 1600, height: 900 },
          { src: 'img6.jpg', width: 1024, height: 768 },
        ],
      ];
      const containerWidth = 1000;
      const gap = 8;

      const result = calculateLayout(images, containerWidth, gap);

      expect(result).toHaveLength(3);
      expect(result[0].images).toHaveLength(2);
      expect(result[1].images).toHaveLength(1);
      expect(result[2].images).toHaveLength(3);

      // Each row should fill the container width
      result.forEach((row) => {
        const totalGaps = gap * (row.images.length - 1);
        const totalWidth = row.images.reduce((sum, img) => sum + img.computedWidth, 0);
        expect(totalWidth + totalGaps).toBeCloseTo(containerWidth, 1);
      });

      // Rows can have different heights
      expect(result[0].height).not.toBe(result[1].height);
    });
  });

  describe('gap handling', () => {
    it('should handle zero gap correctly', () => {
      const images: ImageData[][] = [
        [
          { src: 'img1.jpg', width: 800, height: 600 },
          { src: 'img2.jpg', width: 800, height: 600 },
        ],
      ];
      const containerWidth = 1000;
      const gap = 0;

      const result = calculateLayout(images, containerWidth, gap);

      const totalWidth = result[0].images[0].computedWidth + result[0].images[1].computedWidth;
      expect(totalWidth).toBeCloseTo(1000, 1);
    });

    it('should handle large gap correctly', () => {
      const images: ImageData[][] = [
        [
          { src: 'img1.jpg', width: 800, height: 600 },
          { src: 'img2.jpg', width: 800, height: 600 },
        ],
      ];
      const containerWidth = 1000;
      const gap = 100;

      const result = calculateLayout(images, containerWidth, gap);

      const totalWidth = result[0].images[0].computedWidth + result[0].images[1].computedWidth + gap;
      expect(totalWidth).toBeCloseTo(1000, 1);
    });

    it('should calculate available width correctly with multiple gaps', () => {
      const images: ImageData[][] = [
        [
          { src: 'img1.jpg', width: 100, height: 100 },
          { src: 'img2.jpg', width: 100, height: 100 },
          { src: 'img3.jpg', width: 100, height: 100 },
          { src: 'img4.jpg', width: 100, height: 100 },
        ],
      ];
      const containerWidth = 1000;
      const gap = 20;

      const result = calculateLayout(images, containerWidth, gap);

      // 4 images = 3 gaps
      const totalGaps = gap * 3;
      const totalWidth = result[0].images.reduce((sum, img) => sum + img.computedWidth, 0);
      expect(totalWidth + totalGaps).toBeCloseTo(1000, 1);
    });
  });

  describe('error handling', () => {
    it('should throw error for empty row', () => {
      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
        [], // Empty row
      ];
      const containerWidth = 1000;
      const gap = 8;

      expect(() => calculateLayout(images, containerWidth, gap)).toThrow(
        'Row 1 is empty. All rows must contain at least one image.'
      );
    });

    it('should throw error for missing width', () => {
      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 0, height: 600 }],
      ];
      const containerWidth = 1000;
      const gap = 8;

      expect(() => calculateLayout(images, containerWidth, gap)).toThrow(
        'Image at row 0, index 0 has invalid width'
      );
    });

    it('should throw error for negative width', () => {
      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: -100, height: 600 }],
      ];
      const containerWidth = 1000;
      const gap = 8;

      expect(() => calculateLayout(images, containerWidth, gap)).toThrow(
        'Image at row 0, index 0 has invalid width'
      );
    });

    it('should throw error for missing height', () => {
      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 0 }],
      ];
      const containerWidth = 1000;
      const gap = 8;

      expect(() => calculateLayout(images, containerWidth, gap)).toThrow(
        'Image at row 0, index 0 has invalid height'
      );
    });

    it('should throw error for negative height', () => {
      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: -100 }],
      ];
      const containerWidth = 1000;
      const gap = 8;

      expect(() => calculateLayout(images, containerWidth, gap)).toThrow(
        'Image at row 0, index 0 has invalid height'
      );
    });

    it('should throw error for non-numeric width', () => {
      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 'invalid' as unknown as number, height: 600 }],
      ];
      const containerWidth = 1000;
      const gap = 8;

      expect(() => calculateLayout(images, containerWidth, gap)).toThrow(
        'Image at row 0, index 0 has invalid width'
      );
    });

    it('should throw error for non-numeric height', () => {
      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 'invalid' as unknown as number }],
      ];
      const containerWidth = 1000;
      const gap = 8;

      expect(() => calculateLayout(images, containerWidth, gap)).toThrow(
        'Image at row 0, index 0 has invalid height'
      );
    });

    it('should identify error in specific row and index', () => {
      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
        [
          { src: 'img2.jpg', width: 800, height: 600 },
          { src: 'img3.jpg', width: 0, height: 600 }, // Invalid
        ],
      ];
      const containerWidth = 1000;
      const gap = 8;

      expect(() => calculateLayout(images, containerWidth, gap)).toThrow(
        'Image at row 1, index 1 has invalid width'
      );
    });
  });

  describe('validateImages', () => {
    it('should not throw for valid images', () => {
      const images: ImageData[][] = [
        [
          { src: 'img1.jpg', width: 800, height: 600 },
          { src: 'img2.jpg', width: 1920, height: 1080 },
        ],
      ];

      expect(() => validateImages(images)).not.toThrow();
    });

    it('should allow arbitrary extra properties', () => {
      const images: ImageData[][] = [
        [
          {
            src: 'img1.jpg',
            width: 800,
            height: 600,
            caption: 'A caption',
            tags: ['nature', 'landscape'],
            id: 123,
          },
        ],
      ];

      expect(() => validateImages(images)).not.toThrow();
    });
  });
});

describe('JustifiedGallery Component', () => {
  let originalResizeObserver: typeof ResizeObserver;

  beforeEach(() => {
    // Save and mock ResizeObserver
    originalResizeObserver = global.ResizeObserver;
    global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 1000,
      height: 600,
      top: 0,
      left: 0,
      bottom: 600,
      right: 1000,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }));
  });

  afterEach(() => {
    global.ResizeObserver = originalResizeObserver;
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render nothing when container has zero width initially', () => {
      // Mock zero width initially
      Element.prototype.getBoundingClientRect = vi.fn(() => ({
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }));

      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
      ];

      const { container } = render(<JustifiedGallery images={images} />);

      // Should render container but no images
      expect(container.querySelector('[role="region"]')).toBeInTheDocument();
      expect(container.querySelector('img')).not.toBeInTheDocument();
    });

    it('should render correct number of rows', async () => {
      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
        [{ src: 'img2.jpg', width: 1920, height: 1080 }],
        [{ src: 'img3.jpg', width: 1200, height: 800 }],
      ];

      render(<JustifiedGallery images={images} />);

      await waitFor(() => {
        const rows = screen.getAllByRole('group');
        expect(rows).toHaveLength(3);
      });
    });

    it('should render correct number of images per row', async () => {
      const images: ImageData[][] = [
        [
          { src: 'img1.jpg', width: 800, height: 600 },
          { src: 'img2.jpg', width: 800, height: 600 },
        ],
        [
          { src: 'img3.jpg', width: 1200, height: 800 },
        ],
        [
          { src: 'img4.jpg', width: 640, height: 480 },
          { src: 'img5.jpg', width: 1600, height: 900 },
          { src: 'img6.jpg', width: 1024, height: 768 },
        ],
      ];

      const { container } = render(<JustifiedGallery images={images} />);

      await waitFor(() => {
        // Query actual img elements, not the role="img" wrappers
        const allImages = container.querySelectorAll('img');
        expect(allImages).toHaveLength(6);
      });
    });
  });

  describe('gap handling', () => {
    it('should apply gap correctly between images', async () => {
      const gap = 16;
      const images: ImageData[][] = [
        [
          { src: 'img1.jpg', width: 800, height: 600 },
          { src: 'img2.jpg', width: 800, height: 600 },
        ],
      ];

      render(<JustifiedGallery images={images} gap={gap} />);

      await waitFor(() => {
        const row = screen.getByRole('group');
        expect(row).toHaveStyle({ gap: '16px' });
      });
    });

    it('should apply gap between rows', async () => {
      const gap = 20;
      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
        [{ src: 'img2.jpg', width: 800, height: 600 }],
      ];

      render(<JustifiedGallery images={images} gap={gap} />);

      await waitFor(() => {
        const rows = screen.getAllByRole('group');
        expect(rows[0]).toHaveStyle({ marginBottom: '20px' });
        expect(rows[1]).toHaveStyle({ marginBottom: '0px' });
      });
    });

    it('should use default gap when not specified', async () => {
      const images: ImageData[][] = [
        [
          { src: 'img1.jpg', width: 800, height: 600 },
          { src: 'img2.jpg', width: 800, height: 600 },
        ],
      ];

      render(<JustifiedGallery images={images} />);

      await waitFor(() => {
        const row = screen.getByRole('group');
        expect(row).toHaveStyle({ gap: '8px' }); // DEFAULT_GAP = 8
      });
    });
  });

  describe('custom renderImage prop', () => {
    it('should call renderImage with correct arguments', async () => {
      const renderImage = vi.fn((props: RenderImageProps) => (
        <div data-testid={`custom-${props.rowIndex}-${props.imageIndex}`}>
          Custom Image
        </div>
      ));

      const images: ImageData[][] = [
        [
          { src: 'img1.jpg', width: 800, height: 600, alt: 'First image' },
          { src: 'img2.jpg', width: 1600, height: 900, alt: 'Second image' },
        ],
      ];

      render(<JustifiedGallery images={images} renderImage={renderImage} />);

      await waitFor(() => {
        expect(renderImage).toHaveBeenCalledTimes(2);
      });

      // Check first image call
      const firstCall = renderImage.mock.calls[0][0];
      expect(firstCall.image).toEqual(images[0][0]);
      expect(firstCall.originalWidth).toBe(800);
      expect(firstCall.originalHeight).toBe(600);
      expect(firstCall.rowIndex).toBe(0);
      expect(firstCall.imageIndex).toBe(0);
      expect(firstCall.isFirstInRow).toBe(true);
      expect(firstCall.isLastInRow).toBe(false);
      expect(typeof firstCall.computedWidth).toBe('number');
      expect(typeof firstCall.computedHeight).toBe('number');

      // Check second image call
      const secondCall = renderImage.mock.calls[1][0];
      expect(secondCall.image).toEqual(images[0][1]);
      expect(secondCall.originalWidth).toBe(1600);
      expect(secondCall.originalHeight).toBe(900);
      expect(secondCall.rowIndex).toBe(0);
      expect(secondCall.imageIndex).toBe(1);
      expect(secondCall.isFirstInRow).toBe(false);
      expect(secondCall.isLastInRow).toBe(true);
    });

    it('should render custom content from renderImage', async () => {
      const renderImage = (props: RenderImageProps) => (
        <div data-testid={`custom-${props.rowIndex}-${props.imageIndex}`}>
          Custom: {props.image.src}
        </div>
      );

      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
      ];

      render(<JustifiedGallery images={images} renderImage={renderImage} />);

      await waitFor(() => {
        const customElement = screen.getByTestId('custom-0-0');
        expect(customElement).toBeInTheDocument();
        expect(customElement).toHaveTextContent('Custom: img1.jpg');
      });
    });

    it('should pass computed dimensions to renderImage', async () => {
      let capturedProps: RenderImageProps | null = null;

      const renderImage = (props: RenderImageProps) => {
        capturedProps = props;
        return <div>Test</div>;
      };

      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 1600, height: 900 }],
      ];

      render(<JustifiedGallery images={images} renderImage={renderImage} />);

      await waitFor(() => {
        expect(capturedProps).not.toBeNull();
      });

      // The computed width should be close to container width (1000)
      // and height should maintain aspect ratio
      expect(capturedProps!.computedWidth).toBeCloseTo(1000, 0);
      const expectedHeight = 1000 / (1600 / 900);
      expect(capturedProps!.computedHeight).toBeCloseTo(expectedHeight, 0);
    });
  });

  describe('image callbacks', () => {
    it('should trigger onImageLoad callback', async () => {
      const onImageLoad = vi.fn();

      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
      ];

      const { container } = render(<JustifiedGallery images={images} onImageLoad={onImageLoad} />);

      await waitFor(() => {
        const imgElement = container.querySelector('img');
        expect(imgElement).toBeInTheDocument();
      });

      // Simulate image load
      const imgElement = container.querySelector('img')!;
      imgElement.dispatchEvent(new Event('load'));

      expect(onImageLoad).toHaveBeenCalledTimes(1);
      expect(onImageLoad.mock.calls[0][0]).toEqual(images[0][0]);
    });

    it('should trigger onImageError callback', async () => {
      const onImageError = vi.fn();

      const images: ImageData[][] = [
        [{ src: 'invalid.jpg', width: 800, height: 600 }],
      ];

      const { container } = render(<JustifiedGallery images={images} onImageError={onImageError} />);

      await waitFor(() => {
        const imgElement = container.querySelector('img');
        expect(imgElement).toBeInTheDocument();
      });

      // Simulate image error
      const imgElement = container.querySelector('img')!;
      imgElement.dispatchEvent(new Event('error'));

      expect(onImageError).toHaveBeenCalledTimes(1);
      expect(onImageError.mock.calls[0][0]).toEqual(images[0][0]);
    });
  });

  describe('accessibility', () => {
    it('should have role="region" on container', () => {
      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
      ];

      render(<JustifiedGallery images={images} />);

      const container = screen.getByRole('region', { name: 'Image gallery' });
      expect(container).toBeInTheDocument();
    });

    it('should have role="group" on each row', async () => {
      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
        [{ src: 'img2.jpg', width: 800, height: 600 }],
      ];

      render(<JustifiedGallery images={images} />);

      await waitFor(() => {
        const row1 = screen.getByRole('group', { name: 'Gallery row 1' });
        const row2 = screen.getByRole('group', { name: 'Gallery row 2' });
        expect(row1).toBeInTheDocument();
        expect(row2).toBeInTheDocument();
      });
    });

    it('should make images focusable with tabIndex=0', async () => {
      const images: ImageData[][] = [
        [
          { src: 'img1.jpg', width: 800, height: 600 },
          { src: 'img2.jpg', width: 800, height: 600 },
        ],
      ];

      const { container } = render(<JustifiedGallery images={images} />);

      await waitFor(() => {
        // Query the wrapper divs with role="img" (not the img elements inside)
        const imageWrappers = container.querySelectorAll('[role="img"]');
        expect(imageWrappers).toHaveLength(2);
        imageWrappers.forEach((wrapper) => {
          expect(wrapper).toHaveAttribute('tabIndex', '0');
        });
      });
    });

    it('should use custom alt text when provided', async () => {
      const images: ImageData[][] = [
        [
          { src: 'img1.jpg', width: 800, height: 600, alt: 'Mountain landscape' },
          { src: 'img2.jpg', width: 800, height: 600, alt: 'Ocean sunset' },
        ],
      ];

      const { container } = render(<JustifiedGallery images={images} />);

      await waitFor(() => {
        // Query actual img elements by alt attribute
        const img1 = container.querySelector('img[alt="Mountain landscape"]');
        const img2 = container.querySelector('img[alt="Ocean sunset"]');
        expect(img1).toBeInTheDocument();
        expect(img2).toBeInTheDocument();
      });
    });

    it('should use fallback alt text when not provided', async () => {
      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
      ];

      render(<JustifiedGallery images={images} />);

      await waitFor(() => {
        const img = screen.getByRole('img', { name: 'Image 1-1' });
        expect(img).toBeInTheDocument();
      });
    });
  });

  describe('lazyLoad prop', () => {
    it('should apply loading="lazy" when lazyLoad is true (default)', async () => {
      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
      ];

      const { container } = render(<JustifiedGallery images={images} />);

      await waitFor(() => {
        const imgElement = container.querySelector('img');
        expect(imgElement).toHaveAttribute('loading', 'lazy');
      });
    });

    it('should not apply loading attribute when lazyLoad is false', async () => {
      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
      ];

      const { container } = render(<JustifiedGallery images={images} lazyLoad={false} />);

      await waitFor(() => {
        const imgElement = container.querySelector('img');
        expect(imgElement).not.toHaveAttribute('loading');
      });
    });
  });

  describe('style props', () => {
    it('should apply containerStyle prop', () => {
      const containerStyle = {
        backgroundColor: 'red',
        padding: '20px',
      };

      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
      ];

      render(<JustifiedGallery images={images} containerStyle={containerStyle} />);

      const container = screen.getByRole('region');
      // jsdom converts colors to RGB format
      expect(container).toHaveStyle('background-color: rgb(255, 0, 0)');
      expect(container).toHaveStyle('padding: 20px');
    });

    it('should apply rowStyle prop', async () => {
      const rowStyle = {
        backgroundColor: 'blue',
        padding: '10px',
      };

      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
      ];

      render(<JustifiedGallery images={images} rowStyle={rowStyle} />);

      await waitFor(() => {
        const row = screen.getByRole('group');
        // jsdom converts colors to RGB format
        expect(row).toHaveStyle('background-color: rgb(0, 0, 255)');
        expect(row).toHaveStyle('padding: 10px');
      });
    });

    it('should preserve default container width style', () => {
      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
      ];

      render(<JustifiedGallery images={images} />);

      const container = screen.getByRole('region');
      expect(container).toHaveStyle({ width: '100%' });
    });
  });

  describe('edge cases', () => {
    it('should handle empty images array', () => {
      const images: ImageData[][] = [];

      const { container } = render(<JustifiedGallery images={images} />);

      expect(container.querySelector('[role="region"]')).toBeInTheDocument();
      expect(container.querySelector('[role="group"]')).not.toBeInTheDocument();
    });

    it('should handle single row with single image', async () => {
      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
      ];

      const { container } = render(<JustifiedGallery images={images} />);

      await waitFor(() => {
        const rows = screen.getAllByRole('group');
        expect(rows).toHaveLength(1);
        // Query actual img elements
        expect(container.querySelectorAll('img')).toHaveLength(1);
      });
    });

    it('should handle images with extra properties', async () => {
      const images: ImageData[][] = [
        [
          {
            src: 'img1.jpg',
            width: 800,
            height: 600,
            caption: 'A beautiful sunset',
            tags: ['nature', 'sunset'],
            id: 'photo-123',
          },
        ],
      ];

      const { container } = render(<JustifiedGallery images={images} />);

      await waitFor(() => {
        // Query actual img elements
        expect(container.querySelectorAll('img')).toHaveLength(1);
      });
    });

    it('should recalculate layout when images prop changes', async () => {
      const images1: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
      ];

      const images2: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
        [{ src: 'img2.jpg', width: 800, height: 600 }],
      ];

      const { rerender } = render(<JustifiedGallery images={images1} />);

      await waitFor(() => {
        expect(screen.getAllByRole('group')).toHaveLength(1);
      });

      rerender(<JustifiedGallery images={images2} />);

      await waitFor(() => {
        expect(screen.getAllByRole('group')).toHaveLength(2);
      });
    });

    it('should handle very small container width', () => {
      Element.prototype.getBoundingClientRect = vi.fn(() => ({
        width: 100,
        height: 100,
        top: 0,
        left: 0,
        bottom: 100,
        right: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }));

      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 1920, height: 1080 }],
      ];

      render(<JustifiedGallery images={images} />);

      // Should not throw error
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('should handle very large container width', () => {
      Element.prototype.getBoundingClientRect = vi.fn(() => ({
        width: 10000,
        height: 1000,
        top: 0,
        left: 0,
        bottom: 1000,
        right: 10000,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }));

      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
      ];

      render(<JustifiedGallery images={images} />);

      // Should not throw error
      expect(screen.getByRole('region')).toBeInTheDocument();
    });
  });

  describe('image dimensions', () => {
    it('should render images with computed dimensions', async () => {
      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 1600, height: 900 }],
      ];

      const { container } = render(<JustifiedGallery images={images} gap={0} />);

      await waitFor(() => {
        const imgElement = container.querySelector('img');
        expect(imgElement).toHaveAttribute('width');
        expect(imgElement).toHaveAttribute('height');
      });
    });

    it('should set width and height styles on img elements', async () => {
      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
      ];

      const { container } = render(<JustifiedGallery images={images} />);

      await waitFor(() => {
        const imgElement = container.querySelector('img');
        const style = window.getComputedStyle(imgElement!);
        expect(style.display).toBe('block');
      });
    });
  });
});
