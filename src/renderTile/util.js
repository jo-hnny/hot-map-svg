/**
 * 获取 SVG 父级元素的宽和高
 * @param target
 * @returns
 */
export const getTargetWidthAndHeight = (selector) => {
  const client = document.querySelector(selector)?.getBoundingClientRect();
  return {
    width: client?.width,
    height: client?.height
  };
};
