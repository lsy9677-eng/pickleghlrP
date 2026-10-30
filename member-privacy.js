export function toPublicAccountMember(member) {
    const result = {};
    for (const key of ['id', 'name', 'status', 'role', 'joinDate', 'paid', 'withdrawnYear']) {
        if (member?.[key] !== undefined && member[key] !== null) result[key] = member[key];
    }
    // 달력의 생일 표시는 월·일만 사용하므로 출생연도는 공개하지 않습니다.
    if (typeof member?.birthday === 'string' && member.birthday.length >= 10) result.birthday = '0000' + member.birthday.slice(4);
    return result;
}

export function toPublicAccountMembers(members) {
    return (Array.isArray(members) ? members : Object.values(members || {})).filter(Boolean).map(toPublicAccountMember);
}

