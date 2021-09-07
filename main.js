function print(toPrint) {console.log(toPrint)}

// TODO: For some reason the website needs user interaction before being able to open the day tabs
// Need to fix this somehow

// TODO: give the whole thing a graphical pass

// Some constants for drawing the widget.
// Unit = x/1
const headerWidth = .1;
const headerHeight = .1;
const startTime = getMinutesFromTime("08:00");
const endTime = getMinutesFromTime("21:00");
const timeSpan = endTime - startTime;
// Grid divisions in minutes
const gridDivision = 60;
const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

var hours = [];

var needsUserInteraction = true;
var layoutNeedsUpdate = false;

let Class = class {
    constructor(startTime, endTime, subject, teacher, room) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.subject = subject;
        this.teacher = teacher;
        this.room = room;
    }
}

function getMinutesFromTime(input) {
    var s = input.split(":")
    return ((parseInt(s[0]) * 60) + parseInt(s[1]))
}

function getReprFromMinutes(input) {
    hour = Math.floor(input/60)
    minutes = input % 60
    return hour.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0")
}

function addStyle(styleString) {
    const style = document.createElement('style');
    style.textContent = styleString;
    document.head.append(style);
  }

function waitUntilLoaded() {
    var found = document.getElementsByTagName("osi-calendar-day")
    if (found.length != 0) {
        print("LOADED")
        print(found.length)
        print(found)
        fixLayout()
        getHours()
        drawCanvas()
    }
    else {
        print("NOT LOADED")
        setTimeout( function() { waitUntilLoaded() } , 10);
    }
    return
}

function getHours() {
    days = document.getElementsByTagName("osi-calendar-day")
    hours = []
    var y = -1
    for (var i = 0; i < 5; i++) {
	if (days[i].children[0].children[1] == undefined) {
		// Day is collapsed
		days[i].children[0].children[0].children[0].click();
	}
	if (days[i].children[0].children[1] == undefined) {continue}
    classList = days[i].children[0].children[1].children
	dayList = []
        for (var x = 0; x < classList.length; x++) {
            // Yeah idk either, why do you need *this* many wrappers??
            var classObj = classList[x].children[0].children[0].children[0].children[0].children[0].children[0]
            var times = classObj.children[0]
            var classStartTime = getMinutesFromTime(times.children[0].innerText)
            var classEndTime = getMinutesFromTime(times.children[1].innerText)
            var subject = classObj.children[1].children[0].innerText
            var teacher = classObj.children[1].children[1].children[0].children[1].innerText
            var room = classObj.children[1].children[1].children[0].children[2]
            if (room != undefined) {
                room = room.innerText
            }
            if (teacher.substring(0, 3) == "GVP") {
                room = teacher
                teacher = "Not Assigned"
            }
            var inst = new Class(classStartTime, classEndTime, subject, teacher, room)
            dayList.push(inst)
        }
        hours.push(dayList)
    }
}

function drawButton() {
    var canvas = document.getElementById("OEWeekScheduleCanvas")
    var ctx = canvas.getContext("2d", {alpha: false})

    canvas.width = canvas.clientWidth; //document.width is obsolete
    canvas.height = canvas.clientHeight; //document.height is obsolete

    width = canvas.width
    height = canvas.height
    ctx.fillStyle = "#fafafa"
    ctx.fillRect(0, 0, width, height)
    ctx.fillStyle = "#000000"
    ctx.lineWidth = 1
    ctx.font = "30px Arial";
    ctx.fillText("Click anywhere on this page to load the schedule widget", 0, 40);
    //ctx.stroke();
    
}

function drawCanvas() {
    if (needsUserInteraction) {
        drawButton();
        return;
    }
    var canvas = document.getElementById("OEWeekScheduleCanvas")
    var ctx = canvas.getContext("2d", {alpha: false})

    canvas.width = canvas.clientWidth; //document.width is obsolete
    canvas.height = canvas.clientHeight; //document.height is obsolete

    width = canvas.width
    height = canvas.height

    ctx.fillStyle = "#fafafa"

    ctx.fillRect(0, 0, width, height)

    ctx.fillStyle = "#000000"
    ctx.strokeStyle = "#b0b0b0"
    ctx.lineWidth = 1
    ctx.font = "20px Arial";

    var scheduleHeight = height * (1-headerHeight)
    var scheduleWidth = width * (1-headerWidth)
    
    // Draw vertical header
    minute =  scheduleHeight / timeSpan
    var divisions = Math.floor(timeSpan/gridDivision) + 0


    ctx.beginPath();
    ctx.fillStyle = "#ff0000"
    //ctx.fillRect(0,0, width, headerHeight*height)
    ctx.closePath();

    ctx.fillStyle = "#000000"

    ctx.beginPath();
    // Draw vertical header
    for (var i = 0; i < divisions; i++) {
        //getReprFromMinutes(startTime + (i*gridDivision))
        ctx.fillText(getReprFromMinutes(startTime + (i*gridDivision)), 10, (i*minute*gridDivision) + headerHeight*height + 7);
        ctx.moveTo(75, (i*minute*gridDivision) + headerHeight*height)
        ctx.lineTo(width - 10, (i*minute*gridDivision) + headerHeight*height)
        ctx.stroke();
    }

    // Draw horizontal header
    for (var i = 0; i < 5; i++) {
        ctx.strokeStyle = "#b0b0b0"
        //getReprFromMinutes(startTime + (i*gridDivision))
        ctx.fillText(dayNames[i], ((i*(scheduleWidth/5)) + headerWidth*width) + 30, 30);
        ctx.moveTo((i*(scheduleWidth/5)) + headerWidth*width - 30, 30)
        ctx.lineTo((i*(scheduleWidth/5)) + headerWidth*width - 30, height-15)
        ctx.stroke();
    }
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = "#00ff00"
    ctx.strokeStyle = "#000000";
    ctx.font = "1.25em Arial";
    // Draw hours
    for (var i = 0; i < 5; i++) {
        var hoursForDay = hours[i]
	if (hoursForDay == undefined) {continue}
        var localX = i*(scheduleWidth/5) + headerWidth*width - 30
        for (var h = 0; h < hoursForDay.length; h++) {
            var info = hoursForDay[h]
            var startY = (info.startTime - startTime) * minute
            var endY = (info.endTime - info.startTime) * minute
            ctx.beginPath()
            ctx.fillStyle = "#00ff00"
            if (info.teacher == "Not Assigned") {
                ctx.fillStyle = "#ffa500"
            }
            ctx.rect(localX + 5, startY + headerHeight*height + 2, (scheduleWidth/5) - 10, endY);
            ctx.fill()
            ctx.stroke()
            ctx.closePath()
            ctx.beginPath()
            ctx.fillStyle = "#000000"
            ctx.font = "1.25em Arial";
            ctx.fillText(info.subject + " - " + info.teacher, localX + 10, startY + endY + 20, scheduleWidth/5 - 20);
            ctx.closePath()
            ctx.beginPath()
            ctx.fillStyle = "#000000"
            ctx.font = "1em Arial";
            ctx.fillText(info.room + "  " + getReprFromMinutes(info.startTime) + " - " + getReprFromMinutes(info.endTime), localX + 10, startY + endY + 40, scheduleWidth/5 - 20);
            ctx.closePath()
        }
    }
    ctx.closePath();
    return
}

function fixLayout() {
    document.getElementsByTagName("osi-page-left")[0].style.width = "25%"
    var rightSide = document.getElementsByTagName("osi-page-right")[0]
    var weekScheduleCanvas = document.createElement("canvas")
    var weekScheduleContainer = document.createElement("div")
    weekScheduleCanvas.id = "OEWeekScheduleCanvas"
    weekScheduleContainer.className = "OEWeekSchedule"
    if ( document.getElementsByClassName("OEWeekSchedule").length == 0) {
        rightSide.parentElement.appendChild(weekScheduleContainer);
        weekScheduleContainer.appendChild(weekScheduleCanvas)
    }
    document.getElementById("acc-nav").style.width = "100%"
    document.getElementById("acc-nav").style.zIndex = "100"
    //document.getElementsByTagName("ion-content")[2].style.height = "50%"
    addStyle(`
    osi-page-right {
        float: left;
        top: 65px;
        left: 12px;
        width: 73.5%;
        height: 40%;
    }
    #osi-detail-header-container {padding-top: 0px;}
    .osi-detail-header-container {padding: 15px 15px 15px 15px;}
    .osi-detail-container {padding: 15px 15px 15px 15px;}
    .OEWeekSchedule {
        background-color: red;
        position: absolute;
        left: 25.7%;
        height: 51%;
        bottom: 10px;
        right: 10px;
        box-shadow: 0 1px 15px rgba(0, 0, 0, 0.3), 0 1px 1px rgba(0, 0, 0, 0.22);
    }
    #OEWeekScheduleCanvas {
        width: 100%;
        height: 100%;
    }
    osi-calendar-week-selector .osi-calendar-week-selector {
        position: relative;
        left: -30px;
    }
    `)
    layoutNeedsUpdate = false;
    getHours()
    drawCanvas()
}

window.onload = function() {
    console.log('window - onload'); // 4th
    if (window.location.href == "https://mborijnland.osiris-student.nl/#/rooster") {
         setTimeout( function() { waitUntilLoaded() } , 0);
    }
};

window.onresize = function () {
    if (window.location.href == "https://mborijnland.osiris-student.nl/#/rooster") {
        getHours();
    	drawCanvas();
    }
}

function waitForHREFUpdate(origin) {
    if (window.location.href != origin) {
        if (window.location.href == "https://mborijnland.osiris-student.nl/#/rooster") {
            fixLayout()
            needsUserInteraction = true
            drawCanvas()
        }
    }
    else {
        setTimeout( function() { waitForHREFUpdate(origin) } , 100);
    }
    return
}

window.addEventListener('click', function (event) {
    if (window.location.href == "https://mborijnland.osiris-student.nl/#/rooster") {
        if (layoutNeedsUpdate) {fixLayout()}
    	getHours()
    	drawCanvas()
    }
    else {
        layoutNeedsUpdate = true;
        waitForHREFUpdate(window.location.href)
    }
	needsUserInteraction = false;
});
