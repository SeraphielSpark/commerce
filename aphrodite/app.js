/* ============================================================
   EDIT HERE ONLY
   WHATSAPP: number orders go to (country code, no + sign)
   PRODUCTS: one line per fragrance. price is a plain number.
     aud  = who it is for (Men / Women / Kids). Unisex = both.
     type = Slides / Sandals / Platforms
     sizes = the bottle sizes it comes in
   ============================================================ */
const WHATSAPP = "2349032711601";
const BRAND    = "Aphrodite Perfumes";

const OIL  = ["3ml","6ml","10ml"];
const EDP  = ["50ml","100ml"];

/* SAMPLE ITEMS. Replace with her real scents, sizes and prices.
   img = Unsplash photo id (sample picture). c = bottle colour shown if the picture fails to load. */
const PRODUCTS = [
  { img:"1594125311687-3b1b3eafa9f4", name:"Vanilla Musk",       aud:["Women"],       type:"Perfume Oils",      price:3500,  sizes:OIL, c:"#e3c9a0", desc:"Warm, sweet and soft. An everyday favourite." },
  { img:"1709662369957-0cbf9f8452fc", name:"Oud Royale",         aud:["Men","Women"], type:"Perfume Oils",      price:4500,  sizes:OIL, c:"#6b4a2e", desc:"Deep, rich oud with strong projection." },
  { img:"1761659760494-32b921a2449f", name:"Fresh Aqua",         aud:["Men"],         type:"Perfume Oils",      price:3500,  sizes:OIL, c:"#7fb3c8", desc:"Clean, cool and fresh for daily wear." },
  { img:"1602928309809-776bf9db8658", name:"Rose Petal",         aud:["Women"],       type:"Perfume Oils",      price:3500,  sizes:OIL, c:"#d88aa0", desc:"Soft floral with a romantic finish." },
  { img:"1515377905703-c4788e51af15", name:"Amber Night",        aud:["Men","Women"], type:"Perfume Oils",      price:4000,  sizes:OIL, c:"#c9862f", desc:"Warm amber and spice for the evening." },
  { img:"1622618991746-fe6004db3a47", name:"Citrus Breeze",      aud:["Men"],         type:"Perfume Oils",      price:3500,  sizes:OIL, c:"#d9c64a", desc:"Bright citrus that wakes you up." },
  { img:"1615634260167-c8cdede054de", name:"Sweet Berry",        aud:["Women"],       type:"Perfume Oils",      price:3500,  sizes:OIL, c:"#9a3d62", desc:"Fruity, playful and long-lasting." },
  { img:"1638295916768-459f6cf440bc", name:"Designer for Her",   aud:["Women"],       type:"Designer Perfumes", price:25000, sizes:EDP, c:"#e6b9c6", desc:"Authentic designer perfume. Sample listing." },
  { img:"1573575154488-f88a60e170df", name:"Designer for Him",   aud:["Men"],         type:"Designer Perfumes", price:25000, sizes:EDP, c:"#3f5568", desc:"Authentic designer perfume. Sample listing." },
  { img:"1760920250029-36af9369a0bb", name:"Designer Unisex",    aud:["Men","Women"], type:"Designer Perfumes", price:28000, sizes:EDP, c:"#8fb0a3", desc:"Authentic designer perfume. Sample listing." }
];
/* ================== nothing to edit below ================== */

const $ = id => document.getElementById(id);
const U = (id,w) => "https://images.unsplash.com/photo-"+id+"?auto=format&fit=crop&w="+w+"&h="+w+"&q=70";
const PIC = (id,w,alt) => '<img loading="lazy" src="'+U(id,w)+'" alt="'+(alt||"")+'" onerror="this.remove()">';
const naira = n => "₦" + Number(n).toLocaleString("en-NG");
const wa = t => "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(t);
const label = p => p.aud.length > 1 ? "Unisex" : p.aud[0];
const ICON = {
  cart:'<svg viewBox="0 0 24 24"><path d="M3 4h2.500l2.200 11h10.300l2-8H7"/><circle cx="9.500" cy="19" r="1.400"/><circle cx="17" cy="19" r="1.400"/></svg>',
  heart:'<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.600-7 10-7 10z"/></svg>'
};
const load = (k,d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch(e){ return d; } };
const save = (k,v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };
let toastT; const toast = m => { const t=$("toast"); t.textContent=m; t.classList.add("on"); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove("on"),1800); };

/* ---------- pages ---------- */
const PAGE = document.body.dataset.page || "home";
const QS = new URLSearchParams(location.search);
const shopUrl = o => { const u = new URLSearchParams(); Object.entries(o).forEach(([k,v]) => { if (v) u.set(k,v); }); const q = u.toString(); return "shop.html" + (q ? "?"+q : ""); };
document.querySelectorAll("#catbar a[data-v]").forEach(a => a.classList.toggle("on", a.dataset.v === PAGE));

/* ---------- filtering ---------- */
const F = PAGE==="shop" ? { aud:QS.get("aud")||"All", type:QS.get("type")||null, q:QS.get("q")||"", wish:QS.get("wish")==="1" } : { aud:"All", type:null, q:"", wish:false };
let wish = load("aph_wish", []);
function matches(p){
  if (F.wish && !wish.includes(p.name)) return false;
  if (F.aud === "Unisex" && p.aud.length < 2) return false;
  if (!["All","Unisex"].includes(F.aud) && !p.aud.includes(F.aud)) return false;
  if (F.type && p.type !== F.type) return false;
  if (F.q){ const s=(p.name+" "+p.type+" "+p.aud.join(" ")+" "+p.desc).toLowerCase(); if (!F.q.toLowerCase().split(/\s+/).every(w=>s.includes(w))) return false; }
  return true;
}
function setFilter(patch){
  Object.assign(F, patch);
  if (PAGE !== "shop"){ location.href = shopUrl({ aud:F.aud!=="All" && F.aud, type:F.type, q:F.q, wish:F.wish && "1" }); return; }
  renderPills(); render();
}
function renderPills(){
  const el = $("pills"); if (!el) return; el.innerHTML = "";
  ["All","Women","Men","Unisex"].forEach(a => {
    const b = document.createElement("button"); b.type="button"; b.textContent=({Women:"For Her",Men:"For Him"})[a]||a; if (F.aud===a) b.className="on";
    b.onclick = () => setFilter({aud:a}); el.appendChild(b);
  });
  const extra = [F.type, F.q && ('"'+F.q+'"'), F.wish && "Wishlist"].filter(Boolean);
  if (extra.length){
    const b = document.createElement("button"); b.type="button"; b.className="clear";
    b.textContent = "Showing " + extra.join(", ") + " · clear";
    b.onclick = () => { $("q").value=""; setFilter({type:null,q:"",wish:false}); }; el.appendChild(b);
  }
  document.querySelectorAll(".tile").forEach(t => t.classList.toggle("on", t.dataset.k==="aud" ? F.aud===t.dataset.n && !F.type : F.type===t.dataset.n));
  document.querySelectorAll("#catbar a[data-aud]").forEach(a => a.classList.toggle("on", F.aud===a.dataset.aud));
  document.querySelectorAll("#catbar a[data-type]").forEach(a => a.classList.toggle("on", F.type===a.dataset.type));
}
function render(){
  const g = $("grid"); if (!g) return; g.innerHTML = "";
  let list = PRODUCTS.map((p,i)=>[p,i]).filter(([p])=>matches(p));
  if (+g.dataset.limit) list = list.slice(0, +g.dataset.limit);
  if (!list.length){ g.innerHTML = '<div class="empty">No fragrance matches that yet. Clear the filter to see everything.</div>'; return; }
  list.forEach(([p,i]) => {
    const c = document.createElement("article"); c.className = "card";
    c.innerHTML = '<div class="ph"><div class="bt" style="--c:'+p.c+'"></div>'+PIC(p.img,600,p.name) +
      '<button class="heart'+(wish.includes(p.name)?' on':'')+'" type="button" aria-label="Add to wishlist">'+ICON.heart+'</button></div>' +
      '<div class="cb"><div class="tag">'+label(p)+' · '+p.type+'</div><div class="nm">'+p.name+'</div><div class="pr">'+naira(p.price)+'</div>' +
      '<div class="ds">'+p.desc+'</div><button class="btn o" type="button">'+ICON.cart+' Add to Cart</button></div>';
    c.querySelector(".heart").onclick = e => {
      wish = wish.includes(p.name) ? wish.filter(n=>n!==p.name) : wish.concat(p.name);
      save("aph_wish", wish); updateBadges(); e.currentTarget.classList.toggle("on");
      if (F.wish) render();
    };
    c.querySelector(".btn").onclick = () => openAdd(i);
    g.appendChild(c);
  });
}

/* tiles */
[["For Her","aud","Women","#d88aa0","1615634260830-85d92cd1b769"],["For Him","aud","Men","#3f5568","1733660227168-444e3c751a1e"],["Unisex","aud","Unisex","#8fb0a3","1571206508927-2ef3026ada5d"],
 ["Perfume Oils","type","Perfume Oils","#c9a24b","1709662217788-6a8a1b31562a"],["Designer Perfumes","type","Designer Perfumes","#7b2d55","1458538977777-0549b2370168"],["Wholesale","go","contact","#6b4a2e","1709660274775-75c47120ec0c"]].forEach(([lab,k,n,c,im]) => {
  const a = document.createElement("a"); a.className="tile"; a.href = k==="go" ? "contact.html" : shopUrl(k==="aud" ? {aud:n} : {type:n});
  a.innerHTML = '<div class="tb"><div class="bt" style="--c:'+c+'"></div>'+PIC(im,400)+'</div><b>'+lab+'<span>&rarr;</span></b>';
  a.dataset.k = k; a.dataset.n = n;
  if ($("tiles")) $("tiles").appendChild(a);
});
if ($("seeAll") && PAGE==="shop") $("seeAll").onclick = e => { e.preventDefault(); $("q").value=""; history.replaceState(null,"","shop.html"); setFilter({aud:"All",type:null,q:"",wish:false}); };
if (PAGE==="shop" && F.q) $("q").value = F.q;
$("searchForm").onsubmit = e => { e.preventDefault(); setFilter({q:$("q").value.trim(),wish:false}, true); };
$("wishBtn").onclick = () => { if (!wish.length){ toast("Your wishlist is empty. Tap the heart on a fragrance."); return; } setFilter({wish:true,aud:"All",type:null,q:""}, true); };

/* ---------- cart ---------- */
let cart = load("aph_cart", []).filter(x => PRODUCTS[x.i]);
const cartTotal = () => cart.reduce((s,x)=>s+PRODUCTS[x.i].price*x.qty,0);
function updateBadges(){
  $("cartN").textContent = cart.reduce((s,x)=>s+x.qty,0);
  $("wishN").textContent = wish.length; $("wishN").hidden = !wish.length;
}
function showLayer(id){ $(id).classList.add("on"); document.body.style.overflow="hidden"; }
function closeAll(){ document.querySelectorAll(".shade").forEach(s=>s.classList.remove("on")); document.body.style.overflow=""; }
document.querySelectorAll("[data-close]").forEach(b => b.onclick = closeAll);
document.querySelectorAll(".shade").forEach(s => s.addEventListener("click", e => { if (e.target===s) closeAll(); }));
document.addEventListener("keydown", e => { if (e.key==="Escape") closeAll(); });

let adding = null;
function openAdd(i){
  adding = i; const p = PRODUCTS[i];
  $("aImg").style.setProperty("--c",p.c); $("aPic").style.display=""; $("aPic").src=U(p.img,160); $("aName").textContent=p.name; $("aPrice").textContent=naira(p.price)+" each";
  $("aSize").innerHTML = '<option value="">Choose size</option>'+p.sizes.map(s=>'<option>'+s+'</option>').join("")+'<option>Not sure, please advise</option>';
  $("aQty").value=1; $("aColour").value=""; $("aErr").textContent=""; showLayer("addShade");
}
$("addForm").onsubmit = e => {
  e.preventDefault();
  const size=$("aSize").value; if (!size){ $("aErr").textContent="Please choose your size."; $("aSize").focus(); return; }
  const qty=Math.min(20,Math.max(1,parseInt($("aQty").value,10)||1)), colour=$("aColour").value.trim()||"None";
  const same=cart.find(x=>x.i===adding&&x.size===size&&x.colour===colour);
  if (same) same.qty+=qty; else cart.push({i:adding,size,colour,qty});
  save("aph_cart",cart); updateBadges(); closeAll(); renderCart(); showLayer("cartShade");
};
function renderCart(){
  const b=$("cartBody"); b.innerHTML="";
  if (!cart.length) b.innerHTML='<div class="empty">Your cart is empty.</div>';
  cart.forEach((x,k) => {
    const p=PRODUCTS[x.i], d=document.createElement("div"); d.className="li";
    d.innerHTML='<div class="thumb"><div class="bt sm" style="--c:'+p.c+'"></div>'+PIC(p.img,160)+'</div><div class="m"><b>'+p.name+'</b><span>'+x.size+(x.colour!=="None"?' · '+x.colour:'')+'</span>'+
      '<div class="qty"><button type="button" aria-label="Less">−</button><i>'+x.qty+'</i><button type="button" aria-label="More">+</button></div></div>'+
      '<div class="r">'+naira(p.price*x.qty)+'<button type="button">Remove</button></div>';
    const [less,more]=d.querySelectorAll(".qty button");
    less.onclick=()=>{ x.qty--; if(x.qty<1) cart.splice(k,1); done(); };
    more.onclick=()=>{ if(x.qty<20) x.qty++; done(); };
    d.querySelector(".r button").onclick=()=>{ cart.splice(k,1); done(); };
    b.appendChild(d);
  });
  $("cartTotal").textContent=naira(cartTotal()); $("checkoutBtn").disabled=!cart.length; $("checkoutBtn").style.opacity=cart.length?1:.5;
  function done(){ save("aph_cart",cart); updateBadges(); renderCart(); }
}
$("cartBtn").onclick = () => { renderCart(); showLayer("cartShade"); };
$("checkoutBtn").onclick = () => {
  if (!cart.length) return;
  $("outSum").innerHTML = cart.map(x=>'<div><span>'+x.qty+' × '+PRODUCTS[x.i].name+' ('+x.size+')</span><b>'+naira(PRODUCTS[x.i].price*x.qty)+'</b></div>').join("") +
    '<div style="border-top:1px solid var(--line);margin-top:6px;padding-top:6px"><span>Total</span><b>'+naira(cartTotal())+'</b></div>';
  $("oErr").textContent=""; closeAll(); showLayer("outShade");
};
$("outForm").onsubmit = e => {
  e.preventDefault();
  const v = id => $(id).value.trim();
  for (const [id,l] of [["oName","your full name"],["oPhone","your phone number"],["oAddr","your delivery address"],["oCity","your city"],["oState","your state"]]){
    if (!v(id)){ $("oErr").textContent="Please fill in "+l+"."; $(id).focus(); return; }
  }
  const L = ["*NEW ORDER - "+BRAND+"*",""];
  cart.forEach((x,k) => { const p=PRODUCTS[x.i];
    L.push("*"+(k+1)+". "+p.name+"*","   Size: "+x.size,"   Request: "+x.colour,"   Quantity: "+x.qty,"   Price: "+naira(p.price)+" each","   Subtotal: "+naira(p.price*x.qty),""); });
  L.push("*TOTAL:* "+naira(cartTotal())+" (delivery not included)","",
         "*Name:* "+v("oName"),"*Phone:* "+v("oPhone"),"*Address:* "+v("oAddr"),"*City / State:* "+v("oCity")+", "+v("oState"));
  if (v("oNote")) L.push("","*Message:* "+v("oNote"));
  L.push("","Please confirm my order and the delivery fee.");
  window.open(wa(L.join("\n")), "_blank");
  cart = []; save("aph_cart",cart); updateBadges(); closeAll(); toast("Your order has opened in WhatsApp. Press send there.");
};

/* ---------- contact ---------- */
const pretty = "+" + WHATSAPP.replace(/^(\d{3})(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3 $4");
const hello = wa("Good day. I have a question about " + BRAND + ".");
$("floatLink").href = hello;
$("topTel").textContent = pretty; $("topTel").href = hello; $("topTel").target = "_blank";
if ($("telLink")){ $("telLink").textContent = pretty; $("telLink").href = hello; $("telLink").target = "_blank"; }
if ($("contactForm")) $("contactForm").onsubmit = e => {
  e.preventDefault();
  const n=$("cName").value.trim(), m=$("cMsg").value.trim();
  if (!n){ $("cErr").textContent="Please enter your name."; $("cName").focus(); return; }
  if (!m){ $("cErr").textContent="Please write your message."; $("cMsg").focus(); return; }
  $("cErr").textContent=""; window.open(wa("Good day, my name is "+n+".\n\n"+m), "_blank");
};

renderPills(); render(); updateBadges();
