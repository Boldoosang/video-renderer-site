import { ObjectDimensions, Transformation } from "../types";

export function transformPoint(
  objectDimensions: ObjectDimensions,
  originalPoint: number[],
  transformation: Transformation,
): number[] {
  // Parse transformation values
  const top = parseFloat(transformation.top);
  const left = parseFloat(transformation.left);

  let rotation = 0;
  let scaleX = 1;
  let scaleY = 1;

  const rotationMatch = transformation.transform.match(
    /rotate\(([-\d.]+)deg\)/,
  );
  if (rotationMatch) {
    rotation = parseFloat(rotationMatch[1]);
  }

  const scaleMatch = transformation.transform.match(
    /scale\(([-\d.]+)(?:,\s*([-\d.]+))?\)/,
  );
  if (scaleMatch) {
    scaleX = parseFloat(scaleMatch[1]);
    scaleY = scaleMatch[2] ? parseFloat(scaleMatch[2]) : scaleX;
  }

  // Convert rotation to radians
  const rotationRad = (rotation * Math.PI) / 180;

  // Adjust point relative to object center
  const centerX = objectDimensions.width / 2;
  const centerY = objectDimensions.height / 2;
  const relativeX = originalPoint[0] - centerX;
  const relativeY = originalPoint[1] - centerY;

  // Apply scale
  const scaledX = relativeX * scaleX;
  const scaledY = relativeY * scaleY;

  // Apply rotation
  const rotatedX =
    scaledX * Math.cos(rotationRad) - scaledY * Math.sin(rotationRad);
  const rotatedY =
    scaledX * Math.sin(rotationRad) + scaledY * Math.cos(rotationRad);

  // Translate back to canvas coordinates
  const newX = rotatedX + centerX + left;
  const newY = rotatedY + centerY + top;

  return [newX, newY];
}
