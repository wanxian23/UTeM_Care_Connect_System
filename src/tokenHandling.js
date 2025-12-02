// utils/fetchWithToken.js
export async function fetchWithToken(url, options = {}) {
    const token = localStorage.getItem("token");

    // Add Authorization header
    options.headers = {
        ...options.headers,
        "Authorization": "Bearer " + token
    };

    // If sending JSON body
    if (options.body && typeof options.body === "object") {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(options.body);
    }

    try {
        const res = await fetch(url, options);

        // If server returns non-200, still parse JSON
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("fetchWithToken error:", err);
        return { success: false, message: "Network error" };
    }
}
