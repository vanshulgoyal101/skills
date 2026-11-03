# Team Metrics And Experiments (template)

Activity is not progress: AdBrain's team made 1,071 contributions in one day that moved
the core very little. Measure outcomes and delivery health weekly, change one process
rule at a time as a named experiment, and keep or drop it by the numbers.

## The scorecard

Every row comes from GitHub, CI and production data; no self-reporting.

| Metric | How | AdBrain baseline (7 days to 2026-10-30) | Target |
| --- | --- | --- | --- |
| Outcome: pilots live / core loop used by outside customers | product data, internal accounts excluded | 0 of 3 pilots | 3 pilots by a date |
| Outcome: unit cost (e.g. cost per enquiry) | spend / real outcomes | about ₹222 | ≤ ₹100 |
| Merged PRs (excluding release trains) | `gh pr list --state merged` in window | 1,031 | not a target; should fall as noise drops |
| Role posts per merged PR | comments starting with a role prefix on the PR and its issue | about 4.4 | ≤ 2 |
| `→` handoffs per merged PR | comments containing `→ <Role>` | about 3.5 | ≤ 1 |
| Lead time, PR open → production | PR created to the deploy that contained its merge | median 18 min, p90 108 min | hold or improve |
| Change-failure rate | failed production core smokes / production deploys | 32 / 289 = 11 % | ≤ 5 % |
| Time to restore | failed smoke to next passing smoke | median 31, p90 810 min (n = 7) | p90 ≤ 60 min |
| CI failure rate | failed / (success + failed) runs on `next` and `main`, excluding cancelled and skipped | 37 of 150 | ≤ 10 % |
| Reverts | revert commits on `main` | 0 | report only (fix forward is fine) |

Definitions that bit AdBrain:

- Don't infer recovery from an overlapping success, or production deployment from the
  first unrelated `main` merge; match deploys to the commits they contain.
- Separate the core smoke's failures from other guard jobs.
- Exclude bot PR runs that expired awaiting approval (zero jobs) from CI rates.
- With no samples, write n/a; n/a is neither pass nor fail.

## Running experiments

Pin one issue for experiments. Its body holds the baseline table and the active
experiments; a weekly comment holds the scorecard and a keep / adjust / drop line per
experiment, ending with `Next read <next week>`.

AdBrain's first five (from 2026-10-30):

| # | Rule | Metric that decides it |
| --- | --- | --- |
| E1 | Trails, not talk: comment only to hand off, decide or attach evidence | role posts per merged PR |
| E2 | One owner end to end: the author ships and smokes; hand off only at hard gates | handoffs per merged PR, lead time |
| E3 | Fix forward: whoever sees a red `next` or a non-core production break fixes it, no author ping | time to restore, CI failure rate |
| E4 | Try to break it yourself: an independent subagent attacks each gated change before approval | change-failure rate |
| E5 | Fast per-PR checks (only the tests a change reaches) plus a scheduled full suite | lead time, CI failure rate |

When an experiment is adjusted or dropped, the coordinator hands the doc change to the
CTO (`→ CTO:`); the rule text in `AGENTS.md` changes in the same week.
