
document.addEventListener("DOMContentLoaded", function () {

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
    const forgotPasswordButton = document.getElementById("forgotPasswordButton");
    const logoutButton = document.getElementById("logoutButton");

    const displayName = document.getElementById("displayName");
    const displayName2 = document.getElementById("displayName2");
    const displayName3 = document.getElementById("displayName3");

    const userMessage = document.getElementById("userMessage");
    const messageStatus = document.getElementById("messageStatus");
    const sendMessageButton = document.getElementById("sendMessageButton");

    const liveClock = document.getElementById("liveClock");
    const liveDate = document.getElementById("liveDate");
    const notification = document.getElementById("notification");
    const locationBox = document.getElementById("currentLocation");

    let currentUsername = "";
    let notificationTimer;
    let locationWatcher = null;

    // Get saved users
    function getUsers() {
        try {
            return JSON.parse(localStorage.getItem("users")) || {};
        } catch (error) {
            return {};
        }
    }

    // Notification
    function showNotification(message, type = "info") {
        if (!notification) {
            alert(message);
            return;
        }

        clearTimeout(notificationTimer);
        notification.textContent = message;
        notification.className = "notification show " + type;

        notificationTimer = setTimeout(function () {
            notification.classList.remove("show");
        }, 3000);
    }

    // Greeting
    function getGreeting() {
        const hour = new Date().getHours();

        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        if (hour < 21) return "Good Evening";
        return "Good Night";
    }

    // Show Login Page
    function showLoginPage() {
        if (loginPage) loginPage.classList.remove("hidden");
        if (signupPage) signupPage.classList.add("hidden");
        if (namePage) namePage.classList.add("hidden");
    }

    // Current Location
    function startLocation() {
        if (!locationBox) return;

        if (!navigator.geolocation) {
            locationBox.textContent =
                "Location is not supported by this browser.";
            return;
        }

        if (locationWatcher !== null) {
            navigator.geolocation.clearWatch(locationWatcher);
            locationWatcher = null;
        }

        locationBox.textContent = "Getting your current location...";

        locationWatcher = navigator.geolocation.watchPosition(
            function (position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                locationBox.replaceChildren();

                const heading = document.createElement("div");
                heading.textContent = "📍 Current Location";

                const coordinates = document.createElement("div");
                coordinates.textContent =
                    "Latitude: " + latitude.toFixed(5) +
                    " | Longitude: " + longitude.toFixed(5);

                const mapLink = document.createElement("a");
                mapLink.href =
                    "https://www.google.com/maps?q=" +
                    latitude + "," + longitude;
                mapLink.target = "_blank";
                mapLink.rel = "noopener noreferrer";
                mapLink.textContent = "View on Google Maps";

                locationBox.append(heading, coordinates, mapLink);
            },
            function (error) {
                if (error.code === error.PERMISSION_DENIED) {
                    locationBox.textContent =
                        "Location permission denied. Allow location access in your browser.";
                } else if (error.code === error.TIMEOUT) {
                    locationBox.textContent =
                        "Location request timed out. Trying to get location again...";
                } else {
                    locationBox.textContent =
                        "Unable to get location. Please try again.";
                }
            },
            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 15000
            }
        );
    }

    // Open Sign Up
    if (signupButton) {
        signupButton.addEventListener("click", function () {
            if (loginPage) loginPage.classList.add("hidden");
            if (signupPage) signupPage.classList.remove("hidden");

            if (loginMessage) loginMessage.textContent = "";
            if (signupMessage) signupMessage.textContent = "";
        });
    }

    // Back to Login
    if (backButton) {
        backButton.addEventListener("click", showLoginPage);
    }

    // Sign Up
    if (signupForm) {
        signupForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const username = signupUsername.value.trim();
            const password = signupPassword.value.trim();

            if (!username || !password) {
                signupMessage.textContent =
                    "Please enter username and password.";
                return;
            }

            const users = getUsers();

            const existingUsername = Object.keys(users).find(function (name) {
                return name.toLowerCase() === username.toLowerCase();
            });

            if (existingUsername) {
                signupMessage.textContent = "Username already exists.";
                return;
            }

            users[username] = password;
            localStorage.setItem("users", JSON.stringify(users));

            signupMessage.textContent =
                "Account created successfully! Please log in.";

            signupForm.reset();

            setTimeout(showLoginPage, 1000);
        });
    }

    // Login
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const username = loginUsername.value.trim();
            const password = loginPassword.value.trim();
            const users = getUsers();

            if (users[username] === password) {
                currentUsername = username;

                if (loginPage) loginPage.classList.add("hidden");
                if (signupPage) signupPage.classList.add("hidden");
                if (namePage) namePage.classList.remove("hidden");

                if (displayName) {
                    displayName.textContent = "Hi, " + username + "!";
                }

                if (displayName2) {
                    displayName2.textContent = "Login Successful!";
                }

                if (displayName3) {
                    displayName3.textContent = getGreeting();
                }

                if (loginMessage) loginMessage.textContent = "";
                if (messageStatus) messageStatus.textContent = "";

                loginForm.reset();

                // Start location after successful login
                startLocation();

                showNotification("Welcome, " + username + "!", "success");
            } else {
                loginMessage.textContent = "Invalid username or password.";
            }
        });
    }

    // Forgot Password
    if (forgotPasswordButton) {
        forgotPasswordButton.addEventListener("click", function () {
            const username = prompt("Enter your registered username:");

            if (!username || !username.trim()) return;

            const users = getUsers();
            const name = username.trim();

            if (Object.prototype.hasOwnProperty.call(users, name)) {
                alert("Your password is: " + users[name]);
            } else {
                alert("Username not found. Please sign up first.");
            }
        });
    }

    // Send Message using EmailJS
    if (messageForm) {
        messageForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const message = userMessage ? userMessage.value.trim() : "";

            if (!message) {
                if (messageStatus) {
                    messageStatus.textContent = "Please write a message.";
                }
                return;
            }

            if (typeof emailjs === "undefined") {
                if (messageStatus) {
                    messageStatus.textContent = "Email service is not loaded.";
                }
                return;
            }

            if (sendMessageButton) {
                sendMessageButton.disabled = true;
                sendMessageButton.textContent = "Sending...";
            }

            emailjs.send("7602720057", "template_o4g9k6t", {
                from_name: currentUsername,
                message: message
            })
            .then(function () {
                if (messageStatus) {
                    messageStatus.textContent = "Message sent successfully!";
                }

                messageForm.reset();
                showNotification("Message sent successfully!", "success");
            })
            .catch(function (error) {
                console.error("EmailJS error:", error);

                if (messageStatus) {
                    messageStatus.textContent =
                        "Message could not be sent. Please try again.";
                }
            })
            .finally(function () {
                if (sendMessageButton) {
                    sendMessageButton.disabled = false;
                    sendMessageButton.textContent = "Send Message";
                }
            });
        });
    }

    // Live Clock and Date
    function updateClock() {
        const now = new Date();

        if (liveClock) {
            liveClock.textContent = now.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true
            });
        }

        if (liveDate) {
            liveDate.textContent = now.toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            });
        }
    }

    updateClock();
    setInterval(updateClock, 1000);

    // Logout
    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            currentUsername = "";

            if (locationWatcher !== null) {
                navigator.geolocation.clearWatch(locationWatcher);
                locationWatcher = null;
            }

            if (locationBox) {
                locationBox.textContent = "";
            }

            if (loginForm) loginForm.reset();
            if (signupForm) signupForm.reset();
            if (messageForm) messageForm.reset();

            if (loginMessage) loginMessage.textContent = "";
            if (signupMessage) signupMessage.textContent = "";
            if (messageStatus) messageStatus.textContent = "";

            showLoginPage();
        });
    }

});
