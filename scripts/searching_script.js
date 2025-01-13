document.addEventListener("DOMContentLoaded", function () {
  // Funkcja do pobierania parametru z URL
  function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  // Funkcja do pobierania produktów z pliku JSON
  function loadProducts() {
    return fetch("../jsons/products.json")
      .then((response) => response.json())
      .catch((error) => {
        console.error("Błąd ładowania produktów:", error);
        return [];
      });
  }

  // Funkcja do filtrowania produktów na podstawie zapytania
  function filterProducts(products, query) {
    return products.filter((product) =>
      product.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Funkcja do tworzenia kafelków z wyników wyszukiwania
  function displayProducts(products) {
    const tilesContainer = document.getElementById("tiles");
    tilesContainer.innerHTML = ""; // Czyści poprzednie wyniki
  
    // Iteracja po przefiltrowanych produktach
    products.forEach((product) => {
      const productLink = document.createElement("a");
      productLink.href = `./product.html?id=${product.id}`; // Link do strony product.html z id produktu
  
      const productTile = document.createElement("div");
      productTile.className = "product-tile";
  
      const productPopup = document.createElement("div");
      productPopup.className = "product-popup";
      productPopup.innerHTML = "<p>Extra product details go here!</p>"; // Możesz dodać więcej szczegółów
  
      const productContent = document.createElement("div");
      productContent.className = "product-content";
  
      const productImage = document.createElement("img");
      // Używamy nowej ścieżki do obrazka z ID produktu
      productImage.src = `../img/products/product${product.id}/${product.main_img}`;
      productImage.alt = product.name;
      productImage.className = "product-image";
  
      const productInfo = document.createElement("div");
      productInfo.className = "product-info";
  
      const productName = document.createElement("h3");
      productName.className = "product-name";
      productName.textContent = product.name;
  
      const productPrice = document.createElement("p");
      productPrice.className = "product-price";
      productPrice.textContent = `${product.price} zł`;
  
      // Kolor
      const productColor = document.createElement("div");
      productColor.className = "product-color";
      const colorLabel = document.createElement("label");
      colorLabel.textContent = "Kolor:";
      productColor.appendChild(colorLabel);
  
      const colorOptions = document.createElement("div");
      colorOptions.className = "color-options";
      product.available_colors.forEach((color) => {
        const colorOption = document.createElement("span");
        colorOption.className = "color-option";
        colorOption.style.backgroundColor = color;
        colorOptions.appendChild(colorOption);
      });
      productColor.appendChild(colorOptions);
  
      // Dodanie wszystkich elementów do kafelka
      productInfo.appendChild(productName);
      productInfo.appendChild(productPrice);
      productInfo.appendChild(productColor);
  
      productContent.appendChild(productImage);
      productContent.appendChild(productInfo);
  
      productTile.appendChild(productPopup);
      productTile.appendChild(productContent);
  
      productLink.appendChild(productTile);
  
      tilesContainer.appendChild(productLink);
    });
  
    // Po załadowaniu produktów, zaktualizuj klasy dla kafelków
    updateLastInRow();
  }

  // Funkcja do aktualizacji klasy dla ostatniego elementu w rzędzie
  function updateLastInRow() {
    const tiles = document.querySelectorAll("#tiles .product-tile");
    const container = document.getElementById("tiles");

    // Obliczamy liczbę kolumn na podstawie szerokości kontenera
    const columns = Math.floor(container.offsetWidth / 270); // Oblicza liczbę kolumn (przy założeniu, że szerokość kafelka to 250px)

    // Usuwamy klasę 'last-product-in-row' ze wszystkich kafelków
    tiles.forEach((tile) => {
      tile.classList.remove("last-product-in-row");
    });

    // Dodajemy klasę 'last-product-in-row' tylko do ostatniego kafelka w każdym rzędzie
    tiles.forEach((tile, index) => {
      // Indeks ostatniego elementu w danym rzędzie
      if ((index + 1) % columns === 0) {
        tile.classList.add("last-product-in-row");
      }
    });
  }

  // Pobierz zapytanie z URL
  const query = getQueryParameter("q");

  if (query) {
    loadProducts()
      .then((products) => {
        const filteredProducts = filterProducts(products, query);
        displayProducts(filteredProducts);
      })
      .catch((error) => {
        console.error("Błąd podczas ładowania produktów:", error);
      });
  }

  // Wywołanie funkcji przy zmianie rozmiaru okna
  window.addEventListener("resize", updateLastInRow);
});
