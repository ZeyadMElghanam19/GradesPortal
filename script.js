// Load config.json and process the selected year and student
async function loadConfigAndFetchStudentData() {
    try {
        const response = await fetch('config.json');
        const config = await response.json();
        alert("Config loaded successfully");

        // Retrieve stored query (student name) and year
        let studentName = localStorage.getItem("query");
        let selectedYear = localStorage.getItem("year");

        if (!studentName || !selectedYear) {
            alert("Student name or year not found in localStorage");
            return;
        }

        alert(`Selected Student: ${studentName}\nSelected Year: ${selectedYear}`);

        if (!config[selectedYear]) {
            alert("Year not found in config.json");
            return;
        }

        let { sheetID, sheetName, modules } = config[selectedYear];
        alert(`Sheet ID: ${sheetID}\nSheet Name: ${sheetName}`);

        fetchStudentData(sheetID, sheetName, studentName, modules);
    } catch (error) {
        alert("Error loading config.json: " + error);
    }
}

// Fetch student data from Google Sheets API
async function fetchStudentData(sheetID, sheetName, studentName, modules) {
    try {
        let url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
        const response = await fetch(url);
        const text = await response.text();
        const jsonData = JSON.parse(text.substring(47, text.length - 2));
        
        let studentRow = jsonData.table.rows.find(row => row.c[0]?.v === studentName);
        
        if (!studentRow) {
            alert("Student not found in the sheet");
            return;
        }

        alert("Student data found, preparing to display");

        displayStudentData(studentRow, modules);
    } catch (error) {
        alert("Error fetching student data: " + error);
    }
}

let currentModuleIndex = 0;
let currentModules = [];

// Display student data module-wise
function displayStudentData(studentRow, modules) {
    currentModules = modules;
    currentModuleIndex = 0;
    showModuleData(studentRow);
}

// Show data for the current module
function showModuleData(studentRow) {
    if (currentModuleIndex < 0 || currentModuleIndex >= currentModules.length) {
        alert("Invalid module index");
        return;
    }

    let module = currentModules[currentModuleIndex];
    let message = `Module: ${module.title}\n`;

    module.subjects.forEach((subject, i) => {
        let index = module.indexes[Object.keys(module.indexes)[i]];
        let score = studentRow.c[index]?.v || "N/A";
        message += `${subject}: ${score}\n`;
    });

    alert(message);
}

// Navigation functions
function nextModule() {
    if (currentModuleIndex < currentModules.length - 1) {
        currentModuleIndex++;
        showModuleData();
    } else {
        alert("No more modules available");
    }
}

function prevModule() {
    if (currentModuleIndex > 0) {
        currentModuleIndex--;
        showModuleData();
    } else {
        alert("This is the first module");
    }
}

// Attach navigation functions to buttons
document.getElementById("nextBtn").addEventListener("click", nextModule);
document.getElementById("prevBtn").addEventListener("click", prevModule);

// Load data on page load
window.onload = loadConfigAndFetchStudentData;
