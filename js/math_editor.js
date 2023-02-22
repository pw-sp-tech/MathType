import {
  buttonMethodMap,
  insertSymbol as insertSymbolFunc,
} from "./palette_buttons_actions.js";
import {
  createMatrix,
  getImageHTML,
  closeBracketPad,
  selectedBrackets,
} from "./common.js";

const createMathEditor = (editorContainer, toolBar) => {
  const equationContainer = document.createElement("div");
  equationContainer.tabIndex = 0;
  equationContainer.classList.add("equation-container");

  const preview = document.createElement("div");
  preview.classList.add("equation-editor-preview");
  equationContainer.appendChild(preview);

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

  //stores caret postion relative to equation container
  let caretPositions;
  let uniqueId = 0;

  const setCaretPositions = (root, x, y) => {
    const nodeType = root.tagName.toLowerCase();
    const rectangle = document
      .getElementById("i" + root.id)
      .getBoundingClientRect();

    if (nodeType === "mrow") {
      const upper = rectangle.top;
      const height = rectangle.height;
      let left = rectangle.left;
      let right;
      let lastPosition = {};

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
      lastPosition.index = 0;
      caretPositions.push(lastPosition);

      for (let j = 0; j < root.childElementCount; j++) {
        let child = root.children[j];
        let childRectangle = document
          .getElementById("i" + child.id)
          .getBoundingClientRect();
        let start = caretPositions.length - 1;
        lastPosition.deleteForward = () => {
          root.removeChild(child);
          return start;
        };
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
        lastPosition.index = j + 1;
        lastPosition.deleteBackward = () => {
          root.removeChild(child);
          return start;
        };
        setCaretPositions(child, x, y);
        caretPositions.push(lastPosition);
      }
    } else if (nodeType === "mroot") {
      setCaretPositions(root.children[1], x, y);
      setCaretPositions(root.children[0], x, y);
    } else if (nodeType === "mi" || nodeType === "mo" || nodeType === "mn") {
    } else {
      for (let child of root.children) {
        setCaretPositions(child, x, y);
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
    let caretPosition = caretPositions[caret];
    caretCursor.style.left = caretPosition.x + "px";
    caretCursor.style.top = caretPosition.rectangle[2] + "px";
    caretCursor.style.height =
      caretPosition.rectangle[3] - caretPosition.rectangle[2] + "px";
    equationContainer.focus();
  };

  const updateEquation = () => {
    caretPositions = [];
    preview.textContent = "";
    const math = document.createElement("math");
    math.setAttribute("xmlns", "http://www.w3.org/1998/Math/MathML");
    math.appendChild(deepCopy(virtualDOM.firstElementChild));
    preview.appendChild(math);
    window.MathJax.typeset([preview]);
    //update text elements styling
    for (const ele of document.getElementsByTagName("mjx-utext")) {
      if (["normal", "-smallop"].includes(ele.getAttribute("variant"))) {
        ele.setAttribute("style", "font-family:cmr7;");
        ele.removeAttribute("variant");
      }
    }

    const rect = equationContainer.getBoundingClientRect();
    setCaretPositions(virtualDOM.firstElementChild, rect.x, rect.y);
    displayEquation();
  };

  editorContainer.onclick = () => {
    editorContainer.focus();
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

  //update the postion of caret postion based on click position
  preview.onclick = (e) => {
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

  editorContainer.onkeydown = (e) => {
    switch (e.key) {
      case "ArrowLeft":
        if (caret > 0) {
          --caret;
        }
        displayEquation();
        break;
      case "ArrowRight":
        if (caret + 1 < caretPositions.length) {
          ++caret;
        }
        displayEquation();
        break;
      case "Backspace":
        if (caretPositions[caret].deleteBackward) {
          caret = caretPositions[caret].deleteBackward();
        }
        updateEquation();
        break;
      case "Delete":
        if (caretPositions[caret].deleteForward) {
          caret = caretPositions[caret].deleteForward();
        }
        updateEquation();
        break;
      case "Enter":
        const ele = document.createElement("mspace");
        ele.setAttribute("linebreak", "newline");
        insert(ele, 1);
        updateEquation();
        break;
      default:
    }
    if (e.key.length === 1) {
      insertSymbol(e.key);
    }
    e.preventDefault();
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
    const mathTypeWindow = event.source.document.getElementById("myIframe");
    mathTypeWindow.style =
      "bottom: 0px;right: 10px;height: 422px;width: 700px;border: 1px solid lightgrey;background: #fafafa;z-index: 999999;position: fixed;bottom: 3px;right: 3px;box-shadow: rgb(0 0 0 / 16%) 0px 3px 8px 6px;display: block; border-radius: 3%;";
    if (initialLoad) {
      initialLoad = false;
      document
        .getElementById("close_mathType_window")
        .addEventListener("click", () => {
          insertMathML("<mrow></mrow>");
          mathTypeWindow.style.display = "none";
        });

      document.getElementById("insert_mathml").addEventListener("click", () => {
        const wrapper = document.createElement("div");
        wrapper.appendChild(virtualDOM);
        event.source.postMessage(
          getImageHTML(
            wrapper.innerHTML.replace(/ id=[^>]*/g, "").replace(/amp;*/g, ""),
            event.source.MathJax.mathml2svg
          )
        );
        insertMathML("<mrow></mrow>");
        mathTypeWindow.style.display = "none";
      });
    }
    if (event.data.includes("<math>")) {
      mathTypeWindow.style.display = "block";
      caret = 0;
      virtualDOM.innerHTML = event.data;
      updateEquation();
      caret = caretPositions.length - 1;
      displayEquation();
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
