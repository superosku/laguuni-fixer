import React from 'react';
import './App.scss';

const baseUrl = 'https://johku.com/laguuni/fi_FI/products/6/availabletimes/'

let allTimes: string[] = []
for (let i = 0; i < 18; i ++) {
  const timeString = `${i+6}.00`.padStart(5, '0')
  allTimes.push(timeString)
}


const fetchForDateAndCount = async (date: string, count: string) => {
  const url = baseUrl + date + '.json?count=' + count;
  const response = await fetch(url)
  const responseJson = await response.json()
  return responseJson.starttimes
}


const fetchForDate = async (date: string) => {
  let freeTimeSlots: any = {}
  for (const timeIndex in allTimes) {
    freeTimeSlots[allTimes[timeIndex]] = 0
  }

  const slotsToCheck = [1, 2, 3, 4]
  for (const slotIndex in slotsToCheck) {
    const validStartTimes = await fetchForDateAndCount(date, slotsToCheck[slotIndex].toString())
    for (const startTimeIndex in validStartTimes) {
      freeTimeSlots[validStartTimes[startTimeIndex]] = slotsToCheck[slotIndex];
    }
  }
  return freeTimeSlots
}


const Calendar = () => {

  const dateStrings = [0, 1, 2, 3, 4, 5, 6].map(dayId => {
    const date = new Date();
    date.setDate(date.getDate() + dayId);
    return date.toISOString().substr(0, 10)
  })

  const [availabilityInfo, setAvailabilityInfo] = React.useState<any>({});

  React.useEffect(() => {
    (async () => {
      for (const dateIndex in dateStrings) {
        const dateInfo = await fetchForDate(dateStrings[dateIndex]);
        setAvailabilityInfo((oldInfo: any) => {
          let newInfo = {...oldInfo};
          newInfo[dateStrings[dateIndex]] = dateInfo;
          return newInfo
        })
      }
    })()
  }, [])


  return <div>
    <table className={'main-table'}>
      <thead>
      <tr>
        <th>Time</th>
        {dateStrings.map(dateString => {
          return <th>{dateString}</th>
        })}
      </tr>

      </thead>
      <tbody>
      {allTimes.map(timeString => {
        return <tr>
          <td>{timeString}</td>
          {dateStrings.map(dateString => {
            const isLoaded = availabilityInfo[dateString] !== undefined
            const availableSlots = availabilityInfo[dateString] && availabilityInfo[dateString][timeString];
            return <td className={`free-${availableSlots}`}>
              {isLoaded ? availableSlots : <div
                className="lds-dual-ring"
              />}
            </td>
          })}
        </tr>
      })}
      </tbody>
    </table>

  </div>
}

const App = () => {


  return (
    <div className="content">
      <h1>Laguuni fixer</h1>
      <span className={'main-info'}>Free slots for the pro cable during next 7 days.</span>
      <Calendar/>
    </div>
  );
}

export default App;
