import * as d3 from "d3";
import { sameSizeTile } from "./tile";
import { getTargetWidthAndHeight } from "./util";
// default rect width
const UNIT_WIDTH = 60;
// default rect height
const UNIT_HEIGHT = 60;

/**
 * format data as treemap
 * @param {*} width
 * @param {*} height
 * @param {*} data
 * @returns
 */
const treemapData = ({ width, height, data }) => {
  return d3
    .treemap()
    .tile(sameSizeTile)
    .size([width, height])
    .paddingTop(55)
    .paddingInner(24)
    .round(true)(d3.hierarchy(data));
};

export const renderTile = ({ selector, data, options }) => {
  // Combination configuration
  const configs = {
    rectWidth: UNIT_WIDTH,
    rectHeight: UNIT_HEIGHT,
    childOrientation: "horizontal",
    ...options
  };
  const { width, height } = getTargetWidthAndHeight(selector);
  // Get the data of rectangular tree graph.
  const root = treemapData({
    width,
    height,
    data: {
      name: "",
      children: data,
      configs
    }
  });
  // Recalculate the width and height of svg
  const svgWidth = root.maxWidth < width ? width : root.maxWidth + 6;
  const svgHeight = root.maxHeight < height ? height : root.maxHeight + 16;
  const zoomed = ({ transform }) => {
    const { k, x, y } = transform;
    // Scale elements, which are generally scaled in the group.
    group.attr(
      "transform",
      `translate(${Math.floor(x)},${Math.floor(y)}) scale(${k.toFixed(3)})`
    );
  };

  const svg = d3
    .select(selector)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0, 0, ${width}, ${height}`)
    .style("font", "10px sans-serif");

  const group = svg
    .selectAll("g")
    .data(d3.group(root, (d) => d.height))
    .join("g");

  const node = group
    .filter((d) => d[0] < 2)
    .selectAll("g")
    .data((d) => d[1])
    .join("g")
    .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

  const rect = node
    .append("rect")
    .attr("cursor", (d) => (!d?.height ? "pointer" : null))
    .attr("fill", (d) => (d.depth !== 2 ? "#fbfefe" : ""))
    .attr("stroke", (d) => (d?.height === 1 ? "#888" : null))
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0);

  // Data binding for Rect
  rect
    .filter((d) => !d.height)
    .on("mouseenter", (event, d) => {
      if (!configs?.mouseenter) return;
      configs?.mouseenter(event, d);
    })
    .on("mousemove", (event, d) => {
      if (!configs?.mousemove) return;
      configs?.mousemove(event, d);
    })
    .on("mouseleave", (event, d) => {
      if (!configs?.mouseleave) return;
      configs?.mouseleave(event, d);
    })
    .on("click", (event, d) => {
      if (!configs?.click) return;
      configs?.click(event, d);
    });

  node
    .filter((d) => d.height === 1)
    .append("text")
    .style("user-select", "none")
    .attr("pointer-events", "none")
    .attr("fill", "#3e4152")
    .attr("transform", (d) => {
      if (d.height === 1) {
        const width = d.x1 - d.x0;
        const strWidth =
          `${d?.data?.name} ${String(d.data.number)} 个 `.replace(
            /[^\u0000-\u00ff]/g,
            "aa"
          ).length * 8;
        return width >= strWidth
          ? ""
          : `scale(${(width / strWidth).toFixed(2)})`;
      }
    })
    .selectAll("tspan")
    .data((d) =>
      d.data.name
        .split(/(?=[a-z][A-Z])/g)
        .concat(d.data?.number ? `${d.data?.number} 个` : null)
    )
    .join("tspan")
    .attr("dx", 8)
    .attr("y", 18)
    .attr("font-weight", "bold")
    .attr("font-size", "14px")
    .text((d) => d);

  // fill rect color by status
  node
    .filter((d) => !d.children)
    .style("user-select", "none")
    .attr("fill", (d, i) =>
      configs?.setRectColor
        ? configs?.setRectColor(d, i)
        : d3.interpolateRainbow(Math.random())
    );

  // Increase zoom
  if (width < svgWidth || height < svgHeight) {
    const shrinkScale = Math.min(
      +(width / svgWidth).toFixed(2),
      +(height / svgHeight).toFixed(2)
    );
    svg.call(
      d3
        .zoom()
        .extent([
          [0, 0],
          [width, height]
        ])
        .scaleExtent([shrinkScale, 1]) // 缩放比例
        .on("zoom", zoomed)
    );
  }
};
