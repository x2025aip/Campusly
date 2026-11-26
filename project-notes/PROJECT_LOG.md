# Project log

Keep this up to date as you go — a few lines per work session is enough. It's much harder to reconstruct at the end.

**Team name:** Carley Powers
**Startup name:** Campusly
**Live site link:** https://supreme-space-umbrella-wv4rw6qw4p5qc57p-8000.app.github.dev/

---

## Work sessions

### Session 4 — 2026-11-26 — driver: Copilot

- **Goal for this session:** Give the website a more distinctive color palette while keeping it pastel and calming.
- **Changes:** Updated the site palette to use lavender-tinted backgrounds, dusty indigo accents, sea-glass greens, and soft terracotta; matched the browser theme color to the new background.
- **What worked:** `git diff --check` passed. Started the local preview at `http://localhost:8000/` and confirmed it responds successfully.
- **Prototype note:** The preview is local and is not a permanent public website link.

### Session 3 — 2026-11-23 — driver: Copilot

- **Goal for this session:** Make study sets more creative and customizable by adding new ways to practice and import lecture materials.
- **Changes:** Added persistent set editing and card management, active-recall Learn sessions with self-rating and missed-card review, multiple-choice practice tests, and import from pasted notes or `.txt`/`.md` files.
- **What went wrong:** File import is limited to plain text and Markdown; it does not extract content from PDFs or slides, and imported material is not automatically turned into study resources with AI.
- **Prototype note:** Lecture import is local text parsing for `Term: definition` lines and Markdown headings with explanations; it is not AI-generated, does not upload files, and does not support slide/PDF extraction.

### Session 2 — 2026-11-23 — driver: Copilot

- **Goal for this session:** Add direct Moodle links to assignments that are still due.
- **Changes:** Added Moodle URLs to the demo assignment data, added a Moodle action to open-assignment rows on both the overview and full assignments page, and added an optional Moodle URL field when creating a new assignment.
- **Prototype note:** Demo Moodle URLs are placeholder links for the mockup; a real integration would use the student's verified course and assignment links.

### Session 1 — 2026-11-19 — driver: Carley Powers

- **Goal for this session:** Build and refine Campusly, a student-focused campus organizer, and capture the product and business decisions made today.
- **Instructions and constraints:** Design for university-age students; keep the site clean, aesthetic, and easy to navigate; include academic planning, notes and study sets, campus community/events, and degree-related jobs. Keep all demo data fictional and do not present the prototype as a real messaging, jobs, payments, or campus service. A public frontend can be made more recognizable, but cannot be made impossible to copy.
- **Key prompts we gave Copilot** (important prompts from today):
  1. “I want a website that is meant for university aged students looking to organize their schedules, assingments, notes, study sets, social events, chat with friends, professors and potential employers, view job opportunities within their degree. I want it to look pretty and aesthetic, clean, and easy to navigate.”
  2. “can you give me the link to open the wbesite”
  3. “how can i make this more imitation resistant and rare”
  4. “implement these things to make it so the website cant be copied”
  5. “show me the new website”
  6. “who would i get paid from this website”
  7. “can you take everything ive done today, the website, all the instructions and any changes and move it to the business case”
  8. “take all my progress from today everything ive done and add it to the project log under Session 1”
- **Progress and changes:**
  - Built the original responsive prototype with overview, schedule, assignments, notes, study sets, community/chat, campus events, and career-board views. Tasks and notes use browser storage; the prototype also includes search, flashcards, filters, saved-job interactions, and demo conversations.
  - Refined the visual identity in `index.html` and `styles.css`: custom map-inspired logo, seven custom SVG navigation icons, campus-map illustrations, green-and-copper colors, Fraunces display type, and subtle route motion with reduced-motion support.
  - Discussed monetization: no current revenue; a university-paid pilot/license is the leading hypothesis, students would likely use it free, and employer listings might be a later option.
  - Wrote the business-case draft in `project-notes/BUSINESS_CASE.md`, including the customer/problem hypothesis, IT value, network effects, VRIN/moat, cloud operations, risks, and ethics. Market and revenue assumptions still need validation.
  - Updated `project-notes/PROJECT_LOG.md` to record today's prompts and progress.
- **What worked:** `git diff --check` passed. HTML parsing, CSS block-balance and unique-ID checks passed; all seven custom navigation icons were found; `node --check` passed for `app.js` and `data.js`. A local preview at `http://localhost:8000` responded successfully.
- **What broke, and how we fixed it:** No site failure was reported. The request to make the site impossible to copy cannot be guaranteed for a public frontend, so the design was made more distinctive instead. No real customers, revenue, payments, or campus integrations exist yet; the business case treats these as assumptions or future work.
- **Committed?** No. Today's visual and document changes are uncommitted. Confirm in Source Control before submitting; the prototype was already present when this session began.

## Things that broke (running list)

| Date | What went wrong | What we tried | What finally fixed it |
|---|---|---|---|
| 2026-11-19 | Asked whether the public website could be made impossible to copy. | Reviewed the prototype's visual system and discussed the limits of client-side code. | Made the visual identity more distinctive; noted that this does not prevent copying. |
| 2026-11-23 | Existing browser-saved assignments could be missing Moodle links. | Added Moodle URLs to the demo data and renderer. | Existing saved assignments now receive a matching demo link when it is missing. |
| 2026-11-23 | The Moodle URLs in the prototype are placeholders, not real course assignments. | Added an optional Moodle URL field for new assignments. | The prototype can store demo or user-entered links; real Moodle integration still needs course data and authorization. |
| 2026-11-23 | No permanent public website link was confirmed. | Started and checked a local preview server. | A temporary local link is available at `http://localhost:8000/`; GitHub Pages must still be configured for a permanent public link. |

## What a real version would need

| Feature we faked or skipped | Why a real company would need it | How hard / expensive? |
|---|---|---|
| Student accounts and a secure shared database | Let students access their schedules and notes across devices and control who can see them. | Medium to high; requires backend development, security work, and ongoing operations. |
| Real campus events and job listings | Keep opportunities accurate and give students a reason to return. | Medium; requires campus/employer partnerships and a verification process. |
| AI-assisted lecture and slide import | Turn varied lecture materials into accurate study resources while protecting student data. | Medium to high; requires model integration, file processing, privacy safeguards, and quality checks. |
| Real messaging and moderation | Support safe communication between students, faculty, and employers. | High; requires privacy decisions, reporting tools, moderation, and staff or services. |
| University pilot, licensing, and payments | Test whether a campus will pay and handle a real commercial relationship. | Medium; requires a pilot agreement, support, and payment or invoicing operations. |
| Privacy, accessibility, and support processes | Protect student information and make the service usable and dependable. | Ongoing; requires policy, testing, maintenance, and support capacity. |

## Reflection (fill in at the end)

1. What surprised you most about building software with AI?
2. Which parts were easy, and which were hard? Why do you think that is?
3. If a competitor had the same AI tool, how long would it take them to copy your site?
