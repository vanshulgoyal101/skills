# Data Sync Checklist

- [ ] Is every write durable offline or explicitly allowed to be lossy?
- [ ] Is pending data scoped to the authenticated owner?
- [ ] Does resolved `{ error }` count as failure?
- [ ] Can an older in-flight acknowledgement delete newer data?
- [ ] Does account switching fetch/validate before clearing local data?
- [ ] Are cloud blobs validated as objects before restore?
- [ ] Are multi-metric blobs reconciled intentionally?
- [ ] Do hub, game, rank, and database semantics agree?
- [ ] Are tied ranks defined consistently?
- [ ] Are retry, reconnect, refresh, sign-out, and new-device paths tested?
