# Project log

Keep this up to date as you go — a few lines per work session is enough. It's much harder to reconstruct at the end.

**Team name:** Carley Powers
**Startup name:** Campusly
**Live site link:** No permanent public link confirmed. A local preview was used during this work.

---

## Work sessions

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

## What a real version would need

| Feature we faked or skipped | Why a real company would need it | How hard / expensive? |
|---|---|---|
| Student accounts and a secure shared database | Let students access their schedules and notes across devices and control who can see them. | Medium to high; requires backend development, security work, and ongoing operations. |
| Real campus events and job listings | Keep opportunities accurate and give students a reason to return. | Medium; requires campus/employer partnerships and a verification process. |
| Real messaging and moderation | Support safe communication between students, faculty, and employers. | High; requires privacy decisions, reporting tools, moderation, and staff or services. |
| University pilot, licensing, and payments | Test whether a campus will pay and handle a real commercial relationship. | Medium; requires a pilot agreement, support, and payment or invoicing operations. |
| Privacy, accessibility, and support processes | Protect student information and make the service usable and dependable. | Ongoing; requires policy, testing, maintenance, and support capacity. |

## Reflection (fill in at the end)

1. What surprised you most about building software with AI?
2. Which parts were easy, and which were hard? Why do you think that is?
3. If a competitor had the same AI tool, how long would it take them to copy your site?
