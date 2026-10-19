/* Run before styles so the saved appearance is applied before the first paint. */
(()=>{
  const KEY='busan-pocket-appearance-v1';
  const clean=value=>({theme:['rose','olive'].includes(value?.theme)?value.theme:'olive',mode:['light','dark','system'].includes(value?.mode)?value.mode:'light'});
  let preferences=clean(null);
  try{preferences=clean(JSON.parse(localStorage.getItem(KEY)));}catch{}
  const media=window.matchMedia('(prefers-color-scheme: dark)');
  const resolved=()=>preferences.mode==='system'?(media.matches?'dark':'light'):preferences.mode;
  function apply(){
    const mode=resolved(),root=document.documentElement;
    root.dataset.theme=preferences.theme;root.dataset.mode=mode;root.style.colorScheme=mode;
    const color=document.querySelector('meta[name="theme-color"]');
    if(color)color.content=mode==='dark'?(preferences.theme==='rose'?'#241b20':'#161e25'):(preferences.theme==='rose'?'#fff8f1':'#faf7ed');
    window.dispatchEvent(new CustomEvent('appearancechange',{detail:{...preferences,resolved:mode}}));
  }
  window.BusanAppearance={get:()=>({...preferences}),resolved,set(value){preferences=clean({...preferences,...value});let saved=true;try{localStorage.setItem(KEY,JSON.stringify(preferences));}catch{saved=false;}apply();return saved;}};
  if(media.addEventListener)media.addEventListener('change',()=>{if(preferences.mode==='system')apply();});
  else if(media.addListener)media.addListener(()=>{if(preferences.mode==='system')apply();});
  window.addEventListener('storage',event=>{if(event.key===KEY){try{preferences=clean(JSON.parse(event.newValue));}catch{preferences=clean(null);}apply();}});
  apply();
})();
