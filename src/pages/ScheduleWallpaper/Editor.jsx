import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Check, ChevronDown, CircleAlert, ImageUp, Pencil, Plus, Trash2, TriangleAlert, X } from 'lucide-react';
import { days, getScheduleIssues } from '../../../shared/scheduleSchema.js';
import { formatTime } from '../../utils/canvasHelpers.js';
import './classEditDialog.css';

const newMeeting = () => ({ day: null, startTime: null, endTime: null, room: null, dateLabel: null });
const meetingSummary = meeting => `${meeting.startTime ? formatTime(meeting.startTime) : '—'}–${meeting.endTime ? formatTime(meeting.endTime) : '—'} · ${meeting.room || '—'}`;

function ClassDialog({ course, meetingIndex, isNew, showErrors, onSave, onDelete, onClose }) {
  const dialog = useRef(null);
  const [draft, setDraft] = useState(() => ({ subject: course.subject, courseCode: course.courseCode, meeting: { ...(course.meetings[meetingIndex] || newMeeting()) } }));
  const [mode, setMode] = useState(isNew ? 'edit' : 'view');
  const [submitted, setSubmitted] = useState(showErrors);
  const [touched, setTouched] = useState({});
  const errors = {
    subject: !draft.subject.trim() ? 'Enter a subject.' : '',
    day: !draft.meeting.day ? 'Choose a day.' : '',
    startTime: !draft.meeting.startTime ? 'Set a start time.' : '',
    endTime: !draft.meeting.endTime ? 'Set an end time.' : draft.meeting.startTime && draft.meeting.endTime <= draft.meeting.startTime ? 'End time must be after start time.' : '',
  };
  useEffect(() => {
    const node = dialog.current;
    node.showModal();
    (node.querySelector('[aria-invalid="true"]') || node.querySelector('input'))?.focus();
    return () => node.close();
  }, []);
  function submit(event) {
    event.preventDefault();
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) {
      requestAnimationFrame(() => dialog.current?.querySelector('[aria-invalid="true"]')?.focus());
      return;
    }
    onSave({ ...draft, subject: draft.subject.trim() });
  }
  function fieldProps(key) {
    const error = (submitted || touched[key]) && errors[key];
    return { id: `edit-class-${key}`, 'aria-invalid': !!error, 'aria-describedby': error ? `edit-class-${key}-error` : undefined, onBlur: () => setTouched(previous => ({ ...previous, [key]: true })) };
  }
  const errorMessage = key => (submitted || touched[key]) && errors[key] ? <p className="field-error" id={`edit-class-${key}-error`}><CircleAlert size={14} aria-hidden="true" />{errors[key]}</p> : null;
  const updateMeeting = (key, value) => setDraft(previous => ({ ...previous, meeting: { ...previous.meeting, [key]: value || null } }));
  const viewRows = [['Subject', draft.subject.trim()], ...(draft.courseCode ? [['Course code', draft.courseCode]] : []), ['Day', draft.meeting.day], ['Start time', draft.meeting.startTime ? formatTime(draft.meeting.startTime) : null], ['End time', draft.meeting.endTime ? formatTime(draft.meeting.endTime) : null], ['Room number', draft.meeting.room]];
  return <dialog ref={dialog} className="class-edit-dialog" aria-labelledby="class-edit-heading" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <header><h2 id="class-edit-heading">{isNew ? 'Add class' : mode === 'view' ? draft.subject.trim() || 'Class details' : 'Edit class'}</h2><button type="button" className="icon-button" aria-label="Close class editor" onClick={onClose}><X size={20} aria-hidden="true" /></button></header>
    {mode === 'view' ? <>
      {Object.values(errors).some(Boolean) && <div className="class-dialog-incomplete" role="status"><TriangleAlert size={18} aria-hidden="true" /><div><p className="class-dialog-incomplete-title">Incomplete details</p><p>Edit this class to add missing details.</p></div></div>}
      <dl className="class-dialog-view">{viewRows.map(([label, value]) => <div key={label} className="class-dialog-view-row"><dt>{label}</dt><dd>{value || '—'}</dd></div>)}</dl>
      <footer className="class-dialog-actions"><button type="button" className="button-secondary class-dialog-delete" onClick={onDelete}><Trash2 size={16} aria-hidden="true" />Delete</button><button type="button" className="button-primary" autoFocus onClick={() => setMode('edit')}><Pencil size={16} aria-hidden="true" />Edit</button></footer>
    </> : <form onSubmit={submit} noValidate>
      <div className="class-dialog-fields">
        <div className="field-label"><label htmlFor="edit-class-subject">Subject</label><input autoComplete="off" className="field-input" {...fieldProps('subject')} maxLength={160} value={draft.subject} onChange={event => setDraft({ ...draft, subject: event.target.value })} placeholder="Subject name" />{errorMessage('subject')}</div>
        <div className="field-label"><label htmlFor="edit-class-code">Course code <span className="field-optional">(optional)</span></label><input className="field-input" id="edit-class-code" maxLength={40} value={draft.courseCode || ''} onChange={event => setDraft({ ...draft, courseCode: event.target.value || null })} /></div>
        {course.meetings.length > 1 && <p className="class-shared-name-note">Subject and course code are shared across this class’s days. Day, time and room apply only to this row.</p>}
        <div className="field-label"><label htmlFor="edit-class-day">Day</label><div className="field-select"><select className="field-input" {...fieldProps('day')} value={draft.meeting.day || ''} onChange={event => updateMeeting('day', event.target.value)}><option value="">Choose day</option>{days.map(day => <option key={day}>{day}</option>)}</select><ChevronDown size={16} className="field-select-icon" aria-hidden="true" /></div>{errorMessage('day')}</div>
        <div className="class-dialog-times">{['startTime', 'endTime'].map(key => <div key={key} className="field-label"><label htmlFor={`edit-class-${key}`}>{key === 'startTime' ? 'Start time' : 'End time'}</label><input className="field-input" {...fieldProps(key)} type="time" value={draft.meeting[key] || ''} onChange={event => updateMeeting(key, event.target.value)} />{errorMessage(key)}</div>)}</div>
        <div className="field-label"><label htmlFor="edit-class-room">Room number <span className="field-optional">(optional)</span></label><input className="field-input" id="edit-class-room" maxLength={80} value={draft.meeting.room || ''} onChange={event => updateMeeting('room', event.target.value)} /></div>
      </div>
      <footer className="class-dialog-actions"><button type="button" className="button-secondary" onClick={onClose}><X size={16} aria-hidden="true" />Cancel</button><button type="submit" className="button-primary"><Check size={16} aria-hidden="true" />Save</button></footer>
    </form>}
  </dialog>;
}

function TitleDialog({ title, onSave, onClose }) {
  const dialog = useRef(null);
  const [value, setValue] = useState(title);
  useEffect(() => {
    const node = dialog.current;
    node.showModal();
    const input = node.querySelector('input');
    input.focus();
    input.select();
    return () => node.close();
  }, []);
  return <dialog ref={dialog} className="class-edit-dialog title-edit-dialog" aria-labelledby="title-edit-heading" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <header><h2 id="title-edit-heading">Edit schedule title</h2><button type="button" className="icon-button" aria-label="Close title editor" onClick={onClose}><X size={20} aria-hidden="true" /></button></header>
    <form onSubmit={event => { event.preventDefault(); onSave(value.trim() || 'Class Schedule'); }}>
      <div className="field-label"><label htmlFor="schedule-title">Title</label><input id="schedule-title" className="field-input" maxLength={48} value={value} onChange={event => setValue(event.target.value)} placeholder="Class Schedule" /></div>
      <footer className="class-dialog-actions"><button type="button" className="button-secondary" onClick={onClose}><X size={16} aria-hidden="true" />Cancel</button><button type="submit" className="button-primary"><Check size={16} aria-hidden="true" />Save</button></footer>
    </form>
  </dialog>;
}

export default function Editor({ schedule, onChange, onImport, preparingImage, validationRef, scheduleSource, scheduleTitle = 'Class Schedule', onTitleChange }) {
  const addButton = useRef(null);
  const titleButton = useRef(null);
  const lastTrigger = useRef(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [selection, setSelection] = useState(null);
  function closeTitle() {
    setEditingTitle(false);
    requestAnimationFrame(() => titleButton.current?.focus());
  }
  function closeDialog() {
    setSelection(null);
    requestAnimationFrame(() => {
      const trigger = lastTrigger.current;
      (trigger?.isConnected ? trigger : addButton.current)?.focus();
    });
  }
  function openClass(index, meetingIndex, trigger, showErrors = false) {
    lastTrigger.current = trigger || document.activeElement;
    setSelection({ index, meetingIndex, showErrors, isNew: false });
  }
  useImperativeHandle(validationRef, () => ({ validate() {
    const index = schedule.classes.findIndex(course => getScheduleIssues({ classes: [course] }).length);
    if (index < 0) return;
    const course = schedule.classes[index];
    const meetingIndex = Math.max(0, course.meetings.findIndex(meeting => !meeting.day || !meeting.startTime || !meeting.endTime || meeting.endTime <= meeting.startTime));
    openClass(index, meetingIndex, null, true);
  } }), [schedule]);
  function saveClass(draft) {
    const course = selection.isNew ? { subject: draft.subject, courseCode: draft.courseCode, meetings: [draft.meeting] } : {
      ...schedule.classes[selection.index], subject: draft.subject, courseCode: draft.courseCode,
      meetings: schedule.classes[selection.index].meetings.length ? schedule.classes[selection.index].meetings.map((meeting, index) => index === selection.meetingIndex ? draft.meeting : meeting) : [draft.meeting],
    };
    onChange({ ...schedule, classes: selection.isNew ? [...schedule.classes, course] : schedule.classes.map((item, index) => index === selection.index ? course : item) });
    closeDialog();
  }
  function deleteClass() {
    const course = schedule.classes[selection.index];
    const classes = course.meetings.length > 1 ? schedule.classes.map((item, index) => index === selection.index ? { ...item, meetings: item.meetings.filter((_, i) => i !== selection.meetingIndex) } : item) : schedule.classes.filter((_, index) => index !== selection.index);
    onChange({ ...schedule, classes });
    closeDialog();
  }
  const rows = schedule.classes.flatMap((course, index) => (course.meetings.length ? course.meetings : [newMeeting()]).map((meeting, meetingIndex) => ({ course, index, meeting, meetingIndex, incomplete: !!getScheduleIssues({ classes: [{ ...course, meetings: [meeting] }] }).length })));
  const dayGroups = [...days, 'Day needed'].map(day => ({
    day,
    rows: rows.filter(row => (row.meeting.day || 'Day needed') === day).sort((a, b) => (a.meeting.startTime || '99:99').localeCompare(b.meeting.startTime || '99:99')),
  })).filter(group => group.rows.length);
  return <section aria-labelledby="editor-heading" className="class-form row-class-editor rounded-xl border border-line bg-white">
    <div className="review-toolbar rounded-t-xl bg-soft px-4">
      <div className="schedule-title-control"><h2 id="editor-heading" className="schedule-title">{scheduleTitle}</h2><button ref={titleButton} type="button" className="icon-button" aria-label="Edit schedule title" aria-haspopup="dialog" onClick={() => setEditingTitle(true)}><Pencil size={15} aria-hidden="true" /></button></div>
      <div className="class-row-toolbar-actions">{onImport && <button type="button" className="button-secondary" data-import-trigger disabled={preparingImage} onClick={onImport}><ImageUp size={16} aria-hidden="true" />{preparingImage ? 'Preparing…' : <><span className="class-toolbar-label-full">{scheduleSource === 'image' ? 'Reupload image' : 'Upload image'}</span><span className="class-toolbar-label-short">Upload</span></>}</button>}<button ref={addButton} type="button" disabled={schedule.classes.length >= 40} className="button-primary class-row-add" onClick={event => { lastTrigger.current = event.currentTarget; setSelection({ isNew: true, index: schedule.classes.length, meetingIndex: 0, showErrors: false }); }}><Plus size={16} aria-hidden="true" /><span className="class-toolbar-label-full">Add class</span><span className="class-toolbar-label-short">Add</span></button></div>
    </div>
    <div className="border-t border-line">{dayGroups.flatMap(group => group.rows.map(({ course, index, meeting, meetingIndex, incomplete }) => <article key={`${index}-${meetingIndex}`} className="class-entry min-w-0 border-b border-line">
      <button type="button" className="class-entry-header class-summary-row class-row-edit" data-incomplete={incomplete} aria-describedby={incomplete ? `class-${index}-${meetingIndex}-warning` : undefined} aria-haspopup="dialog" aria-label={`Edit ${course.subject || 'New class'}, ${meeting.day || 'day needed'}, ${meeting.startTime ? formatTime(meeting.startTime) : 'time needed'}`} onClick={event => openClass(index, meetingIndex, event.currentTarget, incomplete)}>
        <span className="min-w-0 flex-1"><span className="class-name block text-sm font-semibold">{incomplete ? 'Incomplete details' : course.subject.trim()}{!incomplete && course.courseCode && <span className="class-code"> ({course.courseCode})</span>}</span>{incomplete ? <span id={`class-${index}-${meetingIndex}-warning`} className="class-row-details text-xs leading-[18px] text-muted">Edit this class to add missing details.</span> : <span className="class-row-details text-xs leading-[18px] text-muted"><span className="class-day-label" data-day={meeting.day}>{meeting.day.slice(0, 3)}</span><span>{meetingSummary(meeting)}</span></span>}</span>
        {incomplete && <span className="class-row-warning"><TriangleAlert size={18} aria-hidden="true" /></span>}
        <Pencil size={16} className="class-row-pencil" aria-hidden="true" />
      </button>
    </article>))}</div>
    {editingTitle && <TitleDialog title={scheduleTitle} onClose={closeTitle} onSave={value => { onTitleChange(value); closeTitle(); }} />}
    {selection && <ClassDialog key={`${selection.index}-${selection.meetingIndex}-${selection.isNew}`} course={selection.isNew ? { subject: '', courseCode: null, meetings: [newMeeting()] } : schedule.classes[selection.index]} meetingIndex={selection.meetingIndex} isNew={selection.isNew} showErrors={selection.showErrors} onClose={closeDialog} onSave={saveClass} onDelete={deleteClass} />}
  </section>;
}
