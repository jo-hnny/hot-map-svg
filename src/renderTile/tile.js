const GROUP_TITLE_HEIGHT = 55;
// 子项距离组边框左右间距
const INNER_GROUP_PADDING = 44;
const INNER_BOTTOM_PADDING = 36;
// const PADDING_INNER = 24;
//
const DEFAULT_FILL_COLUMNS = false;
// suggest: true /false
const DEFAULT_FALL = false;
// Custom settings
let CONFIGS = null;

/**
 * Group size mapping
 */
const groupSizes = {};

/**
 * According to the canvas calculation can accommodate rows and columns.
 */
const getCanvasSize = (canvas) => {
  return {
    columns: Math.ceil(
      (canvas.x1 - canvas.x0 - INNER_GROUP_PADDING * 2) / CONFIGS.rectWidth
    ),
    rows: Math.ceil(
      (canvas.y1 - canvas.y0 - INNER_BOTTOM_PADDING - GROUP_TITLE_HEIGHT) /
        CONFIGS.rectHeight
    )
  };
};

/**
 * Get the group width according to the number of columns.
 */
const getGroupWidthByColumns = (columns) =>
  columns * CONFIGS.rectWidth + INNER_GROUP_PADDING * 2;
/**
 * Get the group height according to the number of rows.
 */
const getGroupHeightByRows = (rows) =>
  rows * CONFIGS.rectHeight + GROUP_TITLE_HEIGHT + INNER_BOTTOM_PADDING;

/**
 * Group layout
 */
const tileGroup = (group, cursor, size) => {
  group.x0 = cursor.x;
  group.y0 = cursor.y;
  group.x1 = cursor.x + getGroupWidthByColumns(size.columns);
  group.y1 = cursor.y + getGroupHeightByRows(size.rows);
};

/**
 * Sort by the number of child nodes
 */
const sortByLength = (nodes, asc = false) => {
  return nodes.sort(
    (l, r) =>
      (l.children?.length > r.children?.length ? -1 : 1) * (asc ? -1 : 1)
  );
};

/**
 * Get the group size
 */
const getHalfSqrtSize = (space, ratio, fall = DEFAULT_FALL) => {
  const short = Math.ceil(Math.sqrt(space / ratio));
  const long = Math.ceil(space / short);
  return fall ? { columns: long, rows: short } : { columns: short, rows: long };
};

/**
 * Calculate the size according to the remaining area
 */
const getSizeAndCanvasType = (space, canvas, CONFIGS) => {
  const canvasSize = getCanvasSize(canvas);
  if (space > canvasSize.columns * canvasSize.rows) {
    if (!CONFIGS.maxGroupColumns || !CONFIGS.fillColumns) {
      return {
        canvasType: "NEW",
        direction: "HORIZONTAL",
        size: getHalfSqrtSize(space, CONFIGS.newGroupRatio)
      };
    }
    return {
      canvasType: "NEW",
      direction: "HORIZONTAL",
      size: {
        columns: CONFIGS.maxGroupColumns,
        rows: Math.ceil(space / CONFIGS.maxGroupColumns)
      }
    };
  }
  const fixed = Math.min(canvasSize.columns, canvasSize.rows);
  const dynamic = Math.ceil(space / fixed);
  return {
    canvasType: "REMAIN",
    ...(canvasSize.columns <= canvasSize.rows * CONFIGS.remainGroupRatio
      ? { direction: "VERTICAL", size: { columns: fixed, rows: dynamic } }
      : { direction: "HORIZONTAL", size: { columns: dynamic, rows: fixed } })
  };
};

/**
 * Calculate the aspect ratio of the largest group
 */
const getRatioBySortedGroups = (groups) =>
  Math.ceil(
    (groups.reduce((memo, group) => memo + group.children.length, 0) * 10) /
      groups[0].children.length
  ) / 10;

/**
 * Main layout function
 */
export const sameSizeTile = (node, x0, y0) => {
  // Get user-defined configuration
  if (node?.depth === 0) {
    CONFIGS = node?.data?.configs;
  }
  const { children } = node;

  if (node.depth === 0) {
    const groups = sortByLength(children);

    const remainCanvas = { x0: 0, y0: 0, x1: 0, y1: 0 };
    const cursor = { x: 0, y: 0 };

    const newGroupRatio = getRatioBySortedGroups(Array.from(groups));
    let maxGroupColumns = 0;
    const groupX1Arr = [];
    const groupY1Arr = [];

    groups.forEach((group) => {
      const space = group.children.length;
      const { canvasType, direction, size } = getSizeAndCanvasType(
        space,
        remainCanvas,
        {
          maxGroupColumns,
          newGroupRatio,
          remainGroupRatio: 4,
          fillColumns: DEFAULT_FILL_COLUMNS
        }
      );
      maxGroupColumns = Math.max(maxGroupColumns, size.columns);
      groupSizes[group.data.name] = size;
      switch (canvasType) {
        case "NEW": {
          cursor.x = remainCanvas.x1;
          cursor.y = 0;
          tileGroup(group, cursor, size);
          remainCanvas.x0 = cursor.x;
          remainCanvas.x1 =
            remainCanvas.x0 + getGroupWidthByColumns(size.columns);
          remainCanvas.y0 = cursor.y + getGroupHeightByRows(size.rows);
          remainCanvas.y1 = Math.max(remainCanvas.y0, remainCanvas.y1);
          break;
        }
        case "REMAIN": {
          cursor.x = remainCanvas.x0;
          cursor.y = remainCanvas.y0;
          tileGroup(group, cursor, size);
          if (direction === "VERTICAL") {
            remainCanvas.y0 = remainCanvas.y0 + getGroupHeightByRows(size.rows);
          } else {
            remainCanvas.x0 =
              remainCanvas.x0 + getGroupWidthByColumns(size.columns);
          }
          break;
        }
      }
      groupX1Arr.push(group.x1);
      groupY1Arr.push(group.y1);
    });
    node.maxWidth = Math.max(...groupX1Arr);
    node.maxHeight = Math.max(...groupY1Arr);
  }

  // Vertical arrangement use rows，Horizontal arrangement use columns
  if (node.depth === 1) {
    const { rows, columns } = groupSizes[node.data.name];

    for (let i = 0; i < children.length; ++i) {
      const unit = children[i];
      // vertical orientation
      if (CONFIGS?.childOrientation === "horizontal") {
        unit.x0 =
          x0 +
          Math.floor(i % columns) * CONFIGS.rectWidth +
          INNER_GROUP_PADDING;
        unit.y0 = y0 + Math.floor(i / columns) * CONFIGS.rectHeight;
      } else {
        unit.x0 = x0 + Math.floor(i / rows) * CONFIGS.rectWidth;
        unit.y0 = y0 + Math.floor(i % rows) * CONFIGS.rectHeight;
      }
      unit.x1 = unit.x0 + CONFIGS.rectWidth;
      unit.y1 = unit.y0 + CONFIGS.rectHeight;
    }
  }
};
