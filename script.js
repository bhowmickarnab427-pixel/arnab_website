
document.addEventListener("DOMContentLoaded", function () {

    const loginPage = document.getElementById("loginPage");
    const signupPage = document.getElementById("signupPage");
    const resetPage = document.getElementById("resetPage");
    const dashboard = document.getElementById("namePage");

    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const resetForm = document.getElementById("resetForm");
    const messageForm = document.getElementById("messageForm");
    const taskForm = document.getElementById("premiumTaskForm");

    const loginMessage = document.getElementById("loginMessage");
    const signupMessage = document.getElementById("signupMessage");
    const resetMessage = document.getElementById("resetMessage");
    const messageStatus = document.getElementById("messageStatus");

    const loginUsername = document.getElementById("loginUsername");
    const loginPassword = document.getElementById("loginPassword");
    const signupUsername = document.getElementById("signupUsername");
    const signupPassword = document.getElementById("signupPassword");
    const resetUsername = document.getElementById("resetUsername");
    const resetPassword = document.getElementById("resetPassword");

    const themeButton = document.getElementById("themeButton");
    const logoutButton = document.getElementById("logoutButton");

    const displayName = document.getElementById("displayName");
    const displayName2 = document.getElementById("displayName2");
    const greetingText = document.getElementById("greetingText");

    const liveClock = document.getElementById("liveClock");
    const liveDate = document.getElementById("liveDate");
    const notification = document.getElementById("notification");

    const profilePhoto = document.getElementById("profilePhoto");
    const profilePhotoPlaceholder =
        document.getElementById("profilePhotoPlaceholder");
    const profilePhotoInput = document.getElementById("profilePhotoInput");
    const removeProfilePhoto = document.getElementById("removeProfilePhoto");

    const taskInput = document.getElementById("premiumTaskInput");
    const taskList = document.getElementById("premiumTaskList");
    const taskCount = document.getElementById("premiumTaskCount");
    const progressFill = document.getElementById("premiumProgressFill");
    const progressPercent = document.getElementById("progressPercent");

    const userMessage = document.getElementById("userMessage");
    const toastContainer = document.getElementById("toastContainer");

    let currentUsername = "";
    let clockInterval = null;
    let toastTimer = null;
    let tasks = [];

    const STORAGE_ACCOUNTS = "arnabAccounts";
    const STORAGE_THEME = "arnabTheme";

    function showPage(page) {
        [loginPage, signupPage, resetPage, dashboard].forEach(function (item) {
            item.classList.add("hidden");
        });

        page.classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function showToast(message, type) {
        if (!toastContainer) return;

        if (toastTimer) clearTimeout(toastTimer);

        toastContainer.replaceChildren();

        const toast = document.createElement("div");
        toast.className = "toast";

        if (type === "error") toast.classList.add("error");

        toast.textContent = message;
        toastContainer.appendChild(toast);

        toastTimer = setTimeout(function () {
            toast.remove();
        }, 3000);
    }

    function showFormMessage(element, message, isError) {
        if (!element) return;

        element.textContent = message;
        element.style.color = isError ? "#fca5a5" : "#86efac";
    }

    function getAccounts() {
        try {
            const accounts = JSON.parse(
                localStorage.getItem(STORAGE_ACCOUNTS) || "[]"
            );

            return Array.isArray(accounts) ? accounts : [];
        } catch (error) {
            return [];
        }
    }

    function saveAccounts(accounts) {
        localStorage.setItem(
            STORAGE_ACCOUNTS,
            JSON.stringify(accounts)
        );
    }

    function normaliseUsername(username) {
        return username.trim().toLowerCase();
    }

    function getAccount() {
        return getAccounts().find(function (account) {
            return normaliseUsername(account.username) ===
                normaliseUsername(currentUsername);
        });
    }

    /* PASSWORD EYE ICON */

    document.querySelectorAll(".eye-button").forEach(function (button) {
        button.addEventListener("click", function () {
            const inputId = button.getAttribute("data-password");
            const passwordInput = document.getElementById(inputId);

            if (!passwordInput) return;

            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                button.textContent = "🙈";
                button.setAttribute("aria-label", "Hide password");
            } else {
                passwordInput.type = "password";
                button.textContent = "👁";
                button.setAttribute("aria-label", "Show password");
            }
        });
    });

    /* SIGN UP */

    document.getElementById("signupButton").addEventListener("click", function () {
        signupForm.reset();
        showFormMessage(signupMessage, "", false);
        showPage(signupPage);
    });

    document.getElementById("backButton").addEventListener("click", function () {
        showFormMessage(loginMessage, "", false);
        showPage(loginPage);
    });

    signupForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = signupUsername.value.trim();
        const password = signupPassword.value;

        if (username.length < 3) {
            showFormMessage(
                signupMessage,
                "Username must contain at least 3 characters.",
                true
            );
            return;
        }

        if (password.length < 6) {
            showFormMessage(
                signupMessage,
                "Password must contain at least 6 characters.",
                true
            );
            return;
        }

        const accounts = getAccounts();

        const existingAccount = accounts.some(function (account) {
            return normaliseUsername(account.username) ===
                normaliseUsername(username);
        });

        if (existingAccount) {
            showFormMessage(
                signupMessage,
                "This username already exists. Please login.",
                true
            );
            return;
        }

        accounts.push({
            username: username,
            password: password
        });

        try {
            saveAccounts(accounts);
        } catch (error) {
            showFormMessage(
                signupMessage,
                "Unable to save account in this browser.",
                true
            );
            return;
        }

        signupForm.reset();
        loginUsername.value = username;

        showPage(loginPage);
        showFormMessage(
            loginMessage,
            "Account created successfully! Please login.",
            false
        );

        showToast("Account created successfully!");
    });

    /* LOGIN */

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = loginUsername.value.trim();
        const password = loginPassword.value;

        const account = getAccounts().find(function (item) {
            return normaliseUsername(item.username) ===
                normaliseUsername(username) &&
                item.password === password;
        });

        if (!account) {
            showFormMessage(
                loginMessage,
                "Incorrect username or password.",
                true
            );
            return;
        }

        currentUsername = account.username;
        loginPassword.value = "";
        showFormMessage(loginMessage, "", false);

        loadDashboard();
        showPage(dashboard);
        showToast("Welcome back, " + currentUsername + "!");
    });

    /* FORGOT PASSWORD */

    document.getElementById("forgotPasswordButton")
        .addEventListener("click", function () {
            resetForm.reset();
            showFormMessage(resetMessage, "", false);
            showPage(resetPage);
        });

    document.getElementById("resetBackButton")
        .addEventListener("click", function () {
            showFormMessage(loginMessage, "", false);
            showPage(loginPage);
        });

    resetForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = resetUsername.value.trim();
        const newPassword = resetPassword.value;

        if (newPassword.length < 6) {
            showFormMessage(
                resetMessage,
                "Password must contain at least 6 characters.",
                true
            );
            return;
        }

        const accounts = getAccounts();

        const accountIndex = accounts.findIndex(function (account) {
            return normaliseUsername(account.username) ===
                normaliseUsername(username);
        });

        if (accountIndex === -1) {
            showFormMessage(resetMessage, "Username not found.", true);
            return;
        }

        accounts[accountIndex].password = newPassword;

        try {
            saveAccounts(accounts);
        } catch (error) {
            showFormMessage(
                resetMessage,
                "Could not save the new password.",
                true
            );
            return;
        }

        resetForm.reset();
        loginUsername.value = username;
        showPage(loginPage);

        showFormMessage(
            loginMessage,
            "Password updated. You can login now.",
            false
        );

        showToast("Password updated successfully!");
    });

    /* GREETING */

    function updateGreeting() {
        const hour = new Date().getHours();
        let greeting = "";

        if (hour < 12) {
            greeting = "Good Morning";
        } else if (hour < 17) {
            greeting = "Good Afternoon";
        } else if (hour < 21) {
            greeting = "Good Evening";
        } else {
            greeting = "Good Night";
        }

        if (displayName2) {
            displayName2.textContent =
                greeting + ", " + currentUsername + "!";
        }

        if (greetingText) {
            greetingText.textContent =
                "Keep learning, stay focused, and make today count.";
        }
    }

    /* LIVE CLOCK AND DATE */

    function updateClock() {
        const now = new Date();

        if (liveClock) {
            liveClock.textContent = now.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true
            });
        }

        if (liveDate) {
            liveDate.textContent = now.toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            });
        }

        updateGreeting();
    }

    /* EACH USER'S PROFILE PHOTO */

    function photoStorageKey() {
        return "arnabProfilePhoto_" + normaliseUsername(currentUsername);
    }

    function loadProfilePhoto() {
        if (!currentUsername) return;

        const savedPhoto = localStorage.getItem(photoStorageKey());

        if (savedPhoto) {
            profilePhoto.src = savedPhoto;
            profilePhoto.classList.remove("hidden");
            profilePhotoPlaceholder.classList.add("hidden");
        } else {
            profilePhoto.removeAttribute("src");
            profilePhoto.classList.add("hidden");
            profilePhotoPlaceholder.classList.remove("hidden");
            profilePhotoPlaceholder.textContent =
                currentUsername.charAt(0).toUpperCase();
        }
    }

    profilePhotoInput.addEventListener("change", function () {
        const file = profilePhotoInput.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            showToast("Please select an image file.", "error");
            profilePhotoInput.value = "";
            return;
        }

        if (file.size > 1024 * 1024) {
            showToast("Image must be smaller than 1 MB.", "error");
            profilePhotoInput.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = function () {
            try {
                localStorage.setItem(photoStorageKey(), reader.result);
                loadProfilePhoto();
                showToast("Profile photo updated!");
            } catch (error) {
                showToast(
                    "Photo could not be saved. Try a smaller image.",
                    "error"
                );
            }

            profilePhotoInput.value = "";
        };

        reader.onerror = function () {
            showToast("Could not read this image.", "error");
            profilePhotoInput.value = "";
        };

        reader.readAsDataURL(file);
    });

    removeProfilePhoto.addEventListener("click", function () {
        localStorage.removeItem(photoStorageKey());
        loadProfilePhoto();
        showToast("Profile photo removed.");
    });

    /* DARK AND LIGHT THEME */

    function applyTheme() {
        const savedTheme = localStorage.getItem(STORAGE_THEME);
        const lightMode = savedTheme === "light";

        document.body.classList.toggle("light-mode", lightMode);

        themeButton.textContent = lightMode
            ? "🌙 Dark Mode"
            : "☀️ Light Mode";
    }

    themeButton.addEventListener("click", function () {
        const isLight = document.body.classList.toggle("light-mode");

        localStorage.setItem(
            STORAGE_THEME,
            isLight ? "light" : "dark"
        );

        themeButton.textContent = isLight
            ? "🌙 Dark Mode"
            : "☀️ Light Mode";

        showToast(isLight ? "Light mode enabled." : "Dark mode enabled.");
    });

    /* DAILY TASKS */

    function getTodayKey() {
        const date = new Date();

        const dateString = [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");

        return "arnabDailyTasks_" +
            normaliseUsername(currentUsername) + "_" + dateString;
    }

    function loadTasks() {
        try {
            const savedTasks = JSON.parse(
                localStorage.getItem(getTodayKey()) || "[]"
            );

            tasks = Array.isArray(savedTasks) ? savedTasks : [];
        } catch (error) {
            tasks = [];
        }
    }

    function saveTasks() {
        try {
            localStorage.setItem(getTodayKey(), JSON.stringify(tasks));
            return true;
        } catch (error) {
            showToast("Unable to save tasks in this browser.", "error");
            return false;
        }
    }

    function renderTasks() {
        taskList.replaceChildren();

        let completedCount = 0;

        tasks.forEach(function (task, index) {
            if (task.done) completedCount++;

            const row = document.createElement("div");
            row.className = "task-row";

            if (task.done) row.classList.add("completed");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "task-checkbox";
            checkbox.checked = task.done;
            checkbox.setAttribute("aria-label", "Mark task as complete");

            const taskContent = document.createElement("div");
            taskContent.className = "task-content";

            const taskText = document.createElement("span");
            taskText.className = "task-text";
            taskText.textContent = task.text;

            const taskMeta = document.createElement("small");
            taskMeta.className = "task-meta";

            const taskDate = task.createdAt
                ? new Date(task.createdAt)
                : new Date();

            taskMeta.textContent = "🕒 " +
                taskDate.toLocaleDateString(undefined, {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }) + " · " +
                taskDate.toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit"
                });

            taskContent.appendChild(taskText);
            taskContent.appendChild(taskMeta);

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "task-delete";
            deleteButton.textContent = "Delete";

            checkbox.addEventListener("change", function () {
                tasks[index].done = checkbox.checked;
                saveTasks();
                renderTasks();

                if (checkbox.checked) {
                    showToast("Task completed! 🎉");
                }
            });

            deleteButton.addEventListener("click", function () {
                tasks.splice(index, 1);
                saveTasks();
                renderTasks();
                showToast("Task deleted.");
            });

            row.appendChild(checkbox);
            row.appendChild(taskContent);
            row.appendChild(deleteButton);
            taskList.appendChild(row);
        });

        if (tasks.length === 0) {
            const emptyText = document.createElement("p");
            emptyText.className = "empty-tasks";
            emptyText.textContent =
                "No tasks yet. Add your first task above!";
            taskList.appendChild(emptyText);
        }

        const percentage = tasks.length === 0
            ? 0
            : Math.round((completedCount / tasks.length) * 100);

        taskCount.textContent =
            completedCount + " of " + tasks.length + " tasks completed";

        progressFill.style.width = percentage + "%";
        progressFill.setAttribute("role", "progressbar");
        progressFill.setAttribute("aria-valuemin", "0");
        progressFill.setAttribute("aria-valuemax", "100");
        progressFill.setAttribute("aria-valuenow", String(percentage));

        progressPercent.textContent = percentage + "%";
    }

    taskForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const value = taskInput.value.trim();

        if (!value) {
            showToast("Please enter a task.", "error");
            return;
        }

        tasks.push({
            text: value,
            done: false,
            createdAt: new Date().toISOString()
        });

        if (saveTasks()) {
            renderTasks();
            taskInput.value = "";
            showToast("New task added!");
        } else {
            tasks.pop();
            renderTasks();
        }
    });

    /* PERSONAL NOTES */

    function noteStorageKey() {
        return "arnabPersonalNote_" + normaliseUsername(currentUsername);
    }

    function loadNote() {
        userMessage.value =
            localStorage.getItem(noteStorageKey()) || "";
    }

    messageForm.addEventListener("submit", function (event) {
        event.preventDefault();

        try {
            localStorage.setItem(noteStorageKey(), userMessage.value);

            showFormMessage(
                messageStatus,
                "Your note has been saved in this browser.",
                false
            );

            showToast("Personal note saved!");
        } catch (error) {
            showFormMessage(
                messageStatus,
                "Could not save your note.",
                true
            );
        }
    });

    /* LOAD DASHBOARD */

    function loadDashboard() {
        const account = getAccount();

        if (!account) {
            showPage(loginPage);
            return;
        }

        currentUsername = account.username;
        displayName.textContent = currentUsername;

        if (displayName2) {
            displayName2.textContent = "Hello, " + currentUsername + "!";
        }

        if (notification) {
            notification.textContent =
                "You are logged in as " + currentUsername + ".";
        }

        if (clockInterval) clearInterval(clockInterval);

        updateClock();
        clockInterval = setInterval(updateClock, 1000);

        loadProfilePhoto();
        loadTasks();
        renderTasks();
        loadNote();

        const footerYear = document.getElementById("footerYear");

        if (footerYear) {
            footerYear.textContent = new Date().getFullYear();
        }
    }

    /* LOG OUT */

    logoutButton.addEventListener("click", function () {
        if (clockInterval) {
            clearInterval(clockInterval);
            clockInterval = null;
        }

        currentUsername = "";
        tasks = [];

        loginForm.reset();
        signupForm.reset();
        resetForm.reset();
        messageForm.reset();
        taskForm.reset();

        showFormMessage(loginMessage, "", false);
        showFormMessage(signupMessage, "", false);
        showFormMessage(resetMessage, "", false);
        showFormMessage(messageStatus, "", false);

        showPage(loginPage);
        showToast("You have logged out.");
    });

    applyTheme();
    showPage(loginPage);
});
