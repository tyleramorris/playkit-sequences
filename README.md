# Playkit Sequences

Internal tool for automated outbound follow-up sequences when Attio email sequences do not support the workflow we need.

## Why this exists

We built this because Attio email sequences break for a few important use cases:
- People need to be CC’d on sequence emails
- The first email in a sequence often needs to be custom-written, not templated the same way as follow-ups
- We need more control over follow-up sequencing logic than Attio gives us

Use Playkit Sequences when the workflow requires those exceptions.
Use Attio when a standard sequence is enough.

## What it does

- Sends automated follow-up sequences
- Supports CC’d recipients
- Allows a customized first email before automated follow-ups begin
- Handles sequence logic that Attio can’t support cleanly

## Who should use it

Internal only. Built for our team’s outbound workflow.

## How the workflow works

1. Add the contact / sequence input
2. Customize the first email
3. Configure follow-up steps and timing
4. Confirm CC rules
5. Start the sequence
6. Monitor status / make changes if supported

## Setup

### Requirements
- Node version:
- Environment variables:
- API keys:
- Attio dependencies or exports:
- Email provider / SMTP / sending account details:

### Install
```bash
git clone ...
cd playkit-sequences
npm install
npm run dev
```

## Configuration

Document:
- Required env vars
- Sequence defaults
- Sending limits
- Any account mapping
- Any CC logic rules
- Any template locations

## Operational notes

- Internal-only tool
- Not intended for general customer use
- Be careful with sending limits, duplicate sends, and recipient accuracy
- Confirm CC behavior before launching a live sequence

## Known limitations

- ...
- ...
- ...

## Troubleshooting

### Sequence didn’t send
Possible causes:
- Missing env vars
- Invalid recipient data
- Provider auth issue
- Attio sync/input issue

### CC behavior looks wrong
Check:
- formatting rules
- deduplication logic
- account config

## Ownership

Primary owner: Tyler Morris  
Secondary owner: ...

## License

Private internal project.
