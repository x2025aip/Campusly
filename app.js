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

  let assignments = STORE.read("campusly-assignments", CAMPUS_DATA.assignments);
  let notes = STORE.read("campusly-notes", CAMPUS_DATA.notes);
  let savedJobs = STORE.read("campusly-saved-jobs", []);
  let messages = CAMPUS_DATA.messages.slice();
  let selectedSet = CAMPUS_DATA.studySets[0];
  let cardIndex = 0;
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
    const card = selectedSet.cards[cardIndex];
    byId("study-set-name").textContent = selectedSet.title;
    byId("study-progress").textContent = "Card " + (cardIndex + 1) + " of " + selectedSet.cards.length + " · Click to reveal the answer";
    byId("flashcard-count").textContent = String(cardIndex + 1).padStart(2, "0") + " / " + String(selectedSet.cards.length).padStart(2, "0");
    byId("flashcard-word").textContent = card.term;
    byId("flashcard-answer").textContent = card.answer;
    byId("flashcard-answer").hidden = true;
    byId("flashcard-word").hidden = false;
    byId("flashcard").classList.remove("is-flipped");
    byId("flashcard-category").textContent = "KEY CONCEPT";
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
      color: "blue"
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

  CAMPUS_DATA.studySets.forEach(function (set) {
    const option = make("option", "", set.title);
    option.value = set.id;
    byId("study-set-select").append(option);
  });
  byId("study-set-select").addEventListener("change", function () {
    selectedSet = CAMPUS_DATA.studySets.find(function (set) { return set.id === byId("study-set-select").value; });
    cardIndex = 0;
    updateStudyCard();
  });
  byId("flashcard").addEventListener("click", function () {
    const answer = byId("flashcard-answer");
    const word = byId("flashcard-word");
    const reveal = answer.hidden;
    answer.hidden = !reveal;
    word.hidden = reveal;
    byId("flashcard").classList.toggle("is-flipped", reveal);
    byId("flashcard-category").textContent = reveal ? "TAKE A MOMENT TO REMEMBER" : "KEY CONCEPT";
  });
  byId("previous-card").addEventListener("click", function () {
    cardIndex = (cardIndex - 1 + selectedSet.cards.length) % selectedSet.cards.length;
    updateStudyCard();
  });
  byId("next-card").addEventListener("click", function () {
    cardIndex = (cardIndex + 1) % selectedSet.cards.length;
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
