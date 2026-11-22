/* Dependency-free DOM contract checks. Not a browser/layout test.
 * Run: node scripts/test_interactions.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const site = path.resolve(__dirname,'../site');
const parser = `
import json,sys
from html.parser import HTMLParser
class P(HTMLParser):
 def __init__(self):
  super().__init__();self.root={'tag':'document','attrs':{},'children':[]};self.stack=[self.root]
 def handle_starttag(self,tag,attrs):
  node={'tag':tag,'attrs':dict(attrs),'children':[]};self.stack[-1]['children'].append(node)
  if tag not in ('meta','link','img','input','br','hr','source','wbr'):self.stack.append(node)
 def handle_endtag(self,tag):
  for i in range(len(self.stack)-1,0,-1):
   if self.stack[i]['tag']==tag:self.stack=self.stack[:i];break
 def handle_data(self,data):self.stack[-1]['children'].append(data)
p=P();p.feed(open(sys.argv[1]).read());print(json.dumps(p.root))
`;
const dash = key => key.replace(/[A-Z]/g, c=>'-'+c.toLowerCase());
class Element {
 constructor(data, parent=null) {
  this.tagName=data.tag;this.attrs={...data.attrs};this.parent=parent;this.listeners={};
  this.children=data.children.map(x=>typeof x==='string'?x:new Element(x,this));this.style={setProperty:()=>{}};
  this.dataset=new Proxy({}, {get:(_,k)=>this.attrs['data-'+dash(k)],set:(_,k,v)=>(this.attrs['data-'+dash(k)]=String(v),true)});
  this.classList={contains:x=>(this.attrs.class||'').split(' ').includes(x),add:x=>this.classList.toggle(x,true),remove:x=>this.classList.toggle(x,false),toggle:(x,on)=>{const s=new Set((this.attrs.class||'').split(' '));if(on??!s.has(x))s.add(x);else s.delete(x);this.attrs.class=[...s].join(' ');}};
 }
 get textContent(){return this.children.map(x=>typeof x==='string'?x:x.textContent).join('');}
 set textContent(x){this.children=[String(x)];}
 get hidden(){return 'hidden' in this.attrs;}set hidden(x){if(x)this.attrs.hidden='';else delete this.attrs.hidden;}
 get value(){return this._value??this.attrs.value??(this.tagName==='select'?this.querySelector('option')?.attrs.value:'');}set value(x){this._value=String(x);}
 setAttribute(k,v){this.attrs[k]=String(v);}removeAttribute(k){delete this.attrs[k];}getAttribute(k){return this.attrs[k]??null;}
 addEventListener(k,fn){(this.listeners[k]??=[]).push(fn);}
 fire(k,more={}){for(const fn of this.listeners[k]||[])fn({target:this,key:'',...more});}
 click(){if(!this.disabled)this.fire('click');}focus(){this.focused=true;}
 replaceChildren(){this.children=[];}append(x){x.parent=this;this.children.push(x);}
 contains(x){return x===this||this.children.some(c=>typeof c!=='string'&&c.contains(x));}
 matches(s){
  const attrs=[...s.matchAll(/\[([^=\]]+)(?:="([^"]*)")?\]/g)];
  if(attrs.some(([,k,v])=>!(k in this.attrs)||(v!==undefined&&this.attrs[k]!==v)))return false;
  s=s.replace(/\[[^\]]+\]/g,'');
  if(s.startsWith('#'))return this.attrs.id===s.slice(1);
  if(s.startsWith('.'))return this.classList.contains(s.slice(1));
  return !s||s===this.tagName;
 }
 querySelectorAll(selector){
  const parts=selector.trim().split(/\s+/);const out=[];
  const visit=n=>{for(const c of n.children){if(typeof c==='string')continue;let yes=c.matches(parts.at(-1));let a=c.parent;for(let i=parts.length-2;yes&&i>=0;i--){while(a&&!a.matches(parts[i]))a=a.parent;if(!a)yes=false;else a=a.parent;}if(yes)out.push(c);visit(c);}};visit(this);return out;
 }
 querySelector(s){return this.querySelectorAll(s)[0]||null;}
}
function load(file, saved='en', config={}, blockedStorage=false){
 const data=JSON.parse(execFileSync('python3',['-c',parser,path.join(site,file)],{encoding:'utf8',maxBuffer:8e6}));
 const document=new Element(data);document.documentElement=document.querySelector('html');document.body=document.querySelector('body');document.createElement=tag=>new Element({tag,attrs:{},children:[]});
 let next=0;const timers=new Map();const context={document,Intl,URL,console,navigator:{language:'en-US'},localStorage:{getItem:()=>{if(blockedStorage)throw Error();return saved;},setItem:()=>{if(blockedStorage)throw Error();}},setTimeout:fn=>{timers.set(++next,fn);return next;},clearTimeout:id=>timers.delete(id)};
 context.window={SPYDER_CONFIG:config,innerWidth:375,matchMedia:()=>({matches:false}),addEventListener:()=>{}};
 vm.runInNewContext(fs.readFileSync(path.join(site,'assets/app.js'),'utf8'),context);
 return {document,$:s=>document.querySelector(s),flush:()=>{const pending=[...timers.values()];timers.clear();for(const fn of pending)fn();}};
}
let checks=0;
const check=(condition,description)=>{assert.ok(condition,description);checks++;};
for(const lang of ['en','ru','uz']) {
  const {document,$}=load('index.html',lang);
  check(document.documentElement.lang===lang,`locale ${lang}`);
  check($('h1').textContent.length>10,`hero text ${lang}`);
  check($('#mobile-menu').hidden,'menu initially closed');
  $('.menu-btn').click();check(!$('#mobile-menu').hidden,'menu opened');
  document.fire('keydown',{key:'Escape'});check($('#mobile-menu').hidden,'Escape closes menu');
  const switched=lang==='ru'?'uz':'ru';
  $('#language').value=switched;$('#language').fire('change');
  check(document.documentElement.lang===switched,'language switch');
  check($('#year').textContent.length===4,'copyright year');
}
for(const file of fs.readdirSync(site).filter(x=>x.endsWith('.html'))){
  const {document,$}=load(file,'uz',{},true);
  check(document.documentElement.lang==='en','private storage mode fallback');
  check(!!$('h1'),`${file} HTML loaded`);
  check(!!$('a[href="https://doi.org/10.5281/zenodo.24435471"]'),`${file} DOI linked`);
}
for(const lang of ['en','ru','uz']){
  const {$}=load('coin.html',lang);
  check($('#annual-fees').textContent.includes('1') && $('#annual-fees').textContent.includes('825'),'1M tx scenario');
  $('#tx-range').value='5000000';$('#tx-range').fire('input');
  check($('#annual-fees').textContent.replace(/[^0-9]/g,'')==='9125000','5M tx fees');
  check($('#validator-fees').textContent.replace(/[^0-9]/g,'')==='8212500','validator share');
}
let d=load('download.html','en');check(d.$('[data-platform-link="ios"]').hidden,'iOS defaults disabled');
check(d.$('[data-platform-link="android"]').hidden,'Android defaults disabled');
d=load('download.html','en',{iosUrl:'javascript:alert(1)',androidUrl:'https://fake.example/app'});
check(d.$('[data-platform-link="ios"]').hidden && d.$('[data-platform-link="android"]').hidden,'invalid URLs rejected');
d=load('download.html','en',{iosUrl:'https://testflight.apple.com/join/DEMO',androidUrl:'https://play.google.com/store/apps/details?id=demo'});
check(!d.$('[data-platform-link="ios"]').hidden && !d.$('[data-platform-link="android"]').hidden,'official providers allowed');
console.log(`PASS: ${checks} network site JS DOM assertions.`);
