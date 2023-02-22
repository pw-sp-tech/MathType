export let selectedBrackets = {};
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
    .getElementById("qwerty_pad_table")
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

const convertMathMLToImage = (mathml, mml2svgConverter) => {
  const svg = mml2svgConverter(mathml).querySelector("svg");
  const xml = new XMLSerializer().serializeToString(svg);
  const svg64 = btoa(unescape(encodeURIComponent(xml)));
  const b64start = "data:image/svg+xml;base64,";
  const image64 = b64start + svg64;
  return image64;
};

export const getImageHTML = (data, mml2svgConverter) =>
  `<img align="middle" src="${convertMathMLToImage(
    data,
    mml2svgConverter
  )}" data-mathml="${data.replaceAll(
    '"',
    "'"
  )}" role="math" style="max-width: none; vertical-align: -4px;">`;

export const closePad = (padId) => {
  const matrixPadDiv = document.getElementById(padId);
  matrixPadDiv.style.display = "none";
};

export const closeBracketPad = () => {
  closePad("bracket_pad");
  for (const ele of Object.values(selectedBrackets)) {
    ele && ele.classList.remove("bracket_panel_sel");
  }
  selectedBrackets = {};
};
