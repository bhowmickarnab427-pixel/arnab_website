
document.addEventListener("DOMContentLoaded", function () {
    const loginPage = document.getElementById("loginPage");
    const signupPage = document.getElementById("signupPage");
    const resetPage = document.getElementById("resetPage");
    const namePage = document.getElementById("namePage");

    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const resetForm = document.getElementById("resetForm");
    const messageForm = document.getElementById("messageForm");

    const loginMessage = document.getElementById("loginMessage");
    const signupMessage = document.getElementById("signupMessage");
    const resetMessage = document.getElementById("resetMessage");
    const messageStatus = document.getElementById("messageStatus");

    let currentUsername = "";
    let clockInterval = null;

    function showPage(page) {
        [loginPage, signupPage, resetPage, namePage].forEach(function (item) {
            item.classList.add("hidden");
        });

        page.classList.remove("hidden");
    }

    function showMessage(element, message, success = false) {
        element.textContent = message;
        element.style.color = success ? "#75ff9a" : "#ffb4b4";
    }

    function getAccounts() {
        try {
            return JSON.parse(localStorage.getItem("arnabAccounts")) || {};
        } catch (error) {
            return {};
        }
    }

    function saveAccounts(accounts) {
        localStorage.setItem("arnabAccounts", JSON.stringify(accounts));
    }

    document.getElementById("signupButton").addEventListener("click", function () {
        signupForm.reset();
        signupMessage.textContent = "";
        showPage(signupPage);
    });

    document.getElementById("backButton").addEventListener("click", function () {
        showPage(loginPage);
        signupMessage.textContent = "";
    });

    document.getElementById("forgotPasswordButton").addEventListener("click", function () {
        resetForm.reset();
        resetMessage.textContent = "";
        showPage(resetPage);
    });

    document.getElementById("resetBackButton").addEventListener("click", function () {
        showPage(loginPage);
        resetMessage.textContent = "";
    });

    // Sign Up
    signupForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = document.getElementById("signupUsername").value.trim();
        const email = document.getElementById("signupEmail").value.trim().toLowerCase();
        const password = document.getElementById("signupPassword").value;

        if (username.length < 3) {
            showMessage(signupMessage, "Username must be at least 3 characters.");
            return;
        }

        if (password.length < 6) {
            showMessage(signupMessage, "Password must be at least 6 characters.");
            return;
        }

        const accounts = getAccounts();

        const usernameExists = Object.values(accounts).some(function (account) {
            return account.username.toLowerCase() === username.toLowerCase();
        });

        if (accounts[email]) {
            showMessage(signupMessage, "This email is already registered.");
            return;
        }

        if (usernameExists) {
            showMessage(signupMessage, "This username already exists.");
            return;
        }

        accounts[email] = { username, email, password };
        saveAccounts(accounts);

        signupForm.reset();
        document.getElementById("loginUsername").value = username;

        showPage(loginPage);
        showMessage(loginMessage, "Account created successfully! Please log in.", true);
    });

    // Login using Username
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = document.getElementById("loginUsername").value.trim();
        const password = document.getElementById("loginPassword").value;
        const accounts = getAccounts();

        const account = Object.values(accounts).find(function (item) {
            return item.username.toLowerCase() === username.toLowerCase();
        });

        if (!account || account.password !== password) {
            showMessage(loginMessage, "Invalid username or password.");
            return;
        }

        currentUsername = account.username;
        document.getElementById("loginPassword").value = "";
        loginMessage.textContent = "";

        loadDashboard();
    });

    // Forgot Password
    resetForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = document.getElementById("resetUsername").value.trim();
        const email = document.getElementById("resetEmail").value.trim().toLowerCase();
        const newPassword = document.getElementById("resetPassword").value;

        const accounts = getAccounts();
        const account = accounts[email];

        if (!account || account.username.toLowerCase() !== username.toLowerCase()) {
            showMessage(resetMessage, "Username and email do not match.");
            return;
        }

        if (newPassword.length < 6) {
            showMessage(resetMessage, "Password must be at least 6 characters.");
            return;
        }

        account.password = newPassword;
        saveAccounts(accounts);

        resetForm.reset();
        showPage(loginPage);
        showMessage(loginMessage, "Password changed successfully. Please log in.", true);
    });

    // Dashboard
    function loadDashboard() {
        showPage(namePage);

        const hour = new Date().getHours();
        let greeting = "Good Evening";

        if (hour < 12) {
            greeting = "Good Morning";
        } else if (hour < 17) {
            greeting = "Good Afternoon";
        }

        document.getElementById("displayName").textContent =
            greeting + ", " + currentUsername + "!";

        document.getElementById("displayName2").textContent = "Login Successful!";
        document.getElementById("displayName3").textContent =
            "Welcome back, " + currentUsername + ".";

        document.getElementById("notification").textContent =
            "Welcome " + currentUsername + "! You are logged in.";

        updateClock();

        if (clockInterval) clearInterval(clockInterval);
        clockInterval = setInterval(updateClock, 1000);
    }

    function updateClock() {
        const now = new Date();

        document.getElementById("liveClock").textContent =
            now.toLocaleTimeString();

        document.getElementById("liveDate").textContent =
            now.toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            });
    }

    // Demo message box (does not send email or SMS)
    messageForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const message = document.getElementById("userMessage").value.trim();

        if (!message) {
            showMessage(messageStatus, "Please write a message.");
            return;
        }

        showMessage(
            messageStatus,
            "Message saved for this demo. It has not been sent to anyone.",
            true
        );

        document.getElementById("userMessage").value = "";
    });

    // Logout
    document.getElementById("logoutButton").addEventListener("click", function () {
        currentUsername = "";

        if (clockInterval) {
            clearInterval(clockInterval);
            clockInterval = null;
        }

        loginForm.reset();
        signupForm.reset();
        resetForm.reset();
        messageForm.reset();

        showPage(loginPage);
        showMessage(loginMessage, "You have logged out successfully.", true);
    });

    showPage(loginPage);
});
