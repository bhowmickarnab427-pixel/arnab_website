
document.addEventListener("DOMContentLoaded", function () {

    // EmailJS settings
    const EMAILJS_PUBLIC_KEY = "YrXDJS1iftBH_jxh3";
    const EMAILJS_SERVICE_ID = "7602720057";
    const EMAILJS_TEMPLATE_ID = "template_o4g9k6t";

    // HTML elements
    const $ = (id) => document.getElementById(id);

    const loginPage = $("loginPage");
    const signupPage = $("signupPage");
    const resetPage = $("resetPage");
    const namePage = $("namePage");

    let currentUsername = "";
    let clockTimer = null;

    // Initialize EmailJS
    if (window.emailjs) {
        emailjs.init({
            publicKey: EMAILJS_PUBLIC_KEY
        });
    }

    // Show a page
    function showPage(page) {
        [loginPage, signupPage, resetPage, namePage].forEach(function (item) {
            item.classList.add("hidden");
        });

        page.classList.remove("hidden");
    }

    // Show messages
    function showMessage(id, message, isError = false) {
        const element = $(id);
        element.textContent = message;
        element.style.color = isError ? "#ff9caa" : "#9ef0be";
    }

    // Notifications
    function notify(message, isError = false) {
        const element = $("notification");
        element.textContent = message;
        element.style.color = isError ? "#ff9caa" : "#9ef0be";
    }

    // Get saved accounts
    function getAccounts() {
        try {
            return JSON.parse(localStorage.getItem("arnabAccounts")) || {};
        } catch (error) {
            return {};
        }
    }

    // Navigation
    $("signupButton").addEventListener("click", function () {
        showMessage("signupMessage", "");
        showPage(signupPage);
    });

    $("backButton").addEventListener("click", function () {
        showPage(loginPage);
    });

    $("resetBackButton").addEventListener("click", function () {
        showPage(loginPage);
    });

    $("forgotPasswordButton").addEventListener("click", function () {
        showMessage("resetMessage", "");
        showPage(resetPage);
    });

    // SIGN UP
    $("signupForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const username = $("signupUsername").value.trim();
        const email = $("signupEmail").value.trim().toLowerCase();
        const password = $("signupPassword").value;

        if (username.length < 3) {
            showMessage("signupMessage",
                "Username must contain at least 3 characters.", true);
            return;
        }

        if (password.length < 6) {
            showMessage("signupMessage",
                "Password must contain at least 6 characters.", true);
            return;
        }

        const accounts = getAccounts();

        const usernameExists = Object.values(accounts).some(function (account) {
            return account.username.toLowerCase() === username.toLowerCase();
        });

        if (accounts[email]) {
            showMessage("signupMessage",
                "This email already has an account.", true);
            return;
        }

        if (usernameExists) {
            showMessage("signupMessage",
                "This username is already taken.", true);
            return;
        }

        accounts[email] = {
            username: username,
            email: email,
            password: password
        };

        try {
            localStorage.setItem("arnabAccounts", JSON.stringify(accounts));
        } catch (error) {
            showMessage("signupMessage",
                "Could not save account in this browser.", true);
            return;
        }

        $("signupForm").reset();

        showMessage("signupMessage",
            "Account created! Now log in with your email and password.");

        $("loginUsername").value = email;
        showPage(loginPage);
    });

    // LOGIN
    $("loginForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const email = $("loginUsername").value.trim().toLowerCase();
        const password = $("loginPassword").value;
        const accounts = getAccounts();

        const account = accounts[email];

        if (!account || account.password !== password) {
            showMessage("loginMessage",
                "Email or password is incorrect. Please sign up first if you are new.",
                true);
            return;
        }

        currentUsername = account.username;

        $("loginPassword").value = "";

        loadDashboard();
    });

    // FORGOT PASSWORD
    $("resetForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const username = $("resetUsername").value.trim();
        const email = $("resetEmail").value.trim().toLowerCase();
        const newPassword = $("resetPassword").value;

        const accounts = getAccounts();
        const account = accounts[email];

        if (!account ||
            account.username.toLowerCase() !== username.toLowerCase()) {
            showMessage("resetMessage",
                "Username or email does not match.", true);
            return;
        }

        if (newPassword.length < 6) {
            showMessage("resetMessage",
                "New password must contain at least 6 characters.", true);
            return;
        }

        account.password = newPassword;

        try {
            localStorage.setItem("arnabAccounts", JSON.stringify(accounts));
        } catch (error) {
            showMessage("resetMessage",
                "Could not save the new password.", true);
            return;
        }

        $("resetForm").reset();
        $("loginUsername").value = email;

        showMessage("loginMessage",
            "Password changed. Please log in with your new password.");

        showPage(loginPage);
    });

    // Greeting
    function getGreeting() {
        const hour = new Date().getHours();

        if (hour < 12) return "🌅 Good Morning";
        if (hour < 17) return "☀️ Good Afternoon";
        if (hour < 21) return "🌇 Good Evening";

        return "🌙 Good Night";
    }

    // Live clock and date
    function updateClock() {
        const now = new Date();

        $("liveClock").textContent = now.toLocaleTimeString();

        $("liveDate").textContent = now.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        $("displayName3").textContent = getGreeting();
    }

    // Dashboard
    function loadDashboard() {
        showPage(namePage);

        $("displayName").textContent = "Hi, " + currentUsername;
        $("displayName2").textContent = "Login Successful!";

        updateClock();

        if (clockTimer) {
            clearInterval(clockTimer);
        }

        clockTimer = setInterval(updateClock, 1000);

        notify("Welcome back, " + currentUsername + "!");
    }

    // SEND MESSAGE USING EMAILJS
    $("messageForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const message = $("userMessage").value.trim();

        if (!message) {
            showMessage("messageStatus", "Please write a message.", true);
            return;
        }

        if (!window.emailjs) {
            showMessage("messageStatus",
                "EmailJS did not load. Please refresh the page.", true);
            return;
        }

        $("sendButton").disabled = true;
        $("sendButton").textContent = "Sending...";

        try {
            await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                {
                    from_name: currentUsername,
                    message: message
                }
            );

            $("userMessage").value = "";

            showMessage("messageStatus",
                "Message sent successfully!");

        } catch (error) {
            console.error("EmailJS error:", error);

            showMessage("messageStatus",
                "Message could not be sent. Check your EmailJS settings.",
                true);
        } finally {
            $("sendButton").disabled = false;
            $("sendButton").textContent = "Send Message";
        }
    });

    // LOGOUT
    $("logoutButton").addEventListener("click", function () {
        if (clockTimer) {
            clearInterval(clockTimer);
            clockTimer = null;
        }

        currentUsername = "";

        $("loginForm").reset();
        $("messageForm").reset();

        showPage(loginPage);

        showMessage("loginMessage", "You have logged out.");
    });

    // Start on login page
    showPage(loginPage);

});
