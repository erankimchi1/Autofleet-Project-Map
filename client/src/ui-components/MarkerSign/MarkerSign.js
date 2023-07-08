import React from 'react';
import { Marker } from 'react-leaflet';
import PopupSign from '../PopupSign/PopupSign.js';

function MarkerSign({ vehicle }) {
    return (
        <Marker
            position={[vehicle.location.lat, vehicle.location.lng]}
        >
        <PopupSign vehicle = {vehicle} />
      </Marker>
    );
}

export default MarkerSign;