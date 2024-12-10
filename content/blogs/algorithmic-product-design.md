---
title: "Algorithmic Product Design"
date: 2024-12-10T12:00:00+09:00
draft: false
author: "Jon"
tags:
  - Rhino3D
  - Grasshopper
  - Parametric Design
image: https://github.com/jongarrison/241209_Laser_Cutter_Vent/raw/main/vent_rhino_view.png
description: "A Rhino3d/Grasshopper/Python code product design demo"
toc: false
---

It is fun to develop physical products using software development tools. In software, we expect to take well defined inputs and do transformations until we have the desired outputs. Designing and building things in the world is subject to a lot of different constraints than software, but in many parts of the design and manufacturing process there are opportunities to use software concepts to great advantage.


The demo project that I'm going to describe here, doesn't really deserve this treatment, but it was fun anyways! 


A product design project should begin with a discussion of the important elements of quality. What are the key features? What is the definition of success?


In this case, I needed a duct to fit in a specific location inside the vented eaves of my garage. It needed to lead the air from a flexible duct coming from a laser cutter to a smaller vent hole. The exit vent hole is obstructed in such a way that there needed to be an angled transition in the duct piece. I chose to implement this in Rhino 3D, Grasshopper, and Python.

* Fully parametric input with algorithmic part generation. Resulting parts should be properly generated over the full range of reasonable inputs. (This is subjective, of course). These inputs could come from an external data source, like a customer facing website or from a sales team.

* Python and C# code are used where appropriate to simplify steps that would reequire an unreasonable number of Grasshopper components. In a larger system code would be externalized so that it can be developed using standard software development tools (IDE's, source control, etc)

* The final part is built over logical steps that clearly flow from one to the next. The reasoning of the algorithm should be easy to parse either for another person or myself when returning much later. This is again, highly subjective, but I prefer to leave notes and some debug information in place when appropriate to make it easy to observe the internal workings of the process.

* The key measurements of the final part should be easily viewed to ensure that the part meets the intended requirements before fabricating the part. For this part I care about the resulting footprint dimensions and the angle of the first duct section. You can see how I obtained the measurements in the group titled, "Verify Important Measurements"

* A number of challenges are called out for future improvements. The current state of this achieved the goals I needed, but there are a few fun challenges that would really improve the part [unnecessarily]. I've left some of the incomplete tinkering code in place for future experimentation. It's good to be the right amount of "neat" for the project.


You can find the associated Grasshopper file [Here](https://github.com/jongarrison/241209_Laser_Cutter_Vent)

<img src="https://github.com/jongarrison/241209_Laser_Cutter_Vent/raw/main/vent_gh_view.png" />
