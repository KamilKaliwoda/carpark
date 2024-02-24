import axios from 'axios';
import { BookingData } from '../types/BookingTypes';

export function SelectSpaceNumber(props: any) {
      if (props.bookingMode === 'Day') {
        axios
        .get('http://' + String(process.env.API_IP) + ':' + String(process.env.API_PORT) + '/bookParkingSpace', {
          params: {
            space_number: props.space_number,
            username: localStorage.getItem('currentUsername'),
            selected_date: props.date_format,
          },
        })
        .then((response) => {
          if (response.data['status'] === 0) {
            alert('This space is already busy');
          }
          props.refreshStatus();
        })
        .catch((error) => {
          console.error(error);
        });
      } else {
        axios
        .get('http://' + String(process.env.API_IP) + ':' + String(process.env.API_PORT) + '/bookWeekdayParkingSpace', {
          params: {
            space_number: props.space_number,
            username: localStorage.getItem('currentUsername'),
            weekday: props.weekday,
          },
        })
        .then((response) => {
          if (response.data['status'] === 0) {
            alert('This space is already busy');
          }
          props.refreshStatus();
        })
        .catch((error) => {
          console.error(error);
        });
      }
  }
  
  export function ReleaseSpaceNumber(props: any) {
    if (props.bookingMode === 'Day') {
      axios
      .get('http://' + String(process.env.API_IP) + ':' + String(process.env.API_PORT) + '/releaseParkingSpace', {
        params: {
          space_number: props.space_number,
          username: localStorage.getItem('currentUsername'),
          selected_date: props.date_format,
          type: props.type,
        },
      })
      .then(() => {
        props.refreshStatus();
      })
      .catch((error) => {
        console.error(error);
      });
    } else {
      axios
      .get('http://' + String(process.env.API_IP) + ':' + String(process.env.API_PORT) + '/releaseWeekdayParkingSpace', {
        params: {
          space_number: props.space_number,
          username: localStorage.getItem('currentUsername'),
          weekday: props.weekday,
        },
      })
      .then(() => {
        props.refreshStatus();
      })
      .catch((error) => {
        console.error(error);
      });
    }
  }

  export function DeactivateSpaceNumber(props: any) {
    if (confirm("Are you sure, you want to deactivate this space? \nThis operation will deactivate all bookings related to this space.")) {
      axios
      .get('http://' + String(process.env.API_IP) + ':' + String(process.env.API_PORT) + '/deactivateParkingSpace', {
        params: {
          space_number: props.space_number,
        },
      })
      .then(() => {
        alert("Space number has been deactivated.")
        props.refreshStatus();
      })
      .catch((error) => {
        console.error(error);
      });
    }
  }

  export function ActivateSpaceNumber(props: any) {
    const spaceNumber = Number((document.getElementById('SpaceNumber') as HTMLInputElement).value);
    if (!spaceNumber) {
      alert('Space number should be a number');
      return;
    } else if (props.bookingData.some((obj: BookingData) => obj.space_number === spaceNumber)) {
      alert('This space already exists');
      return;
    }
    console.log(spaceNumber);
    axios
    .get('http://' + String(process.env.API_IP) + ':' + String(process.env.API_PORT) + '/activateParkingSpace', {
      params: {
        spaceNumber: spaceNumber,
      },
    })
    .then(() => {
      props.refreshStatus();
    })
    .catch((error) => {
      console.error(error);
    });
  }