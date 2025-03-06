# GeoFS-Fuel
This is an experimental addon for GeoFS that attempts to simulate fuel consumption. It calculates fuel capacity based on aircraft mass and calculates burn rates based on engine RPM. It also accounts for afterburners on aircraft that have them and increases the burn rate accordingly. If you switch aircraft, it will recalculate the fuel quantity and burn rates for the new aircraft. When you run out of fuel, the engines will turn off and you won't be able to start them again until you refuel. To refuel, you must be on the ground, groundspeed 0, and engines off. You can fine-tune the fuel capacities and burn rate on lines 57 and 71 (the larger the values, the longer the endurance)(For line 71 you have to change both of the 140's). Happy Flying!
# Notes
@gui350Caden on Discord requests a way to calculate fuel endurance and give himself extra fuel: <br/>
find geofs.aircraft.instance.engines.thrust (or afterburnerThrust if you plan on crusing with afterburner) <br/>
then divide by 140<br/>
thats your idle rate, multiply by 3 to get full throttle burn rate per hour<br/>
then multiply the full rate by the amount of engines<br/>
thats your total burnrate per hour, at full throttle<br/>
then you can calculate fuel endurance accordingly.
If you want a different value than 140 (on line 71) to give yourself extra endurance, divide the number of hours that you want by the number of hours of fuel that you have, according to the above calculations <br/>
multiply 140 by the resulting number (eg you want 15 hours, but only have 10 hours: 15/10=1.5)<br/>
then, you will get a new value. Replace 140 with that (in the above example, replace 140 with 210)<br/>
if using afterburners, change both the numbers<br/>
if not, changing only the 2nd one will work, though to prevent confusion I recommend changing both
# Acknowlegdements
Thanks to @tylerbmusic (ggamergguy) for his help on the script.
