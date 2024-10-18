import { IMask } from "react-imask";

export function zeitenMask() {
  return new IMask.MaskedPattern({
    mask: "S0:S0,00",
    blocks: {
      S: {
        mask: IMask.MaskedRange,
        from: 0,
        to: 5,
      },
    },
    placeholderChar: "_",
    lazy: false,
  });
}
