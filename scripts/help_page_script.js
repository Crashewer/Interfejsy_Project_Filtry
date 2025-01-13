// Funkcja do obsługi wysyłania formularza
document
  .getElementById("contact-form")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Zapobiega domyślnej akcji formularza (wysłanie danych)

    // Ukrywanie formularza (opcjonalne)
    document.getElementById("contact-form").style.display = "none";

    // Pokazanie komunikatu o wysłaniu
    document.getElementById("confirmation-message").style.display = "block";
  });

function updateEmailField() {
  const loggedInUser = getFromLocalStorage("loggedInUser");

  // Sprawdzenie, czy użytkownik jest zalogowany
  if (loggedInUser && loggedInUser.email) {
    const emailField = document.getElementById("email");
    if (emailField && emailField.value !== loggedInUser.email) {
      emailField.value = loggedInUser.email;
    }
  }
}

// Funkcja do pobrania danych z localStorage
function getFromLocalStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

// Wywołanie funkcji od razu przy załadowaniu
updateEmailField();

// Ustawienie nasłuchiwania na zmiany logowania co 1 sekundę
setInterval(updateEmailField, 1000);
