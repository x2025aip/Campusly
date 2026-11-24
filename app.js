(function () {
  "use strict";

  const STORE = {
    read: function (key, fallback) {
      try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : JSON.parse(value);
      } catch (error) {
        console.warn("Campusly couldn't read saved browser data.", error);
        return fallback;
      }
    },
    write: function (key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.warn("Campusly couldn't save browser data.", error);
        return false;
      }
    }
  };

  let assignments = STORE.read("campusly-assignments", CAMPUS_DATA.assignments).map(function (task) {
    const demoTask = CAMPUS_DATA.assignments.find(function (demo) { return demo.id === task.id; });
    return demoTask && !task.moodleUrl ? Object.assign({}, task, { moodleUrl: demoTask.moodleUrl }) : task;
  });
  let notes = STORE.read("campusly-notes", CAMPUS_DATA.notes);
  let savedJobs = STORE.read("campusly-saved-jobs", []);
  let messages = CAMPUS_DATA.messages.slice();
  let studySets = STORE.read("campusly-study-sets", null);
  if (!Array.isArray(studySets) || !studySets.length) studySets = JSON.parse(JSON.stringify(CAMPUS_DATA.studySets));
  studySets = studySets.filter(function (set) {
    return set && typeof set.id === "string" && typeof set.title === "string";
  }).map(function (set) {
    return {
      id: set.id,
      title: set.title,
      course: typeof set.course === "string" ? set.course : "",
      cards: Array.isArray(set.cards) ? set.cards.filter(function (card) {
        return card && typeof card.term === "string" && typeof card.answer === "string";
      }) : []
    };
  });
  if (!studySets.length) studySets = JSON.parse(JSON.stringify(CAMPUS_DATA.studySets));
  let selectedSet = studySets[0];
  let cardIndex = 0;
  let editingNewSet = false;
  let learnQueue = [];
  let learnMissed = [];
  let learnPosition = 0;
  let testQuestions = [];
  let testPosition = 0;
  let testScore = 0;
  let activeFilter = "all";
  let activeCareerFilter = "All";

  const byId = function (id) { return document.getElementById(id); };
  const make = function (tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  function showView() {
    const requested = (window.location.hash || "#home").slice(1);
    const views = Array.from(document.querySelectorAll("[data-view]"));
    const current = views.some(function (view) { return view.id === requested; }) ? requested : "home";
    views.forEach(function (view) { view.hidden = view.id !== current; });
    document.querySelectorAll("[data-nav]").forEach(function (link) {
      if (link.dataset.nav === current) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    const pageNames = {
      home: "Overview",
      schedule: "My schedule",
      assignments: "Assignments",
      notes: "Notes",
      study: "Study sets",
      community: "Community",
      careers: "Career board"
    };
    byId("page-crumb").textContent = pageNames[current] || "Overview";
    byId("search-results").hidden = true;
    window.scrollTo(0, 0);
  }

  function formatDate(dateString) {
    const date = new Date(dateString + "T12:00:00");
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function createScheduleItem(item) {
    const row = make("article", "schedule-item");
    const time = make("div", "schedule-time");
    time.append(make("strong", "", item.time), make("span", "", item.period));
    const marker = make("span", "schedule-marker marker-" + item.color);
    const details = make("div", "schedule-details");
    details.append(make("h3", "", item.title), make("p", "", item.detail));
    const end = make("span", "schedule-end", item.end);
    row.append(time, marker, details, end);
    return row;
  }

  function renderSchedule() {
    const today = byId("today-schedule");
    const agenda = byId("schedule-agenda");
    today.replaceChildren.apply(today, CAMPUS_DATA.schedule.slice(0, 3).map(createScheduleItem));
    agenda.replaceChildren.apply(agenda, CAMPUS_DATA.schedule.map(createScheduleItem));

    const calendar = byId("calendar-grid");
    const names = ["MON 16", "TUE 17", "WED 18", "THU 19", "FRI 20", "SAT 21", "SUN 22"];
    calendar.replaceChildren();
    const timeRail = make("div", "calendar-time-rail");
    ["9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM"].forEach(function (time) {
      timeRail.append(make("span", "", time));
    });
    calendar.append(timeRail);
    names.forEach(function (name, dayIndex) {
      const day = make("div", "calendar-day" + (dayIndex === 3 ? " calendar-today" : ""));
      day.append(make("div", "calendar-day-heading", name));
      const body = make("div", "calendar-day-body");
      for (let i = 0; i < 8; i += 1) body.append(make("span", "calendar-hour"));
      if (dayIndex === 3) {
        [["09:00", "Developmental Psych", "cal-lilac", 0], ["12:00", "Research Methods", "cal-mint", 162], ["14:00", "Study group", "cal-peach", 270]].forEach(function (entry) {
          const event = make("div", "calendar-event " + entry[2]);
          event.style.top = entry[3] + "px";
          event.append(make("small", "", entry[0]), make("strong", "", entry[1]));
          body.append(event);
        });
      } else if (dayIndex === 4) {
        const event = make("div", "calendar-event cal-peach");
        event.style.top = "486px";
        event.append(make("small", "", "18:00"), make("strong", "", "Friday Night Market"));
        body.append(event);
      }
      day.append(body);
      calendar.append(day);
    });
  }

  function updateAssignmentCounts() {
    const open = assignments.filter(function (task) { return task.status !== "done"; }).length;
    const completed = assignments.filter(function (task) { return task.status === "done"; }).length;
    const dueThisWeek = assignments.filter(function (task) {
      return task.status !== "done" && task.due >= "2026-11-16" && task.due <= "2026-11-22";
    }).length;
    const nextTask = assignments.filter(function (task) { return task.status !== "done"; }).sort(function (a, b) {
      return a.due.localeCompare(b.due);
    })[0];
    byId("nav-task-count").textContent = open;
    byId("todo-stat").replaceChildren(document.createTextNode(open), make("span", "stat-denom", " tasks"));
    byId("due-count").textContent = dueThisWeek;
    byId("completed-count").textContent = completed;
    byId("next-assignment").replaceChildren(
      document.createTextNode(nextTask ? nextTask.title : "You're all caught up"),
      nextTask ? make("small", "", " · " + formatDate(nextTask.due)) : document.createTextNode("")
    );
  }

  function makeTaskRow(task, compact) {
    const row = make("article", compact ? "task-row task-row-compact" : "assignment-row");
    const checkbox = make("button", "task-check" + (task.status === "done" ? " checked" : ""));
    checkbox.type = "button";
    checkbox.setAttribute("aria-label", (task.status === "done" ? "Mark incomplete: " : "Complete: ") + task.title);
    checkbox.setAttribute("aria-pressed", task.status === "done" ? "true" : "false");
    checkbox.textContent = task.status === "done" ? "✓" : "";
    checkbox.addEventListener("click", function () {
      task.status = task.status === "done" ? "open" : "done";
      STORE.write("campusly-assignments", assignments);
      renderAssignments();
    });
    const name = make("div", "task-copy");
    name.append(make("strong", task.status === "done" ? "task-done" : "", task.title), make("span", "", task.course));
    const due = make("span", "task-due" + (task.status !== "done" && task.due <= "2026-11-20" ? " due-soon" : ""), task.status === "done" ? "Done" : "Due " + formatDate(task.due));
    row.append(checkbox, name, due);
    if (task.status !== "done" && task.moodleUrl) {
      const moodleLink = make("a", "moodle-link", compact ? "Moodle ↗" : "Open in Moodle ↗");
      moodleLink.href = task.moodleUrl;
      moodleLink.target = "_blank";
      moodleLink.rel = "noopener";
      moodleLink.setAttribute("aria-label", "Open " + task.title + " in Moodle");
      row.append(moodleLink);
    }
    return row;
  }

  function renderAssignments() {
    const homeList = byId("home-task-list");
    const homeTasks = assignments.filter(function (task) { return task.status !== "done"; }).slice(0, 3);
    homeList.replaceChildren.apply(homeList, homeTasks.map(function (task) { return makeTaskRow(task, true); }));
    if (!homeTasks.length) homeList.append(make("p", "empty-state", "Everything's checked off. Take a little breather."));

    const list = byId("assignment-list");
    let visible = assignments.slice();
    if (activeFilter === "open") visible = visible.filter(function (task) { return task.status !== "done"; });
    if (activeFilter === "done") visible = visible.filter(function (task) { return task.status === "done"; });
    visible.sort(function (a, b) { return a.due.localeCompare(b.due); });
    list.replaceChildren.apply(list, visible.map(function (task) { return makeTaskRow(task, false); }));
    if (!visible.length) list.append(make("p", "empty-state", "Nothing here right now — you're all caught up."));
    updateAssignmentCounts();
  }

  function renderNotes() {
    const grid = byId("notes-grid");
    grid.replaceChildren();
    notes.forEach(function (note) {
      const card = make("article", "note-card " + note.color);
      const top = make("div", "note-card-top");
      top.append(make("span", "note-course", note.course), make("span", "note-date", note.date));
      card.append(top, make("h2", "", note.title), make("p", "note-preview", note.body));
      const bottom = make("div", "note-card-bottom");
      bottom.append(make("span", "", "Open note"), make("span", "", "↗"));
      card.append(bottom);
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", "Open note: " + note.title);
      const open = function () {
        byId("note-title").value = note.title;
        byId("note-body").value = note.body;
        byId("note-form").dataset.editing = note.id;
        byId("note-form").hidden = false;
        byId("note-title").focus();
      };
      card.addEventListener("click", open);
      card.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); }
      });
      grid.append(card);
    });
  }

  function updateStudyCard() {
    const cards = selectedSet.cards || [];
    byId("study-set-name").textContent = selectedSet.title;
    byId("study-course-label").textContent = selectedSet.course || "MY STUDY SET";
    byId("study-set-select").value = selectedSet.id;
    byId("study-progress").textContent = cards.length
      ? "Card " + (cardIndex + 1) + " of " + cards.length + " · Click to reveal the answer"
      : "Add cards or import lecture notes to start studying.";
    byId("flashcard-count").textContent = cards.length
      ? String(cardIndex + 1).padStart(2, "0") + " / " + String(cards.length).padStart(2, "0")
      : "00 / 00";
    byId("previous-card").disabled = cards.length < 2;
    byId("next-card").disabled = cards.length < 2;
    byId("start-test").disabled = cards.length < 2;
    document.querySelectorAll('[data-study-mode="learn"]').forEach(function (button) {
      button.disabled = cards.length === 0;
    });
    document.querySelectorAll('[data-study-mode="test"]').forEach(function (button) {
      button.disabled = cards.length < 2;
    });
    byId("delete-study-set").disabled = studySets.length < 2;
    byId("delete-study-set").title = studySets.length < 2
      ? "Keep at least one study set"
      : "Delete this study set";
    if (!cards.length) {
      byId("flashcard-word").textContent = "Your set is ready";
      byId("flashcard-answer").textContent = "Add a term and definition, or import notes from a text lecture.";
      byId("flashcard-answer").hidden = false;
      byId("flashcard-word").hidden = true;
      byId("flashcard").classList.add("is-flipped");
      byId("flashcard").setAttribute("aria-label", "Your set is empty");
      return;
    }
    if (cardIndex >= cards.length) cardIndex = 0;
    const card = cards[cardIndex];
    byId("flashcard-word").textContent = card.term;
    byId("flashcard-answer").textContent = card.answer;
    byId("flashcard-answer").hidden = true;
    byId("flashcard-word").hidden = false;
    byId("flashcard").classList.remove("is-flipped");
    byId("flashcard").setAttribute("aria-label", "Reveal answer for " + card.term);
    byId("flashcard-category").textContent = "KEY CONCEPT";
  }

  function persistStudySets() {
    return STORE.write("campusly-study-sets", studySets);
  }

  function setStudyMode(mode) {
    byId("study-editor").hidden = true;
    document.querySelectorAll(".study-mode-panel").forEach(function (panel) {
      panel.hidden = panel.id !== "study-" + mode + "-mode";
    });
    document.querySelectorAll("[data-study-mode]").forEach(function (button) {
      const active = button.dataset.studyMode === mode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
      button.disabled = false;
    });
    if (mode === "learn" && selectedSet.cards.length) startLearnSession();
  }

  function startLearnSession(cards) {
    learnQueue = (cards || selectedSet.cards).slice();
    learnMissed = [];
    learnPosition = 0;
    renderLearnCard();
  }

  function renderLearnCard() {
    const prompt = byId("learn-prompt");
    const answer = byId("learn-answer");
    const rating = byId("learn-rating");
    byId("learn-review-missed").hidden = true;
    if (learnPosition >= learnQueue.length) {
      prompt.textContent = "Session complete";
      byId("learn-count").textContent = "LEARN · FINISHED";
      byId("learn-result").textContent = learnMissed.length
        ? "You marked " + learnMissed.length + " card" + (learnMissed.length === 1 ? "" : "s") + " to revisit."
        : "You marked every card as known. Nicely done!";
      answer.hidden = true;
      byId("learn-reveal").hidden = true;
      rating.hidden = true;
      byId("learn-review-missed").hidden = learnMissed.length === 0;
      return;
    }
    const card = learnQueue[learnPosition];
    prompt.textContent = card.term;
    answer.textContent = card.answer;
    answer.hidden = true;
    byId("learn-count").textContent = "LEARN · " + (learnPosition + 1) + " OF " + learnQueue.length;
    byId("learn-result").textContent = "";
    byId("learn-reveal").hidden = false;
    rating.hidden = true;
  }

  function renderStudyEditorCards(cards) {
    const list = byId("study-edit-cards");
    list.replaceChildren();
    cards.forEach(function (card) {
      const row = make("div", "study-edit-card");
      const termLabel = make("label", "", "Term or question");
      const term = make("input");
      term.type = "text";
      term.maxLength = 120;
      term.required = true;
      term.value = card.term || "";
      termLabel.append(term);
      const answerLabel = make("label", "", "Definition or answer");
      const answer = make("textarea");
      answer.rows = 3;
      answer.maxLength = 1000;
      answer.required = true;
      answer.value = card.answer || "";
      answerLabel.append(answer);
      const remove = make("button", "button button-light", "Remove card");
      remove.type = "button";
      remove.addEventListener("click", function () {
        row.remove();
        if (!list.children.length) list.append(make("p", "study-editor-empty", "No cards yet — add one to this set."));
      });
      row.append(termLabel, answerLabel, remove);
      list.append(row);
    });
    if (!cards.length) list.append(make("p", "study-editor-empty", "No cards yet — add one to this set."));
  }

  function openStudyEditor(isNew) {
    editingNewSet = isNew;
    byId("study-editor-heading").textContent = isNew ? "Create a study set" : "Edit study set";
    byId("study-edit-title").value = selectedSet.title;
    byId("study-edit-course").value = selectedSet.course || "";
    byId("study-editor-message").textContent = "";
    renderStudyEditorCards(selectedSet.cards || []);
    document.querySelectorAll(".study-mode-panel").forEach(function (panel) { panel.hidden = true; });
    document.querySelectorAll("[data-study-mode]").forEach(function (button) { button.disabled = true; });
    byId("study-editor").hidden = false;
    byId("study-edit-title").focus();
  }

  function makeTest() {
    const cards = selectedSet.cards || [];
    testQuestions = cards.map(function (card) {
      const distractors = cards.filter(function (candidate) {
        return candidate !== card && candidate.answer !== card.answer;
      }).map(function (candidate) { return candidate.answer; });
      const choices = distractors.sort(function () { return Math.random() - 0.5; }).slice(0, 3);
      choices.push(card.answer);
      choices.sort(function () { return Math.random() - 0.5; });
      return { term: card.term, answer: card.answer, choices: choices };
    }).sort(function () { return Math.random() - 0.5; }).slice(0, 10);
    testPosition = 0;
    testScore = 0;
    renderTestQuestion();
  }

  function renderTestQuestion() {
    const choices = byId("test-choices");
    choices.replaceChildren();
    byId("test-feedback").textContent = "";
    byId("test-next").hidden = true;
    byId("test-restart").hidden = true;
    if (testPosition >= testQuestions.length) {
      byId("test-progress").textContent = "TEST COMPLETE";
      byId("test-question").textContent = "You scored " + testScore + " out of " + testQuestions.length + ".";
      byId("test-feedback").textContent = "Use your missed answers as a guide for what to review next.";
      byId("test-restart").hidden = false;
      return;
    }
    const question = testQuestions[testPosition];
    byId("test-progress").textContent = "QUESTION " + (testPosition + 1) + " OF " + testQuestions.length;
    byId("test-question").textContent = "What best describes “" + question.term + "”?";
    question.choices.forEach(function (choice) {
      const button = make("button", "test-choice", choice);
      button.type = "button";
      button.addEventListener("click", function () {
        const correct = choice === question.answer;
        if (correct) testScore += 1;
        Array.from(choices.children).forEach(function (option) {
          option.disabled = true;
          if (option.textContent === question.answer) option.classList.add("is-correct");
          else if (option === button) option.classList.add("is-incorrect");
        });
        byId("test-feedback").textContent = correct ? "That's right!" : "Not quite. The answer is: " + question.answer;
        byId("test-next").textContent = testPosition === testQuestions.length - 1 ? "See results →" : "Next question →";
        byId("test-next").hidden = false;
      });
      choices.append(button);
    });
  }

  function extractLectureCards(text) {
    const lines = text.split(/\r?\n/);
    const cards = [];
    const csvLike = lines.filter(function (line) { return line.trim() && line.includes(","); });
    if (csvLike.length >= 1 && csvLike.every(function (line) { return line.split(",").length >= 2; })) {
      csvLike.forEach(function (line) {
        const parts = line.match(/("([^"]|"")*"|[^,]*)(?:,|$)/g);
        if (!parts) return;
        const values = parts.map(function (part) {
          return part.replace(/,$/, "").trim().replace(/^"|"$/g, "").replace(/""/g, '"');
        });
        const term = values[0];
        const answer = values.slice(1).join(", ").trim();
        if (/^term$/i.test(term) && /^definition|answer$/i.test(answer)) return;
        if (term && answer.length >= 2) cards.push({ term: term, answer: answer });
      });
      if (cards.length) return cards;
    }
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index].trim().replace(/^[-*]\s+/, "");
      if (!line) continue;
      const heading = line.match(/^#{1,6}\s+(.+)$/);
      if (heading) {
        const details = [];
        for (let next = index + 1; next < lines.length; next += 1) {
          const detail = lines[next].trim().replace(/^[-*]\s+/, "");
          if (!detail) continue;
          if (/^#{1,6}\s+/.test(detail)) break;
          if (/^.{2,100}\s*(?::|[–—\t])\s*.{10,}$/.test(detail)) break;
          details.push(detail);
          index = next;
        }
        if (details.length) cards.push({ term: heading[1].trim(), answer: details.join(" ") });
        continue;
      }
      const definition = line.match(/^([^:–—\t]{2,100})\s*(?::|[–—\t])\s*(.{10,})$/);
      if (definition) cards.push({ term: definition[1].trim(), answer: definition[2].trim() });
    }
    return cards;
  }

  function renderPeople() {
    const people = byId("people-list");
    people.replaceChildren();
    CAMPUS_DATA.people.forEach(function (person) {
      const row = make("button", "person-row");
      row.type = "button";
      row.setAttribute("aria-label", "Message " + person.name + ", " + person.role);
      const avatar = make("span", "avatar avatar-" + person.color, person.initials);
      const copy = make("span", "person-copy");
      copy.append(make("strong", "", person.name), make("small", "", person.role));
      row.append(avatar, copy, make("span", "person-status " + person.status, person.status === "online" ? "Here" : "Away"));
      row.addEventListener("click", function () { openDirectConversation(person); });
      people.append(row);
    });
  }

  function openDirectConversation(person) {
    byId("chat-title").textContent = person.name;
    byId("chat-subtitle").textContent = person.kind === "faculty"
      ? "Faculty contact · demo conversation"
      : person.kind === "employer"
        ? "Potential employer · demo conversation"
        : person.role + " · demo conversation";
    byId("back-to-group").hidden = false;
    const starter = person.kind === "faculty"
      ? "Hi Jamie! Feel free to bring your research question to office hours if you'd like to talk it through."
      : person.kind === "employer"
        ? "Hi Jamie! What kind of experience are you hoping to build in community and youth wellbeing?"
        : "Hey! Want to compare notes or study together after class?";
    messages = [
      { name: person.name, initials: person.initials, color: person.color, time: "10:18", text: starter },
      { name: "Jamie Morgan", initials: "JM", color: "lilac", time: "10:22", text: person.kind === "faculty"
        ? "Thanks! I'll write down a couple of questions before I stop by."
        : person.kind === "employer"
          ? "I'm studying psychology and interested in building experience that supports people."
          : "I'd love to! I'll bring my notes ☺" }
    ];
    renderMessages();
    byId("message-input").focus();
  }

  function renderMessages() {
    const list = byId("message-list");
    list.replaceChildren();
    messages.forEach(function (message) {
      const row = make("article", "message-row" + (message.name === "Jamie Morgan" ? " own-message" : ""));
      row.append(make("span", "avatar avatar-" + message.color, message.initials));
      const body = make("div", "message-body");
      const header = make("div", "message-meta");
      header.append(make("strong", "", message.name), make("time", "", message.time));
      body.append(header, make("p", "", message.text));
      row.append(body);
      list.append(row);
    });
    list.scrollTop = list.scrollHeight;
  }

  function renderJobs() {
    const grid = byId("jobs-grid");
    const jobs = CAMPUS_DATA.jobs.filter(function (job) {
      return activeCareerFilter === "All" || job.type === activeCareerFilter;
    });
    grid.replaceChildren();
    jobs.forEach(function (job) {
      const card = make("article", "job-card");
      const top = make("div", "job-card-top");
      top.append(make("span", "job-mark job-mark-" + job.color, "✳"));
      const save = make("button", "job-save" + (savedJobs.indexOf(job.id) !== -1 ? " saved" : ""));
      save.type = "button";
      save.setAttribute("aria-label", savedJobs.indexOf(job.id) !== -1 ? "Remove saved job" : "Save job");
      save.setAttribute("aria-pressed", savedJobs.indexOf(job.id) !== -1 ? "true" : "false");
      save.textContent = savedJobs.indexOf(job.id) !== -1 ? "♥" : "♡";
      save.addEventListener("click", function () {
        savedJobs = savedJobs.indexOf(job.id) === -1
          ? savedJobs.concat(job.id)
          : savedJobs.filter(function (id) { return id !== job.id; });
        STORE.write("campusly-saved-jobs", savedJobs);
        renderJobs();
      });
      top.append(save);
      const badges = make("div", "job-badges");
      badges.append(make("span", "tag tag-" + job.color, job.type), make("span", "job-location", "⌖ " + job.location));
      card.append(top, badges, make("h3", "", job.title), make("p", "job-org", job.org), make("p", "job-description", job.detail));
      const skills = make("div", "skill-tags");
      job.skills.forEach(function (skill) { skills.append(make("span", "", skill)); });
      const footer = make("div", "job-footer");
      footer.append(skills, make("button", "job-apply", "Explore role ↗"));
      footer.lastChild.type = "button";
      footer.lastChild.addEventListener("click", function () {
        footer.lastChild.textContent = "Demo listing · details soon";
        footer.lastChild.classList.add("job-apply-notice");
      });
      card.append(footer);
      grid.append(card);
    });
  }

  function buildSearchIndex() {
    const results = [];
    assignments.forEach(function (item) { results.push({ title: item.title, detail: item.course + " · Assignment", view: "assignments", text: item.title + " " + item.course }); });
    notes.forEach(function (item) { results.push({ title: item.title, detail: item.course + " · Note", view: "notes", text: item.title + " " + item.course + " " + item.body }); });
    CAMPUS_DATA.schedule.forEach(function (item) { results.push({ title: item.title, detail: item.time + " " + item.period + " · Schedule", view: "schedule", text: item.title + " " + item.detail }); });
    CAMPUS_DATA.jobs.forEach(function (item) { results.push({ title: item.title, detail: item.org + " · Career", view: "careers", text: item.title + " " + item.org + " " + item.detail }); });
    return results;
  }

  function setupSearch() {
    const input = byId("global-search");
    const results = byId("search-results");
    input.addEventListener("input", function () {
      const query = input.value.trim().toLowerCase();
      results.replaceChildren();
      if (!query) { results.hidden = true; return; }
      const matches = buildSearchIndex().filter(function (item) { return item.text.toLowerCase().indexOf(query) !== -1; }).slice(0, 6);
      if (!matches.length) results.append(make("p", "search-empty", "No matches yet. Try another search."));
      matches.forEach(function (match) {
        const link = make("a", "search-result");
        link.href = "#" + match.view;
        link.append(make("strong", "", match.title), make("span", "", match.detail));
        link.addEventListener("click", function () { input.value = ""; results.hidden = true; });
        results.append(link);
      });
      results.hidden = false;
    });
    document.addEventListener("click", function (event) {
      if (!results.contains(event.target) && event.target !== input) results.hidden = true;
    });
    document.addEventListener("keydown", function (event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        input.focus();
      }
      if (event.key === "Escape") { results.hidden = true; input.blur(); }
    });
  }

  document.querySelectorAll("[data-go]").forEach(function (button) {
    button.addEventListener("click", function () { window.location.hash = button.dataset.go; });
  });
  window.addEventListener("hashchange", showView);
  document.querySelectorAll("[data-filter]").forEach(function (button) {
    button.addEventListener("click", function () {
      activeFilter = button.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach(function (pill) { pill.classList.toggle("active", pill === button); });
      renderAssignments();
    });
  });
  byId("add-task-button").addEventListener("click", function () {
    byId("task-form").hidden = false;
    byId("new-task-title").focus();
  });
  byId("cancel-task").addEventListener("click", function () { byId("task-form").hidden = true; });
  byId("task-form").addEventListener("submit", function (event) {
    event.preventDefault();
    assignments.unshift({
      id: Date.now(),
      title: byId("new-task-title").value.trim(),
      course: "Personal",
      due: byId("new-task-date").value,
      status: "open",
      color: "blue",
      moodleUrl: byId("new-task-moodle").value.trim()
    });
    STORE.write("campusly-assignments", assignments);
    byId("task-form").reset();
    byId("task-form").hidden = true;
    renderAssignments();
  });

  byId("new-note-button").addEventListener("click", function () {
    byId("note-form").reset();
    delete byId("note-form").dataset.editing;
    byId("note-form").hidden = false;
    byId("note-title").focus();
  });
  byId("cancel-note").addEventListener("click", function () { byId("note-form").hidden = true; });
  byId("note-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const editingId = byId("note-form").dataset.editing;
    const note = {
      id: editingId ? Number(editingId) : Date.now(),
      title: byId("note-title").value.trim(),
      course: editingId ? notes.find(function (item) { return item.id === Number(editingId); }).course : "QUICK NOTE",
      date: "NOV 19",
      color: editingId ? notes.find(function (item) { return item.id === Number(editingId); }).color : "note-blue",
      body: byId("note-body").value.trim()
    };
    notes = editingId ? notes.map(function (item) { return item.id === note.id ? note : item; }) : [note].concat(notes);
    STORE.write("campusly-notes", notes);
    byId("note-form").hidden = true;
    delete byId("note-form").dataset.editing;
    renderNotes();
  });

  function renderStudySetOptions() {
    const select = byId("study-set-select");
    select.replaceChildren();
    studySets.forEach(function (set) {
      const option = make("option", "", set.title);
      option.value = set.id;
      select.append(option);
    });
    select.value = selectedSet.id;
  }

  renderStudySetOptions();
  updateStudyCard();
  byId("study-set-select").addEventListener("change", function () {
    selectedSet = studySets.find(function (set) { return set.id === byId("study-set-select").value; });
    cardIndex = 0;
    setStudyMode("cards");
    updateStudyCard();
  });
  byId("new-study-set").addEventListener("click", function () {
    selectedSet = { id: "custom-" + Date.now(), title: "Untitled set", course: "", cards: [] };
    studySets.push(selectedSet);
    renderStudySetOptions();
    openStudyEditor(true);
  });
  byId("edit-study-set").addEventListener("click", function () { openStudyEditor(false); });
  byId("add-study-card").addEventListener("click", function () {
    const cards = Array.from(byId("study-edit-cards").querySelectorAll(".study-edit-card")).map(function (row) {
      return { term: row.querySelector("input").value, answer: row.querySelector("textarea").value };
    });
    cards.push({ term: "", answer: "" });
    renderStudyEditorCards(cards);
  });
  byId("study-editor").addEventListener("submit", function (event) {
    event.preventDefault();
    const cards = Array.from(byId("study-edit-cards").querySelectorAll(".study-edit-card")).map(function (row) {
      return { term: row.querySelector("input").value.trim(), answer: row.querySelector("textarea").value.trim() };
    });
    if (!cards.length || cards.some(function (card) { return !card.term || !card.answer; })) {
      byId("study-editor-message").textContent = "Add at least one complete card. Each card needs a term and an answer.";
      return;
    }
    const index = studySets.findIndex(function (set) { return set.id === selectedSet.id; });
    const previous = studySets[index];
    const updated = {
      id: selectedSet.id,
      title: byId("study-edit-title").value.trim(),
      course: byId("study-edit-course").value.trim(),
      cards: cards
    };
    studySets[index] = updated;
    if (!persistStudySets()) {
      studySets[index] = previous;
      byId("study-editor-message").textContent = "Could not save this set in browser storage. Free up space or check your browser settings, then try again.";
      return;
    }
    selectedSet = updated;
    cardIndex = 0;
    editingNewSet = false;
    renderStudySetOptions();
    byId("study-editor").hidden = true;
    document.querySelectorAll("[data-study-mode]").forEach(function (button) { button.disabled = false; });
    setStudyMode("cards");
    updateStudyCard();
  });
  byId("cancel-study-edit").addEventListener("click", function () {
    if (editingNewSet) {
      studySets = studySets.filter(function (set) { return set.id !== selectedSet.id; });
      selectedSet = studySets[0];
      renderStudySetOptions();
      updateStudyCard();
    }
    editingNewSet = false;
    byId("study-editor").hidden = true;
    document.querySelectorAll("[data-study-mode]").forEach(function (button) { button.disabled = false; });
    setStudyMode("cards");
  });
  byId("delete-study-set").addEventListener("click", function () {
    if (studySets.length < 2) return;
    if (!window.confirm('Delete "' + selectedSet.title + '"?')) return;
    const previousSets = studySets.slice();
    studySets = studySets.filter(function (set) { return set.id !== selectedSet.id; });
    if (!persistStudySets()) {
      studySets = previousSets;
      window.alert("Could not delete this set. Check your browser storage settings and try again.");
      return;
    }
    selectedSet = studySets[0];
    cardIndex = 0;
    renderStudySetOptions();
    setStudyMode("cards");
    updateStudyCard();
  });
  document.querySelectorAll("[data-study-mode]").forEach(function (button) {
    button.addEventListener("click", function () { setStudyMode(button.dataset.studyMode); });
  });
  byId("flashcard").addEventListener("click", function () {
    if (!selectedSet.cards.length) return;
    const answer = byId("flashcard-answer");
    const word = byId("flashcard-word");
    const reveal = answer.hidden;
    answer.hidden = !reveal;
    word.hidden = reveal;
    byId("flashcard").classList.toggle("is-flipped", reveal);
    byId("flashcard-category").textContent = reveal ? "TAKE A MOMENT TO REMEMBER" : "KEY CONCEPT";
  });
  byId("previous-card").addEventListener("click", function () {
    if (!selectedSet.cards.length) return;
    cardIndex = (cardIndex - 1 + selectedSet.cards.length) % selectedSet.cards.length;
    updateStudyCard();
  });
  byId("next-card").addEventListener("click", function () {
    if (!selectedSet.cards.length) return;
    cardIndex = (cardIndex + 1) % selectedSet.cards.length;
    updateStudyCard();
  });
  byId("learn-reveal").addEventListener("click", function () {
    byId("learn-answer").hidden = false;
    byId("learn-rating").hidden = false;
    byId("learn-reveal").hidden = true;
  });
  byId("learn-rating").addEventListener("click", function (event) {
    const rating = event.target.closest("[data-learn-rating]");
    if (!rating || learnPosition >= learnQueue.length) return;
    if (rating.dataset.learnRating === "again") learnMissed.push(learnQueue[learnPosition]);
    learnPosition += 1;
    renderLearnCard();
  });
  byId("learn-review-missed").addEventListener("click", function () {
    startLearnSession(learnMissed);
  });
  byId("start-test").addEventListener("click", makeTest);
  byId("test-next").addEventListener("click", function () {
    testPosition += 1;
    renderTestQuestion();
  });
  byId("test-restart").addEventListener("click", makeTest);
  byId("lecture-file").addEventListener("change", function () {
    const file = byId("lecture-file").files[0];
    if (!file) return;
    if (file.size > 200000) {
      byId("lecture-import-message").textContent = "That file is over 200 KB. Paste a shorter excerpt (up to 20,000 characters) instead.";
      byId("lecture-file").value = "";
      return;
    }
    file.text().then(function (text) {
      byId("lecture-text").value = text.slice(0, 20000);
      byId("lecture-import-message").textContent = "Loaded " + file.name + ". Review the text, then create cards.";
    }).catch(function (error) {
      console.warn("Campusly couldn't read the lecture file.", error);
      byId("lecture-import-message").textContent = "Could not read that file. Try a plain .txt or .md file, or paste your notes.";
    });
  });
  byId("lecture-import-form").addEventListener("submit", async function (event) {
    event.preventDefault();
    let text = byId("lecture-text").value.trim();
    const file = byId("lecture-file").files[0];
    if (!text && file) {
      if (file.size > 200000) {
        byId("lecture-import-message").textContent = "That file is over 200 KB. Paste a shorter excerpt (up to 20,000 characters) instead.";
        return;
      }
      try {
        text = (await file.text()).slice(0, 20000);
      } catch (error) {
        console.warn("Campusly couldn't read the lecture file.", error);
        byId("lecture-import-message").textContent = "Could not read that file. Try a plain .txt or .md file, or paste your notes.";
        return;
      }
    }
    const cards = extractLectureCards(text);
    if (!cards.length) {
      byId("lecture-import-message").textContent = "No card-ready lines found. Try “Term: definition” or a Markdown heading followed by its explanation.";
      return;
    }
    const previousCards = selectedSet.cards.slice();
    selectedSet.cards = previousCards.concat(cards);
    if (!persistStudySets()) {
      selectedSet.cards = previousCards;
      byId("lecture-import-message").textContent = "Cards were not saved. Free up browser storage or check your browser settings, then try again.";
      return;
    }
    byId("lecture-import-message").textContent = "Added " + cards.length + " card" + (cards.length === 1 ? "" : "s") + " to “" + selectedSet.title + "”.";
    byId("lecture-text").value = "";
    byId("lecture-file").value = "";
    cardIndex = 0;
    updateStudyCard();
  });

  byId("message-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const input = byId("message-input");
    const value = input.value.trim();
    if (!value) return;
    messages.push({ name: "Jamie Morgan", initials: "JM", color: "lilac", time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }), text: value });
    input.value = "";
    renderMessages();
  });
  byId("back-to-group").addEventListener("click", function () {
    byId("chat-title").textContent = "Study group chat";
    byId("chat-subtitle").replaceChildren(
      make("span", "online-dot"),
      document.createTextNode(" Maya, Eli, and Sam · 3 online")
    );
    byId("back-to-group").hidden = true;
    messages = CAMPUS_DATA.messages.slice();
    renderMessages();
  });
  byId("event-rsvp").addEventListener("click", function () { window.location.hash = "#community"; });
  document.querySelectorAll(".event-join").forEach(function (button) {
    button.addEventListener("click", function () {
      button.textContent = button.textContent === "✓" ? "＋" : "✓";
      button.setAttribute("aria-pressed", button.textContent === "✓" ? "true" : "false");
    });
  });
  document.querySelectorAll("[data-career-filter]").forEach(function (button) {
    button.addEventListener("click", function () {
      activeCareerFilter = button.dataset.careerFilter;
      document.querySelectorAll("[data-career-filter]").forEach(function (pill) { pill.classList.toggle("active", pill === button); });
      renderJobs();
    });
  });
  renderSchedule();
  renderAssignments();
  renderNotes();
  renderPeople();
  renderMessages();
  renderJobs();
  updateStudyCard();
  setupSearch();
  showView();
})();
