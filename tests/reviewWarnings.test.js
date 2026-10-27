import test from 'node:test';
import assert from 'node:assert/strict';
import { getReviewWarnings } from '../src/utils/canvasHelpers.js';
import { scheduleSchema, getScheduleIssues } from '../shared/scheduleSchema.js';

const course = (subject, courseCode, startTime, endTime) => ({ subject, courseCode, meetings: [{ day: 'Monday', startTime, endTime, room: null, dateLabel: null }] });

test('overlaps update from edited times and stale AI notes never keep them visible', () => {
  const schedule = { classes: [course('Computing', 'CS101', '08:00', '10:00'), course('Mathematics', 'MATH1', '09:00', '11:00')], warnings: ['Two classes overlap.', 'CS101: Check the blurry room number.'] };
  assert.deepEqual(getReviewWarnings(schedule).warnings, ['CS101: Check the blurry room number.', 'Monday: CS101 and MATH1 overlap.']);
  schedule.classes[1].meetings[0].startTime = '10:00';
  assert.deepEqual(getReviewWarnings(schedule), { overlapWarnings: [], warnings: ['CS101: Check the blurry room number.'] });
  schedule.classes[1].meetings[0].startTime = '09:00';
  assert.equal(getReviewWarnings(schedule).overlapWarnings.length, 1);
  schedule.classes.pop();
  assert.equal(getReviewWarnings(schedule).overlapWarnings.length, 0);
});

test('old conflict notes clear even when restored from a saved draft', () => {
  const schedule = { classes: [course('Computing', 'CS101', '08:00', '10:00')], warnings: ['Class times conflict.', 'Two classes happen at the same time.', 'Some names are cut off. Check the original image.'] };
  assert.deepEqual(getReviewWarnings(schedule).warnings, ['Some names are cut off. Check the original image.']);
});

test('an unreadable title imports as blank and must be filled in before continuing', () => {
  const schedule = { classes: [course('', 'CS101', '08:00', '10:00')], warnings: [] };
  assert.equal(scheduleSchema.safeParse(schedule).success, true);
  assert.deepEqual(getScheduleIssues(schedule), ['Every class needs a subject name.']);
  schedule.classes[0].subject = 'Computing';
  assert.deepEqual(getScheduleIssues(schedule), []);
});
