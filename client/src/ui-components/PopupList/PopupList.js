import React from 'react';

function PopupList({ vehicleInArea }) {
    const closeDiv = () => {
        let myDiv = document.getElementById("container-div-id");
        myDiv.style.display = "none";
    };
    
    return (
        <div className="container-div" id="container-div-id">
        <h1>IDs Vehicles Marked</h1>
          <button className="close-button" onClick={closeDiv}>&times;</button>
          <ul className="coordinates-list">
            {
              vehicleInArea.map((item, index) => (<li className="coordinates-item" key={index}>#{index} : {item.id}</li>))
            }
          </ul>
      </div>
    );
}

export default PopupList;