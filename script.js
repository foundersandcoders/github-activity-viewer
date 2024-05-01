// elements
const leadSection = document.getElementById('leadSection');
const chartArea = document.getElementById('chartArea');
const tableArea = document.getElementById('tableArea');


// state variables
let currentState = 'tokenCheck'; // or 'userSelection'
let token = localStorage.getItem('accessToken');

// specify the user files
let userFiles = ["users", "fac31"]; // update with your real file names

const url = `https://api.github.com/graphql`;


// function to update the page based on the current state
function updatePage() {
    switch(currentState) {

        case 'tokenCheck':
            if (token !== null) {
                leadSection.innerHTML = '';
                currentState = 'userSelection';
                updatePage();
            } else {
                leadSection.style.display = 'block';
            }
            break;

        case 'userSelection':
            let selectElement = document.createElement("select");
            selectElement.id = "userFile";
        
            //add the empty option here
            let defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.text = "Select group..."; 
            selectElement.appendChild(defaultOption);
        
            //use forEach to populate the drop-down
            userFiles.forEach((file) => {
                let option = document.createElement("option");
                option.value = file;
                option.text = file; 
                selectElement.appendChild(option); 
            });
        
            selectElement.onchange = function() {
                const selectedFile = this.value;
                if(selectedFile) { //check if value is not empty
                    updateContent(selectedFile);
                }
            }
            leadSection.appendChild(selectElement);

            break;
    }
}

function storeToken() {
    token = document.getElementById('tokenInput').value;
    if (token === "") {
        alert("Please enter a valid Github personal access token");
    } else {
        localStorage.setItem('accessToken', token);
        currentState = 'userSelection';
        updatePage();
    }
}

// display the user data based on selection
function updateContent(file) {
    fetch(file + '.json') // assuming your file has a .json extension
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(userData => {
        let users = userData.users;
        let fromDate = userData.from;
        let formattedFromDate = new Date(fromDate).toLocaleDateString();
        const dateElement = document.getElementById('since');
        leadSection.innerHTML = `Since: ${formattedFromDate}`;
        fetchAndDisplayUsersInfo(users, fromDate);
    })
    .catch(e => {
        console.log('There was a problem with the fetch operation: ' + e.message);
    });
}


function fetchAndDisplayUsersInfo(users, fromDate) {

    let table = document.createElement('table');
    let thead = document.createElement('thead');
    let tbody = document.createElement('tbody');
    let headerRow = document.createElement('tr');

    ['Username', 'Contributions'].forEach(text => {
        let th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);
    table.appendChild(tbody);

    tableArea.appendChild(table);

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
            leadSection.style.display = 'block';
            leadSection.textContent = "Token is incorrect or expired. Please enter it again.";
        } else {
            leadSection.textContent = "Error: " + error.message;
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
                label: 'Contributions',
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

window.onload = function() {
    updatePage();
}
