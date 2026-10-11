
document.addEventListener("DOMContentLoaded", function () {

    // Get HTML elements
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
            if (item) item.classList.add("hidden");
        });

        if (page) page.classList.remove("hidden");
    }

    // Display messages
    function showMessage(element, message, success = false) {
        if (!element) return;

        element.textContent = message;
        element.style.color = success ? "#75ff9a" : "#ffb4b4";
    }

    // Read saved accounts
    function getAccounts() {
        try {
            return JSON.parse(localStorage.getItem("arnabAccounts")) || {};
        } catch (error) {
            return {};
        }
    }

    // Save accounts
    function saveAccounts(accounts) {
        try {
            localStorage.setItem("arnabAccounts", JSON.stringify(accounts));
            return true;
        } catch (error) {
            return false;
        }
    }

    // Add password eye buttons automatically
    function addPasswordEyes() {
        const passwordIds = [
            "loginPassword",
            "signupPassword",
            "resetPassword"
        ];

        passwordIds.forEach(function (id) {
            const input = document.getElementById(id);

            if (!input || input.dataset.eyeAdded === "true") return;

            // Create wrapper
            const wrapper = document.createElement("div");
            wrapper.className = "password-box";
            wrapper.style.position = "relative";
            wrapper.style.width = "100%";

            // Place wrapper around password input
            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);

            // Make room for the eye button
            input.style.paddingRight = "48px";
            input.style.width = "100%";
            input.dataset.eyeAdded = "true";

            // Create eye button
            const eyeButton = document.createElement("button");
            eyeButton.type = "button";
            eyeButton.className = "eye-button";
            eyeButton.textContent = "👁";
            eyeButton.setAttribute("aria-label", "Show password");
            eyeButton.title = "Show password";

            eyeButton.style.position = "absolute";
            eyeButton.style.right = "10px";
            eyeButton.style.top = "50%";
            eyeButton.style.transform = "translateY(-50%)";
            eyeButton.style.zIndex = "2";
            eyeButton.style.cursor = "pointer";
            eyeButton.style.border = "none";
            eyeButton.style.background = "transparent";
            eyeButton.style.padding = "5px";
            eyeButton.style.fontSize = "18px";
            eyeButton.style.lineHeight = "1";

            wrapper.appendChild(eyeButton);

            // Toggle password visibility
            eyeButton.addEventListener("click", function () {
                const isHidden = input.type === "password";

                input.type = isHidden ? "text" : "password";
                eyeButton.textContent = isHidden ? "🙈" : "👁";
                eyeButton.setAttribute(
                    "aria-label",
                    isHidden ? "Hide password" : "Show password"
                );
                eyeButton.title = isHidden ? "Hide password" : "Show password";

                input.focus();
            });
        });
    }

    addPasswordEyes();

    // Open Create Account page
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

    // Create Account
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

        if (!saveAccounts(accounts)) {
            showMessage(signupMessage, "Could not save account in this browser.");
            return;
        }

        signupForm.reset();
        document.getElementById("loginUsername").value = username;

        showPage(loginPage);
        showMessage(
            loginMessage,
            "Account created successfully! Please log in.",
            true
        );
    });

    // Login
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

    // Reset Password
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

        if (!saveAccounts(accounts)) {
            showMessage(resetMessage, "Could not update password.");
            return;
        }

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

        updateGreeting();

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

        clockInterval = setInterval(function () {
            updateClock();
            updateGreeting();
        }, 1000);
    }

    // Greeting based on the device's local time
    function updateGreeting() {
        const hour = new Date().getHours();
        let greeting;

        if (hour < 12) {
            greeting = "Good Morning";
        } else if (hour < 17) {
            greeting = "Good Afternoon";
        } else {
            greeting = "Good Evening";
        }

        document.getElementById("displayName").textContent =
            greeting + ", " + currentUsername + "!";
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

    // Demo message box
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

    // Show Login page on startup
    showPage(loginPage);
});
