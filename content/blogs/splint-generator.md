---
title: "Finger Splint Generator"
date: 2025-02-02T12:00:00+09:00
draft: false
author: "Jon"
tags:
  - Rhino
  - Grasshopper
  - Generative Design
  - Parametric Design
image: /images/splint/splint_on_model.png
description: "Grasshopper script for generating finger splints"
toc: false
---

I recently got to talk to a doctor that mentioned the challenges of creating an effective finger splint for certain types of injuries. I considered it a bit and thought it might be interesting to try to come up with a solution in [Grasshopper](/blogs/ptwd250115/). 

I started by creating a basic finger model (and then added the rest of the hand for fun). The finger model allows inputting various dimensions for the injured finger:
- Angle in degrees at each phalange
- Diameter (mm) at base of each phalange
- Length (mm) of each phalange

Once the finger model is in position, a number of projections can be done to create a shape that envelopes the finger. One issue to account for is varying levels of swelling to prepare for this, I leave an opening down the side of the splint which allows for expansion/contraction for swelling and ease of putting the splint on. When viewed from the fingertip, the splint supports the model finger down the middle exactly, but then widens to the sides to accomodate swelling while still locking the finger in the desired position. The sides of the splint are truncated in a flat surface that will allow easy 3D FDM printing.

I printed an example for my own finger and it seemed to work very well. I currently imagine it being secured with tape.

What do you think about this work in progress? If you'd like to talk about it, feel free to reach out to me on [LinkedIn](https://www.linkedin.com/in/jonathangarrison/)

<p align="center">
    <img src="/images/splint/gh_screen.png" />
    <img src="/images/splint/measuring.png" />
    <img src="/images/splint/prusa_bed.png" />
    <img src="/images/splint/printed_splint.png" />
</p>