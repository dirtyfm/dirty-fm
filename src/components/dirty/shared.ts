export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export type DirtyTone = "red" | "yellow" | "green" | "purple" | "blue";

export const toneStyles: Record<
  DirtyTone,
  {
    border: string;
    bg: string;
    text: string;
    stamp: string;
  }
> = {
  red: {
    border: "border-dirty-red",
    bg: "bg-dirty-red",
    text: "text-dirty-red",
    stamp: "border-dirty-red bg-dirty-red text-dirty-black"
  },
  yellow: {
    border: "border-dirty-yellow",
    bg: "bg-dirty-yellow",
    text: "text-dirty-yellow",
    stamp: "border-dirty-yellow bg-dirty-yellow text-dirty-black"
  },
  green: {
    border: "border-dirty-green",
    bg: "bg-dirty-green",
    text: "text-dirty-green",
    stamp: "border-dirty-green bg-dirty-green text-dirty-ash"
  },
  purple: {
    border: "border-dirty-purple",
    bg: "bg-dirty-purple",
    text: "text-dirty-ash",
    stamp: "border-dirty-purple bg-dirty-purple text-dirty-ash"
  },
  blue: {
    border: "border-dirty-blue",
    bg: "bg-dirty-blue",
    text: "text-dirty-blue",
    stamp: "border-dirty-blue bg-dirty-blue text-dirty-ash"
  }
};
