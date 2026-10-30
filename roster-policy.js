export const ROSTER_BASE_YEAR = 2026;
export function koreaRosterYear() { return Number(new Intl.DateTimeFormat('en',{timeZone:'Asia/Seoul',year:'numeric'}).format(new Date())); }
export function applyMemberLifecycle(member, previous = null, year = koreaRosterYear()) {
    const next = {...member};
    if(next.status === '탈회') next.withdrawnYear = previous?.status === '탈회' ? Number(previous.withdrawnYear) || Number(next.withdrawnYear) || year : year;
    else delete next.withdrawnYear;
    return next;
}
export function visibleRoster(members, year = koreaRosterYear()) {
    return (Array.isArray(members) ? members : Object.values(members || {})).filter(member => member && (member.status !== '탈회' || (Number(member.withdrawnYear) || ROSTER_BASE_YEAR) >= year));
}
export function watchRosterYear(callback) {
    let year=koreaRosterYear();
    const check=()=>{const next=koreaRosterYear();if(next!==year){year=next;callback(next);}};
    const timer=setInterval(check,60000);window.addEventListener('focus',check);document.addEventListener('visibilitychange',check);
    return ()=>{clearInterval(timer);window.removeEventListener('focus',check);document.removeEventListener('visibilitychange',check);};
}
