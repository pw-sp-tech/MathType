const INVERSE_FN_TREE_TEMPLATE = {
  tree: {
    elementName: "mrow",
    children: [
      {
        elementName: "msup",
        children: [
          { elementName: "mi", textContent: "d_0" },
          {
            elementName: "mrow",
            children: [
              { elementName: "mo", textContent: "-" },
              { elementName: "mn", textContent: "1" },
            ],
          },
        ],
      },
      {
        elementName: "mfenced",
        children: [{ elementName: "mrow" }],
      },
    ],
  },
  cursorPostion: 6,
};

const FN_TREE_TEMPLATE = {
  tree: {
    elementName: "mrow",
    children: [
      { elementName: "mi", textContent: "d_0" },
      {
        elementName: "mfenced",
        children: [{ elementName: "mrow" }],
      },
    ],
  },
  cursorPostion: 3,
};

const LOG_B10_TREE_TEMPLATE = {
  tree: {
    elementName: "mrow",
    children: [
      { elementName: "mi", textContent: "d_0" },
      {
        elementName: "mfenced",
        attributes: "d_1",
        children: [
          { elementName: "mn", textContent: "10" },
          { elementName: "mrow" },
        ],
      },
    ],
  },
  cursorPostion: 3,
};

const LOG_BN_TREE_TEMPLATE = {
  tree: {
    elementName: "mrow",
    children: [
      {
        elementName: "msub",
        children: [
          { elementName: "mi", textContent: "d_0" },
          { elementName: "mrow" },
        ],
      },
      {
        elementName: "mfenced",
        children: [{ elementName: "mrow" }],
      },
    ],
  },
  cursorPostion: 2,
};

const BIG_OPT_UNDER_OVER_TREE_TEMPLATE = {
  tree: {
    elementName: "d_0",
    children: [
      {
        elementName: "mo",
        textContent: "d_1",
        attributes: "d_2",
      },
      { elementName: "mrow" },
      { elementName: "mrow" },
    ],
  },
  cursorPostion: 1,
};

const SCRIPT_DOWN_INPUT_TREE_TEMPLATE = {
  tree: {
    elementName: "d_0",
    attributes: "d_1",
    children: [
      {
        elementName: "mo",
        textContent: "d_2",
        attributes: "d_3",
      },
      { elementName: "mrow" },
      { elementName: "d_4" },
    ],
  },
  cursorPostion: 1,
};

const SCRIPT_UP_INPUT_TREE_TEMPLATE = {
  tree: {
    elementName: "d_0",
    attributes: "d_1",
    children: [
      { elementName: "mrow" },
      {
        elementName: "mo",
        textContent: "d_2",
        attributes: "d_3",
      },
    ],
  },
  cursorPostion: 1,
};

export const treeTemplateMap = {
  inverseFunction: INVERSE_FN_TREE_TEMPLATE,
  fn: FN_TREE_TEMPLATE,
  log10: LOG_B10_TREE_TEMPLATE,
  logN: LOG_BN_TREE_TEMPLATE,
  bigOperatorWithInputs: BIG_OPT_UNDER_OVER_TREE_TEMPLATE,
  scriptD: SCRIPT_DOWN_INPUT_TREE_TEMPLATE,
  scriptU: SCRIPT_UP_INPUT_TREE_TEMPLATE,
};
