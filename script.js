
document.addEventListener("DOMContentLoaded", function () {
    const $ = id => document.getElementById(id);

    const pages = ["loginPage", "signupPage", "resetPage", "dashboardPage"];

    function showPage(pageId) {
        pages.forEach(id => $(id)?.classList.add("hidden"));
        $(pageId)?.classList.remove("hidden");
    }

    function message(id, text, error = false) {
        const el = $(id);
        if (!el) return;
        el.textContent = text;
        el.classList.toggle("error", error);
    }

    function toast(text) {
        const el = $("toast");
        if (!el) return;

        el.textContent = text;
        el.classList.add("show");

        clearTimeout(toast.timer);
        toast.timer = setTimeout(() => el.classList.remove("show"), 2500);
    }

    function readJSON(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value === null ? fallback : JSON.parse(value);
        } catch {
            return fallback;
        }
    }

    function saveJSON(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            toast("Could not save. Browser storage may be full.");
            return false;
        }
    }

    function getAccounts() {
        const data = readJSON("arnabAccounts", []);
        if (Array.isArray(data)) return data;

        if (data && typeof data === "object") {
            return Object.entries(data).map(([username, item]) => {
                if (item && typeof item === "object") {
                    return { ...item, username };
                }
                return { username, password: String(item) };
            });
        }

        return [];
    }

    function saveAccounts(accounts) {
        return saveJSON("arnabAccounts", accounts);
    }

    function currentUser() {
        return sessionStorage.getItem("arnabCurrentUser");
    }

    function key(type) {
        return "arnab_" + type + "_" + currentUser();
    }

    // SHOW / HIDE PASSWORD
    document.querySelectorAll("[data-password]").forEach(button => {
        button.addEventListener("click", function (event) {
            event.preventDefault();

            const input = $(button.dataset.password);
            if (!input) return;

            const showing = input.type === "password";
            input.type = showing ? "text" : "password";
            button.setAttribute("aria-pressed", String(showing));
            button.setAttribute(
                "aria-label",
                showing ? "Hide password" : "Show password"
            );

            // Change eye icon to crossed eye when password is visible.
            button.innerHTML = showing
                ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 10.6a2 2 0 002.8 2.8"/><path d="M9.9 5.2A10.8 10.8 0 0112 5c6.4 0 10 7 10 7a15 15 0 01-3.2 3.9"/><path d="M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7c1.2 0 2.3-.2 3.3-.6"/></svg>'
                : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
        });
    });

    // PAGE NAVIGATION
    $("signupButton").addEventListener("click", function () {
        message("signupMessage", "");
        $("signupForm").reset();
        showPage("signupPage");
    });

    $("backButton").addEventListener("click", () => showPage("loginPage"));
    $("resetBackButton").addEventListener("click", () => showPage("loginPage"));

    $("forgotPasswordButton").addEventListener("click", function () {
        $("resetForm").reset();
        message("resetMessage", "");
        showPage("resetPage");
    });

    // CREATE ACCOUNT: minimum 6 password characters
    $("signupForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const username = $("signupUsername").value.trim();
        const password = $("signupPassword").value;

        if (!/^[a-zA-Z0-9_-]{3,30}$/.test(username)) {
            message(
                "signupMessage",
                "Username: use 3–30 letters, numbers, _ or -.",
                true
            );
            return;
        }

        if (password.length < 6) {
            message(
                "signupMessage",
                "Password must contain at least 6 characters.",
                true
            );
            return;
        }

        const accounts = getAccounts();

        const exists = accounts.some(account =>
            String(account.username).toLowerCase() === username.toLowerCase()
        );

        if (exists) {
            message("signupMessage", "Username already exists. Please log in.", true);
            return;
        }

        accounts.push({ username, password });

        if (!saveAccounts(accounts)) {
            message("signupMessage", "Account could not be saved.", true);
            return;
        }

        $("signupForm").reset();
        message("signupMessage", "");
        message("loginMessage", "Account created! Please log in.");
        $("loginUsername").value = username;
        showPage("loginPage");
        toast("Account created successfully!");
    });

    // LOGIN
    $("loginForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const username = $("loginUsername").value.trim();
        const password = $("loginPassword").value;

        const account = getAccounts().find(item =>
            String(item.username).toLowerCase() === username.toLowerCase() &&
            item.password === password
        );

        if (!account) {
            message("loginMessage", "Incorrect username or password.", true);
            return;
        }

        try {
            sessionStorage.setItem("arnabCurrentUser", account.username);
        } catch {
            message("loginMessage", "Could not start your session.", true);
            return;
        }

        $("loginForm").reset();
        message("loginMessage", "");
        openDashboard(account.username);
    });

    // RESET PASSWORD: demo feature, no email verification
    $("resetForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const username = $("resetUsername").value.trim();
        const newPassword = $("newPassword").value;

        if (newPassword.length < 6) {
            message("resetMessage", "Password must contain at least 6 characters.", true);
            return;
        }

        const accounts = getAccounts();
        const index = accounts.findIndex(item =>
            String(item.username).toLowerCase() === username.toLowerCase()
        );

        if (index === -1) {
            message("resetMessage", "Username not found.", true);
            return;
        }

        accounts[index].password = newPassword;

        if (!saveAccounts(accounts)) return;

        $("resetForm").reset();
        message("resetMessage", "");
        $("loginUsername").value = username;
        message("loginMessage", "Password updated. Please log in.");
        showPage("loginPage");
        toast("Password updated.");
    });

    // DASHBOARD
    function openDashboard(username) {
        $("welcomeText").textContent = "Welcome, " + username + "!";
        $("profileName").textContent = username;

        loadPhoto();
        loadNotifications();
        loadTasks();
        loadNotes();

        showPage("dashboardPage");
        updateClock();
        toast("Login successful!");
    }

    $("logoutButton").addEventListener("click", function () {
        sessionStorage.removeItem("arnabCurrentUser");
        $("loginForm").reset();
        showPage("loginPage");
        message("loginMessage", "You have logged out.");
    });

    // LIVE CLOCK AND GREETING
    function updateClock() {
        const now = new Date();
        const hour = now.getHours();

        $("clock").textContent = now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        });

        $("dateText").textContent = now.toLocaleDateString([], {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        let greeting;

        if (hour >= 5 && hour < 12) {
            greeting = "Good morning";
        } else if (hour >= 12 && hour < 17) {
            greeting = "Good afternoon";
        } else if (hour >= 17 && hour < 21) {
            greeting = "Good evening";
        } else {
            greeting = "Good night";
        }

        $("greeting").textContent =
            greeting + ", " + (currentUser() || "Guest") + "!";
    }

    updateClock();
    setInterval(updateClock, 1000);

    // PROFILE PHOTO
    function loadPhoto() {
        const photo = readJSON(key("photo"), "");

        if (photo) {
            $("profileImage").src = photo;
        } else {
            $("profileImage").removeAttribute("src");
        }
    }

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
            if (saveJSON(key("photo"), reader.result)) {
                loadPhoto();
                toast("Profile photo updated.");
            }
        };

        reader.onerror = () => toast("Could not read the image.");
        reader.readAsDataURL(file);
    });

    $("removePhotoButton").addEventListener("click", function () {
        try {
            localStorage.removeItem(key("photo"));
            $("photoInput").value = "";
            loadPhoto();
            toast("Profile photo removed.");
        } catch {
            toast("Could not remove the photo.");
        }
    });

    // NOTIFICATIONS
    function loadNotifications() {
        const list = $("notificationList");
        list.replaceChildren();

        readJSON(key("notifications"), []).forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            list.appendChild(li);
        });
    }

    $("notificationForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const value = $("notificationInput").value.trim();
        if (!value) return;

        const items = readJSON(key("notifications"), []);
        items.unshift(value);

        if (saveJSON(key("notifications"), items)) {
            $("notificationForm").reset();
            loadNotifications();
            toast("Notification added.");
        }
    });

    $("clearNotificationsButton").addEventListener("click", function () {
        if (saveJSON(key("notifications"), [])) {
            loadNotifications();
            toast("Notifications cleared.");
        }
    });

    // DAILY TASKS
    function loadTasks() {
        const list = $("taskList");
        list.replaceChildren();

        const tasks = readJSON(key("tasks"), []);
        let completed = 0;

        tasks.forEach((task, index) => {
            if (task.done) completed++;

            const li = document.createElement("li");
            const row = document.createElement("div");
            row.className = "task-item" + (task.done ? " completed" : "");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = Boolean(task.done);
            checkbox.setAttribute("aria-label", "Mark task complete");

            checkbox.addEventListener("change", function () {
                const latest = readJSON(key("tasks"), []);
                if (!latest[index]) return;

                latest[index].done = checkbox.checked;
                if (saveJSON(key("tasks"), latest)) loadTasks();
            });

            const span = document.createElement("span");
            span.className = "task-text";
            span.textContent = task.text;

            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "secondary-button";
            remove.textContent = "Delete";

            remove.addEventListener("click", function () {
                const latest = readJSON(key("tasks"), []);
                latest.splice(index, 1);
                if (saveJSON(key("tasks"), latest)) loadTasks();
            });

            row.append(checkbox, span, remove);
            li.appendChild(row);
            list.appendChild(li);
        });

        $("taskProgress").textContent =
            completed + " of " + tasks.length + " tasks completed";
    }

    $("taskForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const value = $("taskInput").value.trim();
        if (!value) return;

        const tasks = readJSON(key("tasks"), []);
        tasks.push({ text: value, done: false });

        if (saveJSON(key("tasks"), tasks)) {
            $("taskForm").reset();
            loadTasks();
            toast("Task added.");
        }
    });

    // PERSONAL NOTES
    function loadNotes() {
        $("notesInput").value = readJSON(key("notes"), "");
    }

    $("saveNotesButton").addEventListener("click", function () {
        if (saveJSON(key("notes"), $("notesInput").value)) {
            message("notesMessage", "Notes saved.");
            toast("Notes saved successfully.");
        }
    });

    // LIGHT / DARK THEME
    try {
        if (localStorage.getItem("arnabTheme") === "light") {
            document.body.classList.add("light-theme");
        }
    } catch {}

    $("themeButton").addEventListener("click", function () {
        document.body.classList.toggle("light-theme");

        const theme = document.body.classList.contains("light-theme")
            ? "light"
            : "dark";

        try {
            localStorage.setItem("arnabTheme", theme);
        } catch {}

        toast(theme === "light" ? "Light theme enabled." : "Dark theme enabled.");
    });

    // OPEN SAVED SESSION AFTER REFRESH
    const savedUser = currentUser();

    if (savedUser && getAccounts().some(account => account.username === savedUser)) {
        openDashboard(savedUser);
    } else {
        sessionStorage.removeItem("arnabCurrentUser");
        showPage("loginPage");
    }
});
