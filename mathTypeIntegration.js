function getImageHTML(data) {
  return `<img align="middle" src="${
    data.imgSrc
  }" data-mathml="${data.mathML.replaceAll(
    '"',
    "'"
  )}" role="math" style="max-width: none; vertical-align: -4px;">`;
}
function closeIframe() {
  const mathTypeWindow = document.getElementById("mathType");
  mathTypeWindow.style.display = "none";
}

function openIFrame() {
  const mathTypeWindow = document.getElementById("mathType");
  mathTypeWindow.style.display = "block";
  mathTypeWindow.style =
    "bottom: 0px;right: 10px;height: 422px;width: 700px;border: 1px solid lightgrey;background: #fafafa;z-index: 999999;position: fixed;bottom: 3px;right: 3px;box-shadow: rgb(0 0 0 / 16%) 0px 3px 8px 6px;display: block; border-radius: 3%;";
}

let isPluginCommSet = false;
closeIframe();

function setIframeCommunication(editor) {
  const iFrame = window.frames.mathType;
  iFrame.postMessage({ action: "setCommunication", data: "" }, "*");
  if (!isPluginCommSet) {
    isPluginCommSet = true;
    window.addEventListener("message", (event) => {
      switch (event.data.action) {
        case "closeIFrame":
          closeIframe();
          break;
        case "openIFrame":
          openIFrame();
          break;
        case "insertImage":
          editor.insertContent(getImageHTML(event.data.data));
          editor.contentWindow.document.addEventListener("click", (e) => {
            if (e.target.tagName.toLowerCase() === "img") {
              iFrame.postMessage(
                {
                  action: "insertMathML",
                  data: `${e.target.getAttribute("data-mathml")}`,
                },
                "*"
              );
            }
          });
          closeIframe();
          break;
      }
    });
  }
}

tinymce.PluginManager.add("MathType", function (editor) {
  editor.ui.registry.addButton("mathtype", {
    text: "MathType",
    onAction: () => {
      openIFrame();
      setIframeCommunication(editor);
    },
  });

  return {
    getMetadata: () => ({
      name: "MathType plugin",
    }),
  };
});
