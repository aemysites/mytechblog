<!-- stardust:provenance writtenBy=stardust:extract writtenAt=2026-10-12T18:20:00Z readArtifacts=stardust/current/_computed-styles.json,stardust/current/_brand-extraction.json,stardust/current/css/style.css stardustVersion=0.32.1 -->
---
name: A Matter of Unimportance
description: Carsten Ziegeler's personal blog on OSGi, Apache Sling and AEM — stock WordPress Twenty Twelve theme
colors:
  backdrop: "#e6e6e6"
  page: "#ffffff"
  rule: "#ededed"
  text: "#444444"
  text-muted: "#757575"
  text-meta: "#636363"
  site-title: "#515151"
  nav: "#6a6a6a"
  link: "#21759b"
  link-visited: "#9f9f9f"
  nav-hover: "#000000"
typography:
  site-title:
    fontFamily: "Open Sans, Helvetica, Arial, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1.846153846
  site-description:
    fontFamily: "Open Sans, Helvetica, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.846153846
  entry-title:
    fontFamily: "Open Sans, Helvetica, Arial, sans-serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.2
  body:
    fontFamily: "Open Sans, Helvetica, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.714285714
  nav:
    fontFamily: "Open Sans, Helvetica, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 3.692307692
    letterSpacing: "normal"
  widget-title:
    fontFamily: "Open Sans, Helvetica, Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 2.181818182
  small:
    fontFamily: "Open Sans, Helvetica, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.846153846
rounded:
  sm: "3px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "24px"
  lg: "48px"
components:
  button:
    backgroundColor: "#e6e6e6"
    textColor: "#7c7c7c"
    rounded: "{rounded.sm}"
    padding: "6px 10px"
  page-card:
    backgroundColor: "{colors.page}"
    width: "960px"
    padding: "0 40px"
---

# Design — current state (descriptive)

## Overview
A stock WordPress **Twenty Twelve** blog: a single white page card (max 960px, centred, 1px-shadowed) floating on a light grey backdrop from 960px up. Quiet, text-first, no imagery beyond one photo on the front page. One typeface, Open Sans, everywhere.

## Colors
Greys carry everything: `#444` body text, `#757575` meta and widget links, `#636363` uppercase widget/archive titles, `#ededed` hairlines. The only hue is the link blue `#21759b`. Code samples use the SyntaxHighlighter default theme (green comments `#008200`, blue keywords `#006699`).

## Typography
Root 14px (`html { font-size: 87.5% }`), rem ramp 11/12/13/14/16/18/20/22/24/26px. Entry titles 20px regular; content headings h1 21px, h2 18px, h3 16px bold; widget titles 11px bold uppercase. Body line-height 24px.

## Layout
Mobile-first with two source breakpoints: **600px** (page card goes 960px max, content 65.1% left / sidebar 26% right, nav becomes an inline uppercase list) and **960px** (grey backdrop, card gains 48px top margin and 40px side padding). Below 600 the nav collapses to a "Menu" toggle button and the sidebar stacks under the content.

## Elevation & Depth
One shadow: the page card `0 2px 6px rgba(100,100,100,.3)` (≥960px); buttons `0 1px 2px rgba(64,64,64,.1)`.

## Shapes
3px radius on buttons, inputs, and the front-page photo. Everything else is square.

## Components
Masthead (title + tagline + bordered nav), article entry (title, content, entry-meta footer), post navigation, sidebar widgets (search, recent posts, archives, categories, meta), colophon footer, SyntaxHighlighter code blocks.

## Do's and Don'ts
Do keep the text-only masthead and grey-on-white restraint. Don't add colour, imagery or radius the source does not have.
