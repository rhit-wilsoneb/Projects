var htmlText;
var jsText;
var cssText;
var username;
var displayFileName;
var unsavedChanges;
var profilePicture;
var profileDisplay;
var profileBackground;
var currentPicture;
var backButton;
var inbox;
var messageDisplay;
var fileDisplay;
var allFiles;
var closeMail;
var messageState;
var iframe;
var sharebtn;
var nextFile;
var toDelete;

const picturePath = "./images/split_images/"

window.addEventListener('beforeunload', function(event) {
    event.preventDefault();
});


window.addEventListener("load", function(){
    unsavedChanges = false;
    username = document.querySelector("#username");
    htmlText = document.querySelector("#htmlText");
    cssText  = document.querySelector("#cssText");
    jsText = document.querySelector("#jsText");
    
    
    htmlText.addEventListener("input", function(){
        unsavedChanges = true;
    });
    cssText.addEventListener("input", function(){
        unsavedChanges = true;
    });
    jsText.addEventListener("input", function(){
        unsavedChanges = true;
    });

    const urlParams = new URLSearchParams(window.location.search);
    const urlUserName = urlParams.get('username')
    username.innerHTML = urlUserName;
    let outputDiv = this.document.querySelector(".outputDiv");
    iframe = document.createElement("iframe");
    iframe.id = "frame";
    //iframe.src = "./../userFiles/" + username.innerHTML + "/html.html";
    iframe.src = "./htmls/" + username.innerHTML + ".html"
    outputDiv.appendChild(iframe);
    iframe.contentWindow.location.reload();
    let runButton = this.document.querySelector("#runbtn");

    runButton.addEventListener("click", clickRun);
    let addFilebtn = this.document.querySelector("#addFile");
    addFilebtn.addEventListener("click", addFile);
    let addFilebtn2 = this.document.querySelector("#addFile2");
    addFilebtn2.addEventListener("click", addFile);
    let addFilebtn3 = this.document.querySelector("#addFile3");
    addFilebtn3.addEventListener("click", addFile);
    
    sharebtn = this.document.querySelector("#sharebtn");

    sharebtn.addEventListener("click", function() {
        uploadFile(prompt("Enter receipents username."));
    });

    let savebtn = this.document.querySelector("#savebtn");
    savebtn.addEventListener("click", function(event) {
        uploadFile(username.innerHTML);
    });

    let helpCircle = this.document.querySelector("#helpCircle");
    helpCircle.addEventListener("click", help);
    let helpQuestion = this.document.querySelector("#helpQuestion");
    helpQuestion.addEventListener("click", help);

    this.document.querySelector("#backToLogin").addEventListener("click", backToLogin);
    this.document.querySelector("#pen").addEventListener("click", editFileName);

    backButton = document.getElementById("backButton")
    backButton.addEventListener("click", hideDisplay)
    profilePicture = document.getElementById("profilePicture")
    profilePicture.addEventListener("click", profileView);
    profileBackground = this.document.querySelector("#profileBackground");
    profileDisplay = document.getElementById("profileDisplay")
    currentPicture = this.document.querySelector("#currentPicture");


    
    for (let i = 1; i < 79; i++){
        let img = document.createElement("img");
        img.id = "profile"
        img.src = picturePath + "LegoSWCharacters_" + i + "_38x38.jpg";
        img.addEventListener("click", function(event){
            profileSelect(event)
        });
        profileDisplay.appendChild(img);
    }

    messageDisplay = document.getElementById("messageDisplay")
    fileDisplay = document.getElementById("fileDisplay")
    inbox = document.getElementById("inbox")
    inbox.addEventListener("click", displayMessages)
    closeMail = document.getElementById("closeMail");
    closeMail.addEventListener("click", acceptMessages);
    messageState = {};

    setup();
    loadAllFiles();
    getFiles("Workspace");
});


function displayMessages(){
    let audio = new Audio("../sounds/click.mp3");
    audio.play();
    messageDisplay.style.visibility = "visible";
    fileDisplay.style.visibility = "visible";
    closeMail.style.visibility = "visible";
    getMessages()
}

async function getMessages(){
    try{
        let response = await fetch(`/getMessages/${username.innerHTML}`);
        let info = await response.json();
        fileNames = info["fileNames"];
        userFileNames = info["userFileNames"];
        messageState = {};
        for(let key in fileNames){
            messageState[fileNames[key] ] = {"num": 0,"name": ""};
            let messageDiv = document.createElement("div");
            let sender = fileNames[key].split("?")[1];
            let messageFile = fileNames[key].split("?")[0];
            messageDiv.classList.add("messageDiv");
            let senderText = document.createElement("p");
            let fileText = document.createElement("p");
            senderText.innerHTML = sender;
            fileText.innerHTML = messageFile;
            messageDiv.appendChild(fileText);
            messageDiv.appendChild(senderText);
            for(let i = 0; i < 4; i++){
                let radiobtn = document.createElement("input");
                radiobtn.type = "radio"
                radiobtn.name = messageFile;
                radiobtn.value = "radio" + i;
                if(i == 0){
                    radiobtn.checked = true;
                }
                radiobtn.addEventListener("click", function(){
                    let audio = new Audio("../sounds/click.mp3");
                    audio.play();
                    messageState[fileNames[key]]["num"] = i;
                });
                
                messageDiv.appendChild(radiobtn);
                
            }
            let input = document.createElement("input");
            input.id = messageFile;
            input.classList.add("newName");
            input.addEventListener("input", function(event){
                messageState[fileNames[key]]["name"] = event.target.value;
            });
            messageDiv.appendChild(input);
            messageDisplay.appendChild(messageDiv)    

        }
        
        for(let key in userFileNames){
            let name = document.createElement("p");
            name.innerHTML = userFileNames[key];
            fileDisplay.appendChild(name);
        }

    } catch(error){
        console.error(error);
    }
}

async function acceptMessages(){
    try{
        let response = await fetch("/acceptMessages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "username": username.innerHTML,
                "messageState": messageState

            })
        }); 

        if (response.status == 500){
            alert("File not found.")
        }
        closeMail.style.visibility = "hidden";
        messageDisplay.style.visibility = "hidden";
        fileDisplay.style.visibility = "hidden";
        
        while (messageDisplay.children.length > 1) {
            messageDisplay.removeChild(messageDisplay.lastChild);
        }
        while (fileDisplay.children.length > 1) {
            fileDisplay.removeChild(fileDisplay.lastChild);
        }
        uploadFile(username.innerHTML);
        loadAllFiles();
        getFiles(displayFileName);
    } catch(error){
        console.error("Fetch error");
    }   
}

function hideDisplay(){
    let audio = new Audio("../sounds/click.mp3");
    audio.play();
    currentPicture.style.visibility = "hidden";
    profileDisplay.style.visibility = "hidden";
    profileBackground.style.visibility = "hidden";
    backButton.style.visibility = "hidden";
}

function profileView(){
    let audio = new Audio("../sounds/click.mp3");
    audio.play();
    console.log("display div")
    
    profileDisplay.style.visibility = "visible";
    profileBackground.style.visibility = "visible";
    currentPicture.style.visibility = "visible";
    backButton.style.visibility = "visible";
    currentPicture.src = profilePicture.src;
}



async function profileSelect(event){
        currentPicture.src = event.target.src;
        profilePicture.src = event.target.src;

        let audio = new Audio("../sounds/switchsound.mp3");
        audio.play();
        
        try{
            let response = await fetch("/updateProfilePicture", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "username": username.innerHTML,
                    "profilePicture": profilePicture.src
                })
            }); 

            if (response.status == 409){
                alert("Picture not found.")
            }
    } catch(error){
        console.error("Fetch error");
    }
}



async function uploadFile(user){
    if(user == username.innerHTML){
        unsavedChanges = false;
        let audio = new Audio("../sounds/savesound.mp3");
        audio.play();
    }else {
        let audio = new Audio("../sounds/savesound.mp3");
        audio.play();
    }

    try{
        let response = await fetch("/uploadFile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "username": user,
                "currentUser": username.innerHTML,
                "filename": displayFileName,
                "jsText": jsText.value,
                "cssText": cssText.value,
                "htmlText": htmlText.value
            })
        }); 
        if (response.status == 409){
            alert("User not found.")
        }
        if(user != username.innerHTML && user != null){
            alert("Sent!")
        }

    } catch(error){
        console.error("Fetch error");
    }
    return
}


async function addFile(){
    uploadFile(username.innerHTML);
    let filename = prompt("Enter filename")
    

    try{
        if (filename == null){
            throw new Error("Enter valid filename");
        } if (filename == ""){
            alert("Enter valid filename");
            throw new Error("Enter valid filename");
        }
        console.log("Starting Fetch");
        let response = await fetch("/makefile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "username": username.innerHTML,
                "filename": filename
            })
        }); 
        if(!response.ok){
            if(response.status == 409){
                alert(filename + " already exists.");
                throw new Error(filename + " already exists");
            }
            
        }
        let audio = new Audio("../sounds/click.mp3");
        audio.play();
        loadAllFiles();
        getFiles(filename);
    } catch(error){
        console.error(error);
    }
}


async function clickRun(){
    let audio = new Audio("../sounds/runsound.mp3");
    audio.play();
    try{
        let outputpage = await fetch("/run", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "username": username.innerHTML,
                "htmlText": htmlText.value,
                "jsText": jsText.value,
                "cssText": cssText.value
            })
        }); 
        console.log(iframe.src);
        iframe.contentWindow.location.reload();
    } catch(error){
        console.error("Fetch error");
    }
    

}

async function getFiles(filename){
    try{
        let response = await fetch(`/getFiles/${username.innerHTML}/${filename}`);
        let info = await response.json();
        htmlText.value = info["html"];
        cssText.value = info["css"];
        jsText.value = info["js"];

        profilePicture.src = info["pp"]
        let inboxCount = info["inboxCount"]
        let notification = document.querySelector("#notification");
        this.document.querySelector("#inboxCount").innerHTML = inboxCount;
        if(inboxCount == 0){
            notification.style.visibility = "hidden";
        } else{
            notification.style.visibility = "visible";
        }

        this.document.querySelector("#displayFileName").innerHTML = filename;
        displayFileName = filename;
        let pen = document.querySelector("#pen");
        if(filename == "Workspace"){
            pen.hidden = true;
            sharebtn.hidden = true;
        } else{
            pen.hidden = false;
            sharebtn.hidden = false;
        }
        iframe.contentWindow.location.reload();
        // clickRun();
    } catch(error){
        console.error(error);
    }
    
}

async function loadAllFiles(){
    try{
        let response = await fetch(`/getAllFiles/${username.innerHTML}`);
        let info = await response.json();
        let fileButtons = document.querySelector("#files");
        fileButtons.innerHTML = "";
        
        allFiles =[];
        
        let continueBtn = document.querySelector("#continue")
            continueBtn.addEventListener("click", (event) => {
                let audio = new Audio("../sounds/click.mp3");
                audio.play();
                $('#exampleModalCenter').modal('hide');
                getFiles(nextFile);
            });
        let deleteModal = document.querySelector("#delete")
        deleteModal.addEventListener("click", (event) => {
            let audio = new Audio("../sounds/click.mp3");
            audio.play();
            $('#deleteModal').modal('hide');
            deleteFile(toDelete);
        });
        for(let key in info){
            allFiles.push(info[key]);
            let fileDiv = document.createElement("div");
            fileDiv.id = "fileDiv";


            let newButton = htmlToElement("<button type='button' data-mdb-modal-init data-toggle='modal' data-target='#exampleModalCenter'></button>")
            newButton.innerHTML = info[key];
            newButton.id = "file";
            newButton.addEventListener("click", function(event){
                nextFile = event.target.innerHTML;
            });

            

            fileDiv.appendChild(newButton);

            if(info[key] != "Workspace"){
                // let deleteButton = document.createElement("img");
                let deleteButton = htmlToElement("<img data-mdb-modal-init data-toggle='modal' data-target='#deleteModal'></img>")
                deleteButton.id = "deleteButton";
                deleteButton.linkedFile = info[key];
                deleteButton.src = "./images/trash.png";
                deleteButton.addEventListener("click", function(event){

                    toDelete = event.target.linkedFile;
                });

                
                fileDiv.appendChild(deleteButton);
            }

            fileButtons.appendChild(fileDiv);
        }
    } catch(error){
        console.error(error);
    }
}

async function deleteFile(filename){
    let audio = new Audio("../sounds/deletesound.mp3");
    audio.play();
    console.log("Deleting", filename);

    try{
        let response = await fetch("/deleteFile", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "username": username.innerHTML,
                "filename": filename
            })
        }); 

        loadAllFiles();
        if(filename == displayFileName){
            getFiles("Workspace");
        }
        
    } catch(error){
        console.error("Fetch error");
    }

    
    
}

function help(){
    window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank");
}

async function backToLogin(){
    try{
        let response = await fetch("/backToLogin");
        if (response.redirected){
            window.location.href = response.url + "?username=" + username.value;
            clear()
        }
    } catch(error){
        console.error(error);
    }
}

async function editFileName(){
    let audio = new Audio("../sounds/click.mp3");
    audio.play();
    let edit = document.querySelector("#editFileName");
    let display = document.querySelector("#displayFileName");
    if(edit.hidden){
        edit.hidden = false;
        display.hidden = true;
        edit.value = displayFileName;
    } else{
        edit.hidden = true;
        display.hidden = false;
        let val = edit.value.trim();
        if(val != "" && val != displayFileName){
            try{
                await uploadFile(username.innerHTML);
                await fetch("/edit", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "filename": displayFileName,
                        "newfilename": val,
                        "username": username.innerHTML
                    })
                }); 
                displayFileName = val;
                display.innerHTML = val;
                loadAllFiles();
                getFiles(val);

            } catch(error){
                console.error("Fetch error");
            }
        }
    }   
}

function setup(){
    this.document.addEventListener('keydown', function(event){
        if(event.key == 'Enter' && event.ctrlKey){
            event.preventDefault();
            clickRun();
        }

        if(event.key == 's' && event.ctrlKey){
            event.preventDefault();
            uploadFile(username.innerHTML);
        }


        if(event.key == 'e' && event.ctrlKey){
            event.preventDefault();
            if(displayFileName != "Workspace"){
                uploadFile(prompt("Enter receipents username."));
            }
        }

        if(event.key == 'h' && event.ctrlKey){
            event.preventDefault();
            help();
        }

        if(event.key == 'a' && event.ctrlKey){
            event.preventDefault();
            addFile();
        }

        if(event.key == 'd' && event.ctrlKey){
            event.preventDefault();
            deleteFile(displayFileName);
        }

        if(event.key == 'l' && event.ctrlKey){
            event.preventDefault();
            backToLogin();
        }

        if(event.key == 'y' && event.ctrlKey && !(displayFileName == "Workspace")){
            editFileName();
        }

    });

   
}
function htmlToElement(html){
    var template = document.createElement("template");
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}