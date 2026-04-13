# Ryann Lynn Murphy -- Personal Portfolio Website

## Overview
A retro-terminal personal website that fuses early internet brutalism with modern craft. Pure HTML/CSS/JS, no framework. Feels like a 1997 time capsule built by someone from 2027.

## Decisions
- **Stack:** Pure HTML, CSS, vanilla JavaScript. No build step.
- **Landing page:** CRT screen with ASCII art portrait (right side), blinking cursor, typing effect, "Writer // Builder // NYC" tagline, ENTER_SITE.exe button with glitch transition.
- **Main site:** Single-page scroll with fixed terminal-style nav bar. Four sections: ARTISTIC_WORK, TECHNICAL_WORK, SYNTHESIS, CONTACT.
- **Contact form:** Formspree integration (free tier, emails to ryannlynncontact@gmail.com).
- **Hosting:** GitHub Pages or Vercel (static deploy).
- **Photo:** ASCII art portrait on landing. Real headshot with glitch treatment on ARTISTIC_WORK section.

## Visual Language
- **Colors:** `#0a0a0a` background, `#00FF00` terminal green, `#FF00FF` glitch magenta, `#FFFFFF` text
- **Fonts:** Courier New (headers/terminal), Times New Roman (body), Arial (accent), Consolas (code)
- **Effects:** CRT curvature, scan lines overlay, blinking cursor, glitch on hover (200ms letter scramble), typing effect on landing, progressive image loading with scan lines

## Site Structure

### Landing Page (index.html)
- Full-viewport CRT screen
- Blinking cursor prompt `> █`
- "RYANN LYNN MURPHY" title
- "Writer // Builder // NYC" tagline
- ASCII art portrait on right side
- `[ENTER_SITE.exe]` button -- glitch transition (200ms) then navigates to main.html
- "Systems Online: ██████████ 100%" progress bar
- Subtle static noise background
- Konami code easter egg

### Main Site (main.html) -- Single Page Scroll
**Nav bar (fixed top):**
```
C:\ryann> ARTISTIC_WORK | TECHNICAL_WORK | SYNTHESIS | CONTACT | [?]
```
- Hover: invert colors (white bg, black text)
- [?] opens hidden menu: View source (GitHub), Download resume, Random page, Built with Claude Code

**Section 1: ARTISTIC_WORK**
- Terminal windows styled as file explorer panels
- PLAYS.txt: SCOUTS (2024), Thoughts on Girlcock (2023), Grooming My Ass (2023)
- WRITING_SAMPLES.zip: Substack, New Play Exchange links
- ACTING.jpeg: Actors Access link, headshot with glitch treatment

**Section 2: TECHNICAL_WORK**
- Project blocks with hover border glow
- HAZEL.AI: Personal AI assistant, RPi5, Python stack
- HZL_ACADEMY.EDU: Patent pending, AI education platform, Next.js/TS
- SCOUTS_GAME.PixiJS: Browser narrative game
- TINY_HAZEL.INFRASTRUCTURE: Local AI compute manifesto
- GitHub profile, full stack list, "All of this in one month" callout

**Section 3: SYNTHESIS**
- README.txt manifesto format
- WHY / WHAT I BUILD / WHO I AM / WHAT I'M LOOKING FOR sections
- Resume download, patent docs, contact CTA

**Section 4: CONTACT**
- SEND_MESSAGE.exe terminal window
- Formspree form: Name, Email, Message fields with green focus borders
- Terminal-style submit animation
- Direct links: email, LinkedIn, GitHub, Substack
- "PGP Key available on request" line

### Special Pages
- **404.html:** Terminal-style "File not found" with nav links
- **/secret route:** Hidden page (easter egg)
- **Custom right-click context menu** styled like Windows 95
- **Console messages** for developers who inspect

## Accessibility
- Semantic HTML, ARIA labels
- Full keyboard navigation
- WCAG AA color contrast (green on black verified)
- `prefers-reduced-motion` disables animations
- Mobile responsive (simplified but functional)

## File Structure
```
/ryann-portfolio
  index.html          (landing page)
  main.html           (main site - single page scroll)
  404.html            (custom 404)
  secret.html         (easter egg)
  /css
    theme.css         (CSS variables, global styles)
    landing.css       (landing page styles)
    main.css          (main site styles)
    effects.css       (glitch, scanlines, CRT, animations)
  /js
    typing.js         (typing effect)
    glitch.js         (glitch text effect)
    navigation.js     (smooth scroll, nav highlight, [?] menu)
    easter-eggs.js    (konami code, console messages, context menu)
    contact.js        (form handling with Formspree)
  /images
    headshot.jpg      (to be provided by user)
  README.md
```

## Phase 1 (This Build)
Everything above. Full MVP: landing, main site, contact form, easter eggs, mobile responsive, deployed.
