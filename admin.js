document.addEventListener("DOMContentLoaded", function () {
    const token = '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'; // Replace with your GitHub token
    const repoOwner = 'ZeyadMElghanam19'; // GitHub username
    const repoName = 'GradesPortal'; // Repository name
    const filePath = 'config.json'; // Config file path

    const yearSelect = document.getElementById("adminyearSelect");
    const moduleSelect = document.getElementById("adminmoduleSelect");

    const modifyYearPopup = document.getElementById("modifyYearPopup");
    const modifyYearBtn = document.getElementById("ModifyYearBtn");
    const saveModifyYearBtn = document.getElementById("saveModifyYear");
    const cancelModifyYearBtn = document.getElementById("cancelModifyYear");

    const modifyYearTitle = document.getElementById("modifyYearTitle");
    const modifySheetID = document.getElementById("modifySheetID");
    const modifySheetName = document.getElementById("modifySheetName");

    const modifyModulePopup = document.getElementById("modifyModulePopup");
    const modifyModuleBtn = document.getElementById("modifyModuleBtn");
    const saveModifyModuleBtn = document.getElementById("saveModifyModule");
    const cancelModifyModuleBtn = document.getElementById("cancelModifyModule");

    const modifyModuleTitle = document.getElementById("modifyModuleTitle");
    const modifyModuleSubjects = document.getElementById("modifyModuleSubjects");
    const modifyMaxScores = document.getElementById("modifyMaxScores");
    const modifyMinScores = document.getElementById("modifyMinScores");
    const modifyIndexes = document.getElementById("modifyIndexes");

    modifyYearPopup.style.display = "none"; // Hide popups initially
    modifyModulePopup.style.display = "none";

    let currentSha = ""; // Store latest SHA for updating the file

    async function fetchConfig() {
        try {
            const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
                method: 'GET',
                headers: { 'Authorization': `token ${token}` }
            });

            if (!response.ok) {
                console.error("GitHub API Error:", response.status);
                alert("Error fetching config.json");
                return null;
            }

            const data = await response.json();
            if (data.content) {
                currentSha = data.sha; // Store SHA for future updates
                return JSON.parse(atob(data.content)); // Decode Base64 content
            }
            return null;
        } catch (error) {
            console.error("Fetch Config Error:", error);
            alert("Failed to fetch config.json");
            return null;
        }
    }

    async function updateConfig(newConfigData) {
        try {
            const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Update config.json',
                    content: btoa(JSON.stringify(newConfigData, null, 2)), // Encode to Base64
                    sha: currentSha // Use latest SHA
                })
            });

            if (!response.ok) {
                console.error("GitHub API Update Error:", response.status);
                alert("Failed to update config.json");
                return null;
            }

            const data = await response.json();
            console.log('File updated:', data);
            alert("Update successful!");
            return data;
        } catch (error) {
            console.error("Update Config Error:", error);
            alert("Error updating config.json");
            return null;
        }
    }

    async function populateAdminYearDropdown() {
        const config = await fetchConfig();
        if (!config) return;

        yearSelect.innerHTML = "";
        Object.keys(config).forEach(year => {
            const option = document.createElement("option");
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });

        if (yearSelect.options.length > 0) {
            yearSelect.value = yearSelect.options[0].value;
            updateModules(); // Populate modules for the first year
        }
    }

    async function updateModules() {
        const config = await fetchConfig();
        const selectedYear = yearSelect.value;
        moduleSelect.innerHTML = "";

        if (config[selectedYear] && Array.isArray(config[selectedYear].modules)) {
            config[selectedYear].modules.forEach(module => {
                const option = document.createElement("option");
                option.value = module.title;
                option.textContent = module.title;
                moduleSelect.appendChild(option);
            });
        } else {
            moduleSelect.innerHTML = "<option>No modules available</option>";
        }
    }

    async function getModuleData(year, moduleTitle) {
        const config = await fetchConfig();
        if (config[year] && Array.isArray(config[year].modules)) {
            return config[year].modules.find(m => m.title === moduleTitle);
        }
        return null;
    }

    async function getYearData(year) {
        const config = await fetchConfig();
        return config[year] || null;
    }

    modifyYearBtn.addEventListener("click", async function () {
        const selectedYear = yearSelect.value;
        if (!selectedYear) {
            alert("Please select a year first.");
            return;
        }

        const yearData = await getYearData(selectedYear);

        if (!yearData) {
            alert("Year not found.");
            return;
        }

        modifyYearTitle.value = selectedYear;
        modifySheetID.value = yearData.sheetID;
        modifySheetName.value = yearData.sheetName;

        modifyYearPopup.style.display = "flex"; // Show popup
    });

    cancelModifyYearBtn.addEventListener("click", function () {
        modifyYearPopup.style.display = "none"; // Hide popup on cancel
    });

    saveModifyYearBtn.addEventListener("click", async function () {
        const selectedYear = yearSelect.value;
        if (!selectedYear) {
            alert("Please select a year first.");
            return;
        }

        const config = await fetchConfig();
        if (!config[selectedYear]) {
            alert("Year not found.");
            return;
        }

        // Update year data
        const newYearTitle = modifyYearTitle.value.trim();
        if (newYearTitle !== selectedYear) {
            config[newYearTitle] = { ...config[selectedYear] };
            delete config[selectedYear];
        }
        config[newYearTitle].sheetID = modifySheetID.value.trim();
        config[newYearTitle].sheetName = modifySheetName.value.trim();

        await updateConfig(config);
        modifyYearPopup.style.display = "none";
        alert(`Year "${newYearTitle}" updated successfully!`);
        populateAdminYearDropdown();
    });

    modifyModuleBtn.addEventListener("click", async function () {
        const selectedYear = yearSelect.value;
        const selectedModuleTitle = moduleSelect.value;

        if (!selectedYear || !selectedModuleTitle) {
            alert("Please select a year and module first.");
            return;
        }

        const moduleData = await getModuleData(selectedYear, selectedModuleTitle);

        if (!moduleData) {
            alert("Module not found.");
            return;
        }

        modifyModuleTitle.value = moduleData.title;
        modifyModuleSubjects.value = moduleData.subjects.join(", ");
        modifyMaxScores.value = moduleData.maxScores.join(", ");
        modifyMinScores.value = moduleData.minScores.join(", ");
        modifyIndexes.value = moduleData.indexes.join(", ");

        modifyModulePopup.style.display = "flex"; // Show popup
    });

    cancelModifyModuleBtn.addEventListener("click", function () {
        modifyModulePopup.style.display = "none"; // Hide popup on cancel
    });

    saveModifyModuleBtn.addEventListener("click", async function () {
        const selectedYear = yearSelect.value;
        const selectedModuleTitle = moduleSelect.value;

        if (!selectedYear || !selectedModuleTitle) {
            alert("Please select a year and module first.");
            return;
        }

        const config = await fetchConfig();
        const moduleIndex = config[selectedYear].modules.findIndex(m => m.title === selectedModuleTitle);

        if (moduleIndex === -1) {
            alert("Module not found.");
            return;
        }

        config[selectedYear].modules[moduleIndex] = {
            title: modifyModuleTitle.value.trim(),
            subjects: modifyModuleSubjects.value.split(",").map(s => s.trim()),
            maxScores: modifyMaxScores.value.split(",").map(Number),
            minScores: modifyMinScores.value.split(",").map(Number),
            indexes: modifyIndexes.value.split(",").map(Number),
        };

        await updateConfig(config);
        modifyModulePopup.style.display = "none";
        alert(`Module "${modifyModuleTitle.value}" updated successfully!`);
        updateModules();
    });

    addYearBtn.addEventListener("click", async function () {
        const config = await fetchConfig();
        if (!config) return;

        const selectedYear = yearSelect.value;
        const newYear = prompt("Enter new year name (e.g., MFM 45):");
        if (!newYear || config[newYear]) {
            alert("Invalid year name or it already exists.");
            return;
        }

        const newYearData = {
            sheetID: "NewSheetID",
            sheetName: "NewSheetName",
            modules: []
        };

        const configEntries = Object.entries(config);
        const newConfig = {};

        configEntries.forEach(([year, data]) => {
            if (year === selectedYear) newConfig[newYear] = newYearData; // Insert before
            newConfig[year] = data;
        });

        await updateConfig(newConfig);
        populateAdminYearDropdown();
    });

    deleteYearBtn.addEventListener("click", async function () {
        const config = await fetchConfig();
        if (!config) return;

        const selectedYear = yearSelect.value;
        if (!selectedYear) {
            alert("Please select a year.");
            return;
        }

        if (!confirm(`Are you sure you want to delete the year "${selectedYear}"? This will remove all its modules!`)) {
            return;
        }

        delete config[selectedYear];
        await updateConfig(config);
        populateAdminYearDropdown();
    });

    addModuleBtn.addEventListener("click", async function () {
        const config = await fetchConfig();
        if (!config) return;

        const selectedYear = yearSelect.value;
        if (!selectedYear || !config[selectedYear]) {
            alert("Please select a valid year.");
            return;
        }

        const newModuleTitle = prompt("Enter new module name:");
        if (!newModuleTitle) {
            alert("Module name cannot be empty.");
            return;
        }

        const newModuleData = {
            title: newModuleTitle,
            subjects: ["Subject1", "Subject2"],
            maxScores: [100, 100],
            minScores: [50, 50],
            indexes: [1, 2]
        };

        const modules = config[selectedYear].modules;
        const selectedModuleIndex = moduleSelect.selectedIndex;
        modules.splice(selectedModuleIndex, 0, newModuleData); // Insert before selected module

        await updateConfig(config);
        updateModules();
    });

    deleteModuleBtn.addEventListener("click", async function () {
        const config = await fetchConfig();
        if (!config) return;

        const selectedYear = yearSelect.value;
        const selectedModuleTitle = moduleSelect.value;

        if (!selectedYear || !selectedModuleTitle) {
            alert("Please select a year and module.");
            return;
        }

        if (!confirm(`Are you sure you want to delete the module "${selectedModuleTitle}"?`)) {
            return;
        }

        const modules = config[selectedYear].modules;
        const moduleIndex = modules.findIndex(m => m.title === selectedModuleTitle);
        if (moduleIndex !== -1) {
            modules.splice(moduleIndex, 1);
        }

        await updateConfig(config);
        updateModules();
    });

    yearSelect.addEventListener("change", updateModules);
    
    populateAdminYearDropdown();
});
