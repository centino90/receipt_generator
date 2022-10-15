const printBtn = document.querySelector("#print");
const printCanvas = document.querySelector("#print_canvas");

// On app load, get all tasks from localStorage
window.onload = init;
window.onbeforeprint = beforePrint;
window.onafterprint = afterPrint;

function init() {
  loadArticles();

  const articles = document.querySelectorAll(".articl");
  articles.forEach((article) => {
    const textEl = article.querySelector("span");
    adjustFontsize(textEl);
  });
}

printBtn.addEventListener("click", () => {
  submitReceipt();
  window.print();
});

function beforePrint() {
  // printCanvas.innerHTML = "some content";
}

function afterPrint(e) {
  // printCanvas.innerHTML = "";
  document.querySelectorAll("#print_rows tr.added").forEach((tr) => {
    tr.remove();
  });
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
  articles.forEach((task, index) => {
    if (task.completed) {
      return;
    }

    const articleRow = articleRowHtml(task);
    const articleRowGroup = document.querySelector("#article_row_group");
    const tr = document.createElement("tr");
    tr.setAttribute("id", task.id);
    tr.innerHTML = articleRow;
    articleRowGroup.insertBefore(tr, articleRowGroup.children[0]);
  });

  const tooltipTriggerList = getTooltipElements();
  registerTooltips(tooltipTriggerList);

  const removeArticleBtns = document.querySelectorAll(".remove_article");
  if (removeArticleBtns) {
    removeArticleBtns.forEach((btn) => {
      btn.addEventListener("click", removeTask);
    });
  }
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
  articleRowGroup.insertBefore(tr, articleRowGroup.children[0]);

  const articl = document.querySelectorAll(".articl")[0];
  const textEl = articl.querySelector("span");
  adjustFontsize(textEl);

  const tooltipTriggerList = getTooltipElements();
  registerTooltips(tooltipTriggerList);

  const removeArticleBtns = document.querySelectorAll(".remove_article");
  if (removeArticleBtns) {
    removeArticleBtns.forEach((btn) => {
      btn.addEventListener("click", removeTask);
    });
  }

  if (localStorage.getItem("articles") === null) {
    form.classList.remove("was-validated");

    // add task to local storage
    localStorage.setItem(
      "articles",
      JSON.stringify([
        ...JSON.parse(localStorage.getItem("articles") || "[]"),
        {
          completed: false,
          ...articleFormInputs,
          id: window.uuid.v4(),
        },
      ])
    );

    for (let index = 0; index < articleFormElements.length; index++) {
      const input = articleFormElements[index];
      if (["INPUT", "TEXTAREA"].includes(input.nodeName)) {
        input.value = "";
      }
    }
    form.classList.remove("was-validated");
    return;
  }

  let articlesInStorageLength = Array.from(
    JSON.parse(localStorage.getItem("articles"))
  ).length;

  // add task to local storage
  localStorage.setItem(
    "articles",
    JSON.stringify([
      ...JSON.parse(localStorage.getItem("articles") || "[]"),
      {
        completed: false,
        ...articleFormInputs,
        id: window.uuid.v4(),
      },
    ])
  );

  for (let index = 0; index < articleFormElements.length; index++) {
    const input = articleFormElements[index];
    if (["INPUT", "TEXTAREA"].includes(input.nodeName)) {
      input.value = "";
    }
  }
  form.classList.remove("was-validated");
}

// TODO: add cleanup submit receipt
function submitReceipt() {
  const trs = document.querySelectorAll("#article_row_group tr");

  trs.forEach((tr) => {
    const s = document.createElement("tr");
    s.classList.add("added");
    s.innerHTML = tr.innerHTML;

    document
      .querySelector("#print_rows")
      .insertBefore(s, document.querySelector("#print_rows").children[0]);
  });

  const ptrs = document.querySelectorAll("#print_table tbody tr");
  ptrs.forEach((tr) => {
    if (tr.querySelector("button")) {
      tr.querySelector("button").closest("td").remove();
    }
  });
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
  let articles = Array.from(JSON.parse(localStorage.getItem("articles")));
  const eventElement = event.target;
  const eventElementParent = eventElement.closest("tr");
  const eventElementId = eventElementParent.getAttribute("id");
  articles.forEach((article) => {
    articles.splice(
      articles.findIndex((a) => parseInt(a.id) === parseInt(eventElementId)),
      1
    );
    console.log({ article });
  });
  console.log({ eventElementId });
  localStorage.setItem("articles", JSON.stringify(articles));
  eventElementParent.remove();
}

function articleRowHtml({ article, quantity, unit, amount, unit_price }) {
  return `
    <td>${quantity}</td>
    <td>${unit}</td>
    <td class="articl"><span>${article}</span></td>
    <td>${unit_price}</td>
    <td>${amount}</td>
    <td>
        <button
        type="button"
        class="btn border remove_article"
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

// trigger bootstrap tooltip
function registerTooltips(tooltipElements) {
  return [...tooltipElements].map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );
}

function getTooltipElements() {
  return document.querySelectorAll('[data-bs-toggle="tooltip"]');
}

function adjustFontsize(textElement) {
  const origFontSizeVal = window
    .getComputedStyle(textElement)
    .getPropertyValue("font-size");
  let fontSize = parseInt(origFontSizeVal.replace("px", ""));
  const maxFontSize = 11;

  while (isTextWrapped(textElement) && fontSize > maxFontSize) {
    fontSize -= 0.5;
    textElement.style.fontSize = fontSize;
  }
}

function isTextWrapped(element) {
  const { lineHeight } = getComputedStyle(element);
  const lineHeightParsed = parseInt(lineHeight.split("px")[0]);
  const amountOfLinesTilAdjust = 2;

  if (element.offsetHeight >= lineHeightParsed * amountOfLinesTilAdjust) {
    return true;
  } else {
    return false;
  }
}
