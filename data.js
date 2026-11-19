// All names, messages, courses, and opportunities below are fictional demo data.
const CAMPUS_DATA = {
  schedule: [
    { time: "9:00", period: "AM", end: "10:15 AM", title: "Developmental Psychology", detail: "Mulroney Hall · Room 204", type: "class", color: "lilac" },
    { time: "10:30", period: "AM", end: "11:30 AM", title: "Coffee & a little reading", detail: "The campus café", type: "personal", color: "peach" },
    { time: "12:00", period: "PM", end: "1:15 PM", title: "Research Methods", detail: "Angus L. Macdonald Library · 1B", type: "class", color: "mint" },
    { time: "2:00", period: "PM", end: "3:00 PM", title: "Study group: midterm prep", detail: "Library · Quiet study room", type: "study", color: "blue" }
  ],
  assignments: [
    { id: 1, title: "Research reflection", course: "Research Methods", due: "2026-11-20", status: "open", color: "peach" },
    { id: 2, title: "Read chapters 6 & 7", course: "Developmental Psychology", due: "2026-11-21", status: "open", color: "lilac" },
    { id: 3, title: "Discussion post: motivation", course: "Social Psychology", due: "2026-11-22", status: "open", color: "mint" },
    { id: 4, title: "Lecture notes — cognition", course: "Cognitive Psychology", due: "2026-11-18", status: "done", color: "blue" },
    { id: 5, title: "Review study guide", course: "Research Methods", due: "2026-11-17", status: "done", color: "peach" }
  ],
  notes: [
    { id: 1, title: "Research methods · Week 8", course: "RESEARCH METHODS", date: "NOV 18", color: "note-lilac", body: "Correlation does not equal causation.\n\n• Experimental research changes one variable to observe an effect\n• The control group gives us a baseline\n• Random assignment helps reduce bias\n\nRemember: a good question is the beginning of good research." },
    { id: 2, title: "The nature vs. nurture debate", course: "DEVELOPMENTAL PSYCHOLOGY", date: "NOV 15", color: "note-peach", body: "It isn't really a debate with one winner! Development is shaped by the ongoing interaction between our genes and our environment.\n\nThink: How does a person's context influence the way a trait is expressed?" },
    { id: 3, title: "Midterm study ideas", course: "LITTLE THOUGHTS", date: "NOV 13", color: "note-mint", body: "Try explaining each theory in my own words instead of only rereading.\n\nMake a mini quiz with Maya after class.\nTake a real break after 25 minutes. ☼" }
  ],
  studySets: [
    { id: "research", title: "Research methods", course: "PSYCHOLOGY 201", cards: [
      { term: "Independent variable", answer: "The variable a researcher deliberately changes or manipulates in an experiment." },
      { term: "Operational definition", answer: "A clear, specific explanation of how a concept is measured or identified in a study." },
      { term: "Correlation", answer: "A relationship between two variables. Correlation alone does not establish that one causes the other." },
      { term: "Random assignment", answer: "Placing participants into groups by chance to help make groups comparable." },
      { term: "Control group", answer: "The group that does not receive the experimental treatment, giving researchers a comparison point." }
    ] },
    { id: "development", title: "Development & learning", course: "PSYCHOLOGY 202", cards: [
      { term: "Attachment", answer: "A lasting emotional bond, especially the relationship between an infant and caregiver." },
      { term: "Object permanence", answer: "Understanding that objects continue to exist even when they cannot be seen." },
      { term: "Scaffolding", answer: "Temporary guidance that helps a learner do something they could not yet manage alone." },
      { term: "Theory of mind", answer: "The understanding that other people have their own thoughts, feelings, and beliefs." }
    ] }
  ],
  people: [
    { name: "Maya Chen", initials: "MC", role: "Psychology · Year 2", color: "peach", status: "online", kind: "friend" },
    { name: "Eli Foster", initials: "EF", role: "Psychology · Year 3", color: "mint", status: "online", kind: "friend" },
    { name: "Sam Rivera", initials: "SR", role: "Sociology · Year 2", color: "blue", status: "away", kind: "friend" },
    { name: "Dr. Avery Brooks", initials: "AB", role: "Psychology professor", color: "lilac", status: "online", kind: "faculty" },
    { name: "Taylor Reed", initials: "TR", role: "Harbourview · Talent team", color: "mint", status: "away", kind: "employer" }
  ],
  messages: [
    { name: "Maya Chen", initials: "MC", color: "peach", time: "10:12", text: "Anyone want to compare notes before the study group? ☺" },
    { name: "Jamie Morgan", initials: "JM", color: "lilac", time: "10:16", text: "Yes! I just added my research methods notes. The bit about random assignment finally clicked." },
    { name: "Eli Foster", initials: "EF", color: "mint", time: "10:18", text: "Same here! I'll bring the practice questions 📚" },
    { name: "Sam Rivera", initials: "SR", color: "blue", time: "10:21", text: "Perfect, see you all at 2 in the library!" }
  ],
  jobs: [
    { id: 1, title: "Peer Wellness Ambassador", org: "Student Wellness Centre", type: "Part-time", location: "On campus", detail: "Support student-led wellbeing initiatives and help connect peers with campus resources.", skills: ["Community", "Communication"], color: "peach" },
    { id: 2, title: "Research Assistant Intern", org: "North Shore Behaviour Lab", type: "Internship", location: "Hybrid · Antigonish", detail: "Help a friendly research team organize study materials and support participant sessions.", skills: ["Research", "Psychology"], color: "lilac" },
    { id: 3, title: "Youth Program Support", org: "Harbourview Community Hub", type: "Part-time", location: "Antigonish, NS", detail: "Help create welcoming after-school activities with a local youth support team.", skills: ["Youth work", "Teamwork"], color: "mint" }
  ]
};
