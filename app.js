"use strict";

const POSTS_URL = "https://jsonplaceholder.typicode.com/posts?_limit=5";
const CREATE_URL = "https://jsonplaceholder.typicode.com/posts";

const loadBtn = document.querySelector("#load-btn");
const form = document.querySelector("#post-form");
const titleInput = document.querySelector("#title");
const bodyInput = document.querySelector("#body");
const submitBtn = form.querySelector("button[type='submit']");
const messagesBox = document.querySelector("#messages");
const listEl = document.querySelector("#post-list");

let posts = [];

function showMessages(lines, kind) {
  messagesBox.replaceChildren();
  messagesBox.className = "messages " + kind;
  if (lines.length === 0) {
    messagesBox.hidden = true;
    return;
  }
  messagesBox.hidden = false;
  lines.forEach((line) => {
    const p = document.createElement("p");
    p.textContent = line;
    messagesBox.append(p);
  });
}

function createPostItem(post) {
  const item = document.createElement("li");

  const titleEl = document.createElement("div");
  titleEl.className = "name";
  titleEl.textContent = post.title;

  const meta = document.createElement("p");
  meta.className = "meta";
  meta.textContent = "ID " + post.id;

  const bodyEl = document.createElement("p");
  bodyEl.className = "body";
  bodyEl.textContent = post.body;

  item.append(titleEl, meta, bodyEl);
  return item;
}

function renderPosts() {
  listEl.replaceChildren();
  if (posts.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "Публикаций пока нет. Нажмите «Загрузить публикации».";
    listEl.append(empty);
    return;
  }
  posts.forEach((post) => {
    listEl.append(createPostItem(post));
  });
}

function validatePost(title, text) {
  const errors = [];
  if (title.length === 0) {
    errors.push("Укажите заголовок. Пробелы по краям не считаются.");
  }
  if (text.length === 0) {
    errors.push("Укажите текст публикации. Пробелы по краям не считаются.");
  }
  return errors;
}

async function readJson(response, failText) {
  if (!response.ok) {
    throw new Error(failText + " Код ответа: " + response.status + ". Нажмите кнопку ещё раз.");
  }
  return response.json();
}

loadBtn.addEventListener("click", async () => {
  loadBtn.disabled = true;
  showMessages(["Загрузка публикаций..."], "info");
  try {
    const response = await fetch(POSTS_URL);
    const data = await readJson(response, "Не удалось загрузить публикации.");
    if (!Array.isArray(data)) {
      throw new Error("Сервер вернул не список публикаций. Нажмите кнопку ещё раз.");
    }
    posts = data;
    renderPosts();
    showMessages(["Загружено публикаций: " + posts.length + "."], "ok");
  } catch (error) {
    const text = error instanceof TypeError
      ? "Нет соединения с сервером. Проверьте интернет и нажмите кнопку ещё раз."
      : error.message;
    showMessages([text], "error");
  } finally {
    loadBtn.disabled = false;
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const text = bodyInput.value.trim();
  const errors = validatePost(title, text);
  if (errors.length > 0) {
    showMessages(errors, "error");
    return;
  }

  submitBtn.disabled = true;
  showMessages(["Отправка публикации..."], "info");
  try {
    const response = await fetch(CREATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        body: text,
        userId: 1,
      }),
    });
    const created = await readJson(response, "Не удалось создать публикацию.");
    posts.unshift(created);
    renderPosts();
    form.reset();
    titleInput.focus();
    showMessages(
      [
        "Публикация создана.",
        "ID: " + created.id + ".",
        "Заголовок: " + created.title + ".",
      ],
      "ok"
    );
  } catch (error) {
    const text = error instanceof TypeError
      ? "Нет соединения с сервером. Проверьте интернет и нажмите кнопку ещё раз."
      : error.message;
    showMessages([text], "error");
  } finally {
    submitBtn.disabled = false;
  }
});

renderPosts();
