begin;

alter table schedsnap_creator.profiles
  add column avatar_key text
    check (avatar_key in ('cat', 'dog', 'rabbit', 'bird', 'fish', 'turtle'));

commit;
