import createMathEditor from "./math_editor.js";
import { handleTableCellHover } from "./common.js";

//Create instance of math type editor
createMathEditor(
  document.getElementById("math-editor"),
  document.getElementById("tab")
);

const closeMatrixPad = () => {
  const matrixPadDiv = document.getElementById("mathtype_matrix_pad");
  matrixPadDiv.style.display = "none";
};

document
  .getElementById("matrix_panel_0")
  .addEventListener("click", closeMatrixPad);

document
  .getElementById("matrix_panel_5")
  .addEventListener("click", closeMatrixPad);

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
