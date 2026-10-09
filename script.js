
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

    let currentUsername = "";

    function getUsers() {
        return JSON.parse(localStorage.getItem("users")) || {};
    }

    function showLoginPage() {
        loginPage.classList.remove("hidden");
        signupPage.classList.add("hidden");
        namePage.classList.add("hidden");
    }

    signupButton.addEventListener("click", function () {
        loginPage.classList.add("hidden");
        signupPage.classList.remove("hidden");
        namePage.classList.add("hidden");
        signupMessage.textContent = "";
    });

    backButton.addEventListener("click", function () {
        showLoginPage();
        signupMessage.textContent = "";
    });

    signupForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = signupUsername.value.trim();
        const password = signupPassword.value;
        const users = getUsers();

        if (users[username]) {
            signupMessage.style.color = "red";
            signupMessage.textContent = "Username already exists!";
            return;
        }

        users[username] = password;
        localStorage.setItem("users", JSON.stringify(users));

        signupMessage.style.color = "green";
        signupMessage.textContent = "Account created successfully!";

        signupForm.reset();

        setTimeout(function () {
            showLoginPage();
            loginUsername.value = username;
            loginMessage.style.color = "green";
            loginMessage.textContent = "Now login with your password.";
        }, 1000);
    });

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = loginUsername.value.trim();
        const password = loginPassword.value;
        const users = getUsers();

        if (!users[username]) {
            loginMessage.style.color = "red";
            loginMessage.textContent = "Account does not exist!";
            return;
        }

        if (users[username] !== password) {
            loginMessage.style.color = "red";
            loginMessage.textContent = "Incorrect password!";
            return;
        }

        currentUsername = username;

        loginPage.classList.add("hidden");
        signupPage.classList.add("hidden");
        namePage.classList.remove("hidden");

        

const hour = new Date().getHours();

let greeting;

if (hour >= 5 && hour < 12) {
    greeting = "Good Morning 🌅";
} else if (hour >= 12 && hour < 17) {
    greeting = "Good Afternoon ☀️";
} else if (hour >= 17 && hour < 21) {
    greeting = "Good Evening 🌇";
} else {
    greeting = "Good Night 🌙";
}

displayName.textContent = "Hi, " + username + "! " + greeting;

        displayName2.textContent = "Login Successful!";
        displayName3.textContent = "Welcome to your account.";

        messageStatus.textContent = "";
        messageForm.reset();
    });

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

    emailjs.init({
        publicKey: "YrXDJS1iftBH_jxh3"
    });

    messageForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const message = userMessage.value.trim();

        if (message === "") {
            messageStatus.style.color = "red";
            messageStatus.textContent = "Please write a message.";
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
            messageStatus.style.color = "green";
            messageStatus.textContent = "Message sent successfully!";
            userMessage.value = "";
        })
        .catch(function (error) {
            console.error("EmailJS Error:", error);
            messageStatus.style.color = "red";
            messageStatus.textContent =
                "Message could not be sent. Check EmailJS settings.";
        })
        .finally(function () {
            sendMessageButton.disabled = false;
        });
    });

    logoutButton.addEventListener("click", function () {
        loginForm.reset();
        loginMessage.textContent = "";
        messageForm.reset();
        messageStatus.textContent = "";
        currentUsername = "";
        showLoginPage();
    });

});
