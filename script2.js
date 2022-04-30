/*==========================================
DOM Variables / Event Listeners
============================================*/

const addItemButton = document.querySelector("[data-add-item-button]")
const addListButton = document.querySelector("[data-add-list-button]")
const maxListNameLength = 16;
const maxItemLength = 80;

/* ===========================
 Local Storage
==============================*/

let lists = [];
let selectedListId;

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
    localStorage.setItem("todo.selected", JSON.stringify(selectedListId));
}
else {
    selectedListId = JSON.parse(localStorage.getItem("todo.selected"));
    console.log(`read ${selectedListId} as the selected list id from storage`)
}

function saveToLocalStorage() {
    console.log("called savetolocalstorage");
    localStorage.setItem("todo.lists", JSON.stringify(lists));
    // save the selected list to the local storage as well
    localStorage.setItem("todo.selected", JSON.stringify(selectedListId))
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

// look for instances of getItems
function getItems(list) {
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

// look for isntances of renderAllItems
function renderAllItems(selectedListId) {
    console.log("selected list id" + selectedListId);

    // get in the list which matches the id
    let index = getIndex(selectedListId, lists);

    let list = lists[index].items;

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

    let index = getIndex(selectedListId, lists);

    let list = lists[index].items;

    if (this.checked) {
        markItemComplete(id, list);
        renderAllItems(selectedListId);
    } else {
        // uncheck it
        markItemIncomplete(id, list);
        renderAllItems(selectedListId);
    }
    saveToLocalStorage();
}

function deleteItemClicker(e) {
    let id = e.target.dataset.itemId;

    let index = getIndex(selectedListId, lists);

    let list = lists[index].items;
    let index2 = getIndex(id, list);
    deleteItem(list, index2);
    renderAllItems(selectedListId);
}

function renderNewItem() {

    let index = getIndex(selectedListId, lists);



    createItem(lists[index].items, "Untitled");
    renderAllItems(selectedListId);
}
addItemButton.addEventListener('click', renderNewItem);

// make divs editable on double click
function makeDivEditable(e) {
    let div = e.target;
    let input = document.createElement("input");
    input.classList.add("item-name-field")
    input.maxLength = 80;

    // get the text of the item
    let id = div.dataset.itemId


    let index = getIndex(selectedListId, lists);


    let index2 = getIndex(id, lists[index].items);
    let text = lists[index].items[index2].text;

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

        newText = newText.substring(0, maxItemLength);

        // edit the actual saved value of the item

        let index = getIndex(selectedListId, lists);
        editItem(id, lists[index].items, newText);

        e.target.replaceWith(div);
    })

}

function makeListDivEditable(e) {
    let div = e.target;
    let input = document.createElement("input");
    input.classList.add("list-name-field")
    input.maxLength = maxListNameLength;

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

        // trim the name to a max length of characters in case the input field limit fails
        newName = newName.substring(0, maxListNameLength);
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

    console.log(`comparing ${list.id} to ${selectedListId}`);
    if (list.id == selectedListId) {
        li.classList.add("selected");
    }
    else {
        li.classList.remove("selected");
    }

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

    if (id == selectedListId) {
        // if you delete the list you've selected, re-select the first list in the list list
        if (lists[0].id) {
            selectedListId = lists[0].id;
            saveToLocalStorage();
            renderAllItems(selectedListId);
        };
    }

    deleteList(index);
    renderAllListNames();
}

function renderItemClicker(e) {
    console.log("renderItemClicker")
    console.log("e.target is ", e.target);
    let id = e.target.dataset.listId;

    console.log(id);
    let index = getIndex(id, lists);
    console.log(index);
    let list = lists[index]
    console.log(list.items);

    //unselect previous list
    // get the selcted list by looking for the list which matches the selected id
    let div = document.querySelector(`[data-list-id="${selectedListId}"]`);
    div.classList.remove("selected");

    selectedListId = id;
    // add the style manually to avoid the case where the user can't doubleclick since clicking would normally re-render the lists
    e.target.classList.add("selected");

    renderAllItems(selectedListId);

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
let index = getIndex(selectedListId, lists);
let num2 = lists[index].items
if (num2) {
    renderAllItems(selectedListId);
}