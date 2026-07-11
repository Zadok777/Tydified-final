-- Merge the two permissive SELECT policies on profiles into one (perf lint
-- 0006). Semantics unchanged: read own profile OR a family member's profile.
drop policy if exists profiles_self_select on public.profiles;
drop policy if exists profiles_family_member_select on public.profiles;

create policy profiles_select on public.profiles
  for select using (
    id = (select auth.uid())
    or id in (
      select fm2.user_id
      from family_members fm1
      join family_members fm2 on fm2.family_id = fm1.family_id
      where fm1.user_id = (select auth.uid())
    )
  );
