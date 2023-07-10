const vehicleService = {
    fetchVehicles: async () => {
        return await fetch("https://autofleet-project-map-erankimchi1.onrender.com/vehicles").then(
            (response) => response.json()
        );
    },
    areaVerification: async(polygonCoordinates, flagReloaded) => {
        return await fetch('https://autofleet-project-map-erankimchi1.onrender.com/vehicles/insideArea', {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Polygon": JSON.stringify(polygonCoordinates),
            "X-Flag": flagReloaded
          }
        }).then(
          (response) => response.json()
        );
    }
}

export { vehicleService };

