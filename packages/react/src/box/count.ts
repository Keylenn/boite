import createBox from "@boxly/core";
import curryUseSyncBoxStore from "../../lib/curryUseSyncBoxStore";

const countBox = createBox({
  count1: 0,
  count2: 0,
  sharedCount: 0,
});

export const defaultCountValue = countBox.getData();

export const useSyncCountBoxStore = curryUseSyncBoxStore(countBox);

export default countBox;
