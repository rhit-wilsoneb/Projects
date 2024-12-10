let login = document.querySelector("#login");
let signup = document.querySelector("#signup");

let loginbtn = document.querySelector("#loginButton");
let signupbtn = document.querySelector("#signupButton");
let createbtn = document.querySelector("#create");

let username = document.querySelector("#username");
let password = document.querySelector("#password");

let newusername = document.querySelector("#newusername");
let newpassword = document.querySelector("#newpassword");
let confirmpassword = document.querySelector("#confirmpassword");

let returnbtn = document.querySelector("#return");


window.addEventListener("load", function(){
    let login = document.querySelector("#login");
    let signup = document.querySelector("#signup");
    login.classList.remove("hidden")
    signup.classList.add("hidden")
    loginbtn.addEventListener("click", loginFunct);
    signupbtn.addEventListener("click", signupFunct);
    createbtn.addEventListener("click", createFunct);
    returnbtn.addEventListener("click", returnFunct);

    this.document.addEventListener('keydown', function(event){
        if(event.key === 'Enter'){
            if(signup.classList.contains("hidden")){
                loginFunct();
            } else{
                createFunct();
            }
            
        }
    });

});


async function createFunct(){
    if (newpassword.value != confirmpassword.value){
        alert("Passwords do not match.")
        return
    }
    try{
        let response = await fetch("/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "username": newusername.value,
                "password": newpassword.value,
            })
        }); 
        if (response.ok){
            clear();
            login.classList.remove("hidden")
            signup.classList.add("hidden")
        }else {
            alert("Username already in use.")
        }
        
       
    } catch(error){
        alert("Error")
    }
}

async function loginFunct(){
    try{
        let response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "username": username.value,
                "password": password.value
            })
        }); 
        if (response.redirected){
            window.location.href = response.url + "?username=" + username.value;
            clear()
        }else {
            alert("Login or Password does not exist.")
        }
    } catch(error){
        alert("Login or Password does not exist.")
    }
}

function signupFunct(){
    login.classList.add("hidden")
    signup.classList.remove("hidden")
    clear()
}

function returnFunct(){
    login.classList.remove("hidden")
    signup.classList.add("hidden")
    clear()
}

function clear(){
    username.value = "";
    password.value = "";
    newusername.value = "";
    newpassword.value = "";
    confirmpassword.value ="";
}

