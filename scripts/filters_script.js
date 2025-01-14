console.log("filters_script.js loaded");

// Select filter elements
const filterSections = document.querySelectorAll(".filter-section h3");
const priceMin = document.getElementById("price-min");
const priceMax = document.getElementById("price-max");
const minValueDisplay = document.getElementById("min-value");
const maxValueDisplay = document.getElementById("max-value");
const clearFiltersBtn = document.getElementById("clear-filters-btn");
const applyFiltersBtn = document.querySelector(".apply-btn"); // Button for applying filters
const dynamicCategoryContent = document.getElementById("dynamic-category-content");

// Variables to store category data (loaded dynamically)
let categoryData = {};

// Toggle filter sections
filterSections.forEach((header) => {
  header.addEventListener("click", () => {
    const section = header.parentElement;
    section.classList.toggle("collapsed");
  });
});

// Clear all filters and redirect to keep only `q`
clearFiltersBtn.addEventListener("click", function () {
  // Retrieve the current `q` parameter
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q");

  // Redirect to the `searching.html` page with only the `q` parameter
  if (query) {
    window.location.href = `searching.html?q=${query}`;
  } else {
    window.location.href = "searching.html"; // Fallback if `q` is missing
  }
});

// Update price values dynamically
function updatePriceValues() {
  const minValue = Math.min(priceMin.value, priceMax.value);
  const maxValue = Math.max(priceMin.value, priceMax.value);
  minValueDisplay.textContent = `${minValue} zł`;
  maxValueDisplay.textContent = `${maxValue} zł`;
}

priceMin.addEventListener("input", updatePriceValues);
priceMax.addEventListener("input", updatePriceValues);

updatePriceValues(); // Initialize displayed values

// Load category data from JSON file
function loadCategoryData() {
  return fetch("../jsons/categoryData.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load category data");
      }
      return response.json();
    })
    .then((data) => {
      categoryData = data;
    })
    .catch((error) => {
      console.error("Error loading category data:", error);
    });
}

// Dynamically generate category checkboxes
function generateCategoryContent(category) {
  dynamicCategoryContent.innerHTML = ""; // Clear existing content

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

// Load category data and handle category selection
loadCategoryData().then(() => {
  console.log("Category data loaded!");
  const categoryRadios = document.querySelectorAll('input[name="category"]');

  categoryRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      const selectedCategory = e.target.value;
      if (selectedCategory === "none") {
        dynamicCategoryContent.innerHTML = ""; // Clear content for "Brak preferencji"
      } else {
        generateCategoryContent(selectedCategory);
      }
    });
  });
});

// Construct the search URL by appending to the current query
function constructSearchURL() {
  const params = new URLSearchParams(window.location.search);

  // Preserve the `q` parameter
  const query = params.get("q");
  if (!query) {
    console.error("No search query (`q`) found in the URL!");
    return;
  }

  // Add or update price range in the parameters
  params.set("priceMin", priceMin.value);
  params.set("priceMax", priceMax.value);

  // Add or update selected category in the parameters
  const selectedCategory = document.querySelector('input[name="category"]:checked');
  if (selectedCategory && selectedCategory.value !== "none") {
    params.set("category", selectedCategory.value);
  } else {
    params.delete("category"); // Remove category if "none" is selected
  }

  // Add or update selected sort option in the parameters
  const selectedSort = document.querySelector('input[name="sort"]:checked');
  if (selectedSort && selectedSort.id !== "no-sort") {
    params.set("sort", selectedSort.id);
  } else {
    params.delete("sort"); // Remove sort if "Brak sortowania" is selected
  }

  // Add or update selected checkboxes in the parameters
  const selectedCheckboxes = Array.from(document.querySelectorAll(".filter-checkbox:checked"));
  if (selectedCheckboxes.length > 0) {
    const selectedValues = selectedCheckboxes.map((checkbox) => {
      const colorMap = {
        "Czerwony": "red",
        "Niebieski": "blue",
        "Czarny": "black",
        "Biały": "white"
      };
      // Map the Polish color name to the English value
      return colorMap[checkbox.nextSibling.textContent.trim()] || checkbox.nextSibling.textContent.trim();
    });
    params.set("filters", selectedValues.join(","));
  } else {
    params.delete("filters"); // Remove filters if no checkboxes are selected
  }

  // Construct the new URL with preserved `q` and updated filters
  const newURL = `searching.html?${params.toString()}`;

  // Redirect to the new URL
  window.location.href = newURL;
}

// Add event listener to the "Apply Filters" button
applyFiltersBtn.addEventListener("click", constructSearchURL);
