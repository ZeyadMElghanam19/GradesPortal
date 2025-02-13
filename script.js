// Loading the config.json file
async function loadConfig() {
    try {
        const response = await fetch('config.json');
        const configData = await response.json();
        return configData;
    } catch (error) {
        console.error("Error loading config:", error);
        return null;
    }
}

// Fetching the data for the selected year
async function fetchStudentData(year) {
    const configData = await loadConfig();
    const yearConfig = configData[year];

    if (!yearConfig) {
        console.error("Year configuration not found");
        return;
    }

    const sheetID = yearConfig.sheetID;
    const sheetName = yearConfig.sheetName;

    const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
    const response = await fetch(url);
    const text = await response.text();
    const json = JSON.parse(text.substring(47, text.length - 2));
    
    return json.table.rows.map(row => row.c.map(cell => (cell ? cell.v : "")));
}

// Normalizing Arabic text for search
function normalizeArabic(text) {
    return text
        .replace(/أ|إ|آ/g, "ا")
        .replace(/ة/g, "ه")
        .replace(/ى/g, "ي")
        .replace(/\s+/g, " ")
        .trim();
}

// Search function
async function searchStudent() {
    const query = document.getElementById("searchInput").value.trim().toLowerCase();
    const year = document.getElementById("yearDropdown").value;
    const data = await fetchStudentData(year);

    if (!query || data.length === 0) {
        document.getElementById("result").innerHTML = "<p>No student found or no data available.</p>";
        return;
    }

    const studentsFound = [];
    const normalizedQuery = normalizeArabic(query);

    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length < 4) continue;

        const fullName = row[3] ? normalizeArabic(row[3].toLowerCase()) : '';
        const seatNumber = row[2] ? row[2].toString().trim() : '';

        if (fullName.includes(normalizedQuery) || seatNumber.includes(query)) {
            studentsFound.push({ fullName, seatNumber, row });
        }
    }

    if (studentsFound.length === 0) {
        document.getElementById("result").innerHTML = "<p>No student found.</p>";
        return;
    }

    document.getElementById("result").innerHTML = studentsFound.map(student => `
        <div><strong>Name:</strong> ${student.fullName}</div>
        <div><strong>Seat Number:</strong> ${student.seatNumber}</div>
        <button onclick='showStudentDetails(${JSON.stringify(student.row)})'>Show Details</button>
    `).join("");
}

// Show Student Details
function showStudentDetails(row) {
    const configData = loadConfig();
    const year = document.getElementById("yearDropdown").value;
    const yearConfig = configData[year];

    if (!yearConfig) {
        console.error("Year configuration not found");
        return;
    }

    const moduleConfig = yearConfig.modules[0]; // Get the first module for now
    const studentInfo = {};

    // Mapping student data based on the module
    Object.keys(moduleConfig.indexes).forEach(key => {
        const index = moduleConfig.indexes[key];
        studentInfo[key] = row[index];
    });

    document.getElementById("studentDetails").innerHTML = `
        <h2>Details for ${studentInfo.fullName}</h2>
        <p>Seat Number: ${studentInfo.seatNumber}</p>
        <p>Rank: ${studentInfo.rank}</p>
        <p>Foundation 1 Grade: ${studentInfo.foundation1}</p>
        <!-- Add more student details here -->
    `;
}
