// Data is stored in a key:value format with the name as the key and color as the value
var settings = {};
var editMode = false;

// Stupid little hack
// Browser is defined in firefox but not in chrome
try {
  browser;
  platform = "firefox";
}
catch (error) {
  platform = "chrome";
}

// Save and Load

// Save collected data to storage
function save() {
  if (platform == "firefox") {
    browser.storage.sync.set({
      OsirisExtended: settings
    });
  }
  else if (platform == "chrome") {
    chrome.storage.sync.set({
      "OsirisExtended": settings
    });
  }
}

// Parse the retreived data
// Separate function for async reasons
function parseLoad(result) {
  settings = result["OsirisExtended"];
  if (settings == undefined) {
    settings = {};
  }
  console.log(settings);
}

// Load data from storage
function restoreOptions() {
  function onError(error) {
    console.log(`Error: ${error}`);
  }
  if (platform == "firefox") {
    var rlinks = browser.storage.sync.get("OsirisExtended");
    rlinks.then(parseLoad, onError);
  }
  else if (platform == "chrome") {
    try{
      var rlinks = chrome.storage.sync.get(["OsirisExtended"], parseLoad);
    }
    catch (error) {
      settings = {};
    }
  }
}

// Gathers data
function saveOptions() {
    // TODO: write a function to save
    save()
}

function addRow(title, color) {
    var cellLeft = document.createElement("div");
    var name = document.createElement("input")
    name.disabled = true;
    name.classList = "nameInput"
    cellLeft.appendChild(name)
    container.appendChild(cellLeft).className = "grid-item";
    
    var cellMiddle = document.createElement("div");
    var input = document.createElement("input")
    input.type = "color"
    input.disabled = true;
    input.value = color
    input.classList = "colorInput"
    container.appendChild(cellMiddle).className = "grid-item";
    cellMiddle.appendChild(input)
    
    var cellRight = document.createElement("div");
    var input = document.createElement("button")
    input.innerText = "Delete"
    input.classList = "buttonDelete"
    input.disabled = true;
    container.appendChild(cellRight).className = "grid-item";
    cellRight.appendChild(input)
}

window.onload = function () {
    restoreOptions()
    console.log(settings)
    var rows = 5
    var cols = 2
    var container = document.getElementById("container")
    container.style.setProperty('--grid-rows', rows);
    container.style.setProperty('--grid-cols', cols);
    for (const [key, value] of Object.entries(settings)) {
        addRow(key, value)
    };
    var buttonEdit = document.createElement("button")
    buttonEdit.innerText = "P Edit"
    buttonEdit.id = "buttonEdit"
    buttonEdit.classList = "buttonEdit"
    buttonEdit.addEventListener("click", function() {
        editMode = !editMode;
        var deleteButtons = document.getElementsByClassName("buttonDelete")
        for (button of deleteButtons) {
            button.disabled = !editMode;
        }
        var colorInputs = document.getElementsByClassName("colorInput")
        for (input of colorInputs) {
          input.disabled = !editMode;
        }
        var nameInputs = document.getElementsByClassName("nameInput")
        for (input of nameInputs) {
          input.disabled = !editMode;
        }
        document.getElementById("buttonEdit").innerText = editMode ? "P Save" : "P Edit"
        if (!editMode) {
            saveOptions()
        }
    })
    document.body.appendChild(buttonEdit)
    var buttonCreate = document.createElement("button")
    buttonCreate.innerText = "+ Add new"
    buttonCreate.classList = "buttonCreate"
    buttonCreate.addEventListener("click", function() {
        addRow("")
    })
    document.body.appendChild(buttonCreate)
}
