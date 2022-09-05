import { renderTile } from "./renderTile/index";
import data from "./mock";
import React, { useEffect } from "react";

const STATUS_COLOR_MAP = {
  正常: "#28b9ad",
  异常: "#fb1f00",
  升级中: "#f4c400",
  未知状态: "#B0B4BD",
  删除中: "#9b8ff5",
  启动中: "#ee576d",
  高: "#fb1f00",
  中: "#f4c400",
  低: "#28b9ad",
};

const SVG_CONTAINER = "SVG_CONTAINER";

const getMousePosition = (e) => {
  const event = e || window.event;
  const x =
    event.pageX ||
    event.clientX +
      (document.documentElement.scrollLeft || document.body.scrollLeft);
  const y =
    event.pageY ||
    event.clientY +
      (document.documentElement.scrollTop || document.body.scrollTop);
  return { x, y };
};
const styleText =
  "height: 200px;width: 200px;background-color: red;z-index:999;position:fixed;";

function App() {
  useEffect(() => {
    document.querySelector(`#${SVG_CONTAINER}`).innerHTML = "";
    renderTile({
      selector: `#${SVG_CONTAINER}`,
      // data: data.slice(Math.floor(Math.random() * 4)),
      data,
      options: {
        rectWidth: 54,
        rectHeight: 54,
        // mouseenter: function (e, d) {
        //   const name = d?.data?.name;
        //   const tooltip = document.querySelector("#tooltip");
        //   const { x, y } = getMousePosition(e);
        //   tooltip.setAttribute(
        //     "style",
        //     `${styleText}top: ${y + 230}px;left:${x - 20}px`
        //   );
        //   tooltip.innerHTML = `<ul><li>名称：${name}</li></ul>`;
        // },
        // mousemove: function (e, d) {
        //   const tooltip = document.querySelector("#tooltip");
        //   const { x, y } = getMousePosition(e);
        //   tooltip.setAttribute(
        //     "style",
        //     `${styleText}top: ${y + 230}px;left:${x - 20}px`
        //   );
        // },
        // mouseleave: function (e, d) {
        //   const tooltip = document.querySelector("#tooltip");
        //   tooltip.setAttribute("style", "");
        //   tooltip.innerHTML = "";
        // },
        setRectColor: (d) => STATUS_COLOR_MAP?.[d?.data?.status],
      },
    });
  }, []);

  return (
    <div className="App">
      <div id={SVG_CONTAINER} style={{ width: "100%", height: "900px" }}></div>
      <div id="tooltip"></div>
    </div>
  );
}

export default App;
