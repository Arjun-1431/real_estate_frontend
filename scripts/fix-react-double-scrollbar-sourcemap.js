const fs = require("fs");
const path = require("path");

const mapFilePath = path.join(
  __dirname,
  "..",
  "node_modules",
  "react-double-scrollbar",
  "dist",
  "DoubleScrollbar.js.map"
);

const minimalSourceMap = {
  version: 3,
  file: "DoubleScrollbar.js",
  sources: [],
  names: [],
  mappings: "",
};

try {
  const mapDir = path.dirname(mapFilePath);

  if (!fs.existsSync(mapDir)) {
    process.exit(0);
  }

  if (!fs.existsSync(mapFilePath)) {
    fs.writeFileSync(mapFilePath, JSON.stringify(minimalSourceMap, null, 2));
    console.log("Created missing react-double-scrollbar source map.");
  }
} catch (error) {
  console.warn("Could not patch react-double-scrollbar source map:", error.message);
}
