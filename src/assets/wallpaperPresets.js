export const mobileResolution = { id: 'mobile', width: 1080, height: 2400 };
export const deviceResolutions = { mobile: mobileResolution, tablet: { id: 'tablet', width: 1600, height: 2560 }, laptop: { id: 'laptop', width: 1920, height: 1080 } };
export const tabletLandscapeResolution = { ...deviceResolutions.tablet, width: deviceResolutions.tablet.height, height: deviceResolutions.tablet.width };

// Gallery examples never replace uploaded classes.
export const templateSchedule = {
  classes: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => ({
    subject: 'Subject name', courseCode: 'CLASS 101',
    meetings: [{ day, startTime: '08:00', endTime: '09:30', room: 'Room 101', dateLabel: null }],
  })), warnings: [],
};
export const mascotTemplateSchedule = templateSchedule;
export const dayColumnsPreviewSchedule = {
  classes: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].flatMap((day, dayIndex) =>
    Array.from({ length: [4, 2, 3, 2, 3][dayIndex] }, (_, index) => ({
      subject: 'Subject name', courseCode: `CLASS ${101 + dayIndex * 4 + index}`,
      meetings: [{ day, startTime: ['08:00', '10:00', '13:00', '15:00'][index], endTime: ['09:30', '11:30', '14:30', '16:30'][index], room: `Room ${101 + index}`, dateLabel: null }],
    }))),
  warnings: [],
};
export const galleryScheduleFor = template => ['day-columns', 'weekly'].includes(template.scheduleLayout) ? dayColumnsPreviewSchedule : templateSchedule;
