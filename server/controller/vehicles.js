// import vehiclesData from '../data/vehicles-location.json'
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let vehiclesData;
let vehicleInsideArea = [];

export const getVehicles = (req, res) => {
    res.send(vehiclesData);
}

export const getVehiclesInsideArea = (req, res) => {
    let found = false;
    const polygon = JSON.parse(req.headers['x-polygon']);
    vehicleInsideArea = [];
    polygon.forEach(p => {
        vehiclesData.forEach((k, v) => {
            if(isPointInsidePolygon([k.location.lat, k.location.lng], p)){
                found = vehicleInsideArea.find( (element) => element.id === k.id);
                if (!found) vehicleInsideArea.push(k)
            }
        })
    })
    res.send(vehicleInsideArea);
}

const isPointInsidePolygon = (point, polygon) => {
    let latitude = point[0];
    let longitude = point[1];
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        let polyLatitudeI = polygon[i][0];
        let polyLongitudeI = polygon[i][1];
        let polyLatitudeJ = polygon[j][0];
        let polyLongitudeJ = polygon[j][1];

        let intersect = ((polyLatitudeI > latitude) !== (polyLatitudeJ > latitude)) &&
                    (longitude < (polyLongitudeJ - polyLongitudeI) * (latitude - polyLatitudeI) / (polyLatitudeJ - polyLatitudeI) + polyLongitudeI);

        if (intersect) inside = !inside;
    }
    return inside;
  }

  const filePath = path.join(__dirname, '..', 'data', 'vehicles-location.json');
  fs.readFile(filePath, 'utf8', (error, data) => {
    if(error){
       console.log(error);
       return;
    }
    vehiclesData = JSON.parse(data);
})