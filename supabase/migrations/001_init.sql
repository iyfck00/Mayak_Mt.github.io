create extension if not exists pgcrypto;
create type role_t as enum ('teacher','student');

create table profiles(id uuid primary key references auth.users on delete cascade, tg_id bigint unique,
  role role_t not null default 'student', full_name text not null default '', created_at timestamptz default now());
create table students(id uuid primary key default gen_random_uuid(), teacher_id uuid not null references profiles on delete cascade,
  user_id uuid references profiles on delete set null, tg_id bigint, full_name text not null, grade int, created_at timestamptz default now());
create table lessons(id uuid primary key default gen_random_uuid(), teacher_id uuid not null references profiles on delete cascade,
  student_id uuid not null references students on delete cascade, starts_at timestamptz not null, duration_min int not null default 60,
  topic text not null default '', price numeric not null default 0,
  status text not null default 'planned' check (status in ('planned','done','cancelled')),
  rescheduled boolean not null default false, paid boolean not null default false, paid_at timestamptz);
create table folders(id uuid primary key default gen_random_uuid(), owner_id uuid not null references profiles on delete cascade,
  parent_id uuid references folders on delete cascade, name text not null, created_at timestamptz default now());
create table tasks(id uuid primary key default gen_random_uuid(), owner_id uuid not null references profiles on delete cascade,
  folder_id uuid references folders on delete cascade, title text not null, questions jsonb not null default '[]',
  updated_at timestamptz default now());
create table assignments(id uuid primary key default gen_random_uuid(), teacher_id uuid not null references profiles on delete cascade,
  student_id uuid not null references students on delete cascade, task_id uuid references tasks on delete set null,
  title text not null, snapshot jsonb not null, comment text, created_at timestamptz default now());
create table attempts(id uuid primary key default gen_random_uuid(), assignment_id uuid not null references assignments on delete cascade,
  student_id uuid not null references students on delete cascade, answers jsonb not null default '{}', score int not null, total int not null,
  attempt_no int not null default 1, created_at timestamptz default now());

create function is_teacher() returns boolean language sql stable security definer set search_path=public as
$$ select exists(select 1 from profiles where id=auth.uid() and role='teacher') $$;
create function my_student_ids() returns setof uuid language sql stable security definer set search_path=public as
$$ select id from students where user_id=auth.uid() $$;

-- Профиль создаётся всегда как student. Роль teacher и tg_id выставляет только Edge Function (service role).
create function handle_new_user() returns trigger language plpgsql security definer set search_path=public as
$$ begin insert into profiles(id) values(new.id); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

create function ensure_folders() returns trigger language plpgsql security definer set search_path=public as
$$ begin
  if new.role='teacher' and not exists(select 1 from folders where owner_id=new.id) then
    insert into folders(owner_id,name) select new.id, g||' класс' from generate_series(5,11) g;
  end if; return new; end $$;
create trigger on_teacher after insert or update of role on profiles for each row execute function ensure_folders();

create function lock_snapshot() returns trigger language plpgsql as
$$ begin if new.snapshot is distinct from old.snapshot then raise exception 'snapshot is immutable'; end if; return new; end $$;
create trigger t_lock before update on assignments for each row execute function lock_snapshot();

create function assign_task(p_task uuid, p_students uuid[], p_comment text) returns int
language plpgsql security definer set search_path=public as $$
declare t tasks; n int := 0; s uuid;
begin
  if not is_teacher() then raise exception 'forbidden'; end if;
  select * into t from tasks where id=p_task and owner_id=auth.uid();
  if not found then raise exception 'task not found'; end if;
  foreach s in array p_students loop
    if exists(select 1 from students where id=s and teacher_id=auth.uid()) then
      insert into assignments(teacher_id,student_id,task_id,title,snapshot,comment)
      values(auth.uid(),s,t.id,t.title,t.questions,p_comment); n := n+1;
    end if;
  end loop;
  return n;
end $$;

-- Ученик видит занятия без цены и оплаты
create view my_lessons as select id,student_id,starts_at,duration_min,topic,status,rescheduled
  from lessons where student_id in (select my_student_ids());
grant select on my_lessons to authenticated;

alter table profiles enable row level security; alter table students enable row level security;
alter table lessons enable row level security; alter table folders enable row level security;
alter table tasks enable row level security; alter table assignments enable row level security;
alter table attempts enable row level security;

create policy profiles_sel on profiles for select using (id=auth.uid() or is_teacher());
create policy students_t on students for all using (teacher_id=auth.uid() and is_teacher()) with check (teacher_id=auth.uid() and is_teacher());
create policy students_s on students for select using (user_id=auth.uid());
create policy lessons_t on lessons for all using (teacher_id=auth.uid() and is_teacher()) with check (teacher_id=auth.uid() and is_teacher());
create policy folders_t on folders for all using (owner_id=auth.uid() and is_teacher()) with check (owner_id=auth.uid() and is_teacher());
create policy tasks_t on tasks for all using (owner_id=auth.uid() and is_teacher()) with check (owner_id=auth.uid() and is_teacher());
create policy asg_t on assignments for all using (teacher_id=auth.uid() and is_teacher()) with check (teacher_id=auth.uid() and is_teacher());
create policy asg_s on assignments for select using (student_id in (select my_student_ids()));
create policy att_t on attempts for select using (exists(select 1 from assignments a where a.id=assignment_id and a.teacher_id=auth.uid()));
create policy att_s_sel on attempts for select using (student_id in (select my_student_ids()));
create policy att_s_ins on attempts for insert with check (student_id in (select my_student_ids())
  and exists(select 1 from assignments a where a.id=assignment_id and a.student_id=attempts.student_id));
