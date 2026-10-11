
"use strict";

/* ==========================================
   ARNAB'S WEBSITE - COMPLETE JAVASCRIPT
   ========================================== */

const $ = (id) => document.getElementById(id);

const loginPage = $("loginPage");
const signupPage = $("signupPage");
const dashboardPage = $("dashboardPage");

const loginForm = $("loginForm");
const signupForm = $("signupForm");
const profileForm = $("profileForm");
const taskForm = $("taskForm");

const loginUsername = $("loginUsername");
const loginPassword = $("loginPassword");
const signupName = $("signupName");
const signupUsername = $("signupUsername");
const signupPassword = $("signupPassword");
const confirmPassword = $("confirmPassword");

const loginMessage = $("loginMessage");
const signupMessage = $("signupMessage");
const profileMessage = $("profileMessage");
const noteMessage = $("noteMessage");

const displayName = $("displayName");
const profileName = $("profileName");
const profileUsername = $("profileUsername");
const editName = $("editName");

const liveClock = $("liveClock");
const clockDate = $("clockDate");
const greeting = $("greeting");
const welcomeDate = $("welcomeDate");

const themeToggle = $("themeToggle");
const profilePhoto = $("profilePhoto");
const avatarFallback = $("avatarFallback");
const photoInput = $("photoInput");

const notificationList = $("notificationList");
const clearNotifications = $("clearNotifications");

const taskInput = $("taskInput");
const taskList = $("taskList");
const taskCount = $("taskCount");
const progressFill = $("progressFill");
const progressPercent = $("progressPercent");

const personalNote = $("personalNote");
const saveNoteButton = $("saveNote");
const toast = $("toast");

let currentUsername = "";
let tasks = [];
let clockInterval = null;
let toastTimeout = null;

/* STORAGE KEYS */

const ACCOUNTS_KEY = "arnabWebsiteAccounts";
const SESSION_KEY = "arnabWebsiteCurrentUser";
const THEME_KEY = "arnabWebsiteTheme";

/* GENERAL HELPERS */

function normaliseUsername(value) {
    return String(value || "").trim().toLowerCase();
}

function readJSON(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : JSON.parse(value);
    } catch (error) {
        return fallback;
    }
}

function getAccounts() {
    const accounts = readJSON(ACCOUNTS_KEY, {});
    return accounts && typeof accounts === "object" &&
        !Array.isArray(accounts) ? accounts : {};
}

function saveAccounts(accounts) {
    try {
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
        return true;
    } catch (error) {
        showToast("Could not save account data. Browser storage may be full.", "error");
        return false;
    }
}

function getAccount() {
    const username = normaliseUsername(
        localStorage.getItem(SESSION_KEY) || currentUsername
    );

    if (!username) return null;

    const accounts = getAccounts();
    const account = accounts[username];

    if (!account) return null;

    currentUsername = username;
    return account;
}

function showPage(page) {
    loginPage.classList.add("hidden");
    signupPage.classList.add("hidden");
    dashboardPage.classList.add("hidden");

    page.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function setMessage(element, message, type) {
    element.textContent = message;
    element.className = "form-message";

    if (type) element.classList.add(type);
}

function showToast(message, type) {
    toast.textContent = message;
    toast.classList.remove("show", "error");

    if (type === "error") {
        toast.classList.add("error");
    }

    // Restart the short animation.
    void toast.offsetWidth;
    toast.classList.add("show");

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(function () {
        toast.classList.remove("show");
    }, 2800);
}

function escapeText(value) {
    return String(value == null ? "" : value);
}

/* PASSWORD SHOW / HIDE */

document.querySelectorAll("[data-toggle-password]").forEach(function (button) {
    button.addEventListener("click", function () {
        const input = $(button.dataset.togglePassword);

        if (!input) return;

        const shouldShow = input.type === "password";
        input.type = shouldShow ? "text" : "password";
        button.textContent = shouldShow ? "🙈" : "👁";
        button.setAttribute(
            "aria-label",
            shouldShow ? "Hide password" : "Show password"
        );

        // Keep focus on the input, including on mobile.
        input.focus({ preventScroll: true });
    });
});

/* LOGIN / SIGNUP PAGE SWITCHING */

$("showSignup").addEventListener("click", function () {
    loginForm.reset();
    setMessage(loginMessage, "");
    setMessage(signupMessage, "");
    showPage(signupPage);
});

$("showLogin").addEventListener("click", function () {
    signupForm.reset();
    setMessage(signupMessage, "");
    setMessage(loginMessage, "");
    showPage(loginPage);
});

/* CREATE ACCOUNT */

signupForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const fullName = signupName.value.trim();
    const username = normaliseUsername(signupUsername.value);
    const password = signupPassword.value;
    const confirm = confirmPassword.value;

    if (fullName.length < 2) {
        setMessage(signupMessage, "Please enter your full name.", "error");
        return;
    }

    if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(username)) {
        setMessage(
            signupMessage,
            "Username must be 3–30 characters and use only letters, numbers, dot, underscore or hyphen.",
            "error"
        );
        return;
    }

    if (password.length < 6) {
        setMessage(
            signupMessage,
            "Password must contain at least 6 characters.",
            "error"
        );
        return;
    }

    if (password !== confirm) {
        setMessage(signupMessage, "Passwords do not match.", "error");
        return;
    }

    const accounts = getAccounts();

    if (accounts[username]) {
        setMessage(
            signupMessage,
            "This username already exists. Please choose another.",
            "error"
        );
        return;
    }

    accounts[username] = {
        username: username,
        fullName: fullName,
        password: password,
        createdAt: Date.now()
    };

    if (!saveAccounts(accounts)) return;

    signupForm.reset();
    loginUsername.value = username;
    loginPassword.value = "";

    setMessage(
        loginMessage,
        "Account created successfully. Please log in.",
        "success"
    );

    showPage(loginPage);
    showToast("Account created successfully!");
});

/* LOGIN */

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = normaliseUsername(loginUsername.value);
    const password = loginPassword.value;
    const accounts = getAccounts();
    const account = accounts[username];

    if (!account || account.password !== password) {
        setMessage(
            loginMessage,
            "Incorrect username or password. Please try again.",
            "error"
        );
        return;
    }

    try {
        localStorage.setItem(SESSION_KEY, username);
    } catch (error) {
        setMessage(loginMessage, "Could not save login session.", "error");
        return;
    }

    currentUsername = username;
    loginPassword.value = "";

    loadDashboard();
    showToast("Login successful. Welcome!");
});

/* DEMO PASSWORD RESET */

$("forgotPassword").addEventListener("click", function () {
    const username = normaliseUsername(
        window.prompt("Enter your account username:")
    );

    if (!username) return;

    const accounts = getAccounts();
    const account = accounts[username];

    if (!account) {
        showToast("Account not found.", "error");
        return;
    }

    const nameCheck = window.prompt(
        "For this demo, enter the full name used when creating this account:"
    );

    if (nameCheck === null) return;

    if (nameCheck.trim().toLowerCase() !==
        String(account.fullName || "").trim().toLowerCase()) {
        showToast("The name does not match this account.", "error");
        return;
    }

    const newPassword = window.prompt(
        "Enter your new password (at least 6 characters):"
    );

    if (newPassword === null) return;

    if (newPassword.length < 6) {
        showToast("Password must contain at least 6 characters.", "error");
        return;
    }

    const confirmation = window.prompt("Enter the new password again:");

    if (confirmation !== newPassword) {
        showToast("Passwords do not match.", "error");
        return;
    }

    accounts[username].password = newPassword;

    if (!saveAccounts(accounts)) return;

    showToast("Password changed. Please log in.");
});

/* LIVE CLOCK AND GREETING */

function updateClock() {
    const now = new Date();

    liveClock.textContent = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    });

    clockDate.textContent = now.toLocaleDateString([], {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
    });

    welcomeDate.textContent = now.toLocaleDateString([], {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    const hour = now.getHours();

    if (hour >= 5 && hour < 12) {
        greeting.textContent = "Good morning!";
    } else if (hour >= 12 && hour < 17) {
        greeting.textContent = "Good afternoon!";
    } else if (hour >= 17 && hour < 21) {
        greeting.textContent = "Good evening!";
    } else {
        greeting.textContent = "Good night!";
    }
}

/* THEME */

function applyTheme(theme) {
    const light = theme === "light";

    document.body.classList.toggle("light-theme", light);
    themeToggle.textContent = light ? "☀️" : "🌙";
    themeToggle.setAttribute(
        "aria-label",
        light ? "Switch to dark theme" : "Switch to light theme"
    );
}

applyTheme(localStorage.getItem(THEME_KEY) || "dark");

themeToggle.addEventListener("click", function () {
    const newTheme = document.body.classList.contains("light-theme")
        ? "dark"
        : "light";

    try {
        localStorage.setItem(THEME_KEY, newTheme);
    } catch (error) {
        // The theme still works for this page even if saving fails.
    }

    applyTheme(newTheme);
});

/* PROFILE */

function profilePhotoKey() {
    return "arnabProfilePhoto_" + currentUsername;
}

function loadProfilePhoto() {
    let photo = "";

    try {
        photo = localStorage.getItem(profilePhotoKey()) || "";
    } catch (error) {
        photo = "";
    }

    if (photo) {
        profilePhoto.src = photo;
        profilePhoto.classList.add("visible");
        avatarFallback.classList.add("hidden");
    } else {
        profilePhoto.removeAttribute("src");
        profilePhoto.classList.remove("visible");
        avatarFallback.classList.remove("hidden");
    }
}

photoInput.addEventListener("change", function () {
    const file = photoInput.files && photoInput.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        showToast("Please select an image file.", "error");
        photoInput.value = "";
        return;
    }

    if (file.size > 1024 * 1024) {
        showToast("Please select a photo smaller than 1 MB.", "error");
        photoInput.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = function () {
        try {
            localStorage.setItem(profilePhotoKey(), reader.result);
            loadProfilePhoto();
            showToast("Profile photo updated!");
        } catch (error) {
            showToast("Photo could not be saved. Try a smaller image.", "error");
        }
    };

    reader.onerror = function () {
        showToast("Could not read the selected photo.", "error");
    };

    reader.readAsDataURL(file);
    photoInput.value = "";
});

profileForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = editName.value.trim();

    if (name.length < 2) {
        setMessage(profileMessage, "Please enter a valid name.", "error");
        return;
    }

    const accounts = getAccounts();

    if (!accounts[currentUsername]) {
        setMessage(profileMessage, "Account not found. Please log in again.", "error");
        return;
    }

    accounts[currentUsername].fullName = name;

    if (!saveAccounts(accounts)) return;

    displayName.textContent = name;
    profileName.textContent = name;

    setMessage(profileMessage, "Profile updated successfully.", "success");
    addNotification("Your profile was updated.");
    showToast("Profile updated!");
});

/* NOTIFICATIONS */

function notificationsKey() {
    return "arnabNotifications_" + currentUsername;
}

function getNotifications() {
    const items = readJSON(notificationsKey(), []);
    return Array.isArray(items) ? items : [];
}

function saveNotifications(items) {
    try {
        localStorage.setItem(notificationsKey(), JSON.stringify(items));
        return true;
    } catch (error) {
        return false;
    }
}

function addNotification(message) {
    if (!currentUsername) return;

    const items = getNotifications();

    items.unshift({
        message: String(message),
        createdAt: Date.now()
    });

    // Keep the newest 30 notifications.
    if (items.length > 30) items.length = 30;

    saveNotifications(items);
    renderNotifications();
}

function renderNotifications() {
    notificationList.replaceChildren();

    const items = getNotifications();

    if (items.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-message";
        empty.textContent = "No notifications yet.";
        notificationList.appendChild(empty);
        return;
    }

    items.forEach(function (item) {
        const card = document.createElement("div");
        card.className = "notification-item";

        const message = document.createElement("p");
        message.textContent = item.message;

        const time = document.createElement("time");
        time.dateTime = item.createdAt
            ? new Date(item.createdAt).toISOString()
            : "";
        time.textContent = item.createdAt
            ? new Date(item.createdAt).toLocaleString()
            : "Time not recorded";

        card.append(message, time);
        notificationList.appendChild(card);
    });
}

clearNotifications.addEventListener("click", function () {
    saveNotifications([]);
    renderNotifications();
    showToast("Notifications cleared.");
});

/* DAILY TASKS AND HISTORY */

function getTodayKey() {
    const date = new Date();

    const dateString = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");

    return "arnabDailyTasks_" + currentUsername + "_" + dateString;
}

function formatDate(dateString) {
    const parts = dateString.split("-").map(Number);

    if (parts.length !== 3 || parts.some(function (n) {
        return !n;
    })) {
        return dateString;
    }

    return new Date(parts[0], parts[1] - 1, parts[2])
        .toLocaleDateString([], {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
}

function formatTime(timestamp) {
    if (!timestamp) return "Time not recorded";

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) return "Time not recorded";

    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    });
}

function loadTasks() {
    tasks = readJSON(getTodayKey(), []);

    if (!Array.isArray(tasks)) tasks = [];

    // Make sure each task has a stable ID and safe values.
    tasks = tasks.map(function (task) {
        return {
            id: task.id || (
                String(task.createdAt || Date.now()) +
                "_" + Math.random().toString(36).slice(2, 8)
            ),
            text: String(task.text || ""),
            done: Boolean(task.done),
            createdAt: Number(task.createdAt) || null,
            completedAt: Number(task.completedAt) || null
        };
    });
}

function saveTasks() {
    try {
        localStorage.setItem(getTodayKey(), JSON.stringify(tasks));
        return true;
    } catch (error) {
        showToast("Could not save tasks. Browser storage may be full.", "error");
        return false;
    }
}

function renderTasks() {
    taskList.replaceChildren();

    let completedCount = 0;

    tasks.forEach(function (task) {
        if (task.done) completedCount++;

        const row = document.createElement("div");
        row.className = "task-row";

        if (task.done) row.classList.add("completed");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.done;
        checkbox.setAttribute("aria-label", "Mark task completed");

        const details = document.createElement("div");
        details.className = "task-text";

        const title = document.createElement("div");
        title.className = "history-item-title";
        title.textContent = task.text;

        const time = document.createElement("div");
        time.className = "history-item-time";
        time.textContent = "Added: " + formatTime(task.createdAt);

        if (task.done && task.completedAt) {
            time.textContent += " | Completed: " + formatTime(task.completedAt);
        }

        details.append(title, time);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "task-delete";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute("aria-label", "Delete task");

        checkbox.addEventListener("change", function () {
            const index = tasks.findIndex(function (item) {
                return item.id === task.id;
            });

            if (index === -1) return;

            const previous = { ...tasks[index] };

            tasks[index].done = checkbox.checked;
            tasks[index].completedAt = checkbox.checked ? Date.now() : null;

            if (!saveTasks()) {
                tasks[index] = previous;
            } else if (checkbox.checked) {
                addNotification('Task completed: "' + task.text + '"');
            }

            renderTasks();
            renderTaskHistory();
        });

        deleteButton.addEventListener("click", function () {
            const index = tasks.findIndex(function (item) {
                return item.id === task.id;
            });

            if (index === -1) return;

            const removed = tasks.splice(index, 1)[0];

            if (!saveTasks()) {
                tasks.splice(index, 0, removed);
            } else {
                addNotification('Task deleted: "' + task.text + '"');
            }

            renderTasks();
            renderTaskHistory();
            showToast("Task deleted.");
        });

        row.append(checkbox, details, deleteButton);
        taskList.appendChild(row);
    });

    if (tasks.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-tasks";
        empty.textContent = "No tasks added today yet.";
        taskList.appendChild(empty);
    }

    const percentage = tasks.length
        ? Math.round((completedCount / tasks.length) * 100)
        : 0;

    taskCount.textContent =
        completedCount + " of " + tasks.length + " tasks completed";

    progressFill.style.width = percentage + "%";
    progressFill.setAttribute("role", "progressbar");
    progressFill.setAttribute("aria-valuemin", "0");
    progressFill.setAttribute("aria-valuemax", "100");
    progressFill.setAttribute("aria-valuenow", String(percentage));

    progressPercent.textContent = percentage + "%";
}

function renderTaskHistory() {
    const history = $("taskHistory");

    if (!history || !currentUsername) return;

    history.replaceChildren();

    const prefix = "arnabDailyTasks_" + currentUsername + "_";
    const dayEntries = [];

    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);

            if (!key || !key.startsWith(prefix)) continue;

            const dateString = key.slice(prefix.length);

            if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) continue;

            const dayTasks = readJSON(key, []);

            if (Array.isArray(dayTasks)) {
                dayEntries.push({
                    date: dateString,
                    tasks: dayTasks
                });
            }
        }
    } catch (error) {
        // Show whatever history can be read.
    }

    dayEntries.sort(function (a, b) {
        return b.date.localeCompare(a.date);
    });

    if (dayEntries.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-tasks";
        empty.textContent = "Your activity history will appear here.";
        history.appendChild(empty);
        return;
    }

    dayEntries.forEach(function (entry) {
        const dayCard = document.createElement("div");
        dayCard.className = "history-day";

        const heading = document.createElement("h4");
        heading.textContent = "📅 " + formatDate(entry.date);

        const completed = entry.tasks.filter(function (task) {
            return Boolean(task.done);
        }).length;

        const summary = document.createElement("p");
        summary.className = "small-muted";
        summary.textContent =
            completed + " of " + entry.tasks.length + " completed";

        dayCard.append(heading, summary);

        entry.tasks.forEach(function (task) {
            const item = document.createElement("div");
            item.className = "history-item";

            const title = document.createElement("div");
            title.className = "history-item-title";
            title.textContent = String(task.text || "Untitled task");

            const time = document.createElement("div");
            time.className = "history-item-time";
            time.textContent = "Added: " + formatTime(task.createdAt);

            if (task.done && task.completedAt) {
                time.textContent += " | Completed: " + formatTime(task.completedAt);
            }

            const status = document.createElement("div");
            status.className = "history-status " +
                (task.done ? "completed" : "pending");

            status.textContent = task.done
                ? "✓ Completed"
                : "○ Not completed";

            item.append(title, time, status);
            dayCard.appendChild(item);
        });

        history.appendChild(dayCard);
    });
}

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const value = taskInput.value.trim();

    if (!value) {
        showToast("Please enter a task.", "error");
        return;
    }

    const newTask = {
        id: Date.now().toString() +
            "_" + Math.random().toString(36).slice(2, 9),
        text: value,
        done: false,
        createdAt: Date.now(),
        completedAt: null
    };

    tasks.push(newTask);

    if (!saveTasks()) {
        tasks.pop();
        renderTasks();
        return;
    }

    renderTasks();
    renderTaskHistory();

    taskInput.value = "";
    addNotification('New task added: "' + value + '"');
    showToast("Task added with date and time!");
});

/* PERSONAL NOTES */

function noteKey() {
    return "arnabPersonalNote_" + currentUsername;
}

function loadNote() {
    personalNote.value = "";

    try {
        personalNote.value = localStorage.getItem(noteKey()) || "";
    } catch (error) {
        personalNote.value = "";
    }

    setMessage(noteMessage, "");
}

saveNoteButton.addEventListener("click", function () {
    try {
        localStorage.setItem(noteKey(), personalNote.value);
        setMessage(noteMessage, "Your notes have been saved.", "success");
        addNotification("Your personal notes were saved.");
        showToast("Notes saved successfully!");
    } catch (error) {
        setMessage(
            noteMessage,
            "Could not save notes. Browser storage may be full.",
            "error"
        );
    }
});

/* LOAD DASHBOARD */

function loadDashboard() {
    const account = getAccount();

    if (!account) {
        currentUsername = "";
        showPage(loginPage);
        return;
    }

    displayName.textContent = account.fullName || account.username;
    profileName.textContent = account.fullName || account.username;
    profileUsername.textContent = account.username;
    editName.value = account.fullName || "";

    setMessage(profileMessage, "");
    loadProfilePhoto();
    renderNotifications();

    if (clockInterval) {
        clearInterval(clockInterval);
    }

    updateClock();
    clockInterval = setInterval(updateClock, 1000);

    loadTasks();
    renderTasks();
    renderTaskHistory();
    loadNote();

    $("footerYear").textContent = new Date().getFullYear();

    showPage(dashboardPage);
}

/* LOGOUT */

$("logoutButton").addEventListener("click", function () {
    if (clockInterval) {
        clearInterval(clockInterval);
        clockInterval = null;
    }

    try {
        localStorage.removeItem(SESSION_KEY);
    } catch (error) {
        // Continue to login screen even if storage fails.
    }

    currentUsername = "";
    tasks = [];
    loginForm.reset();

    setMessage(loginMessage, "You have logged out.", "success");
    showPage(loginPage);
});

/* STARTUP */

(function startWebsite() {
    try {
        const savedUser = normaliseUsername(
            localStorage.getItem(SESSION_KEY)
        );

        if (savedUser && getAccounts()[savedUser]) {
            currentUsername = savedUser;
            loadDashboard();
        } else {
            localStorage.removeItem(SESSION_KEY);
            showPage(loginPage);
        }
    } catch (error) {
        showPage(loginPage);
    }
})();
