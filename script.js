
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

    // Show selected page
    function showPage(page) {
        [loginPage, signupPage, resetPage, namePage].forEach(function (item) {
            item.classList.add("hidden");
        });

        page.classList.remove("hidden");
    }

    // Show success or error message
    function showMessage(element, message, success = false) {
        element.textContent = message;
        element.style.color = success ? "#75ff9a" : "#ffb4b4";
    }

    // Get saved accounts
    function getAccounts() {
        try {
            return JSON.parse(localStorage.getItem("arnabAccounts")) || {};
        } catch (error) {
            return {};
        }
    }

    // Save accounts
    function saveAccounts(accounts) {
        localStorage.setItem("arnabAccounts", JSON.stringify(accounts));
    }

    // Open Create Account
    document.getElementById("signupButton").addEventListener("click", function () {
        signupForm.reset();
        signupMessage.textContent = "";
        showPage(signupPage);
    });

    // Back to Login
    document.getElementById("backButton").addEventListener("click", function () {
        showPage(loginPage);
        signupMessage.textContent = "";
    });

    // Open Forgot Password
    document.getElementById("forgotPasswordButton").addEventListener("click", function () {
        resetForm.reset();
        resetMessage.textContent = "";
        showPage(resetPage);
    });

    // Back from Reset Password
    document.getElementById("resetBackButton").addEventListener("click", function () {
        showPage(loginPage);
        resetMessage.textContent = "";
    });

    // Create Account without Email
    signupForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = document.getElementById("signupUsername").value.trim();
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
        const accountKey = username.toLowerCase();

        if (accounts[accountKey]) {
            showMessage(signupMessage, "Username already exists. Try another.");
            return;
        }

        accounts[accountKey] = {
            username: username,
            password: password
        };

        saveAccounts(accounts);

        signupForm.reset();
        document.getElementById("loginUsername").value = username;

        showPage(loginPage);

        showMessage(
            loginMessage,
            "Account created successfully! Please log in.",
            true
        );
    });

    // Login using Username and Password
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = document.getElementById("loginUsername").value.trim();
        const password = document.getElementById("loginPassword").value;

        const accounts = getAccounts();
        const account = accounts[username.toLowerCase()];

        if (!account || account.password !== password) {
            showMessage(loginMessage, "Invalid username or password.");
            return;
        }

        currentUsername = account.username;

        document.getElementById("loginPassword").value = "";
        loginMessage.textContent = "";

        loadDashboard();
    });

    // Change Password using Username
    resetForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = document.getElementById("resetUsername").value.trim();
        const newPassword = document.getElementById("resetPassword").value;

        if (newPassword.length < 6) {
            showMessage(resetMessage, "Password must be at least 6 characters.");
            return;
        }

        const accounts = getAccounts();
        const accountKey = username.toLowerCase();

        if (!accounts[accountKey]) {
            showMessage(resetMessage, "Username does not exist.");
            return;
        }

        accounts[accountKey].password = newPassword;
        saveAccounts(accounts);

        resetForm.reset();
        showPage(loginPage);

        showMessage(
            loginMessage,
            "Password changed successfully. Please log in.",
            true
        );
    });

    // Load Dashboard
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

        document.getElementById("displayName2").textContent =
            "Login Successful!";

        document.getElementById("displayName3").textContent =
            "Welcome back, " + currentUsername + ".";

        document.getElementById("notification").textContent =
            "Welcome " + currentUsername + "! You are logged in.";

        updateClock();

        if (clockInterval) {
            clearInterval(clockInterval);
        }

        clockInterval = setInterval(updateClock, 1000);
    }

    // Live Clock and Date
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

    // Demo Message Box
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

    // Open Login Page first
    showPage(loginPage);
});
