document.addEventListener("DOMContentLoaded", function () {
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
            throw new Error('Failed to fetch config from GitHub');
        }

        const data = await response.json();
        const content = atob(data.content); // Decode the base64 content of the file
        return JSON.parse(content); // Return the JSON object
    }

    async function updateConfigOnGitHub(updatedConfig) {
        const token = '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'; // Use a secure method to handle the token
        const repoOwner = 'ZeyadMElghanam19';
        const repoName = 'GradesPortal';
        const filePath = 'config.json';

        // Base64 encode the updated config
        const content = btoa(JSON.stringify(updatedConfig));

        const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: 'Updating config.json',
                content: content,
                sha: updatedConfig.sha, // Get the sha of the existing file to update it
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to update config on GitHub');
        }

        const data = await response.json();
        console.log('Config updated successfully:', data);
    }

    function populateAdminYearDropdown(config) {
        const yearSelect = document.getElementById("adminyearSelect");
        yearSelect.innerHTML = "";

        if (!config || Object.keys(config).length === 0) {
            console.error("No years found in config.");
            return;
        }

        Object.keys(config).forEach(year => {
            const option = document.createElement("option");
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });

        if (yearSelect.options.length > 0) {
            yearSelect.value = yearSelect.options[0].value;
        }
    }

    async function loadConfig() {
        try {
            const config = await fetchConfigFromGitHub();
            console.log("Config data loaded:", config);

            // Populate year dropdown
            populateAdminYearDropdown(config);

            const yearSelect = document.getElementById("adminyearSelect");
            const moduleSelect = document.getElementById("adminmoduleSelect");

            yearSelect.addEventListener("change", () => updateModules(config));

            function updateModules(config) {
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
                    const noModuleOption = document.createElement("option");
                    noModuleOption.textContent = "No modules available";
                    moduleSelect.appendChild(noModuleOption);
                }
            }

            updateModules(config); // Initial population of modules

            // Edit module logic
            const modifyModuleBtn = document.getElementById("modifyModuleBtn");
            const modifyModulePopup = document.getElementById("modifyModulePopup");
            const modifyModuleTitle = document.getElementById("modifyModuleTitle");
            const modifyModuleSubjects = document.getElementById("modifyModuleSubjects");
            const modifyMaxScores = document.getElementById("modifyMaxScores");
            const modifyMinScores = document.getElementById("modifyMinScores");
            const modifyIndexes = document.getElementById("modifyIndexes");
            const saveModifyModuleBtn = document.getElementById("saveModifyModule");
            const cancelModifyModuleBtn = document.getElementById("cancelModifyModule");

            modifyModulePopup.style.display = "none"; // Hide popup initially

            modifyModuleBtn.addEventListener("click", function () {
                const selectedYear = yearSelect.value;
                const selectedModuleTitle = moduleSelect.value;

                if (!selectedYear || !selectedModuleTitle) {
                    alert("Please select a year and module first.");
                    return;
                }

                const moduleData = config[selectedYear]?.modules.find(m => m.title === selectedModuleTitle);

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

                const moduleIndex = config[selectedYear].modules.findIndex(m => m.title === selectedModuleTitle);

                if (moduleIndex === -1) {
                    alert("Module not found.");
                    return;
                }

                // Update config
                config[selectedYear].modules[moduleIndex] = {
                    title: modifyModuleTitle.value.trim(),
                    subjects: modifyModuleSubjects.value.split(",").map(s => s.trim()),
                    maxScores: modifyMaxScores.value.split(",").map(Number),
                    minScores: modifyMinScores.value.split(",").map(Number),
                    indexes: modifyIndexes.value.split(",").map(Number),
                };

                modifyModulePopup.style.display = "none"; // Hide the popup after saving

                alert(`Module "${modifyModuleTitle.value}" updated successfully!`);
                updateModules(config); // Refresh dropdown to reflect changes

                // Update the config on GitHub
                updateConfigOnGitHub(config);
            });
        } catch (error) {
            console.error("Error loading config:", error);
        }
    }

    loadConfig();
});
