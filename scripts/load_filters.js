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
  loadHTML("filters-container", "filters.html", function () {
    const script = document.createElement("script");
    script.src = "../scripts/filters_script.js";
    script.defer = true;
    document.body.appendChild(script);
  });
});
