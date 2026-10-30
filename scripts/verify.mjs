import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { OWNER_EMAIL, ACCESS_ROOT, resolveRole, canManage } from '../access-policy.js';
import { toPublicAccountMembers } from '../member-privacy.js';

const user = { uid: 'staff', email: 'staff@example.com' };
assert.equal(resolveRole({email: OWNER_EMAIL}, null), 'owner');
assert.equal(resolveRole(null, null), 'visitor');
for (const role of ['director', 'owner', 'revoked', null]) assert.equal(resolveRole(user, {role, email:user.email}), 'pending');
assert.equal(resolveRole(user, {role:'treasurer', email:user.email}), 'treasurer');
assert.equal(resolveRole(user, {role:'treasurer', email:'other@example.com'}), 'pending');
for (const role of ['pending','visitor','director','revoked']) assert.equal(canManage(role), false);
assert.ok(canManage('owner') && canManage('treasurer'));
assert.equal(ACCESS_ROOT, 'clubs/jinrye_modern_pickleball__access');
const [member] = toPublicAccountMembers([{id:1,name:'회원',phone:'01012345678',spouse:'배우자',birthday:'1980-03-05'}]);
assert.deepEqual(member, {id:1,name:'회원',birthday:'0000-03-05'});

const rules = JSON.parse(fs.readFileSync('database.rules.json','utf8')).rules;
assert.deepEqual(Object.keys(rules.clubs).sort(), ['jinrye_modern_pickleball','jinrye_modern_pickleball__access','jinrye_modern_pickleball__safety']);
assert.equal(rules.clubs.jinrye_modern_pickleball['.write'], undefined);
assert.equal(rules.clubs.jinrye_modern_pickleball__access.roles.$uid.role['.validate'], "newData.val() == 'treasurer' || newData.val() == 'revoked'");
assert.equal(rules.clubs.jinrye_modern_pickleball__access.requests.$uid.requestedRole['.validate'], "newData.val() == 'treasurer'");
const html = fs.readFileSync('index.html','utf8');
assert.ok(html.includes('lsytennis-default-rtdb.europe-west1.firebasedatabase.app'));
assert.ok(html.includes('const CLUB_ROOT = BASE_PATH;'));
assert.ok(!html.includes("location.href='./match/'"));
assert.equal((html.match(/class="nav-item(?: active)?"/g) || []).length, 5);
for (const m of html.matchAll(/(?:import[^;]*?from\s*|href=)["'](\.\/[^"'?]+)(?:\?[^"']*)?["']/g)) assert.ok(fs.existsSync(m[1]), `Missing asset: ${m[1]}`);
for (const [index,match] of [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].entries()) {
    const result = spawnSync(process.execPath,['--check',...(match[1].includes('module')?['--input-type=module']:[])], {input:match[2],encoding:'utf8'});
    assert.equal(result.status,0,`Inline script ${index}: ${result.stderr}`);
}
for (const name of fs.readdirSync('.').filter(name=>name.endsWith('.js'))) {
    const result = spawnSync(process.execPath,['--check',name],{encoding:'utf8'});
    assert.equal(result.status,0,`${name}: ${result.stderr}`);
}
console.log('PASS: roles, grant isolation, privacy, Firebase scope, navigation, local assets and JavaScript syntax');
