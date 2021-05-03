import React from 'react';
import {ClockIcon, ChevronRightIcon} from '@heroicons/react/outline';
import './App.scss';

const baseUrl = 'https://johku.com/laguuni/fi_FI/products/6/availabletimes/'

let allTimes: string[] = []
for (let i = 0; i < 18; i++) {
  const timeString = `${i + 6}.00`.padStart(5, '0')
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

const dates = [
  'SUN',
  'MON',
  'TUE',
  'WED',
  'THU',
  'FRI',
  'SAT',
]

const dateToIsoNoTimezone = (date: Date) => {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

const Calendar = () => {
  const dateFromIndex = (index: number) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date
  }

  const [dateIndexes, setDateIndexes] = React.useState([0, 1, 2, 3]);

  const dateStrings = React.useMemo(() => {
    const value = dateIndexes.map(dayId => {
      const date = dateFromIndex(dayId);
      return {
        date: dateToIsoNoTimezone(date),
        day: dates[date.getDay()],
        formatted: `${date.getMonth()}/${date.getDate()}`,
      }
    })
    return value
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
        await fetchAndSetForDate(dateStrings[dateIndex].date)
      }
    })()
  }, [])

  const addDate = () => {
    const currentIndex = dateIndexes[dateIndexes.length - 1]
    const newDateIndexes = [...dateIndexes, currentIndex + 1];
    setDateIndexes(newDateIndexes)
    console.log('settingDateIndexes', newDateIndexes)
    fetchAndSetForDate(dateToIsoNoTimezone(dateFromIndex(currentIndex + 1)));
  }

  return <div
    className={'table-container'}
  >
    <table className={'main-table'}>
      <thead>
      <tr>
        <th>
          <div className={'clock-container'}>
            <ClockIcon className={'clock'}/>
          </div>
        </th>
        {dateStrings.map(dateString => {
          return <th>
            <div className={'date-header'}>
              <span>{dateString.day}</span>
              <span>{dateString.formatted}</span>
            </div>
          </th>
        })}
        {/*<th></th>*/}
      </tr>

      </thead>
      <tbody>
      {allTimes.map((timeString, index) => {
        return <tr>
          <td>
            <span className={'time-info'}>
            {timeString}
            </span>
          </td>
          {dateStrings.map(dateString => {
            const isLoaded = availabilityInfo[dateString.date] !== undefined
            const availableSlots = availabilityInfo[dateString.date] && availabilityInfo[dateString.date][timeString];
            return <td
            >
              <div className={'color-container'}>
                {isLoaded ?
                  availableSlots > 0 &&
                  <span
                    className={`color-indicator free-${availableSlots}`}
                  >
                  {availableSlots}
                </span>
                  : <div
                    className="lds-dual-ring"
                  />}
              </div>
            </td>
          })}
          {/*{index === 0 &&*/}
          {/*<td rowSpan={allTimes.length}>*/}
          {/*  <button className={'more-button'} onClick={addDate}>More</button>*/}
          {/*</td>*/}
          {/*}*/}
        </tr>
      })}
      </tbody>
    </table>
    <div className={'more-container'}>
      <button className={'more-button'} onClick={addDate}>
        Show More
        <ChevronRightIcon className={'chevron'}/>
      </button>
    </div>
  </div>
}

const App = () => {


  return (
    <div className="content">
      <h1 className={'main-header'}>FREE SLOTS</h1>
      <span className={'location-info'}>@Lagguni ProCable</span>
      <Calendar/>
      <p>Made by Oskari Lehto</p>
      <p>Codes at <a href={'https://github.com/superosku/laguuni-fixer'}>github</a></p>
      <p>Comments and suggestions to <a href={'https://github.com/superosku/laguuni-fixer/issues'}>github issues</a></p>
    </div>
  );
}

export default App;
