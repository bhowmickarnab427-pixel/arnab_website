
document.addEventListener("DOMContentLoaded", function () {
    const $ = id => document.getElementById(id);

    function showPage(id) {
        ["loginPage", "signupPage", "resetPage", "dashboardPage"].forEach(page => {
            $(page).classList.add("hidden");
        });
        $(id).classList.remove("hidden");
    }

    function say(id, text, error = false) {
        $(id).textContent = text;
        $(id).classList.toggle("error", error);
    }

    function notify(text) {
        $("toast").textContent = text;
        $("toast").classList.add("show");
        clearTimeout(notify.timer);
        notify.timer = setTimeout(() => $("toast").classList.remove("show"), 2400);
    }

    function getData(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value === null ? fallback : JSON.parse(value);
        } catch (error) {
            return fallback;
        }
    }

    function putData(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            notify("Unable to save data in this browser.");
            return false;
        }
    }

    function getAccounts() {
        const data = getData("arnabAccounts", []);
        if (Array.isArray(data)) return data;

        if (data && typeof data === "object") {
            return Object.keys(data).map(username => ({
                username,
                password: String(
                    typeof data[username] === "object"
                        ? data[username].password || ""
                        : data[username]
                )
            }));
        }
        return [];
    }

    function saveAccounts(accounts) {
        return putData("arnabAccounts", accounts);
    }

    function user() {
        return sessionStorage.getItem("arnabCurrentUser") || "";
    }

    function userKey(name) {
        return "arnab_" + name + "_" + user();
    }

    // Password eye button: works with mouse and touch.
    document.querySelectorAll("[data-password]").forEach(button => {
        button.addEventListener("click", function () {
            const input = $(button.dataset.password);
            const show = input.type === "password";
            input.type = show ? "text" : "password";
            button.textContent = show ? "🙈" : "👁";
            button.setAttribute("aria-pressed", String(show));
        });
    });

    // Navigation
    $("signupButton").addEventListener("click", () => {
        $("signupForm").reset();
        say("signupMessage", "");
        showPage("signupPage");
    });

    $("backButton").addEventListener("click", () => showPage("loginPage"));
    $("resetBackButton").addEventListener("click", () => showPage("loginPage"));

    $("forgotPasswordButton").addEventListener("click", () => {
        $("resetForm").reset();
        say("resetMessage", "");
        showPage("resetPage");
    });

    // CREATE ACCOUNT: simple password allowed, including 1234.
    $("signupForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const username = $("signupUsername").value.trim();
        const password = $("signupPassword").value;

        if (!username) {
            say("signupMessage", "Please enter a username.", true);
            return;
        }

        const accounts = getAccounts();

        if (accounts.some(account =>
            String(account.username).toLowerCase() === username.toLowerCase()
        )) {
            say("signupMessage", "Username already exists. Please log in.", true);
            return;
        }

        accounts.push({ username: username, password: password });

        if (!saveAccounts(accounts)) {
            say("signupMessage", "Account could not be saved.", true);
            return;
        }

        $("signupForm").reset();
        $("loginUsername").value = username;
        say("loginMessage", "Account created successfully! Now log in.");
        showPage("loginPage");
        notify("Account created successfully!");
    });

    // LOGIN
    $("loginForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const username = $("loginUsername").value.trim();
        const password = $("loginPassword").value;

        const account = getAccounts().find(item =>
            String(item.username).toLowerCase() === username.toLowerCase() &&
            String(item.password) === password
        );

        if (!account) {
            say("loginMessage", "Wrong username or password.", true);
            return;
        }

        sessionStorage.setItem("arnabCurrentUser", account.username);
        $("loginForm").reset();
        openDashboard(account.username);
    });

    // RESET PASSWORD: demo only; it does not verify email ownership.
    $("resetForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const username = $("resetUsername").value.trim();
        const password = $("newPassword").value;
        const accounts = getAccounts();

        const index = accounts.findIndex(account =>
            String(account.username).toLowerCase() === username.toLowerCase()
        );

        if (index === -1) {
            say("resetMessage", "Username not found.", true);
            return;
        }

        accounts[index].password = password;

        if (!saveAccounts(accounts)) return;

        $("resetForm").reset();
        $("loginUsername").value = username;
        say("loginMessage", "Password updated. Please log in.");
        showPage("loginPage");
        notify("Password updated.");
    });

    // Dashboard
    function openDashboard(username) {
        $("welcomeText").textContent = "Welcome, " + username + "!";
        $("profileName").textContent = username;
        loadPhoto();
        loadNotifications();
        loadTasks();
        loadNotes();
        showPage("dashboardPage");
        updateClock();
        notify("Login successful!");
    }

    $("logoutButton").addEventListener("click", function () {
        sessionStorage.removeItem("arnabCurrentUser");
        showPage("loginPage");
        say("loginMessage", "You have logged out.");
    });

    // Live clock, date and greeting
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
        if (hour >= 5 && hour < 12) greeting = "Good morning";
        else if (hour >= 12 && hour < 17) greeting = "Good afternoon";
        else if (hour >= 17 && hour < 21) greeting = "Good evening";
        else greeting = "Good night";

        $("greeting").textContent = greeting + ", " + (user() || "Guest") + "!";
    }

    updateClock();
    setInterval(updateClock, 1000);

    // Profile photo
    function loadPhoto() {
        const photo = getData(userKey("photo"), "");
        if (photo) $("profileImage").src = photo;
        else $("profileImage").removeAttribute("src");
    }

    $("photoInput").addEventListener("change", function () {
        const file = this.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            notify("Please select an image.");
            this.value = "";
            return;
        }

        if (file.size > 1024 * 1024) {
            notify("Please choose an image under 1 MB.");
            this.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (putData(userKey("photo"), reader.result)) {
                loadPhoto();
                notify("Photo updated.");
            }
        };
        reader.readAsDataURL(file);
    });

    $("removePhotoButton").addEventListener("click", function () {
        localStorage.removeItem(userKey("photo"));
        $("photoInput").value = "";
        loadPhoto();
        notify("Photo removed.");
    });

    // Notifications
    function loadNotifications() {
        const list = $("notificationList");
        list.replaceChildren();

        getData(userKey("notifications"), []).forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            list.appendChild(li);
        });
    }

    $("notificationForm").addEventListener("submit", function (event) {
        event.preventDefault();
        const value = $("notificationInput").value.trim();
        if (!value) return;

        const items = getData(userKey("notifications"), []);
        items.unshift(value);

        if (putData(userKey("notifications"), items)) {
            this.reset();
            loadNotifications();
            notify("Notification added.");
        }
    });

    $("clearNotificationsButton").addEventListener("click", function () {
        if (putData(userKey("notifications"), [])) loadNotifications();
    });

    // Tasks
    function loadTasks() {
        const list = $("taskList");
        list.replaceChildren();

        const tasks = getData(userKey("tasks"), []);
        let completed = 0;

        tasks.forEach((task, index) => {
            if (task.done) completed++;

            const li = document.createElement("li");
            const row = document.createElement("div");
            row.className = "task-item" + (task.done ? " completed" : "");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = Boolean(task.done);

            checkbox.addEventListener("change", function () {
                const latest = getData(userKey("tasks"), []);
                if (!latest[index]) return;
                latest[index].done = checkbox.checked;
                if (putData(userKey("tasks"), latest)) loadTasks();
            });

            const span = document.createElement("span");
            span.className = "task-text";
            span.textContent = task.text;

            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "secondary-button";
            remove.textContent = "Delete";
            remove.addEventListener("click", function () {
                const latest = getData(userKey("tasks"), []);
                latest.splice(index, 1);
                if (putData(userKey("tasks"), latest)) loadTasks();
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

        const tasks = getData(userKey("tasks"), []);
        tasks.push({ text: value, done: false });

        if (putData(userKey("tasks"), tasks)) {
            this.reset();
            loadTasks();
        }
    });

    // Notes
    function loadNotes() {
        $("notesInput").value = getData(userKey("notes"), "");
    }

    $("saveNotesButton").addEventListener("click", function () {
        if (putData(userKey("notes"), $("notesInput").value)) {
            say("notesMessage", "Notes saved.");
            notify("Notes saved.");
        }
    });

    // Light/dark theme
    try {
        if (localStorage.getItem("arnabTheme") === "light") {
            document.body.classList.add("light-theme");
        }
    } catch (error) {}

    $("themeButton").addEventListener("click", function () {
        document.body.classList.toggle("light-theme");
        const theme = document.body.classList.contains("light-theme") ? "light" : "dark";

        try {
            localStorage.setItem("arnabTheme", theme);
        } catch (error) {}

        notify(theme === "light" ? "Light theme enabled." : "Dark theme enabled.");
    });

    // Start on login page
    showPage("loginPage");
});
