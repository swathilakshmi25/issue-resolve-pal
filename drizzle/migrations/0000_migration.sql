
create type public.app_role as enum ('admin', 'user');
create type public.complaint_status as enum ('Submitted','Under Review','Assigned','In Progress','Resolved');
create type public.complaint_priority as enum ('Low','Medium','High','Critical');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null default '',
  title text not null default '',
  bio text not null default '',
  skills text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "own roles read" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null default '',
  keywords text[] not null default '{}'
);
grant select on public.departments to authenticated;
grant all on public.departments to service_role;
alter table public.departments enable row level security;
create policy "departments readable" on public.departments for select to authenticated using (true);
insert into public.departments (name, description, keywords) values
 ('IT Support','Wi-Fi, network, portals and lab computers','{wifi,internet,network,portal,computer}'),
 ('Academic Department','Classes, faculty, exams, attendance, marks','{classroom,faculty,exam,attendance,marks}'),
 ('Maintenance','Water, cleaning, electricity, repairs','{water,cleaning,electricity,repair}'),
 ('Transport Department','Buses and routes','{bus,route,transport}'),
 ('Hostel Administration','Hostel rooms and mess','{hostel,food,mess}'),
 ('Finance Department','Fees, payments and refunds','{payment,fee,refund}'),
 ('Library','Books and library services','{library,books}'),
 ('Security Department','Safety, lost items, security','{security,lost,safety}'),
 ('General Administration','Anything else','{}');

create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('FM-' || lpad((floor(random()*900000)+100000)::text, 6, '0')),
  user_id uuid not null,
  title text not null,
  original_text text not null,
  summary text not null default '',
  category text not null default 'Other',
  department text not null default 'General Administration',
  priority public.complaint_priority not null default 'Medium',
  urgency_reason text not null default '',
  sentiment text not null default '',
  keywords text[] not null default '{}',
  professional_complaint text not null default '',
  action_plan text[] not null default '{}',
  recommended_next_step text not null default '',
  estimated_resolution_time text not null default '',
  confidence int not null default 0,
  ai_mode text not null default 'demo',
  location text not null default '',
  contact text not null default 'Email',
  anonymous boolean not null default false,
  photo_path text,
  status public.complaint_status not null default 'Assigned',
  resolution_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index on public.complaints (user_id, created_at desc);
grant select, insert, update on public.complaints to authenticated;
grant all on public.complaints to service_role;
alter table public.complaints enable row level security;
create policy "read own or admin" on public.complaints for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "insert own" on public.complaints for insert to authenticated with check (user_id = auth.uid() and status = 'Assigned');
create policy "admin update" on public.complaints for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.complaint_updates (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  status text not null,
  note text not null default '',
  created_at timestamptz not null default now()
);
grant select on public.complaint_updates to authenticated;
grant all on public.complaint_updates to service_role;
alter table public.complaint_updates enable row level security;
create policy "updates readable" on public.complaint_updates for select to authenticated using (
  exists (select 1 from public.complaints c where c.id = complaint_id and (c.user_id = auth.uid() or public.has_role(auth.uid(),'admin'))));

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  complaint_id uuid references public.complaints(id) on delete cascade,
  text text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.notifications (user_id, created_at desc);
grant select, update on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "own notifications" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "own notifications update" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.validate_complaint() returns trigger language plpgsql set search_path = public as $$
begin
  if length(trim(new.original_text)) < 10 or length(new.original_text) > 3000 then raise exception 'Complaint text must be 10-3000 characters'; end if;
  if length(new.title) > 200 or length(new.location) > 200 then raise exception 'Field too long'; end if;
  new.updated_at := now();
  if tg_op = 'UPDATE' then
    if new.status = 'Resolved' and old.status <> 'Resolved' then new.resolved_at := now(); end if;
    if new.status <> 'Resolved' then new.resolved_at := null; end if;
    new.user_id := old.user_id; new.original_text := old.original_text; new.created_at := old.created_at; new.code := old.code;
  end if;
  return new;
end $$;
create trigger complaints_validate before insert or update on public.complaints for each row execute function public.validate_complaint();

create or replace function public.complaint_events() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.complaint_updates (complaint_id, status, note, created_at) values
      (new.id, 'Submitted', 'Complaint submitted.', now()),
      (new.id, 'AI Analyzed', 'Categorized as ' || new.category || ', ' || new.priority || ' priority.', now() + interval '1 ms'),
      (new.id, 'Assigned', 'Assigned to ' || new.department || '.', now() + interval '2 ms');
    insert into public.notifications (user_id, complaint_id, text, created_at) values
      (new.user_id, new.id, 'Complaint ' || new.code || ' submitted', now()),
      (new.user_id, new.id, 'AI analysis completed for ' || new.code, now() + interval '1 ms'),
      (new.user_id, new.id, new.code || ' assigned to ' || new.department, now() + interval '2 ms');
  elsif tg_op = 'UPDATE' then
    if new.department <> old.department then
      insert into public.notifications (user_id, complaint_id, text) values (new.user_id, new.id, new.code || ' reassigned to ' || new.department);
    end if;
    if new.status <> old.status then
      insert into public.notifications (user_id, complaint_id, text) values (new.user_id, new.id,
        case when new.status = 'Resolved' then new.code || ' has been resolved' else new.code || ' status changed to ' || new.status end);
    end if;
  end if;
  return new;
end $$;
create trigger complaints_events after insert or update on public.complaints for each row execute function public.complaint_events();

create or replace function public.admin_update_complaint(_id uuid, _status public.complaint_status, _department text, _note text)
returns void language plpgsql security definer set search_path = public as $$
declare old_dept text;
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'Forbidden'; end if;
  if length(coalesce(_note,'')) > 1000 then raise exception 'Note too long'; end if;
  select department into old_dept from public.complaints where id = _id;
  if not found then raise exception 'Complaint not found'; end if;
  update public.complaints set status = _status, department = coalesce(nullif(trim(_department),''), department),
    resolution_notes = case when _status = 'Resolved' and coalesce(trim(_note),'') <> '' then _note else resolution_notes end
  where id = _id;
  if coalesce(nullif(trim(_department),''), old_dept) <> old_dept then
    insert into public.complaint_updates (complaint_id, status, note) values (_id, 'Assigned', 'Reassigned to ' || trim(_department) || '.');
  end if;
  insert into public.complaint_updates (complaint_id, status, note) values (_id, _status::text, coalesce(nullif(trim(_note),''), 'Status changed to ' || _status::text || '.'));
end $$;
revoke execute on function public.admin_update_complaint from public, anon;
grant execute on function public.admin_update_complaint to authenticated;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email) values (new.id, coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email,''),'@',1)), coalesce(new.email,''));
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create policy "upload own photos" on storage.objects for insert to authenticated with check (bucket_id = 'complaint-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "read own or admin photos" on storage.objects for select to authenticated using (bucket_id = 'complaint-photos' and ((storage.foldername(name))[1] = auth.uid()::text or public.has_role(auth.uid(),'admin')));
