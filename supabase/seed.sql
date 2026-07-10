-- Tydified dev seed data.
--
-- Prerequisite: a parent must already exist in auth.users — sign up in the app
-- first, then run this against the dev project (Supabase SQL editor, or
-- `supabase db execute --file supabase/seed.sql` when linked).
--
-- It targets the parent with email 'demo@tydified.app' if present, otherwise the
-- first user. Re-running is safe: it skips if the demo family already exists.
-- Seeds bypass RLS (run as the table owner), so direct inserts are fine here.

do $$
declare
  v_user   uuid;
  v_family uuid;
  v_child1 uuid;
  v_child2 uuid;
  v_chore  uuid;
  v_reward uuid;
begin
  select id into v_user from auth.users
    where email = 'demo@tydified.app' order by created_at limit 1;
  if v_user is null then
    select id into v_user from auth.users order by created_at limit 1;
  end if;
  if v_user is null then
    raise notice 'No auth users found — sign up in the app first, then re-run seed.sql';
    return;
  end if;

  if exists (
    select 1 from public.families
    where created_by = v_user and name = 'The Demo Family'
  ) then
    raise notice 'Demo family already exists for this user; skipping.';
    return;
  end if;

  insert into public.profiles (id, display_name)
    values (v_user, 'Demo Parent')
    on conflict (id) do nothing;

  insert into public.families (name, created_by)
    values ('The Demo Family', v_user)
    returning id into v_family;

  insert into public.family_members (family_id, user_id, role)
    values (v_family, v_user, 'parent')
    on conflict do nothing;

  insert into public.user_settings (user_id)
    values (v_user)
    on conflict do nothing;

  -- Children (DOB drives the age tier; is_under_13 is set by trigger)
  insert into public.children (family_id, name, date_of_birth, points)
    values (v_family, 'Ava', (current_date - interval '9 years')::date, 120)
    returning id into v_child1;
  insert into public.children (family_id, name, date_of_birth, points)
    values (v_family, 'Liam', (current_date - interval '13 years')::date, 60)
    returning id into v_child2;

  -- Chores + assignments across a few statuses
  insert into public.chores (family_id, title, category, point_value, frequency, created_by)
    values (v_family, 'Make your bed', 'bedroom', 5, 'daily', v_user)
    returning id into v_chore;
  insert into public.chore_assignments (chore_id, child_id, assigned_by, status, due_date)
    values (v_chore, v_child1, v_user, 'assigned', current_date);

  insert into public.chores (family_id, title, category, point_value, frequency, created_by)
    values (v_family, 'Take out the trash', 'other', 10, 'weekly', v_user)
    returning id into v_chore;
  insert into public.chore_assignments (chore_id, child_id, assigned_by, status, due_date)
    values (v_chore, v_child2, v_user, 'submitted', current_date);

  insert into public.chores (family_id, title, category, point_value, frequency, created_by)
    values (v_family, 'Homework done', 'homework', 15, 'daily', v_user)
    returning id into v_chore;
  insert into public.chore_assignments (chore_id, child_id, assigned_by, status)
    values (v_chore, v_child1, v_user, 'approved');

  -- Rewards
  insert into public.rewards (family_id, title, point_cost, icon_name, color, created_by)
    values (v_family, 'Movie night pick', 100, 'film', '#0EA5A4', v_user)
    returning id into v_reward;
  insert into public.rewards (family_id, title, point_cost, icon_name, color, created_by)
    values (v_family, 'Extra 30 min screen time', 50, 'tablet-portrait', '#FF8C42', v_user);

  -- A savings goal for Ava toward the movie-night reward
  insert into public.goals (family_id, child_id, kind, reward_id, title, target_points, created_by)
    values (v_family, v_child1, 'reward', v_reward, 'Movie night pick', 100, v_user);

  -- Activity feed + points ledger entry for the approved chore
  insert into public.activity_log (family_id, type, child_id, actor_id, title, point_value)
    values (v_family, 'chore_approved', v_child1, v_user, 'Homework done', 15);
  insert into public.point_transactions (child_id, amount, type, note)
    values (v_child1, 15, 'earned', 'Homework done');

  raise notice 'Seeded "The Demo Family" (%) for user %', v_family, v_user;
end $$;
