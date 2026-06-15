/**
 * Hardcoded follow-up email templates per PRD.
 * Email 1 is user-authored; Emails 2–4 are fixed bodies sent as replies in the same thread.
 *
 * First name variables resolved at send time:
 *   {First Name}        → all recipients joined naturally ("Sarah", "Sarah and Mike", "Sarah, Mike, and John")
 *   {First Name 1..N}   → individual recipient by 1-indexed position, matching the order Julia selected them
 */

const DAY_MS = 24 * 60 * 60 * 1000;

const FOLLOWUPS = [
  {
    step: 2,
    label: 'Check In',
    delayMs: 5 * DAY_MS,
    body: `Hi {First Name},<br><br>Wanted to check in and see if you had a chance to review?<br><br>Happy to answer any questions over email, or feel free to grab some time directly <a href="https://cal.com/team/playkit-team/follow-up">here</a>.<br><br>Thanks,<br>Julia`,
  },
  {
    step: 3,
    label: 'Start Date',
    delayMs: 14 * DAY_MS,
    body: `Hi {First Name},<br><br>Wanted to flag, we typically need at least one to two weeks from a signed contract to kick off, and our slots are first-come, first-served based on when the contract is signed. If you're still interested in the timeline we discussed, just wanted to make sure you had that in mind as you're evaluating internally.<br><br>Let me know if you're still interested and I can keep you updated on our earliest start dates.<br><br>Thanks,<br>Julia`,
  },
  {
    step: 4,
    label: 'Closeout',
    delayMs: 21 * DAY_MS,
    body: `Hey {First Name},<br><br>I'll stop following up. I know timing doesn't always line up and building this in-house is a totally valid path.<br><br>A few resources to get you started:<br>- <a href="https://playkit.substack.com/">Playkit's Substack</a>, lots of free resources on running UGC<br>- <a href="https://ugctrackr.com">Trackr</a>, use code FRIENDS75 for one month free<br>- <a href="https://www.notion.so/2ead142e96d080a594e6d11750b5d811">Trackr Handbook</a>, step by step instructions on how to run campaigns like Playkit<br><br>If you ever want to hand it off or hit a wall, just reply to this thread.<br><br>Cheering you on,<br>Julia`,
  },
];

/**
 * Join a list of names with natural English commas: "A", "A and B", "everybody" for 3+.
 */
function joinNames(names) {
  const cleaned = (names || []).filter(Boolean);
  if (cleaned.length === 0) return 'there';
  if (cleaned.length === 1) return cleaned[0];
  if (cleaned.length === 2) return `${cleaned[0]} and ${cleaned[1]}`;
  return 'everybody';
}

/**
 * Find the first "Hi ..." or "Hey ..." greeting line in a body and return
 * the name portion. Strips HTML tags first so it works with HTML bodies.
 */
function extractGreetingFromBody(body) {
  if (!body) return null;
  const stripped = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const firstLine = stripped.split(/[,\n]/)[0].trim();
  const match = firstLine.match(/^(?:Hi|Hey)\s+(.+?)$/i);
  if (!match) return null;
  return match[1].trim();
}

/**
 * Replace {First Name} and {First Name N} tokens in a body string.
 * firstNames is an array aligned with recipients order (1-indexed in the template).
 * greetingName, when provided, overrides joinNames for {First Name} replacement.
 */
function resolveFirstNames(body, firstNames, greetingName) {
  const list = Array.isArray(firstNames) ? firstNames : [];

  let out = body.replace(/\{First Name (\d+)\}/g, (_, n) => {
    const idx = parseInt(n, 10) - 1;
    return list[idx] || '';
  });

  out = out.replace(/\{First Name\}/g, greetingName || joinNames(list));

  return out;
}

module.exports = { FOLLOWUPS, resolveFirstNames, joinNames, extractGreetingFromBody };
