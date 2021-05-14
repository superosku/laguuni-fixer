import React from 'react';
import {ClockIcon, ChevronRightIcon} from '@heroicons/react/outline';
import './App.scss';

const baseUrl = 'https://johku.com/laguuni/fi_FI/products'

let allTimes: string[] = []
for (let i = 0; i < 14; i++) {
  const timeString = `${i + 9}.00`.padStart(5, '0')
  allTimes.push(timeString)
}


const fetchForDateAndCount = async (date: string, count: string, cableId: number) => {
  const url = `${baseUrl}/${cableId}/availabletimes/${date}.json?count=${count}`
  const response = await fetch(url)
  const responseJson = await response.json()
  return responseJson.starttimes
}


const fetchForDate = async (date: string, cableId: number) => {
  let freeTimeSlots: any = {}
  for (const timeIndex in allTimes) {
    freeTimeSlots[allTimes[timeIndex]] = 0
  }

  const slotsToCheck = [1, 2, 3, 4]

  const allValidStartTimes = await Promise.all(slotsToCheck.map(slot => {
    return fetchForDateAndCount(
      date, slot.toString(), cableId
    )
  }))

  for (const i in slotsToCheck) {
    const slot = slotsToCheck[i];
    const validStartTimes = allValidStartTimes[i];
    for (const startTimeIndex in validStartTimes) {
      freeTimeSlots[validStartTimes[startTimeIndex]] = slot;
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

interface ICalendarProps {
  cableId: number
}

const Calendar = ({cableId}: ICalendarProps) => {
  const dateFromIndex = (index: number) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date
  }

  const [dateIndexes, setDateIndexes] = React.useState([0, 1, 2, 3, 4]);

  const dateStrings = React.useMemo(() => {
    const value = dateIndexes.map(dayId => {
      const date = dateFromIndex(dayId);
      return {
        date: dateToIsoNoTimezone(date),
        day: dates[date.getDay()],
        formatted: `${date.getMonth() + 1}/${date.getDate()}`,
      }
    })
    return value
  }, [dateIndexes]);

  const [availabilityInfo, setAvailabilityInfo] = React.useState<any>({});

  const fetchAndSetForDate = async (date: string) => {
    const dateInfo = await fetchForDate(date, cableId);
    setAvailabilityInfo((oldInfo: any) => {
      let newInfo = {...oldInfo};
      newInfo[date] = dateInfo;
      return newInfo
    })
  }

  React.useEffect(() => {
    (async () => {
      for (const dateIndex in dateStrings) {
        fetchAndSetForDate(dateStrings[dateIndex].date)
      }
    })()
  }, [])

  const addDate = () => {
    setDateIndexes(current => {
      const currentIndex = current[current.length - 1]
      const newDateIndexes = [...current, currentIndex + 1];
      fetchAndSetForDate(dateToIsoNoTimezone(dateFromIndex(currentIndex + 1)));
      return newDateIndexes
    })
  }

  return <div
    className={'table-container'}
  >
    <table className={'main-table'}>
      <thead>
      <tr>
        <th className={'sticky'}>
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
      </tr>

      </thead>
      <tbody>
      {allTimes.map((timeString, index) => {
        return <tr className={'main-row'}>
          <td className={'sticky'}>
            <span className={'time-info'}>
              {timeString}
            </span>
          </td>
          {dateStrings.map(dateString => {
            const isLoaded = availabilityInfo[dateString.date] !== undefined
            const availableSlots = availabilityInfo[dateString.date] && availabilityInfo[dateString.date][timeString];
            return <td>
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
        </tr>
      })}
      </tbody>
    </table>
    <div className={'more-container'}>
      <button className={'more-button'} onClick={() => {
        addDate()
        addDate()
        addDate()
      }}>
        Show More
        <ChevronRightIcon className={'chevron'}/>
      </button>
    </div>
  </div>
}

const App = () => {

  const cableOptions = [
    {
      name: 'LaguuniPro',
      id: 6,
    },
    {
      name: 'LaguuniEasy',
      id: 7,
    },
  ]

  const [currentCableId, setCurrentCableId] = React.useState(cableOptions[0].id)

  return (
    <div className="content">
      <h1 className={'main-header'}>FREE SLOTS</h1>
      <div className={'tab-container'}>
        {cableOptions.map((cableOption) => {
          return <span
            className={'location-info' + (cableOption.id === currentCableId ? ' selected' : '')}
            onClick={() => {
              setCurrentCableId(cableOption.id)
            }}
          >@{cableOption.name}</span>
        })}
      </div>
      <Calendar key={currentCableId} cableId={currentCableId}/>
      <p>Made by Oskari Lehto</p>
      <p>Codes at <a href={'https://github.com/superosku/laguuni-fixer'}>github</a></p>
      <p>Comments and suggestions to <a href={'https://github.com/superosku/laguuni-fixer/issues'}>github issues</a></p>
    </div>
  );
}

export default App;
