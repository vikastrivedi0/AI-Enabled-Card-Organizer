// show image on html, access image with event.target.files[0]
"use strict";

const serverUrl = "http://127.0.0.1:8000";
//const serverUrl = "http://127.0.0.1:8000";
// var authToken=localStorage.getItem('token')

async function uploadImage() { 
    
    // encode input file as base64 string for upload
    let file = document.getElementById("uploadImage").files[0];

    let converter = new Promise(function (resolve, reject) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.toString().replace(/^data:(.*,)?/, ''));
        reader.onerror = (error) => reject(error);
    });
    let encodedString = await converter;

    // clear file upload input field
    document.getElementById("uploadImage").value = "";

    // make server call to upload image
    // and return the server upload promise
    return fetch(serverUrl + "/images", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(
            {filename: file.name, filebytes: encodedString}
        )
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else if (response.status === 401) {
            alert("Session Timed Out!");
            Wwindow.location.replace("index.html", "_self")
        } else {
            throw new HttpError(response);
        }
    })
}

function updateImage(image) {
    let imageElem = document.getElementById("imageOutput");
    console.log(image);
    imageElem.style.width = '600px'
    imageElem.style.height = '400px'
    imageElem.src = image["fileUrl"];
    imageElem.alt = image["fileId"];

    return image;
}

function getUploadedImage() {
  return new Promise((resolve, reject) => {
    let imageElem = document.getElementById("imageOutput");
    let imgSrc = imageElem.getAttribute("src");
    let imgAlt = imageElem.getAttribute("alt");

    let imgJson = JSON.stringify({ fileUrl: imgSrc, fileId: imgAlt });
    console.log(imgJson);
    if (imgSrc && imgAlt) {
      resolve(imgJson);
    } else {
      reject("Failed to get uploaded image.");
    }
  });
}

function clearFile() {
    let imageContainer = document.getElementById('imageOutput')
    imageContainer.src = ""
}

function translateImage(image) {
    // make server call to translate image
    // and return the server upload promise

    console.log(image)
    console.log(image["fileId"])
    return fetch(serverUrl + "/images/" + image["fileId"] + "/translate-text", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(
            {fromLang: "auto", toLang: "en"}
        )
    }).then(response => {
        if (response.ok) {
            return response.json();
        } 
        else if(response.status === 401) {
            alert("Session Timed Out!");
            window.location.replace("index.html", "_self")
        }
        else {        
            throw new HttpError(response);
        }
    })
}

function addOptionToDatalist(datalist, optionValue) {
    let newOption = document.createElement('option');
    newOption.value = optionValue;
    datalist.appendChild(newOption);
}

function fillCreateForm(text) { // create datalist pointers, remove previous values except first one ("Suggested Company Names" option)
    let companyNameDataList = document.getElementById('companyNameDataList')
    companyNameDataList.innerHTML = ''
    let contactNameDataList = document.getElementById('contactNameDataList')
    contactNameDataList.innerHTML = ''
    let phone1DataList = document.getElementById('phone1DataList')
    phone1DataList.innerHTML = ''
    let phone2DataList = document.getElementById('phone2DataList')
    phone2DataList.innerHTML = ''
    let address1DataList = document.getElementById('address1DataList')
    address1DataList.innerHTML = ''
    let address2DataList = document.getElementById('address2DataList')
    address2DataList.innerHTML = ''
    let websiteDataList = document.getElementById('websiteDataList')
    websiteDataList.innerHTML = ''
    let emailDataList = document.getElementById('emailDataList')
    emailDataList.innerHTML = ''

    // fill company name
    let names = text['names']
    names.forEach(name => {
        addOptionToDatalist(companyNameDataList, name)
    });
    // fill contact name
    names.forEach(name => {
        addOptionToDatalist(contactNameDataList, name)
    });
    // fill phone 1 and 2
    let phones = text['phones']
    phones.forEach(phone => {
        addOptionToDatalist(phone1DataList, phone)
    });
    phones.forEach(phone => {
        addOptionToDatalist(phone2DataList, phone)
    });
    // fill addresses
    let addresses = text['addresses']
    addresses.forEach(address => {
        addOptionToDatalist(address1DataList, address)
    });
    addresses.forEach(address => {
        addOptionToDatalist(address2DataList, address)
    });
    // fill websites
    let websites = text['urls']
    websites.forEach(website => {
        addOptionToDatalist(websiteDataList, website)
    });
    // fill emails
    let emails = text['emails']
    emails.forEach(email => {
        addOptionToDatalist(emailDataList, email)
    });

}

// TODO
function submitNewLead() {
    let companyName = document.getElementById('newLeadCompanyName').value
    let contactName = document.getElementById('newLeadContactName').value
    let phone1 = document.getElementById('newLeadPhone1').value
    let phone2 = document.getElementById('newLeadPhone2').value
    let address1 = document.getElementById('newLeadAddress1').value
    let address2 = document.getElementById('newLeadAddress2').value
    let website = document.getElementById('newLeadWebsite').value
    let email = document.getElementById('newLeadEmail').value

    // take values and submit to database here
    var address = address1 + " " + address2
    var dict = {
        'lead_name': contactName,
        'company_name': companyName,
        'phone1': phone1,
        'phone2': phone2,
        'address': address,
        'website': website,
        'lead_email': email
    };
    console.log("token in js:" + localStorage.getItem('token'))
    fetch(serverUrl + "/save", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify(dict)
    }).then(response => response.json()).then(data => {
        alert("Lead Data Saved");
        window.location.replace("searchLeads.html", "_self");
    }).catch((err) => {
        console.log(err)
    })
    let json = response.json()

}

function updateLead() {
    let companyName = document.getElementById('updatedLeadCompanyName').value
    let contactName = document.getElementById('updatedLeadContactName').value
    let phone1 = document.getElementById('updatedLeadPhone1').value
    let phone2 = document.getElementById('updatedLeadPhone2').value
    let address1 = document.getElementById('updatedLeadAddress1').value
    let address2 = document.getElementById('updatedLeadAddress2').value
    let website = document.getElementById('updatedLeadWebsite').value
    let email = document.getElementById('updatedLeadEmail').value

    // update values in db etc here
    var address = address1 + " " + address2
    var dict = {
        'lead_name': contactName,
        'company_name': companyName,
        'phone1': phone1,
        'phone2': phone2,
        'address': address,
        'website': website,
        'lead_email': email
    };
    console.log("token in js:" + localStorage.getItem('token'))
    fetch(serverUrl + "/save", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify(dict)
    }).then(response => response.json()).then(data => {
        alert("Lead Data Updated");
        window.location.replace("searchLeads.html", "_self");
    }).catch((err) => {
        console.log(err)
    })
    // let json =  response.json()

}

// TODO
function signIn() {
    let username = document.getElementById('signInUsername').value
    let password = document.getElementById('signInPassword').value

    // use db to check if user and pass match
    // username=firstName+lastName;
    var dict = {
        'username': username,
        'password': password
    }


    return fetch(serverUrl + "/signin", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dict)

    }).then(response => {
        if (response.ok) {
            return response.json().then(data => {
                localStorage.setItem('token', data.token);
                window.open("createLeads.html", "_self");
                alert("Welcome " + username + "!")
                return data;
            });

        } else if (response.status === 401) {
            alert("Session Timed Out!");
            Wwindow.location.replace("index.html", "_self")
        } else {
            throw new HttpError(response);
        }
    })

}

function signUp() {

    let firstName = document.getElementById('signUpFirstName').value
    let lastName = document.getElementById('signUpLastName').value
    let username = document.getElementById('signUpUsername').value
    let password = document.getElementById('signUpPassword').value
    let confirmPassword = document.getElementById('signUpPasswordConfirm').value


    console.log(username);
    console.log(password);

    if (password === confirmPassword) {

        var dict = {
            'username': username,
            'password': password
        }

    }
    return fetch(serverUrl + "/signup", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dict)
    }).then(response => {
        if (response.ok) {
            window.open("index.html", "_self")
            alert("User Created!")
            return response.json();
        } else if (response.status === 401) {
            alert("Session Timed Out!");
            Wwindow.location.replace("index.html", "_self")
        } else {
            throw new HttpError(response);
        }
    })
}


function searchLeads() {

    return fetch(serverUrl + "/search", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify()

    }).then(response => {
        if (response.ok) {
            return response.json()
        } else if (response.status === 401) {
            alert("Session Timed Out!");
            Wwindow.location.replace("index.html", "_self")
        } else {
            throw new HttpError(response);
        }
    })

}


function updateTables() {

    searchLeads().then(data => {

        let searchAllTable = document.getElementById('searchAllTable');
        let tbodyAllTable = searchAllTable.getElementsByTagName('tbody')[0];
        let searchUserTable = document.getElementById('searchUserTable');
        let tbodyUserTable = searchUserTable.getElementsByTagName('tbody')[0];

        console.log(data[0])

        data[0].forEach((user) => {
            const row = document.createElement('tr');
            const companyNameCell = document.createElement('td');
            const contactNameCell = document.createElement('td');
            const phone1Cell = document.createElement('td');
            const phone2Cell = document.createElement('td');
            const address1Cell = document.createElement('td');
            const websiteCell = document.createElement('td');
            const emailCell = document.createElement('td');

            companyNameCell.textContent = user.company_name;
            contactNameCell.textContent = user.lead_name;
            phone1Cell.textContent = user.phone1;
            phone2Cell.textContent = user.phone2;
            address1Cell.textContent = user.address;
            websiteCell.textContent = user.website;
            emailCell.textContent = user.lead_email;

            row.appendChild(companyNameCell);
            row.appendChild(contactNameCell);
            row.appendChild(phone1Cell);
            row.appendChild(phone2Cell);
            row.appendChild(address1Cell);
            row.appendChild(websiteCell);
            row.appendChild(emailCell);

            tbodyAllTable.appendChild(row);
        });

        data[1].forEach((user) => {
            const row = document.createElement('tr');
            const companyNameCell = document.createElement('td');
            const contactNameCell = document.createElement('td');
            const phone1Cell = document.createElement('td');
            const phone2Cell = document.createElement('td');
            const address1Cell = document.createElement('td');

            const websiteCell = document.createElement('td');
            const emailCell = document.createElement('td');
            const buttonCell = document.createElement('td');

            const updateButton = document.createElement('button');
            updateButton.textContent = "Update";

            updateButton.setAttribute("onclick", "sendUpdateData(this)")
            updateButton.className = "btn btn-primary";

            const deleteButton = document.createElement('button');
            deleteButton.setAttribute("onclick", "deleteLead(this)")

            deleteButton.textContent = "Delete"
            deleteButton.className = "btn btn-danger";


            companyNameCell.textContent = user.company_name;
            contactNameCell.textContent = user.lead_name;
            phone1Cell.textContent = user.phone1;
            phone2Cell.textContent = user.phone2;
            address1Cell.textContent = user.address;
            websiteCell.textContent = user.website;
            emailCell.textContent = user.lead_email;
            buttonCell.appendChild(updateButton);
            buttonCell.appendChild(deleteButton);


            row.appendChild(companyNameCell);
            row.appendChild(contactNameCell);
            row.appendChild(phone1Cell);
            row.appendChild(phone2Cell);
            row.appendChild(address1Cell);
            row.appendChild(websiteCell);
            row.appendChild(emailCell);
            row.appendChild(buttonCell);

            tbodyUserTable.appendChild(row);
        });
    })
}

function searchFunction(input, table) {
    // Declare variables
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById(input);
    filter = input.value.toUpperCase();
    table = document.getElementById(table);
    tr = table.getElementsByTagName("tr");
  
    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[0];
      if (td) {
        txtValue = td.textContent || td.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }
    }
  }

function sendUpdateData(button) {
    let row = button.parentElement.parentElement
    let cells = row.getElementsByTagName('td')
    let data = {
        companyName: cells[0].innerText,
        contactName: cells[1].innerText,
        phone1: cells[2].innerText,
        phone2: cells[3].innerText,
        address: cells[4].innerText,
        website: cells[5].innerText,
        email: cells[6].innerText
    }

    sessionStorage.setItem('updateData', JSON.stringify(data))
    window.location.href = "updateLeads.html"
}

function populateUpdateForm() {
    let data = JSON.parse(sessionStorage.getItem('updateData'))

    document.getElementById('updatedLeadCompanyName').value = data.companyName
    document.getElementById('updatedLeadContactName').value = data.contactName
    document.getElementById('updatedLeadPhone1').value = data.phone1
    document.getElementById('updatedLeadPhone2').value = data.phone2
    document.getElementById('updatedLeadAddress1').value = data.address
    document.getElementById('updatedLeadAddress2').value = data.address
    document.getElementById('updatedLeadWebsite').value = data.website
    document.getElementById('updatedLeadEmail').value = data.email
}

function detectText(image) {
    // make server call to translate image
    // and return the server upload promise
    return fetch(serverUrl + "/images/" + image["fileId"] + "/detect-text", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(
            {fromLang: "auto", toLang: "en"}
        )
    }).then(response => {
        if (response.ok) {
            return response.json();

        } else if (response.status === 401) {
            alert("Session Timed Out!");
            Wwindow.location.replace("index.html", "_self")
        } else {
            throw new HttpError(response);
        }
    })
}

function annotateImage(translations) {
    let translationsElem = document.getElementById("translations");
    while (translationsElem.firstChild) {
        translationsElem.removeChild(translationsElem.firstChild);
    }
    translationsElem.clear
    for (let i = 0; i < translations.length; i++) {
        let translationElem = document.createElement("h6");
        translationElem.appendChild(document.createTextNode(translations[i]["text"] + " -> " + translations[i]["translation"]["translatedText"]));
        translationsElem.appendChild(document.createElement("hr"));
        translationsElem.appendChild(translationElem);
    }
}
// TODO
function uploadAndDetect() {
    uploadImage()
    .then(image => updateImage(image))
    .then(image => detectText(image))
    .then(text => fillCreateForm(text))
    .catch(error => {
        alert("Error: " + error);
    })
}

function Translate() {
    getUploadedImage()
        .then(image => translateImage(JSON.parse(image)))
        .then(translations => annotateImage(translations))
        .catch(error => {
            alert("Error: " + error);
        })
}


class HttpError extends Error {
    constructor(response) {
        super(`${
            response.status
        } for ${
            response.url
        }`);
        this.name = "HttpError";
        this.response = response;
    }
}

function deleteLead(button) {
    let row = button.parentElement.parentElement
    let cells = row.getElementsByTagName('td')
    let dict = {

        'lead_name': cells[1].innerText
    }

    return fetch(serverUrl + "/delete", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify(dict)

    }).then(response => {

        if (response.ok) {
            return response.json().then(data => {
                alert("Lead Data Deleted!")
                window.location.replace("searchLeads.html", "_self")

            });

        } else if (response.status === 401) {
            alert("Session Timed Out!");
            window.location.replace("index.html", "_self")
        } else {
            throw new HttpError(response);
        }


    })
}

function signOut(){
    window.location.replace("index.html", "_self")
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    
}
