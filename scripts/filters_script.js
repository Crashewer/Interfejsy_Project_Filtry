console.log("filters_script.js loaded");

const filterSections = document.querySelectorAll(".filter-section h3");
const priceMin = document.getElementById("price-min");
const priceMax = document.getElementById("price-max");
const minValueDisplay = document.getElementById("min-value");
const maxValueDisplay = document.getElementById("max-value");

// Funkcja do rozwijania/zwijania sekcji
filterSections.forEach((header) => {
  header.addEventListener("click", () => {
    const section = header.parentElement;
    section.classList.toggle("collapsed");
  });
});

var clearBtn = document.getElementById("clear-filters-btn");
clearBtn.addEventListener("click", function () {
  // Odznacz wszystkie checkboxy
  var checkboxes = document.querySelectorAll(".filter-checkbox");
  checkboxes.forEach(function (checkbox) {
    checkbox.checked = false;
  });

  // Zaznacz opcję "Brak sortowania"
  var sortRadios = document.querySelectorAll(".filter-radio");
  sortRadios.forEach(function (radio) {
    if (radio.nextSibling.textContent.trim() === "Brak sortowania") {
      radio.checked = true;
    } else if (radio.nextSibling.textContent.trim() === "Brak preferencji") {
      radio.checked = true;
      dynamicCategoryContent.innerHTML = "";
    } else {
      radio.checked = false;
    }
  });

  // Ustaw zakresy cen na maksymalnie szerokie
  var priceMin = document.getElementById("price-min");
  var priceMax = document.getElementById("price-max");
  var minValueDisplay = document.getElementById("min-value");
  var maxValueDisplay = document.getElementById("max-value");
  priceMin.value = priceMin.min;
  minValueDisplay.textContent = priceMin.min + " zł";
  priceMax.value = priceMax.max;
  maxValueDisplay.textContent = priceMax.max + " zł";
});

// document.addEventListener("DOMContentLoaded", function () {

// });

// Funkcja do aktualizacji zakresu cen
function updatePriceValues() {
  const minValue = Math.min(priceMin.value, priceMax.value);
  const maxValue = Math.max(priceMin.value, priceMax.value);
  minValueDisplay.textContent = minValue + " zł";
  maxValueDisplay.textContent = maxValue + " zł";
}

priceMin.addEventListener("input", updatePriceValues);
priceMax.addEventListener("input", updatePriceValues);

updatePriceValues();

// Pobieramy elementy
const categoryRadios = document.querySelectorAll('input[name="category"]');
const dynamicCategoryContent = document.getElementById(
  "dynamic-category-content"
);

// Dane do wyświetlania checkboxów dla każdej kategorii
var categoryData = {};

function loadCategoryData() {
  return fetch("../jsons/categoryData.json") // Ścieżka do pliku JSON
    .then((response) => {
      if (!response.ok) {
        throw new Error("Błąd ładowania danych");
      }
      return response.json();
    })
    .then((data) => {
      categoryData = data; // Przypisanie danych do zmiennej globalnej
    })
    .catch((error) => {
      console.error("Błąd:", error);
    });
}

loadCategoryData()
  .then(() => {
    console.log("Dane zostały załadowane!");
    // Możesz teraz wywołać inne funkcje zależne od tych danych
  })
  .catch((error) => {
    console.error("Błąd ładowania danych:", error);
  });
console.log("Przekształcone dane categoryData:", categoryData);

// Funkcja generująca dynamiczne checkboxy
function generateCategoryContent(category) {
  dynamicCategoryContent.innerHTML = ""; // Czyścimy zawartość

  if (categoryData[category]) {
    Object.keys(categoryData[category]).forEach((section) => {
      const sectionTitle = document.createElement("h4");
      sectionTitle.textContent = section;
      dynamicCategoryContent.appendChild(sectionTitle);

      categoryData[category][section].forEach((item) => {
        const label = document.createElement("label");
        label.innerHTML = `<input type="checkbox" class="filter-checkbox" /> ${item}`;
        dynamicCategoryContent.appendChild(label);
      });
    });
  }
}

// Nasłuchiwanie zmian
categoryRadios.forEach((radio) => {
  radio.addEventListener("change", (e) => {
    const selectedCategory = e.target.value;
    if (selectedCategory === "none") {
      dynamicCategoryContent.innerHTML = ""; // Brak preferencji - czyścimy
    } else {
      generateCategoryContent(selectedCategory);
    }
  });
});
