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
    body: `Hi {First Name},

Wanted to check in and see if you had a chance to review?

Happy to answer any questions over email or get some time set up with our Chief of Staff if there's anything in the contract or offer you'd rather walk through on a call. Here's his link.

Thanks,
Julia`,
  },
  {
    step: 3,
    label: 'Start Date',
    delayMs: 14 * DAY_MS,
    body: `Hi {First Name},

Wanted to flag, we typically need at least 3 weeks from a signed contract to kick off, and our slots are first-come, first-served based on when the contract is signed. If you're still interested in the timeline we discussed, just wanted to make sure you had the timeline in mind as you're evaluating internally.

Let me know if you're still interested and I can keep you updated on our earliest start dates while you evaluate internally.

Thanks,
Julia`,
  },
  {
    step: 4,
    label: 'Closeout',
    delayMs: 21 * DAY_MS,
    body: `Hey {First Name},

I'll stop following up. I know timing doesn't always line up and building this in-house is a totally valid path.

A few resources to get you started:
- <a href="https://playkit.substack.com/">Playkit's Substack</a>, lots of free resources on running UGC
- <a href="https://ugctrackr.com">Trackr</a>, use code FRIENDS75 for one month free of the operating system we use to run our campaigns
- <a href="https://www.notion.so/2ead142e96d080a594e6d11750b5d811">Trackr Handbook</a>, step by step instructions on how to run campaigns like Playkit

If you ever want to hand it off or hit a wall, just reply to this thread.

Cheering you on,
Julia`,
  },
];

/**
 * Join a list of names with natural English commas: "A", "A and B", "A, B, and C".
 */
function joinNames(names) {
  const cleaned = (names || []).filter(Boolean);
  if (cleaned.length === 0) return 'there';
  if (cleaned.length === 1) return cleaned[0];
  if (cleaned.length === 2) return `${cleaned[0]} and ${cleaned[1]}`;
  return `${cleaned.slice(0, -1).join(', ')}, and ${cleaned[cleaned.length - 1]}`;
}

/**
 * Replace {First Name} and {First Name N} tokens in a body string.
 * firstNames is an array aligned with recipients order (1-indexed in the template).
 */
function resolveFirstNames(body, firstNames) {
  const list = Array.isArray(firstNames) ? firstNames : [];

  let out = body.replace(/\{First Name (\d+)\}/g, (_, n) => {
    const idx = parseInt(n, 10) - 1;
    return list[idx] || '';
  });

  out = out.replace(/\{First Name\}/g, joinNames(list));

  return out;
}

module.exports = { FOLLOWUPS, resolveFirstNames, joinNames };
