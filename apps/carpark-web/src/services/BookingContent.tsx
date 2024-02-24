import axios from 'axios';

export async function getBookingData(selected_date: string, weekday: string, bookingMode: string) {
  if (bookingMode === 'Day') {
    if (selected_date === null) {
      alert('Invalid date');
      return;
    }
    try {
      const response = await axios.get(
        'http://' +
          String(process.env.API_IP) +
          ':' +
          String(process.env.API_PORT) +
          '/getBookingConfiguration',
        {
          params: {
            selected_date: selected_date,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  } else {
    if (weekday === null) {
      alert('Invalid weekday');
      return;
    }
    try {
      const response = await axios.get(
        'http://' +
          String(process.env.API_IP) +
          ':' +
          String(process.env.API_PORT) +
          '/getBookingWeekdayConfiguration',
        {
          params: {
            weekday: weekday,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export async function getBookingDataAdministration() {
  try {
    const response = await axios.get(
      'http://' +
        String(process.env.API_IP) +
        ':' +
        String(process.env.API_PORT) +
        '/getBookingConfigurationAdministration',
      {
        params: {},
      },
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
