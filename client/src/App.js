import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, FeatureGroup} from "react-leaflet";
import "./App.css";
import { EditControl } from "react-leaflet-draw";

function App() {
  const [Vehicles, setVehicle] = useState([]);
  const [vehicleInArea, setVehicleInside] = useState([]);
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

  const [polygonCoordinates, setPolygonCoordinates] = useState([]);
  const [flagCreated, setFlagCreated] = useState(false);
  const [flagReloaded, setFlagReloaded] = useState(true);
  const [newSession, setNewSession] = useState(true);
  const [deletedPolygons, setDeletedPolygons] = useState([]);
  const [polygonsAfterDeleted, setPolygonsAfterDeleted] = useState([]);


  const _onCreate = (e) => {
    setFlagCreated(true);
    const { layerType, layer } = e;
    // console.log(e)
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

  const resetVehicleState = () => setFlagReloaded(true);
  const newSessionState = () => setNewSession(false);


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

  const closeDiv = () => {
    let myDiv = document.getElementById("container-div-id");
    myDiv.style.display = "none";
  } 


  useEffect(() => {
    const convertCord = () => {
      // Perform actions that depend on the data variable
      if (deletedPolygons !== null) {
        convertCoordinates(deletedPolygons)
        handleDeletion();
      }
    };

    convertCord();
  }, [deletedPolygons]);

  useEffect(() => {
    const deletedUpdate = () => {
      if (polygonsAfterDeleted !== null) {
        setPolygonCoordinates(polygonsAfterDeleted)
      }
    };

    deletedUpdate();
  }, [polygonsAfterDeleted]);

  useEffect(() => {
      if (polygonsAfterDeleted === polygonCoordinates) {
        getVehiclesInsideArea()
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
    return removeDuplicateArr(result)
  }

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
      console.log(arrayDeleted.has(JSON.stringify(item)))
      return !arrayDeleted.has(JSON.stringify(item));
    });
    setPolygonsAfterDeleted(filteredArray);
  }

  return (
    <div>
      {window.addEventListener("load", resetVehicleState)}
      <div className="container-div" id="container-div-id">
        <h1>IDs Vehicles Marked</h1>
          <button className="close-button" onClick={closeDiv}>&times;</button>
          <ul className="coordinates-list">
            {
              vehicleInArea.map((item, index) => (<li className="coordinates-item" key={index}>#{index} : {item.id}</li>))
            }
          </ul>
      </div>
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
        <TileLayer
          attribution='&copy; <a  href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {Vehicles.map((vehicle) => (
          <Marker
            key={vehicle.id}
            position={[vehicle.location.lat, vehicle.location.lng]}
          >
            <Popup position={[vehicle.location.lat, vehicle.location.lng]}>
              <div>
                <h2>{"id: " + vehicle.id}</h2>
              </div>
            </Popup>
          </Marker>
        ))}
        ;
      </MapContainer>
      {/* {<pre className="text-left">{JSON.stringify(deletedPolygons.forEach(value => console.log(value[0])))}</pre>} */}
      {/* {<pre className="text-left">{JSON.stringify(polygonCoordinates)}</pre>} */}

      {/* {<pre className="text-left">{JSON.stringify(polygonCoordinates)}</pre>}
      {<pre className="text-left">{JSON.stringify(convertCoordinates(deletedPolygons))}</pre>}
      {<pre className="text-left">{JSON.stringify(polygonsAfterDeleted)}</pre>} */}


    </div>

  );
}

export default App;

// import React, {L, useEffect, useState } from "react";
// import {MapContainer, TileLayer, Marker, Popup, FeatureGroup} from 'react-leaflet';
// import './App.css';
// // import { SectionMarker } from "./sectionMarker";
// import { EditControl } from 'react-leaflet-draw';
// // import PolygonMap from "./polygon.js";
// import * as turf from '@turf/turf'

// function App() {
//   const [ Vehicles, setVehicle] = useState([]);
//   const [ v, setV] = useState([]);
//   // Function to collect data
//   const getApiData = async () => {
//     const response = await fetch(
//       "http://localhost:8000/vehicles"
//     ).then((response) => response.json());
//     setVehicle(response);
//   };
//   useEffect(() => {
//     getApiData();
//   }, []);
//   //  console.log(Vehicles);
//   // const [mapLayers, setMapLayers] = useState([]);
//   const [polygonCoordinates, setPolygonCoordinates] = useState([]);
//   const [area, setArea] = useState([]);
//   const [flagCreated, setFlagCreated] = useState([false]);

//   const _onCreate = (e) => {
//     console.log(e);
//     setFlagCreated(true);
//     const { layerType, layer } = e;
//     if (layerType === "polygon") {
//       const coordinates = layer.getLatLngs()[0].map((latLng) => [latLng.lat, latLng.lng]);
//       if (coordinates.length > 0) coordinates.push(coordinates[0]);
//       setPolygonCoordinates(coordinates);
//       const polygon = turf.polygon([coordinates]);
//       const polygonArea = turf.area(polygon);
//       setArea(polygonArea);
  
//       // Add popup to the created polygon
//       layer.bindPopup(`${v}`).openPopup();
//     }
//   }

//   // const _onCreate = (e) =>{
//   //   console.log(e);
//   //   setFlagCreated(true);
//   //   const { layerType, layer } = e;
//   //   if (layerType === "polygon") {
//   //     // const coordinates = layer.getLatLngs()[0].map((latLng) => [latLng.lat, latLng.lng]);
//   //     Vehicles.map(vehicle => {
//   //       // let key = vehicle.id;
//   //       // position=[vehicle.location.lat, vehicle.location.lng]
//   //       // var m = L.marker([vehicle.location.lat, vehicle.location.lng]);
//   //     })
//   //       // console.log(Vehicles);

//   //     const coordinates = layer.getLatLngs()[0].map((latLng) => [latLng.lat, latLng.lng]);
//   //     if (coordinates.length > 0) coordinates.push(coordinates[0]);
//   //     setPolygonCoordinates(coordinates);
//   //     const polygon = turf.polygon([coordinates]);
//   //     const polygonArea = turf.area(polygon);
//   //     setArea(polygonArea);
//   //     // console.log(coordinates);
//   //     // checkCoordinateInsidePolygon([51.5181808472, -0.1702733338])
//   //   }
//   //  }
//    useEffect( () => {
//     if (flagCreated && Vehicles){
//       Vehicles.map(vehicle => {
//          let key = vehicle.id;
//         // position=[vehicle.location.lat, vehicle.location.lng]
//         // var m = L.marker([vehicle.location.lat, vehicle.location.lng]);
//         checkCoordinateInsidePolygon([vehicle.location.lat, vehicle.location.lng]);
//       })

//     }
//   }, [flagCreated]);

//   const checkCoordinateInsidePolygon = (coordinate) => {
//       console.log(polygonCoordinates.length);
//       if (polygonCoordinates.length > 0) {
//         const point = turf.point(coordinate);
//         const polygon = turf.polygon([polygonCoordinates]);
//         const isInside = turf.booleanPointInPolygon(point, polygon);
//         // console.log(coordinate);
//         // v.push(coordinate);
//         if (isInside) setV(v => [...v, coordinate]);
//         return isInside;
//       }
//       return false;
//     }; 

//   //  console.log(Vehicles);
//   //  const checkCoordinateInsidePolygon = (coordinate) => {
//   //   console.log(polygonCoordinates.length);
//   //   if (polygonCoordinates.length > 0) {
//   //     const point = turf.point(coordinate);
//   //     const polygon = turf.polygon([polygonCoordinates]);
//   //     const isInside = turf.booleanPointInPolygon(point, polygon);
//   //     console.log(coordinate);
//   //     return isInside;
//   //   }
//   //   return false;
//   // };
//   // const _onCreate = (e) =>{
//   //   console.log(e);
//   //   const { layerType, layer } = e;
//   //   if (layerType === "polygon") {
//   //     const { _leaflet_id } = layer;
//   //     setMapLayers((layers) => [
//   //       ...layers,
//   //       { id: _leaflet_id, latlngs: layer.getLatLngs()[0] },
//   //     ]);
//   //     // console.log(mapLayers);
//   //   }
//   //  }


//   // const getVehiclesInsideArea = async (coordinates) => {
//   //   const response = await fetch(
//   //     `http://localhost:8000/vehicles/insideArea/${coordinates}`
//   //   ).then((response) => response.json());
//   //   console.log(response);
//   // };
//   // useEffect(() => {
//   //   // getVehiclesInsideArea();
//   // }, []);

//   return (
//     <div> 
//       <button onClick={console.log(v)}>
          
//       </button>
//       <MapContainer  center={[51.505, -0.09]} zoom={13} scrollWheelZoom={true} >

//         <FeatureGroup >
//           <EditControl

//               position="topleft"
//               onCreated={_onCreate}

//               draw={{
//                 marker: false,
//                 circlemarker: false,
//                 circle:false,
//                 rectangle: false,
//                 polygon: true,
//                 polyline: false
//               }} />
//         </FeatureGroup>
//         <TileLayer
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />
//         {Vehicles.map(vehicle => (
//           <Marker

//             key={vehicle.id}
//             position={[vehicle.location.lat, vehicle.location.lng]}>
//             <Popup position={[vehicle.location.lat, vehicle.location.lng]}>
//               <div>
//                 <h2>{"id: " + vehicle.id}</h2>
//               </div>
//             </Popup>
//           </Marker>
//         ))};
//       </MapContainer>
//       {/* <pre className="text-left">{JSON.stringify(Vehicles)}</pre> */}
//       <pre className="text-left">{JSON.stringify(v, 0, 2)}</pre>
//     </div>
//   );
  
// }


// export default App;
