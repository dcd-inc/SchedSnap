begin;

alter table schedsnap_creator.profiles
  add column creator_name text
    check (creator_name = btrim(creator_name) and char_length(creator_name) between 1 and 60);

commit;
