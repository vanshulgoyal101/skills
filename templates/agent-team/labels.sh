#!/usr/bin/env bash
# Create the agent-team label set. Usage: bash labels.sh <owner/repo> <role> [role ...]
# Idempotent: --force updates colour/description of existing labels.
set -euo pipefail
repo="${1:?usage: labels.sh <owner/repo> <role> [role ...]}"
shift
[ "$#" -gt 0 ] || { echo "name at least one role (e.g. ceo cto dev qa devops)" >&2; exit 2; }

label() { gh label create "$1" -R "$repo" --color "$2" --description "$3" --force >/dev/null && echo "  $1"; }

echo "Priority and state:"
label core          b60205 "Core loop; comes first"
label later         c5def5 "Not now; ranked later"
label ready         0e8a16 "Briefed and unowned: anyone in the lane may claim it"
label blocked       5319e7 "Needs something outside the team; the issue says what"
label waiting-owner fbca04 "Blocked on the human; only the coordinator asks"
label decision      d93f0b "The coordinator decides"
label parked        bfdadc "Paused on purpose; resume trigger in the parked register"
label standing      ededed "Long-lived tracking issue; never 'actionable'"
label board         1d76db "The pinned team board"
label hotfix        e11d21 "Goes straight to main"
label ready-to-ship 0052cc "Committed; waiting for the release owner"
label flaky         f9d0c4 "Intermittent test or job"

echo "Lanes:"
for lane in dev qa devops review design product research docs; do
  label "lane:$lane" c2e0c6 "Ready-pool lane: $lane"
done

echo "Owners and declines:"
for role in "$@"; do
  label "owner:$role"    1d76db "$role acts next"
  label "declined:$role" eeeeee "Not for $role; the waiter won't offer it again"
done
