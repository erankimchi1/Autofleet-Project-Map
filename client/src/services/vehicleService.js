const vehicleService = {
    fetchVehicles: async () => {
        return await fetch("http://localhost:8000/vehicles").then(
            (response) => response.json()
        );
    },
    areaVerification: async(polygonCoordinates, flagReloaded) => {
        return await fetch('http://localhost:8000/vehicles/insideArea', {
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

