/* FolioVerse starter app
   For real online accounts and cloud storage, add your Supabase URL and anon key below.
   Never put a service_role key in browser code. */
const SUPABASE_URL = ""; // e.g. https://jfthxhwiyxrhkthczjoy.supabase.co
const SUPABASE_ANON_KEY = ""; // sb_publishable_RmXBZjPN5_AWBYQPAQHVfQ_GHkALK4t
let supabaseClient = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

const $ = (id) => document.getElementById(id);
const state = { page: "home", user: null, authMode: "login", editingId: null, selectedTemplate: "modern", draft: null, portfolios: [], photoData: "" };
const templates = [
  { id: "simple", name: "Simple", tagline: "Clean & Professional", description: "A timeless layout with clear sections and plenty of space.", button: "Choose Simple" },
  { id: "modern", name: "Modern", tagline: "Bold & Modern", description: "A sleek dark layout with glowing accents and project cards.", button: "Choose Modern" },
  { id: "creative", name: "Creative", tagline: "Expressive & Unique", description: "A vibrant, asymmetrical design for creative personalities.", button: "Choose Creative" }
];
const sample = { fullName:"Jordan Davis", jobTitle:"Web Developer & Designer", email:"jordan@example.com", phone:"+63 912 345 6789", address:"Cebu City, Philippines", photo:"", about:"I'm a passionate developer who loves creating beautiful and functional digital experiences. I enjoy learning new technologies and building projects that make an impact.", education:"BS Information Technology — University Student", skills:"HTML, CSS, JavaScript, UI/UX Design, Communication", projects:"Portfolio Website — Designed and built a responsive personal website.\\nTask Manager — Created a task tracking app.", experience:"Student Developer — Personal Projects (2025–Present)", website:"", github:"" };
function safe(value="") { return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function toast(message) { const el=$("toast"); el.textContent=message; el.classList.add("show"); clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove("show"),2800); }
function go(page) {
  if (["editor","select","preview"].includes(page) && !state.user) { state.pageAfterLogin=page; page="login"; }
  if (page==="editor" && !state.user) { state.pageAfterLogin="editor"; page="login"; }
  state.page=page;
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  const target=$("page-"+page); if(target) target.classList.add("active");
  document.querySelectorAll(".nav-link").forEach(a=>a.classList.toggle("active",a.dataset.page===page));
  $("mainNav").classList.remove("open");
  if(page==="portfolio") renderPortfolios();
  if(page==="templates") renderTemplateGrid("templateGrid",false);
  if(page==="select") renderTemplateGrid("selectGrid",true);
  if(page==="preview") renderPreview();
  window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll("[data-page]").forEach(el=>el.addEventListener("click",e=>{e.preventDefault();go(el.dataset.page)}));
document.querySelectorAll("[data-go]").forEach(el=>el.addEventListener("click",()=>go(el.dataset.go)));
$("menuToggle").addEventListener("click",()=>$("mainNav").classList.toggle("open"));
["createBtn","heroCreate","featureCreate","newPortfolioBtn","emptyCreate"].forEach(id=>$(id).addEventListener("click",()=>startNew()));
$("loginBtn").addEventListener("click",()=>showAuth("login"));
$("switchAuth").addEventListener("click",()=>showAuth(state.authMode==="login"?"signup":"login"));
function showAuth(mode){state.authMode=mode;$("authTitle").textContent=mode==="login"?"Log in to FolioVerse":"Create your account";$("authSubtitle").textContent=mode==="login"?"Your portfolio journey continues here.":"Start building a portfolio that feels like you.";$("authSubmit").textContent=mode==="login"?"Log In →":"Create Account →";$("authSwitch").innerHTML=mode==="login"?'New to FolioVerse? <button type="button" id="switchAuth">Create an account</button>':'Already have an account? <button type="button" id="switchAuth">Log in</button>';$("switchAuth").addEventListener("click",()=>showAuth(state.authMode==="login"?"signup":"login"));go("login");}
async function loadCloudPortfolios(){
 if(!supabaseClient||!state.user)return false;
 const {data,error}=await supabaseClient.from("portfolios").select("*").eq("user_id",state.user.id).order("updated_at",{ascending:false});
 if(error){console.error(error);toast("Could not load cloud portfolios. Check your Supabase setup.");return false;}
 state.portfolios=(data||[]).map(row=>({...row.data,id:row.id,template:row.template,updatedAt:row.updated_at,cloud:true}));return true;
}
$("authForm").addEventListener("submit",async e=>{
 e.preventDefault();const email=$("authEmail").value.trim(),password=$("authPassword").value;
 if(supabaseClient){
  const result=state.authMode==="login"?await supabaseClient.auth.signInWithPassword({email,password}):await supabaseClient.auth.signUp({email,password});
  if(result.error){toast(result.error.message);return;}
  state.user=result.data.user;if(!state.user){toast("Check your email to confirm your account.");return;}
  await loadCloudPortfolios();toast(state.authMode==="login"?"Logged in successfully.":"Account created. Check your email if confirmation is enabled.");
 }else{
  state.user={id:"demo-user",email};toast("Demo login active. Add Supabase keys for secure online accounts.");
 }
 $("loginBtn").textContent="Account";
 go(state.pageAfterLogin||"portfolio");state.pageAfterLogin=null;
});
if(supabaseClient){supabaseClient.auth.getSession().then(async({data})=>{if(data.session){state.user=data.session.user;await loadCloudPortfolios();}});}
function startNew(){
 if(!state.user){state.pageAfterLogin="editor";showAuth("login");toast("Please log in before creating a portfolio.");return;}
 state.editingId=null;state.draft={...sample};fillForm(state.draft);$("editorTitle").textContent="Create your portfolio";go("editor");
}
function fillForm(data){
 state.photoData=data.photo||"";
 for(const key of Object.keys(sample)){if(key==="photo")continue;const el=$(key);if(el)el.value=data[key]||"";}
 $("photo").value=""; updatePhotoPreview(state.photoData);
}
function updatePhotoPreview(src){
 const wrap=$("photoPreviewWrap"),img=$("photoPreviewImage");
 if(src){img.src=src;wrap.classList.remove("hidden");}else{img.removeAttribute("src");wrap.classList.add("hidden");}
}
$("photo").addEventListener("change",()=>{
 const file=$("photo").files&&$("photo").files[0];if(!file)return;
 if(!file.type.startsWith("image/")){toast("Please choose an image file.");$("photo").value="";return;}
 if(file.size>2*1024*1024){toast("Please choose an image smaller than 2 MB.");$("photo").value="";return;}
 const reader=new FileReader();reader.onload=()=>{state.photoData=String(reader.result||"");updatePhotoPreview(state.photoData);toast("Profile picture selected.");};reader.onerror=()=>toast("Could not read that image. Please try another file.");reader.readAsDataURL(file);
});
$("removePhotoBtn").addEventListener("click",()=>{state.photoData="";$("photo").value="";updatePhotoPreview("");toast("Profile picture removed.");});
function readForm(){const data={};for(const key of Object.keys(sample)){if(key==="photo"){data.photo=state.photoData||"";continue;}const el=$(key);data[key]=el?el.value.trim():"";}return data;}
function validFullName(name){return /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ '’\-]*$/.test(name.trim()) && !/[0-9@]/.test(name);}
function validEmail(email){return /^[A-Za-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/.test(email.trim());}
$("portfolioForm").addEventListener("submit",e=>{e.preventDefault();state.draft=readForm();if(!state.draft.fullName||!state.draft.email||!state.draft.about){toast("Please complete the required fields.");return;}if(!validFullName(state.draft.fullName)){$("fullName").focus();toast("Full name must contain letters only. Numbers and @ are not allowed.");return;}if(!validEmail(state.draft.email)){$("email").focus();toast("Please enter a valid email address, such as name@example.com.");return;}go("select");});
function renderTemplateGrid(targetId,selectMode){
 const grid=$(targetId);if(!grid)return;
 grid.innerHTML=templates.map(t=>`<article class="template-card"><div class="template-art ${t.id}"><div class="art-nav"></div><div class="art-heading">${t.id==="creative"?"Creative<br><em>Developer.</em>":t.id==="modern"?"Hello, I'm<br><em>Jordan Davis.</em>":"Hello, I'm<br><em>Jordan Davis.</em>"}</div><div class="art-sub"></div><div class="art-photo">${t.id==="creative"?"JD":"JD"}</div><div class="art-cards"><i></i><i></i><i></i></div></div><div class="template-info"><h3>${t.name}</h3><p>${t.description}</p><div class="template-actions"><button class="btn btn-outline" data-template-preview="${t.id}">Preview</button><button class="btn ${state.selectedTemplate===t.id?"btn-primary":"btn-outline"}" data-template-select="${t.id}">${selectMode?(state.selectedTemplate===t.id?"✓ Selected":"Select"):t.button}</button></div></div></article>`).join("");
 grid.querySelectorAll("[data-template-select]").forEach(btn=>btn.addEventListener("click",()=>{state.selectedTemplate=btn.dataset.templateSelect;renderTemplateGrid(targetId,selectMode);if($("selectedMessage"))$("selectedMessage").textContent="Selected: "+templates.find(t=>t.id===state.selectedTemplate).name;toast(templates.find(t=>t.id===state.selectedTemplate).name+" template selected.");}));
 grid.querySelectorAll("[data-template-preview]").forEach(btn=>btn.addEventListener("click",()=>{state.selectedTemplate=btn.dataset.templatePreview;if(!state.draft)state.draft={...sample};go("preview");}));
}
function renderHome(){renderTemplateGrid("homeTemplateGrid",false)}
function templateClass(id){return id==="modern"?"theme-modern":id==="creative"?"theme-creative":"theme-simple"}
function renderPreview(){
 const d=state.draft||sample,t=templates.find(x=>x.id===state.selectedTemplate)||templates[1];
 $("previewTemplateName").textContent=t.name+" Template";
 const skills=(d.skills||"").split(",").map(s=>s.trim()).filter(Boolean);
 const projects=(d.projects||"").split(/\n|;/).map(s=>s.trim()).filter(Boolean);
 const education=(d.education||"").split(/\n|;/).map(s=>s.trim()).filter(Boolean);
 const experience=(d.experience||"").split(/\n|;/).map(s=>s.trim()).filter(Boolean);
 const initials=(d.fullName||"JD").split(/\s+/).slice(0,2).map(n=>n[0]).join("").toUpperCase();
 const photo=d.photo&&/^(https?:\/\/|data:image\/)/i.test(d.photo)?`<img src="${safe(d.photo)}" alt="Profile photo" onerror="this.remove()">`:safe(initials);
 $("portfolioPreview").innerHTML=`<div class="portfolio-site ${templateClass(t.id)}"><div class="site-nav"><b>${safe(d.fullName||"Your Name")}</b><span>ABOUT　 SKILLS　 PROJECTS　 CONTACT</span></div><div class="site-hero"><div><div class="eyebrow">HELLO, I'M</div><h2>${safe(d.fullName||"Your Name")}<br><span>${safe(d.jobTitle||"Creative Professional")}</span></h2><p class="site-copy">${safe(d.about||"Write a short introduction about yourself.")}</p><p>${safe(d.email||"your@email.com")} ${d.phone?" · "+safe(d.phone):""}</p>${d.website?`<p><a href="${safe(d.website)}" target="_blank" rel="noopener">Visit my website ↗</a></p>`:""}</div><div class="site-photo">${photo}</div></div><div class="site-section"><h3>About & Education</h3><p class="site-copy">${safe(d.address||"")} ${education.map(safe).join(" · ")}</p></div><div class="site-section"><h3>My Skills</h3><div class="site-pills">${(skills.length?skills:["Add your skills"]).map(s=>`<span>${safe(s)}</span>`).join("")}</div></div><div class="site-section"><h3>Selected Projects</h3><div class="site-bottom">${(projects.length?projects:["Your first project"]).slice(0,6).map(p=>`<div class="site-project">✦<br><b>${safe(p.split("—")[0].slice(0,70))}</b><p>${safe(p.includes("—")?p.split("—").slice(1).join("—"):"Project description")}</p></div>`).join("")}</div></div><div class="site-section"><h3>Experience</h3><p class="site-copy">${experience.map(safe).join(" · ")||"Add your experience here."}</p>${d.github?`<p><a href="${safe(d.github)}" target="_blank" rel="noopener">GitHub ↗</a></p>`:""}</div></div>`;
}
$("changeTemplateBtn").addEventListener("click",()=>go("select"));
$("previewBtn").addEventListener("click",()=>go("preview"));
$("savePortfolioBtn").addEventListener("click",savePortfolio);
async function savePortfolio(){
 if(!state.user){showAuth("login");toast("Please log in first.");return;}
 if(!state.draft){toast("Please enter your portfolio information first.");go("editor");return;}
 const now=new Date().toISOString();
 if(supabaseClient&&state.user.id!=="demo-user"){
  const row={user_id:state.user.id,title:state.draft.fullName,template:state.selectedTemplate,data:state.draft,updated_at:now};
  let result;
  if(state.editingId)result=await supabaseClient.from("portfolios").update(row).eq("id",state.editingId).eq("user_id",state.user.id);
  else result=await supabaseClient.from("portfolios").insert(row);
  if(result.error){toast("Save failed: "+result.error.message);return;}
  await loadCloudPortfolios();
 }else{
  const item={id:state.editingId||String(Date.now()),...state.draft,template:state.selectedTemplate,updatedAt:now};
  const idx=state.portfolios.findIndex(p=>p.id===item.id);
  if(idx>=0)state.portfolios[idx]=item;else state.portfolios.unshift(item);
  try{localStorage.setItem("folioverse-demo-portfolios",JSON.stringify(state.portfolios));}catch(e){}
 }
 toast("Portfolio saved successfully.");go("portfolio");
}
function renderPortfolios(){
 if(!supabaseClient){try{const saved=JSON.parse(localStorage.getItem("folioverse-demo-portfolios")||"[]");if(saved.length)state.portfolios=saved;}catch(e){}}
 const grid=$("portfolioGrid");
 $("emptyState").classList.toggle("hidden",state.portfolios.length>0);grid.classList.toggle("hidden",state.portfolios.length===0);
 grid.innerHTML=state.portfolios.map(p=>`<article class="saved-card"><div class="saved-thumb ${safe(p.template||"simple")}"><span>${safe((p.template||"simple").toUpperCase())} TEMPLATE</span><h3>${safe(p.fullName||p.data?.fullName||"Untitled Portfolio")}</h3><i>${safe((p.fullName||p.data?.fullName||"JD").split(/\s+/).slice(0,2).map(n=>n[0]).join(""))}</i></div><h3>${safe(p.fullName||p.data?.fullName||p.title||"Untitled Portfolio")}</h3><p>${safe((p.jobTitle||p.data?.jobTitle||"Portfolio"))} · ${new Date(p.updatedAt||p.updated_at||Date.now()).toLocaleDateString()}</p><div class="saved-actions"><button class="btn btn-outline" data-view="${safe(p.id)}">View</button><button class="btn btn-outline" data-edit="${safe(p.id)}">Edit</button><button class="btn btn-outline" data-delete="${safe(p.id)}">Delete</button></div><button class="btn btn-outline" style="width:100%;margin-top:7px" data-change="${safe(p.id)}">Change Template</button></article>`).join("");
 grid.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>{const p=findPortfolio(b.dataset.view);loadPortfolio(p);go("preview")}));
 grid.querySelectorAll("[data-edit]").forEach(b=>b.addEventListener("click",()=>{const p=findPortfolio(b.dataset.edit);loadPortfolio(p);state.editingId=p.id;$("editorTitle").textContent="Edit your portfolio";fillForm(state.draft);go("editor")}));
 grid.querySelectorAll("[data-change]").forEach(b=>b.addEventListener("click",()=>{const p=findPortfolio(b.dataset.change);loadPortfolio(p);state.editingId=p.id;go("select")}));
 grid.querySelectorAll("[data-delete]").forEach(b=>b.addEventListener("click",async()=>{if(!confirm("Delete this portfolio? This cannot be undone."))return;const id=b.dataset.delete;if(supabaseClient&&state.user.id!=="demo-user"){const {error}=await supabaseClient.from("portfolios").delete().eq("id",id).eq("user_id",state.user.id);if(error){toast(error.message);return;}await loadCloudPortfolios();}else{state.portfolios=state.portfolios.filter(p=>p.id!==id);localStorage.setItem("folioverse-demo-portfolios",JSON.stringify(state.portfolios));}renderPortfolios();toast("Portfolio deleted.");}));
}
function findPortfolio(id){return state.portfolios.find(p=>String(p.id)===String(id))}
function loadPortfolio(p){if(!p)return;state.editingId=p.id;state.selectedTemplate=p.template||"modern";state.draft={...sample,...(p.data||p)};fillForm(state.draft)}
renderHome();
