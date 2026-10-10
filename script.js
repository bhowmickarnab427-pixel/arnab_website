
document.addEventListener("DOMContentLoaded", function () {

    // ==============================
    // 1. EMAILJS SETTINGS
    // ==============================
    const EMAILJS_PUBLIC_KEY = "YrXDJS1iftBH_jxh3";
    const EMAILJS_SERVICE_ID = "7602720057";
    const EMAILJS_TEMPLATE_ID = "template_o4g9k6t";

    const $ = (id) => document.getElementById(id);

    // ==============================
    // 2. GET HTML ELEMENTS
    // ==============================
    const loginPage = $("loginPage");
    const signupPage = $("signupPage");
    const resetPage = $("resetPage");
    const namePage = $("namePage");

    let currentUsername = "";
    let clockTimer = null;

    // ==============================
    // 3. INITIALIZE EMAILJS
    // ==============================
    if (window.emailjs) {
        emailjs.init({
            publicKey: EMAILJS_PUBLIC_KEY
        });
    }

    // ==============================
    // 4. SHOW PAGE
    // ==============================
    function showPage(page) {
        [loginPage, signupPage, resetPage, namePage].forEach(function (item) {
            if (item) {
                item.classList.add("hidden");
            }
        });

        if (page) {
            page.classList.remove("hidden");
        }
    }

    // ==============================
    // 5. SHOW MESSAGE
    // ==============================
    function showMessage(id, message, isError = false) {
        const element = $(id);

        if (!element) return;

        element.textContent = message;
        element.style.color = isError ? "#ff9caa" : "#9ef0be";
    }

    // ==============================
    // 6. NOTIFICATION
    // ==============================
    function notify(message, isError = false) {
        const element = $("notification");

        if (!element) return;

        element.textContent = message;
        element.style.color = isError ? "#ff9caa" : "#9ef0be";
    }

    // ==============================
    // 7. GET SAVED ACCOUNTS
    // ==============================
    function getAccounts() {
        try {
            return JSON.parse(
                localStorage.getItem("arnabAccounts") || "{}"
            );
        } catch (error) {
            return {};
        }
    }

    // ==============================
    // 8. SIGN UP BUTTON
    // ==============================
    $("signupButton").addEventListener("click", function () {
        showMessage("signupMessage", "");
        $("signupForm").reset();
        showPage(signupPage);
    });

    // BACK TO LOGIN
    $("backButton").addEventListener("click", function () {
        showPage(loginPage);
    });

    $("resetBackButton").addEventListener("click", function () {
        showPage(loginPage);
    });

    // FORGOT PASSWORD BUTTON
    $("forgotPasswordButton").addEventListener("click", function () {
        showMessage("resetMessage", "");
        showPage(resetPage);
    });

    // ==============================
    // 9. SIGN UP
    // ==============================
    $("signupForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const username = $("signupUsername").value.trim();
        const email = $("signupEmail").value.trim().toLowerCase();
        const password = $("signupPassword").value;

        if (username.length < 3) {
            showMessage(
                "signupMessage",
                "Username must have at least 3 characters.",
                true
            );
            return;
        }

        if (password.length < 6) {
            showMessage(
                "signupMessage",
                "Password must have at least 6 characters.",
                true
            );
            return;
        }

        const accounts = getAccounts();

        // Check duplicate email
        if (accounts[email]) {
            showMessage(
                "signupMessage",
                "This email already has an account. Please log in.",
                true
            );
            return;
        }

        // Check duplicate username
        const usernameExists = Object.values(accounts).some(function (account) {
            return account.username.toLowerCase() === username.toLowerCase();
        });

        if (usernameExists) {
            showMessage(
                "signupMessage",
                "This username is already taken.",
                true
            );
            return;
        }

        // Save account in this browser
        accounts[email] = {
            username: username,
            email: email,
            password: password
        };

        try {
            localStorage.setItem(
                "arnabAccounts",
                JSON.stringify(accounts)
            );
        } catch (error) {
            showMessage(
                "signupMessage",
                "Account could not be saved in this browser.",
                true
            );
            return;
        }

        $("signupForm").reset();

        $("loginUsername").value = email;

        showPage(loginPage);

        showMessage(
            "loginMessage",
            "✅ Account created! Please log in with your email and password."
        );
    });

    // ==============================
    // 10. LOGIN
    // ==============================
    $("loginForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const email = $("loginUsername").value.trim().toLowerCase();
        const password = $("loginPassword").value;

        const accounts = getAccounts();
        const account = accounts[email];

        if (!account || account.password !== password) {
            showMessage(
                "loginMessage",
                "❌ Invalid email or password. Please try again.",
                true
            );
            return;
        }

        currentUsername = account.username;

        $("loginPassword").value = "";

        showMessage(
            "loginMessage",
            "✅ Login Successful!"
        );

        loadDashboard();
    });

    // ==============================
    // 11. FORGOT PASSWORD
    // ==============================
    $("resetForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const username = $("resetUsername").value.trim();
        const email = $("resetEmail").value.trim().toLowerCase();
        const newPassword = $("resetPassword").value;

        const accounts = getAccounts();
        const account = accounts[email];

        if (
            !account ||
            account.username.toLowerCase() !== username.toLowerCase()
        ) {
            showMessage(
                "resetMessage",
                "Username or email does not match.",
                true
            );
            return;
        }

        if (newPassword.length < 6) {
            showMessage(
                "resetMessage",
                "New password must have at least 6 characters.",
                true
            );
            return;
        }

        account.password = newPassword;

        try {
            localStorage.setItem(
                "arnabAccounts",
                JSON.stringify(accounts)
            );
        } catch (error) {
            showMessage(
                "resetMessage",
                "Could not save the new password.",
                true
            );
            return;
        }

        $("resetForm").reset();
        $("loginUsername").value = email;

        showPage(loginPage);

        showMessage(
            "loginMessage",
            "✅ Password changed. Log in with your new password."
        );
    });

    // ==============================
    // 12. GREETING
    // ==============================
    function getGreeting() {
        const hour = new Date().getHours();

        if (hour < 12) return "🌅 Good Morning";
        if (hour < 17) return "☀️ Good Afternoon";
        if (hour < 21) return "🌇 Good Evening";

        return "🌙 Good Night";
    }

    // ==============================
    // 13. LIVE CLOCK AND DATE
    // ==============================
    function updateClock() {
        const now = new Date();

        $("liveClock").textContent =
            now.toLocaleTimeString();

        $("liveDate").textContent =
            now.toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            });

        $("displayName3").textContent = getGreeting();
    }

    // ==============================
    // 14. LOAD DASHBOARD
    // ==============================
    function loadDashboard() {
        showPage(namePage);

        $("displayName").textContent =
            "Hi, " + currentUsername;

        $("displayName2").textContent =
            "Login Successful!";

        updateClock();

        if (clockTimer) {
            clearInterval(clockTimer);
        }

        clockTimer = setInterval(updateClock, 1000);

        notify("Welcome back, " + currentUsername + "!");
    }

    // ==============================
    // 15. SEND MESSAGE USING EMAILJS
    // ==============================
    $("messageForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const message = $("userMessage").value.trim();

        if (!message) {
            showMessage(
                "messageStatus",
                "Please write a message first.",
                true
            );
            return;
        }

        if (!window.emailjs) {
            showMessage(
                "messageStatus",
                "EmailJS did not load. Refresh the page and try again.",
                true
            );
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

            showMessage(
                "messageStatus",
                "✅ Message sent successfully!"
            );

        } catch (error) {
            console.error("EmailJS error:", error);

            showMessage(
                "messageStatus",
                "❌ Message failed. Please check your EmailJS settings.",
                true
            );
        } finally {
            $("sendButton").disabled = false;
            $("sendButton").textContent = "Send Message";
        }
    });

    // ==============================
    // 16. LOGOUT
    // ==============================
    $("logoutButton").addEventListener("click", function () {
        if (clockTimer) {
            clearInterval(clockTimer);
            clockTimer = null;
        }

        currentUsername = "";

        $("loginForm").reset();
        $("messageForm").reset();

        showPage(loginPage);

        showMessage(
            "loginMessage",
            "You have logged out successfully."
        );
    });

    // ==============================
    // 17. START WEBSITE
    // ==============================
    showPage(loginPage);

});
