import dayjs from '../web_modules/dayjs.js';
import utc from '../web_modules/dayjs/plugin/utc.js';
dayjs.extend(utc);

import ics from '../web_modules/ics.js';
import { slots, fractals, days } from './data/slots.js';

const getSlotInfo = course => {
	if (course.lecture === 'NA') return [];
	const courseSlots = slots[course.lecture[0]],
		startDate = fractals[course.lecture[1]].start,
		endDate = fractals[course.lecture[2]].end;

	return { slots: courseSlots, startDate, endDate };
};

const dateArray = date => {
	return [
		date.year(),
		date.month() + 1,
		date.date(),
		date.hour(),
		date.minute(),
	];
};

const nextWeekday = (date, weekday) => {
	if (date.day() <= weekday) {
		// then just give me this week's instance of that day
		return date.day(weekday);
	} else {
		// otherwise, give me next week's instance of that day
		return date.add(1, 'week').day(weekday);
	}
};

const generateIcal = selectedCourses =>
	ics.createEvents(
		selectedCourses
			.map(course => ({ ...course, ...getSlotInfo(course) }))
			.map(course => {
				return course.slots.map(slot => {
					const isoDay = days.indexOf(slot.day),
						fractalStart = dayjs(fractals[course.lecture[1]].start),
						[startHr, startMin] = slot.start.split(':'),
						[endHr, endMin] = slot.end.split(':');

					const startDate = nextWeekday(fractalStart, isoDay)
							.hour(startHr)
							.minute(startMin),
						start = dateArray(startDate),
						end = dateArray(startDate.hour(endHr).minute(endMin));

					const byDay = slot.day.slice(0, 2).toUpperCase(),
						until = dayjs(fractals[course.lecture[2]].end)
							.hour(23)
							.minute(59)
							.format('YYYYMMDDTHHmmss');

					return {
						title: `${course.code} ${course.name}`,
						location: course.link,
						start,
						end,
						recurrenceRule: `FREQ=WEEKLY;BYDAY=${byDay};INTERVAL=1;UNTIL=${until}`,
						description: `Instructor: ${course.instructor}`,
						startOutputType: 'local',
					};
				});
			})
			.flat(),
	);

export function makeCalendar(selectedCourses) {
	const { value, error } = generateIcal(selectedCourses);
	if (error) throw error;
	return value;
}
