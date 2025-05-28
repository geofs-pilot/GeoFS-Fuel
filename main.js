function runFuelSystem() {
    function createFuelBar() {
        const fuelBarContainer = document.createElement("div");
        fuelBarContainer.style.position = "absolute";
        fuelBarContainer.style.bottom = "8px";
        fuelBarContainer.style.right = "108px";
        fuelBarContainer.style.width = "75px";
        fuelBarContainer.style.height = "17px";
        fuelBarContainer.style.border = "1px solid black";
        fuelBarContainer.style.borderRadius = "5px";
        fuelBarContainer.style.backgroundColor = "black";
        fuelBarContainer.style.zIndex = "1000";

        const fuelBar = document.createElement("div");
        fuelBar.style.height = "100%";
        fuelBar.style.width = "100%";
        fuelBar.style.backgroundColor = "green";
        fuelBar.style.borderRadius = "5px";

        fuelBarContainer.appendChild(fuelBar);
        document.querySelector(".geofs-ui-bottom").appendChild(fuelBarContainer);
        return { fuelBar, fuelBarContainer };
    }

    function createRefuelButton(fuelState) {
        const refuelButton = document.createElement("button");
        refuelButton.textContent = "Refuel";
        refuelButton.style.position = "absolute";
        refuelButton.style.bottom = "5px";
        refuelButton.style.right = "191px";
        refuelButton.style.padding = "4px 8px";
        refuelButton.style.fontSize = "14px";
        refuelButton.style.backgroundColor = "yellow";
        refuelButton.style.border = "1px solid black";
        refuelButton.style.borderRadius = "5px";
        refuelButton.style.zIndex = "1000";
        document.querySelector(".geofs-ui-bottom").appendChild(refuelButton);
        
        refuelButton.addEventListener("click", () => {
            fuelState.fuel = fuelState.initialFuel;
            console.log("Plane refueled.");
        });
        return refuelButton;
    }
	(function() {
    'use strict';

    // Update display
    function updateFlightDataDisplay() {
       

            var fuelValue = globalThis.fuelPercentage;
var fuelPercentage = (fuelValue !== undefined)
    ? (fuelValue === 0
        ? '0%'
        : (fuelValue < 1 ? '1%' : fuelValue.toFixed(0) + '%'))
    : 'N/A';

            // Display css
let geofsUI = document.querySelector(".geofs-ui-bottom");
        if (geofsUI) {
            var flightDataElement = document.getElementById('flightDataDisplay');
            if (!flightDataElement) {
                flightDataElement = document.createElement('div');
                flightDataElement.id = 'flightDataDisplay';
                flightDataElement.style.height = '36px';
                flightDataElement.style.minWidth = '64px';
                flightDataElement.style.padding = '0 16px';
                flightDataElement.style.display = 'inline-block';
                flightDataElement.style.fontFamily = '"Roboto", "Helvetica", "Arial", sans-serif';
                flightDataElement.style.fontSize = '14px';
                flightDataElement.style.fontWeight = '500';
                flightDataElement.style.textTransform = 'uppercase';
                flightDataElement.style.overflow = 'hidden';
                flightDataElement.style.willChange = 'box-shadow';
                flightDataElement.style.transition = 'box-shadow .2s cubic-bezier(.4,0,1,1), background-color .2s cubic-bezier(.4,0,.2,1), color .2s cubic-bezier(.4,0,.2,1)';
                flightDataElement.style.textAlign = 'center';
                flightDataElement.style.lineHeight = '36px';
                flightDataElement.style.verticalAlign = 'middle';
                flightDataElement.style.pointerEvents = 'none'; // Make the display clickable through
                document.body.appendChild(flightDataElement);
            }
}
                geofsUI.appendChild(flightDataElement),



            flightDataElement.innerHTML = `
                <span style="background: 0 0; border: none; border-radius: 2px; color: #000; display: inline-block; padding: 0 8px;">FUEL ${fuelPercentage}</span>
            `;
            if (flight.recorder.playing) {
                flightDataElement.style.display = "none";
            } else {
                flightDataElement.style.display = "inline-block";
            }
        
    }
    // Update flight data display every 100ms
    setInterval(updateFlightDataDisplay, 100);

})();

    function initializeFuelSystem() {
        let mass = window.geofs.aircraft.instance.definition.mass;
        let massMultiplier;
        if (mass <15000) {
            massMultiplier = 0.25;
        } else {
            massMultiplier = 0.75;
        }

        globalThis.initialFuel = mass * massMultiplier;
        return { fuel: initialFuel, initialFuel };
    }

    let fuelUpdateInterval;
    function updateFuelSystem(fuelState, fuelBar, refuelButton) {
        fuelUpdateInterval = setInterval(() => {
            if (window.geofs.pause) return;
            if (window.flight.recorder.playing) return;
	    if (document.hidden) return;
            const maxThrust = window.geofs.aircraft.instance.engines.reduce((sum, engine) => sum + (engine.thrust || 0), 0);
            const hasAfterburners = window.geofs.aircraft.instance.engines[0]?.afterBurnerThrust !== undefined;
            const usingAfterburners = hasAfterburners && Math.abs(window.geofs.animation.values.smoothThrottle) > 0.9;
            const totalAfterBurnerThrust = hasAfterburners ? window.geofs.aircraft.instance.engines.reduce((sum, engine) => sum + (engine.afterBurnerThrust || 0), 0) : 0;
            const throttle = Math.abs(window.geofs.animation.values.smoothThrottle);
            const currentThrust = usingAfterburners ? totalAfterBurnerThrust : throttle * maxThrust;
            const idleBurnRate = usingAfterburners ? totalAfterBurnerThrust / 150 : maxThrust / 150;
            const fullThrottleBurnRate = idleBurnRate * 3;
//let fuelBurnRate;

        
            fuelBurnRate = window.geofs.aircraft.instance.engine.on ? idleBurnRate + throttle * (fullThrottleBurnRate - idleBurnRate) : 0;
            if (maxThrust == 0) {
               fuelBurnRate = 0
            }

	

            const timeElapsed = 1 / 3600;
            fuelState.fuel -= fuelBurnRate * timeElapsed;
            if (fuelState.fuel < 0) fuelState.fuel = 0;

            globalThis.fuelPercentage = (fuelState.fuel / fuelState.initialFuel) * 100;
            fuelBar.style.width = `${fuelPercentage}%`;
            fuelBar.style.backgroundColor = fuelPercentage > 20 ? "green" : fuelPercentage > 10 ? "orange" : "red";

         if (fuelState.fuel === 0) {
            window.fuelBurnRate = 0; // Reset fuel burn rate when fuel is empty
         }

            console.log(`Fuel Burn Rate per Hour: ${fuelBurnRate.toFixed(6)}`);
            console.log(`Fuel Burned This Second: ${(fuelBurnRate / 3600).toFixed(6)}`);
            console.log(`Fuel Remaining: ${fuelState.fuel.toFixed(2)}`)
        }, 1000);
    }
    
    setInterval(() => {
        if (fuelState.fuel === 0) {
            controls.throttle = 0;
            window.geofs.aircraft.instance.stopEngine();
        }
    }, 10);

    const fuelState = initializeFuelSystem();
    const { fuelBar, fuelBarContainer } = createFuelBar();
    const refuelButton = createRefuelButton(fuelState);
    updateFuelSystem(fuelState, fuelBar, refuelButton);
    let lastAircraftId = window.geofs.aircraft.instance.aircraftRecord.id;
    setInterval(() => {
        if (window.geofs.aircraft.instance.aircraftRecord.id !== lastAircraftId) {
            fuelBarContainer.remove();
            refuelButton.remove();
            lastAircraftId = window.geofs.aircraft.instance.aircraftRecord.id;
            clearInterval(fuelUpdateInterval);
            runFuelSystem();
        }
    }, 1000);

    setInterval(() => {
    	const groundSpeed = window.geofs.aircraft.instance.groundSpeed;
const groundContact = window.geofs.aircraft.instance.groundContact;
const engineOn = window.geofs.aircraft.instance.engine.on;
if (flight.recorder.playing) {
    refuelButton.style.display = "none"
    fuelBarContainer.style.display = "none"
} else {
    refuelButton.style.display = (groundSpeed < 1 && groundContact && !engineOn) ? "block" : "none";
    fuelBarContainer.style.display = "block"
}
    }, 100);
}

runFuelSystem();
