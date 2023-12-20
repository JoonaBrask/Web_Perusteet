

// Tehtävä 2: Kirjautuminen
$("#loginBtn").click(async function () {
    try {
        const response = await loginUser();
        $("#loginResponse").text(response);
    } catch (error) {
        $("#loginResponse").text("Virhe kirjautumisessa.");
        console.error(error);
    }
});

// Tehtävät 3-5: Käyttäjien haku ja näyttö
async function fetchAndDisplayUsers(page) {
    try {
        const users = await getUsers(page);
        displayUsers(users.data);
        displayPagination(users.total_pages, page);
    } catch (error) {
        console.error("Virhe käyttäjien hakemisessa.");
        console.error(error);
    }
}
// Tehtävä 6: Käyttäjän tietojen päivittäminen
$("#updateUserBtn").click(async function () {
    try {
        const response = await updateUser();
        $("#updateUserResponse").text(response);
    } catch (error) {
        $("#updateUserResponse").text("Virhe käyttäjän päivittämisessä.");
        console.error(error);
    }
});






// Tehtävä 8: Lataa käyttäjät
$("#loadUsersBtn").click(async function () {
    try {
        const response = await getUsers(1);
        displayUsers(response.data);
        displayPagination(response.total_pages, 1);
    } catch (error) {
        console.error("Virhe käyttäjien lataamisessa.");
        console.error(error);
    }
});


// Kutsutaan käyttäjien haku ensimmäisen sivun osalta
fetchAndDisplayUsers(1);

// Helper-funktiot
async function registerUser() {
    const registrationData = {
        email: "eve.holt@reqres.in", // Use a predefined email for successful registration
        password: "pistol"
    };

    try {
        const response = await $.ajax({
            url: "https://reqres.in/api/register",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(registrationData)
        });

        return `Rekisteröinti onnistui. Palvelimen vastaus: ${JSON.stringify(response)}`;
    } catch (error) {
        throw new Error(`Rekisteröintivirhe: ${JSON.stringify(error)}`);
    }
}

// Tehtävä 1: Rekisteröityminen
$("#registerBtn").click(async function () {
    try {
        const response = await registerUser();
        $("#registrationResponse").text(response);
    } catch (error) {
        $("#registrationResponse").text("Virhe rekisteröinnissä.");
        console.error(error);
    }
});

async function loginUser() {
    const loginData = {
        email: "eve.holt@reqres.in", // Use a predefined email for successful login
        password: "pistol"
    };

    try {
        const response = await $.ajax({
            url: "https://reqres.in/api/login",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(loginData)
        });

        return `Kirjautuminen onnistui. Palvelimen vastaus: ${JSON.stringify(response)}`;
    } catch (error) {
        throw new Error(`Kirjautumisvirhe: ${JSON.stringify(error)}`);
    }
}



async function getUsers(page) {
    try {
        const response = await $.ajax({
            url: `https://reqres.in/api/users?page=${page}`,
            type: "GET",
            dataType: "json"
        });

        return {
            data: response.data, // Käyttäjätiedot
            total_pages: response.total_pages // Sivumäärä
        };
    } catch (error) {
        throw new Error(`Virhe käyttäjien hakemisessa: ${JSON.stringify(error)}`);
    }
}


function displayUsers(users) {
    const userListContainer = $("#userList");
    userListContainer.empty(); // Tyhjennetään mahdolliset aiemmat käyttäjätiedot

    if (users.length === 0) {
        userListContainer.append("<p>Ei käyttäjiä saatavilla.</p>");
        return;
    }

    const userTable = $("<table class='table table-striped'></table>");
    userTable.append("<thead><tr><th>ID</th><th>Email</th><th>First Name</th><th>Last Name</th><th>Actions</th></tr></thead>");
    const tbody = $("<tbody></tbody>");

    users.forEach(user => {
        const row = `<tr>
                        <td>${user.id}</td>
                        <td>${user.email}</td>
                        <td>${user.first_name}</td>
                        <td>${user.last_name}</td>
                        <td>
                            <button class='btn btn-primary btn-sm update-btn' data-userid='${user.id}'>Edit</button>
                            <button class='btn btn-danger btn-sm delete-btn' data-userid='${user.id}'>Delete</button>
                        </td>
                    </tr>`;
        tbody.append(row);
    });

    userTable.append(tbody);
    userListContainer.append(userTable);

    // Lisätään tapahtumankäsittelijä poistonapille
    $(".delete-btn").click(function () {
        const userId = $(this).data("userid");
        deleteUser(userId);
    });

    // Lisätään tapahtumankäsittelijä päivitysnapille
    $(".update-btn").click(async function () {
        const userId = $(this).data("userid");

        // Fetch user details directly from the API
        try {
            const userResponse = await $.ajax({
                url: `https://reqres.in/api/users/${userId}`,
                type: "GET",
                dataType: "json"
            });

            const user = userResponse.data; // Assuming user data is in the 'data' property

            // Täytä modaalisen ikkunan kentät käyttäjän tiedoilla
            $("#newFirstName").val(user.first_name);
            $("#newLastName").val(user.last_name);
            $("#newEmail").val(user.email);

            // Avaa modaalinen ikkuna
            $("#updateUserModal").modal("show");

            // Lisää tapahtumankäsittelijä tallennusnapille modaalissa
            $("#updateUserModalBtn").click(async function () {
                // Kutsu tässä käyttäjän päivitysfunktiota
                try {
                    const response = await updateUser(userId);
                    $("#updateUserResponse").text(response);

                    // Sulje modaalinen ikkuna
                    $("#updateUserModal").modal("hide");
                } catch (error) {
                    $("#updateUserResponse").text("Virhe käyttäjän päivittämisessä.");
                    console.error(error);
                }
            });
        } catch (error) {
            console.error("Virhe käyttäjän hakemisessa.");
            console.error(error);
        }
    });

}




function displayPagination(totalPages, currentPage) {
    const paginationContainer = $("#pagination");
    paginationContainer.empty(); // Tyhjennetään mahdolliset aiemmat sivunumerot

    if (totalPages <= 1) {
        // Ei tarvetta näyttää sivunumeroita, jos on vain yksi sivu
        return;
    }

    const paginationList = $("<ul class='pagination'></ul>");

    // Lisätään "Edellinen" -nappi
    //paginationList.append(`<li class='page-item ${currentPage === 1 ? 'disabled' : ''}'><a class='page-link' href='#' data-page='${currentPage - 1}'>Edellinen</a></li>`);

    // Lisätään sivunumerot
    for (let i = 1; i <= totalPages; i++) {
        paginationList.append(`<li class='page-item ${currentPage === i ? 'active' : ''}'><a class='page-link' href='#' data-page='${i}'>${i}</a></li>`);
    }

    // Lisätään "Seuraava" -nappi
    //paginationList.append(`<li class='page-item ${currentPage === totalPages ? 'disabled' : ''}'><a class='page-link' href='#' data-page='${currentPage + 1}'>Seuraava</a></li>`);

    paginationContainer.append(paginationList);

    // Lisätään tapahtumankäsittelijä sivunumeroille
    $(".page-link").click(function (event) {
        event.preventDefault();
        const newPage = parseInt($(this).data("page"));
        // Kutsu funktiota, joka hakee käyttäjät uudelta sivulta
        fetchAndDisplayUsers(newPage);
    });

    // Tehtävä 6: Käyttäjän tietojen päivittäminen
    async function updateUser(userId) {
        // Täytä päivitettävät käyttäjätiedot tässä objektissa
        const updatedUserData = {
            first_name: "UusiEtunimi",
            last_name: "UusiSukunimi",
            email: "uusisahkoposti@example.com"
        };

        try {
            const response = await $.ajax({
                url: `https://reqres.in/api/users/${userId}`,
                type: "PUT",
                contentType: "application/json",
                data: JSON.stringify(updatedUserData)
            });

            console.log("Palvelimen vastaus:", response);
            fetchAndDisplayUsers(1);
            return `Käyttäjän tietojen päivitys onnistui. Palvelimen vastaus: ${JSON.stringify(response)}`;
        } catch (error) {
            console.error("Virhe käyttäjän tietojen päivittämisessä:", error);
            throw new Error(`Virhe käyttäjän tietojen päivittämisessä: ${JSON.stringify(error)}`);
        }
    }

    // Implement the function to get the user ID to delete
    function getUserIdToDelete(clickedButton) {
        // Use data attribute to get the associated user ID from the clicked button
        const userId = $(clickedButton).data("userid");

        // If you are not using data attribute, you can replace the line above with your logic to extract the user ID

        return userId;
    }

    // Tehtävä 7: Käyttäjän poistaminen
    $(".delete-btn").click(async function () {
        try {
            const userIdToDelete = $(this).data("userid");
            const response = await deleteUser(userIdToDelete);
            $("#deleteUserResponse").text(response);
            // Optionally, update the user list here if needed
            fetchAndDisplayUsers(1);
        } catch (error) {
            $("#deleteUserResponse").text("Virhe käyttäjän poistamisessa.");
            console.error(error);
        }
    });


// Tehtävä 7: Käyttäjän poistaminen
    // Helper function to delete a user by ID
    async function deleteUser(userId) {
        try {
            const response = await $.ajax({
                url: `https://reqres.in/api/users/${userId}`,
                type: "DELETE"
            });

            return `Käyttäjän poisto onnistui. Palvelimen vastaus: ${JSON.stringify(response)}`;
        } catch (error) {
            throw new Error(`Virhe käyttäjän poistamisessa: ${JSON.stringify(error)}`);
        }
    }

    
    // Tehtävä 8: Uuden käyttäjän luominen
    async function createUser(firstName, lastName, email) {
        const newUserData = {
            first_name: firstName,
            last_name: lastName,
            email: email
        };

        try {
            const response = await $.ajax({
                url: "https://reqres.in/api/users",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(newUserData)
            });

            console.log("Palvelimen vastaus:", response);
            return response;  // You can return additional data if needed
        } catch (error) {
            console.error("Virhe uuden käyttäjän luomisessa:", error);
            throw new Error(`Virhe uuden käyttäjän luomisessa: ${JSON.stringify(error)}`);
        }
    }


   $("#createUserBtn").click(function () {
    // Open the modal when the button is clicked
    $("#createUserModal").modal("show");
});

// Add an event listener for the "Create" button inside the modal
$("#createUserModalBtn").click(async function () {
    try {
        // Retrieve user details from modal inputs
        const firstName = $("#newFirstName").val();
        const lastName = $("#newLastName").val();
        const email = $("#newEmail").val();

        // Call the createUser function to create a new user
        const response = await createUser(firstName, lastName, email);

        // Optionally, update the user list here if needed
        fetchAndDisplayUsers(1);

        // Close the modal after successful user creation
        $("#createUserModal").modal("hide");

        // Display a success message or handle the response as needed
        console.log(response);
    } catch (error) {
        // Handle errors during user creation
        console.error("Virhe uuden käyttäjän luomisessa:", error);
        // Optionally, display an error message to the user
    }
});


    // Tehtävä 8: Lataa käyttäjät - Button click event
    $("#loadUsersBtn").click(async function () {
        try {
            const response = await getUsers(1);
            displayUsers(response.data);
            displayPagination(response.total_pages, 1);
        } catch (error) {
            console.error("Virhe käyttäjien lataamisessa.");
            console.error(error);
        }
    });

    // Helper function to fetch user details by ID
    async function getUserById(userId) {
        try {
            const response = await $.ajax({
                url: `https://reqres.in/api/users/${userId}`,
                type: "GET",
                dataType: "json"
            });

            return response.data; // Assuming user data is in the 'data' property
        } catch (error) {
            console.error("Virhe käyttäjän hakemisessa.");
            console.error(error);
            throw new Error(`Virhe käyttäjän hakemisessa: ${JSON.stringify(error)}`);
        }
    }


}

