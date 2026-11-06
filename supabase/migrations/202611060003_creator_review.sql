begin;

alter table schedsnap_creator.submissions
  drop constraint submissions_status_check,
  add constraint submissions_status_check
    check (status in ('in_review', 'needs_changes', 'publishing', 'published', 'declined'));

create index creator_submissions_review_queue on schedsnap_creator.submissions (updated_at, id)
  where status in ('in_review', 'publishing');

commit;
