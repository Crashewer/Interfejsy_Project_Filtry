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

// Clear all filters
clearFiltersBtn.addEventListener("click", function () {
  // Reset checkboxes
  const checkboxes = document.querySelectorAll(".filter-checkbox");
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });

  // Reset radio buttons
  const radioButtons = document.querySelectorAll(".filter-radio");
  radioButtons.forEach((radio) => {
    if (radio.id === "no-sort" || radio.value === "none") {
      radio.checked = true;
    } else {
      radio.checked = false;
    }
  });

  // Reset price range
  priceMin.value = priceMin.min;
  priceMax.value = priceMax.max;
  minValueDisplay.textContent = `${priceMin.min} zł`;
  maxValueDisplay.textContent = `${priceMax.max} zł`;

  // Clear dynamic category content
  dynamicCategoryContent.innerHTML = "";
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

// Construct the search URL based on selected filters
function constructSearchURL() {
  const params = new URLSearchParams();

  // Add price range to parameters
  params.append("priceMin", priceMin.value);
  params.append("priceMax", priceMax.value);

  // Add selected category to parameters
  const selectedCategory = document.querySelector('input[name="category"]:checked');
  if (selectedCategory && selectedCategory.value !== "none") {
    params.append("category", selectedCategory.value);
  }

  // Add selected sort option to parameters
  const selectedSort = document.querySelector('input[name="sort"]:checked');
  if (selectedSort && selectedSort.id !== "no-sort") {
    params.append("sort", selectedSort.id);
  }

  // Add selected checkboxes to parameters
  const selectedCheckboxes = Array.from(document.querySelectorAll(".filter-checkbox:checked"));
  if (selectedCheckboxes.length > 0) {
    const selectedValues = selectedCheckboxes.map((checkbox) =>
      checkbox.nextSibling.textContent.trim()
    );
    params.append("filters", selectedValues.join(","));
  }

  // Redirect to the search page with constructed parameters
  window.location.href = `searching.html?${params.toString()}`;
}

// Add event listener to the "Apply Filters" button
applyFiltersBtn.addEventListener("click", constructSearchURL);
