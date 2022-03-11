/*==========================================
DOM Variables / Event Listeners
============================================*/

const addItemButton = document.querySelector("[data-add-item-button]")
const addListButton = document.querySelector("[data-add-list-button]")

/* ===========================
 Local Storage
==============================*/

let lists = [];
let selectedList;

const localStorage = window.localStorage;
// get the user's lists
if (!localStorage.getItem("todo.lists")) {

    console.log("local storage doesn't have a lists variable saved, make one")
    localStorage.setItem("todo.lists", JSON.stringify(lists))
} else {
    lists = JSON.parse(localStorage.getItem("todo.lists"));
}
// get the user's selected list
if (!localStorage.getItem("todo.selected")) {
    localStorage.setItem("todo.selected", JSON.stringify(selectedList));
}
else {
    selectedList = JSON.parse(localStorage.getItem("todo.selected"));
}

function saveToLocalStorage() {
    console.log("called savetolocalstorage");
    localStorage.setItem("todo.lists", JSON.stringify(lists));
    // save the selected list to the local storage as well
    localStorage.setItem("todo.selected", JSON.stringify(selectedList))
}

/* ===========================
 Item CRUD
==============================*/

function createItem(list, text) {
    list.push(
        {
            id: Date.now().toString(),
            text: text,
            done: false
        }
    )
    saveToLocalStorage();
}

function editItem(id, list, text) {
    let index = getIndex(id, list)
    list[index].text = text;
    saveToLocalStorage();
}

function getIndex(id, array) {
    return array.findIndex((ele) => ele.id == id);
}

function getItems(list = lists[selectedList].items) {
    list.forEach(ele => {
        console.log(ele.text);
    });
}

function deleteItem(list, index) {
    list.splice(index, 1);
    saveToLocalStorage();
}

function renderItem(item) {
    let li = document.createElement("li");

    let checkbox = document.createElement("input")
    checkbox.type = 'checkbox';
    checkbox.dataset.itemId = item.id;
    checkbox.classList.add("checkmark");
    checkbox.addEventListener("change", markItemDoneClicker);

    if (item.done) {
        checkbox.checked = true;
    }
    else {
        checkbox.checked = false;
    }

    li.appendChild(checkbox);

    let div = document.createElement("div");
    div.textContent = item.text;
    div.dataset.itemId = item.id;
    div.addEventListener("dblclick", makeDivEditable);
    li.appendChild(div);

    li.classList.add("item")
    if (item.done) {
        li.classList.add("done");
    }
    li.dataset.itemId = item.id;

    let deleteButton = document.createElement("button");
    deleteButton.addEventListener("click", deleteItemClicker)
    deleteButton.innerText = "X";
    deleteButton.dataset.itemId = item.id;
    deleteButton.classList.add("delete-button");
    deleteButton.classList.add("hidden");
    li.appendChild(deleteButton);

    let itemsDiv = document.getElementById("items");
    itemsDiv.appendChild(li);
}

function renderAllItems(list = lists[selectedList].items) {
    let container = document.getElementById("items");
    clearContainer(container)
    list.forEach(item => renderItem(item));
}

function clearContainer(div) {
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }
}

function editLI(e) {
    let li = e.target;
    li.style.backgroundColor = "grey";
    clearContainer(li);
    let input = renderInputField();
    li.appendChild(input);

}

function markItemComplete(id, list) {
    let index = getIndex(id, list);
    list[index].done = true;
}

function markItemIncomplete(id, list) {
    let index = getIndex(id, list);
    list[index].done = false;
}

function markItemDoneClicker(e) {
    let id = e.target.dataset.itemId;
    let list = lists[selectedList].items;

    if (this.checked) {
        markItemComplete(id, list);
        renderAllItems();
    } else {
        // uncheck it
        markItemIncomplete(id, list);
        renderAllItems();
    }
    saveToLocalStorage();
}

function deleteItemClicker(e) {
    let id = e.target.dataset.itemId;
    let list = lists[selectedList].items;
    let index = getIndex(id, list);
    deleteItem(list, index);
    renderAllItems();
}

function renderNewItem() {
    createItem(lists[selectedList].items, "Untitled");
    renderAllItems();
}
addItemButton.addEventListener('click', renderNewItem);

// make divs editable on double click
function makeDivEditable(e) {
    let div = e.target;
    let input = document.createElement("input");
    input.classList.add("item-name-field")

    // get the text of the item
    let id = div.dataset.itemId
    let index = getIndex(id, lists[selectedList].items);
    let text = lists[selectedList].items[index].text;

    input.value = text;
    input.dataset.itemId = id;
    div.replaceWith(input);
    input.focus();
    input.addEventListener("blur", (e) => {
        let newText = e.target.value;
        let div = document.createElement("div");
        div.textContent = newText;
        div.dataset.itemId = e.target.dataset.itemId;
        div.addEventListener("dblclick", makeDivEditable)

        // edit the actual saved value of the item
        editItem(id, lists[selectedList].items, newText);

        e.target.replaceWith(div);
    })

}

function makeListDivEditable(e) {
    let div = e.target;
    let input = document.createElement("input");
    input.classList.add("list-name-field")

    // get the text of the item
    let id = div.dataset.listId
    let index = getIndex(id, lists);
    let name = lists[index].name;

    input.value = name;
    input.dataset.listId = id;
    div.replaceWith(input);
    input.focus();
    input.addEventListener("blur", (e) => {
        let newName = e.target.value;
        let div = document.createElement("div");
        div.textContent = newName;
        div.dataset.listId = e.target.dataset.listId;
        div.addEventListener("dblclick", makeListDivEditable)

        // edit the actual saved value of the item
        editList(id, newName);

        e.target.replaceWith(div);
    })

}

/* =====================================
LISTS
========================================*/
// Create a LIST
function createList(name) {
    lists.push(
        {
            id: Date.now().toString(),
            name: name,
            items: []
        }
    )
    saveToLocalStorage();
}

function deleteList(index) {
    lists.splice(index, 1);
    saveToLocalStorage();
}

function editList(id, newName) {
    let index = getIndex(id, lists)
    if (index != -1) {
        lists[index].name = newName;
    }
    saveToLocalStorage();
}

function renderAllListNames() {
    // clear the container
    let container = document.getElementById("lists");
    clearContainer(container)

    lists.forEach(list => renderListName(list));
}



// renders the name of the list
function renderListName(list) {
    let li = document.createElement("li");
    li.dataset.listId = list.id;

    let div = document.createElement("div");
    div.textContent = list.name;
    div.dataset.listId = list.id;
    li.appendChild(div);

    let deleteButton = document.createElement("button");
    deleteButton.innerText = "X";
    deleteButton.dataset.listId = list.id;
    deleteButton.classList.add("delete-button");
    deleteButton.classList.add("hidden");
    deleteButton.addEventListener("click", deleteListClicker);


    li.addEventListener("click", renderItemClicker)
    li.appendChild(deleteButton);

    div.addEventListener("dblclick", makeListDivEditable)
    let listsDiv = document.getElementById("lists");
    listsDiv.appendChild(li);
}

function deleteListClicker(e) {
    e.stopPropagation();
    let id = e.target.dataset.listId;

    let index = getIndex(id, lists);
    deleteList(index);
    renderAllListNames();
}

function renderItemClicker(e) {
    let id = e.target.dataset.listId;

    console.log(id);
    let index = getIndex(id, lists);
    console.log(index);
    let list = lists[index]
    console.log(list.items);
    selectedList = index;
    renderAllItems(list.items);
    saveToLocalStorage();
}

function renderNewList() {
    createList("Untitled");
    renderAllListNames();
}

addListButton.addEventListener('click', renderNewList);

/*================
DOM EVENTS TO DO ON PAGE LOAD
==================*/
renderAllListNames();

//render the selected list
if (lists[selectedList].items) {
    renderAllItems();
}