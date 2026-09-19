// AgniUI — Desk App Scaffold · sample data.
// Neutral, domain-agnostic records so the scaffold reads as a generic
// starting point. Swap these arrays for your module's real data.

/* ── Records — 28 rows for scroll testing ─────────────────────── */
window.SCAFFOLD_RECORDS = [
  { id:"REC-2401", owner:"Aravind Prabhu",      category:"Type A",  group:"Group One",   status:"Pending",   date:"12 Jun 2026" },
  { id:"REC-2402", owner:"Meera Krishnan",       category:"Type B",  group:"Group Two",   status:"Approved",  date:"11 Jun 2026" },
  { id:"REC-2403", owner:"Rohit Sharma",         category:"Type C",  group:"Group Three", status:"In Review", date:"10 Jun 2026" },
  { id:"REC-2404", owner:"Priya Nair",           category:"Type A",  group:"Group Four",  status:"Approved",  date:"10 Jun 2026" },
  { id:"REC-2405", owner:"Karthik Raman",        category:"Type D",  group:"Group One",   status:"Rejected",  date:"09 Jun 2026" },
  { id:"REC-2406", owner:"Sandeep Verma",        category:"Type E",  group:"Group Two",   status:"Pending",   date:"08 Jun 2026" },
  { id:"REC-2407", owner:"Anjali Menon",         category:"Type C",  group:"Group Five",  status:"Approved",  date:"08 Jun 2026" },
  { id:"REC-2408", owner:"Vikram Singh",         category:"Type B",  group:"Group One",   status:"In Review", date:"07 Jun 2026" },
  { id:"REC-2409", owner:"Deepa Pillai",         category:"Type A",  group:"Group Two",   status:"Pending",   date:"07 Jun 2026" },
  { id:"REC-2410", owner:"Arjun Nair",           category:"Type D",  group:"Group Four",  status:"Approved",  date:"06 Jun 2026" },
  { id:"REC-2411", owner:"Sunita Rao",           category:"Type E",  group:"Group Three", status:"In Review", date:"06 Jun 2026" },
  { id:"REC-2412", owner:"Manoj Kumar",          category:"Type A",  group:"Group One",   status:"Approved",  date:"05 Jun 2026" },
  { id:"REC-2413", owner:"Lavanya Subramanian",  category:"Type C",  group:"Group Five",  status:"Pending",   date:"05 Jun 2026" },
  { id:"REC-2414", owner:"Rajesh Nambiar",       category:"Type D",  group:"Group Two",   status:"Rejected",  date:"04 Jun 2026" },
  { id:"REC-2415", owner:"Kavitha Desai",        category:"Type E",  group:"Group Four",  status:"Approved",  date:"04 Jun 2026" },
  { id:"REC-2416", owner:"Bala Krishnan",        category:"Type A",  group:"Group One",   status:"In Review", date:"03 Jun 2026" },
  { id:"REC-2417", owner:"Nithya Menon",         category:"Type B",  group:"Group Three", status:"Pending",   date:"03 Jun 2026" },
  { id:"REC-2418", owner:"Sanjay Patel",         category:"Type C",  group:"Group Five",  status:"Approved",  date:"02 Jun 2026" },
  { id:"REC-2419", owner:"Preethi Shankar",      category:"Type D",  group:"Group Two",   status:"In Review", date:"02 Jun 2026" },
  { id:"REC-2420", owner:"Dhruv Malhotra",       category:"Type E",  group:"Group One",   status:"Approved",  date:"01 Jun 2026" },
  { id:"REC-2421", owner:"Ananya Krishnan",      category:"Type A",  group:"Group Four",  status:"Pending",   date:"31 May 2026" },
  { id:"REC-2422", owner:"Harish Venkat",        category:"Type B",  group:"Group Three", status:"Rejected",  date:"30 May 2026" },
  { id:"REC-2423", owner:"Shweta Iyer",          category:"Type C",  group:"Group Five",  status:"Approved",  date:"30 May 2026" },
  { id:"REC-2424", owner:"Gopal Krishnamurthy",  category:"Type D",  group:"Group Two",   status:"In Review", date:"29 May 2026" },
  { id:"REC-2425", owner:"Meenakshi Sundaram",   category:"Type E",  group:"Group One",   status:"Pending",   date:"28 May 2026" },
  { id:"REC-2426", owner:"Ravi Varma",           category:"Type A",  group:"Group Three", status:"Approved",  date:"27 May 2026" },
  { id:"REC-2427", owner:"Shalini Krishnakumar", category:"Type B",  group:"Group Four",  status:"In Review", date:"26 May 2026" },
  { id:"REC-2428", owner:"Muthukumar Pandian",   category:"Type C",  group:"Group One",   status:"Pending",   date:"25 May 2026" },
];

/* Maps a status string → a Badge/kanban tone token. */
window.recordTone = function(s) {
  return s === "Approved" ? "done" : s === "In Review" ? "doing" : s === "Rejected" ? "error" : "todo";
};

/* ── Board (kanban) data ───────────────────────────────────────
   Generic request records grouped by status. Each carries the full
   field set the DS <KanbanCard> renders: an optional application
   identity, request type, record meta (id / date / requestedBy /
   requestedFor) and status-specific footer fields. Swap for your
   module's real data — the shape is the contract.                 */
window.SCAFFOLD_BOARD = {
  "Approvals": [
    { id:"REC-2402", app:{name:"Procurement", icon:"ph-shopping-cart"}, requestType:"Purchase request",   requestedBy:"Meera Krishnan",  requestedFor:"Agnibaan · Stage-2", date:"12 Jun 2026", priority:"High" },
    { id:"REC-2407", app:{name:"Fabrication", icon:"ph-wrench"},        requestType:"Fabrication order",   requestedBy:"Anjali Menon",    requestedFor:"Engine · Semi-cryo", date:"11 Jun 2026", priority:"Med"  },
    { id:"REC-2427", app:{name:"Facilities",  icon:"ph-buildings"},     requestType:"Service request",     requestedBy:"Shalini K.",      requestedFor:"Chennai HQ",         date:"10 Jun 2026", priority:"Low"  },
  ],
  "Yet to start": [
    { id:"REC-2401", app:{name:"Procurement", icon:"ph-shopping-cart"}, requestType:"Purchase request",   requestedBy:"Aravind Prabhu",  requestedFor:"Agnibaan · Stage-1", date:"11 Jun 2026", priority:"Low", assignee:"Karthik Reddy", assignedOn:"13 Jun" },
    { id:"REC-2406", app:{name:"IT",          icon:"ph-desktop"},       requestType:"Access request",      requestedBy:"Sandeep Verma",   requestedFor:"Avionics Lab",       date:"10 Jun 2026", priority:"Med", assignee:"Meera Krishnan", assignedOn:"12 Jun" },
    { id:"REC-2409", app:{name:"Fabrication", icon:"ph-wrench"},        requestType:"Fabrication order",   requestedBy:"Deepa Pillai",    requestedFor:"Structures",         date:"09 Jun 2026", priority:"Low", assignee:"Rohit Sharma",   assignedOn:"11 Jun" },
    { id:"REC-2413", app:{name:"Facilities",  icon:"ph-buildings"},     requestType:"Service request",     requestedBy:"Lavanya S.",      requestedFor:"Sriharikota",        date:"09 Jun 2026", priority:"Med", assignee:"Priya Nair",     assignedOn:"11 Jun" },
  ],
  "In progress": [
    { id:"REC-2403", app:{name:"Fabrication", icon:"ph-wrench"},        requestType:"Fabrication order",   requestedBy:"Rohit Sharma",    requestedFor:"Engine · Semi-cryo", date:"07 Jun 2026", priority:"High", assignee:"Vikram Singh",  assignees:["Vikram Singh","Aravind Prabhu","Deepa Pillai","Rohit Sharma","Sandeep Verma"], startedOn:"09 Jun", days:5, effort:{ total:"4h 20m", intervals:3 } },
    { id:"REC-2408", app:{name:"Procurement", icon:"ph-shopping-cart"}, requestType:"Purchase request",   requestedBy:"Vikram Singh",    requestedFor:"Agnibaan · Stage-2", date:"06 Jun 2026", priority:"High", assignee:"Aravind Prabhu", startedOn:"08 Jun", days:6, effort:{ total:"1h 45m", intervals:2, running:true, current:"1h 12m", startedAt:"1:35 PM" } },
    { id:"REC-2411", app:{name:"IT",          icon:"ph-desktop"},       requestType:"Access request",      requestedBy:"Sunita Rao",      requestedFor:"Ground Systems",     date:"06 Jun 2026", priority:"Med",  assignee:"Sandeep Verma",  assignees:["Sandeep Verma","Meera Krishnan","Priya Nair"], startedOn:"08 Jun", days:6, effort:{ total:"2h 05m", intervals:1 } },
    { id:"REC-2419", app:{name:"Facilities",  icon:"ph-buildings"},     requestType:"Service request",     requestedBy:"Preethi Shankar", requestedFor:"Bengaluru Lab",      date:"05 Jun 2026", priority:"Low",  assignee:"Deepa Pillai",   startedOn:"07 Jun", days:7 },
  ],
  "Overdue": [
    { id:"REC-2414", app:{name:"Fabrication", icon:"ph-wrench"},        requestType:"Fabrication order",   requestedBy:"Rajesh Nambiar",  requestedFor:"Structures",         date:"28 May 2026", priority:"High", assignee:"Rajesh Nambiar", assignees:["Rajesh Nambiar","Anjali Menon","Kavitha Desai","Manoj Kumar"], dueSince:"04 Jun", days:6, effort:{ total:"3h 30m", intervals:4, running:true, current:"0h 48m", startedAt:"2:47 PM" } },
    { id:"REC-2422", app:{name:"Procurement", icon:"ph-shopping-cart"}, requestType:"Purchase request",   requestedBy:"Harish Venkat",   requestedFor:"Agnibaan · Stage-1", date:"24 May 2026", priority:"Med",  assignee:"Harish Venkat",  assignees:["Harish Venkat","Lavanya S.","Karthik Reddy"], dueSince:"30 May", days:11, effort:{ total:"6h 15m", intervals:5 } },
  ],
  "Completed": [
    { id:"REC-2410", app:{name:"Fabrication", icon:"ph-wrench"},        requestType:"Fabrication order",   requestedBy:"Arjun Nair",      requestedFor:"Engine · Semi-cryo", date:"30 May 2026", priority:"Low", assignee:"Arjun Nair",   completedOn:"06 Jun", days:4 },
    { id:"REC-2412", app:{name:"Procurement", icon:"ph-shopping-cart"}, requestType:"Purchase request",   requestedBy:"Manoj Kumar",     requestedFor:"Agnibaan · Stage-2", date:"29 May 2026", priority:"Low", assignee:"Manoj Kumar",  completedOn:"05 Jun", days:5 },
    { id:"REC-2415", app:{name:"IT",          icon:"ph-desktop"},       requestType:"Access request",      requestedBy:"Kavitha Desai",   requestedFor:"Avionics Lab",       date:"28 May 2026", priority:"Med", assignee:"Kavitha Desai",completedOn:"04 Jun", days:6 },
    { id:"REC-2420", app:{name:"Facilities",  icon:"ph-buildings"},     requestType:"Service request",     requestedBy:"Dhruv Malhotra",  requestedFor:"Chennai HQ",         date:"26 May 2026", priority:"Low", assignee:"Dhruv Malhotra",completedOn:"01 Jun", days:5 },
  ],
  "Rejected": [
    { id:"REC-2405", app:{name:"Procurement", icon:"ph-shopping-cart"}, requestType:"Purchase request",   requestedBy:"Karthik Raman",   requestedFor:"Ground Systems",     date:"05 Jun 2026", priority:"Low", rejectedBy:"Priya Nair" },
    { id:"REC-2416", app:{name:"IT",          icon:"ph-desktop"},       requestType:"Access request",      requestedBy:"Bala Krishnan",   requestedFor:"Avionics Lab",       date:"02 Jun 2026", priority:"Med", rejectedBy:"Aravind Prabhu" },
  ],
};

/* People for the Approve & assign picker on Approvals cards. */
window.SCAFFOLD_BOARD_PEOPLE = [
  { id:"u1", name:"Aravind Prabhu",  team:"Propulsion · Lead"         },
  { id:"u2", name:"Meera Krishnan",  team:"Avionics · Engineer"       },
  { id:"u3", name:"Rohit Sharma",    team:"Structures · Engineer"     },
  { id:"u4", name:"Priya Nair",      team:"Quality · Reviewer"        },
  { id:"u5", name:"Karthik Reddy",   team:"Ground Systems · Engineer" },
];

/* ── Notifications — feeds the Header bell's NotificationsMenu ───
   Grouped by `date` (display label), newest first. Swap for a real
   feed; the shape ({id, icon, message, time, date, read}) is the
   contract the NotificationsMenu DS component expects. */
window.SCAFFOLD_NOTIFICATIONS = [
  { id:"nt1", icon:"ph-seal-check",  message:"Your purchase request REC-2401 was approved by Aravind Prabhu.",                         time:"10:05", date:"Today",     read:false },
  { id:"nt2", icon:"ph-user-switch", message:"Fabrication order REC-2403 was assigned to Vikram Singh for review.",                     time:"09:18", date:"Today",     read:false },
  { id:"nt3", icon:"ph-chat-circle", message:"Priya Nair left a comment on access request REC-2416: “Missing manager sign-off — please resubmit with the updated form attached.”", time:"08:52", date:"Today",     read:false },
  { id:"nt4", icon:"ph-clock",       message:"Service request REC-2413 is overdue by 2 days.",                                          time:"17:30", date:"Yesterday", read:false },
  { id:"nt5", icon:"ph-x-circle",    message:"Access request REC-2416 was rejected — missing manager sign-off.",                        time:"11:20", date:"Yesterday", read:true  },
  { id:"nt6", icon:"ph-package",     message:"Purchase request REC-2408 moved to In progress.",                                         time:"09:40", date:"Yesterday", read:true  },
];

/* ── Crew directory — the org roster. reportsTo links build the
   reporting line-up (OrgTree); the same rows feed the table view
   and the profile page. Hierarchy: Associate → Senior associate →
   Senior lead → Vice president → Director.                        */
window.SCAFFOLD_CREW = [
  { id:"EMP-2401", name:"Aravind Prabhu",       role:"Director",         crew:"Operations",  team:"Leadership",       reportsTo:null,       status:"Active",   email:"aravind.prabhu@agnikul.in",   phone:"+91 98401 20401", location:"Chennai · IIT-M Research Park", joined:"03 Jan 2019", type:"Full-time", dob:"14 Mar 1978", gender:"Male",   blood:"O+" },
  { id:"EMP-2402", name:"Meera Krishnan",       role:"Vice president",   crew:"Propulsion",  team:"Leadership",       reportsTo:"EMP-2401", status:"Active",   email:"meera.krishnan@agnikul.in",   phone:"+91 98401 20402", location:"Chennai · IIT-M Research Park", joined:"18 Mar 2019", type:"Full-time", dob:"02 Jul 1982", gender:"Female", blood:"A+" },
  { id:"EMP-2403", name:"Vikram Singh",         role:"Vice president",   crew:"Avionics",    team:"Leadership",       reportsTo:"EMP-2401", status:"Active",   email:"vikram.singh@agnikul.in",     phone:"+91 98401 20403", location:"Chennai · IIT-M Research Park", joined:"22 Jul 2019", type:"Full-time", dob:"29 Nov 1980", gender:"Male",   blood:"B+" },
  { id:"EMP-2404", name:"Rohit Sharma",         role:"Senior lead",      crew:"Propulsion",  team:"Engines",          reportsTo:"EMP-2402", status:"Active",   email:"rohit.sharma@agnikul.in",     phone:"+91 98401 20404", location:"Chennai · IIT-M Research Park", joined:"10 Feb 2020", type:"Full-time", dob:"17 May 1986", gender:"Male",   blood:"O−" },
  { id:"EMP-2405", name:"Kavitha Desai",        role:"Senior lead",      crew:"Structures",  team:"Airframe",         reportsTo:"EMP-2402", status:"Active",   email:"kavitha.desai@agnikul.in",    phone:"+91 98401 20405", location:"Chennai · IIT-M Research Park", joined:"01 Jun 2020", type:"Full-time", dob:"08 Sep 1987", gender:"Female", blood:"AB+" },
  { id:"EMP-2406", name:"Priya Nair",           role:"Senior lead",      crew:"Avionics",    team:"Flight computers", reportsTo:"EMP-2403", status:"Active",   email:"priya.nair@agnikul.in",       phone:"+91 98401 20406", location:"Chennai · IIT-M Research Park", joined:"14 Sep 2020", type:"Full-time", dob:"23 Jan 1988", gender:"Female", blood:"O+" },
  { id:"EMP-2407", name:"Manoj Kumar",          role:"Senior lead",      crew:"Software",    team:"GNC",              reportsTo:"EMP-2403", status:"On leave", email:"manoj.kumar@agnikul.in",      phone:"+91 98401 20407", location:"Chennai · IIT-M Research Park", joined:"05 Jan 2021", type:"Full-time", dob:"11 Apr 1985", gender:"Male",   blood:"B−" },
  { id:"EMP-2408", name:"Karthik Reddy",        role:"Senior associate", crew:"Propulsion",  team:"Engines",          reportsTo:"EMP-2404", status:"Active",   email:"karthik.reddy@agnikul.in",    phone:"+91 98401 20408", location:"Chennai · IIT-M Research Park", joined:"12 Apr 2021", type:"Full-time", dob:"30 Jun 1990", gender:"Male",   blood:"A−" },
  { id:"EMP-2409", name:"Anjali Menon",         role:"Senior associate", crew:"Propulsion",  team:"Turbopumps",       reportsTo:"EMP-2404", status:"Active",   email:"anjali.menon@agnikul.in",     phone:"+91 98401 20409", location:"Chennai · IIT-M Research Park", joined:"07 Jun 2021", type:"Full-time", dob:"19 Dec 1991", gender:"Female", blood:"O+" },
  { id:"EMP-2410", name:"Rajesh Nambiar",       role:"Senior associate", crew:"Structures",  team:"Airframe",         reportsTo:"EMP-2405", status:"Active",   email:"rajesh.nambiar@agnikul.in",   phone:"+91 98401 20410", location:"Chennai · IIT-M Research Park", joined:"20 Sep 2021", type:"Full-time", dob:"03 Feb 1989", gender:"Male",   blood:"B+" },
  { id:"EMP-2411", name:"Sunita Rao",           role:"Senior associate", crew:"Structures",  team:"Composites",       reportsTo:"EMP-2405", status:"Active",   email:"sunita.rao@agnikul.in",       phone:"+91 98401 20411", location:"Chennai · IIT-M Research Park", joined:"01 Nov 2021", type:"Full-time", dob:"26 Aug 1990", gender:"Female", blood:"A+" },
  { id:"EMP-2412", name:"Deepa Pillai",         role:"Senior associate", crew:"Avionics",    team:"Flight computers", reportsTo:"EMP-2406", status:"Active",   email:"deepa.pillai@agnikul.in",     phone:"+91 98401 20412", location:"Chennai · IIT-M Research Park", joined:"17 Jan 2022", type:"Full-time", dob:"15 Oct 1992", gender:"Female", blood:"O−" },
  { id:"EMP-2413", name:"Arjun Nair",           role:"Senior associate", crew:"Avionics",    team:"Sensors",          reportsTo:"EMP-2406", status:"Active",   email:"arjun.nair@agnikul.in",       phone:"+91 98401 20413", location:"Chennai · IIT-M Research Park", joined:"07 Mar 2022", type:"Full-time", dob:"21 Jul 1991", gender:"Male",   blood:"AB−" },
  { id:"EMP-2414", name:"Lavanya Subramanian",  role:"Senior associate", crew:"Software",    team:"GNC",              reportsTo:"EMP-2407", status:"Active",   email:"lavanya.s@agnikul.in",        phone:"+91 98401 20414", location:"Chennai · IIT-M Research Park", joined:"09 May 2022", type:"Full-time", dob:"12 Mar 1993", gender:"Female", blood:"B+" },
  { id:"EMP-2415", name:"Harish Venkat",        role:"Senior associate", crew:"Software",    team:"Ground software",  reportsTo:"EMP-2407", status:"Active",   email:"harish.venkat@agnikul.in",    phone:"+91 98401 20415", location:"Chennai · IIT-M Research Park", joined:"04 Jul 2022", type:"Full-time", dob:"28 Jan 1990", gender:"Male",   blood:"O+" },
  { id:"EMP-2416", name:"Dhruv Malhotra",       role:"Associate",        crew:"Propulsion",  team:"Engines",          reportsTo:"EMP-2408", status:"Active",   email:"dhruv.malhotra@agnikul.in",   phone:"+91 98401 20416", location:"Chennai · IIT-M Research Park", joined:"16 Jan 2023", type:"Full-time", dob:"09 Sep 1996", gender:"Male",   blood:"A+" },
  { id:"EMP-2417", name:"Nithya Menon",         role:"Associate",        crew:"Propulsion",  team:"Turbopumps",       reportsTo:"EMP-2409", status:"Active",   email:"nithya.menon@agnikul.in",     phone:"+91 98401 20417", location:"Chennai · IIT-M Research Park", joined:"13 Mar 2023", type:"Full-time", dob:"22 Nov 1997", gender:"Female", blood:"O+" },
  { id:"EMP-2418", name:"Sanjay Patel",         role:"Associate",        crew:"Structures",  team:"Airframe",         reportsTo:"EMP-2410", status:"On leave", email:"sanjay.patel@agnikul.in",     phone:"+91 98401 20418", location:"Chennai · IIT-M Research Park", joined:"05 Jun 2023", type:"Full-time", dob:"04 Apr 1995", gender:"Male",   blood:"B−" },
  { id:"EMP-2419", name:"Preethi Shankar",      role:"Associate",        crew:"Structures",  team:"Composites",       reportsTo:"EMP-2411", status:"Active",   email:"preethi.shankar@agnikul.in",  phone:"+91 98401 20419", location:"Chennai · IIT-M Research Park", joined:"07 Aug 2023", type:"Full-time", dob:"18 Jun 1996", gender:"Female", blood:"A−" },
  { id:"EMP-2420", name:"Bala Krishnan",        role:"Associate",        crew:"Avionics",    team:"Flight computers", reportsTo:"EMP-2412", status:"Active",   email:"bala.krishnan@agnikul.in",    phone:"+91 98401 20420", location:"Chennai · IIT-M Research Park", joined:"02 Oct 2023", type:"Full-time", dob:"27 Feb 1998", gender:"Male",   blood:"O+" },
  { id:"EMP-2421", name:"Ananya Krishnan",      role:"Associate",        crew:"Avionics",    team:"Sensors",          reportsTo:"EMP-2413", status:"Active",   email:"ananya.krishnan@agnikul.in",  phone:"+91 98401 20421", location:"Chennai · IIT-M Research Park", joined:"08 Jan 2024", type:"Full-time", dob:"31 Aug 1998", gender:"Female", blood:"AB+" },
  { id:"EMP-2422", name:"Gopal Krishnamurthy",  role:"Associate",        crew:"Software",    team:"GNC",              reportsTo:"EMP-2414", status:"Active",   email:"gopal.k@agnikul.in",          phone:"+91 98401 20422", location:"Chennai · IIT-M Research Park", joined:"04 Mar 2024", type:"Full-time", dob:"13 May 1997", gender:"Male",   blood:"B+" },
  { id:"EMP-2423", name:"Shweta Iyer",          role:"Associate",        crew:"Software",    team:"Ground software",  reportsTo:"EMP-2415", status:"Active",   email:"shweta.iyer@agnikul.in",      phone:"+91 98401 20423", location:"Chennai · IIT-M Research Park", joined:"06 May 2024", type:"Full-time", dob:"25 Oct 1999", gender:"Female", blood:"O−" },
  { id:"EMP-2424", name:"Sandeep Verma",        role:"Associate",        crew:"Propulsion",  team:"Engines",          reportsTo:"EMP-2408", status:"Active",   email:"sandeep.verma@agnikul.in",    phone:"+91 98401 20424", location:"Chennai · IIT-M Research Park", joined:"01 Jul 2024", type:"Intern",    dob:"07 Jan 2001", gender:"Male",   blood:"A+" },
  { id:"EMP-2425", name:"Meenakshi Sundaram",   role:"Associate",        crew:"Avionics",    team:"Flight computers", reportsTo:"EMP-2412", status:"Active",   email:"meenakshi.s@agnikul.in",      phone:"+91 98401 20425", location:"Chennai · IIT-M Research Park", joined:"02 Sep 2024", type:"Intern",    dob:"16 Apr 2002", gender:"Female", blood:"B+" },
];


