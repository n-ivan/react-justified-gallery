# react-justified-gallery

A React component for creating beautiful justified image galleries with automatic layout calculations and responsive behavior.

## Features

- **Perfect Justification** - Images fill the full container width while preserving aspect ratios
- **Fully Responsive** - Automatically recalculates layout on container resize using ResizeObserver
- **Flexible Rendering** - Custom render prop for complete control over image display

## Installation

```bash
npm install @n-ivan/react-justified-gallery
```

## Quick Start

```tsx
import { JustifiedGallery } from 'react-justified-gallery';

const images = [
  [
    { src: 'image1.jpg', width: 1920, height: 1080 },
    { src: 'image2.jpg', width: 800, height: 600 }
  ],
  [
    { src: 'image3.jpg', width: 1200, height: 1200 }
  ]
];

function App() {
  return <JustifiedGallery images={images} gap={8} />;
}
```

## Data Structure

The gallery accepts a **2D array** where each inner array represents a row of images:

```typescript
type ImageData = {
  src: string;
  width: number;  // Original width in pixels
  height: number; // Original height in pixels
  alt?: string;   // Optional alt text
  [key: string]: unknown; // Any additional properties
};

type GalleryData = ImageData[][];
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `images` | `ImageData[][]` | **required** | 2D array of image data |
| `gap` | `number` | `8` | Gap between images in pixels |
| `renderImage` | `function` | - | Custom render function for images |
| `resizeDebounce` | `number` | `150` | Debounce delay for resize (ms) |
| `lazyLoad` | `boolean` | `true` | Enable native lazy loading |
| `onImageLoad` | `function` | - | Callback when image loads |
| `onImageError` | `function` | - | Callback when image fails |
| `containerStyle` | `CSSProperties` | - | Styles for gallery container |
| `rowStyle` | `CSSProperties` | - | Styles for each row |

### RenderImage Props

When using the `renderImage` prop, you receive the following properties:

```typescript
interface RenderImageProps {
  image: ImageData;           // Original image data
  computedWidth: number;      // Calculated width
  computedHeight: number;     // Calculated height
  originalWidth: number;      // Original image width
  originalHeight: number;     // Original image height
  rowIndex: number;           // Row index (0-based)
  imageIndex: number;         // Image index in row (0-based)
  isFirstInRow: boolean;      // First image in row
  isLastInRow: boolean;       // Last image in row
}
```

## How It Works

The component calculates the optimal height for each row based on:

1. **Total aspect ratio** of all images in the row
2. **Available width** (container width minus gaps)
3. **Individual aspect ratios** of each image

This ensures:
- All images in a row have the same height
- Each image maintains its original aspect ratio
- The row fills the complete container width

## Development

### Install Dependencies

```bash
npm install
```

### Run Demo

```bash
npm run demo
```

### Run Tests

```bash
npm test
```

### Build Library

```bash
npm run build
```

### Type Check

```bash
npm run lint
```

## TypeScript

Full TypeScript support with exported types:

```tsx
import type {
  JustifiedGalleryProps,
  ImageData,
  RenderImageProps
} from 'react-justified-gallery';
```

## Browser Support

Modern browsers with support for:
- ResizeObserver
- ES2020+ features
- React 18+

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
