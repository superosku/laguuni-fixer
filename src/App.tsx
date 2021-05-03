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
  const dateFromIndex = (index: number) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date.toISOString().substr(0, 10)
  }

  const [dateIndexes, setDateIndexes] = React.useState([0, 1, 2, 3]);

  const dateStrings = React.useMemo(() => {
    return dateIndexes.map(dayId => {
      return dateFromIndex(dayId)
    })
  }, [dateIndexes]);

  const [availabilityInfo, setAvailabilityInfo] = React.useState<any>({});

  const fetchAndSetForDate = async (date: string) => {
    const dateInfo = await fetchForDate(date);
    setAvailabilityInfo((oldInfo: any) => {
      let newInfo = {...oldInfo};
      newInfo[date] = dateInfo;
      return newInfo
    })
  }

  React.useEffect(() => {
    (async () => {
      for (const dateIndex in dateStrings) {
        await fetchAndSetForDate(dateStrings[dateIndex])
      }
    })()
  }, [])

  const addDate = () => {
    const currentIndex = dateIndexes[dateIndexes.length - 1]
    const newDateIndexes = [...dateIndexes, currentIndex + 1];
    setDateIndexes(newDateIndexes)
    console.log('settingDateIndexes', newDateIndexes)
    fetchAndSetForDate(dateFromIndex(currentIndex + 1));
  }

  return <div>
    <table className={'main-table'}>
      <thead>
      <tr>
        <th>Time</th>
        {dateStrings.map(dateString => {
          return <th>{dateString}</th>
        })}
        <th></th>
      </tr>

      </thead>
      <tbody>
      {allTimes.map((timeString, index) => {
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
          {index === 0 &&
          <td rowSpan={allTimes.length}>
            <button className={'more-button'} onClick={addDate}>More</button>
          </td>
          }
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
      <span className={'main-info'}>Free slots for the pro cable during next X days.</span>
      <Calendar/>
      <p>Made by Oskari Lehto</p>
      <p>Codes at <a href={'https://github.com/superosku/laguuni-fixer'}>github</a></p>
      <p>Comments and suggestions to <a href={'https://github.com/superosku/laguuni-fixer/issues'}>github issues</a></p>
    </div>
  );
}

export default App;
