// Load config.json and process student data
document.addEventListener("DOMContentLoaded", function () {
    alert("Script loaded successfully");

    // Fetch config.json
    fetch("config.json")
        .then(response => {
            if (!response.ok) throw new Error("Failed to load config.json");
            return response.json();
        })
        .then(config => {
            alert("Config loaded successfully");

            // Get stored student name and year from the HTML (or session storage if used)
            let query = document.getElementById("studentName").value || "";
            let year = document.getElementById("selectedYear").value || "";

            alert("Query: " + query);
            alert("Year: " + year);

            if (!config[year]) {
                alert("Error: Selected year not found in config.json");
                return;
            }

            let sheetID = config[year].sheetID;
            let sheetName = config[year].sheetName;
            let modules = config[year].modules;

            alert("Sheet ID: " + sheetID);
            alert("Sheet Name: " + sheetName);

            // Fetch student data from Google Sheets API
            let apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${sheetName}?key=YOUR_API_KEY`;
            alert("Fetching data from: " + apiUrl);

            fetch(apiUrl)
                .then(response => {
                    if (!response.ok) throw new Error("Failed to fetch sheet data");
                    return response.json();
                })
                .then(sheetData => {
                    alert("Sheet data fetched successfully");
                    processStudentData(sheetData, query, modules);
                })
                .catch(error => alert("Error fetching sheet: " + error.message));
        })
        .catch(error => alert("Error loading config: " + error.message));
});

// Process student data and display it functionally
function processStudentData(sheetData, query, modules) {
    let rows = sheetData.values;
    if (!rows || rows.length === 0) {
        alert("No data found in sheet");
        return;
    }

    alert("Total rows in sheet: " + rows.length);

    let studentRow = rows.find(row => row[0] && row[0].trim() === query.trim());
    if (!studentRow) {
        alert("Student not found");
        return;
    }

    alert("Student data found");

    // Display student data for each module
    modules.forEach(module => {
        let moduleData = "Module: " + module.title + "\n";
        module.subjects.forEach((subject, index) => {
            let colIndex = module.indexes[subject];
            let score = studentRow[colIndex] || "N/A";
            moduleData += subject + ": " + score + "\n";
        });
        alert(moduleData);
    });
}
