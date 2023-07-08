import React, { useEffect, useState } from "react";
import { MapContainer, FeatureGroup} from "react-leaflet";
import "./App.css";
import { EditControl } from "react-leaflet-draw";
import MarkerSign from './ui-components/MarkerSign/MarkerSign.js';
import TileLayerMap from './ui-components/TileLayerMap/TileLayerMap.js';
import PopupList from "./ui-components/PopupList/PopupList";

function App() {
  const [Vehicles, setVehicle] = useState([]);
  const [vehicleInArea, setVehicleInside] = useState([]);
  const [polygonCoordinates, setPolygonCoordinates] = useState([]);
  const [flagCreated, setFlagCreated] = useState(false);
  const [flagReloaded, setFlagReloaded] = useState(true);
  const [newSession, setNewSession] = useState(true);
  const [deletedPolygons, setDeletedPolygons] = useState([]);
  const [polygonsAfterDeleted, setPolygonsAfterDeleted] = useState([]);

  // Function to collect data
  const getApiData = async () => {
    const response = await fetch("http://localhost:8000/vehicles").then(
      (response) => response.json()
    );
    setVehicle(response);
  };
  useEffect(() => {
    getApiData();
  }, []);

  const _onCreate = (e) => {
    setFlagCreated(true);
    const { layerType, layer } = e;
    if (layerType === "polygon") {
      const coordinates = layer
        .getLatLngs()[0]
        .map((latLng) => [latLng.lat, latLng.lng]);
        setPolygonCoordinates((poly) => [...poly, coordinates])
    }
  };

  const getVehiclesInsideArea = async () => {
      const response = await fetch('http://localhost:8000/vehicles/insideArea', {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Polygon": JSON.stringify(polygonCoordinates),
          "X-Flag": flagReloaded
        }
      }).then(
        (response) => response.json()
      );
      setVehicleInside(response);
      setFlagReloaded(false);
      let myDiv = document.getElementById("container-div-id");
      console.log(newSession);
      if (!newSession){
        myDiv.style.display = "block";
        newSessionState();
      } 
  };
  useEffect(() => {
    let myDiv = document.getElementById("container-div-id");
    if(vehicleInArea[0] !== undefined) {
      console.log(vehicleInArea[0])
      myDiv.style.display = "block";
    }
    else myDiv.style.display = "none";
  }, [vehicleInArea,polygonCoordinates]);

  useEffect(() => {
    window.addEventListener("load", resetVehicleState);
    if (flagCreated && Vehicles) {
      getVehiclesInsideArea();
    }
    setFlagCreated(false);
  }, [flagCreated]);

  const _onDelete = (e) => {
    const { layers} = e;
    const lays = layers._layers;
    for (const [key, value] of Object.entries(lays)) {
      setDeletedPolygons((deletedPolygons) => [...deletedPolygons, value._latlngs]);
    }
  };

  useEffect(() => {
    const convertCord = () => {
      if (deletedPolygons !== null) {
        convertCoordinates(deletedPolygons);
        handleDeletion();
      }
    };

    convertCord();
  }, [deletedPolygons]);

  useEffect(() => {
    const deletedUpdate = () => {
      if (polygonsAfterDeleted !== null) {
        setPolygonCoordinates(polygonsAfterDeleted);
      }
    };

    deletedUpdate();
  }, [polygonsAfterDeleted]);

  useEffect(() => {
      if (polygonsAfterDeleted === polygonCoordinates) {
        getVehiclesInsideArea();
      }
  }, [polygonsAfterDeleted, polygonCoordinates]);

  const convertCoordinates = (coordinates) => {
    let result = [];
    coordinates.forEach((subList) => {
      let subResult = [];
      subList.forEach((afterSubList) => {
        afterSubList.forEach((coordinate) => {
          let lat = coordinate.lat;
          let lng = coordinate.lng;
          subResult.push([lat, lng]);
        })
        result.push(subResult);
      });
    });
    return removeDuplicateArr(result);
  };

  const removeDuplicateArr = (result) => {
    const uniqueResult = result.reduce((accumulator, currentArray) => {
      const stringifiedArray = JSON.stringify(currentArray);
      if (!accumulator.includes(stringifiedArray)) accumulator.push(stringifiedArray);
      return accumulator;
    }, []).map((stringifiedArray) => JSON.parse(stringifiedArray));
    return uniqueResult;
  }

  const handleDeletion = () => {
    const arrayDeleted = new Set(convertCoordinates(deletedPolygons).map(JSON.stringify));
    const filteredArray = polygonCoordinates.filter(item => {
      return !arrayDeleted.has(JSON.stringify(item));
    });
    setPolygonsAfterDeleted(filteredArray);
  }
  
  const resetVehicleState = () => setFlagReloaded(true);
  const newSessionState = () => setNewSession(false);

  return (
    <div>
      {window.addEventListener("load", resetVehicleState)}
      <PopupList vehicleInArea={ vehicleInArea }/>
      <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={true}>
        <FeatureGroup>
          <EditControl
            position="topleft"
            onCreated={_onCreate}
            onDeleted={_onDelete}
            draw={{
              marker: false,
              circlemarker: false,
              circle: false,
              rectangle: false,
              polygon: true,
              polyline: false,
            }}
            edit = {{
              edit: false
            }}
          />
        </FeatureGroup>
        <TileLayerMap />
        {Vehicles.map((vehicle) => (
          <MarkerSign vehicle={ vehicle }/>
        ))}
        ;
      </MapContainer>
    </div>

  );
}
export default App;