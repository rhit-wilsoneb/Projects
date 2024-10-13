const urlStart = "https://opentdb.com/api.php?amount=";

let submitted = 0;
let winningNames = [];
let winningScores = [];

// When the window loads, create the first page, and call setUp
window.addEventListener("load", function(){
    console.log("Running!");
    goToMain();
});

//We need to get the values for the quiz when the user clicks
//Then we need to load the next page with the correct data
function startUp(xhr){
    let centeredSection = document.createElement("section");
    centeredSection.id = "centered";
    centeredSection.innerHTML = xhr.response;
    document.querySelector("body").innerHTML = "";
    document.querySelector("body").appendChild(centeredSection);
    let subButton = document.querySelector("#optionSubmission");
    subButton.addEventListener("click", function(){
        if(document.querySelector("#nameInput").value.length > 0){
            getQuiz();
        } else{
            alert("PLease enter a name");
        }
    });
    let highButton = document.querySelector("#highscores");
    highButton.addEventListener("click", loadHighScores);
}

//We need to get every option, and then send that to open trivia
function getQuiz(){
    let num = document.querySelector("#num").value;
    let cat = document.querySelector("#category").value;
    let diff = document.querySelector("#difficulty").value;
    let type = document.querySelector("#type").value;
    let name = document.querySelector("#nameInput").value;
    let url = urlStart;
    url += num;
    //Adds the arguments to the url
    //If any is detected, this is not needed
    //However to differentiate, we change it slightly
    if(cat != "any"){
        url += "&category=";
        url += cat;
    } else{
        cat += "C";
    }
    if(diff != "any"){
        url += "&difficulty=";
        url += diff;
    } else{
        diff += "D";
    }
    if(type != "any"){
        url += "&type=";
        url += type;
    } else{
        type += "T";
    }
    let xhr = new XMLHttpRequest();
    //Pass in the startQuiz the responce, as well as the descriptions of their options
    xhr.addEventListener("load", function(){
        let response = JSON.parse(xhr.response);
        let code = response["response_code"];
        //Checks if the server responded correctly and prompts the user
        switch(code){
            case 0:
                startQuiz(response,
                    document.getElementById(cat).textContent, 
                    document.getElementById(diff).textContent, 
                    document.getElementById(type).textContent,
                    num, name);
                break;
            case 1:
                alert("There weren't enough questions for the options you selected");
                break;
            case 2:
                alert("Invalid Parameter given");
                break;
            case 3:
                alert("Session Token not found");
                break;
            case 4:
                alert("Session Token empty");
                break;
            case 5:
                alert("Too many requests in 5 seconds. Please try again.");
                break;
            default:
                alert("Something went wrong. Please try again.");
        }
    });
    xhr.open("GET", url);
    xhr.send();
}

//For now assume response code is 0
//If I have extra time, come back here and add error detection
function startQuiz(response, cat, diff, type, num, name){
    let xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function(){
        //Sets the headers for the quiz and then displays it
        document.querySelector("#centered").innerHTML = xhr.response;
        document.querySelector("#category").innerHTML = "Category: " + cat;
        document.querySelector("#difficulty").innerHTML = "Difficulty: " + diff;
        document.querySelector("#type").innerHTML = "Type: " + type;
        displayQuiz(response, num, name);
    });
    xhr.open("GET", "quiz.html");
    xhr.send();
}

//Loop through results and display each question
//Each question will be in a div with a dynamic class name
//Each div will have a section with the choices, and a section with the response to the user answering
function displayQuiz(response, num, name){
    let results = response["results"];
    let percentageP;
    let percentage;
    let hints = [];
    //Create timer
    let timeLeft = num * 60;
    document.querySelector("#timer").innerHTML = "Time Left: " + num + ":00";
    //Everysecond the html text is updated
    //When the timer hits 0, when the quiz is submitted,
    //Or when the user goes back to the main menu, it stops
    //If the timer gets to 0 before the user submits the quiz,
    //The quiz will automatically submit for them
    timeId = setInterval(function(){
        timeLeft = setTimer(timeLeft);
        if(timeLeft == 0){
            clearInterval(timeId);
            submitted = 1
            percentage = submitAnswers(responseSections, feedbacks, correctAnswers, buttons, hints, name);
            percentageP.innerHTML = "You got a " + percentage + "%!";
        }
    }, 1000);
    //Create divs returns references to the radio buttons,
    //The feedback paragrpah elements, the ids of the buttons with the correct answers,
    //The section elements that holds the feedback
    //And the hint buttons
    //These are all used for when the user clicks buttons
    let responses = createDivs(results);
    let buttons = responses[0];
    let feedbacks = responses[1];
    let correctAnswers = responses[2];
    let responseSections = responses[3];
    hints = responses[4];
    //Gets a reference to the paragraph element to display the score when the div at the bottom of the screen is generated
    percentageP = createEndDiv(responseSections, feedbacks, correctAnswers, buttons, timeId, hints, name);
    let newGame = document.createElement("button");
    newGame.classList.add("endButton");
    newGame.textContent = "Main Menu";
    newGame.addEventListener("click", function(){
        clearInterval(timeId);
        goToMain();
    });
    document.querySelector("body").appendChild(newGame);
}

//Creates the divs that hold the questions and answer choices, as well as hint buttons and responses
//Hints aren't in a section, rather they are in between question sections and response sections because they are the only element there
function createDivs(results){
    let buttons = [];
    let feedbacks = [];
    let correctAnswers = [];
    let responseSections = [];
    let labels = [];
    let hints = [];
    let gotHints = [];
    //Results holds all of the questions and their data
    for(let i = 0; i < results.length; i++){
        //Answers will hold each of the incorrect answer(s) and the correct answer
        //This will be used to randomly assign radio buttons to different answers
        let answers = Array.from(results[i]["incorrect_answers"]);
        answers.push(results[i]["correct_answer"]);
        //This is the div that will hold a given question, its hint button if it is multiple choice, and the response
        let curDiv = document.createElement("div");
        curDiv.classList.add("questionDiv");
        //Create the section to hold the question and answers
        //Returns [correctAnswerID, buttonsArray]
        let questionSectionReturns = createQuestionSection(i, results, answers, curDiv);
        correctAnswers.push(questionSectionReturns[0]);
        buttons.push(questionSectionReturns[1]);
        labels.push(questionSectionReturns[2]);
        //If the question was multiple choice, create a hint button
        if(results[i]["type"] == "multiple"){
            let hintButton = document.createElement("button");
            hintButton.classList.add("hintButton");
            hintButton.textContent = "? Hint ?";
            hintButton.setAttribute("id", i);
            hintButton.addEventListener("click", function(){
                gotHints = getHint(hintButton, correctAnswers, buttons, labels, gotHints);
            });
            curDiv.appendChild(hintButton);
            hints.push(hintButton);
            //gotHints stops the user from using the hint button multiple times to get the only right answer
            gotHints.push(0);
        //If it wasn't multiple choice make it null
        //This will ensure that hints is the right size and its indeces match up with the questions
        //gotHints will never be accessed at this element but it still needs a value
        } else{
            hints.push("null");
            gotHints.push(-1);
        }
    
        //Create the section for the question response
        //Returns [sectionElement, feedbackElement]
        let responseSectionReturns = createResponseSection(results[i]["correct_answer"], curDiv);
        responseSections.push(responseSectionReturns[0]);
        feedbacks.push(responseSectionReturns[1]);
        document.querySelector("body").appendChild(curDiv);
        document.querySelector("body").appendChild(document.createElement("br"));
    }
    return [buttons, feedbacks, correctAnswers, responseSections, hints];
}

//Creates the sections with just the questions and answer choices
function createQuestionSection(i, results, answers, curDiv){
    let questionSection = document.createElement("section");
    questionSection.classList.add("questions");
    //Create the paragraph element to display the question
    let question = document.createElement("p");
    question.classList.add("question");
    question.innerHTML = "<strong>" + results[i]["question"] + "</strong>";
    //Add the question to the section
    questionSection.appendChild(question);
    //Create the form for answering the question
    let form = document.createElement("form");
    form.classList.add("form" + i);
    //Create each input
    questionSection.appendChild(form);
    curDiv.appendChild(questionSection);
    return createAnswers(i, results, answers, form);
}

//Creates the sections with just the responses (thefeedback and description)
function createResponseSection(correctAnswer, curDiv){
    let responseSection = document.createElement("section");
    responseSection.classList.add("answer");
    responseSection.classList.add("wrong");
    responseSection.setAttribute("id", "responseOne");
    //Either Incorrect or Correct, which will be changed in submitAnswers
    //The description will not change, and will always state the correct answer
    let feedback = document.createElement("p");
    feedback.innerHTML = "Incorrect";
    responseSection.appendChild(feedback);
    let description = document.createElement("p");
    description.innerHTML = "The correct answer is " + correctAnswer + ".";
    description.classList.add("description");
    responseSection.appendChild(description);
    //Initially the response is hidden, in submitAnswers all sections will be revealed, and the hint buttons will be hidden
    responseSection.hidden = true;
    curDiv.appendChild(responseSection);
    return [responseSection, feedback];
}

//Creates the radio buttons under the questions
function createAnswers(i, results, answers, form){
    let correctAnswer;
    let buttons = [];
    let labels = [];
    for(let j = 0; j < results[i]["incorrect_answers"].length + 1; j++){
        //Create a radio button for every answer choice
        let input = document.createElement("input");
        input.type = "radio";
        input.setAttribute("name", "radio" + i);
        input.setAttribute("id", i.toString() + j.toString());
        //Add this to buttons which will be returned so later submitAnswers can check which button was checked
        buttons.push(input);
        form.appendChild(input);
        let label = document.createElement("label");
        label.htmlFor = i.toString() + j.toString();
        //Choice will pick a new random answer to append to form
        let choice = Math.floor(Math.random() * answers.length);
        label.innerHTML = answers[choice];
        //When the correct answer is added, note which radio button it is, so submitAnswers can check that against the checked button
        if(answers[choice] == results[i]["correct_answer"]){
            correctAnswer = i.toString() + j.toString();
        }
        labels.push(label);
        //Remove the choice from the answer pool, so each answer is added only once
        answers.splice(choice, 1);
        form.appendChild(label);
        form.appendChild(document.createElement("br"));
    }
    return [correctAnswer, buttons, labels];
}

//Called when the submit button is clicked, or when the time runs out to submit the answer
function submitAnswers(sections, feedbacks, correctAnswers, buttons, hints, name){
    let totalNum = 0;
    let rightNum = 0;

    for(let i = 0; i < sections.length; i++){
        totalNum++;
        //Unhide all responses
        sections[i].hidden = false;
        //Check all sections to see if the correct answer was selected
        //Responses start off as wrong, so they only need to change if the user got it right
        for(let j = 0; j < buttons[i].length; j++){
            if(buttons[i][j].checked && correctAnswers[i] == buttons[i][j].getAttribute("id")){
                sections[i].classList.add("right");
                sections[i].classList.remove("wrong");
                feedbacks[i].innerHTML = "Correct!";
                rightNum++;
            }
        }
        //Hide all hints
        if(hints[i] != "null"){
            hints[i].hidden = true;
        }
    } 
    //Gives the percentage right rounded to 2 decmial places
    let percentage = Math.floor((rightNum / totalNum) * 10000) / 100

    //Finds the index in winningScores and Names that the data should be inserted
    //This keeps the data sorted as it goes, so the leaderboard is in order
    //Scores of 0% will not be added
    if(percentage > 0){
        let insertionIndex = -1;
        //Looking for the first element (decending order), the the current score is greater than to move all other data down by splicing
        for(let i = 0; i < winningScores.length; i++){
            if(percentage > winningScores[i]){
                insertionIndex = i;
                break;
            }
        }
        //If no such value was found, because the new score is the lowest (or vacuously the array was empty), add it to the end
        if(insertionIndex == -1){
            winningScores.push(percentage);
            winningNames.push(name);
        } else{
            winningNames.splice(insertionIndex, 0, name);
            winningScores.splice(insertionIndex, 0, percentage);
        }
    }
    return percentage;
}

//This div will hold the submit button and the text telling the user to submit / the users score, before and after submitting respectively
//This is mainly so that these 2 elements can be displayed as Flex
function createEndDiv(responseSections, feedbacks, correctAnswers, buttons, timerId, hints, name){
    submitted = 0;
    let endDiv = document.createElement("div");
    endDiv.classList.add("endDiv");
    let submitButton = document.createElement("button");
    submitButton.classList.add("endButton");
    submitButton.textContent = "Submit Quiz";
    let percentage;
    let percentageP = document.createElement("p");
    percentageP.id = "percentageP";
    percentageP.innerHTML = "Click submit to see your score!";
    //Sets up the submit button to display the percentage correct, stop the timer. and submitAnswers
    submitButton.addEventListener("click", function(){
        if(submitted == 0){
            percentage = submitAnswers(responseSections, feedbacks, correctAnswers, buttons, hints, name);
            percentageP.innerHTML = "You got a " + percentage + "%!";
            clearInterval(timerId);
            submitted = 1;
        }
    });
    endDiv.appendChild(submitButton);
    endDiv.appendChild(percentageP);
    document.querySelector("body").appendChild(document.createElement("br"));
    document.querySelector("body").appendChild(endDiv);
    return percentageP;
}

//Loads the main menu
//This is called when the page is first loaded, 
//And when the user clicks the Main Menu button during the game or when viewing the leaderboard
function goToMain(){
    let xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function(){
        startUp(xhr);
    });
    xhr.open("GET", "mainMenu.html");
    xhr.send();
}

//This is called ever second during the game to update the timer 
function setTimer(timeLeft){
    //timeLeft is passed in and called so that it can retain memory
    timeLeft--;
    let message = "Time Left: ";
    message += Math.floor(timeLeft / 60);
    message += ":";
    if(timeLeft % 60 > 9){
        message += timeLeft % 60;
    } else{
        message += "0" + timeLeft % 60;
    }
    document.querySelector("#timer").innerHTML = message;
    return timeLeft;
}

//This is called when a hint butotn is pressed to strikeout 2 answer choices from the given question
function getHint(hintButton, correctAnswers, buttons, labels, gotHints){
    //Each hint was given an id corresponding to its question number
    //This id is also nicely the index of a lot of information regarding the current question
    let num = parseInt(hintButton.getAttribute("id"));
    //Assume that current answer is 3, then look at indeces 0, 1, and 2, and update if needed
    //Hints aren't used for true/false so we know there are 4 answer choices
    let answerNum = 3;
    for(let i = 0; i < 3; i ++){
        if(correctAnswers[num] == buttons[num][i].getAttribute("id")){
            answerNum = i;
            break;
        }
    }

    //Makes sure that a hint hasn't been used on the current question yet
    if(gotHints[num] == 0){
        //Chooses 2 random choices out of the 3 wrong answers
        let choice1 = Math.floor(Math.random() * 3);
        let choice2 = Math.floor(Math.random() * 2);
        //Each choice should have a 2/3 chance of being struck out
        //choice1 certainly does because it is unchanged
        //This is true for choice2 as well after the if statements if you calculate the probability for a given answer
        if(choice1 == 0){
            choice2++;
        } else if(choice1 == 1 && choice2 == 1){
            choice2 = 2;
        }
        //This shifts the answer choices since they were only picking random values, not necessary answer choices yet
        if(answerNum != 3){
            if(choice1 == answerNum){
                choice1 = 3;
            } else if(choice2 == answerNum){
                choice2 = 3;
            }
        }
        labels[num][choice1].classList.add("strikeThrough");
        labels[num][choice2].classList.add("strikeThrough");
        gotHints[num] = 1;
    }
    return gotHints;
}

//Load the high scores page
function loadHighScores(){
    xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function(){
        document.querySelector("body").innerHTML = xhr.response;
        displayHighScores();
    });
    xhr.open("GET", "highScores.html");
    xhr.send();
}

//Goes through each high score and displays it, as well as creates a button to return to the main menu
function displayHighScores(){
    for(let i = 0; i < winningNames.length; i++){
        let entry = document.createElement("h3");
        entry.innerHTML = winningNames[i] + " got a " + winningScores[i] + "%!";
        document.querySelector("#centered").appendChild(entry);
    }
    let returnButton = document.createElement("button");
    returnButton.classList.add("menuButton");
    returnButton.textContent = "Main Menu";
    returnButton.addEventListener("click", goToMain);
    document.querySelector("#centered").appendChild(returnButton);
}