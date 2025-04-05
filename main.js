//GeoFS Fuel: Attempts to simulate fuel consumption somewhat realistically
//Calculates fuel capacity based on aircraft mass
//Calculates burn rates based on RPM
//Recalculates when switching aircraft
//Accounts for afterburner use
//Shuts off engines when fuel depleted
//Must be on the ground, groundspeed 0, and engines off to refuel
//Fine-tune endurance and burnrates on lines 57 and 71 - the higher the values, the longer the endurance (for line 82, change both of the 140's)

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

    function initializeFuelSystem() {
        let mass = window.geofs.aircraft.instance.definition.mass;
        globalThis.initialFuel = mass * 0.75;
        return { fuel: initialFuel, initialFuel };
    }

    let fuelUpdateInterval;
    function updateFuelSystem(fuelState, fuelBar, refuelButton) {
        fuelUpdateInterval = setInterval(() => {
            if (window.geofs.pause) return;
            if (window.flight.recorder.playing) return;
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

            const fuelPercentage = (fuelState.fuel / fuelState.initialFuel) * 100;
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
