const { ipcRenderer } = window.require("electron");

// global varibles....

// Dom Declaration
const fileBoardNode = document.querySelector(".file-board");
const fileNameNode = document.querySelector(".file-name");
const fileListNode = document.querySelector(".file-list");
const updateBtnNode = document.querySelector(".update-btn");
const createBtnNode = document.querySelector(".create-btn");

let activeFileName = "";
let activeFileIdentifier = "";

// CONSTANTS..

const UPDATE = "Update";
const UPDATED = "Updated..";
const EDIT = "Edit";
const CREATE = "Create";
const SAVE = "Save";
const SAVED = "Saved";

// initial dom setup.
updateBtnNode.classList.add("deactive-btn");

const loadAllFiles = function () {
  ipcRenderer.send("load-files");
};

loadAllFiles();

const loadFile = function (fileName, identifier) {
  if (activeFileName !== fileName) {
    // remove "active" class from last active file node
    activeFileIdentifier &&
      document
        .querySelector(`.${activeFileIdentifier}`)
        .classList.remove("active");

    // add "active" class to selected file
    document
      .querySelector(`.${identifier}`)
      .classList.add("active");

    updateBtnNode.classList.remove("deactive-btn");
    fileNameNode.classList.remove("fade-text");
    fileBoardNode.classList.remove("fade-text");

    activeFileName = fileName;
    activeFileIdentifier = identifier;
    ipcRenderer.send("read-file", fileName);
  }
};

const updateFile = function () {
  console.log(updateBtnNode.textContent);
  if (updateBtnNode.textContent.trim(" ") === EDIT)
    editBtnHandler();
  else updateBtnHandler();
};

const editBtnHandler = function () {
  updateBtnNode.textContent = UPDATE;
  fileBoardNode.classList.add("active");
  fileBoardNode.setAttribute("contentEditable", true);
};

const updateBtnHandler = function () {
  updateBtnNode.textContent = UPDATED;
  fileBoardNode.classList.remove("active");
  fileBoardNode.setAttribute("contentEditable", false);
  const newContent = fileBoardNode.textContent;

  ipcRenderer.send(
    "update-file",
    newContent,
    activeFileName
  );
};

const createFileHandler = function () {
  if (createBtnNode.textContent.trim(" ") === CREATE)
    createBtnHandler();
  else saveBtnHandler();
};

const createBtnHandler = function () {
  fileNameNode.setAttribute("contentEditable", true);
  fileBoardNode.setAttribute("contentEditable", true);
  fileBoardNode.textContent = "";
  fileNameNode.textContent = "newfile.txt";
  fileNameNode.classList.add("fade-text");
  fileBoardNode.classList.add("fade-text");
  createBtnNode.textContent = SAVE;
};

const saveBtnHandler = function () {
  fileNameNode.setAttribute("contentEditable", false);
  fileBoardNode.setAttribute("contentEditable", false);
  fileNameNode.classList.remove("fade-text");
  fileBoardNode.classList.remove("fade-text");
  createBtnNode.textContent = SAVED;
  ipcRenderer.send(
    "update-file",
    fileBoardNode.textContent,
    fileNameNode.textContent,
    true
  );
};

const fileList = function (fileName, index) {
  const liNode = document.createElement("li");
  liNode.classList = `file file${index}`;
  liNode.innerText = fileName;
  liNode.addEventListener(
    "click",
    loadFile.bind(this, fileName, `file${index}`)
  );
  fileListNode.appendChild(liNode);
};

const fileListHandler = function (files) {
  const fileHeading = document.createElement("h4");
  fileHeading.className = "sub-headings";
  fileHeading.innerText = "Files";
  fileListNode.appendChild(fileHeading);

  files.forEach((file, index) => {
    fileList(file, index);
  });
};

ipcRenderer.on("file-list", (event, files) => {
  fileListHandler(files);
});

ipcRenderer.on("file-content", (event, content) => {
  fileNameNode.textContent = activeFileName;
  fileBoardNode.textContent = content;
});

ipcRenderer.on("file-update-success", (event, arg) => {
  setTimeout(() => {
    if (updateBtnNode.textContent === UPDATED)
      updateBtnNode.textContent = EDIT;
    if (createBtnNode.textContent === SAVED) {
      createBtnNode.textContent = CREATE;
    }
  }, 2000);
});

ipcRenderer.on("new-file-entry", (event, fileName) => {
  fileList(fileName);
});
