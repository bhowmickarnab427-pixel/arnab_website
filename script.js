
document.addEventListener("DOMContentLoaded", function () {
    // ===== Get HTML elements =====
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

    const profilePhoto = document.getElementById("profilePhoto");
    const profilePhotoPlaceholder =
        document.getElementById("profilePhotoPlaceholder");
    const profilePhotoInput =
        document.getElementById("profilePhotoInput");
    const removeProfilePhoto =
        document.getElementById("removeProfilePhoto");

    let currentUsername = "";
    let clockInterval = null;

    // ===== Show selected page =====
    function showPage(page) {
        [loginPage, signupPage, resetPage, namePage].forEach(function (item) {
            item.classList.add("hidden");
        });

        page.classList.remove("hidden");
    }

    // ===== Show status messages =====
    function showMessage(element, message, success = false) {
        if (!element) return;

        element.textContent = message;
        element.style.color = success ? "#75ff9a" : "#ffb4b4";
    }

    // ===== Read accounts from localStorage =====
    function getAccounts() {
        try {
            const data = JSON.parse(localStorage.getItem("arnabAccounts"));
            return data && typeof data === "object" && !Array.isArray(data)
                ? data
                : {};
        } catch (error) {
            return {};
        }
    }

    // ===== Save accounts =====
    function saveAccounts(accounts) {
        try {
            localStorage.setItem("arnabAccounts", JSON.stringify(accounts));
            return true;
        } catch (error) {
            return false;
        }
    }

    // ===== Password show/hide eye buttons =====
    document.querySelectorAll(".eye-button").forEach(function (button) {
        button.addEventListener("click", function () {
            const input = document.getElementById(
                button.getAttribute("data-password")
            );

            if (!input) return;

            const showPassword = input.type === "password";

            input.type = showPassword ? "text" : "password";
            button.textContent = showPassword ? "🙈" : "👁";
            button.setAttribute(
                "aria-label",
                showPassword ? "Hide password" : "Show password"
            );
            button.title = showPassword ? "Hide password" : "Show password";
        });
    });

    // ===== Open Create Account =====
    document.getElementById("signupButton").addEventListener("click", function () {
        signupForm.reset();
        signupMessage.textContent = "";
        showPage(signupPage);
    });

    // ===== Back to Login =====
    document.getElementById("backButton").addEventListener("click", function () {
        showPage(loginPage);
        signupMessage.textContent = "";
    });

    // ===== Open Forgot Password =====
    document.getElementById("forgotPasswordButton").addEventListener("click", function () {
        resetForm.reset();
        resetMessage.textContent = "";
        showPage(resetPage);
    });

    // ===== Back from Reset Password =====
    document.getElementById("resetBackButton").addEventListener("click", function () {
        showPage(loginPage);
        resetMessage.textContent = "";
    });

    // ===== Create Account =====
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

        if (Object.prototype.hasOwnProperty.call(accounts, accountKey)) {
            showMessage(signupMessage, "Username already exists. Try another.");
            return;
        }

        accounts[accountKey] = {
            username: username,
            password: password
        };

        if (!saveAccounts(accounts)) {
            showMessage(
                signupMessage,
                "Could not save your account in this browser."
            );
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

    // ===== Login =====
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = document.getElementById("loginUsername").value.trim();
        const password = document.getElementById("loginPassword").value;

        const accounts = getAccounts();
        const accountKey = username.toLowerCase();
        const account = Object.prototype.hasOwnProperty.call(accounts, accountKey)
            ? accounts[accountKey]
            : null;

        if (!account || account.password !== password) {
            showMessage(loginMessage, "Invalid username or password.");
            return;
        }

        currentUsername = account.username;

        document.getElementById("loginPassword").value = "";
        loginMessage.textContent = "";

        loadDashboard();
    });

    // ===== Reset Password =====
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

        if (!Object.prototype.hasOwnProperty.call(accounts, accountKey)) {
            showMessage(resetMessage, "Username does not exist.");
            return;
        }

        accounts[accountKey].password = newPassword;

        if (!saveAccounts(accounts)) {
            showMessage(resetMessage, "Could not update your password.");
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

    // ===== Load Dashboard =====
    function loadDashboard() {
        showPage(namePage);

        document.getElementById("displayName2").textContent =
            "Login Successful!";

        document.getElementById("displayName3").textContent =
            "Welcome back, " + currentUsername + ".";

        document.getElementById("notification").textContent =
            "Welcome " + currentUsername + "! You are logged in.";

        loadProfilePhoto();
        updateClock();
        updateGreeting();

        if (clockInterval) {
            clearInterval(clockInterval);
        }

        clockInterval = setInterval(function () {
            updateClock();
            updateGreeting();
        }, 1000);
    }

    // ===== Greeting based on local device time =====
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

    // ===== Live Clock and Date =====
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

    // ===== Get the current user's photo key =====
    function getProfilePhotoKey() {
        return "arnabProfilePhoto_" + currentUsername.toLowerCase();
    }

    // ===== Load this user's saved photo =====
    function loadProfilePhoto() {
        if (!currentUsername) return;

        let savedPhoto = null;

        try {
            savedPhoto = localStorage.getItem(getProfilePhotoKey());
        } catch (error) {
            savedPhoto = null;
        }

        if (savedPhoto) {
            profilePhoto.src = savedPhoto;
            profilePhoto.classList.remove("hidden");
            profilePhotoPlaceholder.classList.add("hidden");
        } else {
            profilePhoto.removeAttribute("src");
            profilePhoto.classList.add("hidden");
            profilePhotoPlaceholder.classList.remove("hidden");
        }
    }

    // ===== Upload and save profile photo =====
    profilePhotoInput.addEventListener("change", function () {
        const file = profilePhotoInput.files[0];

        if (!file) return;

        if (!currentUsername) {
            alert("Please log in before changing your profile photo.");
            profilePhotoInput.value = "";
            return;
        }

        if (!file.type.startsWith("image/")) {
            alert("Please select an image file.");
            profilePhotoInput.value = "";
            return;
        }

        if (file.size > 1024 * 1024) {
            alert("Please choose an image smaller than 1 MB.");
            profilePhotoInput.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = function () {
            try {
                localStorage.setItem(getProfilePhotoKey(), reader.result);
                loadProfilePhoto();
            } catch (error) {
                alert("Could not save the photo. Try a smaller image.");
            }

            profilePhotoInput.value = "";
        };

        reader.onerror = function () {
            alert("Could not read the image. Please try another.");
            profilePhotoInput.value = "";
        };

        reader.readAsDataURL(file);
    });

    // ===== Remove current user's profile photo =====
    removeProfilePhoto.addEventListener("click", function () {
        if (!currentUsername) return;

        try {
            localStorage.removeItem(getProfilePhotoKey());
            loadProfilePhoto();
        } catch (error) {
            alert("Could not remove the photo. Please try again.");
        }
    });

    // ===== Demo message box =====
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

    // ===== Logout =====
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
        profilePhotoInput.value = "";

        profilePhoto.removeAttribute("src");
        profilePhoto.classList.add("hidden");
        profilePhotoPlaceholder.classList.remove("hidden");

        showPage(loginPage);
        showMessage(loginMessage, "You have logged out successfully.", true);
    });

    // ===== Start on Login page =====
    showPage(loginPage);
});
