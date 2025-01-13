function loadHTML(containerId, filePath, callback) {
  fetch(filePath)
    .then((response) => response.text())
    .then((data) => {
      document.getElementById(containerId).innerHTML = data;
      if (callback) callback();
    })
    .catch((error) => console.error("Error loading file:", filePath, error));
}

document.addEventListener("DOMContentLoaded", function () {
  loadHTML("header-container", "header.html", function () {
    const script = document.createElement("script");
    script.src = "../scripts/header_script.js";
    script.defer = true;
    document.body.appendChild(script);
  });
  loadHTML("footer-container", "footer.html");
});

console.log("load_header_and_footer.js loaded");
