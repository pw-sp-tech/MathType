import {
  buttonMethodMap,
  insertSymbol as insertSymbolFunc,
} from "./palette_buttons_actions.js";
import {
  createMatrix,
  closeBracketPad,
  selectedBrackets,
  convertMathMLToImage,
} from "./common.js";

const createMathEditor = (editorContainer, toolBar) => {
  const equationContainer = document.createElement("div");
  equationContainer.tabIndex = 0;
  equationContainer.classList.add("equation-container");

  const preview = document.createElement("div");
  preview.classList.add("equation-editor-preview");
  equationContainer.appendChild(preview);

  const selection = document.createElement("span");
  selection.classList.add("equation-editor-selection");
  equationContainer.appendChild(selection);
  //Caret or text cursor
  const caretCursor = document.createElement("span");
  caretCursor.classList.add("equation-editor-caret");
  equationContainer.appendChild(caretCursor);

  //Adding equation container to editorContainer
  editorContainer.appendChild(equationContainer);

  //MathML VDOM
  const virtualDOM = document.createElement("math");
  virtualDOM.appendChild(document.createElement("mrow"));

  //current caret position
  let caret = 0;

  const selectionRange = [0, 0];

  //stores caret postion relative to equation container
  let caretPositions;
  let uniqueId = 0;

  let genericCursorPosition = null;
  let traceHistory = false;
  const historyData = [];
  let hIndex = -1;

  let elementCursorPostions;

  const setCaretPositions = (root, considerStart, x, y) => {
    const nodeType = root.tagName.toLowerCase();
    const rectangle = document
      .getElementById("i" + root.id)
      .getBoundingClientRect();

    if (nodeType === "mrow") {
      const upper = rectangle.top;
      const height = rectangle.height;
      let left = rectangle.left;
      let right;
      let lastPosition = null;
      const parentStart = caretPositions.length - 1;
      if (considerStart) {
        lastPosition = {};
        if (root.childElementCount == 0) {
          right = rectangle.right;
          lastPosition.x = (left + right) * 0.5 - x;
        } else {
          const firstChildRectangle = document
            .getElementById("i" + root.firstChild.id)
            .getBoundingClientRect();
          right = firstChildRectangle.left + 0.25 * firstChildRectangle.width;
          lastPosition.x = left - x;
        }
        lastPosition.rectangle = [
          left - x,
          right - x,
          upper - y,
          upper + height - y,
        ];
        lastPosition.parent = root;
        lastPosition.self = root;
        lastPosition.index = 0;
        if (!genericCursorPosition) {
          genericCursorPosition = lastPosition.rectangle;
        }
        caretPositions.push(lastPosition);
      }

      for (let j = 0; j < root.childElementCount; j++) {
        let child = root.children[j];
        let childRectangle = document
          .getElementById("i" + child.id)
          .getBoundingClientRect();
        let start = caretPositions.length - 1;
        //setting delete for previous element
        if (lastPosition != null) {
          lastPosition.deleteForward = () => {
            root.removeChild(child);
            return start;
          };
        }
        lastPosition = {};
        left = childRectangle.left + 0.75 * childRectangle.width;
        if (j + 1 < root.childElementCount) {
          let nextChildRectangle = document
            .getElementById("i" + root.children[j + 1].id)
            .getBoundingClientRect();
          right = nextChildRectangle.left + nextChildRectangle.width * 0.25;
          lastPosition.rectangle = [
            left - x,
            right - x,
            upper - y,
            upper + height - y,
          ];
          lastPosition.x =
            (nextChildRectangle.left + childRectangle.right) * 0.5 - x;
        } else {
          right = rectangle.right;
          lastPosition.rectangle = [
            left - x,
            right - x,
            upper - y,
            upper + height - y,
          ];
          lastPosition.x = right - x;
        }
        lastPosition.parent = root;
        lastPosition.self = child;
        lastPosition.index = j + 1;
        lastPosition.deleteBackward = () => {
          root.removeChild(child);
          return start;
        };
        setCaretPositions(child, true, x, y);
        const end = caretPositions.length - 1;

        if (childRectangle.height === 0) {
          lastPosition.rectangle = [
            ...lastPosition.rectangle.slice(0, 2),
            genericCursorPosition[2],
            genericCursorPosition[3],
          ];
        }
        elementCursorPostions.set(child, [start, end]);
        caretPositions.push(lastPosition);
      }
      elementCursorPostions.set(root, [
        parentStart,
        caretPositions.length - 1 >= 0 ? caretPositions.length - 1 : 0,
      ]);
    } else if (nodeType === "mroot") {
      setCaretPositions(root.children[1], true, x, y);
      setCaretPositions(root.children[0], true, x, y);
    } else if (
      nodeType === "mi" ||
      nodeType === "mo" ||
      nodeType === "mn" ||
      nodeType === "mspace"
    ) {
    } else {
      for (let child of root.children) {
        setCaretPositions(child, true, x, y);
      }
    }
  };

  //Creates deepCopy of vDOM with uniqueids and add unique ids to vDOM elements as well
  const deepCopy = (old) => {
    old.id = "math" + uniqueId;
    let result = old.cloneNode(false);
    result.id = "imath" + uniqueId;
    if (old.childElementCount == 0) {
      if (old.tagName.toLowerCase() === "mrow") {
        let placeholder = document.createElement("mo");
        placeholder.classList.add("equation-placeholder");
        placeholder.textContent = "□";
        result.appendChild(placeholder);
      } else {
        result.textContent = old.textContent;
      }
    }
    ++uniqueId;
    for (let i = 0; i < old.childElementCount; i++) {
      result.appendChild(deepCopy(old.children[i]));
    }
    return result;
  };

  const displayEquation = () => {
    if (caret > caretPositions.length - 1) caret = caretPositions.length - 1;
    let caretPosition = caretPositions[caret];
    caretCursor.style.left = caretPosition.x + "px";
    caretCursor.style.top = caretPosition.rectangle[2] + "px";
    caretCursor.style.height =
      caretPosition.rectangle[3] - caretPosition.rectangle[2] + "px";
    equationContainer.focus();
  };

  const updateEquation = () => {
    uniqueId = 0;
    caretPositions = [];
    preview.textContent = "";
    elementCursorPostions = new Map();
    const math = document.createElement("math");
    math.setAttribute("xmlns", "http://www.w3.org/1998/Math/MathML");
    math.appendChild(deepCopy(virtualDOM.firstElementChild));
    preview.appendChild(math);
    if (window.MathJax.typeset) {
      window.MathJax.typeset([preview]);
    }
    //update text elements styling
    for (const ele of document.getElementsByTagName("mjx-utext")) {
      if (["normal", "-smallop"].includes(ele.getAttribute("variant"))) {
        ele.setAttribute("style", "font-family:cmr7;");
        ele.removeAttribute("variant");
      }
    }

    const rect = equationContainer.getBoundingClientRect();
    setCaretPositions(virtualDOM.firstElementChild, true, rect.x, rect.y);
    if (!traceHistory) {
      const historyRecord = {
        caret: caret,
        mathml: virtualDOM.innerHTML,
      };
      ++hIndex;
      historyData.splice(hIndex);
      historyData.push(historyRecord);
    }
    displayEquation();
  };

  editorContainer.onclick = () => {
    editorContainer.focus();
    unSelectRange();
  };

  const insert = (element, offset) => {
    let position = caretPositions[caret];
    if (position.index < position.parent.childElementCount) {
      position.parent.insertBefore(
        element,
        position.parent.children[position.index]
      );
    } else {
      position.parent.appendChild(element);
    }
    caret += offset;
  };

  const insertSymbol = (name) => {
    let type;
    if (/\d/.test(name)) {
      type = "mn";
    } else if (name.toUpperCase() != name || name.toLowerCase() != name) {
      type = "mi";
    } else {
      type = "mo";
    }
    let symbol = document.createElement(type);
    symbol.textContent = name;
    insert(symbol, 1);
    updateEquation();
  };

  const hasElementMathId = (ele) =>
    ele?.id && ele?.id.includes("imath") ? true : false;

  const getElementWithMathId = (ele) => {
    return hasElementMathId(ele)
      ? ele.id.slice(1)
      : getElementWithMathId(ele.parentElement);
  };

  preview.onmousedown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    unSelectRange();
    const elementId = getElementWithMathId(e.target);
    const [initialEleSPoint, initialEleEPoint] = elementCursorPostions.get(
      virtualDOM.querySelector(`#${elementId}`)
    );

    preview.onmousemove = (e) => {
      e.preventDefault();
      const elementId = getElementWithMathId(e.target);
      const [start, end] = elementCursorPostions.get(
        virtualDOM.querySelector(`#${elementId}`)
      );
      if (start < initialEleSPoint && end > initialEleEPoint) {
        selectRange(start, end);
      } else if (start < initialEleSPoint && end < initialEleEPoint) {
        selectRange(start, initialEleEPoint);
      } else if (start > initialEleSPoint && end > initialEleEPoint) {
        selectRange(initialEleSPoint, end);
      } else {
        selectRange(initialEleSPoint, initialEleEPoint);
      }
    };
  };

  preview.onmouseup = (e) => {
    e.stopPropagation();
    preview.onmousemove = null;
    caret = selectionRange[1];
  };
  //update the postion of caret postion based on click position

  preview.onclick = (e) => {
    e.stopPropagation();
    const containerRect = equationContainer.getBoundingClientRect();
    const element = e.target.getBoundingClientRect();
    const elementLeft = element.left - containerRect.left + element.width / 2;
    const elementTop = element.top - containerRect.top;
    let topDiff = Number.MAX_VALUE;
    for (let i = 0; i < caretPositions.length - 1; i++) {
      const currentCaretTopDiff = Math.abs(
        elementTop - caretPositions[i].rectangle[3]
      );
      if (
        caretPositions[i].x <= elementLeft &&
        caretPositions[i + 1].x >= elementLeft &&
        currentCaretTopDiff < topDiff
      ) {
        topDiff = currentCaretTopDiff;
        if (
          Math.abs(caretPositions[i].x - elementLeft) <
          Math.abs(caretPositions[i + 1].x - elementLeft)
        ) {
          caret = i;
        } else {
          caret = i + 1;
        }
      }
    }
    updateEquation();
  };

  const undo = () => {
    traceHistory = true;
    if (hIndex > 0) {
      --hIndex;
      const historyRecord = historyData[hIndex];
      caret = historyRecord.caret;
      virtualDOM.innerHTML = historyRecord.mathml;
      updateEquation();
    }
    traceHistory = false;
  };
  const redo = () => {
    traceHistory = true;
    if (hIndex + 1 < historyData.length) {
      ++hIndex;
      const historyRecord = historyData[hIndex];
      caret = historyRecord.caret;
      virtualDOM.innerHTML = historyRecord.mathml;
      updateEquation();
    }
    traceHistory = false;
  };

  const setSelectionRange = (rStart, rEnd) => {
    selectionRange[0] = rStart || 0;
    selectionRange[1] = rEnd || caretPositions.length - 1;
  };
  const unSelectRange = () => {
    selection.style = "";
    selectionRange[0] = selectionRange[1] = 0;
  };

  const selectRange = (start, end) => {
    setSelectionRange(start, end);
    const startPosition = caretPositions[selectionRange[0]].rectangle;
    const endPosition = caretPositions[selectionRange[1]].rectangle;
    selection.style.left = `${caretPositions[selectionRange[0]].x}px`;
    selection.style.width = `${endPosition[1] - startPosition[0] + 2}px`;
    selection.style.top = startPosition[2] + "px";
    selection.style.height = startPosition[3] - startPosition[2] + 1 + "px";
    selection.style.backgroundColor = `rgb(176 207 250)`;
    selection.style.border = `1px solid black`;
  };

  editorContainer.onkeydown = (e) => {
    e.preventDefault();
    let ele = null;

    switch (e.key) {
      case "ArrowLeft":
        if (caret > 0) {
          --caret;
        }
        unSelectRange();
        displayEquation();
        break;
      case "ArrowRight":
        if (caret + 1 < caretPositions.length) {
          ++caret;
        }
        unSelectRange();
        displayEquation();
        break;
      case "Delete":
        if (caretPositions[caret].deleteForward) {
          caret = caretPositions[caret].deleteForward();
        }
        unSelectRange();
        updateEquation();
        break;
      case "Backspace":
        const [start, end] = elementCursorPostions.get(
          caretPositions[caret].self
        );
        if (
          end - start > 0 &&
          selectionRange[0] === 0 &&
          selectionRange[1] === 0 &&
          caretPositions[caret].self.tagName.toLowerCase() !== "mrow"
        ) {
          selectRange(start, end + 1);
        } else if (selectionRange[0] > 0 || selectionRange[1] > 0) {
          for (let i = selectionRange[1] + 1; i > selectionRange[0]; i--) {
            if (caretPositions[i]?.deleteBackward) {
              caret = caretPositions[i].deleteBackward();
            }
          }
          unSelectRange();
        } else {
          if (caretPositions[caret].deleteBackward) {
            caret = caretPositions[caret].deleteBackward();
          }
          unSelectRange();
        }
        updateEquation();
        break;
      case " ":
        insertSymbolFunc(insert, updateEquation, {
          attributes: { width: "0.4em" },
          tagName: "mspace",
        });
        break;
      default:
        if (e.ctrlKey || e.metaKey) {
          switch (e.key) {
            case "z":
              undo();
              break;
            case "y":
              redo();
              break;
            case "a":
              selectRange();
              break;
          }
        } else {
          switch (e.key) {
            default:
              if (!e.isComposing) {
                if (e.key.length === 1 && e.key !== " ") {
                  insertSymbol(e.key);
                }
              }
          }
        }
    }
  };

  updateEquation();

  //Toolbar visibility handling
  const toolBarMap = {
    Basic: "PALETTE_TAB_BASIC_BODY",
    Operators: "PALETTE_TAB_OPERATORS_BODY",
    Relation: "PALETTE_TAB_RELATION_BODY",
    Arrows: "PALETTE_TAB_ARROWS_BODY",
    Greek: "PALETTE_TAB_GREEK_BODY",
    Matrix: "PALETTE_TAB_MATRIX_BODY",
    Scripts: "PALETTE_TAB_SCRIPTS_BODY",
    "Big Operators": "PALETTE_TAB_BIG_OPERATORS_BODY",
    Functions: "PALETTE_TAB_FUNCTIONS_BODY",
    "Hyperbolic trigonometry Functions":
      "PALETTE_TAB_HYPERBOLIC_TRIGONOMETRY FUNCTIONS_BODY",
  };

  let prevPaletteButton = document.querySelector(`button[title='Basic']`);
  let prevPalette = document.getElementById(toolBarMap["Basic"]);
  prevPalette.style.display = "block";
  prevPaletteButton.classList.add("palettebutton_focus");

  toolBar.addEventListener("mouseover", (e) => {
    if (Object.keys(toolBarMap).includes(e.target.title)) {
      if (prevPalette) {
        prevPaletteButton.classList.remove("palettebutton_focus");
        prevPalette.style.display = "none";
      }
      prevPalette = document.getElementById(toolBarMap[e.target.title]);
      prevPaletteButton = document.querySelector(
        `button[title='${e.target.title}']`
      );
      prevPalette.style.display = "block";
      prevPaletteButton.classList.add("palettebutton_focus");
    }
  });

  //Palette Buttons mapping with event listeners
  for (const [key, value] of Object.entries(buttonMethodMap)) {
    const elements = document.querySelectorAll(`button[title='${key}']`);
    for (const element of elements) {
      if (value?.type === "customComponent") {
        element.addEventListener("click", () => value.method(element, value));
      } else if (value?.type === "matrix") {
        element.addEventListener("click", () =>
          createMatrix(
            insert,
            updateEquation,
            value?.m,
            value?.n,
            value?.attributes
          )
        );
      } else {
        element.addEventListener("click", () =>
          value?.method(insert, updateEquation, value)
        );
      }
    }
  }

  //handle matrix creation
  const createMatrixWithTabInputs = () => {
    let m = document.getElementById("matrix_panel_2").value;
    let n = document.getElementById("matrix_panel_3").value;
    const matrixPadDiv = document.getElementById("mathtype_matrix_pad");
    const wrapperAttributes = matrixPadDiv.getAttribute("attributes");
    const isIdentityMatrix = matrixPadDiv.getAttribute("isIdentityMatrix");
    if (isIdentityMatrix) m = n = Math.max(m, n);
    matrixPadDiv.style.display = "none";
    createMatrix(
      insert,
      updateEquation,
      m,
      n,
      wrapperAttributes && JSON.parse(wrapperAttributes),
      isIdentityMatrix === "true"
    );
    matrixPadDiv.removeAttribute("attributes");
    matrixPadDiv.removeAttribute("isIdentityMatrix");
  };

  document.getElementById("qwerty_pad_table").addEventListener("click", (e) => {
    if (e.target.tagName.toLowerCase() === "div") createMatrixWithTabInputs();
  });

  document
    .getElementById("matrix_panel_4")
    .addEventListener("click", createMatrixWithTabInputs);

  //handle

  const insertMathML = (mathml) => {
    caret = 0;
    virtualDOM.innerHTML = mathml;
    updateEquation();
    caret = caretPositions.length - 1;
    displayEquation();
  };

  document.getElementById("math-editor").addEventListener("click", (e) => {
    if (e.target.firstElementChild) {
      e.target.firstElementChild.focus();
      caret = caretPositions.length - 1;
      displayEquation();
    }
  });

  //For cross-origin/cross-window communication(iframe)
  let initialLoad = true;
  window.addEventListener("message", (event) => {
    if (initialLoad) {
      initialLoad = false;
      document
        .getElementById("close_mathType_window")
        .addEventListener("click", () => {
          insertMathML("<mrow></mrow>");
          event.source.postMessage({ action: "closeIFrame", data: "" }, "*");
        });

      document.getElementById("insert_mathml").addEventListener("click", () => {
        const wrapper = document.createElement("div");
        wrapper.appendChild(virtualDOM);
        const mml = wrapper.innerHTML
          .replace(/ id=[^>]*/g, "")
          .replace(/amp;*/g, "");
        event.source.postMessage(
          {
            action: "insertImage",
            data: { imgSrc: convertMathMLToImage(mml), mathML: mml },
          },
          "*"
        );
        insertMathML("<mrow></mrow>");
        event.source.postMessage({ action: "closeIFrame", data: "" }, "*");
      });
    }

    switch (event.data.action) {
      case "insertMathML":
        event.source.postMessage({ action: "openIFrame", data: "" }, "*");
        caret = 0;
        virtualDOM.innerHTML = event.data.data.replaceAll("§", "&");
        updateEquation();
        caret = caretPositions.length - 1;
        displayEquation();
        break;
    }
  });

  //insert brackets
  document.getElementById("bracket_panel_2").addEventListener("click", () => {
    insertSymbolFunc(insert, updateEquation, {
      attributes: {
        open: selectedBrackets?.left?.innerText || "",
        close: selectedBrackets?.right?.innerText || "",
      },
      tagName: "mfenced",
      inputs: 1,
    });
    closeBracketPad();
  });
};

export default createMathEditor;
