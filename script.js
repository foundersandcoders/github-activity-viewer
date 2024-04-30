const contentArea = document.getElementById('contentArea');
const tokenSection = document.getElementById('tokenSection');
let token = localStorage.getItem('accessToken');
let users = userData.users; // Have it from users.js
let fromDate = userData.from;

const url = `https://api.github.com/graphql`;

if (token !== null) {
    fetchAndDisplayUsersInfo();
    tokenSection.style.display = 'none';
}

function storeToken() {
    token = document.getElementById('tokenInput').value;
    if (token === "") {
        alert("Please enter a valid token");
    } else {
        localStorage.setItem('accessToken', token);
        tokenSection.style.display = 'none';
        fetchAndDisplayUsersInfo();
    }
}

function fetchAndDisplayUsersInfo() {
    contentArea.innerHTML = "";

    let table = document.createElement('table');
    let thead = document.createElement('thead');
    let tbody = document.createElement('tbody');
    let headerRow = document.createElement('tr');

    ['Username', 'Total Contributions'].forEach(text => {
        let th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);
    table.appendChild(tbody);

    contentArea.appendChild(table);

    Promise.all(users.map(username => fetchUserInformation(token, username, fromDate, tbody)))
        .then(contributionsData => {
            let users = contributionsData.map(userMap => userMap.username);
            let contributions = contributionsData.map(data => data.totalContributions);
            createChart(users, contributions);
        });
}

function fetchUserInformation(token, username, fromDate, tbody) {
    const query = `{
        user(login: "${username}") {
            contributionsCollection(from: "${fromDate}") {
                totalIssueContributions
                totalPullRequestContributions
                totalRepositoriesWithContributedCommits
                totalPullRequestReviewContributions
            }
        }
    }`;

    return fetch(url, {
        method: 'POST',
        body: JSON.stringify({ query: query }),
        headers: new Headers({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }),
    })
    .then(response => response.json())
    .then(data => {
        if(data.errors) {
            throw new Error(data.errors[0].message);
        }
        var contributions = data.data.user.contributionsCollection;
        let totalContributions = contributions.totalIssueContributions + contributions.totalPullRequestContributions + contributions.totalRepositoriesWithContributedCommits + contributions.totalPullRequestReviewContributions;

        let row = document.createElement('tr');
        let tdUsername = document.createElement('td');
        let tdTotalContributions = document.createElement('td');

        tdUsername.textContent = username;
        tdTotalContributions.textContent = totalContributions;

        row.appendChild(tdUsername);
        row.appendChild(tdTotalContributions);

        tbody.appendChild(row);

        return {username, totalContributions};
    })
    .catch((error) => {
        console.error(error);
        if(error.message === "Bad credentials") {
            localStorage.removeItem('accessToken');
            tokenSection.style.display = 'block';
            contentArea.textContent = "Token is incorrect or expired. Please enter it again.";
        } else {
            contentArea.textContent = "Error: " + error.message;
        }
    });
}

function createChart(users, contributionsData) {
    var ctx = document.getElementById('usersChart');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: users,
            datasets: [{
                label: 'Total Contributions',
                data: contributionsData,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
