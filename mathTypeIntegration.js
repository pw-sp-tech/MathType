const mathJAXComponent = document.createElement("script");
mathJAXComponent.setAttribute(
  "src",
  "https://cdn.jsdelivr.net/npm/mathjax@3/es5/mml-svg.js"
);

document.getElementsByTagName("head")[0].appendChild(mathJAXComponent);

const convertMathMLToImage = (mathml, mml2svgConverter) => {
  const svg = mml2svgConverter(mathml).querySelector("svg");
  const xml = new XMLSerializer().serializeToString(svg);
  const svg64 = btoa(unescape(encodeURIComponent(xml)));
  const b64start = "data:image/svg+xml;base64,";
  const image64 = b64start + svg64;
  return image64;
};

const getImageHTML = (data, mml2svgConverter) =>
  `<img align="middle" src="${convertMathMLToImage(
    data,
    mml2svgConverter
  )}" data-mathml="${data.replaceAll(
    '"',
    "'"
  )}" role="math" style="max-width: none; vertical-align: -4px;">`;

const closeIframe = () => {
  const mathTypeWindow = document.getElementById("myIframe");
  mathTypeWindow.style.display = "none";
};

const openIFrame = () => {
  const mathTypeWindow = document.getElementById("myIframe");
  mathTypeWindow.style.display = "block";
  mathTypeWindow.style =
    "bottom: 0px;right: 10px;height: 422px;width: 700px;border: 1px solid lightgrey;background: #fafafa;z-index: 999999;position: fixed;bottom: 3px;right: 3px;box-shadow: rgb(0 0 0 / 16%) 0px 3px 8px 6px;display: block; border-radius: 3%;";
};

let isPluginCommSet = false;
const setIframeCommunication = (editor) => {
  const iFrame = window.frames.mathType;
  iFrame.postMessage({ action: "setCommunication", data: "" }, "*");
  if (!isPluginCommSet) {
    isPluginCommSet = true;
    window.addEventListener("message", (event) => {
      console.log("event.data.action", event.data);
      switch (event.data.action) {
        case "closeIFrame":
          closeIframe();
          break;
        case "openIFrame":
          openIFrame();
          break;
        case "insertImage":
          console.log(
            "getImageHTML",
            getImageHTML(event.data.data, window.MathJax.mathml2svg)
          );
          editor.insertContent(
            getImageHTML(event.data.data, window.MathJax.mathml2svg)
          );
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
};

tinymce.PluginManager.add("MathType", (editor) => {
  editor.ui.registry.addButton("mathEditor", {
    text: "Insert Math",
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
