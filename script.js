
document.addEventListener("DOMContentLoaded", async function () {
    // STEP 1: Put your Supabase details here
    const SUPABASE_URL = "PASTE_YOUR_PROJECT_URL";
    const SUPABASE_KEY = "PASTE_YOUR_PUBLISHABLE_KEY";

    const sb = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

    const $ = (id) => document.getElementById(id);

    const loginPage = $("loginPage");
    const signupPage = $("signupPage");
    const resetPage = $("resetPage");
    const namePage = $("namePage");

    let currentUser = null;
    let selectedUser = null;
    let messageChannel = null;
    let clockTimer = null;

    function notify(message, isError = false) {
        const el = $("notification");
        if (!el) return;
        el.textContent = message;
        el.style.color = isError ? "#ff9caa" : "#9ef0be";
    }

    function showPage(page) {
        [loginPage, signupPage, resetPage, namePage].forEach((el) => {
            if (el) el.classList.add("hidden");
        });
        if (page) page.classList.remove("hidden");
    }

    function showMessage(id, text, isError = false) {
        const el = $(id);
        if (!el) return;
        el.textContent = text;
        el.style.color = isError ? "#ff9caa" : "#b8e8ff";
    }

    function escapeText(value) {
        return String(value).replace(/[&<>"']/g, (ch) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[ch]);
    }

    // Navigation
    $("signupButton").addEventListener("click", () => showPage(signupPage));
    $("backButton").addEventListener("click", () => showPage(loginPage));
    $("resetBackButton").addEventListener("click", () => showPage(loginPage));

    // Sign Up
    $("signupForm").addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = $("signupUsername").value.trim().toLowerCase();
        const email = $("signupEmail").value.trim();
        const password = $("signupPassword").value;

        if (!/^[a-z0-9_]{3,30}$/.test(username)) {
            showMessage("signupMessage",
                "Username must be 3–30 characters: letters, numbers or underscore.",
                true);
            return;
        }

        if (password.length < 8) {
            showMessage("signupMessage", "Use at least 8 characters.", true);
            return;
        }

        showMessage("signupMessage", "Creating account...");

        const { data, error } = await sb.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                    display_name: username
                },
                emailRedirectTo:
                    "https://bhowmickarnab427-pixel.github.io/arnab_website/log.html"
            }
        });

        if (error) {
            showMessage("signupMessage", error.message, true);
            return;
        }

        if (data.session) {
            showMessage("signupMessage", "Account created successfully!");
            await loadDashboard(data.user);
        } else {
            showMessage("signupMessage",
                "Account created. Check your email to confirm it, then log in.");
        }
    });

    // Login
    $("loginForm").addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = $("loginUsername").value.trim();
        const password = $("loginPassword").value;

        showMessage("loginMessage", "Logging in...");

        const { data, error } = await sb.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            showMessage("loginMessage", error.message, true);
            return;
        }

        await loadDashboard(data.user);
    });

    // Forgot Password
    $("forgotPasswordButton").addEventListener("click", () => {
        showPage(resetPage);
        showMessage("resetMessage", "");
    });

    $("resetForm").addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = $("resetEmail").value.trim();

        const { error } = await sb.auth.resetPasswordForEmail(email, {
            redirectTo:
                "https://bhowmickarnab427-pixel.github.io/arnab_website/log.html"
        });

        showMessage(
            "resetMessage",
            error ? error.message : "If the account exists, a reset email will be sent.",
            Boolean(error)
        );
    });

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
    }

    updateClock();
    clockTimer = setInterval(updateClock, 1000);

    // Greeting
    function getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return "🌅 Good Morning";
        if (hour < 17) return "☀️ Good Afternoon";
        if (hour < 21) return "🌇 Good Evening";
        return "🌙 Good Night";
    }

    // Load profile and dashboard
    async function loadDashboard(user) {
        currentUser = user;
        showPage(namePage);

        $("displayName").textContent =
            "Hi, " + (user.user_metadata?.display_name || user.email);

        $("displayName2").textContent = "Login Successful!";
        $("displayName3").textContent = getGreeting();

        await loadProfile();
        await checkAdmin();
        notify("Welcome back!");
    }

    async function loadProfile() {
        if (!currentUser) return;

        const { data, error } = await sb
            .from("profiles")
            .select("id, username, display_name, bio")
            .eq("id", currentUser.id)
            .maybeSingle();

        if (error) {
            showMessage("profileMessage", error.message, true);
            return;
        }

        if (!data) {
            showMessage("profileMessage",
                "Profile is not ready yet. Confirm your email if required, then sign in again.",
                true);
            return;
        }

        $("profileUsername").value = data.username || "";
        $("profileDisplayName").value = data.display_name || "";
        $("profileBio").value = data.bio || "";
    }

    // Save profile
    $("profileForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!currentUser) return;

        const username = $("profileUsername").value.trim().toLowerCase();
        const displayName = $("profileDisplayName").value.trim();
        const bio = $("profileBio").value.trim();

        if (!/^[a-z0-9_]{3,30}$/.test(username)) {
            showMessage("profileMessage", "Use 3–30 letters, numbers or underscores.", true);
            return;
        }

        const { error } = await sb
            .from("profiles")
            .update({
                username,
                display_name: displayName,
                bio
            })
            .eq("id", currentUser.id);

        if (error) {
            showMessage("profileMessage", error.message, true);
            return;
        }

        $("displayName").textContent = "Hi, " + (displayName || username);
        showMessage("profileMessage", "Profile saved successfully!");
    });

    // Search users
    $("searchForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!currentUser) return;

        const query = $("userSearch").value.trim().toLowerCase();
        const results = $("searchResults");
        results.replaceChildren();

        const { data, error } = await sb
            .from("profiles")
            .select("id, username, display_name, bio")
            .ilike("username", "%" + query.replace(/[%_,]/g, "") + "%")
            .neq("id", currentUser.id)
            .limit(20);

        if (error) {
            results.textContent = error.message;
            return;
        }

        if (!data || data.length === 0) {
            results.textContent = "No users found.";
            return;
        }

        data.forEach((user) => {
            const card = document.createElement("div");
            card.className = "user-result";

            const name = document.createElement("strong");
            name.textContent = user.display_name || user.username;

            const username = document.createElement("p");
            username.textContent = "@" + user.username;

            const bio = document.createElement("p");
            bio.textContent = user.bio || "";

            const button = document.createElement("button");
            button.type = "button";
            button.textContent = "Chat";
            button.addEventListener("click", () => openChat(user));

            card.append(name, username, bio, button);
            results.appendChild(card);
        });
    });

    // Open conversation
    async function openChat(user) {
        selectedUser = user;
        $("chatWith").textContent =
            "Chatting with " + (user.display_name || user.username);
        $("sendMessageButton").disabled = false;

        if (messageChannel) {
            await sb.removeChannel(messageChannel);
            messageChannel = null;
        }

        await loadMessages();

        // Live updates require messages table to be added to
        // Supabase Realtime publication.
        messageChannel = sb
            .channel("conversation-" + currentUser.id + "-" + user.id)
            .on("postgres_changes", {
                event: "INSERT",
                schema: "public",
                table: "messages"
            }, (payload) => {
                const msg = payload.new;
                const belongsToChat =
                    (msg.sender_id === currentUser.id &&
                     msg.receiver_id === selectedUser?.id) ||
                    (msg.sender_id === selectedUser?.id &&
                     msg.receiver_id === currentUser.id);

                if (belongsToChat) loadMessages();
            })
            .subscribe();
    }

    // Load messages from selected conversation
    async function loadMessages() {
        if (!currentUser || !selectedUser) return;

        const { data, error } = await sb
            .from("messages")
            .select("id, sender_id, receiver_id, body, created_at")
            .or(
                "and(sender_id.eq." + currentUser.id +
                ",receiver_id.eq." + selectedUser.id +
                "),and(sender_id.eq." + selectedUser.id +
                ",receiver_id.eq." + currentUser.id + ")"
            )
            .order("created_at", { ascending: true })
            .limit(100);

        const box = $("chatMessages");
        box.replaceChildren();

        if (error) {
            box.textContent = error.message;
            return;
        }

        (data || []).forEach((msg) => {
            const item = document.createElement("div");
            item.className = "chat-message" +
                (msg.sender_id === currentUser.id ? " mine" : "");

            const body = document.createElement("div");
            body.textContent = msg.body;

            const time = document.createElement("small");
            time.textContent = new Date(msg.created_at).toLocaleString();

            item.append(body, time);
            box.appendChild(item);
        });

        box.scrollTop = box.scrollHeight;
    }

    // Send message
    $("messageForm").addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!currentUser || !selectedUser) {
            showMessage("messageStatus", "First select a user to chat with.", true);
            return;
        }

        const body = $("userMessage").value.trim();
        if (!body) return;

        const { error } = await sb.from("messages").insert({
            sender_id: currentUser.id,
            receiver_id: selectedUser.id,
            body
        });

        if (error) {
            showMessage("messageStatus", error.message, true);
            return;
        }

        $("userMessage").value = "";
        showMessage("messageStatus", "Message sent!");
        await loadMessages();
    });

    // Admin check. The public.is_admin() SQL function is set up below.
    async function checkAdmin() {
        const { data, error } = await sb.rpc("is_admin");

        if (error) {
            $("adminPanel").classList.add("hidden");
            console.warn("Admin check unavailable:", error.message);
            return;
        }

        $("adminPanel").classList.toggle("hidden", data !== true);
    }

    // Admin user list. RLS must authorize admins to view this data.
    $("loadUsersButton").addEventListener("click", async () => {
        const box = $("adminUsers");
        box.replaceChildren();

        const { data: isAdmin, error: adminError } = await sb.rpc("is_admin");

        if (adminError || isAdmin !== true) {
            box.textContent = "Admin permission required.";
            return;
        }

        const { data, error } = await sb
            .from("profiles")
            .select("id, username, display_name, bio, created_at")
            .order("created_at", { ascending: false })
            .limit(100);

        if (error) {
            box.textContent = error.message;
            return;
        }

        (data || []).forEach((user) => {
            const item = document.createElement("div");
            item.className = "admin-user";
            item.textContent =
                (user.display_name || user.username) +
                " (@" + user.username + ") — " +
                new Date(user.created_at).toLocaleDateString();
            box.appendChild(item);
        });
    });

    // Optional browser location sharing
    $("locationButton").addEventListener("click", () => {
        if (!navigator.geolocation) {
            $("currentLocation").textContent =
                "Location is not supported by this browser.";
            return;
        }

        $("currentLocation").textContent = "Getting location...";

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                const link = document.createElement("a");
                link.href = "https://www.google.com/maps?q=" + lat + "," + lon;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                link.textContent = "Open my location in Google Maps";

                const output = $("currentLocation");
                output.replaceChildren();
                output.append(
                    document.createTextNode(
                        "Latitude: " + lat.toFixed(5) +
                        ", Longitude: " + lon.toFixed(5) + " "
                    ),
                    link
                );
            },
            () => {
                $("currentLocation").textContent =
                    "Location permission was denied or unavailable.";
            }
        );
    });

    // Logout
    $("logoutButton").addEventListener("click", async () => {
        if (messageChannel) {
            await sb.removeChannel(messageChannel);
        }

        const { error } = await sb.auth.signOut();

        if (error) {
            notify(error.message, true);
            return;
        }

        currentUser = null;
        selectedUser = null;
        showPage(loginPage);
        $("loginPassword").value = "";
        showMessage("loginMessage", "You have logged out.");
    });

    // Restore existing Supabase session
    const { data: { session } } = await sb.auth.getSession();

    if (session?.user) {
        await loadDashboard(session.user);
    } else {
        showPage(loginPage);
    }
});
