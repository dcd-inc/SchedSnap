begin;

alter table schedsnap_creator.profiles drop constraint if exists profiles_avatar_key_check;
alter table schedsnap_creator.profiles
  add constraint profiles_avatar_key_check
  check (avatar_key is null
    or avatar_key in ('cat', 'dog', 'rabbit', 'bird', 'fish', 'turtle')
    or avatar_key ~ '^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$');

commit;
