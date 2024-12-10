
import flask
from flask import Flask, flash, request, redirect, url_for
import json
import pickledb
import os
import random
userFilePath = "./userFiles/"
sharedFilesPath = "./sharedFiles/"
picturePath = "./images/split_images/"
htmlsPath = "./public/htmls/"

app = flask.Flask(__name__, 
                  static_url_path="",
                  static_folder="./public"
                  )

database_file = 'users.db'
db_name = "users"
db = pickledb.load(database_file, True)

if not db.get(db_name):
    db.dcreate(db_name)

@app.route("/")
def bootUp():
    if not os.path.exists(userFilePath):
        os.makedirs(userFilePath)
    if not os.path.exists(sharedFilesPath):
        os.makedirs(sharedFilesPath)
    if not os.path.exists(htmlsPath):
        os.makedirs(htmlsPath)
    
    return flask.send_from_directory(app.static_folder, "login.html")

@app.post("/create")
def create():
    data = flask.request.get_json()
    user = data.get("username")
    password = data.get("password")
    if db.dexists(db_name, user):
        return flask.Response("User already exists.", status=404)
    os.makedirs(userFilePath + user)
    os.makedirs(sharedFilesPath + user)

    with open(userFilePath + user + "/Workspace_HTML.txt", "w") as file:
        file.write("<h3>Hello World!</h3>")
    with open(userFilePath + user + "/Workspace_CSS.txt", "w") as file:
        file.write("h3{\ncolor: red;\n}")

    open(userFilePath + user + "/Workspace_JS.txt", "w")
    with open(userFilePath + user + "/fileList.txt", "w") as file:
        file.write("Workspace\n")

    open("./public/htmls/" + user + ".html","w")

    open(sharedFilesPath + user + "/fileList.txt", "w")

    db.dadd(db_name, (user, {"password": password, "pp":  picturePath + "LegoSWCharacters_" + str(random.randint(1,78)) + "_38x38.jpg"}))
    return flask.jsonify({"message": "Account added successfully"})

@app.post("/login")
def editor():
    data = flask.request.get_json()
    user = data.get("username")
    password = data.get("password")
    if not db.dexists(db_name, user):
        return flask.Response("User not found", status=404)
    userData = db.dget(db_name, user)
    if userData["password"] == password:
        return flask.redirect("./index.html", code=302)
    else:
        return flask.Response("Password not found", status=404)
      

@app.post("/run")
def run():
    info = flask.request.get_json()
    htmlText = info["htmlText"]
    cssText = info["cssText"]
    jsText = info["jsText"]
    username = info["username"]
    htmlFile = open("./public/htmls/" + username + ".html","w")
    htmlFile.write("<!doctype html> <html>" + htmlText + "<style>" + cssText + "</style>" + "<script>" + jsText + "</script> </html>")
    return flask.Response(response="ok", status=200,headers={"Content-Type": "application/json"})
    

@app.post("/makefile")
def makefile():
    info = flask.request.get_json()
    filename = info["filename"]
    username = info["username"]
    if (os.path.isfile(userFilePath + username + "/" + filename + "_HTML.txt")):
        return flask.Response(filename+ " already exists", status=409, headers={"Content-Type": "application/json"})
    open(userFilePath + username + "/" + filename + "_HTML.txt", "w")
    open(userFilePath + username + "/" + filename + "_CSS.txt", "w")
    open(userFilePath + username + "/" + filename + "_JS.txt", "w")
    with open(userFilePath + username + "/fileList.txt", "a") as file:
        file.write(filename + "\n")
    return flask.Response(response="ok", status=200, headers={"Content-Type": "application/json"})
    

@app.post("/uploadFile")
def uploadFile():
    info = flask.request.get_json()
    htmlText = info["htmlText"]
    cssText = info["cssText"]
    jsText = info["jsText"]
    username = info["username"]
    filename = info["filename"]
    currentUser = info["currentUser"]

    if not db.dexists(db_name, username):
        return flask.Response("User not found", status=404)
    
    writePath = userFilePath
    endPath = ""
    if(currentUser != username):
        writePath = sharedFilesPath
        endPath = "?" + currentUser
        oldFiles = []
        with open(sharedFilesPath + username + "/fileList.txt", "r") as file:
            for line in file:
                curLine = line.strip()
                if(curLine != filename + endPath):
                    oldFiles.append(curLine)
        with open(sharedFilesPath + username + "/fileList.txt", "w") as file:
            for line in oldFiles:
                file.write(line + "\n")
            file.write(filename + endPath + "\n")


    with open(writePath + username + "/" + filename + "_HTML.txt" + endPath, "w") as file:
        file.writelines(htmlText)

    with open(writePath + username + "/" + filename + "_CSS.txt" + endPath, "w") as file:
        file.writelines(cssText)

    with open(writePath + username + "/" + filename + "_JS.txt" + endPath, "w") as file:
        file.writelines(jsText)

    return flask.Response(response="ok", status=200, headers={"Content-Type": "application/json"})


@app.get("/getFiles/<username>/<filename>")
def getFiles(username, filename):

    content1 = ""
    content2 = ""
    content3 = ""
    inboxCount = 0
    with open(sharedFilesPath + username + "/" +  "fileList.txt", "r") as file:
        for line in file:
            inboxCount += 1
    info = db.dget(db_name, username)
    profilePicture = info["pp"] 

    with open(userFilePath + username + "/" + filename + "_HTML.txt", "r") as file:
        content1 = file.read()
    with open(userFilePath + username + "/" + filename + "_CSS.txt", "r") as file:
        content2 = file.read()
    with open(userFilePath + username + "/" + filename + "_JS.txt", "r") as file:
        content3 = file.read()
    
    with open("./public/htmls/" + username + ".html","w") as file:
        file.write("<!doctype html> <html>" + content1 + "<style>" + content2 + "</style>" + "<script>" + content3 + "</script> </html>")

    return flask.jsonify({"html": content1, "css": content2, "js": content3, "pp": profilePicture, "inboxCount": inboxCount})

@app.get("/getAllFiles/<username>")
def getAllFiles(username):
    fileNames = {}
    with open(userFilePath + username + "/" +  "fileList.txt", "r") as file:
        i = 0
        for line in file:
            fileNames["file" + str(i)] = line.strip()
            i = i + 1
    
    return flask.jsonify(fileNames)


@app.delete("/deleteFile")
def deletefile():
    print("deleting")
    info = flask.request.get_json()
    username = info["username"]
    filename = info["filename"]
    try:
        os.remove(userFilePath + username + "/" + filename + "_HTML.txt")
        os.remove(userFilePath + username + "/" + filename + "_CSS.txt")
        os.remove(userFilePath + username + "/" + filename + "_JS.txt")
        
        fileNames = []
        with open(userFilePath + username + "/" +  "fileList.txt", "r") as file:
            i = 0
            for line in file:
                if line.strip() != filename:
                    fileNames.append(line.strip())
                    i = i + 1   
        with open(userFilePath + username + "/" +  "fileList.txt", "w") as file:
            for line in fileNames:
                file.write(line + "\n")

    except Exception as e:
        print("Error deleting file")

    return flask.Response(response="ok", status=200, headers={"Content-Type": "application/json"})

@app.get("/backToLogin")
def backToLogin():
    return flask.redirect("./login.html", code=302, Response=None)
    
@app.put("/edit")
def edit():
    info = flask.request.get_json()
    username = info["username"]
    filename = info["filename"]
    newfilename = info["newfilename"]
    os.rename(userFilePath + username + "/" + filename + "_HTML.txt", userFilePath + username + "/" + newfilename + "_HTML.txt")
    os.rename(userFilePath + username + "/" + filename + "_CSS.txt", userFilePath + username + "/" + newfilename + "_CSS.txt")
    os.rename(userFilePath + username + "/" + filename + "_JS.txt", userFilePath + username + "/" + newfilename + "_JS.txt")  

    fileNames = []
    with open(userFilePath + username + "/" +  "fileList.txt", "r") as file:
        i = 0
        for line in file:
            if line.strip() != filename:
                fileNames.append(line.strip())
                i = i + 1 
            else:
                fileNames.append(newfilename)
        
    with open(userFilePath + username + "/" +  "fileList.txt", "w") as file:
        for line in fileNames:
            file.write(line + "\n")  

    return flask.Response(response="ok", status=200, headers={"Content-Type": "application/json"})
    
@app.post("/updateProfilePicture")
def updateProfilePicture():
    info = flask.request.get_json()
    username = info["username"]
    picture = info["profilePicture"]
    print(picture)
    data = db.dget(db_name, username)
    userPassword = data["password"]
    print(userPassword)
    db.dadd(db_name, (username, {"password": userPassword, "pp": picture}))
    return flask.Response(response="ok", status=200, headers={"Content-Type": "application/json"})


@app.get("/getMessages/<username>")
def getMessages(username):
    fileNames = []
    userFileNames = []
    with open(sharedFilesPath + username + "/" +  "fileList.txt", "r") as file:
        for line in file:
            fileNames.append(line)
    with open(userFilePath + username + "/" +  "fileList.txt", "r") as file:
        for line in file:
            userFileNames.append(line)
        
    return flask.jsonify({"fileNames": fileNames, "userFileNames": userFileNames})


@app.post("/acceptMessages")
def acceptMessages():
    info = flask.request.get_json()
    username = info["username"]
    messageState = info["messageState"]
    fileNames = []
    curNames = []
    with open(userFilePath + username + "/" +  "fileList.txt", "r") as file:
        for line in file:
            curNames.append(line.strip())
            
    for key in messageState:
        file = key.strip()
        sender = file.split("?")[1]
        messageFile = file.split("?")[0]
        if messageState[key]["num"] == 0:
            fileNames.append(file)
            continue
        else:
            fileName = messageFile
            if messageState[key]["num"] == 3:
                fileName = messageState[key]["name"]
            if messageState[key]["num"] != 1:
                htmlText = ""
                cssText = ""
                jsText = ""
                with open(sharedFilesPath + username + "/" + messageFile + "_HTML.txt" + "?" + sender, "r") as file:
                    htmlText = file.read()
                with open(sharedFilesPath + username + "/" + messageFile + "_CSS.txt" + "?" + sender, "r") as file:
                    cssText = file.read()
                with open(sharedFilesPath + username + "/" + messageFile + "_JS.txt" + "?" + sender, "r") as file:
                    jsText = file.read()
                
                if(not fileName in curNames):
                    curNames.append(fileName)
                print(userFilePath + username + "/" + fileName + "_HTML.txt")
                with open(userFilePath + username + "/" + fileName + "_HTML.txt", "w") as file:
                    file.writelines(htmlText)
                with open(userFilePath + username + "/" + fileName + "_CSS.txt", "w") as file:
                    file.writelines(cssText)
                with open(userFilePath + username + "/" + fileName + "_JS.txt", "w") as file:
                    file.writelines(jsText)

            os.remove(sharedFilesPath + username + "/" + messageFile + "_HTML.txt" + "?" + sender)
            os.remove(sharedFilesPath + username + "/" + messageFile + "_CSS.txt" + "?" + sender)
            os.remove(sharedFilesPath + username + "/" + messageFile + "_JS.txt" + "?" + sender)


    with open(sharedFilesPath + username + "/" +  "fileList.txt", "w") as file:
        for line in fileNames:
            file.write(line.strip() + "\n")
    with open(userFilePath + username + "/" +  "fileList.txt", "w") as file:
        for line in curNames:
            file.write(line + "\n")
    
    return flask.Response(response="ok", status=200, headers={"Content-Type": "application/json"})

if __name__ == '__main__':
    app.run(port=22102, debug=True)

