alter table schedsnap_creator.submissions
  add column if not exists device text not null default 'mobile'
  check (device in ('mobile', 'tablet', 'laptop'));
