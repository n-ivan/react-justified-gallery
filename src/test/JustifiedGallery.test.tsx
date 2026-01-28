import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JustifiedGallery } from '../JustifiedGallery';
import type { ImageData, RenderImageProps } from '../types';

describe('JustifiedGallery Component', () => {
  describe('rendering', () => {
    it('should render correct number of rows', () => {
      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
        [{ src: 'img2.jpg', width: 1920, height: 1080 }],
        [{ src: 'img3.jpg', width: 1200, height: 800 }],
      ];

      render(<JustifiedGallery images={images} />);

      const rows = screen.getAllByRole('group');
      expect(rows).toHaveLength(3);
    });

    it('should render correct number of images per row', () => {
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

      const allImages = container.querySelectorAll('img');
      expect(allImages).toHaveLength(6);
    });

    it('should apply flex styles based on aspect ratio', () => {
      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 1600, height: 900 }],
      ];

      const { container } = render(<JustifiedGallery images={images} />);

      const imgElement = container.querySelector('img');
      expect(imgElement).toHaveStyle({
        flex: `${1600 / 900} 1 0`,
        aspectRatio: '1600 / 900',
      });
    });
  });

  describe('gap handling', () => {
    it('should apply gap correctly between images', () => {
      const gap = 16;
      const images: ImageData[][] = [
        [
          { src: 'img1.jpg', width: 800, height: 600 },
          { src: 'img2.jpg', width: 800, height: 600 },
        ],
      ];

      render(<JustifiedGallery images={images} gap={gap} />);

      const row = screen.getByRole('group');
      expect(row).toHaveStyle({ gap: '16px' });
    });

    it('should apply gap between rows', () => {
      const gap = 20;
      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
        [{ src: 'img2.jpg', width: 800, height: 600 }],
      ];

      render(<JustifiedGallery images={images} gap={gap} />);

      const rows = screen.getAllByRole('group');
      expect(rows[0]).toHaveStyle({ marginBottom: '20px' });
      expect(rows[1]).toHaveStyle({ marginBottom: '0px' });
    });

    it('should use default gap when not specified', () => {
      const images: ImageData[][] = [
        [
          { src: 'img1.jpg', width: 800, height: 600 },
          { src: 'img2.jpg', width: 800, height: 600 },
        ],
      ];

      render(<JustifiedGallery images={images} />);

      const row = screen.getByRole('group');
      expect(row).toHaveStyle({ gap: '8px' }); // DEFAULT_GAP = 8
    });
  });

  describe('custom renderImage prop', () => {
    it('should call renderImage with correct arguments', () => {
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

      expect(renderImage).toHaveBeenCalledTimes(2);

      // Check first image call
      const firstCall = renderImage.mock.calls[0][0];
      expect(firstCall.image).toEqual(images[0][0]);
      expect(firstCall.rowIndex).toBe(0);
      expect(firstCall.imageIndex).toBe(0);

      // Check second image call
      const secondCall = renderImage.mock.calls[1][0];
      expect(secondCall.image).toEqual(images[0][1]);
      expect(secondCall.rowIndex).toBe(0);
      expect(secondCall.imageIndex).toBe(1);
    });

    it('should render custom content from renderImage', () => {
      const renderImage = (props: RenderImageProps) => (
        <div data-testid={`custom-${props.rowIndex}-${props.imageIndex}`}>
          Custom: {props.image.src}
        </div>
      );

      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
      ];

      render(<JustifiedGallery images={images} renderImage={renderImage} />);

      const customElement = screen.getByTestId('custom-0-0');
      expect(customElement).toBeInTheDocument();
      expect(customElement).toHaveTextContent('Custom: img1.jpg');
    });

    it('should apply flex styles to wrapper when using renderImage', () => {
      const renderImage = () => <div>Custom</div>;

      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 1600, height: 900 }],
      ];

      const { container } = render(<JustifiedGallery images={images} renderImage={renderImage} />);

      const wrapper = container.querySelector('[role="img"]');
      expect(wrapper).toHaveStyle({
        flex: `${1600 / 900} 1 0`,
        aspectRatio: '1600 / 900',
      });
    });
  });

  describe('image callbacks', () => {
    it('should trigger onImageLoad callback', () => {
      const onImageLoad = vi.fn();

      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
      ];

      const { container } = render(<JustifiedGallery images={images} onImageLoad={onImageLoad} />);

      const imgElement = container.querySelector('img')!;
      imgElement.dispatchEvent(new Event('load'));

      expect(onImageLoad).toHaveBeenCalledTimes(1);
      expect(onImageLoad.mock.calls[0][0]).toEqual(images[0][0]);
    });

    it('should trigger onImageError callback', () => {
      const onImageError = vi.fn();

      const images: ImageData[][] = [
        [{ src: 'invalid.jpg', width: 800, height: 600 }],
      ];

      const { container } = render(<JustifiedGallery images={images} onImageError={onImageError} />);

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

    it('should have role="group" on each row', () => {
      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
        [{ src: 'img2.jpg', width: 800, height: 600 }],
      ];

      render(<JustifiedGallery images={images} />);

      const row1 = screen.getByRole('group', { name: 'Gallery row 1' });
      const row2 = screen.getByRole('group', { name: 'Gallery row 2' });
      expect(row1).toBeInTheDocument();
      expect(row2).toBeInTheDocument();
    });

    it('should make images focusable with tabIndex=0', () => {
      const images: ImageData[][] = [
        [
          { src: 'img1.jpg', width: 800, height: 600 },
          { src: 'img2.jpg', width: 800, height: 600 },
        ],
      ];

      const { container } = render(<JustifiedGallery images={images} />);

      const imageElements = container.querySelectorAll('img');
      expect(imageElements).toHaveLength(2);
      imageElements.forEach((img) => {
        expect(img).toHaveAttribute('tabIndex', '0');
      });
    });

    it('should use custom alt text when provided', () => {
      const images: ImageData[][] = [
        [
          { src: 'img1.jpg', width: 800, height: 600, alt: 'Mountain landscape' },
          { src: 'img2.jpg', width: 800, height: 600, alt: 'Ocean sunset' },
        ],
      ];

      const { container } = render(<JustifiedGallery images={images} />);

      const img1 = container.querySelector('img[alt="Mountain landscape"]');
      const img2 = container.querySelector('img[alt="Ocean sunset"]');
      expect(img1).toBeInTheDocument();
      expect(img2).toBeInTheDocument();
    });

    it('should use fallback alt text when not provided', () => {
      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
      ];

      render(<JustifiedGallery images={images} />);

      const img = screen.getByRole('img', { name: 'Image 1-1' });
      expect(img).toBeInTheDocument();
    });
  });

  describe('lazyLoad prop', () => {
    it('should apply loading="lazy" when lazyLoad is true (default)', () => {
      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
      ];

      const { container } = render(<JustifiedGallery images={images} />);

      const imgElement = container.querySelector('img');
      expect(imgElement).toHaveAttribute('loading', 'lazy');
    });

    it('should not apply loading attribute when lazyLoad is false', () => {
      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
      ];

      const { container } = render(<JustifiedGallery images={images} lazyLoad={false} />);

      const imgElement = container.querySelector('img');
      expect(imgElement).not.toHaveAttribute('loading');
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

    it('should apply rowStyle prop', () => {
      const rowStyle = {
        backgroundColor: 'blue',
        padding: '10px',
      };

      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
      ];

      render(<JustifiedGallery images={images} rowStyle={rowStyle} />);

      const row = screen.getByRole('group');
      // jsdom converts colors to RGB format
      expect(row).toHaveStyle('background-color: rgb(0, 0, 255)');
      expect(row).toHaveStyle('padding: 10px');
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

    it('should handle single row with single image', () => {
      const images: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
      ];

      const { container } = render(<JustifiedGallery images={images} />);

      const rows = screen.getAllByRole('group');
      expect(rows).toHaveLength(1);
      expect(container.querySelectorAll('img')).toHaveLength(1);
    });

    it('should handle images with extra properties', () => {
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

      expect(container.querySelectorAll('img')).toHaveLength(1);
    });

    it('should update when images prop changes', () => {
      const images1: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
      ];

      const images2: ImageData[][] = [
        [{ src: 'img1.jpg', width: 800, height: 600 }],
        [{ src: 'img2.jpg', width: 800, height: 600 }],
      ];

      const { rerender } = render(<JustifiedGallery images={images1} />);

      expect(screen.getAllByRole('group')).toHaveLength(1);

      rerender(<JustifiedGallery images={images2} />);

      expect(screen.getAllByRole('group')).toHaveLength(2);
    });
  });
});
