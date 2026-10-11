document.addEventListener("DOMContentLoaded", function () {

    const $ = (id) => document.getElementById(id);

    const pages = [
        $("loginPage"),
        $("signupPage"),
        $("resetPage"),
        $("namePage")
    ];

    let currentUser = "";

    const clean = (value) => String(value ?? "").trim();

    const keyName = (value) =>
        clean(value).toLowerCase().replace(/[^a-z0-9_-]/g, "_");

    // Use the local date for task storage.
    function todayKey() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    const taskKey = (user, date = todayKey()) =>
        `arnabDailyTasks_${keyName(user)}_${date}`;

    const photoKey = (user) =>
        `arnabProfilePhoto_${keyName(user)}`;

    const noteKey = (user) =>
        `arnabPersonalNote_${keyName(user)}`;

    const notificationKey = (user) =>
        `arnabNotifications_${keyName(user)}`;

    function readJSON(key, fallback) {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return value ?? fallback;
        } catch {
            return fallback;
        }
    }

    function saveJSON(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            toast("Browser storage is full. Please clear some old data.", true);
            return false;
        }
    }

    function getAccounts() {
        const value = readJSON("arnabAccounts", []);

        if (Array.isArray(value)) {
            return value;
        }

        return Object.entries(value || {}).map(([username, item]) =>
            typeof item === "object"
                ? { username, ...item }
                : { username, password: item }
        );
    }

    function saveAccounts(accounts) {
        return saveJSON("arnabAccounts", accounts);
    }

    function showPage(page) {
        pages.forEach((item) => {
            if (item) {
                item.classList.add("hidden");
            }
        });

        if (page) {
            page.classList.remove("hidden");
        }
    }

    function message(id, text, error = false) {
        const element = $(id);

        if (element) {
            element.textContent = text;
            element.style.color = error ? "#ff9caa" : "#9ef0be";
        }
    }

    function toast(text, error = false) {
        const box = $("toastContainer");

        if (!box) return;

        const element = document.createElement("div");
        element.className = "toast" + (error ? " error" : "");
        element.textContent = text;

        box.appendChild(element);

        setTimeout(() => element.remove(), 3400);
    }

    // Notifications
    function notify(text) {
        const notification = $("notification");

        if (notification) {
            notification.textContent = text;
        }

        if (!currentUser) return;

        const items = readJSON(notificationKey(currentUser), []);

        items.unshift({
            id: Date.now() + Math.random(),
            text: text,
            time: new Date().toISOString(),
            read: false
        });

        saveJSON(notificationKey(currentUser), items.slice(0, 50));
        renderNotifications();
    }

    // Tasks
    function getTasks(date = todayKey()) {
        const raw = readJSON(taskKey(currentUser, date), []);

        return (Array.isArray(raw) ? raw : []).map((task, index) => {
            if (typeof task === "string") {
                return {
                    id: `${date}-${index}`,
                    text: task,
                    done: false,
                    priority: "Normal",
                    deadline: ""
                };
            }

            return {
                priority: "Normal",
                deadline: "",
                done: false,
                ...task
            };
        });
    }

    function saveTasks(tasks, date = todayKey()) {
        return saveJSON(taskKey(currentUser, date), tasks);
    }

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, (character) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[character]));
    }

    // Greeting based on local time
    function greeting() {
        const hour = new Date().getHours();

        if (hour < 12) return "🌅 Good Morning";
        if (hour < 17) return "☀️ Good Afternoon";
        if (hour < 21) return "🌇 Good Evening";

        return "🌙 Good Night";
    }

    // Live clock and date
    function updateClock() {
        const now = new Date();

        if ($("liveClock")) {
            $("liveClock").textContent = now.toLocaleTimeString();
        }

        if ($("liveDate")) {
            $("liveDate").textContent = now.toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            });
        }

        if ($("greetingText")) {
            $("greetingText").textContent =
                greeting() + " — make today count.";
        }
    }

    // Profile display only; no Profile Editor
    function loadProfileUI() {
        if ($("displayName")) {
            $("displayName").textContent = currentUser;
        }

        if ($("displayName2")) {
            $("displayName2").textContent = "Hello, " + currentUser + "!";
        }

        const photo = localStorage.getItem(photoKey(currentUser));

        if (photo) {
            $("profilePhoto").src = photo;
            $("profilePhoto").classList.remove("hidden");
            $("profilePhotoPlaceholder").classList.add("hidden");
        } else {
            $("profilePhoto").classList.add("hidden");
            $("profilePhotoPlaceholder").classList.remove("hidden");
        }
    }

    // Render daily tasks
    function renderTasks() {
        const tasks = getTasks();
        const list = $("premiumTaskList");

        list.replaceChildren();

        tasks.forEach((task) => {
            const row = document.createElement("div");

            row.className = "task-row" + (task.done ? " completed" : "");

            const checkbox = document.createElement("input");

            checkbox.type = "checkbox";
            checkbox.className = "task-checkbox";
            checkbox.checked = Boolean(task.done);
            checkbox.setAttribute("aria-label", "Mark task complete");

            checkbox.addEventListener("change", () => {
                const allTasks = getTasks();

                const item = allTasks.find(
                    (entry) => String(entry.id) === String(task.id)
                );

                if (item) {
                    item.done = checkbox.checked;
                }

                saveTasks(allTasks);
                renderTasks();
                renderWeekly();

                notify(
                    checkbox.checked
                        ? `Task completed: ${task.text}`
                        : `Task reopened: ${task.text}`
                );
            });

            const content = document.createElement("div");
            content.className = "task-content";

            const title = document.createElement("div");
            title.className = "task-text";
            title.textContent = task.text;

            const meta = document.createElement("div");
            meta.className = "task-meta";

            const priority = document.createElement("span");
            priority.className = "priority " + task.priority;
            priority.textContent = task.priority + " priority";

            meta.appendChild(priority);

            if (task.deadline) {
                const deadline = document.createElement("span");
                deadline.textContent = "Due: " + task.deadline;
                meta.appendChild(deadline);
            }

            content.append(title, meta);

            const actions = document.createElement("div");
            actions.className = "task-actions";

            // Edit task
            const edit = document.createElement("button");

            edit.type = "button";
            edit.textContent = "Edit";

            edit.addEventListener("click", () => {
                const text = prompt("Edit task name:", task.text);

                if (text === null) return;

                const value = clean(text);

                if (!value) {
                    toast("Task name cannot be empty.", true);
                    return;
                }

                const allTasks = getTasks();

                const item = allTasks.find(
                    (entry) => String(entry.id) === String(task.id)
                );

                if (item) {
                    item.text = value;
                }

                saveTasks(allTasks);
                renderTasks();
                notify("Task updated.");
            });

            // Delete task
            const deleteButton = document.createElement("button");

            deleteButton.type = "button";
            deleteButton.textContent = "Delete";
            deleteButton.className = "delete-task";

            deleteButton.addEventListener("click", () => {
                if (!confirm("Delete this task?")) return;

                const remainingTasks = getTasks().filter(
                    (entry) => String(entry.id) !== String(task.id)
                );

                saveTasks(remainingTasks);
                renderTasks();
                renderWeekly();
                notify("A task was deleted.");
            });

            actions.append(edit, deleteButton);
            row.append(checkbox, content, actions);
            list.appendChild(row);
        });

        const completed = tasks.filter((task) => task.done).length;

        const percent = tasks.length
            ? Math.round((completed / tasks.length) * 100)
            : 0;

        $("premiumTaskCount").textContent =
            `${completed} of ${tasks.length} tasks completed`;

        $("progressPercent").textContent = percent + "%";

        $("premiumProgressFill").style.width = percent + "%";

        $("premiumProgressFill").setAttribute(
            "aria-valuenow",
            String(percent)
        );
    }

    // Weekly progress
    function renderWeekly() {
        const days = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const dateObject = new Date(today);

            dateObject.setDate(today.getDate() - i);

            const year = dateObject.getFullYear();
            const month = String(dateObject.getMonth() + 1).padStart(2, "0");
            const day = String(dateObject.getDate()).padStart(2, "0");

            const date = `${year}-${month}-${day}`;

            const tasks = getTasks(date);
            const completed = tasks.filter((task) => task.done).length;

            days.push({
                date: date,
                label: dateObject.toLocaleDateString(undefined, {
                    weekday: "short"
                }),
                total: tasks.length,
                done: completed,
                pct: tasks.length
                    ? Math.round((completed / tasks.length) * 100)
                    : 0
            });
        }

        const total = days.reduce((sum, day) => sum + day.total, 0);
        const completed = days.reduce((sum, day) => sum + day.done, 0);

        const percent = total
            ? Math.round((completed / total) * 100)
            : 0;

        $("weeklyProgressPercent").textContent = percent + "%";

        $("weeklyTaskCount").textContent =
            `${completed} of ${total} tasks completed in the last 7 days`;

        $("weeklyProgressFill").style.width = percent + "%";

        const box = $("weeklyBreakdown");

        box.replaceChildren();

        days.forEach((day) => {
            const element = document.createElement("div");

            element.className = "day-stat";

            element.innerHTML = `
                <span>${escapeHTML(day.label)}</span>
                <strong>${day.pct}%</strong>
                <small>${day.done}/${day.total}</small>
            `;

            box.appendChild(element);
        });
    }

    // Notification list
    function renderNotifications() {
        if (!currentUser) return;

        const items = readJSON(notificationKey(currentUser), []);

        const unread = items.filter((item) => !item.read).length;

        $("unreadCount").textContent = `${unread} unread`;

        const box = $("notificationList");

        box.replaceChildren();

        if (!items.length) {
            const paragraph = document.createElement("p");

            paragraph.className = "muted-text";
            paragraph.textContent = "No notifications yet.";

            box.appendChild(paragraph);

            return;
        }

        items.forEach((notificationItem) => {
            const item = document.createElement("div");

            item.className =
                "notification-item" +
                (notificationItem.read ? "" : " unread");

            const dot = document.createElement("span");
            dot.className = "notification-dot";

            const body = document.createElement("div");
            body.className = "notification-body";

            const text = document.createElement("div");
            text.textContent = notificationItem.text;

            const time = document.createElement("div");
            time.className = "notification-time";
            time.textContent = new Date(
                notificationItem.time
            ).toLocaleString();

            body.append(text, time);
            item.append(dot, body);

            if (!notificationItem.read) {
                const button = document.createElement("button");

                button.className = "secondary-button";
                button.type = "button";
                button.textContent = "Read";

                button.addEventListener("click", () => {
                    const allItems = readJSON(
                        notificationKey(currentUser),
                        []
                    );

                    const found = allItems.find(
                        (entry) => entry.id === notificationItem.id
                    );

                    if (found) {
                        found.read = true;
                    }

                    saveJSON(notificationKey(currentUser), allItems);
                    renderNotifications();
                });

                item.appendChild(button);
            }

            box.appendChild(item);
        });
    }

    // Load dashboard after login
    function loadDashboard(username) {
        currentUser = username;

        showPage($("namePage"));

        $("displayName").textContent = username;
        $("displayName2").textContent = "Hello, " + username + "!";

        $("footerYear").textContent = new Date().getFullYear();

        loadProfileUI();
        renderTasks();
        renderWeekly();
        renderNotifications();

        $("userMessage").value =
            localStorage.getItem(noteKey(currentUser)) || "";

        notify("Welcome back! You are logged in.");
    }

    // Show/hide password: works on mobile and desktop
    document.querySelectorAll("[data-password]").forEach((button) => {
        button.addEventListener("click", () => {
            const input = $(button.dataset.password);

            if (!input) return;

            input.type =
                input.type === "password" ? "text" : "password";

            button.setAttribute(
                "aria-label",
                input.type === "password" ? "Show password" : "Hide password"
            );

            button.textContent =
                input.type === "password" ? "👁" : "🙈";
        });
    });

    // Page navigation
    $("signupButton").addEventListener("click", () => {
        showPage($("signupPage"));
    });

    $("backButton").addEventListener("click", () => {
        showPage($("loginPage"));
    });

    $("resetBackButton").addEventListener("click", () => {
        showPage($("loginPage"));
    });

    $("forgotPasswordButton").addEventListener("click", () => {
        showPage($("resetPage"));
        message("resetMessage", "");
    });

    // Create account
    $("signupForm").addEventListener("submit", (event) => {
        event.preventDefault();

        const username = clean($("signupUsername").value);
        const password = $("signupPassword").value;

        if (!/^[a-zA-Z0-9_-]{3,30}$/.test(username)) {
            message(
                "signupMessage",
                "Use 3–30 letters, numbers, _ or -.",
                true
            );
            return;
        }

        const accounts = getAccounts();

        const exists = accounts.some(
            (account) =>
                clean(account.username).toLowerCase() === username.toLowerCase()
        );

        if (exists) {
            message("signupMessage", "This username already exists.", true);
            return;
        }

        accounts.push({
            username: username,
            password: password
        });

        if (!saveAccounts(accounts)) return;

        message(
            "signupMessage",
            "Account created! You can now log in."
        );

        toast("Account created successfully.");

        $("signupForm").reset();

        setTimeout(() => showPage($("loginPage")), 700);
    });

    // Login
    $("loginForm").addEventListener("submit", (event) => {
        event.preventDefault();

        const username = clean($("loginUsername").value);
        const password = $("loginPassword").value;

        const account = getAccounts().find(
            (item) =>
                clean(item.username).toLowerCase() === username.toLowerCase() &&
                item.password === password
        );

        if (!account) {
            message(
                "loginMessage",
                "Incorrect username or password.",
                true
            );
            return;
        }

        message("loginMessage", "Login successful!");

        loadDashboard(account.username);
    });

    // Reset password (demo only)
    $("resetForm").addEventListener("submit", (event) => {
        event.preventDefault();

        const username = clean($("resetUsername").value);
        const password = $("resetPassword").value;

        const accounts = getAccounts();

        const account = accounts.find(
            (item) =>
                clean(item.username).toLowerCase() === username.toLowerCase()
        );

        if (!account) {
            message("resetMessage", "Username not found.", true);
            return;
        }

        if (password.length < 4) {
            message(
                "resetMessage",
                "Password must be at least 4 characters.",
                true
            );
            return;
        }

        account.password = password;

        if (!saveAccounts(accounts)) return;

        message(
            "resetMessage",
            "Password updated. Please log in."
        );

        setTimeout(() => showPage($("loginPage")), 800);
    });

    // Logout
    $("logoutButton").addEventListener("click", () => {
        currentUser = "";

        $("loginPassword").value = "";

        showPage($("loginPage"));

        message("loginMessage", "You have logged out.");
    });

    // Dark and light mode
    $("themeButton").addEventListener("click", () => {
        document.body.classList.toggle("light-mode");

        const light = document.body.classList.contains("light-mode");

        localStorage.setItem(
            "arnabTheme",
            light ? "light" : "dark"
        );

        $("themeButton").textContent =
            light ? "☀️ Light Mode" : "🌙 Dark Mode";
    });

    if (localStorage.getItem("arnabTheme") === "light") {
        document.body.classList.add("light-mode");
        $("themeButton").textContent = "☀️ Light Mode";
    }

    // Change profile photo
    $("profilePhotoInput").addEventListener("change", (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast("Please choose an image file.", true);
            return;
        }

        if (file.size > 1024 * 1024) {
            toast("Choose a photo under 1 MB.", true);
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            try {
                localStorage.setItem(
                    photoKey(currentUser),
                    reader.result
                );

                loadProfileUI();

                toast("Profile photo updated.");
            } catch {
                toast("Photo is too large for browser storage.", true);
            }
        };

        reader.readAsDataURL(file);

        event.target.value = "";
    });

    // Remove profile photo
    $("removeProfilePhoto").addEventListener("click", () => {
        if (!currentUser) return;

        localStorage.removeItem(photoKey(currentUser));

        loadProfileUI();

        toast("Profile photo removed.");
    });

    // Add a new task
    $("premiumTaskForm").addEventListener("submit", (event) => {
        event.preventDefault();

        const text = clean($("premiumTaskInput").value);

        if (!text) return;

        const tasks = getTasks();

        tasks.push({
            id: Date.now().toString(),
            text: text,
            done: false,
            priority: $("taskPriorityInput").value || "Normal",
            deadline: $("taskDeadlineInput").value || ""
        });

        if (saveTasks(tasks)) {
            $("premiumTaskInput").value = "";
            $("taskPriorityInput").value = "Normal";
            $("taskDeadlineInput").value = "";

            renderTasks();
            renderWeekly();

            notify("New task added: " + text);
            toast("Task added.");
        }
    });

    // Save personal note
    $("messageForm").addEventListener("submit", (event) => {
        event.preventDefault();

        if (!currentUser) return;

        localStorage.setItem(
            noteKey(currentUser),
            $("userMessage").value
        );

        message(
            "messageStatus",
            "Your note has been saved on this device."
        );

        toast("Note saved.");
    });

    // Mark all notifications as read
    $("markNotificationsRead").addEventListener("click", () => {
        if (!currentUser) return;

        const items = readJSON(
            notificationKey(currentUser),
            []
        ).map((item) => ({
            ...item,
            read: true
        }));

        saveJSON(notificationKey(currentUser), items);

        renderNotifications();

        toast("All notifications marked as read.");
    });

    // Clear all notifications
    $("clearNotifications").addEventListener("click", () => {
        if (!currentUser) return;

        if (!confirm("Clear all notifications?")) return;

        saveJSON(notificationKey(currentUser), []);

        renderNotifications();

        toast("Notifications cleared.");
    });

    // Start live clock
    function tick() {
        updateClock();
    }

    tick();

    setInterval(tick, 1000);

    // This is a learning/demo website, not secure production authentication.
});
