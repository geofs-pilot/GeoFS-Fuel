# GeoFS-Fuel
This is an experimental addon for GeoFS that attempts to simulate fuel consumption. It calculates fuel capacity based on aircraft mass and calculates burn rates based on engine RPM. 
# Notes
@gui350Caden on Discord requests a way to calculate fuel endurance and give himself extra fuel: <br/>
Open the console while the addon is running and look at the "fuel remaining" and "fuel burn rate per hour" logs.
Divide the remaining fuel by your fuel burn rate per hour, which gives you the number of hours you can fly at your current throttle setting. If you want more endurance, you can delete massMultiplier from line 106 and replace it with another value, like 1.5. 
# Acknowledgements
Thanks to @RadioactivePotato's [info display](https://github.com/RadioactivePotato/GeoFS-Information-Display) for the percentage display code. <br/>
Thanks to @tylerbmusic (ggamergguy) for his help on the script.
