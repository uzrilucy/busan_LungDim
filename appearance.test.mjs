import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const code=readFileSync(new URL('./appearance.js',import.meta.url),'utf8');
function boot(saved=null,dark=false,blocked=false){
 const memory=new Map(saved?[['busan-pocket-appearance-v1',JSON.stringify(saved)]]:[]),events={},root={dataset:{},style:{}},meta={};
 const media={matches:dark,addEventListener(_,cb){this.listener=cb;}};
 const window={matchMedia:()=>media,addEventListener(name,cb){events[name]=cb;},dispatchEvent(e){events[e.type]?.(e);}};
 const localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>{if(blocked)throw Error('blocked');memory.set(k,v);}};
 const document={documentElement:root,querySelector:()=>meta};
 runInNewContext(code,{window,document,localStorage,CustomEvent:class{constructor(type,init){this.type=type;this.detail=init.detail;}}});
 return {api:window.BusanAppearance,root,meta,memory,media,events};
}
test('default palette is olive light, saved appearance applies before rendering',()=>{const a=boot();assert.equal(a.root.dataset.theme,'olive');assert.equal(a.root.dataset.mode,'light');const b=boot({theme:'rose',mode:'dark'});assert.equal(b.root.dataset.theme,'rose');assert.equal(b.root.dataset.mode,'dark');assert.equal(b.root.style.colorScheme,'dark');assert.equal(b.meta.content,'#241b20');});
test('theme and mode choices persist independently across reloads',()=>{const a=boot();a.api.set({theme:'rose'});a.api.set({mode:'dark'});const stored=JSON.parse(a.memory.get('busan-pocket-appearance-v1'));assert.equal(stored.theme,'rose');assert.equal(stored.mode,'dark');const b=boot(stored);assert.equal(b.root.dataset.theme,'rose');assert.equal(b.root.dataset.mode,'dark');assert.equal(a.memory.has('busan-pocket-v1'),false);});
test('system mode follows device changes, explicit light stays light',()=>{const a=boot({theme:'olive',mode:'system'},true);assert.equal(a.root.dataset.mode,'dark');a.media.matches=false;a.media.listener();assert.equal(a.root.dataset.mode,'light');a.api.set({mode:'light'});a.media.matches=true;a.media.listener();assert.equal(a.root.dataset.mode,'light');});
test('bad imported preferences are normalized and storage refusal still changes appearance',()=>{const a=boot({theme:'<script>',mode:'none'});assert.equal(a.root.dataset.theme,'olive');assert.equal(a.root.dataset.mode,'light');const b=boot(null,false,true);assert.equal(b.api.set({theme:'rose',mode:'dark'}),false);assert.equal(b.root.dataset.theme,'rose');assert.equal(b.root.dataset.mode,'dark');});
test('cross-tab updates apply both preferences',()=>{const a=boot();a.events.storage({key:'busan-pocket-appearance-v1',newValue:JSON.stringify({theme:'rose',mode:'dark'})});assert.equal(a.root.dataset.theme,'rose');assert.equal(a.root.dataset.mode,'dark');});
const css=readFileSync(new URL('./themes.css',import.meta.url),'utf8');
const lum=hex=>{const a=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*a[0]+.7152*a[1]+.0722*a[2];};
const contrast=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
for(const theme of ['rose','olive'])for(const mode of ['light','dark'])test(`${theme} ${mode}: body, secondary text, buttons and banner meet 4.5:1 contrast`,()=>{
 const block=css.match(new RegExp('\\[data-theme="'+theme+'"\\]\\[data-mode="'+mode+'"\\]\\s*\\{([^}]+)'))?.[1];assert.ok(block);
 const vars=Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[a-fA-F0-9]{6})(?:;|\s)/g)].map(m=>[m[1],m[2]]));
 for(const [a,b] of [['ink','cream'],['ink','white'],['muted','white'],['on-primary','primary-fill'],['hero-ink','hero-a'],['hero-ink','hero-b'],['feature-ink','feature-bg']])assert.ok(contrast(vars[a],vars[b])>=4.5,`${a}/${b}: ${contrast(vars[a],vars[b]).toFixed(2)}`);
});
