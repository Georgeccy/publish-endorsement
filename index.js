// Import Firebase modules and initialize the app with the database URL
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, update} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Firebase app settings and database reference
const appSettings = {
    databaseURL: "https://endorsement-b253d-default-rtdb.firebaseio.com"
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const endorsementListInDB = ref(database, "endorsementList");

// DOM elements
const inputFieldEndorsementEl = document.getElementById("input-field-endorsement");
const inputFieldFromEl = document.getElementById("input-field-from");
const inputFieldToEl = document.getElementById("input-field-to");
const publishBtnEl = document.getElementById("publish-btn");
const endorsementListEl = document.getElementById("endorsement-list")

// Event listener for the publish button to upload complete user input(which means that all the "endorsement", "from" and "to" fields are entered)) and clear input fields
publishBtnEl.addEventListener("click", function() {
    let inputValue = {
        "endorsement": inputFieldEndorsementEl.value || null,
        "from": "From " + inputFieldFromEl.value || null,
        "to": "To " + inputFieldToEl.value || null,
        "likes": 0,
    }
    if(inputValue["endorsement"]&&inputValue["from"]&&inputValue["to"]){
        push(endorsementListInDB, inputValue);
    }
    clearInputFieldEl()
})

// Function to clear input fields of "endorsement", "from" and "to".
function clearInputFieldEl() {
    inputFieldEndorsementEl.value = inputFieldFromEl.value = inputFieldToEl.value = "";
}

// Function to clear the endorsement list element
function clearEndorsementListEl() {
    endorsementListEl.innerHTML = "";
}

// Function to retrieve ifLiked array from local storage or return an empty object
function getIfLikedFromLocalStorage() {
    return JSON.parse(localStorage.getItem("ifLiked")) || {};
}

// Re-render the endorsement list whenever a change occurs.(But I wonder what counts as a change in this context.) 
onValue(endorsementListInDB, function(snapshot) {
    if (snapshot.exists()) {
        clearEndorsementListEl();
        let itemsArray = Object.entries(snapshot.val());
        for (let i = itemsArray.length - 1; i >= 0; i--) {
            let currentItem = itemsArray[i];
            appendItemToEndorsementListEl(currentItem);
        }
    }
})

// Function to append an item to the endorsement list element. 
// I think this function is somewhat long and not well-organized enough. Could you help me improve that🤝? 

function appendItemToEndorsementListEl(item) {
    
    const [itemID, itemValue] = item;
    let ifLiked = getIfLikedFromLocalStorage();
    if(ifLiked[itemID] === undefined){
        ifLiked[itemID] = false;
    }
    
    const itemEl = document.createElement("div");
    const endorsementEl = document.createElement("p");
    const fromEl = document.createElement("p");
    const toEl = document.createElement("p");
    const likesEl = document.createElement("p");
    const fromAndLikesContainerEl = document.createElement("div");
    
    likesEl.addEventListener("click", function() {
        const ifLiked = getIfLikedFromLocalStorage();
        const likesInDB = ref(database, `endorsementList/${itemID}`);    
        const likeChange = ifLiked[itemID]? -1 : 1;
        update(likesInDB, {
            likes: itemValue["likes"] + likeChange
        })

        ifLiked[itemID] = !ifLiked[itemID];    
        localStorage.setItem("ifLiked", JSON.stringify(ifLiked))
    })
    
    itemEl.setAttribute("class", "endorsement-item");
    endorsementEl.setAttribute("class", "endorsement-content");
    fromEl.setAttribute("class", "endorser");
    toEl.setAttribute("class", "endorsee");
    likesEl.setAttribute("class", "likes");
    fromAndLikesContainerEl.setAttribute("class","fromAndLikes");
    
    [endorsementEl.textContent,fromEl.textContent,toEl.textContent,likesEl.textContent] = [itemValue["endorsement"],itemValue["from"],itemValue["to"],"❤ " + itemValue["likes"],];
    
    itemEl.appendChild(toEl);
    itemEl.appendChild(endorsementEl);
    fromAndLikesContainerEl.appendChild(fromEl);
    fromAndLikesContainerEl.appendChild(likesEl);
    itemEl.appendChild(fromAndLikesContainerEl);
    endorsementListEl.appendChild(itemEl);
}




