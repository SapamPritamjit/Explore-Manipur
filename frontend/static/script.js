// ================================
// SEARCH BOX
// ================================

const searchInput = document.querySelector(".search-box input");
const searchButton = document.querySelector(".search-box button");

searchButton.addEventListener("click", () => {

    const query = searchInput.value.trim();

    if (!query) {
        searchInput.focus();
        return;
    }

    // Temporary behavior for the hackathon prototype.
    // Later, connect this to your Flask search/API.

    alert(`Searching for: ${query}`);
});


// ================================
// HEART BUTTONS
// ================================

const hearts = document.querySelectorAll(".heart");

hearts.forEach(button => {

    button.addEventListener("click", (event) => {

        event.stopPropagation();

        const icon = button.querySelector("i");

        if (icon.classList.contains("fa-regular")) {

            icon.classList.remove("fa-regular");
            icon.classList.add("fa-solid");

        } else {

            icon.classList.remove("fa-solid");
            icon.classList.add("fa-regular");

        }

    });

});


// ================================
// EXPLORE BUTTONS
// ================================

document.querySelectorAll(".nav-button, .cta-button").forEach(button => {

    button.addEventListener("click", () => {

        document
            .querySelector("#destinations")
            .scrollIntoView({
                behavior: "smooth"
            });

    });

});