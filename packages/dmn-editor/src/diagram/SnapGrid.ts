import { DC__Bounds, DC__Point, DMNDI13__DMNShape } from "@kie-tools/dmn-marshaller/dist/schemas/dmn-1_4/ts-gen/types";
import { SnapGrid } from "../store/Store";

export const NODE_MIN_WIDTH = 160;
export const NODE_MIN_HEIGHT = 80;

export const MIN_SIZE_FOR_NODES = (grid: SnapGrid, width = NODE_MIN_WIDTH, height = NODE_MIN_HEIGHT) => {
  const snapped = snapPoint(grid, { "@_x": width, "@_y": height }, "ceil");
  return { width: snapped["@_x"], height: snapped["@_y"] };
};

export function snapShapePosition(snapGrid: SnapGrid, shape: DMNDI13__DMNShape) {
  return {
    x: snap(snapGrid, "x", shape["dc:Bounds"]?.["@_x"]),
    y: snap(snapGrid, "y", shape["dc:Bounds"]?.["@_y"]),
  };
}

export function offsetShapePosition(shape: DMNDI13__DMNShape, offset: { x: number; y: number }): DMNDI13__DMNShape {
  if (!shape["dc:Bounds"]) {
    return shape;
  }

  return {
    ...shape,
    "dc:Bounds": {
      ...shape["dc:Bounds"],
      "@_x": offset.x + shape["dc:Bounds"]["@_x"],
      "@_y": offset.y + shape["dc:Bounds"]["@_y"],
    },
  };
}

export function snapShapeDimensions(grid: SnapGrid, shape: DMNDI13__DMNShape) {
  const minSizes = MIN_SIZE_FOR_NODES(grid);
  return {
    width: Math.max(snap(grid, "x", shape["dc:Bounds"]?.["@_width"]), minSizes.width),
    height: Math.max(snap(grid, "y", shape["dc:Bounds"]?.["@_height"]), minSizes.height),
  };
}

export function snapBounds(grid: SnapGrid, bounds: DC__Bounds | undefined): DC__Bounds {
  const minSizes = MIN_SIZE_FOR_NODES(grid);
  return {
    "@_x": snap(grid, "x", bounds?.["@_x"]),
    "@_y": snap(grid, "y", bounds?.["@_y"]),
    "@_width": Math.max(snap(grid, "x", bounds?.["@_width"]), minSizes.width),
    "@_height": Math.max(snap(grid, "y", bounds?.["@_height"]), minSizes.height),
  };
}

export function snapPoint(grid: SnapGrid, point: DC__Point, method: "floor" | "ceil" = "floor"): DC__Point {
  return {
    "@_x": snap(grid, "x", point?.["@_x"], method),
    "@_y": snap(grid, "y", point?.["@_y"], method),
  };
}

export function snap(grid: SnapGrid, coord: "x" | "y", value: number | undefined, method: "floor" | "ceil" = "floor") {
  return grid.isOn //
    ? Math[method]((value ?? 0) / grid[coord]) * grid[coord]
    : value ?? 0;
}