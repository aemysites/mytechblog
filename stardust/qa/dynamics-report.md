# Dynamics parity check — https://main--18fbe2a0--aemcoder.aem.live — 2026-10-12T20:59:06.408Z

Replayed 5 checks over 3 features · pass 5 · fail 0. Flows, not presence.

| feature | class | status | check | result | detail | third-party requests |
|---|---|---|---|---|---|---|
| Sidebar site search | search | implemented | fetch-json | PASS | 200 · 61 rows · keys columns,data,offset,limit,total,:type |  |
| Sidebar site search | search | implemented | search-query | PASS | 2 results (source 2) · first: apache ibatis and apache sanselan session · matches the source |  |
| Sidebar site search | search | implemented | search-query | PASS | 10 results (source 10) · first: guide on using osgi configurations · matches the source |  |
| Sidebar site search | search | implemented | dom-count | PASS | 1 × aside form[role=search][action='/search'] input[name=s] (min 1) |  |
| Blog index + category archives | static-snapshot | static-snapshot | dom-count | PASS | 10 × main .section.entry (min 10) |  |

## Features without checks

- Meta widget: Log in, feeds, WordPress.org (static-snapshot) — static-snapshot
