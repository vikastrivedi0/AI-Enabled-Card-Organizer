//show image on html, access image with event.target.files[0]
"use strict";

const serverUrl = "http://127.0.0.1:8000";
// var authToken=localStorage.getItem('token')

async function uploadImage() {
    // encode input file as base64 string for upload
    let file = document.getElementById("uploadImage").files[0];

    let converter = new Promise(function (resolve, reject) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result
            .toString().replace(/^data:(.*,)?/, ''));
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
        body: JSON.stringify({ filename: file.name, filebytes: encodedString })
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new HttpError(response);
        }
    })
}

function updateImage(image) {
    let imageElem = document.getElementById("imageOutput");
    imageElem.style.width = '600px'
    imageElem.style.height = '400px'
    imageElem.src = image["fileUrl"];
    imageElem.alt = image["fileId"];

    return image;
}

function clearFile() {
    let imageContainer = document.getElementById('imageOutput')
    imageContainer.src = ""
}

function translateImage(image) {
    // make server call to translate image
    // and return the server upload promise
    return fetch(serverUrl + "/images/" + image["fileId"] + "/translate-text", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fromLang: "auto", toLang: "en" })
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new HttpError(response);
        }
    })
}

function addOptionToDatalist(datalist, optionValue) {
    let newOption = document.createElement('option');
    newOption.value = optionValue;
    datalist.appendChild(newOption);
}

function fillCreateForm(text) {
    //create datalist pointers, remove previous values except first one ("Suggested Company Names" option)
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

    //fill company name
    let names = text['names']
    names.forEach(name => {
        addOptionToDatalist(companyNameDataList, name)
    });
    //fill contact name
    names.forEach(name => {
        addOptionToDatalist(contactNameDataList, name)
    });
    //fill phone 1 and 2
    let phones = text['phones']
    phones.forEach(phone => {
        addOptionToDatalist(phone1DataList, phone)
    });
    phones.forEach(phone => {
        addOptionToDatalist(phone2DataList, phone)
    });
    //fill addresses
    let addresses = text['addresses']
    addresses.forEach(address => {
        addOptionToDatalist(address1DataList, address)
    });
    addresses.forEach(address => {
        addOptionToDatalist(address2DataList, address)
    });
    //fill websites
    let websites = text['urls']
    websites.forEach(website => {
        addOptionToDatalist(websiteDataList, website)
    });
    //fill emails
    let emails = text['emails']
    emails.forEach(email => {
        addOptionToDatalist(emailDataList, email)
    });

}

//TODO
function submitNewLead() {
    let companyName = document.getElementById('newLeadCompanyName').value
    let contactName = document.getElementById('newLeadContactName').value
    let phone1 = document.getElementById('newLeadPhone1').value
    let phone2 = document.getElementById('newLeadPhone2').value
    let address1 = document.getElementById('newLeadAddress1').value
    let address2 = document.getElementById('newLeadAddress2').value
    let website = document.getElementById('newLeadWebsite').value
    let email = document.getElementById('newLeadEmail').value

    //take values and submit to database here
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
    }).then(response => response.json())
        .then(data => {
            alert("Lead Data Saved");
            window.location.replace("searchLeads.html", "_self");
        }).catch((err) => {
            console.log(err)
        })
    let json = response.json()

}

//TODO, 
function updateLead() {
    let companyName = document.getElementById('updatedLeadCompanyName').value
    let contactName = document.getElementById('updatedLeadContactName').value
    let phone1 = document.getElementById('updatedLeadPhone1').value
    let phone2 = document.getElementById('updatedLeadPhone2').value
    let address1 = document.getElementById('updatedLeadAddress1').value
    let address2 = document.getElementById('updatedLeadAddress2').value
    let website = document.getElementById('updatedLeadWebsite').value
    let email = document.getElementById('updatedLeadEmail').value

    //update values in db etc here
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
    }).then(response => response.json())
        .then(data => {
            alert("Lead Data Updated");
            window.location.replace("searchLeads.html", "_self");
        }).catch((err) => {
            console.log(err)
        })
    //let json =  response.json()

}

//TODO
function signIn() {
    let username = document.getElementById('signInUsername').value
    let password = document.getElementById('signInPassword').value

    //use db to check if user and pass match
    //username=firstName+lastName;
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
        } else {
            throw new HttpError(response);
        }
    })

}

function sendUpdateData(button) {
    let row = button.parentElement.parentElement
    let cells = row.getElementsByTagName('td')
    let data = {
        companyName: cells[0].innerText,
        contactName: cells[1].innerText,
        phone1: cells[2].innerText,
        phone2: cells[3].innerText,
        address1: cells[4].innerText,
        address2: cells[5].innerText,
        website: cells[6].innerText,
        email: cells[7].innerText,
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
    document.getElementById('updatedLeadAddress1').value = data.address1
    document.getElementById('updatedLeadAddress2').value = data.address2
    document.getElementById('updatedLeadWebsite').value = data.website
    document.getElementById('updatedLeadEmail').value = data.email

}

//response from search api is:
// [
//     null,
//     [
//         {
//             "website": {
//                 "S": "Suggested Websites"
//             },
//             "company_name": {
//                 "S": "Suggested Company Names"
//             },
//             "lead_name": {
//                 "S": "Suggested Contact Names"
//             },
//             "phone1": {
//                 "S": "Suggested Phones"
//             },
//             "phone2": {
//                 "S": "Suggested Phones"
//             },
//             "username": {
//                 "S": "pi"
//             },
//             "lead_email": {
//                 "S": "Suggested Emails"
//             },
//             "address": {
//                 "S": "Suggested Addresses Suggested Addresses"
//             }
//         },
//         {
//             "website": {
//                 "S": "Suggested Websites"
//             },
//             "company_name": {
//                 "S": "DAVID PACKARD ELECTRICAL ENGINEERING"
//             },
//             "lead_name": {
//                 "S": "RAFAEL ULATE"
//             },
//             "phone1": {
//                 "S": "PHONE: (650) 725-9327"
//             },
//             "phone2": {
//                 "S": "FAX: (650) 723- 1882"
//             },
//             "username": {
//                 "S": "pi"
//             },
//             "lead_email": {
//                 "S": "ulate@ee.stanford.edu"
//             },
//             "address": {
//                 "S": "350 SERRA MALL, ROOM 170 STANFORD, CALIFORNIA 94305-9505"
//             }
//         }
//     ]
// ]
//TODO
function detectText(image) {
    // make server call to translate image
    // and return the server upload promise
    return fetch(serverUrl + "/images/" + image["fileId"] + "/detect-text", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fromLang: "auto", toLang: "en" })
    }).then(response => {
        if (response.ok) {
            return response.json();
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
        translationElem.appendChild(document.createTextNode(
            translations[i]["text"] + " -> " + translations[i]["translation"]["translatedText"]
        ));
        translationsElem.appendChild(document.createElement("hr"));
        translationsElem.appendChild(translationElem);
    }
}
//TODO
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
    updateImage()
        .then(image => translateImage(image))
        .then(translations => annotateImage(translations))
        .catch(error => {
            alert("Error: " + error);
        })
}

class HttpError extends Error {
    constructor(response) {
        super(`${response.status} for ${response.url}`);
        this.name = "HttpError";
        this.response = response;
    }
}

function deleteLead() {
    let contactName = document.getElementById('updatedLeadContactName').value
    var dict = {
        'lead_name': contactName,

    }


    return fetch(serverUrl + "/delete", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dict)

    }).then(response => {
        if (response.ok) {
            return response.json().then(data => {
                alert("Lead Data Deleted!")
                window.location.replace("searchLeads.html", "_self");


            });

        } else {
            throw new HttpError(response);
        }
    })
}