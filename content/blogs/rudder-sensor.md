---
title: "Rudder Sensor Project"
date: 2025-08-14T12:00:00+09:00
draft: false
author: "Jon"
tags:
  - Rhino3D
  - Grasshopper
  - Parametric Design
  - 3D Printing
  - Laser Cutting
image: /images/rudder-sensor/trimaran.png
description: "A Rhino3d/Grasshopper/Python code product design demo"
toc: false
---

I got invited to help with a fun boat project that I think illustrates some of the uses of parametric/generative design (and 3D printing and laser cutting). 

The initial call described a challenge with installing a RayMarine rotary rudder position sensor (for an autopilot) that might need an electronics solution (possibly with a linear potentiometer). The autopilot was on a large trimaran which because of the design of the rudder and steering system didn't provide access to the rudder post in a way that would allow normal installation of the sensor. The sensor allows more precise steering control by the autopilot.

<div>
    <img style="width: 49%" src="/images/rudder-sensor/raymarine_rotary_sensor.png" />
    <img style="width: 49%" src="/images/rudder-sensor/raymarine_sensor_w_cable.png" />
</div>

After looking at the problem a bit, I thought the most practical solution would be a mechanical solution by creating a quadrant of the correct geometry to convert the easily accessible rudder cable's linear motion into the expected rotary motion for the rudder position sensor. This would involve some straightforward math to create a section of a circle where the outer circumference length was based on the full travel range of the rudder cable over the degrees of motion expected by the sensor.

I attacked the problem with Rhino/Grasshopper. Because my initial visit to the boat was kind of impromptu and later visits would require rowing out to the boat in the harbor, my initial measurements for starting the project weren't that great. Also, the rudder position sensor was already wired into the boat in a way that made it impractical to remove. This is great for parametric/generative design as I can just proceed with the untrusted numbers and update them easily later. My initial 3D printed quadrant prototype was very close to fitting the mount on the sensor, but both the range of rotation of the sensor and linear travel of the rudder cable were incorrect. No problem! I was able to adjust the fit easily by updating the assumptions in Grasshopper and the new model generated properly. It's very satisfying when a model works well like this.

I was unsure about using 3D printed plastic to solve this problem (both because of the importance of the functioning and the operating environment). It was fairly easy to create the Grasshopper script in such a way that I generated both the 2D laser cutting files for a plywood quadrant and at the same time the 3D mesh file for the printed plastic version. The 2D output also allowed me to cut a cardboard model that helped with the initial sizing. I provided both the wood and plastic versions of the quadrant with the final installation. The 3D printed quadrant was incredibly strong, so I suspect it will serve well for a long time, but I'm glad there is a wood based backup.


Here are some pics of the installed solution and the process for making the parts:

<iframe width="420" height="315" src="https://www.youtube.com/embed/Yn4JwSPXNg4?mute=1&loop=1"></iframe>

<img style="" src="/images/rudder-sensor/bottom-view.png" />
<img style="" src="/images/rudder-sensor/block-view.png" />
<img style="" src="/images/rudder-sensor/rhino.png" />
<img style="" src="/images/rudder-sensor/grasshopper.png" />
<img style="" src="/images/rudder-sensor/laser-close.png" />
<img style="" src="/images/rudder-sensor/prusa-print.png" />
<img style="" src="/images/rudder-sensor/whole-assembly.png" />
<img style="" src="/images/rudder-sensor/wood-and-plastic-versions.png" />
<img style="" src="/images/rudder-sensor/wood-laser.png" />



