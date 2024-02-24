import { LogOutUser } from '../services/CarparkBookingPage';
import { BookingContent, BookingContentAdministration } from '../pages/BookingContent';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useEffect, useState } from 'react';
import '../styles/Global.css';
import '../styles/CarparkBookingPage.css';
import { BookingDays, BookingMode } from '../types/BookingTypes';

import Root from '../root.component';

export const CarparkBookingPage = (props: any): JSX.Element => {
  const userRole: string = localStorage.getItem('role')!;
  const hideAdministrationButton: boolean = userRole !== 'admin';
  const [administrationMode, setAdministrationMode] = useState<boolean>(false);
  const [selectedDate, setDate] = useState<any | null>(new Date());
  const [bookingMode, setMode] = useState<BookingMode>(BookingMode.Day);
  const [weekday, setWeekday] = useState<BookingDays>(BookingDays.Monday);
  const [refreshBookingContent, setRefreshBookingContent] = useState<boolean>(true);
  const start_date = new Date();
  const max_date = new Date();
  max_date.setDate(max_date.getDate() + 14);
  const old_date = new Date();
  old_date.setDate(old_date.getDate() - 14);

  const BookingDaysKeys = Object.keys(BookingDays);
  const BookingDaysElements: Array<JSX.Element> = [];
  BookingDaysKeys.forEach(key => {
    if (key === weekday) {
      BookingDaysElements.push(
        <button key={key} className="WeekdayButtonSelected" disabled>{key}</button>
      );
    } else {
      const keyValue = BookingDays[key as keyof typeof BookingDays];
      BookingDaysElements.push(
        <button key={key} className="WeekdayButton" onClick={() => setWeekday(keyValue)}>{key}</button>
      );
    }
  });

  const refreshData = () => {
    setRefreshBookingContent(prevState => !prevState);
  };

  useEffect(() => {
    refreshData();
  }, [bookingMode]);

  return (
    <div className="CarparkBookingPage">
      <div className="BookingPageHeader">
        <div className="ModeContainer">
          <div className="BookingModeContainer">
            {bookingMode === 'Day' && !administrationMode ? (
              <button className='ModeButton' onClick={() => {setMode(BookingMode.Weekday)}}>Show weekday mode</button>
            ) : ( bookingMode === 'Weekday' && !administrationMode ? (
              <button className='ModeButton' onClick={() => {setMode(BookingMode.Day)}}>Show day mode</button>
            ) : null
            )}
          </div>
          <div className="AdministrationModeContainer">
            {!administrationMode ? (
              <button className='AdministrationButton' hidden={hideAdministrationButton} onClick={() => {setAdministrationMode(true)}}>Show administration mode</button> 
            ) : ( 
              <button className='AdministrationButton' onClick={() => {setAdministrationMode(false)}}>Show booking mode</button> 
            )}
          </div>
        </div>
        <div className="DateContainer">
          {bookingMode === 'Day' && !administrationMode ? (
            <DatePicker
              id="DatePicker"
              minDate={start_date}
              maxDate={max_date}
              dateFormat="dd-MM-yyyy"
              selected={selectedDate}
              onChange={(date) => setDate(date)}
            />
          ) : ( bookingMode === 'Weekday' && !administrationMode ? (
            BookingDaysElements
          ) : null
          )}
        </div>
        <div className="UserInfoContainer">
          <div className="UserData">
            <div className="NameAndSurname">
              <div id="NameSurnameField">Name and Surname:</div>
              <label htmlFor="NameSurnameField" className="UserInfoLabel">
                {localStorage.getItem('currentName')! + ' ' + localStorage.getItem('currentSurname')!}
              </label>
            </div>
            <div className="Username" id="Username">
              <div id="UsernameField">Username:</div>
              <label htmlFor="Username" className="UserInfoLabel">
                {localStorage.getItem('currentUsername')}
              </label>
            </div>
            <button className="logout-btn" onClick={() => LogOutUser(props)}>
              Log out
            </button>
          </div>
        </div>
      </div>
      {!administrationMode ? (
        <BookingContent selected_date={selectedDate} refreshData={refreshData} weekday={weekday} bookingMode={bookingMode} refreshBookingContent={refreshBookingContent}/>
      ) : (
        <BookingContentAdministration refreshData={refreshData} refreshBookingContent={refreshBookingContent}/>
      )}
    </div>
  );
};
