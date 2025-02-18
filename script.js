document.addEventListener("DOMContentLoaded", function () {
    let selectedYear = ''; // Declare at the top
    let currentModules = [];
    let currentModuleIndex = 0;

    // Fetch config from GitHub
    async function fetchConfigFromGitHub() {
        const token = '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'; // Use a secure method to handle the token
        const repoOwner = 'ZeyadMElghanam19';
        const repoName = 'GradesPortal';
        const filePath = 'config.json';

        const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `token ${token}`,
            },
        });

        if (!response.ok) {
            alert('Failed to fetch config from GitHub');
            throw new Error('Failed to fetch config from GitHub');
        }

        const data = await response.json();
        const content = atob(data.content); // Decode the base64 content of the file
        const config = JSON.parse(content); // Parse the JSON content
        alert("Config fetched successfully from GitHub");
        populateYearDropdown(config); // Populate the year dropdown after fetching config
    }

    // Populate year dropdown dynamically
    function populateYearDropdown(config) {
        const yearSelect = document.getElementById("yearSelect");
        yearSelect.innerHTML = "";

        if (!config || Object.keys(config).length === 0) {
            alert("No years found in config.");
            return;
        }
        
        // Add default placeholder option
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Your Year";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        yearSelect.appendChild(defaultOption);

        // Populate the dropdown with years from the config
        Object.keys(config).forEach(year => {
            const option = document.createElement("option");
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });

        if (yearSelect.options.length > 0) {
            yearSelect.value = yearSelect.options[0].value;
        }

        // Add change event listener to the year select dropdown
        yearSelect.addEventListener('change', (event) => {
            selectedYear = event.target.value;
            alert(`Selected Year: ${selectedYear}`); // Alert the selected year
            fetchExcelData(selectedYear); // Fetch data for the selected year
        });
      }

    // Fetch Excel data for the selected year
    async function fetchExcelData(selectedYear) {
        if (!selectedYear) {
            alert("Please select a year.");
            return;
        }

        Object.freeze(config); // Freeze the config object to avoid accidental changes
        year = year.trim();
        
        try {
            if (!config[selectedYear]) {
                alert("Invalid year selected.");
                return [];
            }

            const sheetID = config[selectedYear].sheetID;
            alert(sheetID);
            const sheetName = config[selectedYear].sheetName;
            currentModules = config[selectedYear].modules;
            currentModuleIndex = 0; // Reset module index when changing year
            const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
            alert(url);
            
            const response = await fetch(url);
            if (!response.ok) {
                alert("Failed to fetch data from Google Sheets.");
                throw new Error("Failed to fetch data from Google Sheets.");
            }

            const text = await response.text();
            const json = JSON.parse(text.substring(47, text.length - 2));

            return json.table.rows.map(row => row.c.map(cell => (cell ? cell.v : "")));
        } catch (error) {
            alert("Error fetching data: " + error.message);
            return [];
        }
    }

    // Normalize Arabic text
    function normalizeArabic(text) {
        return text
            .replace(/أ|إ|آ/g, "ا")
            .replace(/ة/g, "ه")
            .replace(/ى/g, "ي")
            .replace(/\s+/g, " ")
            .trim();
    }

    // Search for a student based on the query
    async function searchStudent(query, selectedYear) {
        const resultElement = document.getElementById("result");
        query = query.trim().toLowerCase();

        if (!query) {
            resultElement.innerHTML = "<p>Please enter a name or seat number.</p>";
            return;
        }

        const data = await fetchExcelData(year);
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

    // Show student details
    function showStudentDetails(studentData) {
        const resultElement = document.getElementById("result");

        studentInfo = { 
            rank: studentData[1], 
            seatNumber: studentData[2], 
            fullName: studentData[3] 
        };

        for (let i = 4; i < studentData.length; i++) {
            studentInfo[i] = studentData[i] || 0;
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

        renderModule(); 
    }

    // Render the selected module's grades
    function renderModule() {
        const module = config[selectedYear].modules[currentModuleIndex];
        document.getElementById("moduleTitle").innerText = module.title;
        document.getElementById("gradesTable").innerHTML = createTable(module);
    }

    // Create the table for grades
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

    // Go to the previous module
    window.prevModule = () => {
        currentModuleIndex = (currentModuleIndex - 1 + config[selectedYear].modules.length) % config[selectedYear].modules.length;
        renderModule();
    };

    // Go to the next module
    window.nextModule = () => {
        currentModuleIndex = (currentModuleIndex + 1) % config[selectedYear].modules.length;
        renderModule();
    };

    // Initialize by fetching config
    fetchConfigFromGitHub();
});
