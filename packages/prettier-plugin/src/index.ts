import { doc } from "prettier";

const { group, indent, join, line, softline } = doc.builders;

function print(path, options, print) {
  const node = path.getValue();

  switch (node.type) {
    case "list":
      return group([
        "(",
        indent([softline, join(line, path.map(print, "elements"))]),
        softline,
        ")",
      ]);

    case "pair":
      return group([
        "(",
        indent([softline, print("left"), line, ". ", print("right")]),
        softline,
        ")",
      ]);

    case "symbol":
      return node.name;
  }

  throw new Error(`Unknown node type: ${node.type}`);
}

export default {
  printers: {
    typescript: {
      print,
    },
  },
};
