
document.addEventListener("DOMContentLoaded", function () {
    const $ = function (id) {
        return document.getElementById(id);
    };

    const pageIds = [
        "loginPage",
        "signupPage",
        "resetPage",
        "dashboardPage"
    ];

    function showPage(id) {
        pageIds.forEach(function (pageId) {
            const page = $(pageId);
            if (page) page.classList.add("hidden");
        });

        const selectedPage = $(id);
        if (selectedPage) selectedPage.classList.remove("hidden");
    }

    function message(id, text, isError) {
        const element = $(id);
        if (!element) return;

        element.textContent = text;
        element.classList.toggle("error", Boolean(isError));
    }

    function toast(text) {
        const element = $("toast");
        if (!element) return;

        element.textContent = text;
        element.classList.add("show");

        clearTimeout(toast.timer);
        toast.timer = setTimeout(function () {
            element.classList.remove("show");
        }, 2500);
    }

    function readJSON(key, fallback) {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return value === null ? fallback : value;
        } catch (error) {
            return fallback;
        }
    }

    function saveJSON(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            toast("Could not save data in this browser.");
            return false;
        }
    }

    function clean(value) {
        return String(value || "").trim();
    }

    function getAccounts() {
        const value = readJSON("arnabAccounts", []);

        if (Array.isArray(value)) {
            return value.filter(function (account) {
                return account &&
                    typeof account.username === "string";
            });
        }

        if (value && typeof value === "object") {
            return Object.entries(value).map(function (entry) {
                const username = entry[0];
                const item = entry[1];

                if (item && typeof item === "object") {
                    return Object.assign({}, item, {
                        username: username
                    });
                }

                return {
                    username: username,
                    password: String(item)
                };
            });
        }

        return [];
    }

    function saveAccounts(accounts) {
        return saveJSON("arnabAccounts", accounts);
    }

    function getCurrentUser() {
        return sessionStorage.getItem("arnabCurrentUser");
    }

    function setCurrentUser(username) {
        try {
            sessionStorage.setItem("arnabCurrentUser", username);
            return true;
        } catch (error) {
            toast("Could not start the session.");
            return false;
        }
    }

    function userKey(type) {
        return "arnab_" + type + "_" + getCurrentUser();
    }

    // Password show / hide
    document.querySelectorAll("[data-password]").forEach(function (button) {
        button.addEventListener("click", function () {
            const input = $(button.getAttribute("data-password"));
            if (!input) return;

            input.type = input.type === "password" ? "text" : "password";
            button.textContent = input.type === "password" ? "👁" : "🙈";
        });
    });

    // Open Create Account page
    if ($("signupButton")) {
        $("signupButton").addEventListener("click", function () {
            message("signupMessage", "");
            showPage("signupPage");
        });
    }

    // Back to Login
    if ($("backButton")) {
        $("backButton").addEventListener("click", function () {
            showPage("loginPage");
        });
    }

    if ($("resetBackButton")) {
        $("resetBackButton").addEventListener("click", function () {
            showPage("loginPage");
        });
    }

    // Open Forgot Password
    if ($("forgotPasswordButton")) {
        $("forgotPasswordButton").addEventListener("click", function () {
            message("resetMessage", "");
            showPage("resetPage");
        });
    }

    // CREATE ACCOUNT
    if ($("signupForm")) {
        $("signupForm").addEventListener("submit", function (event) {
            event.preventDefault();

            const username = clean($("signupUsername").value);
            const password = $("signupPassword").value;

            if (!/^[a-zA-Z0-9_-]{3,30}$/.test(username)) {
                message(
                    "signupMessage",
                    "Username must be 3–30 letters, numbers, _ or -.",
                    true
                );
                return;
            }

            if (password.length < 4) {
                message(
                    "signupMessage",
                    "Password must contain at least 4 characters.",
                    true
                );
                return;
            }

            const accounts = getAccounts();

            const exists = accounts.some(function (account) {
                return clean(account.username).toLowerCase() ===
                    username.toLowerCase();
            });

            if (exists) {
                message(
                    "signupMessage",
                    "This username already exists. Please log in.",
                    true
                );
                return;
            }

            accounts.push({
                username: username,
                password: password
            });

            if (!saveAccounts(accounts)) {
                message(
                    "signupMessage",
                    "Account could not be saved. Check browser storage.",
                    true
                );
                return;
            }

            $("signupForm").reset();

            message(
                "loginMessage",
                "Account created! Please log in."
            );

            message("signupMessage", "");
            toast("Account created successfully!");

            showPage("loginPage");
            $("loginUsername").value = username;
            $("loginPassword").focus();
        });
    }

    // LOGIN
    if ($("loginForm")) {
        $("loginForm").addEventListener("submit", function (event) {
            event.preventDefault();

            const username = clean($("loginUsername").value);
            const password = $("loginPassword").value;
            const accounts = getAccounts();

            const account = accounts.find(function (item) {
                return clean(item.username).toLowerCase() ===
                    username.toLowerCase() &&
                    item.password === password;
            });

            if (!account) {
                message(
                    "loginMessage",
                    "Incorrect username or password.",
                    true
                );
                return;
            }

            if (!setCurrentUser(account.username)) return;

            message("loginMessage", "");
            $("loginForm").reset();

            openDashboard(account.username);
        });
    }

    // PASSWORD RESET - demo only
    if ($("resetForm")) {
        $("resetForm").addEventListener("submit", function (event) {
            event.preventDefault();

            const username = clean($("resetUsername").value);
            const newPassword = $("newPassword").value;
            const accounts = getAccounts();

            if (newPassword.length < 4) {
                message(
                    "resetMessage",
                    "Password must contain at least 4 characters.",
                    true
                );
                return;
            }

            const index = accounts.findIndex(function (account) {
                return clean(account.username).toLowerCase() ===
                    username.toLowerCase();
            });

            if (index === -1) {
                message("resetMessage", "Username not found.", true);
                return;
            }

            accounts[index].password = newPassword;

            if (!saveAccounts(accounts)) return;

            $("resetForm").reset();
            message("resetMessage", "");
            message("loginMessage", "Password updated. Please log in.");

            toast("Password updated successfully.");
            showPage("loginPage");
            $("loginUsername").value = username;
        });
    }

    // DASHBOARD
    function openDashboard(username) {
        $("welcomeText").textContent = "Welcome, " + username + "!";
        $("profileName").textContent = username;

        loadProfilePhoto();
        loadNotifications();
        loadTasks();
        loadNotes();

        showPage("dashboardPage");
        updateClock();
        toast("Login successful!");
    }

    // LOGOUT
    if ($("logoutButton")) {
        $("logoutButton").addEventListener("click", function () {
            sessionStorage.removeItem("arnabCurrentUser");
            showPage("loginPage");
            message("loginMessage", "You have logged out.");
        });
    }

    // LIVE CLOCK AND GREETING
    function updateClock() {
        const now = new Date();

        if ($("clock")) {
            $("clock").textContent = now.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true
            });
        }

        if ($("dateText")) {
            $("dateText").textContent = now.toLocaleDateString([], {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            });
        }

        let greeting = "Good evening";

        const hour = now.getHours();

        if (hour >= 5 && hour < 12) {
            greeting = "Good morning";
        } else if (hour >= 12 && hour < 17) {
            greeting = "Good afternoon";
        } else if (hour >= 17 && hour < 21) {
            greeting = "Good evening";
        } else {
            greeting = "Good night";
        }

        if ($("greeting")) {
            $("greeting").textContent =
                greeting + ", " + (getCurrentUser() || "Guest") + "!";
        }
    }

    updateClock();
    setInterval(updateClock, 1000);

    // PROFILE PHOTO
    function loadProfilePhoto() {
        const photo = readJSON(userKey("photo"), "");

        if ($("profileImage")) {
            if (photo) {
                $("profileImage").src = photo;
            } else {
                $("profileImage").removeAttribute("src");
            }
        }
    }

    if ($("photoInput")) {
        $("photoInput").addEventListener("change", function () {
            const file = this.files && this.files[0];
            if (!file) return;

            if (!file.type.startsWith("image/")) {
                toast("Please select an image.");
                this.value = "";
                return;
            }

            if (file.size > 1024 * 1024) {
                toast("Choose an image smaller than 1 MB.");
                this.value = "";
                return;
            }

            const reader = new FileReader();

            reader.onload = function () {
                if (saveJSON(userKey("photo"), reader.result)) {
                    loadProfilePhoto();
                    toast("Profile photo updated.");
                }
            };

            reader.onerror = function () {
                toast("Could not read this image.");
            };

            reader.readAsDataURL(file);
        });
    }

    if ($("removePhotoButton")) {
        $("removePhotoButton").addEventListener("click", function () {
            try {
                localStorage.removeItem(userKey("photo"));
                loadProfilePhoto();
                if ($("photoInput")) $("photoInput").value = "";
                toast("Profile photo removed.");
            } catch (error) {
                toast("Could not remove the photo.");
            }
        });
    }

    // NOTIFICATIONS
    function loadNotifications() {
        const list = $("notificationList");
        if (!list) return;

        list.replaceChildren();

        const notifications = readJSON(userKey("notifications"), []);

        notifications.forEach(function (item) {
            const li = document.createElement("li");
            li.textContent = item;
            list.appendChild(li);
        });
    }

    if ($("notificationForm")) {
        $("notificationForm").addEventListener("submit", function (event) {
            event.preventDefault();

            const value = clean($("notificationInput").value);
            if (!value) return;

            const notifications = readJSON(userKey("notifications"), []);
            notifications.unshift(value);

            if (saveJSON(userKey("notifications"), notifications)) {
                $("notificationForm").reset();
                loadNotifications();
                toast("Notification added.");
            }
        });
    }

    if ($("clearNotificationsButton")) {
        $("clearNotificationsButton").addEventListener("click", function () {
            if (saveJSON(userKey("notifications"), [])) {
                loadNotifications();
                toast("Notifications cleared.");
            }
        });
    }

    // DAILY TASKS
    function loadTasks() {
        const list = $("taskList");
        if (!list) return;

        list.replaceChildren();

        const tasks = readJSON(userKey("tasks"), []);
        let completed = 0;

        tasks.forEach(function (task, index) {
            if (task.done) completed++;

            const li = document.createElement("li");
            const wrapper = document.createElement("div");
            wrapper.className = "task-item" + (task.done ? " completed" : "");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = Boolean(task.done);
            checkbox.setAttribute("aria-label", "Mark task completed");

            checkbox.addEventListener("change", function () {
                const current = readJSON(userKey("tasks"), []);
                if (!current[index]) return;

                current[index].done = checkbox.checked;

                if (saveJSON(userKey("tasks"), current)) {
                    loadTasks();
                }
            });

            const span = document.createElement("span");
            span.className = "task-text";
            span.textContent = task.text;

            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "secondary-button";
            remove.textContent = "Delete";
            remove.addEventListener("click", function () {
                const current = readJSON(userKey("tasks"), []);
                current.splice(index, 1);

                if (saveJSON(userKey("tasks"), current)) {
                    loadTasks();
                }
            });

            wrapper.append(checkbox, span, remove);
            li.appendChild(wrapper);
            list.appendChild(li);
        });

        if ($("taskProgress")) {
            $("taskProgress").textContent =
                completed + " of " + tasks.length + " tasks completed";
        }
    }

    if ($("taskForm")) {
        $("taskForm").addEventListener("submit", function (event) {
            event.preventDefault();

            const value = clean($("taskInput").value);
            if (!value) return;

            const tasks = readJSON(userKey("tasks"), []);
            tasks.push({ text: value, done: false });

            if (saveJSON(userKey("tasks"), tasks)) {
                $("taskForm").reset();
                loadTasks();
                toast("Task added.");
            }
        });
    }

    // PERSONAL NOTES
    function loadNotes() {
        if ($("notesInput")) {
            $("notesInput").value = readJSON(userKey("notes"), "");
        }
    }

    if ($("saveNotesButton")) {
        $("saveNotesButton").addEventListener("click", function () {
            const success = saveJSON(userKey("notes"), $("notesInput").value);

            if (success) {
                message("notesMessage", "Notes saved.");
                toast("Notes saved successfully.");
            }
        });
    }

    // LIGHT / DARK THEME
    try {
        if (localStorage.getItem("arnabTheme") === "light") {
            document.body.classList.add("light-theme");
        }
    } catch (error) {
        // The default theme will still work.
    }

    if ($("themeButton")) {
        $("themeButton").addEventListener("click", function () {
            document.body.classList.toggle("light-theme");

            const theme = document.body.classList.contains("light-theme")
                ? "light"
                : "dark";

            try {
                localStorage.setItem("arnabTheme", theme);
            } catch (error) {
                // Theme still changes for the current page.
            }
        });
    }

    // Start at Login
    showPage("loginPage");
});
