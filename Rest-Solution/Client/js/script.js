$(function () {

    var borrowBook = { bookID: "", readerID: "", lendDate: "" };
    var infoAlert = document.getElementById("info-happening");
    infoAlert.innerHTML = "";

    SetAddBookButton();
    GetAllBooks(borrowBook);

    SetAddReaderButton();
    GetAllReaders(borrowBook);

    GetAllLend();

});

function GetAllLend() {
    $.ajax({
        url: "http://localhost:63541/api/lend",
        type: "Get"
    }).done(function (result) {
        AddLendRows(result);
        console.log(result[0]);
    }).fail(function (error) {
        console.log("Ajax lista czytelników problem! " + error);
    });

}

function AddLendRows(result) {
    var tableBooks = document.getElementById("lend-table");
    tableBooks = tableBooks.querySelector("tbody");
    tableBooks.innerHTML = "";

    for (let i = 0; i < result.length; i++) {

        var row = document.createElement("tr");

        var title = document.createElement("td");
        title.innerText = result[i].Title;
        row.appendChild(title);

        var name = document.createElement("td");
        name.innerText = result[i].Name;
        row.appendChild(name);

        var dateData = new Date(result[i].LendDate);


        var day = dateData.getDay();
        if (day < 10) day = "0" + day;
        var month = dateData.getMonth();
        if (month < 10) month = "0" + month;
        var year = dateData.getFullYear();

        var date = document.createElement("td");
        date.innerText = day + "-" + month + "-" + year;
        row.appendChild(date);

        var actions = document.createElement("td");
        var actionDiv = document.createElement("div");
        actionDiv.classList.add("button-group");

        var lendButton = SetLendReaderButton(result[i].ID);
        actionDiv.appendChild(lendButton);

        actions.appendChild(actionDiv);
        row.appendChild(actions);

        tableBooks.appendChild(row);
    }
}



//------------------------------------------------

function SetLendReaderButton(id) {
    var button = document.createElement("button");
    button.classList.add("btn");
    button.classList.add("btn-warning");
    button.classList.add("btn-sm");
    button.innerText = "Oddano";

    button.addEventListener("click", function () {

        $.ajax({
            url: `http://localhost:63541/api/lend/${id}`,
            type: "Delete"
        }).done(function () {
            AddAlert("Oddano książkę", "success")
            GetAllLend();
        }).fail(function (error) {
            AddAlert("Nie udało się oddać książki", "danger")
        });

    });


    return button;

}

function SetAddReaderButton() {

    var readerBookButton = document.getElementById("reader-add-button");
    if (readerBookButton === undefined || readerBookButton == null) {
        var form = document.getElementById("formActionReaders");
        var editButton = form.querySelector("a");
        form.removeChild(editButton);

        var buttonAdd = document.createElement("a");
        buttonAdd.classList.add("btn");
        buttonAdd.classList.add("btn-success");
        buttonAdd.classList.add("btn-sm");
        buttonAdd.setAttribute("id", "reader-add-button");
        buttonAdd.setAttribute("href", "#");
        buttonAdd.innerText = "Dodaj";
        form.appendChild(buttonAdd);
        readerBookButton = buttonAdd;
    }

    readerBookButton.addEventListener("click", function () {

        var nameInput = document.getElementById("reader-name");
        var ageInput = document.getElementById("reader-age");

        var newReader = {
            name: nameInput.value,
            age: ageInput.value
        };

        if (newReader.name !== "" && newReader.name != null && newReader.age !== 0 && newReader.age != null) {

            $.ajax({
                url: "http://localhost:63541/api/readers",
                data: newReader,
                type: "POST"
            }).done(function (result) {
                AddAlert("Dodano czytelnika pomyślnie", "success");
                nameInput.value = "";
                ageInput.value = "";
                GetAllReaders();
            }).fail(function (error) {
                AddAlert("Błąd, Nie dodano czytelnika", "danger");
            });
        }
        else {
            AddAlert("Źle wpisano dane", "warning");
        }

    });
}

function GetAllReaders(borrowBook) {
    $.ajax({
        url: "http://localhost:63541/api/readers",
        type: "Get"
    }).done(function (result) {
        AddReaderRows(result, borrowBook);
    }).fail(function (error) {
        console.log("Ajax lista czytelników problem! " + error);
    });

}

function AddReaderRows(result, borrowBook) {

    var tableBooks = document.getElementById("readers-table");
    tableBooks = tableBooks.querySelector("tbody");
    tableBooks.innerHTML = "";

    for (let i = 0; i < result.length; i++) {

        var row = document.createElement("tr");
        var title = document.createElement("td");
        title.innerText = result[i].Name;
        row.appendChild(title);

        var author = document.createElement("td");
        author.innerText = result[i].Age;
        row.appendChild(author);

        var actions = document.createElement("td");
        var actionDiv = document.createElement("div");
        actionDiv.classList.add("button-group");

        var editButton = SetEditReaderButton(result[i]);
        actionDiv.appendChild(editButton);
        var deleteButton = SetDeleteReaderButton(result[i]);
        actionDiv.appendChild(deleteButton);
        var selectButton = SetSelectReaderButton(result[i].ID, borrowBook);
        actionDiv.appendChild(selectButton);

        actions.appendChild(actionDiv);
        row.appendChild(actions);

        tableBooks.appendChild(row);
    }
}

function SetSelectReaderButton(id, borrowBook) {
    var button = document.createElement("button");
    button.classList.add("btn");
    button.classList.add("btn-info");
    button.classList.add("btn-sm");
    button.setAttribute("ids", id);
    button.innerText = "Wybierz";

    button.addEventListener("click", function () {

        borrowBook.readerID = id;
        var datOb = new Date();
        var day = datOb.getDay();
        console.log(day);
        borrowBook.lendDate = `${datOb.getDay()}/${datOb.getMonth()}/${datOb.getFullYear()}`;

        AddAlert(`Proszę wybrać książkę w pierwszej kolejności`, "info");

        if (borrowBook.bookID != "") {
            console.log(borrowBook);
            $.ajax({
                url: "http://localhost:63541/api/lend",
                data: borrowBook,
                type: "POST"
            }).done(function (result) {
                AddAlert(`Dodano wypożyczono książkę`, "success");
                borrowBook.readerID = "";
                borrowBook.lendDate = "";
                GetAllLend();
            }).fail(function (error) {
                AddAlert(`Książka jest już wypożyczona  `, "danger");
            });

        }
        else {
            borrowBook.readerID = "";
            borrowBook.lendDate = "";
            AddAlert(`Proszę wybrać książkę w pierwszej kolejności`, "info");
        }
    });

    return button;
}

function SetDeleteReaderButton(reader) {
    var button = document.createElement("button");
    button.classList.add("btn");
    button.classList.add("btn-danger");
    button.classList.add("btn-sm");
    button.innerText = "Usuń";

    button.addEventListener("click", function () {

        $.ajax({
            url: `http://localhost:63541/api/readers/${reader.ID}`,
            type: "Delete"
        }).done(function () {
            AddAlert("Usunięto czytelnika", "danger")
            GetAllReaders();
        }).fail(function (error) {
        });

    });


    return button;
}

function SetEditReaderButton(reader) {
    var button = document.createElement("button");
    button.classList.add("btn");
    button.classList.add("btn-primary");
    button.classList.add("btn-sm");
    button.innerText = "Edytuj";

    button.addEventListener("click", function () {
        console.log("zmien buttona");
        var form = document.getElementById("formActionReaders");
        var buttonAdd = form.querySelector("a");

        form.removeChild(buttonAdd);

        var editButton = document.createElement("a");
        editButton.classList.add("btn");
        editButton.classList.add("btn-primary");
        editButton.classList.add("btn-sm");
        editButton.setAttribute("href", "#");
        editButton.innerText = "Edytuj";

        document.getElementById("reader-name").value = reader.Name;
        document.getElementById("reader-age").value = reader.Age;

        editButton.addEventListener("click", function () {
            EditReaderById(reader.ID);
        });
        form.appendChild(editButton);
    });

    return button;
}

function EditReaderById(ID) {
    var nameInput = document.getElementById("reader-name");
    var ageInput = document.getElementById("reader-age");

    var newReader = {
        id: ID,
        name: nameInput.value,
        age: ageInput.value
    };

    if (newReader.name !== "" && newReader.name != null && newReader.age !== 0 && newReader.age != null) {

        $.ajax({
            url: `http://localhost:63541/api/readers/${newReader.id}`,
            data: newReader,
            type: "PUT"
        }).done(function () {
            AddAlert("Zmieniono czytelnika pomyślnie", "success");
            nameInput.value = "";
            ageInput.value = 0;
            SetAddReaderButton();
            GetAllReaders();
        }).fail(function (error) {
            AddAlert("Błąd, Nie zmieniono czytelnika", "danger");
        });
    }
    else {
        AddAlert("Źle wpisano dane", "warning");
    }
}

//------------------------------------------

function GetAllBooks(borrowBook) {
    $.ajax({
        url: "http://localhost:63541/api/books",
        type: "Get"
    }).done(function (result) {
        AddRows(result, borrowBook);
    }).fail(function (error) {
        console.log("Ajax lista książek problem! " + error);
    });

}

function AddRows(result, borrowBook) {

    var tableBooks = document.getElementById("books-table");
    tableBooks = tableBooks.querySelector("tbody");
    tableBooks.innerHTML = "";

    for (let i = 0; i < result.length; i++) {

        var row = document.createElement("tr");
        var title = document.createElement("td");
        title.innerText = result[i].Title;
        row.appendChild(title);

        var author = document.createElement("td");
        author.innerText = result[i].Author;
        row.appendChild(author);

        var actions = document.createElement("td");
        var actionDiv = document.createElement("div");
        actionDiv.classList.add("button-group");

        var editButton = SetEditButton(result[i]);
        actionDiv.appendChild(editButton);
        var deleteButton = SetDeleteButton(result[i]);
        actionDiv.appendChild(deleteButton);
        var borrowButton = SetborrowButton(result[i].ID, borrowBook);
        actionDiv.appendChild(borrowButton);

        actions.appendChild(actionDiv);
        row.appendChild(actions);

        tableBooks.appendChild(row);
    }
}

function SetEditButton(result) {
    var button = document.createElement("button");
    button.classList.add("btn");
    button.classList.add("btn-primary");
    button.classList.add("btn-sm");
    button.innerText = "Edytuj";

    button.addEventListener("click", function () {
        console.log("zmien buttona");
        var form = document.getElementById("formAction");
        var buttonAdd = form.querySelector("a");

        form.removeChild(buttonAdd);

        var editButton = document.createElement("a");
        editButton.classList.add("btn");
        editButton.classList.add("btn-primary");
        editButton.classList.add("btn-sm");
        editButton.setAttribute("href", "#");
        editButton.innerText = "Edytuj";

        document.getElementById("book-title").value = result.Title;
        document.getElementById("book-author").value = result.Author;

        editButton.addEventListener("click", function () {
            EditBookById(result.ID);
        });
        form.appendChild(editButton);
    });

    return button;
}

function EditBookById(ID) {

    var titleInput = document.getElementById("book-title");
    var authorInput = document.getElementById("book-author");

    var newBook = {
        id: ID,
        title: titleInput.value,
        author: authorInput.value
    };

    if (newBook.title !== "" && newBook.title != null && newBook.author !== "" && newBook.author != null) {

        $.ajax({
            url: `http://localhost:63541/api/books/${newBook.id}`,
            data: newBook,
            type: "PUT"
        }).done(function () {
            AddAlert("Zmieniono książkę pomyślnie", "success");
            titleInput.value = "";
            authorInput.value = "";
            SetAddBookButton();
            GetAllBooks();
        }).fail(function (error) {
            AddAlert("Błąd, Nie zmieniono książki", "danger");
        });
    }
    else {
        AddAlert("Źle wpisano dane", "warning");
    }
}

function SetDeleteButton(result) {
    var button = document.createElement("button");
    button.classList.add("btn");
    button.classList.add("btn-danger");
    button.classList.add("btn-sm");
    button.innerText = "Usuń";

    button.addEventListener("click", function () {

        $.ajax({
            url: `http://localhost:63541/api/books/${result.ID}`,
            type: "Delete"
        }).done(function () {
            AddAlert("Usunięto książkę", "danger")
            GetAllBooks();
        }).fail(function (error) {
        });

    });


    return button;
}

function SetborrowButton(id, borrowBook) {
    var button = document.createElement("button");
    button.classList.add("btn");
    button.classList.add("btn-info");
    button.classList.add("btn-sm");

    button.innerText = "Wypożycz";

    button.addEventListener("click", function () {
        borrowBook.bookID = id;
        console.log(borrowBook);

        var title = event.path[0].parentElement.parentElement.parentElement.children[0].innerText;
        var author = event.path[0].parentElement.parentElement.parentElement.children[1].innerText;
        AddAlert(`Wybrano książkę o tytule ${title} autora ${author}`, "warning");

    });


    return button;
}

function SetAddBookButton() {

    var addBookButton = document.getElementById("book-add-button");
    if (addBookButton == undefined) {
        var form = document.getElementById("formAction");
        var editButton = form.querySelector("a");
        form.removeChild(editButton);

        var buttonAdd = document.createElement("a");
        buttonAdd.classList.add("btn");
        buttonAdd.classList.add("btn-success");
        buttonAdd.classList.add("btn-sm");
        buttonAdd.setAttribute("id", "book-add-button");
        buttonAdd.setAttribute("href", "#");
        buttonAdd.innerText = "Dodaj";
        form.appendChild(buttonAdd);
        addBookButton = buttonAdd;
    }

    addBookButton.addEventListener("click", function () {

        var titleInput = document.getElementById("book-title");
        var authorInput = document.getElementById("book-author");

        var newBook = {
            title: titleInput.value,
            author: authorInput.value
        };

        if (newBook.title !== "" && newBook.title != null && newBook.author !== "" && newBook.author != null) {

            $.ajax({
                url: "http://localhost:63541/api/books",
                data: newBook,
                type: "POST"
            }).done(function (result) {
                AddAlert("Dodano książkę pomyślnie", "success");
                titleInput.value = "";
                authorInput.value = "";
                GetAllBooks();
            }).fail(function (error) {
                AddAlert("Błąd, Nie dodano książki", "danger");
            });
        }
        else {
            AddAlert("Źle wpisano dane", "warning");
        }

    });
}

function AddAlert(text, type) {
    var infoAlert = document.getElementById("info-happening");
    infoAlert.innerHTML = "";
    var alert = document.createElement("div");
    alert.classList.add("alert");
    alert.classList.add(`alert-${type}`);
    alert.setAttribute("role", "alert");
    alert.innerText = text;
    infoAlert.appendChild(alert);
}




























