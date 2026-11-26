# Business case — Campusly

*Working draft based on the current prototype and today's project decisions. The customer and revenue assumptions still need validation; revise this in your own words and add evidence before submitting.*

## 1. The idea

**Customer:** Campusly is for university students who are balancing classes, assignments, study time, campus events, friends, and early-career opportunities. The first users could be students at one campus. If it becomes a real service, a university student-success or student-affairs department could be the buyer and pay for a campus license or pilot, while students use it for free.

**Problem:** I think students have to coordinate their academic and campus lives across separate calendars, task lists, note apps, group chats, event pages, and job boards. That can make deadlines and useful opportunities harder to keep track of. This is a problem hypothesis, not a result from customer interviews yet.

**Solution:** Campusly puts a weekly schedule, assignments, notes, study sets, campus community, events, and degree-related opportunities in one responsive site. Students can edit and save study sets, use flashcards or active-recall Learn mode, take multiple-choice practice tests, and create cards by pasting text or importing `.txt`, `.md`, or `.csv` files. Import uses basic browser-side parsing (up to 200 KB per file and 20,000 characters); it does not extract PDFs or slides, generate cards with AI, or upload files. The prototype uses fictional people, messages, courses, and jobs; tasks, notes, and study sets are saved in the browser, and it does not yet connect students to real campus services. Its campus field-guide identity includes a custom map-inspired mark and navigation icons, original map illustrations, a calming pastel palette of lavender, dusty indigo, sea-glass green, and soft terracotta, and a distinct display font. These choices help the product feel recognizable, but do not stop someone from copying public website code.

**Revenue:** The prototype currently earns nothing and has no payment system. A possible first model is a university-paid pilot or license, with pricing tested through conversations with student-success staff. Paid employer listings could be a later option if Campusly has an active student audience. I would not rely on advertising or selling student data.

## 2. Where IT creates value

Campusly's main value-chain change is putting information students currently manage in separate places into one digital workflow. Search, deadline cues, saved tasks, flashcards, practice tests, and study-material import could reduce the effort of switching between tools. A web product could also scale to more campuses at a lower marginal cost than providing the same coordination manually.

Relevant course concepts include **scale**, **distribution channels**, and **differentiation**. A university partnership could provide a trusted distribution channel; the student-focused combination of academic planning and campus life could differentiate the product. Saved information may create **switching costs**, but those should not become an excuse to trap users: a real service should let students export or delete their data.

## 3. Network effects

Campusly could become a **two-sided market** connecting students with campus organizations and employers that provide events or opportunities. More engaged students could make it worthwhile for organizations to post useful, current listings; better listings could attract more students. The university may act as a paying customer and distribution partner as well as a source of verified campus information.

There is an **empty-network problem** at launch: an empty community or job board is not useful. I would start with one campus, recruit a small student pilot, and work with campus partners to verify a useful set of events and opportunities. The schedule, assignments, notes, and study cards should still be useful to one student before the network grows.

The prototype points to this possibility with its community, chat, event, and career-board views. They contain fictional demo data, however, so they do not prove that a real network effect exists yet.

## 4. Can it be copied? (the moat question)

The website's code, layout, and colors are **not a moat**; another person can inspect and reproduce a public frontend. The custom visual identity may help people recognize Campusly, but it is not by itself valuable, rare, or hard to imitate.

Using the **VRIN** framework, the potential long-term advantage would have to come from delivering real value through campus-specific, verified information and trusted student participation. Those relationships, integrations, and an active community could take time for a competitor to build. They only become an advantage if Campusly is organized to maintain them—with university partnerships, reliable listing verification, privacy protections, and community moderation. None of those advantages is established by this prototype.

What could grow stronger over time is a trusted campus brand, useful opt-in relationships, and participation from students and campus partners. A larger competitor could copy the interface quickly; it would have to earn the same trust and local participation rather than just copy the CSS.

## 5. Cloud and operations

The current prototype is a static HTML, CSS, and JavaScript site, available through a temporary forwarded preview rather than a permanent public deployment. It uses browser storage for some changes and fictional data for its people, messages, and opportunities. It has no real accounts, shared database, server-side messaging, or payments.

A real product could start with managed static hosting and a **PaaS** backend for accounts, a database, and APIs; it could buy mature identity or email capabilities as **SaaS** rather than building them from scratch. **IaaS** is probably unnecessary at the pilot stage. The main operational risks would be service outages, provider dependence, cost changes, and protecting student information across services.

## 6. Risks and ethics

A real Campusly could expose sensitive academic, identity, or social information. It would need data minimization, clear consent, secure access, retention and deletion rules, and a way to export a student's information. Student data should not be sold.

Job and event listings would need verification to reduce scams and misleading information. A real community feature would need reporting, moderation, and clear expectations for messages. The product should be accessible to students with different needs and avoid presenting unverified or biased opportunities as recommendations. Until these systems exist, the site should keep labeling its content as fictional demo data and its features as a student prototype.
