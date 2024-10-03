// TASK: import helper functions from utils
// TASK: import initialData
import { getTasks, createNewTask, patchTask, deleteTask } from './utils/taskFunctions.js';
import { initialData } from './initialData.js';


/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem("tasks")) {
    localStorage.setItem("tasks", JSON.stringify(initialData));
    localStorage.setItem("showSideBar", "true");
  } else {
    console.log("Data already exists in localStorage");
  }
}

// TASK: Get elements from the DOM
const elements = {
  navSideBar: document.getElementById("side-bar-div"),
  sideLogo: document.getElementById("side-logo-div"),
  logo: document.getElementById("logo"),
  logoLight: document.getElementById("logo-light"),
  boardsNavLinks: document.getElementById("boards-nav-links-div"),
  sidePanel: document.getElementById("headline-sidepanel"),
  darkIcon: document.getElementById("icon-dark"),
  typeToggle: document.getElementById("switch"),
  labelToggle: document.getElementById("label-checkbox-theme"),
  lightIcon: document.getElementById("icon-light"),
  hideSideBar: document.getElementById("icon-hide-sidebar"),
  hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),
  mainLayout: document.getElementById("layout"),
  mainHeader: document.getElementById("header"),
  headerBoardName: document.getElementById("header-board-name"),
  dropDownBtn: document.getElementById("dropdownBtn"),
  dropDownBtnIcon: document.getElementById("dropDownIcon"),
  addTaskBtn: document.getElementById("add-new-task-btn"),
  editBtn: document.getElementById("edit-board-btn"),
  threeDotsIcon: document.getElementById("three-dots-icon"),
  editBtnDiv: document.getElementById("editBoardDiv"),
  deleteBtn: document.getElementById("deleteBoardBtn"),
  todoDiv: document.getElementById("todo-head-div"),
  todoDot: document.getElementById("todo-dot"),
  toDoHeading: document.getElementById("toDoText"),
  doingDiv: document.getElementById("doing-head-div"),
  doingDot: document.getElementById("doing-dot"),
  doingHeading: document.getElementById("doingText"),
  doneDiv: document.getElementById("done-head-div"),
  doneDot: document.getElementById("done-dot"),
  doneHeading: document.getElementById("doneText"),
  taskModal: document.getElementById("new-task-modal-window"),
  modalTitle: document.getElementById("modal-title-input"),
  titleText: document.getElementById("title-input"),
  modalDescription: document.getElementById("modal-desc-input"),
  descriptionText: document.getElementById("desc-input"),
  modalStatusSelect: document.getElementById("modal-select-status"),
  statusSelect: document.getElementById("select-status"),
  createTaskBtn: document.getElementById("create-task-btn"),
  cancelTaskBtn: document.getElementById("cancel-add-task-btn"),
  editTaskWindow: document.getElementById("edit-task-modal"),
  editTaskModal: document.getElementById("edit-task-form"),
  editTaskDiv: document.getElementById("edit-task-header"),
  editTaskInput: document.getElementById("edit-task-title-input"),
  editTaskBtn: document.getElementById("edit-btn"),
  editInputArea: document.getElementById("edit-task-desc-input"),
  editSelectStatus: document.getElementById("edit-select-status"),
  saveChangesBtn: document.getElementById("save-task-changes-btn"),
  cancelEditBtn: document.getElementById("cancel-edit-btn"),
  deleteTaskBtn: document.getElementById("delete-task-btn"), //P: there were two cancel-edit-btn id's
  filterDiv: document.getElementById("filterDiv"),
  columnDivs: document.querySelectorAll(".column-div"),
  editModalDiv: document.querySelectorAll(".edit-task-modal-window"),
};

let activeBoard = "";

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map((task) => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard : boards[0];
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
};

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click', () => { 
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    });
    boardsContainer.appendChild(boardElement);
  });

};

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);
  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    tasksContainer.classList.add("tasks-container"); //P:added this 
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener('click', () => { 
        openEditTaskModal(task);  
      });

      tasksContainer.appendChild(taskElement);
    });
  });
};


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
};

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    if(btn.textContent === boardName) {
      btn.classList.add('active') 
    } else {
      btn.classList.remove('active'); 
    }
  });
};


function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  };

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  };

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(taskElement); 
};



function setupEventListeners() {


  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById("cancel-add-task-btn");
  cancelAddTaskBtn.addEventListener("click", () => {
    toggleModal(false);
    resetFormInputs(); //P: Clear the form inputs
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener("click", () => {
    toggleModal(false);
    resetFormInputs();
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener("click", () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener("click", () => toggleSidebar(true));

  // Theme switch event listener
  elements.typeToggle.addEventListener("change", toggleTheme);

  // Show Add New Task Modal event listener // P: works if I change from createTaskBTN to addTaskBtn
  elements.addTaskBtn.addEventListener("click", () => {
    toggleModal(true);
    elements.filterDiv.style.display = "block"; // Also show the filter overlay
  });


  // Add new task form submission event listener
  elements.taskModal.addEventListener("submit", (event) => {
    addTask(event);
  });
};

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.taskModal) {
  modal.style.display = show ? "block" : "none";
};

//P:This function helps clear the input that I did not want to add when clicking cancel or clicking outside modal
function resetFormInputs() {
  elements.titleText.value = "";
  elements.descriptionText.value = "";
  elements.statusSelect.value = ""; // Reset the select dropdown if applicable
}
/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  //Assign user input to the task object
    const task = {
      title: elements.titleText.value,
      description: elements.descriptionText.value,
      status: elements.statusSelect.value,
      board: activeBoard
    
    };
    
    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = "none"; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    };
};


function toggleSidebar(show) {
  elements.navSideBar.style.display = show ? 'block' : 'none';
  elements.showSideBarBtn.style.display = show ? 'none' : 'block';
  localStorage.setItem('showSideBar', show);
};

//P: Add this function to be able to get the light logo svg to work
function toggleTheme() {
  const body = document.body;
  const logo = document.getElementById("logo");

  body.classList.toggle("light-theme");

  if (body.classList.contains("light-theme")) {
    logo.src = "./assets/logo-light.svg";
  } else {
    logo.src = "./assets/logo-dark.svg";
  }

  localStorage.setItem("light-theme", body.classList.contains("light-theme") ? "enabled" : "disabled");
  }

//P: Function tio set initial theme based on store preference
function setInitialTheme() {
  const logo = document.getElementById("logo");
  if (localStorage.getItem("light-theme") === "enabled") {
    document.body.classList.add("light-theme");
    logo.src = "./assets/logo-light.svg";
    document.getElementById("switch").checked = true;
  } else {
    logo.src = "./assets/logo-dark.svg";
  }
}

// Call setInitialTheme when the page loads
document.addEventListener("DOMContentLoaded", setInitialTheme);

function openEditTaskModal(task) {
  // Set task details in modal inputs
  elements.editTaskInput.value = task.title;
  elements.editInputArea.value = task.description;
  elements.editSelectStatus.value = task.status;

  // Get button elements from the task modal
  const saveChangesBtn = elements.saveChangesBtn;
  const deleteTaskBtn = document.getElementById("delete-task-btn"); //P: changed ID
  const cancelEditBtn = document.getElementById("cancel-edit-btn"); //P: add the cancel button

  //P: clean up previous event listners 
  saveChangesBtn.onclick = null;
  deleteTaskBtn.onclick = null;
  cancelEditBtn.onclick = null;

  // Call saveTaskChanges upon click of Save Changes button
 saveChangesBtn.onclick = () => saveTaskChanges(task.id);

  // Delete task using a helper function and close the task modal
  deleteTaskBtn.onclick = () => {
    deleteTask(task.id);
    toggleModal(false, elements.editTaskWindow);
    refreshTasksUI();
  };

  //P: close task modal  when clicked
  cancelEditBtn.onclick = () => {
    toggleModal(false, elements.editTaskWindow);
    refreshTasksUI();
  };

  toggleModal(true, elements.editTaskWindow);
};

function saveTaskChanges(taskId) {
  // Get new user inputs
  const updatedTask = {
    title: elements.editTaskInput.value,
    description: elements.editInputArea.value,
    status: elements.editSelectStatus.value,
    board: activeBoard

  };


  patchTask(taskId, updatedTask);


  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskWindow);
  refreshTasksUI();
};

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  initializeData();
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
};