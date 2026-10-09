
document.addEventListener("DOMContentLoaded", function () {

    // ===== Get HTML Elements =====
    const loginPage = document.getElementById("loginPage");
    const signupPage = document.getElementById("signupPage");
    const namePage = document.getElementById("namePage");

    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const messageForm = document.getElementById("messageForm");

    const loginUsername = document.getElementById("loginUsername");
    const loginPassword = document.getElementById("loginPassword");

    const signupUsername = document.getElementById("signupUsername");
    const signupPassword = document.getElementById("signupPassword");

    const loginMessage = document.getElementById("loginMessage");
    const signupMessage = document.getElementById("signupMessage");

    const signupButton = document.getElementById("signupButton");
    const backButton = document.getElementById("backButton");
    const forgotPasswordButton =
        document.getElementById("forgotPasswordButton");
    const logoutButton = document.getElementById("logoutButton");

    const displayName = document.getElementById("displayName");
    const displayName2 = document.getElementById("displayName2");
    const displayName3 = document.getElementById("displayName3");

    const userMessage = document.getElementById("userMessage");
    const messageStatus = document.getElementById("messageStatus");
    const sendMessageButton =
        document.getElementById("sendMessageButton");

    // Live Clock and Date
    const liveClock = document.getElementById("liveClock");
    const liveDate = document.getElementById("liveDate");

    // Notification
    const notification = document.getElementById("notification");

    // Edit Profile
    const editProfileButton =
        document.getElementById("editProfileButton");
    const editProfileBox = document.getElementById("editProfileBox");
    const editProfileForm = document.getElementById("editProfileForm");
    const profileDisplayName =
        document.getElementById("profileDisplayName");
    const profileBio = document.getElementById("profileBio");
    const cancelProfileButton =
        document.getElementById("cancelProfileButton");
    const profileStatus = document.getElementById("profileStatus");

    let currentUsername = "";
    let notificationTimer;

    // ===== Get Saved Users =====
    function getUsers() {
        try {
            return JSON.parse(localStorage.getItem("users")) || {};
        } catch (error) {
            return {};
        }
    }

    // ===== Get Saved Profiles =====
    function getProfiles() {
        try {
            return JSON.parse(localStorage.getItem("userProfiles")) || {};
        } catch (error) {
            return {};
        }
    }

    // ===== Notification System =====
    function showNotification(message, type = "success") {
        if (!notification) return;

        clearTimeout(notificationTimer);

        notification.textContent = message;
        notification.className = "notification show " + type;

        notificationTimer = setTimeout(function () {
            notification.classList.remove("show");
        }, 3500);
    }

    // ===== Show Login Page =====
    function showLoginPage() {
        loginPage.classList.remove("hidden");
        signupPage.classList.add("hidden");
        namePage.classList.add("hidden");
    }

    // ===== Live Clock and Date =====
    function updateClock() {
        const now = new Date();

        liveClock.textContent = now.toLocaleTimeString("en-IN");

        liveDate.textContent = now.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    updateClock();
    setInterval(updateClock, 1000);

    // ===== Greeting =====
    function getGreeting() {
        const hour = new Date().getHours();

        if (hour >= 5 && hour < 12) {
            return "Good Morning 🌅";
        } else if (hour >= 12 && hour < 17) {
            return "Good Afternoon ☀️";
        } else if (hour >= 17 && hour < 21) {
            return "Good Evening 🌇";
        } else {
            return "Good Night 🌙";
        }
    }

    // ===== Load Profile =====
    function loadProfile() {
        const profiles = getProfiles();
        const profile = profiles[currentUsername] || {};

        const savedName = profile.name || currentUsername;
        const savedBio = profile.bio || "";

        profileDisplayName.value = savedName;
        profileBio.value = savedBio;

        displayName.textContent =
            "Hi, " + savedName + "! " + getGreeting();

        displayName3.textContent =
            savedBio || "Welcome to your account.";

        profileStatus.textContent = "";
    }

    // ===== Open Sign Up Page =====
    signupButton.addEventListener("click", function () {
        loginPage.classList.add("hidden");
        signupPage.classList.remove("hidden");
        namePage.classList.add("hidden");

        signupMessage.textContent = "";
        loginMessage.textContent = "";
    });

    // ===== Back to Login =====
    backButton.addEventListener("click", function () {
        showLoginPage();
        signupMessage.textContent = "";
    });

    // ===== Sign Up =====
    signupForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = signupUsername.value.trim();
        const password = signupPassword.value;
        const users = getUsers();

        if (!username || !password) {
            signupMessage.style.color = "red";
            signupMessage.textContent =
                "Please enter a username and password.";
            return;
        }

        const existingUsername = Object.keys(users).find(function (name) {
            return name.toLowerCase() === username.toLowerCase();
        });

        if (existingUsername) {
            signupMessage.style.color = "red";
            signupMessage.textContent = "Username already exists!";
            return;
        }

        users[username] = password;
        localStorage.setItem("users", JSON.stringify(users));

        signupMessage.style.color = "green";
        signupMessage.textContent =
            "Account created successfully!";

        signupForm.reset();

        setTimeout(function () {
            showLoginPage();
            loginUsername.value = username;
            loginMessage.style.color = "green";
            loginMessage.textContent =
                "Now login with your password.";
        }, 1000);
    });

    // ===== Login =====
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = loginUsername.value.trim();
        const password = loginPassword.value;
        const users = getUsers();

        const actualUsername = Object.keys(users).find(function (name) {
            return name.toLowerCase() === username.toLowerCase();
        });

        if (!actualUsername) {
            loginMessage.style.color = "red";
            loginMessage.textContent = "Account does not exist!";
            showNotification("Account does not exist!", "error");
            return;
        }

        if (users[actualUsername] !== password) {
            loginMessage.style.color = "red";
            loginMessage.textContent = "Incorrect password!";
            showNotification("Incorrect password!", "error");
            return;
        }

        currentUsername = actualUsername;

        loginPage.classList.add("hidden");
        signupPage.classList.add("hidden");
        namePage.classList.remove("hidden");

        displayName2.textContent = "Login Successful!";

        loadProfile();

        // Show the greeting based on current time
        const profiles = getProfiles();
        const savedProfile = profiles[currentUsername] || {};
        const savedName = savedProfile.name || currentUsername;

        displayName.textContent =
            "Hi, " + savedName + "! " + getGreeting();

        messageStatus.textContent = "";
        messageForm.reset();
        loginMessage.textContent = "";

        showNotification(
            "Welcome, " + savedName + "!",
            "success"
        );
    });

    // ===== Forgot Password =====
    forgotPasswordButton.addEventListener("click", function () {
        const username = prompt("Enter your username:");

        if (username === null || username.trim() === "") {
            return;
        }

        const users = getUsers();

        const actualUsername = Object.keys(users).find(function (name) {
            return name.toLowerCase() === username.trim().toLowerCase();
        });

        if (!actualUsername) {
            alert("Username does not exist!");
            return;
        }

        const newPassword = prompt("Enter your new password:");

        if (newPassword === null || newPassword.trim() === "") {
            alert("Password cannot be empty!");
            return;
        }

        users[actualUsername] = newPassword;
        localStorage.setItem("users", JSON.stringify(users));

        alert("Password changed successfully!");
    });

    // ===== Edit Profile Button =====
    editProfileButton.addEventListener("click", function () {
        loadProfile();
        editProfileBox.classList.remove("hidden");
    });

    // ===== Cancel Edit Profile =====
    cancelProfileButton.addEventListener("click", function () {
        editProfileBox.classList.add("hidden");
        profileStatus.textContent = "";
    });

    // ===== Save Profile =====
    editProfileForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = profileDisplayName.value.trim();
        const bio = profileBio.value.trim();

        if (name === "") {
            showNotification(
                "Please enter your display name.",
                "error"
            );
            return;
        }

        const profiles = getProfiles();

        profiles[currentUsername] = {
            name: name,
            bio: bio
        };

        localStorage.setItem(
            "userProfiles",
            JSON.stringify(profiles)
        );

        displayName.textContent =
            "Hi, " + name + "! " + getGreeting();

        displayName3.textContent =
            bio || "Welcome to your account.";

        editProfileBox.classList.add("hidden");

        showNotification(
            "Profile updated successfully!",
            "success"
        );
    });

    // ===== EmailJS Setup =====
    if (typeof emailjs !== "undefined") {
        emailjs.init({
            publicKey: "YrXDJS1iftBH_jxh3"
        });
    }

    // ===== Send Message =====
    messageForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const message = userMessage.value.trim();

        if (message === "") {
            messageStatus.style.color = "red";
            messageStatus.textContent =
                "Please write a message.";
            return;
        }

        if (typeof emailjs === "undefined") {
            messageStatus.style.color = "red";
            messageStatus.textContent =
                "Email service is not available.";
            return;
        }

        messageStatus.style.color = "#ffb547";
        messageStatus.textContent = "Sending...";
        sendMessageButton.disabled = true;

        emailjs.send("7602720057", "template_o4g9k6t", {
            from_name: currentUsername,
            message: message
        })
        .then(function () {
            messageStatus.style.color = "#4caf80";
            messageStatus.textContent =
                "Message sent successfully!";

            userMessage.value = "";

            showNotification(
                "Your message was sent!",
                "success"
            );
        })
        .catch(function (error) {
            console.error("EmailJS Error:", error);

            messageStatus.style.color = "#ff7777";
            messageStatus.textContent =
                "Message could not be sent. Check EmailJS settings.";

            showNotification(
                "Message could not be sent.",
                "error"
            );
        })
        .finally(function () {
            sendMessageButton.disabled = false;
        });
    });

    // ===== Logout =====
    logoutButton.addEventListener("click", function () {
        loginForm.reset();
        loginMessage.textContent = "";

        messageForm.reset();
        messageStatus.textContent = "";

        editProfileForm.reset();
        editProfileBox.classList.add("hidden");

        currentUsername = "";

        showLoginPage();

        showNotification("You have logged out.", "info");
    });

});
