#!/usr/bin/env node
// 把 entries/ 下的全部条目汇成两个文件：
//   pitfalls.json  给程序读（插件带快照时用这个）
//   PITFALLS.md    给人和模型读（可以整段贴进创造模式）
// 顺手做格式检查和几条安全检查。没有依赖，装了 Node 18 以上就能跑：
//   node scripts/build.mjs          生成
//   node scripts/build.mjs --check  只检查，生成物和条目对不上就报错（适合放进合并前检查）
import {readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ENTRIES = join(ROOT, 'entries');
const SCHEMA = 1;

const CATEGORIES = ['动手之前', '接口与注册', '客户端加载', '界面与体验', '看效果与排错'];
const STATUSES = ['有效', '待复核', '已过期'];
const KINDS = ['踩过的坑', '好做法'];
// 条目文件里的中文字段 → JSON 里的英文字段
const FIELDS = {标题: 'title', 类型: 'kind', 分类: 'category', 状态: 'status', 宿主版本: 'host_version', 最近核对: 'verified', 来源: 'source', 替代项: 'superseded_by'};
const REQUIRED_FIELDS = ['标题', '类型', '分类', '状态', '宿主版本', '最近核对', '来源'];
const SECTIONS = {什么情况下会遇到: 'when', 该怎么做: 'do', 证据: 'evidence', 还没核对的: 'unverified', 备注: 'notes'};
const REQUIRED_SECTIONS = ['什么情况下会遇到', '该怎么做', '证据'];

// 安全检查只是绊线，拦得住粗心，拦不住有心。每条仍然要人读过才能合并。
const FORBIDDEN = [
  [/\/Users\/|\/home\/[a-z]|[A-Za-z]:\\Users\\/u, '个人路径（写成「插件目录」「宿主数据目录」这类说法）'],
  [/[\w.+-]+@[\w-]+\.[a-z]{2,}/iu, '邮箱地址'],
  [/sk-[A-Za-z0-9]{16,}|ghp_[A-Za-z0-9]{20,}|github_pat_|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY|Bearer [A-Za-z0-9._-]{20,}/u, '疑似密钥或令牌'],
  [/忽略(以上|之前|前面|上面)|ignore (all )?(the )?(previous|above|prior)|disregard (all )?(previous|above)/iu, '要求模型无视其他指令的话'],
  [/不(要|用|必)(告诉|告知|通知)用户|无需(用户)?(确认|同意|批准)|不(用|必)(经过?|等)用户(确认|同意)|绕过(审批|权限|确认)/u, '要求模型瞒着用户或跳过确认的话'],
  [/你现在是|从现在起你|you are now|new system prompt/iu, '给模型重新设定身份的话'],
];

const problems = [];
const bad = (file, message) => problems.push(`${file}: ${message}`);

function parse(file) {
  const id = file.replace(/\.md$/u, '');
  const text = readFileSync(join(ENTRIES, file), 'utf8').replace(/\r\n/gu, '\n');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/u.test(id)) bad(file, '文件名只用小写英文、数字和连字符，例如 tool-param-required.md');
  const head = /^---\n([\s\S]*?)\n---\n/u.exec(text);
  if (!head) { bad(file, '开头缺少用 --- 包起来的字段区'); return null; }

  const entry = {id};
  for (const line of head[1].split('\n')) {
    if (!line.trim()) continue;
    const pair = /^([^:：]+)[:：]\s*(.*)$/u.exec(line);
    if (!pair) { bad(file, `字段区里这一行看不懂：${line}`); continue; }
    const key = pair[1].trim(), value = pair[2].trim();
    if (!(key in FIELDS)) { bad(file, `不认识的字段「${key}」，可用的是：${Object.keys(FIELDS).join('、')}`); continue; }
    entry[FIELDS[key]] = value;
  }
  for (const key of REQUIRED_FIELDS) if (!entry[FIELDS[key]]) bad(file, `缺少字段「${key}」`);
  if (entry.category && !CATEGORIES.includes(entry.category)) bad(file, `分类只能是：${CATEGORIES.join('、')}`);
  if (entry.kind && !KINDS.includes(entry.kind)) bad(file, `类型只能是：${KINDS.join('、')}`);
  if (entry.status && !STATUSES.includes(entry.status)) bad(file, `状态只能是：${STATUSES.join('、')}`);
  if (entry.verified && !/^\d{4}-\d{2}-\d{2}$/u.test(entry.verified)) bad(file, '「最近核对」写成 2026-11-10 这样的日期');
  if (entry.status === '已过期' && !entry.superseded_by) bad(file, '已过期的条目要填「替代项」：另一条的文件名，或写「无」');
  entry.superseded_by = entry.superseded_by || null;

  const body = text.slice(head[0].length);
  const parts = body.split(/^## +(.+)$/mu);
  if (parts[0].trim()) bad(file, '字段区后面直接写小标题，不要有别的正文');
  for (let i = 1; i < parts.length; i += 2) {
    const name = parts[i].trim();
    if (!(name in SECTIONS)) { bad(file, `不认识的小标题「${name}」，可用的是：${Object.keys(SECTIONS).join('、')}`); continue; }
    entry[SECTIONS[name]] = parts[i + 1].trim();
  }
  for (const name of REQUIRED_SECTIONS) if (!entry[SECTIONS[name]]) bad(file, `缺少小标题「${name}」或内容为空`);
  if (entry.status === '待复核' && !entry.unverified) bad(file, '待复核的条目要写「还没核对的」，说清哪一点没核对');
  // 证据按条列出，方便程序逐条展示
  entry.evidence = (entry.evidence ?? '').split(/\n(?=- )/u).map(item => item.replace(/^- /u, '').trim()).filter(Boolean);
  entry.unverified = entry.unverified || null;
  entry.notes = entry.notes || null;

  for (const [pattern, what] of FORBIDDEN) if (pattern.test(text)) bad(file, `含有${what}`);
  return entry;
}

const files = readdirSync(ENTRIES).filter(name => name.endsWith('.md') && !name.startsWith('_')).sort();
for (const name of readdirSync(ENTRIES)) if (/ \d+\.md$/u.test(name)) bad(name, '像是网盘同步出来的冲突副本，删掉或合并后再提交');
const entries = files.filter(name => !/ \d+\.md$/u.test(name)).map(parse).filter(Boolean);
const ids = new Set(entries.map(entry => entry.id));
for (const entry of entries) {
  if (entry.superseded_by && entry.superseded_by !== '无' && !ids.has(entry.superseded_by)) bad(`${entry.id}.md`, `替代项「${entry.superseded_by}」不是现有条目的文件名`);
}

if (problems.length) {
  console.error(`有 ${problems.length} 处要改：\n${problems.map(line => `  - ${line}`).join('\n')}`);
  process.exit(1);
}

const order = entry => CATEGORIES.indexOf(entry.category);
entries.sort((a, b) => order(a) - order(b) || a.id.localeCompare(b.id));
const pick = entry => ({
  id: entry.id, title: entry.title, kind: entry.kind, category: entry.category, status: entry.status,
  host_version: entry.host_version, verified: entry.verified, source: entry.source, superseded_by: entry.superseded_by,
  when: entry.when, do: entry.do, evidence: entry.evidence, unverified: entry.unverified, notes: entry.notes,
});
const json = `${JSON.stringify({schema: SCHEMA, count: entries.length, kinds: KINDS, categories: CATEGORIES, statuses: STATUSES, entries: entries.map(pick)}, null, 2)}\n`;

const live = entries.filter(entry => entry.status !== '已过期');
const digest = [
  '# DSH 插件经验合集：踩过的坑和好做法',
  '',
  '<!-- 这个文件由 scripts/build.mjs 生成，不要手改；要改就改 entries/ 里对应的条目。 -->',
  '',
  `下面是社区整理的 ${live.length} 条做 DSH 插件的经验，有踩过的坑（这么做会出问题），也有好做法（公开插件或官方这么做）。每条都标了核对时的宿主版本。它们是参考，不是规定：宿主会升级，条目会过期。和当前宿主的实际接口（用 cordis_inspect 查到的）或用户的要求不一致时，以后两者为准。标了「待复核」的条目证据还不全，用之前先自己验证。`,
  '',
  ...CATEGORIES.flatMap(category => {
    const group = live.filter(entry => entry.category === category);
    if (!group.length) return [];
    return [`## ${category}`, '', ...group.flatMap(entry => [
      `### ${entry.status === '待复核' ? '［待复核］' : ''}${entry.title}`,
      '',
      `类型：${entry.kind}　宿主版本：${entry.host_version}　最近核对：${entry.verified}　条目：entries/${entry.id}.md`,
      '',
      `**什么情况下会遇到：** ${entry.when}`,
      '',
      '**该怎么做：**',
      '',
      entry.do,
      '',
      ...(entry.unverified ? [`**还没核对的：** ${entry.unverified}`, ''] : []),
    ])];
  }),
].join('\n').replace(/\n+$/u, '\n');

const outputs = [['pitfalls.json', json], ['PITFALLS.md', digest]];
if (process.argv.includes('--check')) {
  const stale = outputs.filter(([name, content]) => { try { return readFileSync(join(ROOT, name), 'utf8') !== content; } catch { return true; } });
  if (stale.length) { console.error(`这些生成物和条目对不上，跑一次 node scripts/build.mjs：${stale.map(([name]) => name).join('、')}`); process.exit(1); }
  console.log(`检查通过：${entries.length} 条，生成物是最新的。`);
} else {
  for (const [name, content] of outputs) writeFileSync(join(ROOT, name), content);
  const count = status => entries.filter(entry => entry.status === status).length;
  const kind = name => entries.filter(entry => entry.kind === name).length;
  console.log(`已生成 pitfalls.json 和 PITFALLS.md：共 ${entries.length} 条（踩过的坑 ${kind('踩过的坑')}，好做法 ${kind('好做法')}；有效 ${count('有效')}，待复核 ${count('待复核')}，已过期 ${count('已过期')}）。`);
}
