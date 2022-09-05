import { randUser, randText, randNumber } from "@ngneat/falso";

function getParamByUrl(key) {
  const searchParams = new URL(window.location.href)?.searchParams;
  return searchParams?.get(key);
}

const max = +(getParamByUrl("max") ?? 5) * 10000;

const kaneChildren = [...new Array(max)].map((_, index) => ({
  name: index + "",
  namespace: randText(),
  projectID: randText(),
  type: randText(),
  cluster: randText(),
  status: ["高", "中", "低"][randNumber({ min: 0, max: 2 })],
  region: randText(),
  projectName: randText(),
  maxCPU: randNumber({ min: 0, max: 100 }),
  maxCPUTime: "2022-05-27 03:13:06",
  maxMemory: randNumber({ min: 0, max: 100 }),
  maxMemoryTime: "2022-05-27 14:20:14",
  currentCPU: randNumber({ min: 0, max: 100 }),
  currentMemory: randNumber({ min: 0, max: 100 }),
  workLoadName: "kane-cjlkft8gu0g0",
  environment: "PRODUCTION",
  zone: "广州三区",
  size: 1,
}));

const data = [
  {
    name: "kane",
    children: kaneChildren,
    number: max,
    ratio: "29.27%",
  },
];

export default data;
