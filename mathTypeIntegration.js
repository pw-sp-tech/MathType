function getImageHTML(data) {
  return `<img align="middle" src="${
    data.imgSrc
  }" data-mathml="${data.mathML.replaceAll(
    '"',
    "'"
  )}" role="math" style="max-width: none; vertical-align: -4px;">`;
}
function closeIframe(editorId, eventHandler) {
  if (eventHandler) {
    window.removeEventListener("message", eventHandler);
  }
  var mathTypeWindow = document.getElementById("mathType-" + editorId);
  mathTypeWindow.style.display = "none";
}

function openIFrame(editorId) {
  var mathTypeWindow = document.getElementById("mathType-" + editorId);
  mathTypeWindow.style.display = "block";
  mathTypeWindow.style =
    "bottom: 0px;right: 10px;height: 422px;width: 700px;border: 1px solid lightgrey;background: #fafafa;z-index: 999999;position: fixed;bottom: 3px;right: 3px;box-shadow: rgb(0 0 0 / 16%) 0px 3px 8px 6px;display: block; border-radius: 3%;";
}

var isPluginCommSet = false;

function setIframeCommunication(editor) {
  var iFrame = window.frames["mathType-" + editor.id];
  iFrame.postMessage({ action: "setCommunication", data: "" }, "*");
  function attachEventListener(editor) {
    window.addEventListener("message", function eventHandler(event) {
      switch (event.data.action) {
        case "closeIFrame":
          closeIframe(editor.id, eventHandler);
          break;
        case "openIFrame":
          openIFrame(editor.id);
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
              attachEventListener(editor);
            }
          });
          closeIframe(editor.id, eventHandler);
          break;
      }
    });
  }
  attachEventListener(editor);
}

tinymce.PluginManager.add("MathType", function (editor) {
  closeIframe(editor.id);
  editor.ui.registry.addButton("mathtype", {
    text: "MathType",
    onAction: () => {
      openIFrame(editor.id);
      setIframeCommunication(editor);
    },
  });

  return {
    getMetadata: () => ({
      name: "MathType plugin",
    }),
  };
});
