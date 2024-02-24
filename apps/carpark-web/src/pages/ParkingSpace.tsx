import { SelectSpaceNumber, ReleaseSpaceNumber, DeactivateSpaceNumber, ActivateSpaceNumber } from '../services/ParkingSpace';
import '../styles/ParkingSpace.css';

export const ParkingSpaceFree = (props: any): JSX.Element => {
    if (props.isAlreadyBooked) {
      return (
        <div className="ParkingSpaceFree">
          <h1 className="SpaceNumber">{props.space_number}</h1>
        </div>
      );
    } else {
      return (
        <div className="ParkingSpaceFree">
          <h1 className="SpaceNumber">{props.space_number}</h1>
          <button className="booking-btn" onClick={() => SelectSpaceNumber(props)}>
            Book
          </button>
        </div>
      );
    }
  };
  
  export const ParkingSpaceBusy = (props: any): JSX.Element => {
    if (props.releaseAllowed) {
      return (
        <div className="ParkingSpaceBusy">
          <h1 className="SpaceNumber">{props.space_number}</h1>
          <h1 className="Name">{props.name}</h1>
          <h1 className="Surname">{props.surname}</h1>
          <button className="release-btn" onClick={() => ReleaseSpaceNumber(props)}>
            Release
          </button>
        </div>
      );
    } else {
      return (
        <div className="ParkingSpaceBusy">
          <h1 className="SpaceNumber">{props.space_number}</h1>
          <h1 className="Name">{props.name}</h1>
          <h1 className="Surname">{props.surname}</h1>
        </div>
      );
    }
  };

  export const ParkingSpaceRaw = (props: any): JSX.Element => {
      return (
        <div className="ParkingSpaceRaw">
          <h1 className="SpaceNumber">{props.space_number}</h1>
          <button className="deactivate-btn" onClick={() => DeactivateSpaceNumber(props)}>
            Deactivate
          </button>
        </div>
      );
  };
  
  export const ParkingSpaceNew = (props: any): JSX.Element => {
    return (
      <div className="ParkingSpaceNew">
        <input className="SpaceNumberInput" type="text" id="SpaceNumber"></input>
        <button className="activate-btn" onClick={() => ActivateSpaceNumber(props)}>
          Activate
        </button>
      </div>
    );
};