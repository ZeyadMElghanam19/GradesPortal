document.addEventListener("DOMContentLoaded", function () {
    function populateAdminYearDropdown() {
        const yearSelect = document.getElementById("adminyearSelect");
        yearSelect.innerHTML = ""; 

        if (!window.config || Object.keys(window.config).length === 0) {
            console.error("No years found in config.");
            return;
        }

        Object.keys(window.config).forEach(year => {
            const option = document.createElement("option");
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });

        if (yearSelect.options.length > 0) {
            yearSelect.value = yearSelect.options[0].value;
        }
    }

    populateAdminYearDropdown();

    if (!window.config) {
        console.error("Config data not found. Ensure script.js is loaded first.");
        return;
    }

    console.log("Config data loaded:", window.config);

    const yearSelect = document.getElementById("adminyearSelect");
    const moduleSelect = document.getElementById("adminmoduleSelect");

    const modifyModulePopup = document.getElementById("modifyModulePopup");
    const modifyModuleBtn = document.getElementById("modifyModuleBtn");
    const saveModifyModuleBtn = document.getElementById("saveModifyModule");
    const cancelModifyModuleBtn = document.getElementById("cancelModifyModule");

    const modifyModuleTitle = document.getElementById("modifyModuleTitle");
    const modifyModuleSubjects = document.getElementById("modifyModuleSubjects");
    const modifyMaxScores = document.getElementById("modifyMaxScores");
    const modifyMinScores = document.getElementById("modifyMinScores");
    const modifyIndexes = document.getElementById("modifyIndexes");

    modifyModulePopup.style.display = "none"; // Hide popup initially

    function updateModules() {
        const selectedYear = yearSelect.value;
        moduleSelect.innerHTML = "";

        if (window.config[selectedYear] && Array.isArray(window.config[selectedYear].modules)) {
            window.config[selectedYear].modules.forEach(module => {
                const option = document.createElement("option");
                option.value = module.title;
                option.textContent = module.title;
                moduleSelect.appendChild(option);
            });
        } else {
            const noModuleOption = document.createElement("option");
            noModuleOption.textContent = "No modules available";
            moduleSelect.appendChild(noModuleOption);
        }
    }

    yearSelect.addEventListener("change", updateModules);
    updateModules();

    modifyModuleBtn.addEventListener("click", function () {
        const selectedYear = yearSelect.value;
        const selectedModuleTitle = moduleSelect.value;

        if (!selectedYear || !selectedModuleTitle) {
            alert("Please select a year and module first.");
            return;
        }

        const moduleData = window.config[selectedYear]?.modules.find(m => m.title === selectedModuleTitle);

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

    saveModifyModuleBtn.addEventListener("click", function () {
        const selectedYear = yearSelect.value;
        const selectedModuleTitle = moduleSelect.value;

        if (!selectedYear || !selectedModuleTitle) {
            alert("Please select a year and module first.");
            return;
        }

        const moduleIndex = window.config[selectedYear].modules.findIndex(m => m.title === selectedModuleTitle);

        if (moduleIndex === -1) {
            alert("Module not found.");
            return;
        }

        // Update config
        window.config[selectedYear].modules[moduleIndex] = {
            title: modifyModuleTitle.value.trim(),
            subjects: modifyModuleSubjects.value.split(",").map(s => s.trim()),
            maxScores: modifyMaxScores.value.split(",").map(Number),
            minScores: modifyMinScores.value.split(",").map(Number),
            indexes: modifyIndexes.value.split(",").map(Number),
        };

        modifyModulePopup.style.display = "none"; // Hide the popup after saving

        alert(`Module "${modifyModuleTitle.value}" updated successfully!`);
        updateModules(); // Refresh dropdown to reflect changes
    });
});
