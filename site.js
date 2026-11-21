const projects = {
  "ocr": {
    "title": "AI Document Processing Agent",
    "category": "AI & AUTOMATION / WORKFLOW DESIGN",
    "summary": "I designed a document intake workflow that takes files from WhatsApp and turns them into structured records for ERPNext.",
    "focus": [
      "Combined OCR, document classification and LLM extraction in the design.",
      "Planned JSON validation and human review before records enter the ERP.",
      "Designed background workers and object storage to handle processing separately from intake."
    ],
    "tags": [
      "Python",
      "FastAPI",
      "React",
      "OCR",
      "LLMs",
      "PostgreSQL",
      "Redis",
      "Docker"
    ]
  },
  "svcf": {
    "title": "SVCF",
    "category": "FINANCIAL SYSTEMS / DATA MIGRATION",
    "summary": "I worked on synchronization and reconciliation between the legacy and newer versions of a chit fund management system.",
    "focus": [
      "Investigated duplicate records, missing subscriptions, voucher mismatches and inconsistent reports.",
      "Supported development and user acceptance testing, migration planning, backups and rollback preparation."
    ],
    "tags": [
      "MongoDB",
      "SQL",
      "Linux",
      "Docker",
      "Kubernetes / k3s"
    ]
  },
  "vagai": {
    "title": "Vagai Silambam",
    "category": "MOBILE DEVELOPMENT / TRAINING MANAGEMENT",
    "summary": "I developed a mobile app that brings student records and day-to-day training operations together.",
    "focus": [
      "Built workflows for students, attendance, events, fees, uniforms and achievements.",
      "Used SQLite for app data and integrated Google Sheets for attendance."
    ],
    "tags": [
      "React Native",
      "Expo",
      "SQLite",
      "Google Sheets"
    ]
  },
  "erp": {
    "title": "White & Co",
    "category": "ERP DEVELOPMENT / ERPNEXT CUSTOMIZATION",
    "summary": "I customized how quotations move from preparation to approval in ERPNext.",
    "focus": [
      "Built approval and rejection workflows with status updates and notifications.",
      "Customized quotation print formats, PDF generation, form behaviour and role-based permissions.",
      "Explored custom API endpoints and TallyPrime integration through n8n."
    ],
    "tags": [
      "ERPNext",
      "Frappe",
      "Python",
      "JavaScript",
      "SQL",
      "MariaDB"
    ]
  },
  "rpa": {
    "title": "Sales Order Automation",
    "category": "BUSINESS AUTOMATION / UIPATH RPA",
    "summary": "I built UiPath workflows for sales order operations in SuiteCRM.",
    "focus": [
      "Automated browser navigation and form entry to reduce repetitive manual data entry."
    ],
    "tags": [
      "UiPath",
      "RPA",
      "SuiteCRM"
    ]
  },
  "images": {
    "title": "Image-Analyzer",
    "category": "IMAGE PROCESSING / FULL-STACK DEVELOPMENT",
    "summary": "I connected a React interface to a Python backend so users could process image metadata and transfer files in bulk.",
    "focus": [
      "Implemented FTP uploads supporting batches of more than 2,000 images.",
      "Connected frontend actions to backend image processing."
    ],
    "tags": [
      "React",
      "Python",
      "FTP"
    ]
  },
  "aayul": {
    "title": "Aayul-Naadi",
    "category": "CLOUD DEPLOYMENT / CLOUD HOSTING",
    "summary": "I deployed Aayul-Naadi to a cloud-hosted environment and configured its web address.",
    "focus": [
      "Configured a custom subdomain and SSL/TLS for HTTPS access."
    ],
    "tags": [
      "Cloud hosting",
      "DNS",
      "SSL/TLS"
    ]
  },
  "sync": {
    "title": "White-Sync",
    "category": "WEB & MOBILE / APPLICATION DEVELOPMENT",
    "summary": "I worked on responsive interfaces, admin dashboard designs and the Android application.",
    "focus": [
      "Developed Android features with Expo and handled UI improvements and troubleshooting.",
      "Explored Firebase Cloud Messaging for Android notifications."
    ],
    "tags": [
      "React Native",
      "Expo",
      "Firebase Cloud Messaging"
    ]
  }
};
const featured = {
  ocr: {
    problem: 'Purchase orders arrive as documents. Before entering an order into ERPNext, someone needs to identify the document, read its line items and check the values.',
    steps: [
      {title:'Incoming purchase order', rows:[['Document','PO-104 · Sample PDF'],['Item','Storage crate'],['Order','12 units at ₹500']], action:'Show extracted fields'},
      {title:'Structured extraction', rows:[['doc_type','Purchase Order'],['quantity','12'],['unit_price','500'],['line_total','6000']], action:'Check for review'},
      {title:'Ready for human review', rows:[['Order number','PO-104'],['Amount check','12 × ₹500 = ₹6,000'],['Next step','Reviewer approves before ERP entry']], action:'Restart sample'}
    ]
  },
  svcf: {
    problem: 'During migration, a voucher can appear more than once or disagree with its legacy counterpart. Those differences need investigation before the new reports can be trusted.',
    steps: [
      {title:'Compare voucher V-018', rows:[['Legacy ledger','1 entry · ₹1,250'],['Migrated ledger','2 entries · ₹2,500']], action:'Compare records'},
      {title:'Duplicate candidate', rows:[['Voucher ID','V-018 appears twice'],['Difference','₹1,250'],['Review','Check both entries against the source']], action:'View reconciliation note'},
      {title:'Reconciliation note', rows:[['Expected total','₹1,250'],['Finding','One extra matching entry'],['Next step','Verify the duplicate during UAT']], action:'Restart sample'}
    ]
  },
  vagai: {
    problem: 'Instructors need a session attendance record while managing students, fees and events across the training centre.',
    steps: [
      {title:'Evening training session', rows:[['Sample student','Participant A'],['Attendance','Unmarked']], action:'Mark present'},
      {title:'Attendance marked', rows:[['Sample student','Participant A'],['Session','Evening training'],['Status','Present']], action:'Preview attendance row'},
      {title:'Google Sheets row preview', rows:[['Student','Participant A'],['Session','Evening training'],['Attendance','Present']], action:'Restart sample'}
    ]
  }
};
const demo = document.getElementById('demo');
const demoView = document.getElementById('demo-view');
const demoNext = document.getElementById('demo-next');
let activeSteps = [];
let stepIndex = 0;

function showStep() {
  const step = activeSteps[stepIndex];
  const title = document.createElement('h4');
  title.textContent = step.title;
  const fields = document.createElement('dl');
  for (const [label, value] of step.rows) {
    const term = document.createElement('dt');
    const description = document.createElement('dd');
    term.textContent = label;
    description.textContent = value;
    fields.append(term, description);
  }
  demoView.replaceChildren(title, fields);
  demoNext.textContent = step.action;
}
demoNext.addEventListener('click', () => {
  stepIndex = (stepIndex + 1) % activeSteps.length;
  showStep();
});
function configureDemo(key) {
  const feature = featured[key];
  document.getElementById('project-problem').hidden = !feature;
  demo.hidden = !feature;
  activeSteps = feature?.steps || [];
  if (!feature) return;
  document.getElementById('problem-text').textContent = feature.problem;
  stepIndex = 0;
  showStep();
}

const dialog=document.querySelector('dialog');
dialog.setAttribute('aria-labelledby','project-title');
function writeList(id,tag,items){document.getElementById(id).replaceChildren(...items.map(text=>{const el=document.createElement(tag);el.textContent=text;return el}))}
for(const card of document.querySelectorAll('[data-project]')){
  card.addEventListener('click',()=>{
    const p=projects[card.dataset.project];
    configureDemo(card.dataset.project);
    document.getElementById('project-title').textContent=p.title;
    document.getElementById('category').textContent=p.category;
    document.getElementById('summary').textContent=p.summary;
    writeList('focus','li',p.focus);writeList('tags','span',p.tags);dialog.showModal();dialog.scrollTop=0;
  });
}
document.getElementById('close').onclick=()=>dialog.close();
dialog.onclick=e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()};
const reveal=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.add('in');reveal.unobserve(e.target)}},{threshold:.15});
document.querySelectorAll('.reveal').forEach(el=>reveal.observe(el));
