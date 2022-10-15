const printBtn = document.querySelector("#print");
const printCanvas = document.querySelector("#print_canvas");

// On app load, get all tasks from localStorage
window.onload = loadArticles;
window.onbeforeprint = beforePrint;
window.onafterprint = afterPrint;

printBtn.addEventListener("click", () => {
  // const f = fetch("./print.html");
  // f.then((r) => r.text()).then(console.log);
  submitReceipt()
  window.print();
});

function beforePrint() {
  // printCanvas.innerHTML = "some content";
}

function afterPrint(e) {
  // printCanvas.innerHTML = "";
  document.querySelectorAll("#print_rows tr.added").forEach(tr => {
    tr.remove()
  })
  
}

// On form submit add task
document.querySelector("#add_more").addEventListener("click", (e) => {
  console.log("qweqwe");
  addTask();
});


function loadArticles() {
  // check if localStorage has any articles
  // if not then return
  if (localStorage.getItem("articles") == null) return;

  // Get the articles from localStorage and convert it to an array
  let articles = Array.from(JSON.parse(localStorage.getItem("articles")));

  // Loop through the articles and add them to the row
  articles.forEach((task) => {
    if(task.completed) {
      return
    }

    const articleRow = articleRowHtml(task);
    const articleRowGroup = document.querySelector("#article_row_group");
    const tr = document.createElement("tr");
    tr.innerHTML = articleRow;
    articleRowGroup.insertBefore(tr, articleRowGroup.children[0])
  });
}

function addTask() {
  const form = document.querySelector(".needs-validation");

  form.classList.add("was-validated");

  if (!form.checkValidity()) {
    return;
  }

  const articleFormElements = document.querySelector("form").elements;
  const articleFormInputs = Array.from(articleFormElements)
    .filter((el) => ["TEXTAREA", "INPUT"].includes(el.nodeName))
    .reduce((acc, cur) => {
      acc[cur.name] = cur.value;
      return acc;
    }, {});
  const articleRow = articleRowHtml(articleFormInputs);
  const articleRowGroup = document.querySelector("#article_row_group");
  const tr = document.createElement("tr");
  tr.innerHTML = articleRow;
  articleRowGroup.insertBefore(tr, articleRowGroup.children[0])

  // add task to local storage
  localStorage.setItem(
    "articles",
    JSON.stringify([
      ...JSON.parse(localStorage.getItem("articles") || "[]"),
      { completed: false, ...articleFormInputs },
    ])
  );

 for (let index = 0; index < articleFormElements.length; index++) {
  const input = articleFormElements[index]
  if(['INPUT', 'TEXTAREA'].includes(input.nodeName)) {
    input.value = ''
  }
 }
 form.classList.remove("was-validated");
}

// TODO: add cleanup submit receipt
function submitReceipt() {
  const trs = document.querySelectorAll("#article_row_group tr")

  trs.forEach(tr => {
    const s  = document.createElement('tr')
    s.classList.add('added')
    s.innerHTML = tr.innerHTML

    document.querySelector("#print_rows").insertBefore(
      s,
      document.querySelector("#print_rows").children[0]
    )
  })

  const ptrs = document.querySelectorAll('#print_table tbody tr')
  ptrs.forEach(tr => {
    if(tr.querySelector('button')) {
      tr.querySelector('button').closest('td').remove()
    }
  })
}

function taskComplete(event) {
  let tasks = Array.from(JSON.parse(localStorage.getItem("tasks")));
  tasks.forEach((task) => {
    if (task.task === event.nextElementSibling.value) {
      task.completed = !task.completed;
    }
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
  event.nextElementSibling.classList.toggle("completed");
}

function removeTask(event) {
  let tasks = Array.from(JSON.parse(localStorage.getItem("tasks")));
  tasks.forEach((task) => {
    if (task.task === event.parentNode.children[1].value) {
      // delete task
      tasks.splice(tasks.indexOf(task), 1);
    }
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
  event.parentElement.remove();
}

function articleRowHtml({ article, quantity, unit, amount, unit_price }) {
  return `
    <td>${quantity}</td>
    <td>${unit}</td>
    <td>${article}</td>
    <td>${unit_price}</td>
    <td>${amount}</td>
    <td>
        <button
        type="button"
        class="btn border"
        data-bs-toggle="tooltip"
        data-bs-placement="top"
        data-bs-title="Remove this article"
        >
        &#10060;
        </button>
    </td>
    `;
}

// store current task to track changes
var currentTask = null;

// get current task
function getCurrentTask(event) {
  currentTask = event.value;
}

// edit the task and update local storage
function editTask(event) {
  let tasks = Array.from(JSON.parse(localStorage.getItem("tasks")));
  // check if task is empty
  if (event.value === "") {
    alert("Task is empty!");
    event.value = currentTask;
    return;
  }
  // task already exist
  tasks.forEach((task) => {
    if (task.task === event.value) {
      alert("Task already exist!");
      event.value = currentTask;
      return;
    }
  });
  // update task
  tasks.forEach((task) => {
    if (task.task === currentTask) {
      task.task = event.value;
    }
  });
  // update local storage
  localStorage.setItem("tasks", JSON.stringify(tasks));
}
