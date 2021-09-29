// Data is stored in a key:value format with the name as the key and color as the value
var settings = {};
var editMode = false;

var savedObjects = [];

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

let Class = class {
  constructor(startTime, endTime, subject, teacher, room, DOMObject) {
      this.startTime = startTime;
      this.endTime = endTime;
      this.subject = subject;
      this.teacher = teacher;
      this.room = room;
      this.DOMObject = DOMObject;
  }
}

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
function save(data) {
  if (platform == "firefox") {
    browser.storage.sync.set({
      OsirisExtended: data
    });
  }
  else if (platform == "chrome") {
    chrome.storage.sync.set({
      "OsirisExtended": data
    });
  }
}

// Parse the retreived data
// Separate function for async reasons
function parseLoad(result) {
  settings = result["OsirisExtended"];
  if (settings == undefined) {
    
  }
  else {
    for (subject of settings) {
      addRow(subject.uuid, subject.title, subject.color)
      savedObjects.push(subject)
    }
  }
}

function debug(data) {
  test = document.createElement("div")
  test.innerText = data
  document.body.appendChild(test)
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
  data = []
  for (row of container.children) {
    test = {
      uuid: row.children[0].innerText,
      title: row.children[1].children[0].value,
      color: row.children[2].children[0].value
    }
    data.push(test)
  }
    save(data)
}

function addRow(uid, title, color) {
  rowObject = document.createElement("div")
  rowObject.classList = "rowObject"
  container.appendChild(rowObject)

  uidContainer = document.createElement("div")
  uidContainer.innerText = uid
  uidContainer.classList = "uidContainer"
  rowObject.appendChild(uidContainer)

  var cellLeft = document.createElement("div");
  var name = document.createElement("input")
  name.disabled = !editMode;
  name.classList = "nameInput"
  name.value = title;
  cellLeft.appendChild(name)
  rowObject.appendChild(cellLeft).className = "grid-item";
  
  var cellMiddle = document.createElement("div");
  var input = document.createElement("input")
  input.type = "color"
  input.disabled = !editMode;
  input.value = color
  input.classList = "colorInput"
  rowObject.appendChild(cellMiddle).className = "grid-item";
  cellMiddle.appendChild(input)
  
  var cellRight = document.createElement("div");
  var input = document.createElement("button")
  input.innerText = "Delete"
  input.classList = "buttonDelete"
  input.disabled = !editMode;
  input.addEventListener("click", function() {deleteRow(uid)})
  rowObject.appendChild(cellRight).className = "grid-item";
  cellRight.appendChild(input)
}

function deleteRow(uid) {
  for (row of container.children) {
    if (row.children[0].innerText == uid) {
      row.remove()
    }
  }
}

function parseLoadFromPage(result) {
  hours = result["OSE_HOURS"]
  var subjects = []
  for (subject of savedObjects) {
    subjects.push(subject.title)
  }
  for (day of hours) {
    for (hour of day) {
      if ( ! subjects.some(y => y === hour.subject) ) {
        subjects.push(hour.subject)
        addRow(uuidv4(), hour.subject, "#00FF00")
      }
    }
  }
}

function loadFromPage() {
  /*var query = { active: true, currentWindow: true };
  chrome.tabs.query(query, function(tabs) {
    test = document.createElement("div")
    test.innerText = tabs
    document.body.appendChild(test)
  });*/
  
  if (platform == "firefox") {
    var rlinks = browser.storage.sync.get("OSE_HOURS");
    rlinks.then(parseLoadFromPage, onError);
  }
  else if (platform == "chrome") {
    try{
      var rlinks = chrome.storage.sync.get(["OSE_HOURS"], parseLoadFromPage);
    }
    catch (error) {
      settings = {};
    }
  }
}

window.onload = function () {
  restoreOptions()
  console.log(settings)
  var container = document.getElementById("container")
  for (const [key, value] of Object.entries(settings)) {
    addRow(key, value)
  };
  var buttonEdit = document.createElement("button")
  buttonEdit.innerText = "P Edit"
  buttonEdit.id = "buttonEdit"
  buttonEdit.classList = "buttonEdit"
  document.body.appendChild(buttonEdit)
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
    buttonLoad.disabled = !editMode;
    var nameInputs = document.getElementsByClassName("nameInput")
    for (input of nameInputs) {
      input.disabled = !editMode;
    }
    document.getElementById("buttonEdit").innerText = editMode ? "P Save" : "P Edit"
    if (!editMode) {
      saveOptions()
    }
  })
  var buttonCreate = document.createElement("button")
  buttonCreate.innerText = "+ Add new"
  buttonCreate.classList = "buttonCreate"
  buttonCreate.addEventListener("click", function() {
    addRow("")
  })
  document.body.appendChild(buttonCreate)

  var buttonLoad = document.createElement("button")
  buttonLoad.innerText = "Load from last parse"
  buttonLoad.id = "buttonLoad"
  buttonLoad.classList = "buttonLoad"
  buttonLoad.disabled = true;
  buttonLoad.addEventListener("click", loadFromPage)
  document.body.appendChild(buttonLoad)
}
