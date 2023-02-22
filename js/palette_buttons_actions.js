import { handleTableCellHover } from "./common.js";
import { treeTemplateMap } from "./math_tree_templates.js";

const createElement = (e) => document.createElement(e);

const createTreeTemplate = (arr) => {
  const [elementName, children, textContent, attributes] = arr;
  const childrenValue = (children || []).map((arr) => createTreeTemplate(arr));
  return {
    elementName,
    ...(children?.length && { children: childrenValue }),
    ...(textContent && { textContent: textContent }),
    ...(attributes && { attributes: attributes }),
  };
};

//templateArray: [elementName: String, children: <Arrary<Array>>, textContent: String, attributes: Object] Can be sparse array
const createTemplateAndInsert = (
  insert,
  updateEquation,
  { templateArray, cursorPostion }
) => {
  treeTemplateMap["staticTemplate"] = {
    tree: createTreeTemplate(templateArray),
    cursorPostion: cursorPostion || 1,
  };
  insertTree(insert, updateEquation, { treeType: "staticTemplate" });
};

const setAttributes = (element, attributes) => {
  for (let [key, value] of Object.entries(attributes || {})) {
    element.setAttribute(key, value);
  }
};
export const insertSymbol = (
  insert,
  updateEquation,
  { symbol, attributes, tagName, inputs }
) => {
  const ele = createElement(tagName);
  setAttributes(ele, attributes);
  inputs
    ? [...Array(inputs)].forEach(() => ele.appendChild(createElement("mrow")))
    : (ele.textContent = symbol);
  insert(ele, 1);
  updateEquation();
};

const openPad = (ele, { attributes, isIdentityMatrix, elementId }) => {
  handleTableCellHover(1, 1);
  const padDiv = document.getElementById(elementId);
  const rectangle = ele.getBoundingClientRect();
  padDiv.style.top = `${rectangle.top + rectangle.height * 0.5}px`;
  padDiv.style.left = `${rectangle.right}px`;
  padDiv.style.display = "block";
  attributes && padDiv.setAttribute("attributes", JSON.stringify(attributes));
  isIdentityMatrix && padDiv.setAttribute("isIdentityMatrix", "true");
};

const insertTree = (insert, updateEquation, { dynamicData, treeType }) => {
  const { tree, cursorPostion } = treeTemplateMap[treeType];
  const getActualValue = (value) => {
    return typeof value === "string" && value.startsWith("d_")
      ? dynamicData[value.slice(2)]
      : value;
  };

  const createTree = ({ elementName, children, textContent, attributes }) => {
    if (!getActualValue(elementName)) return;
    const element = createElement(getActualValue(elementName));
    (children || []).forEach((obj) => {
      const mt = createTree(obj);
      if (mt) element.appendChild(mt);
    });
    if (textContent) element.textContent = getActualValue(textContent);
    if (attributes) setAttributes(element, getActualValue(attributes) || {});
    return element;
  };
  insert(createTree(tree), cursorPostion || 1);
  updateEquation();
};

const SYMBOL_TEMPLATE_OBJECT = {
  method: insertSymbol,
  tagName: "mo",
};

export const buttonMethodMap = {
  "Square Root": { ...SYMBOL_TEMPLATE_OBJECT, inputs: 1, tagName: "msqrt" },
  Fraction: {
    ...SYMBOL_TEMPLATE_OBJECT,
    tagName: "mfrac",
    inputs: 2,
  },
  "Bevelled Fraction": {
    ...SYMBOL_TEMPLATE_OBJECT,
    inputs: 2,
    tagName: "mfrac",
    attributes: { bevelled: "true" },
  },
  Root: {
    ...SYMBOL_TEMPLATE_OBJECT,
    inputs: 2,
    tagName: "mroot",
  },
  Superscript: {
    ...SYMBOL_TEMPLATE_OBJECT,
    inputs: 2,
    tagName: "msup",
  },
  Subscript: {
    ...SYMBOL_TEMPLATE_OBJECT,
    inputs: 2,
    tagName: "msub",
  },
  Parentheses: {
    ...SYMBOL_TEMPLATE_OBJECT,
    inputs: 1,
    tagName: "mfenced",
  },
  "Vertical Bars": {
    ...SYMBOL_TEMPLATE_OBJECT,
    inputs: 1,
    tagName: "mfenced",
    attributes: { open: "|", close: "|" },
  },
  "Square Brackets": {
    ...SYMBOL_TEMPLATE_OBJECT,
    inputs: 1,
    tagName: "mfenced",
    attributes: { open: "[", close: "]" },
  },
  "Curly Brackets": {
    ...SYMBOL_TEMPLATE_OBJECT,
    inputs: 1,
    tagName: "mfenced",
    attributes: { open: "{", close: "}" },
  },
  //   "Select Brackets": {
  //     method: insertSelectBrackets,
  //     tagName: "mfenced",
  //     attributes: { notation: "box" },
  //   },
  "Angle Brackets": {
    ...SYMBOL_TEMPLATE_OBJECT,
    inputs: 1,
    tagName: "mfenced",
    attributes: { open: "<", close: ">" },
  },
  "Plus Sign": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "+" },
  "Minus Sign": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "-" },
  "Multiplication Sign": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "×" },
  "Division Sign": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "÷" },
  "Forward Slash": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "/" },
  "Plus-minus Sign": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "±" },
  "Greater Than": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&gt;" },
  "Less Than": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&lt;" },
  "Greater Than or Equal To": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "≥" },
  "Less Than or Equal To": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "≤" },
  "Element Of": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "∈" },
  "Subset Of": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⊂" },
  Union: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "∪" },
  Intersection: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "∩" },
  Infinity: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "∞" },
  "Empty Set": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "∅" },
  Theta: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "θ" },
  Box: {
    ...SYMBOL_TEMPLATE_OBJECT,
    inputs: 1,
    tagName: "menclose",
    attributes: { notation: "box" },
  },
  "Up Diagonal Strike": {
    ...SYMBOL_TEMPLATE_OBJECT,
    inputs: 1,
    tagName: "menclose",
    attributes: { notation: "updiagonalstrike" },
  },
  Circle: {
    ...SYMBOL_TEMPLATE_OBJECT,
    inputs: 1,
    tagName: "menclose",
    attributes: { notation: "circle" },
  },
  "Down Diagonal Strike": {
    ...SYMBOL_TEMPLATE_OBJECT,
    inputs: 1,
    tagName: "menclose",
    attributes: { notation: "downdiagonalstrike" },
  },
  "Horizontal Strike": {
    ...SYMBOL_TEMPLATE_OBJECT,
    inputs: 1,
    tagName: "menclose",
    attributes: { notation: "horizontalstrike" },
  },
  "Thick Space": {
    ...SYMBOL_TEMPLATE_OBJECT,
    tagName: "mspace",
    attributes: { width: "0.4em" },
  },
  "Thinner Space": {
    ...SYMBOL_TEMPLATE_OBJECT,
    tagName: "mspace",
    attributes: { width: "0.05em" },
  },
  "Back Space": {
    ...SYMBOL_TEMPLATE_OBJECT,
    tagName: "mspace",
    attributes: { width: "-0.05em" },
  },
  "Middle Dot": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "·" },
  Bullet: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "•" },
  "Ring Operator": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "∘" },
  "Minus-plus Sign": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "∓" },
  "Circled Division": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⊘" },
  "Diamond Operator": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⋄" },
  "Not Sign": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "¬" },
  "Logical Or": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "∨" },
  "Logical And": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "∧" },
  "For All": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "∀" },
  "There Exists": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "∃" },
  "There Does Not Exists": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "∄" },
  Factorial: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "!" },
  Increment: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "△" },
  Nabla: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "▽" },
  "Partial differential": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "∂" },
  "Double Apostrophe": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: `"`,
    tagName: "mi",
  },
  Apostrophe: { ...SYMBOL_TEMPLATE_OBJECT, symbol: `'`, tagName: "mi" },
  Complement: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "∁" },
  Angle: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "∠" },
  "Measured Angle": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "∡" },
  "Spherical Angle": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "∢" },
  "Right Angle": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&#x221F;" },
  "Perpendicular To": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⊥" },
  "Parallel To": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "∥" },
  "Degree Sign": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "°", tagName: "mi" },
  Therefore: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "∴" },
  Because: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "∵" },
  Permille: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "‰" },
  Equal: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "=" },
  "Identical To": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "≡" },
  "Not Equal To": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "≠" },
  "Not Identical To": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "≢" },
  "Similar To": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "∼" },
  "Almost Equal To (Asymptotic To)": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "≈" },
  "Not Similar To": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "≁" },
  "Not Almost Equal To": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "≉" },
  "Asymptotically Equal To": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "≃" },
  "Approximately Equal To": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "≅" },
  "Not Asymptotically Equal To": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "≄" },
  "Neither Approximately nor Actually Equal To": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "≇",
  },
  "Circled Plus": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⊕" },
  "Circled Minus": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⊖" },
  "Circled Times": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⊗" },
  Percentage: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "%" },
  Asterisk: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "*" },
  "Circled Dot": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⊙" },
  "Not Greater Than": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "≯" },
  "Not Less Than": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "≮" },
  "Neither Greater Than nor Equal To": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "≱",
  },
  "Neither Less Than nor Equal To": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "≰" },
  "Much Greater Than": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "≫" },
  "Much Less Than": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "≪" },
  "Equivalent To": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "≍" },
  "Proportional To": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "∝" },
  "Contains as member": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "∋" },
  "Not Element Of": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "∉" },
  "Not Contains as member": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "∌" },
  "Superset Of": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⊃" },
  "Not Subset Of": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⊄" },
  "Not Superset Of": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⊅" },
  "Subset Of or Equal To": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⊆" },
  "Superset Of or Equal To": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⊇" },
  "Neither Subset Of nor Equal To": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⊈" },
  "Neither Superset Of nor Equal To": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "⊉",
  },
  "Natural Numbers (Double-struck Capital n)": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "N",
  },
  "Integer numbers (Double-struck Capital z)": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "Z",
  },
  "Real Numbers (Double-struck Capital r)": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "R",
  },
  "Complex Numbers (Double-struck Capital c)": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "C",
  },
  "Rational Numbers (Double-struck Capital q)": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "Q",
  },
  "Prime Numbers (Double-struck Capital p)": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "P",
  },
  Aleph: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "ℵ" },
  Precedes: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "≺" },
  Succeeds: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "≻" },
  "Precedes or Equal To": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "≼" },
  "Succeeds or Equal To": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "≽" },
  "Normal Subgroup Of": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⊲" },
  "Contains as Normal Subgroup": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "⊳",
  },
  "Square Image Of": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⊏" },
  "Square Original Of": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⊐" },
  "Square Image Of or Equal To": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "⊑",
  },
  "Square Original Of or Equal To": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "⊒",
  },
  Proves: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⊢" },
  "Does Not Yield": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⊣" },
  "Not Parallel To": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "∦" },
  "Left Arrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "←" },
  "Right Arrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "→" },
  "Left-Right Arrow": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "↔",
  },
  "Up Arrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "↑" },
  "Down Arrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "↓" },
  "Up-Down Arrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "↕" },
  "Leftwards Double Arrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⇐" },
  "Rightwards Double Arrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⇒" },
  "Left-Right Double Arrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⇔" },
  "Up Double Arrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⇑" },
  "Down Double Arrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⇓" },
  "Up-Down Double Arrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⇕" },
  "Diagonal Upward Right Arrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "↗" },
  "Diagonal Upward Left Arrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "↖" },
  "Diagonal Downward Right Arrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "↘" },
  "Diagonal Downward Left Arrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "↙" },
  "Diagonal Downward Right Upward Left Arrow": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "⤡",
  },
  "Diagonal Upward Right Downward Left Arrow": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "⤢",
  },
  "Left Paired Arrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⇇" },
  "Right Paired Arrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⇉" },
  "Left-Right Paired Arrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⇆" },
  "Right-Left Paired Arrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⇄" },
  "Up Paired Arrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⇈" },
  "Down Paired Arrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⇊" },
  "Left Harpoon with barb up above dash": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "⥪",
  },
  "Right Harpoon with barb up above dash": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "⥬",
  },
  "Up harpoon with barb left and down harpoon with barb right": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "⥮",
  },
  "Down harpoon with barb left and Up Harpoon with barb right": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "⥯",
  },
  "Left Upward and Right Downward Arrow": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "⇅",
  },
  "Left Downward and Right Upward Arrow": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "⇵",
  },
  "Left harpoon over Right harpoon": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⇋" },
  "Right harpoon over Left harpoon": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⇌" },
  "Up harpoon with barb left": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "↿" },
  "Up harpoon with barb right": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "↾" },
  "Down harpoon with barb left": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⇃" },
  "Down harpoon with barb right": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⇂" },
  "Left arrow with stroke": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "↚" },
  "Right arrow with stroke": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "↛" },
  "Left-right arrow with stroke": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "↮" },
  "Left double arrow with stroke": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⇍" },
  "Right double arrow with stroke": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⇏" },
  "Left-right double arrow with stroke": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "⇎",
  },
  "Left arrow from bar": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "↤" },
  "Right arrow from bar": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "↦" },
  "Left dashed arrrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⇠" },
  "Right dashed arrrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⇢" },
  "Left two-headed arrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "↞" },
  "Right two-headed arrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "↠" },
  "Left arrow with hook": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "↩" },
  "Right arrow with hook": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "↪" },
  "Left arrow with loop": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "↫" },
  "Right arrow with loop": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "↬" },
  "Left arrow with tail": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "↢" },
  "Right arrow with tail": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "↣" },
  "Up arrow with tip left": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "&#x21b0;",
    attributes: { stretchy: false },
  },
  "Up arrow with tip right": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "&#x21b1;",
    attributes: { stretchy: false },
  },
  "Down arrow with tip left": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "&#x21b2;",
  },
  "Down arrow with tip right": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "&#x21b3;",
  },
  "Left tripple arrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⇚" },
  "Right tripple arrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⇛" },
  "Counterclockwise top semicircle arrow": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "↶",
  },
  "Clockwise top semicircle arrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "↷" },
  "Counterclockwise open semicircle arrow": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "↺",
  },
  "Clockwise open semicircle arrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "↻" },
  Multimap: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⊸" },
  "Left-right wave arrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&#x21ad;" },
  "Left squiggle arrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⇜" },
  "Right squiggle arrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⇝" },
  "Left harpoon with barb up": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "↼" },
  "Left harpoon with barb down": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "↽" },
  "Right harpoon with barb up": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⇀" },
  "Right harpoon with barb down": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⇁" },
  "Left wave arrow": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "&#x219c;",
  },
  "Right wave arrow": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&#x219d;" },
  Alpha: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&#x3b1;", tagName: "mi" },
  Beta: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&#x3b2;", tagName: "mi" },
  Gamma: { ...SYMBOL_TEMPLATE_OBJECT, tagName: "mi", symbol: "&#x3b3;" },
  "Gamma Variant": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "&#x393;",
    tagName: "mi",
  },
  Delta: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&#x3b4;", tagName: "mi" },
  "Delta Variant": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "&#x394;",
    tagName: "mi",
  },
  Epsilon: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&#x3b5;", tagName: "mi" },
  "Epsilon Variant": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "&#x3f5;",
    tagName: "mi",
  },
  Zeta: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&#x3b6;", tagName: "mi" },
  Eta: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&#x3b7;", tagName: "mi" },
  Theta: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&#x3b8;", tagName: "mi" },
  "Theta Variant": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "&#x3d1;",
    tagName: "mi",
  },
  Iota: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&#x3b9;", tagName: "mi" },
  Kappa: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&#x3ba;", tagName: "mi" },
  Lambda: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&#x3bb;", tagName: "mi" },
  Mu: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&#x3bc;", tagName: "mi" },
  Nu: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&#x3bd;", tagName: "mi" },
  Xi: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&#x3be;", tagName: "mi" },
  Omicron: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&#x3bf;", tagName: "mi" },
  Pi: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&#x3c0;", tagName: "mi" },
  "Pi Variant": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&#x3d6;", tagName: "mi" },
  Rho: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&#x3c1;", tagName: "mi" },
  "Rho Variant": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "&#x3f1;",
    tagName: "mi",
  },
  Sigmaa: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&#x3c3;", tagName: "mi" },
  "Sigma Variant": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "&#x3c2;",
    tagName: "mi",
  },
  Tau: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&#x3c4;", tagName: "mi" },
  Upsilon: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&#x3c5;", tagName: "mi" },
  Phi: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&#x3c6;", tagName: "mi" },
  "Phi Variant": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "&#x3d5;",
    tagName: "mi",
  },
  "Bold Phi": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&#x3a6;", tagName: "mi" },
  Chi: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&#x3c7;", tagName: "mi" },
  Psi: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&#x3c8;", tagName: "mi" },
  Omega: { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&#x3c9;", tagName: "mi" },
  "Theta Symbol": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "&#x398;",
    tagName: "mi",
  },
  "Lambda Symbol": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "&#x39b;",
    tagName: "mi",
  },
  "Xi Symbol": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&#x39e;", tagName: "mi" },
  "Pi Symbol": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&#x3a0;", tagName: "mi" },
  "Upsilon Symbol": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "&#x3d2;",
    tagName: "mi",
  },
  "Psi Symbol": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "&#x3a8;", tagName: "mi" },
  "Omega Symbol": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "&#x3a9;",
    tagName: "mi",
  },
  "Sum Symbol P": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "&#x3a3;",
    tagName: "mi",
  },

  "Double-struck Capital a": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "A",
    attributes: { mathvariant: "double-struck" },
  },
  "Double-struck Capital b": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "B",
    attributes: { mathvariant: "double-struck" },
  },
  "Complex Numbers (Double-struck Capital c)": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "C",
    attributes: { mathvariant: "double-struck" },
  },
  "Double-struck Capital d": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "D",
    attributes: { mathvariant: "double-struck" },
  },
  "Double-struck Capital e": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "E",
    attributes: { mathvariant: "double-struck" },
  },
  "Double-struck Capital f": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "F",
    attributes: { mathvariant: "double-struck" },
  },
  "Double-struck Capital g": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "G",
    attributes: { mathvariant: "double-struck" },
  },
  "Double-struck Capital h": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "H",
    attributes: { mathvariant: "double-struck" },
  },
  "Double-struck Capital i": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "I",
    attributes: { mathvariant: "double-struck" },
  },
  "Double-struck Capital j": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "J",
    attributes: { mathvariant: "double-struck" },
  },
  "Double-struck Capital k": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "K",
    attributes: { mathvariant: "double-struck" },
  },
  "Double-struck Capital l": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "L",
    attributes: { mathvariant: "double-struck" },
  },
  "Double-struck Capital m": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "M",
    attributes: { mathvariant: "double-struck" },
  },
  "Natural Numbers (Double-struck Capital n)": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "N",
    attributes: { mathvariant: "double-struck" },
  },
  "Double-struck Capital o": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "O",
    attributes: { mathvariant: "double-struck" },
  },
  "Prime Numbers (Double-struck Capital p)": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "P",
    attributes: { mathvariant: "double-struck" },
  },
  "Rational Numbers (Double-struck Capital q)": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "Q",
    attributes: { mathvariant: "double-struck" },
  },
  "Real Numbers (Double-struck Capital r)": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "R",
    attributes: { mathvariant: "double-struck" },
  },
  "Double-struck Capital s": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "S",
    attributes: { mathvariant: "double-struck" },
  },
  "Double-struck Capital t": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "T",
    attributes: { mathvariant: "double-struck" },
  },
  "Double-struck Capital u": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "U",
    attributes: { mathvariant: "double-struck" },
  },
  "Double-struck Capital v": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "V",
    attributes: { mathvariant: "double-struck" },
  },
  "Double-struck Capital w": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "W",
    attributes: { mathvariant: "double-struck" },
  },
  "Double-struck Capital x": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "X",
    attributes: { mathvariant: "double-struck" },
  },
  "Double-struck Capital y": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "Y",
    attributes: { mathvariant: "double-struck" },
  },
  "Integer numbers (Double-struck Capital z)": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "Z",
    attributes: { mathvariant: "double-struck" },
  },
  "Script Capital a": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "A",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script Capital b": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "B",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script Capital c": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "C",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script Capital d": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "D",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script Capital e": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "E",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script Capital f": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "F",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script Capital g": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "G",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script Capital h": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "H",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script Capital i": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "I",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script Capital j": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "J",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script Capital k": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "K",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script Capital l": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "L",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script Capital m": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "M",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script Capital n": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "N",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script Capital o": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "O",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script Capital p": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "P",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script Capital q": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "Q",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script Capital r": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "R",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script Capital s": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "S",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script Capital t": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "T",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script Capital u": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "U",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script Capital v": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "V",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script Capital w": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "W",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script Capital x": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "X",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script Capital y": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "Y",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script Capital z": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "Z",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script a": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "a",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script b": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "b",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script c": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "c",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script d": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "d",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script e": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "e",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script f": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "f",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script g": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "g",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script h": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "h",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script i": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "i",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script j": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "j",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script k": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "k",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script l": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "l",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script m": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "m",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script n": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "n",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script o": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "o",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script p": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "p",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script q": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "q",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script r": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "r",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script s": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "s",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script t": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "t",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script u": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "u",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script v": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "v",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script w": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "w",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script x": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "x",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script y": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "y",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Script z": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "z",
    attributes: { mathvariant: "script" },
    tagName: "mi",
  },
  "Fraktur Capital a": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "A",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur Capital b": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "B",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur Capital c": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "C",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur Capital d": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "D",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur Capital e": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "E",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur Capital f": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "F",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur Capital g": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "G",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur Capital h": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "H",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur Capital i": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "I",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur Capital j": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "J",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur Capital k": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "K",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur Capital l": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "L",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur Capital m": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "M",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur Capital n": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "N",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur Capital o": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "O",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur Capital p": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "P",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur Capital q": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "Q",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur Capital r": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "R",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur Capital s": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "S",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur Capital t": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "T",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur Capital u": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "U",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur Capital v": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "V",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur Capital w": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "W",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur Capital x": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "X",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur Capital y": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "Y",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur Capital z": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "Z",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur a": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "a",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur b": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "b",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur c": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "c",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur d": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "d",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur e": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "e",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur f": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "f",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur g": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "g",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur h": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "h",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur i": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "i",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur j": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "j",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur k": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "k",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur l": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "l",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur m": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "m",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur n": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "n",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur o": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "o",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur p": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "p",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur q": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "q",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur r": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "r",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur s": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "s",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur t": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "t",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur u": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "u",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur v": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "v",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur w": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "w",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur x": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "x",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur y": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "y",
    attributes: { mathvariant: "fraktur" },
  },
  "Fraktur z": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "z",
    attributes: { mathvariant: "fraktur" },
  },
  "Down Right Diagonal Ellipsis": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⋱" },
  "Midline Horizontal Ellipsis": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⋯" },
  "Up Right Diagonal Ellipsis": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⋰" },
  "Vertical Ellipsis": { ...SYMBOL_TEMPLATE_OBJECT, symbol: "⋮" },

  // --------------- ****** Matrix ****** --------------------------
  "m x n Matrix": {
    method: openPad,
    elementId: "mathtype_matrix_pad",
    type: "customComponent",
  },
  "m x n Matrix with Vertical Bars": {
    method: openPad,
    elementId: "mathtype_matrix_pad",
    type: "customComponent",
    attributes: { open: "|", close: "|" },
  },
  "m x n Matrix with Left Brace": {
    method: openPad,
    elementId: "mathtype_matrix_pad",
    type: "customComponent",
    attributes: { open: "{", close: "" },
  },
  "m x n Matrix with Parenthesis": {
    method: openPad,
    elementId: "mathtype_matrix_pad",
    type: "customComponent",
    attributes: {},
  },
  "m x n Matrix with Square Brackets": {
    method: openPad,
    elementId: "mathtype_matrix_pad",
    type: "customComponent",
    attributes: { open: "[", close: "]" },
  },
  "m x n Matrix with Right Brace": {
    method: openPad,
    elementId: "mathtype_matrix_pad",
    type: "customComponent",
    attributes: { open: "", close: "}" },
  },
  "n x n Identity Matrix with Parenthesis": {
    method: openPad,
    elementId: "mathtype_matrix_pad",
    type: "customComponent",
    attributes: {},
    isIdentityMatrix: true,
  },
  "n x n Identity Matrix with Square Brackets": {
    method: openPad,
    elementId: "mathtype_matrix_pad",
    type: "customComponent",
    attributes: { open: "[", close: "]" },
    isIdentityMatrix: true,
  },
  "2x2 Matrix": { type: "matrix", m: 2, n: 2 },
  "2x2 Matrix with Double Bars": {
    type: "matrix",
    m: 2,
    n: 2,
    attributes: { open: "‖", close: "‖" },
  },
  "1x2 Matrix With Parenthesis": { type: "matrix", m: 1, n: 2, attributes: {} },
  "2x1 Matrix With Parenthesis": { type: "matrix", m: 2, n: 1, attributes: {} },
  "1x2 Matrix With Square Brackets": {
    type: "matrix",
    m: 1,
    n: 2,
    attributes: { open: "[", close: "]" },
  },
  "2x1 Matrix With Square Brackets": {
    type: "matrix",
    m: 2,
    n: 1,
    attributes: { open: "[", close: "]" },
  },
  "1x3 Matrix With Parenthesis": { type: "matrix", m: 1, n: 3, attributes: {} },
  "3x1 Matrix With Parenthesis": { type: "matrix", m: 3, n: 1, attributes: {} },
  "1x3 Matrix With Square Brackets": {
    type: "matrix",
    m: 1,
    n: 3,
    attributes: { open: "[", close: "]" },
  },
  "3x1 Matrix With Square Brackets": {
    type: "matrix",
    m: 3,
    n: 1,
    attributes: { open: "[", close: "]" },
  },
  //Scripts
  "Over Curly Brace": {
    method: insertTree,
    treeType: "scriptU",
    dynamicData: ["mover", { accent: true }, "⏞", { fontsize: "10px" }],
  },
  "Over Parenthesis": {
    method: insertTree,
    treeType: "scriptU",
    dynamicData: [
      "mover",
      { accent: true },
      "⌢",
      { stretchy: true, fontsize: "18px" },
    ],
  },
  "Under Curly Brace": {
    method: insertTree,
    treeType: "scriptU",
    dynamicData: ["munder", { accentunder: true }, "⏟", { fontsize: "10px" }],
  },
  "Under Parenthesis": {
    method: insertTree,
    treeType: "scriptU",
    dynamicData: [
      "munder",
      { accentunder: true },
      "⌣",
      { stretchy: true, fontsize: "18px" },
    ],
  },
  "Rightwards Arrow": {
    method: insertTree,
    treeType: "scriptU",
    dynamicData: ["mover", { accent: true }, "→", { fontsize: "18px" }],
  },
  "Leftwards Arrow": {
    method: insertTree,
    treeType: "scriptU",
    dynamicData: ["mover", { accent: true }, "←", { fontsize: "18px" }],
  },
  "Right-Left Arrow": {
    method: insertTree,
    treeType: "scriptU",
    dynamicData: ["mover", { accent: true }, "↔", { fontsize: "18px" }],
  },
  "Leftwards Harpoon Accent": {
    method: insertTree,
    treeType: "scriptU",
    dynamicData: ["mover", { accent: true }, "↼", { fontsize: "18px" }],
  },
  Tilde: {
    method: insertTree,
    treeType: "scriptU",
    dynamicData: ["mover", { accent: true }, "~", { fontsize: "18px" }],
  },
  Dot: {
    method: insertTree,
    treeType: "scriptU",
    dynamicData: ["mover", { accent: true }, "˙", { fontsize: "18px" }],
  },
  "Double Dot": {
    method: insertTree,
    treeType: "scriptU",
    dynamicData: ["mover", { accent: true }, "¨", { fontsize: "18px" }],
  },
  "Rightwards Harpoon Accent": {
    method: insertTree,
    treeType: "scriptU",
    dynamicData: [
      "mover",
      { accent: true },
      "⇀",
      { fontsize: "18px", fontweight: "normal", stretchy: true },
    ],
  },
  Bar: {
    method: insertTree,
    treeType: "scriptU",
    dynamicData: [
      "mover",
      ,
      "¯",
      { lspace: "0em", rspace: "0em", stretchy: true },
    ],
  },
  "Over Bar": {
    method: insertTree,
    treeType: "scriptU",
    dynamicData: ["mover", { accent: true }, "−", { stretchy: true }],
  },
  "Under Bar": {
    method: insertTree,
    treeType: "scriptU",
    dynamicData: ["munder", { accentunder: true }, "−", { stretchy: true }],
  },
  Breve: {
    method: insertTree,
    treeType: "scriptU",
    dynamicData: ["mover", { accent: true }, "˘", { stretchy: true }],
  },
  "Hat Accent": {
    method: insertTree,
    treeType: "scriptU",
    dynamicData: ["mover", { accent: true }, "^", { fontsize: "18px" }],
  },
  Check: {
    method: insertTree,
    treeType: "scriptU",
    dynamicData: [
      "mover",
      { accent: true },
      "ˇ",
      { fontsize: "30px", stretchy: true },
    ],
  },
  "Triple Dot": {
    method: insertTree,
    treeType: "scriptU",
    dynamicData: ["mover", { accent: true }, "…", { fontsize: "18px" }],
  },
  Grave: {
    method: insertTree,
    treeType: "scriptU",
    dynamicData: ["mover", { accent: true }, "`", { fontsize: "12px" }],
  },
  Acute: {
    method: insertTree,
    treeType: "scriptU",
    dynamicData: ["mover", { accent: true }, "´", { fontsize: "25px" }],
  },
  "Right Arrow with Over Script": {
    method: insertTree,
    treeType: "scriptD",
    dynamicData: ["mover", { accent: false }, "→", { fontsize: "18px" }],
  },
  "Right Arrow with Under Script": {
    method: insertTree,
    treeType: "scriptD",
    dynamicData: ["munder", { accentunder: false }, "→", { fontsize: "18px" }],
  },
  "Right Arrow with Under and Over Script": {
    method: insertTree,
    treeType: "scriptD",
    dynamicData: [
      "munderover",
      { accent: false },
      "→",
      { fontsize: "18px" },
      "mrow",
    ],
  },
  "Left Arrow with Over Script": {
    method: insertTree,
    treeType: "scriptD",
    dynamicData: ["mover", { accent: false }, "←", { fontsize: "18px" }],
  },
  "Left Arrow with Under Script": {
    method: insertTree,
    treeType: "scriptD",
    dynamicData: ["munder", { accentunder: false }, "←", { fontsize: "18px" }],
  },
  "Left Arrow with Under and Over Script": {
    method: insertTree,
    treeType: "scriptD",
    dynamicData: [
      "munderover",
      { accent: false },
      "←",
      { fontsize: "18px" },
      "mrow",
    ],
  },
  "Right-left Arrow with Over Script": {
    method: insertTree,
    treeType: "scriptD",
    dynamicData: ["mover", { accent: false }, "↔", { fontsize: "18px" }],
  },
  "Right-left Arrow with Under Script": {
    method: insertTree,
    treeType: "scriptD",
    dynamicData: ["munder", { accentunder: false }, "↔", { fontsize: "18px" }],
  },
  "Right-left Arrow with Under and Over Script": {
    method: insertTree,
    treeType: "scriptD",
    dynamicData: [
      "munderover",
      { accent: false },
      "↔",
      { fontsize: "18px" },
      "mrow",
    ],
  },
  "Left Double Arrow with Over Script": {
    method: insertTree,
    treeType: "scriptD",
    dynamicData: ["mover", { accent: false }, "⇐", { fontsize: "18px" }],
  },
  "Left Double Arrow with Under Script": {
    method: insertTree,
    treeType: "scriptD",
    dynamicData: ["munder", { accentunder: false }, "⇐", { fontsize: "18px" }],
  },
  "Left Double Arrow with Under and Over Script": {
    method: insertTree,
    treeType: "scriptD",
    dynamicData: [
      "munderover",
      { accent: false },
      "⇐",
      { fontsize: "18px" },
      "mrow",
    ],
  },
  "Right Double Arrow with Over Script": {
    method: insertTree,
    treeType: "scriptD",
    dynamicData: ["mover", { accent: false }, "⇒", { fontsize: "18px" }],
  },
  "Right Double Arrow with Under Script": {
    method: insertTree,
    treeType: "scriptD",
    dynamicData: ["munder", { accentunder: false }, "⇒", { fontsize: "18px" }],
  },
  "Right Double Arrow with Under and Over Script": {
    method: insertTree,
    treeType: "scriptD",
    dynamicData: [
      "munderover",
      { accent: false },
      "⇒",
      { fontsize: "18px" },
      "mrow",
    ],
  },
  "Right-left Double Arrow with Over Script": {
    method: insertTree,
    treeType: "scriptD",
    dynamicData: ["mover", { accent: false }, "⇔", { fontsize: "18px" }],
  },
  "Right-left Double Arrow with Under Script": {
    method: insertTree,
    treeType: "scriptD",
    dynamicData: ["munder", { accentunder: false }, "⇔", { fontsize: "18px" }],
  },
  "Right-left Double Arrow with Under and Over Script": {
    method: insertTree,
    treeType: "scriptD",
    dynamicData: [
      "munderover",
      { accent: false },
      "⇔",
      { fontsize: "18px" },
      "mrow",
    ],
  },

  "Over Script": {
    method: createTemplateAndInsert,
    templateArray: ["mover", [["mrow"], ["mrow"]], , { accent: "false" }],
  },

  "Under Script": {
    method: createTemplateAndInsert,
    templateArray: ["munder", [["mrow"], ["mrow"]], , { accentunder: "false" }],
  },
  "Over Script with Brace": {
    method: createTemplateAndInsert,
    templateArray: [
      "mover",
      [
        [
          "mover",
          [["mrow"], ["mo", , "&#x23de;", { fontsize: "18px" }]],
          ,
          { accent: "false" },
        ],
        ["mrow"],
      ],
      ,
      { accent: "false" },
    ],
  },
  "Under Script with Brace": {
    method: createTemplateAndInsert,
    templateArray: [
      "munder",
      [
        [
          "munder",
          [["mrow"], ["mo", , "&#x23df;", { fontsize: "18px" }]],
          ,
          { accentunder: "false" },
        ],
        ["mrow"],
      ],
      ,
      { accentunder: "false" },
    ],
  },
  "Subscript-Superscript": {
    method: createTemplateAndInsert,
    templateArray: ["msubsup", [["mrow"], ["mrow"], ["mrow"]]],
  },
  "Left Subscript-Superscript": {
    method: createTemplateAndInsert,
    templateArray: [
      "mmultiscripts",
      [["mrow"], ["mprescripts"], ["mrow"], ["mrow"]],
    ],
  },
  "Under and Over Script": {
    method: createTemplateAndInsert,
    templateArray: [
      "munderover",
      [["mrow"], ["mrow"], ["mrow"]],
      ,
      { accent: "false", accentunder: "false" },
    ],
  },
  "Limit with Underscript": {
    method: insertTree,
    treeType: "scriptD",
    dynamicData: ["munder", { accentunder: false }, "lim"],
  },

  "Limit to Infinity": {
    method: createTemplateAndInsert,
    templateArray: [
      "munder",
      [
        ["mi", , "lim"],
        [
          "mrow",
          [
            ["mrow"],
            ["mo", , "&#x2192;", { lspace: "0em", rspace: "0em" }],
            ["mi", , "&#x221e;"],
          ],
        ],
      ],
      ,
      { accentunder: false },
    ],
    cursorPostion: 2,
  },
  Curl: {
    method: createTemplateAndInsert,
    templateArray: [
      "mrow",
      [
        ["mo", , "&#x2207;", { rspace: "0em" }],
        ["mo", , "&#xd7;", { rspace: "0em", lspace: "0em" }],
        ["mrow"],
      ],
    ],
    cursorPostion: 4,
  },
  Divergence: {
    method: createTemplateAndInsert,
    templateArray: [
      "mrow",
      [
        ["mo", , "&#x2207;", { rspace: "0em" }],
        ["mo", , "&#xb7;", { rspace: "0.1em", lspace: "0em" }],
        ["mrow"],
      ],
    ],
    cursorPostion: 4,
  },
  Gradient: {
    method: createTemplateAndInsert,
    templateArray: [
      "mrow",
      [["mo", , "&#x2207;", { rspace: "0em" }], ["mrow"]],
    ],
    cursorPostion: 3,
  },
  Laplacian: {
    method: createTemplateAndInsert,
    templateArray: [
      "mrow",
      [["mo", , "&#x2206;", { rspace: "0em" }], ["mrow"]],
    ],
    cursorPostion: 3,
  },
  Derivative: {
    method: createTemplateAndInsert,
    templateArray: [
      "mfrac",
      [
        ["mrow", [["mi", , "d"], ["mrow"]]],
        ["mrow", [["mi", , "d"], ["mrow"]]],
      ],
    ],
    cursorPostion: 3,
  },
  "Partial Derivative": {
    method: createTemplateAndInsert,
    templateArray: [
      "mfrac",
      [
        ["mrow", [["mo", , "∂"], ["mrow"]]],
        ["mrow", [["mo", , "∂"], ["mrow"]]],
      ],
    ],
    cursorPostion: 3,
  },
  "Definite Integral": {
    method: createTemplateAndInsert,
    templateArray: [
      "mrow",
      [
        [
          "munderover",
          [["mo", , "&#x222b;"], ["mrow"], ["mrow"]],
          ,
          { accent: "false", accentunder: "false" },
        ],
        ["mrow"],
        ["mi", , "d", { lspace: "0.2em", rspace: "0" }],
        ["mrow"],
      ],
    ],
    cursorPostion: 2,
  },
  "Definite Integral SS": {
    method: createTemplateAndInsert,
    templateArray: [
      "mrow",
      [
        ["msubsup", [["mo", , "&#x222b;"], ["mrow"], ["mrow"]]],
        ["mrow"],
        ["mi", , "d", { lspace: "0.2em", rspace: "0" }],
        ["mrow"],
      ],
    ],
    cursorPostion: 2,
  },
  //Functions
  "Natural Logarithm": {
    method: insertTree,
    treeType: "fn",
    dynamicData: ["ln"],
  },
  Logarithm: {
    method: insertTree,
    treeType: "fn",
    dynamicData: ["log"],
  },
  "Logarithm to Base 10": {
    method: insertTree,
    treeType: "log10",
    dynamicData: ["log", { separators: "," }],
  },
  Power: {
    method: insertTree,
    treeType: "fn",
    dynamicData: ["exp"],
  },
  "Logarithm to base n": {
    method: insertTree,
    treeType: "logN",
    dynamicData: ["log"],
  },
  "Sine Function": {
    method: insertTree,
    treeType: "fn",
    dynamicData: ["sin"],
  },
  "Tangent Function": {
    method: insertTree,
    treeType: "fn",
    dynamicData: ["tan"],
  },
  "Secant Function": {
    method: insertTree,
    treeType: "fn",
    dynamicData: ["sec"],
  },
  "Cosine Function": {
    method: insertTree,
    treeType: "fn",
    dynamicData: ["cos"],
  },
  "Cotangent Function": {
    method: insertTree,
    treeType: "fn",
    dynamicData: ["cot"],
  },
  "Cosecant Function": {
    method: insertTree,
    treeType: "fn",
    dynamicData: ["csc"],
  },
  "Inverse Sine Function": {
    method: insertTree,
    treeType: "inverseFunction",
    dynamicData: ["sin"],
  },
  "Inverse Tangent Function": {
    method: insertTree,
    treeType: "inverseFunction",
    dynamicData: ["tan"],
  },
  "Inverse Secant Function": {
    method: insertTree,
    treeType: "inverseFunction",
    dynamicData: ["sec"],
  },
  "Inverse Cosine Function": {
    method: insertTree,
    treeType: "inverseFunction",
    dynamicData: ["cos"],
  },
  "Inverse Cotangent Function": {
    method: insertTree,
    treeType: "inverseFunction",
    dynamicData: ["cot"],
  },
  "Inverse Cosecant Function": {
    method: insertTree,
    treeType: "inverseFunction",
    dynamicData: ["csc"],
  },
  arcsin: {
    method: insertTree,
    treeType: "fn",
    dynamicData: ["arcsin"],
  },
  arctan: {
    method: insertTree,
    treeType: "fn",
    dynamicData: ["arctan"],
  },
  arcsec: {
    method: insertTree,
    treeType: "fn",
    dynamicData: ["arcsec"],
  },
  arccos: {
    method: insertTree,
    treeType: "fn",
    dynamicData: ["arccos"],
  },
  arccot: {
    method: insertTree,
    treeType: "fn",
    dynamicData: ["arccot"],
  },
  arccsc: {
    method: insertTree,
    treeType: "fn",
    dynamicData: ["arccsc"],
  },

  //Hyperbolic Trignometry
  "Hyperbolic Sine Function": {
    method: insertTree,
    treeType: "fn",
    dynamicData: ["sinh"],
  },
  "Hyperbolic Tangent Function": {
    method: insertTree,
    treeType: "fn",
    dynamicData: ["tanh"],
  },
  "Hyperbolic Secant Function": {
    method: insertTree,
    treeType: "fn",
    dynamicData: ["sech"],
  },
  "Hyperbolic Cosine Function": {
    method: insertTree,
    treeType: "fn",
    dynamicData: ["cosh"],
  },
  "Hyperbolic Cotangent Function": {
    method: insertTree,
    treeType: "fn",
    dynamicData: ["coth"],
  },
  "Hyperbolic Cosecant Function": {
    method: insertTree,
    treeType: "fn",
    dynamicData: ["csch"],
  },
  "Inverse Hyperbolic Sine Function": {
    method: insertTree,
    treeType: "inverseFunction",
    dynamicData: ["sinh"],
  },
  "Inverse Hyperbolic Tangent Function": {
    method: insertTree,
    treeType: "inverseFunction",
    dynamicData: ["tanh"],
  },
  "Inverse Hyperbolic Secant Function": {
    method: insertTree,
    treeType: "inverseFunction",
    dynamicData: ["sech"],
  },
  "Inverse Hyperbolic Cosine Function": {
    method: insertTree,
    treeType: "inverseFunction",
    dynamicData: ["cosh"],
  },
  "Inverse Hyperbolic Cotangent Function": {
    method: insertTree,
    treeType: "inverseFunction",
    dynamicData: ["coth"],
  },
  "Inverse Hyperbolic Cosecant Function": {
    method: insertTree,
    treeType: "inverseFunction",
    dynamicData: ["csch"],
  },
  arcsinh: {
    method: insertTree,
    treeType: "fn",
    dynamicData: ["arcsinh"],
  },
  arctanh: {
    method: insertTree,
    treeType: "fn",
    dynamicData: ["arctanh"],
  },
  arcsech: {
    method: insertTree,
    treeType: "fn",
    dynamicData: ["arcsech"],
  },
  arccosh: {
    method: insertTree,
    treeType: "fn",
    dynamicData: ["arccosh"],
  },
  arccoth: {
    method: insertTree,
    treeType: "fn",
    dynamicData: ["arccoth"],
  },
  arccsch: {
    method: insertTree,
    treeType: "fn",
    dynamicData: ["arccsch"],
  },

  //Big Operators
  "Sum Symbol": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "∑",
  },
  "Product Symbol": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "∏",
  },
  "Co-Product Symbol": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "∐",
  },
  "U-Union Symbol": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "⋃",
  },
  "V-Union Symbol": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "⋁",
  },
  "U-Intersection Symbol": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "⋂",
  },
  "V-Intersection Symbol": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "⋀",
  },
  "Integral Symbol": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "∫",
  },
  "Double Integral Symbol": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "∬",
  },
  "Triple Integral Symbol": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "∭",
  },
  "Contour Integral Symbol": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "∮",
  },
  "Contour Double Integral Symbol": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "∯",
  },
  "Contour Triple Integral Symbol": {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "∰",
  },

  //withinput big operator
  Sum: {
    method: insertTree,
    treeType: "bigOperatorWithInputs",
    dynamicData: ["munderover", "∑", { movablelimits: "false" }],
  },
  Product: {
    method: insertTree,
    treeType: "bigOperatorWithInputs",
    dynamicData: ["munderover", "∏", { movablelimits: "false" }],
  },
  "Co-Product": {
    method: insertTree,
    treeType: "bigOperatorWithInputs",
    dynamicData: ["munderover", "∐", { movablelimits: "false" }],
  },
  "U-Union": {
    method: insertTree,
    treeType: "bigOperatorWithInputs",
    dynamicData: ["munderover", "⋃", { movablelimits: "false" }],
  },
  "V-Union": {
    method: insertTree,
    treeType: "bigOperatorWithInputs",
    dynamicData: ["munderover", "⋁", { movablelimits: "false" }],
  },
  "U-Intersection": {
    method: insertTree,
    treeType: "bigOperatorWithInputs",
    dynamicData: ["munderover", "⋂", { movablelimits: "false" }],
  },
  "V-Intersection": {
    method: insertTree,
    treeType: "bigOperatorWithInputs",
    dynamicData: ["munderover", "⋀", { movablelimits: "false" }],
  },
  Integral: {
    method: insertTree,
    treeType: "bigOperatorWithInputs",
    dynamicData: ["munderover", "∫", { movablelimits: "false" }],
  },
  "Double Integral": {
    method: insertTree,
    treeType: "bigOperatorWithInputs",
    dynamicData: ["munderover", "∬", { movablelimits: "false" }],
  },
  "Triple Integral": {
    method: insertTree,
    treeType: "bigOperatorWithInputs",
    dynamicData: ["munderover", "∭", { movablelimits: "false" }],
  },
  "Contour Integral": {
    method: insertTree,
    treeType: "bigOperatorWithInputs",
    dynamicData: ["munderover", "∮", { movablelimits: "false" }],
  },
  "Serface Integral": {
    method: insertTree,
    treeType: "bigOperatorWithInputs",
    dynamicData: ["munderover", "∯", { movablelimits: "false" }],
  },
  "Volume Integral": {
    method: insertTree,
    treeType: "bigOperatorWithInputs",
    dynamicData: ["munderover", "∰", { movablelimits: "false" }],
  },

  //subsup
  Summation: {
    method: insertTree,
    treeType: "bigOperatorWithInputs",
    dynamicData: ["msubsup", "∑"],
  },
  "Product SS": {
    method: insertTree,
    treeType: "bigOperatorWithInputs",
    dynamicData: ["msubsup", "∏"],
  },
  "Co-Product SS": {
    method: insertTree,
    treeType: "bigOperatorWithInputs",
    dynamicData: ["msubsup", "∐"],
  },
  "U-Union SS": {
    method: insertTree,
    treeType: "bigOperatorWithInputs",
    dynamicData: ["msubsup", "⋃"],
  },
  "V-Union SS": {
    method: insertTree,
    treeType: "bigOperatorWithInputs",
    dynamicData: ["msubsup", "⋁"],
  },
  "U-Intersection SS": {
    method: insertTree,
    treeType: "bigOperatorWithInputs",
    dynamicData: ["msubsup", "⋂"],
  },
  "V-Intersection SS": {
    method: insertTree,
    treeType: "bigOperatorWithInputs",
    dynamicData: ["msubsup", "⋀"],
  },
  "Integral SS": {
    method: insertTree,
    treeType: "bigOperatorWithInputs",
    dynamicData: ["msubsup", "∫"],
  },
  "Double Integral SS": {
    method: insertTree,
    treeType: "bigOperatorWithInputs",
    dynamicData: ["msubsup", "∬"],
  },
  "Triple Integral SS": {
    method: insertTree,
    treeType: "bigOperatorWithInputs",
    dynamicData: ["msubsup", "∭"],
  },
  "Contour Integral SS": {
    method: insertTree,
    treeType: "bigOperatorWithInputs",
    dynamicData: ["msubsup", "∮"],
  },
  "Surface Integral SS": {
    method: insertTree,
    treeType: "bigOperatorWithInputs",
    dynamicData: ["msubsup", "∯", { class: "TEX-S1" }],
  },
  "Volume Integral SS": {
    method: insertTree,
    treeType: "bigOperatorWithInputs",
    dynamicData: ["msubsup", "∰"],
  },
  Differential: {
    ...SYMBOL_TEMPLATE_OBJECT,
    symbol: "d",
  },
  "Select Brackets": {
    method: openPad,
    elementId: "bracket_pad",
    type: "customComponent",
  },
};
