# GeoFS-Fuel
This is an experimental addon for GeoFS that attempts to simulate fuel consumption. It calculates fuel capacity based on aircraft mass and calculates burn rates based on engine RPM. It also accounts for afterburners on aircraft that have them and increases the burn rate accordingly. If you switch aircraft, it will recalculate the fuel quantity and burn rates for the new aircraft. When you run out of fuel, the engines will turn off and you won't be able to start them again until you refuel. To refuel, you must be on the ground, groundspeed 0, and engines off. You can fine-tune the fuel capacities and burn rate on lines 57 and 71 (the larger the values, the longer the endurance)(For line 71 you have to change both of the 150's). Happy Flying!
# Notes
@gui350Caden on Discord requests a way to calculate fuel endurance and give himself extra fuel: <br/>
find geofs.aircraft.instance.engines.thrust (or afterburnerThrust if you plan on crusing with afterburner) <br/>
then divide by 140<br/>
thats your idle rate, multiply by 3 to get full throttle burn rate per hour<br/>
then multiply the full throttle rate by the number of engines<br/>
thats your total burnrate per hour, at full throttle<br/>
then you can calculate fuel endurance accordingly
If you want a different value than 0.75 (on line 57) to give yourself extra endurance, divide the number of hours that you want by the number of hours of fuel that you have, according to the above calculations <br/>
multiply 140 by the resulting number (eg you want 15 hours, but only have 10 hours: 15/10=1.5)<br/>
then, you will get a new value. Replace 0.75 with that (in the above example, replace 0.75 with 1.125)<br/>
# Acknowlegdements
Thanks to @tylerbmusic (ggamergguy) for his help on the script.
