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
        fuelBarContainer.style.right = "170px";
        fuelBarContainer.style.width = "100px";
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
        refuelButton.style.right = "280px";
        refuelButton.style.padding = "4px 20px";
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
        let mass = geofs.aircraft.instance.definition.mass;
        let initialFuel = mass * 0.75;
        return { fuel: initialFuel, initialFuel };
    }

    let fuelUpdateInterval;
    function updateFuelSystem(fuelState, fuelBar, refuelButton) {
        fuelUpdateInterval = setInterval(() => {
            if (geofs.pause) return;
            const maxThrust = geofs.aircraft.instance.engines.reduce((sum, engine) => sum + (engine.thrust || 0), 0);
            const hasAfterburners = geofs.aircraft.instance.engines[0]?.afterBurnerThrust !== undefined;
            const usingAfterburners = hasAfterburners && Math.abs(geofs.animation.values.smoothThrottle) > 0.9;
            const totalAfterBurnerThrust = hasAfterburners ? geofs.aircraft.instance.engines.reduce((sum, engine) => sum + (engine.afterBurnerThrust || 0), 0) : 0;
            const currentThrust = usingAfterburners ? totalAfterBurnerThrust : Math.abs(geofs.animation.values.smoothThrottle) * maxThrust;
            const throttle = currentThrust / maxThrust;
            const idleBurnRate = usingAfterburners ? totalAfterBurnerThrust / 140 : maxThrust / 140;
            const fullThrottleBurnRate = idleBurnRate * 3;
            const fuelBurnRate = geofs.aircraft.instance.engine.on? idleBurnRate + throttle * (fullThrottleBurnRate - idleBurnRate) : 0;
            const timeElapsed = 1 / 3600;
            fuelState.fuel -= fuelBurnRate * timeElapsed;
            if (fuelState.fuel < 0) fuelState.fuel = 0;

            const fuelPercentage = (fuelState.fuel / fuelState.initialFuel) * 100;
            fuelBar.style.width = `${fuelPercentage}%`;
            fuelBar.style.backgroundColor = fuelPercentage > 15 ? "green" : fuelPercentage > 7 ? "orange" : "red";

            if (fuelState.fuel === 0) {
                setInterval(() => {
                    if (fuelState.fuel === 0) {
                        controls.throttle = 0
                        geofs.aircraft.instance.stopEngine();
                    }
                }, 10);
                console.log("Fuel depleted! Engines have been turned off.");
            }

            const groundSpeed = geofs.aircraft.instance.groundSpeed;
            const groundContact = geofs.aircraft.instance.groundContact;
            const engineOn = geofs.aircraft.instance.engine.on;
            refuelButton.style.display = (groundSpeed < 1 && groundContact && !engineOn) ? "block" : "none";
            console.log(`Fuel Burn Rate per Hour: ${fuelBurnRate.toFixed(6)}`);
            console.log(`Fuel Burned This Second: ${(fuelBurnRate / 3600).toFixed(6)}`);
            console.log(`Fuel Remaining: ${fuelState.fuel.toFixed(2)}`)
        }, 1000);
    }

    const fuelState = initializeFuelSystem();
    const { fuelBar, fuelBarContainer } = createFuelBar();
    const refuelButton = createRefuelButton(fuelState);
    updateFuelSystem(fuelState, fuelBar, refuelButton);
    let lastAircraftId = geofs.aircraft.instance.aircraftRecord.id;
    setInterval(() => {
        if (geofs.aircraft.instance.aircraftRecord.id !== lastAircraftId) {
            fuelBarContainer.remove();
            refuelButton.remove();
            lastAircraftId = geofs.aircraft.instance.aircraftRecord.id;
            clearInterval(fuelUpdateInterval);
            runFuelSystem();
        }
    }, 1000);
}

runFuelSystem();
