const sheetID = "1eCfEVLAQ4k01jJZ-FUhpiHa9dVjMGMBSfO4XyayMALU"; 
const sheetName = "MFM 44"; 

async function fetchExcelData() {
    try {
        const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
        const response = await fetch(url);

        if (!response.ok) throw new Error("Failed to fetch data");

        const text = await response.text();
        const json = JSON.parse(text.substring(47, text.length - 2));

        return json.table.rows.map(row => row.c.map(cell => (cell ? cell.v : "")));
    } catch (error) {
        console.error("Error fetching data:", error);
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

async function searchStudent(query) {
    const resultElement = document.getElementById("result");
    query = query.trim().toLowerCase();

    if (!query) {
        resultElement.innerHTML = "<p>Please enter a name or seat number.</p>";
        return;
    }

    const data = await fetchExcelData();
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
                sem1G: row[28],
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
        <div><strong>Semester 1:</strong> ${student.sem1G}</div>
        <button onclick='showStudentDetails(${JSON.stringify(student.fullData)})'>View Details</button>
        <hr>
    `).join("");
}


function showStudentDetails(studentData) {
    const resultElement = document.getElementById("result");

    const studentInfo = {
        rank: studentData[1], 
        seatNumber: studentData[2], 
        fullName: studentData[3],
        sem1G: studentData[28],
        practicalAnatomy: studentData[4],
        practicalDataShow: studentData[5],
        totalPractical: studentData[6],
        bioActivity: studentData[7],
        anatomyActivity: studentData[8],
        physioActivity: studentData[9],
        histoActivity: studentData[10],
        activities: studentData[12],
        end: studentData[11],
        endPlusActivities: studentData[13],
        foundation1: studentData[14],
        spotPatho: studentData[16],
        practicalDataShow2: studentData[17],
        totalPractical2: studentData[18],
        paraActivity: studentData[20],
        microActivity: studentData[21],
        pharmaActivity: studentData[22],
        pathoActivity: studentData[23],
        activities2: studentData[24],
        end2: studentData[19],
        endPlusActivities2: studentData[25],
        foundation2: studentData[26],
    };

    resultElement.innerHTML = `
        <hr>
        <div><strong>Name:</strong> ${studentInfo.fullName}</div>
        <div><strong>Seat Number:</strong> ${studentInfo.seatNumber}</div>
        <div><strong>Rank:</strong> ${studentInfo.rank}</div>
        <div><strong>Semester 1:</strong> ${studentInfo.sem1G}</div>
        <hr>
        <div id="mainTitle" style="text-align:center; font-size:24px; font-weight:bold; margin-bottom:10px;">Student Grades</div>
        <div id="gradesTable"></div>
        <div style="display: flex; justify-content: center; align-items: center; margin-top: 10px;">
            <button onclick="prevModule()">←</button>
            <div id="moduleTitle" style="margin: 0 15px; font-size: 18px; font-weight: bold;">Foundation 1 Grades</div>
            <button onclick="nextModule()">→</button>
        </div>
    `;

    const modules = [
        {
            title: "Foundation 1 Grades",
            subtitle: "1st Year",
            subjects: [
                "Practical Anatomy", "Practical Data Show", "Total Practical",
                "Bio Activity", "Anatomy Activity", "Physio Activity", "Histo Activity",
                "Activities", "End", "End + Activities", "Foundation 1"
            ],
            maxScores: [18, 36, 54, 6, 6, 3, 3, 18, 36, 54, 108],  
            minScores: [9, 18, 27, 3, 3, 1.5, 1.5, 9, 18, 27, 54],
            startIndex: 4
        },
        {
            title: "Foundation 2 Grades",
            subtitle: "1st Year",
            subjects: [
                "Spot Patho", "Practical Data Show", "Total Practical",
                "Para Activity", "Micro Activity", "Pharma Activity",
                "Patho Activity", "Activities", "End", "End + Activities",
                "Foundation 2"
            ],
            maxScores: [2, 45.25, 47.25, 3.6, 5.1, 3.9, 3.15, 15.75, 31.5, 47.25, 94.5],  
            minScores: [1, 22.625, 23.625, 1.8, 2.55, 1.95, 1.575, 7.875, 15.75, 23.625, 47.25],
            startIndex: 15
        },
        {
            title: "MSK Grades",
            subtitle: "1st Year",
            subjects: [
                "Prac", "Practical Data Show", "Total Practical",
                "Anatomy Activity", "Biochemistry Activity", "Histo Activity",
                "Physio Activity", "Patho Activity", "Activities", "End", "End + Activities",
                "MSK"
            ],
            maxScores: [2, 45.25, 47.25, 3.6, 5.1, 3.9, 3.15, 15.75, 31.5, 47.25, 20, 94.5],  
            minScores: [1, 22.625, 23.625, 1.8, 2.55, 1.95, 1.575, 7.875, 15.75, 23.625, 10, 47.25],
            startIndex: 29
        },
        {
            title: "CVS Grades",
            subtitle: "1st Year",
            subjects: [
                "Prac", "Practical Data Show", "Total Practical",
                "Anatomy Activity", "Biochemistry Activity", "Histo Activity",
                "Physio Activity", "Patho Activity", "Activities", "End", "End + Activities",
                "CVS"
            ],
            maxScores: [2, 45.25, 47.25, 3.6, 5.1, 3.9, 3.15, 15.75, 31.5, 47.25, 20, 94.5],  
            minScores: [1, 22.625, 23.625, 1.8, 2.55, 1.95, 1.575, 7.875, 15.75, 23.625, 10, 47.25],
            startIndex: 39
        }
        
    ];

    let currentModuleIndex = 0;

    function renderModule() {
        const module = modules[currentModuleIndex];
        document.getElementById("moduleTitle").innerText = module.title;
        document.getElementById("gradesTable").innerHTML = createTable(
            module.title,
            module.subjects,
            module.startIndex,
            module.maxScores,
            module.minScores
        );
    }

    function createTable(title, subjects, startIndex, maxScores, minScores) {
        let tableHTML = `<table border="1">
            <tr>
                <th>Subject</th>
                <th>Max Score</th>
                <th>Min Score</th>
                <th>Student Score</th>
                <th>Percentage</th>
                <th>Rating</th>
            </tr>
        `;

        for (let i = 0; i < subjects.length; i++) {
            let studentScore = studentInfo[Object.keys(studentInfo)[i + startIndex]] || 0;
            let percentage = ((studentScore / maxScores[i]) * 100).toFixed(2);
            let rating = "Fail";

            if (percentage >= 85) rating = "امتياز";
            else if (percentage >= 75) rating = "جيد جدًا";
            else if (percentage >= 65) rating = "جيد";
            else if (percentage >= 55) rating = "مقبول";

            tableHTML += `<tr>
                <td>${subjects[i]}</td>
                <td>${maxScores[i]}</td>
                <td>${minScores[i]}</td>
                <td>${studentScore}</td>
                <td>${percentage}%</td>
                <td>${rating}</td>
            </tr>`;
        }

        return tableHTML + "</table>";
    }

    window.prevModule = () => {
        currentModuleIndex = (currentModuleIndex - 1 + modules.length) % modules.length;
        renderModule();
    };

    window.nextModule = () => {
        currentModuleIndex = (currentModuleIndex + 1) % modules.length;
        renderModule();
    };

    renderModule();
}
