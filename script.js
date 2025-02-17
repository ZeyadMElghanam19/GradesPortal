const config = Object.freeze({
    "MFM 44": {
        "sheetID": "1eCfEVLAQ4k01jJZ-FUhpiHa9dVjMGMBSfO4XyayMALU",
        "sheetName": "MFM 44",
        "modules": [
            {
                "title": "Foundation 1 Grades",
                "subjects": [
                    "Practical Anatomy", "Practical Data Show", "Total Practical",
                    "Bio Activity", "Anatomy Activity", "Physio Activity", "Histo Activity",
                    "Activities", "End", "End + Activities", "Foundation 1"
                ],
                "maxScores": [18, 36, 54, 6, 6, 3, 3, 18, 36, 54, 108],
                "minScores": [9, 18, 27, 3, 3, 1.5, 1.5, 9, 18, 27, 54],
                "indexes": [
                    4,  // Practical Anatomy
                    5,  // Practical Data Show
                    6,  // Total Practical
                    7,  // Bio Activity
                    8,  // Anatomy Activity
                    9,  // Physio Activity
                    10, // Histo Activity
                    12, // Activities
                    11, // End
                    13, // End + Activities
                    14  // Foundation 1
                ]
            },
            {
                "title": "Foundation 2 Grades",
                "subjects": [
                    "Spot Patho", "Practical Data Show", "Total Practical",
                    "Para Activity", "Micro Activity", "Pharma Activity",
                    "Patho Activity", "Activities", "End", "End + Activities",
                    "Foundation 2"
                ],
                "maxScores": [2, 45.25, 47.25, 3.6, 5.1, 3.9, 3.15, 15.75, 31.5, 47.25, 94.5],
                "minScores": [1, 22.625, 23.625, 1.8, 2.55, 1.95, 1.575, 7.875, 15.75, 23.625, 47.25],
                "indexes": [
                    16, // Spot Patho
                    17, // Practical Data Show 2
                    18, // Total Practical 2
                    20, // Para Activity
                    21, // Micro Activity
                    22, // Pharma Activity
                    23, // Patho Activity
                    24, // Activities 2
                    19, // End 2
                    25, // End + Activities 2
                    26  // Foundation 2
                ]
            },
            {
                "title": "MSK Grades",
                "subjects": ["Prac", "Practical Data Show", "Total Practical"],
                "maxScores": [2, 45.25, 47.25],
                "minScores": [1, 22.625, 23.625],
                "indexes": [
                    32, // Prac
                    30, // Practical Data Show
                    31  // Total Practical
                ]
            },
            {
                "title": "CVS Grades",
                "subjects": ["Spot Neuro", "Practical Data Show", "Total Practical"],
                "maxScores": [3, 40, 43],
                "minScores": [1.5, 20, 21.5],
                "indexes": [
                    42, // Spot Neuro
                    43, // Practical Data Show
                    44  // Total Practical
                ]
            }
        ]
    },
    
    "MFM 43": {
        "sheetID": "1eCfEVLAQ4k01jJZ-FUhpiHa9dVjMGMBSfO4XyayMALU",
        "sheetName": "MFM 44",
        "modules": [
            {
                "title": "Neuro Grades",
                "subjects": ["Spot Neuro", "Practical Data Show", "Total Practical"],
                "maxScores": [3, 40, 43],
                "minScores": [1.5, 20, 21.5],
                "indexes": [
                    42, // Spot Neuro
                    43, // Practical Data Show
                    44  // Total Practical
                ]
            }
        ]
    }
});


    // Add more years and modules as needed

let currentModules = [];
let currentModuleIndex = 0;
    
async function fetchExcelData(year) {
        Object.freeze(config);
        alert(Object.keys(config));
        year = year.trim();
        alert(config[year]);
        

    try {
        if (!config[year]) {
            alert("Invalid year selected.");
            return [];
        }
     

        const sheetID = config[year].sheetID;
        const sheetName = config[year].sheetName;
        currentModules = config[year].modules;
        currentModuleIndex = 0; // Reset module index when changing year
        alert(`Fetching data for: ${year}`);
        const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
        alert(url);
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch data");

        const text = await response.text();
        const json = JSON.parse(text.substring(47, text.length - 2));

        return json.table.rows.map(row => row.c.map(cell => (cell ? cell.v : "")));
    } catch (error) {
        alert("Error fetching data: " + error.message);
        return [];
    }
}

function normalizeArabic(text) {
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
    alert(query);
    
    if (!query) {
        resultElement.innerHTML = "<p>Please enter a name or seat number.</p>";
        return;
    }

    const data = await fetchExcelData(year);
    alert(data);
    if (data.length === 0) {
        resultElement.innerHTML = "<p>Error fetching data.</p>";
        return;
    }

    let studentsFound = [];
    const normalizedQuery = normalizeArabic(query);

    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length < 4) continue;

        const fullName = row[3] ? normalizeArabic(row[3].toLowerCase()) : '';
        const seatNumber = row[2] ? row[2].toString().trim() : '';

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

    resultElement.innerHTML = `
        <hr>
        <div><strong>Name:</strong> ${studentInfo.fullName}</div>
        <div><strong>Seat Number:</strong> ${studentInfo.seatNumber}</div>
        <div><strong>Rank:</strong> ${studentInfo.rank}</div>
        <hr>
        <div id="mainTitle" style="text-align:center; font-size:24px; font-weight:bold; margin-bottom:10px;">Student Grades</div>
        <div id="gradesTable"></div>
        <div style="display: flex; justify-content: center; align-items: center; margin-top: 10px;">
            <button onclick="prevModule()">←</button>
            <div id="moduleTitle" style="margin: 0 15px; font-size: 18px; font-weight: bold;"></div>
            <button onclick="nextModule()">→</button>
        </div>
    `;

    renderModule(); // Now `studentInfo` is set before calling this!
}


function renderModule() {
    const module = config[year].modules[currentModuleIndex];
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
    currentModuleIndex = (currentModuleIndex - 1 + config[year].modules.length) % config[year].modules.length;
    renderModule();
};

window.nextModule = () => {
    currentModuleIndex = (currentModuleIndex + 1) % config[year].modules.length;
    renderModule();
};
