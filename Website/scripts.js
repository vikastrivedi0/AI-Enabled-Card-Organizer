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
function fillCreateForm(text) {
    //create selects, remove previous values except first one ("Suggested Company Names" option)
    let companyNameSelect = document.getElementById('newLeadCompanyName')
    // for (i = companyNameSelect.options.length - 1; i >= 1; i--) {
    //     companyNameSelect.remove(i)
    // }
    let contactNameSelect = document.getElementById('newLeadContactName')
    // for (i = contactNameSelect.options.length - 1; i >= 1; i--) {
    //     contactNameSelect.remove(i)
    // }
    let phone1Select = document.getElementById('newLeadPhone1')
    // for (i = phone1Select.options.length - 1; i >= 1; i--) {
    //     phone1Select.remove(i)
    // }
    let phone2Select = document.getElementById('newLeadPhone2')
    // for (i = phone2Select.options.length - 1; i >= 1; i--) {
    //     phone2Select.remove(i)
    // }
    let address1Select = document.getElementById('newLeadAddress1')
    // for (i = address1Select.options.length - 1; i >= 1; i--) {
    //     address1Select.remove(i)
    // }
    let address2Select = document.getElementById('newLeadAddress2')
    // for (i = address2Select.options.length - 1; i >= 1; i--) {
    //     address2Select.remove(i)
    // }
    let websiteSelect = document.getElementById('newLeadWebsite')
    // for (i = websiteSelect.options.length - 1; i >= 1; i--) {
    //     websiteSelect.remove(i)
    // }
    let emailSelect = document.getElementById('newLeadEmail')
    // for (i = emailSelect.options.length - 1; i >= 1; i--) {
    //     emailSelect.remove(i)
    // }
    //fill first and last names
    let names = text['names']
    names.forEach(name => {
        let newOption = new Option(name, name)
        companyNameSelect.add(newOption, undefined)
    });
    names.forEach(name => {
        let newOption = new Option(name, name)
        contactNameSelect.add(newOption, undefined)
    });

    //fill phone 1 and 2
    let phones = text['phones']
    phones.forEach(phone => {
        let newOption = new Option(phone, phone)
        phone1Select.add(newOption, undefined)
    });
    phones.forEach(phone => {
        let newOption = new Option(phone, phone)
        phone2Select.add(newOption, undefined)
    });

    //fill addresses
    let addresses = text['addresses']
    addresses.forEach(address => {
        let newOption = new Option(address, address)
        address1Select.add(newOption, undefined)
    });
    addresses.forEach(address => {
        let newOption = new Option(address, address)
        address2Select.add(newOption, undefined)
    });

    //fill websites
    let websites = text['urls']
    websites.forEach(website => {
        let newOption = new Option(website, website)
        websiteSelect.add(newOption, undefined)
    });

    //fill emails
    let emails = text['emails']
    emails.forEach(email => {
        let newOption = new Option(email, email)
        emailSelect.add(newOption, undefined)
    });

}

//TODO
  function submitNewLead() {
    let CompanyNameSelect = document.getElementById('newLeadCompanyName')
    let companyName = CompanyNameSelect.options[CompanyNameSelect.selectedIndex].value

    let contactNameSelect = document.getElementById('newLeadContactName')
    let contactName = contactNameSelect.options[contactNameSelect.selectedIndex].value

    let phone1Select = document.getElementById('newLeadPhone1')
    let phone1 = phone1Select.options[phone1Select.selectedIndex].value


    let phone2Select = document.getElementById('newLeadPhone2')
    let phone2 = phone2Select.options[phone2Select.selectedIndex].value


    let address1Select = document.getElementById('newLeadAddress1')
    let address1 = address1Select.options[address1Select.selectedIndex].value

    let address2Select = document.getElementById('newLeadAddress2')
    let address2 = address2Select.options[address2Select.selectedIndex].value


    let websiteSelect = document.getElementById('newLeadWebsite')
    let website = websiteSelect.options[websiteSelect.selectedIndex].value


    let emailSelect = document.getElementById('newLeadEmail')
    let email = emailSelect.options[emailSelect.selectedIndex].value

    //take values and submit to database etc here

    var address=address1+" "+address2
    var dict = { 'lead_name':contactName, 
                 'company_name':companyName,
                 'phone1':phone1,
                 'phone2':phone2, 
                 'address':address,
                 'website':website,
                 'lead_email':email 
                };
    console.log("token in js:"+localStorage.getItem('token'))
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
        let json =  response.json()

        }


//TODO , need to pass in lead info in parameter while calling function, probably requires db
function fillUpdateForm(){
    let updatedLeadCompanyNameInput = document.getElementById('updatedLeadCompanyName')
    let updatedLeadContactNameInput = document.getElementById('updatedLeadContactName')
    let updatedLeadPhone1Input = document.getElementById('updatedLeadPhone1')
    let updatedLeadPhone2Input = document.getElementById('updatedLeadPhone2')
    let updatedLeadAddress1Input = document.getElementById('updatedLeadAddress1')
    let updatedLeadAddress2Input = document.getElementById('updatedLeadAddress2')
    let updatedLeadWebsiteInput = document.getElementById('updatedLeadWebsite')
    let updatedLeadEmailInput = document.getElementById('updatedLeadEmail')

    //need to pull values when choosing update in searchLeads page, and insert them here
    updatedLeadCompanyNameInput.value = ""
    updatedLeadContactNameInput.value = ""
    updatedLeadPhone1Input.value = ""
    updatedLeadPhone2Input.value = ""
    updatedLeadAddress1Input.value = ""
    updatedLeadAddress2Input.value = ""
    updatedLeadWebsiteInput.value = ""
    updatedLeadEmailInput.value = ""

}
//TODO, 
function updateLead() {
    let companyName = document.getElementById('updatedLeadCompanyName').value
    let firstName = document.getElementById('updatedLeadContactName').value
    let phone1 = document.getElementById('updatedLeadPhone1').value
    let phone2 = document.getElementById('updatedLeadPhone2').value
    let address1 = document.getElementById('updatedLeadAddress1').value
    let address2 = document.getElementById('updatedLeadAddress2').value
    let website = document.getElementById('updatedLeadWebsite').value
    let email = document.getElementById('updatedLeadEmail').value

    //update values in db etc here
}
//TODO
function signIn() {
    let username = document.getElementById('signInUsername').value
    let password = document.getElementById('signInPassword').value

    //use db to check if user and pass match
      //username=firstName+lastName;
      var dict={
        'username':username,
        'password':password
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
                return response.json().then(data=>{
                    localStorage.setItem('token',data.token);
                    window.open("createLeads.html", "_self");
                    alert("Welcome "+username+"!")
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

    if (password === confirmPassword){
        
        var dict={
            'username':username,
            'password':password
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