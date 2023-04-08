//show image on html, access image with event.target.files[0]
"use strict";

const serverUrl = "http://127.0.0.1:8000";

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
function fillCreateForm(text) {
    //nothing to detect company name, possibly needs to be changed to regular input in html
    let CompanyNameSelect = document.getElementById('newLeadCompanyName')
    // access selects
    let firstNameSelect = document.getElementById('newLeadContactFirstName')
    let lastNameSelect = document.getElementById('newLeadContactLastName')
    let phone1Select = document.getElementById('newLeadPhone1')
    let phone2Select = document.getElementById('newLeadPhone2')
    let addressSelect = document.getElementById('newLeadAddress')
    let websiteSelect = document.getElementById('newLeadWebsite')
    let emailSelect = document.getElementById('newLeadEmail')

    //this is assuming the columns from response are text['names'], could possibly be text.names
    //fill first and last names
    let names = text['names']
    names.forEach(name => {
        let newOption = new Option(name)
        firstNameSelect.add(newOption, undefined)
    });
    names.forEach(name => {
        let newOption = new Option(name)
        lastNameSelect.add(newOption, undefined)
    });

    //fill phone 1 and 2
    let phones = text['phones']
    phones.forEach(phone => {
        let newOption = new Option(phone)
        phone1Select.add(newOption, undefined)
    });
    phones.forEach(phone => {
        let newOption = new Option(phone)
        phone2Select.add(newOption, undefined)
    });

    //fill addresses
    let addresses = text['addresses']
    addresses.forEach(address => {
        let newOption = new Option(address)
        addressSelect.add(newOption, undefined)
    });

    //fill websites
    let websites = text['urls']
    websites.forEach(website => {
        let newOption = new Option(website)
        websiteSelect.add(newOption, undefined)
    });

    //fill emails
    let emails = text['emails']
    emails.forEach(email => {
        let newOption = new Option(email)
        emailSelect.add(newOption, undefined)
    });

}
//TODO
function submitNewLead(){
    let CompanyNameSelect = document.getElementById('newLeadCompanyName')
    let companyName = CompanyNameSelect.options[CompanyNameSelect.selectedIndex].value

    let firstNameSelect = document.getElementById('newLeadContactFirstName')
    let firstName = firstNameSelect.options[firstNameSelect.selectedIndex].value

    let lastNameSelect = document.getElementById('newLeadContactLastName')
    let lastName = lastNameSelect.options[lastNameSelect.selectedIndex].value

    let phone1Select = document.getElementById('newLeadPhone1')
    let phone1 = phone1Select.options[phone1Select.selectedIndex].value


    let phone2Select = document.getElementById('newLeadPhone2')
    let phone2 = phone2Select.options[phone2Select.selectedIndex].value


    let addressSelect = document.getElementById('newLeadAddress')
    let address = addressSelect.options[addressSelect.selectedIndex].value


    let websiteSelect = document.getElementById('newLeadWebsite')
    let website = websiteSelect.options[websiteSelect.selectedIndex].value


    let emailSelect = document.getElementById('newLeadEmail')
    let email = emailSelect.options[emailSelect.selectedIndex].value

    //take values and submit to database etc here

}
//TODO
function updateLead(){
    let companyName = document.getElementById('updatedLeadCompanyName').value

    let firstName = document.getElementById('updatedLeadContactFirstName').value

    let lastName = document.getElementById('updatedLeadContactLastName').value

    let phone1 = document.getElementById('updatedLeadPhone1').value

    let phone2 = document.getElementById('updatedLeadPhone2').value

    let address = document.getElementById('updatedLeadAddress').value

    let website = document.getElementById('updatedLeadWebsite').value

    let email = document.getElementById('updatedLeadEmail').value

    //update values in db etc here
}
//TODO
function signIn(){
    let username = document.getElementById('signInUsername').value
    let password = document.getElementById('signInPassword').value

    //use db to check if user and pass match

}


function signUp(){
    let firstName = document.getElementById('signUpFirstName').value
    let lastName = document.getElementById('signUpLastName').value
    let username = document.getElementById('signUpUsername').value
    let password = document.getElementById('signUpPassword').value
    let confirmPassword = document.getElementById('signUpPasswordConfirm').value

    if (password === confirmPassword){
        //check if passwords match, then submit to db
        //TODO
    }
}
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
/* WORKFLOW for detecting text/labels from image:
    1- upload image, display image (uploadImage())
    2- translate image(translateImage())
    3- display raw translations(annotateImage())
    4- detect text and split into labels (detectText())
    5- fill create form with suggestions (fillCreateForm())

    the other way to do this is to DELETE the translate endpoint 
    and detect text and translate in one endpoint
*/

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