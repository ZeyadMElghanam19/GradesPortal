let config; // Ensure `config` is defined at the top of the script

async function loadConfig() {
    try {
        const response = await fetch("https://raw.githubusercontent.com/ZeyadMElghanam19/GradesPortal/main/config.json");
        if (!response.ok) throw new Error("Failed to fetch config");
        config = await response.json();
        console.log("Config loaded:", config);

        // Store config in localStorage
        localStorage.setItem("config", JSON.stringify(config));

        populateYearDropdown();
    } catch (error) {
        console.error("Error loading config:", error);
        //alert("Error loading config: " + error.message);
    }
}


// Load the config when the script starts
loadConfig();

function populateYearDropdown() {
    if (!yearSelect) {
        console.error("yearSelect dropdown not found in the document.");
        // alert("yearSelect dropdown not found in the document.");
        return;
    }

    // console.log("Config Object:", config); // Debugging line
    // alert("Config Object: " + JSON.stringify(config)); // Debugging line

    yearSelect.innerHTML = ""; // Clear existing options

    // Add default placeholder option
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Your Year";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    yearSelect.appendChild(defaultOption);

    // Populate dropdown with years from config
    Object.keys(config).forEach(year => {
        
        // console.log(`Adding year: ${year}`); // Debugging line
        // alert(`Adding year: ${year}`); // Debugging line
        
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });
}

// Add more years and modules as needed
let currentModules = [];
let currentModuleIndex = 0;

async function fetchExcelData(year) {
    try {
        // alert("Fetching data for year: " + year);
        // console.log("Fetching data for year:", year);

        if (!config[year]) {
           // alert("Invalid year selected.");
            console.error("Invalid year selected.");
            return [];
        }

        const sheetID = config[year].sheetID;
        const sheetName = config[year].sheetName;
        currentModules = config[year].modules;
        currentModuleIndex = 0; // Reset module index when changing year
        const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
        
        // alert("Fetching URL: " + url); // Debugging line
        
        console.log("Fetching URL:", url);
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch data");
        const text = await response.text();
        const json = JSON.parse(text.substring(47, text.length - 2));

        // console.log("Fetched data:", json);
        // alert("Fetched data: " + JSON.stringify(json)); // Debugging line

        return json.table.rows.map(row => row.c.map(cell => (cell ? cell.v : "")));
    } catch (error) {
        // alert("Error fetching data: " + error.message);
        console.error("Error fetching data:", error);
        return [];
    }
}

function normalizeArabic(text) {
    
    // alert("Normalizing text: " + text); // Debugging line
    // console.log("Normalizing text:", text);

    return text
        .replace(/أ|إ|آ/g, "ا")
        .replace(/ة/g, "ه")
        .replace(/ى/g, "ي")
        .replace(/\s+/g, " ")
        .trim();
}

async function searchStudent(query, year) {
    const resultElement = document.getElementById("result");
    query = query.trim().toLowerCase();
    
    if (!query) {
        resultElement.innerHTML = "<p>Please enter a name or seat number.</p>";
        alert("Please enter a name or seat number.");
        return;
    }

    const data = await fetchExcelData(year);
    
    // alert(data);
   
    if (data.length === 0) {
        resultElement.innerHTML = "<p>Error fetching data.</p>";
        // alert("Error fetching data.");
        return;
    }

    let studentsFound = [];
    const normalizedQuery = normalizeArabic(query);
   
    // alert("Normalized query: " + normalizedQuery); // Debugging line

    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length < 4) continue;

        const fullName = row[3] ? normalizeArabic(row[3].toLowerCase()) : '';
        const seatNumber = row[2] ? row[2].toString().trim() : '';

        // alert("Checking student: " + fullName + ", Seat: " + seatNumber); // Debugging line

        if (fullName.includes(normalizedQuery) || seatNumber.includes(query)) {
            studentsFound.push({
                rank: row[1],
                seatNumber,
                fullName,
                fullData: row
            });
        }
    }

    if (studentsFound.length === 0) {
        resultElement.innerHTML = "<p>No student found.</p>";
        alert("No student found.");
        return;
    }

    resultElement.innerHTML = studentsFound.map(student => `
        <hr>
        <div><strong>Name:</strong> ${student.fullName}</div>
        <div><strong>Seat Number:</strong> ${student.seatNumber}</div>
        <div><strong>Rank:</strong> ${student.rank}</div>
        <p>
        <button onclick='showStudentDetails(${JSON.stringify(student.fullData)})'>Details</button>
        <hr>
    `).join("");
}

function showStudentDetails(studentData) {
    const resultElement = document.getElementById("result");

    // Store student info
    studentInfo = { 
        rank: studentData[1], 
        seatNumber: studentData[2], 
        fullName: studentData[3] 
    };

    // Ensure student scores are stored properly
    for (let i = 4; i < studentData.length; i++) {
        studentInfo[i] = studentData[i] || 0; // Store scores safely
    }

    // alert("Student Info: " + JSON.stringify(studentInfo)); // Debugging line

    resultElement.innerHTML = `
        <hr>
        <div><strong>Name:</strong> ${studentInfo.fullName}</div>
        <div><strong>Seat Number:</strong> ${studentInfo.seatNumber}</div>
        <div><strong>Rank:</strong> ${studentInfo.rank}</div>
        <hr>
        <div id="gradesTable"></div>
        <div style="display: flex; justify-content: center; align-items: center; margin-top: 10px;">
            <button onclick="prevModule()">←</button>
            <div id="moduleTitle" style="margin: 0 15px; font-size: 18px; font-weight: bold;"></div>
            <button onclick="nextModule()">→</button>
        </div>
    `;
    
    // alert("Config Object: " + JSON.stringify(config)); // Debugging line

renderModule();

}



function renderModule() {
    const module = currentModules[currentModuleIndex];
  
    // alert(currentModules);
    // alert(module);
  
    document.getElementById("moduleTitle").innerText = module.title;
    document.getElementById("gradesTable").innerHTML = createTable(module);
}


function createTable(module) {
    let tableHTML = `<table border="1">
        <tr>
            <th>Subject</th>
            <th>Max Score</th>
            <th>Min Score</th>
            <th>Student Score</th>
            <th>Percentage</th>
            <th>Rating</th>
        </tr>`;

    module.subjects.forEach((subject, index) => {
        let studentScore = studentInfo[module.indexes[index]] || 0;
        let maxScore = module.maxScores[index];
        let minScore = module.minScores[index];
        let percentage = ((studentScore / maxScore) * 100).toFixed(2);
        
        let rating = "Fail";
        if (percentage >= 85) rating = "امتياز";
        else if (percentage >= 75) rating = "جيد جدًا";
        else if (percentage >= 65) rating = "جيد";
        else if (percentage >= 55) rating = "مقبول";

        tableHTML += `<tr>
            <td>${subject}</td>
            <td>${maxScore}</td>
            <td>${minScore}</td>
            <td>${studentScore}</td>
            <td>${percentage}%</td>
            <td>${rating}</td>
        </tr>`;
    });

    return tableHTML + "</table>";
}

window.prevModule = () => {
    currentModuleIndex = (currentModuleIndex - 1 + currentModules.length) % currentModules.length;
    renderModule();
};

window.nextModule = () => {
    currentModuleIndex = (currentModuleIndex + 1) % currentModules.length;
    renderModule();
};
