export const categories=['교통','숙박','식비','관광·체험','쇼핑','기타'];
const raw=[
['24','05:00','24','05:50','경부고터 이동','교통','버스'],
['24','06:00','24','06:50','아침 & 부랑자','식비','커피'],
['24','07:00','24','11:00','부산 이동','교통','버스'],
['24','11:15','24','12:00','숙소 이동','교통','택시'],
['24','12:00','24','12:30','짐 풀고 해파리 시간','숙박','휴식'],
['24','12:40','24','13:10','숙소에서 해운대 이동','교통','택시'],
['24','13:10','24','14:00','점심 먹고 감금 출발','식비','식사'],
['24','14:00','24','18:00','스파랜드 감금 & 석방','관광·체험','스파'],
['24','18:10','24','19:00','저녁 연료 섭취…','식비','식사'],
['24','19:30','24','20:30','바다 위 부랑자','관광·체험','유람선'],
['24','20:30','24','21:00','숙소 귀환','교통','택시'],
['24','21:00','25','09:00','솔직히 죽을 듯?','숙박','휴식'],
['25','09:00','25','10:00','소생 + 체크아웃','숙박','체크아웃'],
['25','10:00','25','10:30','해운대 이동','교통','택시'],
['25','10:30','25','10:50','짐 맡기기','기타','보관'],
['25','11:00','25','12:00','점심 ♡','식비','식사'],
['25','12:30','25','15:00','아쿠아리움','관광·체험','아쿠아리움'],
['25','15:30','25','16:00','요트','관광·체험','요트'],
['25','16:00','25','17:10','자유시간','기타','자유'],
['25','18:00','25','22:00','기절하며 귀환','교통','버스']];
export const stamp=(s)=>Date.parse(s+'+09:00');
export function initial(){return {version:1,budget:0,categoryBudgets:{},expenses:[],alerts:false,events:raw.map((r,i)=>({id:'s'+i,start:`2026-10-${r[0]}T${r[1]}`,end:`2026-10-${r[2]}T${r[3]}`,title:r[4],category:r[5],tag:r[6],note:i===11?'원본의 “다음 날 아침”을 10월 25일 09:00로 설정했어요. 필요하면 수정하세요.':''}))};}
export function sorted(events){return [...events].sort((a,b)=>stamp(a.start)-stamp(b.start));}
export function position(events,now){const list=sorted(events);return {current:list.find(e=>stamp(e.start)<=now&&now<stamp(e.end))||null,previous:[...list].reverse().find(e=>stamp(e.end)<=now)||null,next:list.find(e=>stamp(e.start)>now)||null};}
export function totals(data){const spent=data.expenses.reduce((n,e)=>n+e.amount,0);return {spent,remaining:data.budget-spent,byCategory:Object.fromEntries(categories.map(c=>[c,data.expenses.filter(e=>e.category===c).reduce((n,e)=>n+e.amount,0)]))};}
export function validEvent(e){return !!e&&typeof e.id==='string'&&typeof e.title==='string'&&e.title.trim().length>0&&e.title.length<=120&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(e.start)&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(e.end)&&Number.isFinite(stamp(e.start))&&stamp(e.end)>stamp(e.start)&&categories.includes(e.category)&&typeof e.note==='string'&&e.note.length<=2000&&typeof e.tag==='string';}
export function validate(data){return !!data&&data.version===1&&Number.isSafeInteger(data.budget)&&data.budget>=0&&data.budget<=1e12&&typeof data.alerts==='boolean'&&Array.isArray(data.events)&&data.events.length<=500&&data.events.every(validEvent)&&new Set(data.events.map(e=>e.id)).size===data.events.length&&Array.isArray(data.expenses)&&data.expenses.length<=10000&&data.expenses.every(e=>e&&typeof e.id==='string'&&typeof e.title==='string'&&e.title.trim()&&e.title.length<=120&&Number.isSafeInteger(e.amount)&&e.amount>0&&e.amount<=1e12&&categories.includes(e.category)&&/^\d{4}-\d{2}-\d{2}$/.test(e.date)&&Number.isFinite(Date.parse(e.date))&&typeof e.note==='string'&&e.note.length<=2000)&&new Set(data.expenses.map(e=>e.id)).size===data.expenses.length&&data.categoryBudgets&&typeof data.categoryBudgets==='object'&&!Array.isArray(data.categoryBudgets)&&Object.entries(data.categoryBudgets).every(([c,n])=>categories.includes(c)&&Number.isSafeInteger(n)&&n>=0&&n<=1e12);}
