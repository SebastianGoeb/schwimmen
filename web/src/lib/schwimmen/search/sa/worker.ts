import { worker } from "workerpool";
import { mutateRandom, mutateVerySmart } from "./mutation";

worker({
  mutateVerySmart: mutateVerySmart,
  mutateRandom: mutateRandom,
});
