document.addEventListener("DOMContentLoaded", function () {
  let user = sessionStorage.getItem("loggedInUser");
  if (user) {
    document.getElementById("loginModal").classList.add("hidden");
    document.getElementById("dashboardContainer").style.display = "block";
    document.getElementById("welcomeMessage").innerText = `Welcome,  ${user}`;
  } else {
    document.getElementById("loginModal").classList.remove("hidden");
  }
});

// 🔹 **Login Function**
function login() {
  let username = document.getElementById("username").value.trim();
  let password = document.getElementById("password").value.trim();
  let loginButton = document.getElementById("loginButton");

  if (!username || !password) {
    Swal.fire("Error", "Please enter both username and password!", "error");
    return;
  }

  loginButton.innerHTML = '<span class="spinner"></span> Logging in...';
  loginButton.disabled = true;

  let apiUrl = `https://script.google.com/macros/s/AKfycbwCJzmc2bjcwjuVxu1KeUadp81WXyNZhn4bsCaGxaH2gaGNg4zTZdhpnGMEeDrYFgr9ew/exec?action=login&username=${username}&password=${password}`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      console.log("Login API Response:", data);

      if (data && data.status === "success") {
        sessionStorage.setItem("loggedInUser", username);
        Swal.fire("Success", "Login successful!", "success").then(() => {
          document.getElementById("loginModal").classList.add("hidden");
          document.getElementById("dashboardContainer").style.display = "block";
          document.getElementById(
            "welcomeMessage"
          ).innerText = `Welcome, ${username}`;
        });
      } else {
        Swal.fire("Error", data.message || "Invalid credentials", "error");
      }
    })
    .catch((error) => {
      console.error("Login Error:", error);
      Swal.fire("Error", "Something went wrong! Try again.", "error");
    })
    .finally(() => {
      loginButton.innerHTML = "Login";
      loginButton.disabled = false;
    });
}

// 🔹 **Logout Function**
function logout() {
  sessionStorage.removeItem("loggedInUser");
  document.getElementById("dashboardContainer").style.display = "none";
  document.getElementById("loginModal").classList.remove("hidden");
  document.getElementById("visitData").innerHTML = "";
  // Reset all input fields
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  document.getElementById("fromDate").value = "";
  document.getElementById("toDate").value = "";

  // Clear Table Data
  document.getElementById("visitData").innerHTML = "";

  // Reset Welcome Message
  document.getElementById("welcomeMessage").innerText = "";

  // Reload the page after logout
    setTimeout(() => {
        location.reload();  // पेज को रीलोड करें
    }, 1000);
}

// 🔹 **Fetch Visit Data**
function fetchVisitData() {
  // let fromDate = new Date(document.getElementById("fromDate").value)
  //   .toISOString()
  //   .split("T")[0];
  // let toDate = new Date(document.getElementById("toDate").value)
  //   .toISOString()
  //   .split("T")[0];

  let fromDate = new Date(document.getElementById("fromDate").value);
  let toDate = new Date(document.getElementById("toDate").value);
  let fetchbutton = document.getElementById("fetchbutton");

  let user = sessionStorage.getItem("loggedInUser");

  if (!fromDate || !toDate) {
    Swal.fire("Warning", "Please select both dates!", "warning");
    return;
  }

  if (!user) {
    Swal.fire("Error", "User not logged in!", "error");
    return;
  }

  fetchbutton.innerHTML = `<span class="spinner"></span> fetching Visit data...`;
  fetchbutton.disabled = true;

  let apiUrl = `https://script.google.com/macros/s/AKfycbwCJzmc2bjcwjuVxu1KeUadp81WXyNZhn4bsCaGxaH2gaGNg4zTZdhpnGMEeDrYFgr9ew/exec?action=fetchData&from=${encodeURIComponent(
    fromDate
  )}&to=${encodeURIComponent(toDate)}&user=${encodeURIComponent(user)}`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      console.log("Visit Data API Response:", data);

      if (!data || data.status === "error") {
        Swal.fire("Error", data.message || "Failed to fetch data!", "error");
        return;
      }

      let tableBody = document.getElementById("visitData");
      tableBody.innerHTML = "";
      data.forEach((row) => {
        tableBody.innerHTML += `<tr>
              <td class='border p-2'>${row.region}</td>
              <td class='border p-2'>${row.engineer}</td>
              <td class='border p-2'>${row.phase}</td>
              <td class='border p-2'>${row.roCode}</td>
              <td class='border p-2'>${row.roName}</td>
              <td class='border p-2'>${row.purpose}</td>
              <td class='border p-2'>${formatDate(row.date)}</td>
            </tr>`;
      });
    })
    .catch((error) => {
      console.error("Visit Data Fetch Error:", error);
      Swal.fire("Error", "Failed to fetch data!", "error");
    })

    .finally(() => {
      fetchbutton.innerHTML = "Get Visit Detail";
      fetchbutton.disabled = false;
    });
}

// 🔹 **Export Data Function**
function exportData() {
  let table = document.querySelector("table");
  if (!table) {
    Swal.fire("Error", "No data to export!", "error");
    return;
  }

  let csv = [];
  let rows = table.querySelectorAll("tr");

  rows.forEach((row) => {
    let cols = row.querySelectorAll("th, td");
    let data = Array.from(cols)
      .map((col) => `"${col.innerText}"`)
      .join(",");
    csv.push(data);
  });

  let csvFile = new Blob([csv.join("\n")], { type: "text/csv" });
  let link = document.createElement("a");
  link.href = URL.createObjectURL(csvFile);
  link.download = "visit_data.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

//formate date

function formatDate(isoDate) {
  let date = new Date(isoDate);
  let year = date.getFullYear();
  let month = (date.getMonth() + 1).toString().padStart(2, "0");
  let day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`; // Output: YYYY-MM-DD
}

//reload

document.addEventListener("DOMContentLoaded", function () {
  const visitDetailLinks = document.querySelectorAll(".visit-detail-link");

  visitDetailLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault(); // लिंक पर तुरंत नेविगेट होने से रोकें
      const url = this.href; // लिंक का URL सेव करें
      setTimeout(() => {
        window.location.href = url; // कुछ सेकंड बाद पेज को रीडायरेक्ट करें
        setTimeout(() => location.reload(), 3000); // फिर 3 सेकंड बाद रीलोड करें
      }, 1000); // पहले 1 सेकंड बाद रीडायरेक्ट करें
    });
  });
});
