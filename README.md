# react-justified-gallery

A React component for creating beautiful justified image galleries with CSS flexbox layout.

## Features

- **Perfect Justification** - Images fill the full container width while preserving aspect ratios
- **Fully Responsive** - Pure CSS handles resize automatically
- **Flexible Rendering** - Custom render prop for complete control over image display
- **SSR-Friendly** - No client-side measurement needed
- **Zero Re-renders** - No state changes on container resize

## Installation

```bash
npm install @n-ivan/react-justified-gallery
```

## Quick Start

```tsx
import { JustifiedGallery } from '@n-ivan/react-justified-gallery';

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
| `lazyLoad` | `boolean` | `true` | Enable native lazy loading |
| `onImageLoad` | `function` | - | Callback when image loads |
| `onImageError` | `function` | - | Callback when image fails |
| `containerStyle` | `CSSProperties` | - | Styles for gallery container |
| `rowStyle` | `CSSProperties` | - | Styles for each row |

### RenderImage Props

When using the `renderImage` prop, you receive the following properties:

```typescript
interface RenderImageProps {
  image: ImageData;  // Original image data
  rowIndex: number;  // Row index (0-based)
  imageIndex: number; // Image index in row (0-based)
}
```

The wrapper div already has the correct `flex` and `aspect-ratio` styles applied, so your custom content just needs to fill `width: 100%` and `height: 100%`.

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
- CSS `aspect-ratio` property (Chrome 88+, Firefox 89+, Safari 15+, Edge 88+)
- CSS Flexbox
- React 18+

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
