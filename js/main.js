import createMathEditor from "./math_editor.js";
import {
  handleTableCellHover,
  closePad,
  closeBracketPad,
  selectedBrackets,
} from "./common.js";

//Create instance of math type editor
createMathEditor(
  document.getElementById("math-editor"),
  document.getElementById("tab")
);

document
  .getElementById("matrix_panel_0")
  .addEventListener("click", () => closePad("mathtype_matrix_pad"));

document
  .getElementById("matrix_panel_5")
  .addEventListener("click", () => closePad("mathtype_matrix_pad"));

document.getElementById("bracket_panel_0").addEventListener("click", () => {
  closeBracketPad();
});

document.getElementById("bracket_panel_3").addEventListener("click", () => {
  closeBracketPad();
});

document
  .getElementById("qwerty_pad_table")
  .addEventListener("mouseover", (e) => {
    if (e.target.tagName.toLowerCase() === "div") {
      let columnIndex = e.target.parentNode.cellIndex;
      let rowIndex = e.target.parentNode.parentNode.rowIndex;
      if (
        document
          .getElementById("mathtype_matrix_pad")
          .getAttribute("isIdentityMatrix") === "true"
      )
        rowIndex = columnIndex = Math.max(columnIndex, rowIndex);
      handleTableCellHover(rowIndex, columnIndex);
    }
  });

document.getElementById("bracket_pad_table").addEventListener("click", (e) => {
  let columnIndex = e.target.parentNode.cellIndex;
  if (e.target.classList.contains("bracket_panel_sel")) {
    columnIndex === 0
      ? (selectedBrackets.left = null)
      : (selectedBrackets.right = null);
    e.target.classList.remove("bracket_panel_sel");
  } else {
    if (e.target.tagName.toLowerCase() === "div") {
      if (columnIndex === 0) {
        selectedBrackets?.left &&
          selectedBrackets.left.classList.remove("bracket_panel_sel");
        selectedBrackets.left = e.target;
      } else {
        selectedBrackets?.right &&
          selectedBrackets.right.classList.remove("bracket_panel_sel");
        selectedBrackets.right = e.target;
      }

      e.target.classList.add("bracket_panel_sel");
    }
  }
});
