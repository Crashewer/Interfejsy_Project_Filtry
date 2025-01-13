document.addEventListener("DOMContentLoaded", () => {
  let selectedSize = null;
  let selectedColor = null;
  let quantity = 1;

  // Funkcja do pobierania parametru z URL
  function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  // Pobranie ID produktu z URL
  const productID = getQueryParameter("id");

  // Elementy do manipulacji na stronie
  const sizeElements = document.querySelectorAll(".size");
  const quantityMinus = document.querySelector(".quantity button:first-child");
  const quantityPlus = document.querySelector(".quantity button:last-child");
  const quantityDisplay = document.querySelector(".quantity span");
  const addToCartButton = document.querySelector(".add-to-cart");
  const addToWatchlistButton = document.querySelector(".add-to-watchlist");

  // Pobranie produktów z pliku JSON
  function loadProducts() {
    return fetch("../jsons/products.json")
      .then((response) => response.json())
      .catch((error) => {
        console.error("Błąd ładowania produktów:", error);
        return [];
      });
  }

  // Funkcja do wyświetlania produktu na stronie
  function displayProduct(product) {
    // Zmieniamy tytuł strony na nazwę produktu
    document.getElementById("page-title").textContent = product.name;

    // Zmieniamy nazwę produktu
    document.getElementById("product-name").textContent = product.name;

    // Zmieniamy kod produktu
    document.getElementById("product-code").textContent = product.product_code;

    // Zmieniamy cenę produktu
    document.getElementById(
      "product-price"
    ).textContent = `${product.price} zł`;

    // Zmieniamy opis produktu
    document.getElementById("product-description").textContent =
      product.description || "Brak opisu";

    // Zmieniamy zdjęcia produktu
    document.getElementById(
      "main-img"
    ).src = `../img/products/product${product.id}/${product.main_img}`;
    document.getElementById("main-img").alt = product.name;

    document.getElementById(
      "main-thumbnail"
    ).src = `../img/products/product${product.id}/${product.main_img}`;
    document.getElementById("main-thumbnail").classList.add("selected");

    const productImagesContainer = document.querySelector(".product-images");

    let imageIndex = 0;

    // Funkcja do sprawdzania dostępności pliku
    function loadImage(index) {
      const img = document.createElement("img");
      img.src = `../img/products/product${product.id}/${index}.png`;
      img.alt = `zdj_${index}`;

      // Sprawdzamy, czy plik istnieje za pomocą fetch
      fetch(img.src, { method: "HEAD" })
        .then((response) => {
          if (response.ok) {
            // Plik istnieje, dodajemy obraz do kontenera
            productImagesContainer.appendChild(img);
            loadImage(index + 1); // Próbujemy załadować kolejny obraz
          } else {
            console.log(`Wczytano ${index + 1} zdjec.`);
            addClickListenersToThumbnails(); // Koniec ładowania zdjęć
          }
        })
        .catch((error) => {
          console.log(`Błąd podczas sprawdzania pliku ${index}.png:`, error);
          addClickListenersToThumbnails(); // Koniec ładowania zdjęć
        });
    }

    function addClickListenersToThumbnails() {
      document.querySelectorAll(".product-images img").forEach((thumbnail) => {
        thumbnail.addEventListener("click", function () {
          // Zmień główne zdjęcie na to, które zostało kliknięte
          document.getElementById("main-img").src = this.src;

          // Usuń klasę 'selected' ze wszystkich miniaturek
          document.querySelectorAll(".product-images img").forEach((img) => {
            img.classList.remove("selected");
          });

          // Dodaj klasę 'selected' do klikniętej miniaturki
          this.classList.add("selected");
        });
      });
    }

    // Rozpoczynamy ładowanie pierwszego obrazu
    loadImage(imageIndex);

    // Wyświetlamy dostępne kolory
    const colorOptionsContainer = document.getElementById("color-options");
    colorOptionsContainer.innerHTML = ""; // Czyścimy poprzednie kolory
    product.available_colors.forEach((color) => {
      const colorOption = document.createElement("span");
      colorOption.classList.add("color", color);
      colorOption.style.backgroundColor = color;
      colorOptionsContainer.appendChild(colorOption);
    });

    // Aktywujemy tylko dostępne rozmiary
    const sizeOptionsContainer = document.getElementById("size-options");
    const sizeElements = sizeOptionsContainer.querySelectorAll(".size");
    sizeElements.forEach((sizeElement) => {
      const size = sizeElement.textContent.trim();
      if (product.available_sizes.includes(size)) {
        sizeElement.classList.add("available");
        sizeElement.classList.remove("unavailable");
      } else {
        sizeElement.classList.add("unavailable");
        sizeElement.classList.remove("available");
      }
    });

    // Funkcja zaznaczania koloru
    const colorElements = document.querySelectorAll(".color");
    colorElements.forEach((color) => {
      color.addEventListener("click", () => {
        // Usunięcie zaznaczenia z innych kolorów
        colorElements.forEach((c) => c.classList.remove("selected"));
        // Zaznaczenie wybranego koloru
        color.classList.add("selected");
        selectedColor = color.classList[1]; // Aktualizacja zmiennej (klasa koloru)
      });
    });
  }

  // Funkcja zaznaczania rozmiaru
  function handleSizeSelection() {
    sizeElements.forEach((size) => {
      size.addEventListener("click", () => {
        if (size.classList.contains("available")) {
          sizeElements.forEach((s) => s.classList.remove("selected"));
          size.classList.add("selected");
          selectedSize = size.textContent.trim();
        }
      });
    });
  }

  // Funkcja zmniejszania ilości
  function handleQuantityChange() {
    quantityMinus.addEventListener("click", () => {
      if (quantity > 1) {
        quantity--;
        quantityDisplay.textContent = quantity;
      }
    });

    quantityPlus.addEventListener("click", () => {
      quantity++;
      quantityDisplay.textContent = quantity;
    });
  }

  // Funkcja dodawania do koszyka
  function handleAddToCart() {
    addToCartButton.addEventListener("click", () => {
      // Sprawdzamy, czy użytkownik jest zalogowany
      const loggedInUser = getFromLocalStorage("loggedInUser");

      if (!loggedInUser) {
        alert("Musisz być zalogowany, aby dodać produkt do koszyka.");
        return;
      }

      if (!selectedSize || !selectedColor) {
        alert("Proszę wybrać rozmiar i kolor.");
        return;
      }

      const product = {
        id: productID,
        name: document.getElementById("product-name").textContent,
        price: parseFloat(document.getElementById("product-price").textContent),
        size: selectedSize,
        color: selectedColor,
        quantity: quantity,
        image: document.getElementById("main-img").src,
      };

      loggedInUser.cart = loggedInUser.cart || [];

      // Sprawdź, czy produkt o tym samym ID, rozmiarze i kolorze już istnieje w koszyku
      const existingProductIndex = loggedInUser.cart.findIndex(
        (item) =>
          item.id == productID &&
          item.size == selectedSize &&
          item.color == selectedColor
      );

      if (existingProductIndex >= 0) {
        // Jeśli istnieje, zwiększ ilość
        loggedInUser.cart[existingProductIndex].quantity += quantity;
      } else {
        // Jeśli nie, dodaj nowy produkt
        loggedInUser.cart.push(product);
      }

      saveToLocalStorage("loggedInUser", loggedInUser);
      updateCartCount();
      alert("Produkt został dodany do koszyka!");
      updateUsers(loggedInUser);
    });
  }

  function handleAddToWatchlist() {
    addToWatchlistButton.addEventListener("click", () => {
      // Pobranie danych użytkownika z LocalStorage
      const loggedInUser = getFromLocalStorage("loggedInUser");

      if (!loggedInUser) {
        alert(
          "Musisz być zalogowany, aby dodać/usuwać produkt z listy obserwowanych."
        );
        return;
      }

      // Pobieranie szczegółów produktu z DOM
      const productToToggle = {
        id: productID, // ID produktu (kod)
        name: document.getElementById("product-name").textContent, // Nazwa produktu
        product_code: document.getElementById("product-code").textContent, // Kod produktu
        price: parseFloat(
          document
            .getElementById("product-price")
            ?.textContent.replace(" zł", "")
        ), // Cena
      };

      // Sprawdzamy, czy lista obserwowanych już istnieje, jeśli nie, tworzymy pustą
      if (!loggedInUser.watchlist) {
        loggedInUser.watchlist = [];
      }

      // Sprawdzamy, czy produkt jest już na liście obserwowanych
      const isProductInWatchlist = loggedInUser.watchlist.some(
        (item) => item.id === productToToggle.id
      );

      if (isProductInWatchlist) {
        // Jeśli produkt jest już na liście, usuwamy go
        loggedInUser.watchlist = loggedInUser.watchlist.filter(
          (item) => item.id !== productToToggle.id
        );

        // Zapisujemy zaktualizowanego użytkownika w LocalStorage
        saveToLocalStorage("loggedInUser", loggedInUser);

        // Zmiana stanu przycisku - usunięcie klasy "added"
        addToWatchlistButton.classList.remove("added");

        alert("Produkt został usunięty z listy obserwowanych.");
      } else {
        // Jeśli produkt nie jest na liście, dodajemy go
        loggedInUser.watchlist.push(productToToggle);

        // Zapisujemy zaktualizowanego użytkownika w LocalStorage
        saveToLocalStorage("loggedInUser", loggedInUser);

        // Zmiana stanu przycisku - dodanie klasy "added"
        addToWatchlistButton.classList.add("added");

        alert("Produkt został dodany do listy obserwowanych!");
      }
    });
  }

  function initializeWatchlistButton() {
    const loggedInUser = getFromLocalStorage("loggedInUser");
    const addToWatchlistButton = document.querySelector(".add-to-watchlist");

    // Sprawdzamy, czy użytkownik jest zalogowany i czy produkt znajduje się na liście obserwowanych
    if (loggedInUser && loggedInUser.watchlist) {
      const isProductInWatchlist = loggedInUser.watchlist.some(
        (item) => item.id === productID
      );

      if (isProductInWatchlist) {
        // Jeśli produkt jest na liście, dodajemy klasę "added"
        addToWatchlistButton.classList.add("added");
      } else {
        // Jeśli produkt nie jest na liście, usuwamy klasę "added"
        addToWatchlistButton.classList.remove("added");
      }
    }
  }
  // Ładujemy dane o produkcie i wyświetlamy je na stronie
  loadProducts()
    .then((products) => {
      const product = products.find((p) => p.id == productID);
      if (product) {
        displayProduct(product);
        handleSizeSelection();
        handleQuantityChange();
        handleAddToCart();
        handleAddToWatchlist();
        initializeWatchlistButton();
      } else {
        console.error("Produkt o podanym ID nie istnieje!");
      }
    })
    .catch((error) => {
      console.error("Błąd podczas ładowania danych produktu:", error);
    });
});

const thumbnails = document.querySelector(".thumbnails");
thumbnails.classList.add("at-top");
const productImages = document.querySelector(".product-images");

productImages.addEventListener("scroll", function () {
  const scrollTop = productImages.scrollTop;
  const scrollHeight = productImages.scrollHeight;
  const clientHeight = productImages.clientHeight;

  // Jeśli przewijamy na górze (scrollTop === 0), ukrywamy gradient before
  if (scrollTop === 0) {
    console.log("at top");
    thumbnails.classList.add("at-top");
  } else {
    thumbnails.classList.remove("at-top");
  }

  // Jeśli przewijamy na dole (scrollTop + clientHeight === scrollHeight), ukrywamy gradient after
  if (scrollTop + clientHeight === scrollHeight) {
    thumbnails.classList.add("at-bottom");
  } else {
    thumbnails.classList.remove("at-bottom");
  }
});

function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function getFromLocalStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}