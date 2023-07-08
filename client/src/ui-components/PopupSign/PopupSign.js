import React from 'react';
import { Popup } from 'react-leaflet';


function PopupSign({ vehicle }) {
    return (
        <Popup position={[vehicle.location.lat, vehicle.location.lng]}>
          <div>
            <h2>{"id: " + vehicle.id}</h2>
          </div>
        </Popup>
    );
}

export default PopupSign;