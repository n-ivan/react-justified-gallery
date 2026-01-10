import type { ImageData, ComputedRow } from './types';

export function validateImages(images: ImageData[][]): void {
  for (let rowIndex = 0; rowIndex < images.length; rowIndex++) {
    const row = images[rowIndex];

    if (row.length === 0) {
      throw new Error(`Row ${rowIndex} is empty. All rows must contain at least one image.`);
    }

    for (let imageIndex = 0; imageIndex < row.length; imageIndex++) {
      const image = row[imageIndex];

      if (typeof image.width !== 'number' || image.width <= 0) {
        throw new Error(
          `Image at row ${rowIndex}, index ${imageIndex} has invalid width. ` +
          `Expected positive number, got: ${image.width}`
        );
      }

      if (typeof image.height !== 'number' || image.height <= 0) {
        throw new Error(
          `Image at row ${rowIndex}, index ${imageIndex} has invalid height. ` +
          `Expected positive number, got: ${image.height}`
        );
      }
    }
  }
}

export function calculateLayout(
  images: ImageData[][],
  containerWidth: number,
  gap: number
): ComputedRow[] {
  validateImages(images);

  return images.map((row) => {
    const totalGapWidth = gap * (row.length - 1);
    const availableWidth = containerWidth - totalGapWidth;

    const totalAspectRatio = row.reduce((sum, image) => {
      return sum + image.width / image.height;
    }, 0);

    const rowHeight = availableWidth / totalAspectRatio;

    const computedImages = row.map((image) => {
      const aspectRatio = image.width / image.height;
      const computedWidth = rowHeight * aspectRatio;

      return {
        image,
        computedWidth,
        computedHeight: rowHeight,
      };
    });

    return {
      images: computedImages,
      height: rowHeight,
    };
  });
}
