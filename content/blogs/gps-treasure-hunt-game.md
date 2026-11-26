---
title: "GPS Hot & Cold Treasure Hunt"
date: 2026-11-25T12:00:00-09:00
draft: true
author: "Jon"
tags:
  - Electronics
  - MicroPython
  - Python
  - GPS
  - Rhino3D
  - Parametric Design
  - 3D Printing
image: /images/gps-treasure-hunt-game/lantern_mode.jpg
description: "A handheld GPS treasure hunt game for kids, with a custom enclosure, a collapsible lantern, and electronics they can reconfigure later."
toc: false
---

<!--
Review draft: keep draft: true until ready to publish.
Web photos are resized to a maximum edge of 1600 pixels with private
metadata removed; the sRGB color profile is retained.

Sources: firmware README.md and README_technical.md, GPS module comparison
notes, enclosure README.md, and Jon's project recollections.
The older hardware notes describe an intermediate display configuration;
this draft follows the current technical README.
-->

I made a GPS-powered "hot and cold" treasure hunt game for the kids of some friends that live in remote Alaska. It's a handheld device with a screen, one button, and a GPS receiver. Hide some treasure, set its location, and hand the device to the player. As they walk around, the screen reports how close they are: **Red Hot!**, **Hot**, **Warm**, **Cold**, **Freezing**.

The project was also an opportunity to give the kids something they could learn from later. I left the internal components mounted on a breadboard so that they could learn about electronics, firmware, and later reconfiguration of the parts. It can be a game now and a collection of parts for another project later.

[Firmware and gameplay instructions](https://github.com/jongarrison/gps-treasure-hunt-game) - [Project pictures](https://photos.app.goo.gl/4tJFZiRLyB2C1WQTA)

![The completed GPS treasure hunt device with its collapsible lantern expanded and lit.](/images/gps-treasure-hunt-game/lantern_mode.jpg)

## How to play

A treasure hider finds a good spot to hide the treasure. Standing at that spot, they hold the button for 5 seconds to **bond** that location. This only works once the signal bar at the top of the screen is mostly full. Hold the device still outdoors with a clear view of the sky and let the fix settle before saving the location.

Then hand the device to the player. The main game screen shows a hot/cold word and the distance to the treasure. Keep walking toward the treasure until it's found! There's no win screen - the game just keeps updating hot/cold forever.

To hide a new treasure, hold the button for 5 seconds again at a new spot. The bonded location is remembered even after the device is turned off and back on.

Short-pressing the button cycles through four screens:

* **Game** - Hot/cold word and distance to the treasure. This is the one to leave on while playing.
* **GPS Debug** - Raw GPS numbers, useful for troubleshooting a weak signal.
* **Info** - Local Alaska time, current coordinates, and altitude.
* **Cheat** - Compass bearing and distance to the treasure, for when triangulating from hot/cold alone gets too hard.

The kids and the adults really enjoyed playing with the device. The various display pages were fun for the kids to ponder. There was a simplified hot/cold style view, but also more detailed meters-to-target and satellite GPS fix quality displays.

![An early breadboard prototype with the OLED showing GPS fix quality and distance.](/images/gps-treasure-hunt-game/initial_breadboard.jpg)

## Electronics and firmware

The hardware is fairly straightforward:

* Raspberry Pi Pico W running MicroPython
* Hosyond 0.96-inch 128x64 SSD1306 OLED display
* Grove Air530 GPS receiver
* A momentary button

The OLED connects over I2C and the GPS sends its data over UART. The whole firmware project is plain MicroPython, using built-in modules for the hardware interfaces, time, math, and saving the treasure location.

The code is split into a GPS parser, an OLED driver, and the main game loop. The GPS receiver streams NMEA sentences containing position, time, altitude, and satellite information. The game turns that information into distance and bearing to the saved treasure location.

One interesting part of the project was deciding when to trust the GPS position. Having a fix isn't quite the same thing as having a good fix. The signal bar across the top of the screen combines satellite count, satellite geometry (HDOP), and short-term position stability into a confidence score. The weakest of the three wins, so a fix isn't reported as confident while the position is still visibly settling. The device requires at least 80% confidence before bonding a treasure location.

This is an outdoor game. Buildings and trees can degrade the signal, and a larger antenna isn't a solution for deep-indoor use. I considered switching GPS modules, but stuck with the Air530. Its support for multiple satellite constellations was more useful for this project than trading that away for a larger antenna on an older GPS-only module.

![The enclosure with its lid removed, showing the breadboard, Pico W, GPS, display, and light/battery unit.](/images/gps-treasure-hunt-game/box_open.jpg)

## A box, a battery, and a lantern

I designed the enclosure in Rhino 8 using Python. The script builds a rounded electronics enclosure with a screw-down cap-style lid, component supports, and the required openings. Dimensions and placement choices are stored in a configuration file, so the fit can be adjusted without manually rebuilding the box.

The model includes supports and openings for the screen, GPS antenna, button, USB plug, and flashlight. Component previews show the breadboard, display, and GPS bodies in the open box for a combined fit check.

![The prototype electronics in front of the enclosure and lid model in Rhino.](/images/gps-treasure-hunt-game/beadboard_and_rhino_design.jpg)

The collapsible light/battery unit was useful for a few reasons:

* I already had it, and it could be used to power the device (or other things the kids wanted to power later).
* It had a solar panel for charging, so in theory the device could be solar powered.
* The integrated light could be used as a focused search light through the bottom of the box or as a tabletop lantern on the top.

It's a useful combination for a treasure hunt device!

![The focused search light shining through the bottom of the enclosure.](/images/gps-treasure-hunt-game/spotlight_mode.jpg)

## Something to play with, and something to tinker with

I enjoy projects that bring software, electronics, and 3D design together. In this case, the goal wasn't just to fit the parts into a box. I wanted to leave the kids with something fun to use and something they could later take apart, understand, and change.

If you'd like to build one or dig into how it works, the [code, wiring, and setup instructions](https://github.com/jongarrison/gps-treasure-hunt-game) are available.
