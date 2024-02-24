import '../styles/Global.css';
import { getBookingData, getBookingDataAdministration } from '../services/BookingContent';
import { ParkingSpaceFree, ParkingSpaceBusy, ParkingSpaceRaw, ParkingSpaceNew } from '../pages/ParkingSpace';
import { BookingData } from '../types/BookingTypes';
import { useState, useEffect } from 'react';
import '../styles/BookingContent.css';

export const BookingContent = (props: any): JSX.Element => {
    const refreshBookingContent = props.refreshBookingContent;
    const datetime_format = props.selected_date;
    const day = datetime_format.getDate().toString().padStart(2, '0');
    const month = (datetime_format.getMonth() + 1).toString().padStart(2, '0');
    const year = datetime_format.getFullYear().toString();
    const date_format = `${year}-${month}-${day}`;
    const [bookingData, setBookingData] = useState<Array<any> | null>(null);

    const weekday = props.weekday;
    const bookingMode = props.bookingMode;
  
    const refreshStatus = (): void => {
      props.refreshData();
    };
  
    useEffect(() => {
      getBookingData(date_format, weekday, bookingMode)
        .then((data) => {
          setBookingData(data);
        })
        .catch((error) => {
          console.error(error);
        });
    }, [date_format, weekday, refreshBookingContent]);
  
    if (bookingData === null) {
      // Data is still being fetched
      return <div>Loading...</div>;
    }
  
    // Generate the content using the bookingData
    const children: Array<JSX.Element> = [];
    let isAlreadyBooked = false;
    console.log(bookingMode !== 'Day');
    bookingData.forEach((element) => {
      if (element['username'] === localStorage.getItem('currentUsername') && (localStorage.getItem('role') !== 'admin' || bookingMode === 'Weekday')) {
        isAlreadyBooked = true;
      }
    });
    let releaseAllowed = false;
    bookingData.forEach((element) => {
      if (element['username'] === null) {
        children.push(
          <ParkingSpaceFree
            key={element['space_number']}
            space_number={element['space_number']}
            type={element['type']}
            date_format={date_format}
            weekday={weekday}
            bookingMode={bookingMode}
            isAlreadyBooked={isAlreadyBooked}
            refreshStatus={refreshStatus}
          />,
        );
      } else {
        if (element['username'] === localStorage.getItem('currentUsername')) {
          releaseAllowed = true;
        } else {
          releaseAllowed = false;
        }
        children.push(
          <ParkingSpaceBusy
            key={element['space_number']}
            space_number={element['space_number']}
            type={element['type']}
            date_format={date_format}
            weekday={weekday}
            bookingMode={bookingMode}
            name={element['name']}
            surname={element['surname']}
            releaseAllowed={releaseAllowed}
            refreshStatus={refreshStatus}
          />,
        );
      }
    });
    return <div className="BookingContent">{children}</div>;
  };
  
  
  export const BookingContentAdministration = (props: any): JSX.Element => {
    const refreshBookingContent = props.refreshBookingContent;
    const [bookingData, setBookingData] = useState<Array<BookingData> | null>(null);

  
    const refreshStatus = (): void => {
      props.refreshData();
    };
  
    useEffect(() => {
      getBookingDataAdministration()
        .then((data) => {
          setBookingData(data);
        })
        .catch((error) => {
          console.error(error);
        });
    }, [refreshBookingContent]);
  
    if (bookingData === null) {
      // Data is still being fetched
      return <div>Loading...</div>;
    }
  
    // Generate the content using the bookingData
    const children: Array<JSX.Element> = [];
    bookingData.forEach((element) => {
        children.push(
          <ParkingSpaceRaw
            key={element['space_number']}
            space_number={element['space_number']}
            refreshStatus={refreshStatus}
          />,
        );
    });

    children.push(
      <ParkingSpaceNew
        key={0}
        refreshStatus={refreshStatus}
        bookingData={bookingData}
      />,
    );
    return <div className="BookingContent">{children}</div>;
  };