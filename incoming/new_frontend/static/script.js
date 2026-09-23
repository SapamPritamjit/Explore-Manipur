document.addEventListener("DOMContentLoaded", function () {


    // ================================
    // SEARCH BOX
    // ================================

    const searchInput = document.querySelector(".search-box input");
    const searchButton = document.querySelector(".search-box button");

    // Only run search code if the search box exists
    if (searchInput && searchButton) {

        searchButton.addEventListener("click", () => {

            const query = searchInput.value.trim();

            if (!query) {
                searchInput.focus();
                return;
            }

            // Temporary behavior for the hackathon prototype
            alert(`Searching for: ${query}`);

        });

    }


    // ================================
    // HEART BUTTONS
    // ================================

    const hearts = document.querySelectorAll(".heart");

    hearts.forEach(button => {

        button.addEventListener("click", (event) => {

            event.stopPropagation();

            const icon = button.querySelector("i");

            if (!icon) return;

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

    document
        .querySelectorAll(".nav-button, .cta-button")
        .forEach(button => {

            button.addEventListener("click", (event) => {

                const destinations =
                    document.querySelector("#destinations");

                // Only scroll if #destinations exists
                if (destinations) {

                    event.preventDefault();

                    destinations.scrollIntoView({
                        behavior: "smooth"
                    });

                }

            });

        });


    // ================================
    // DISCOVER CATEGORY DROPDOWNS
    // ================================

    const categoryButtons =
        document.querySelectorAll(".category-toggle");


    categoryButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const category =
                this.closest(".discover-category");

            if (!category) return;

            category.classList.toggle("open");

        });

    });


    // ================================
    // INDIVIDUAL READ MORE BUTTONS
    // ================================

    const readMoreButtons =
        document.querySelectorAll(".item-read-more");


    readMoreButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const moreContent =
                this.previousElementSibling;

            if (!moreContent) return;

            const isOpen =
                moreContent.classList.contains("show");


            // -------------------------
            // CLOSE
            // -------------------------

            if (isOpen) {

                moreContent.classList.remove("show");

                this.classList.remove("open");

                this.innerHTML =
                    'Read More <i class="fa-solid fa-arrow-down"></i>';

            }


            // -------------------------
            // OPEN
            // -------------------------

            else {

                moreContent.classList.add("show");

                this.classList.add("open");

                this.innerHTML =
                    'Read Less <i class="fa-solid fa-arrow-up"></i>';

            }

        });

    });

});

/* =========================================================
   FESTIVAL DROPDOWNS
========================================================= */

const festivalButtons = document.querySelectorAll(".festival-toggle");

festivalButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const festival = this.closest(".festival-category");

        if (!festival) return;

        festival.classList.toggle("open");

    });

});


/* =========================================================
   FESTIVAL READ MORE
========================================================= */

const festivalReadMoreButtons =
    document.querySelectorAll(".festival-read-more");

festivalReadMoreButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const moreContent = this.previousElementSibling;

        if (!moreContent) return;

        const isOpen =
            moreContent.classList.contains("show");


        if (isOpen) {

            moreContent.classList.remove("show");

            this.classList.remove("open");

            this.innerHTML =
                'Read More <i class="fa-solid fa-arrow-down"></i>';

        } else {

            moreContent.classList.add("show");

            this.classList.add("open");

            this.innerHTML =
                'Read Less <i class="fa-solid fa-arrow-up"></i>';

        }

    });

});

/* =========================================================
   FOOD DROPDOWNS
========================================================= */

const foodButtons = document.querySelectorAll(".food-toggle");

foodButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const food = this.closest(".food-category");

        if (!food) return;

        food.classList.toggle("open");

    });

});


/* =========================================================
   FOOD READ MORE
========================================================= */

const foodReadMoreButtons =
    document.querySelectorAll(".food-read-more");

foodReadMoreButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const moreContent = this.previousElementSibling;

        if (!moreContent) return;

        const isOpen =
            moreContent.classList.contains("show");


        if (isOpen) {

            moreContent.classList.remove("show");

            this.classList.remove("open");

            this.innerHTML =
                'Read More <i class="fa-solid fa-arrow-down"></i>';

        } else {

            moreContent.classList.add("show");

            this.classList.add("open");

            this.innerHTML =
                'Read Less <i class="fa-solid fa-arrow-up"></i>';

        }

    });

});