# claude-experiments: how this repo is organized

This is the owner's **main repo for new, random ideas and experiments**.
Every new idea lands here by default unless the owner says otherwise.

## Conventions
- Each idea gets its own folder under `projects/<short-kebab-name>/` with its own `README.md`
  (what it is, status, how to run or set it up).
- Keep projects self-contained. Don't share code between projects unless it clearly helps;
  if shared code is needed, put it in `shared/`.
- List every project in the root `README.md` index with a one-line description and status.
- Claude may organize as it sees fit: create branches per idea, restructure folders,
  or suggest splitting an idea into its own repository once it grows large, needs its own
  CI/deploys, or would be shared publicly. Say so when splitting makes more sense.
- Never commit secrets, device serial numbers, MAC addresses, or personal info
  (e.g. from screenshots the owner shares).
