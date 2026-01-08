export const CATEGORY_COLORS = [
  { name: "Gray", hex: "#E3E3E1" },
  { name: "Brown", hex: "#EADDD8" },
  { name: "Orange", hex: "#F6D7B8" },
  { name: "Yellow", hex: "#F3E5A6" },
  { name: "Green", hex: "#DCE8DA" },
  { name: "Blue", hex: "#D6EAF3" },
  { name: "Purple", hex: "#E8E0F0" },
  { name: "Pink", hex: "#F2DCE6" },
  { name: "Red", hex: "#F4D0CC" },
];

export const CATEGORY_COLOR_CLASS_MAP = {
  "#E3E3E1": "color-gray",
  "#EADDD8": "color-brown",
  "#F6D7B8": "color-orange",
  "#F3E5A6": "color-yellow",
  "#DCE8DA": "color-green",
  "#D6EAF3": "color-blue",
  "#E8E0F0": "color-purple",
  "#F2DCE6": "color-pink",
  "#F4D0CC": "color-red",
};

export const getCategoryColorClass = (hex) => {
  if (!hex) return "color-gray";
  const key = String(hex).toUpperCase();
  return CATEGORY_COLOR_CLASS_MAP[key] || "color-gray";
};
