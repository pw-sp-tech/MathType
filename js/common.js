export const createMatrix = (
  insert,
  updateEquation,
  m,
  n,
  wrapperAttributes,
  isIdentityMatrix
) => {
  let offset;
  const table = document.createElement("mtable");
  for (let i = 0; i < m; i++) {
    const row = document.createElement("mtr");
    for (let j = 0; j < n; j++) {
      const column = document.createElement("mtd");
      const a = document.createElement("mrow");
      if (isIdentityMatrix) {
        const n = document.createElement("mn");
        n.textContent = i === j ? 1 : 0;
        a.appendChild(n);
        offset = 2;
      }
      column.appendChild(a);
      row.appendChild(column);
    }
    table.appendChild(row);
  }
  if (wrapperAttributes) {
    const fence = document.createElement("mfenced");
    for (let [name, value] of Object.entries(wrapperAttributes)) {
      fence.setAttribute(name, value);
    }
    fence.appendChild(table);
    insert(fence, offset || 1);
  } else {
    insert(table, offset || 1);
  }
  updateEquation();
};

export const handleTableCellHover = (rowIndex, columnIndex) => {
  const matrixRows = document
    .getElementById("efmase_pad_table")
    .getElementsByTagName("tr");

  const rowInput1 = document.getElementById("matrix_panel_2");
  const rowInput2 = document.getElementById("matrix_panel_3");

  rowInput1.value = rowIndex + 1;
  rowInput2.value = columnIndex + 1;
  for (let i = 0; i < matrixRows.length; i++) {
    const rowColumns = matrixRows[i].getElementsByTagName("div");
    for (let j = 0; j < rowColumns.length; j++) {
      if (i <= rowIndex && j <= columnIndex) {
        rowColumns[j].style.backgroundColor = "rgb(119, 142, 154)";
      } else {
        rowColumns[j].style.backgroundColor = "rgb(255, 255, 255)";
      }
    }
  }
};
