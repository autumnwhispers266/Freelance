
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin','freelancer','client');
CREATE TYPE public.account_status AS ENUM ('active','restricted');
CREATE TYPE public.job_status AS ENUM ('open','under_review','filled','archived');
CREATE TYPE public.bid_status AS ENUM ('under_review','engaged','not_selected','approved','declined');
CREATE TYPE public.verification_status AS ENUM ('pending','verified','rejected');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_initials TEXT,
  primary_category TEXT,
  bio TEXT,
  hourly_rate NUMERIC,
  paypal_email TEXT,
  skills TEXT[] DEFAULT '{}',
  theme TEXT DEFAULT 'light',
  email_notifications BOOLEAN DEFAULT TRUE,
  status public.account_status DEFAULT 'active',
  onboarding_complete BOOLEAN DEFAULT FALSE,
  verification public.verification_status DEFAULT 'pending',
  test_score INT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles (separate table — security best practice)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_primary_role(_user_id UUID)
RETURNS public.app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id
  ORDER BY CASE role WHEN 'admin' THEN 1 WHEN 'client' THEN 2 ELSE 3 END
  LIMIT 1
$$;

-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  image_filename TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Jobs
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  rate_min NUMERIC NOT NULL,
  rate_max NUMERIC NOT NULL,
  status public.job_status DEFAULT 'open',
  client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  skills TEXT[] DEFAULT '{}',
  posted_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Bids
CREATE TABLE public.bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proposed_rate NUMERIC NOT NULL,
  cover_note TEXT,
  status public.bid_status DEFAULT 'under_review',
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (job_id, freelancer_id)
);
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Favourites
CREATE TABLE public.favourites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, job_id)
);
ALTER TABLE public.favourites ENABLE ROW LEVEL SECURITY;

-- Portfolio
CREATE TABLE public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  external_link TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Broadcasts
CREATE TABLE public.broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_group TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

-- Transcription attempts
CREATE TABLE public.transcription_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_number INT NOT NULL,
  attempt_number INT NOT NULL,
  score INT NOT NULL,
  passed BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.transcription_attempts ENABLE ROW LEVEL SECURITY;

-- Admin activity (for the admin overview feed)
CREATE TABLE public.admin_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.admin_activity ENABLE ROW LEVEL SECURITY;

-- ============ RLS POLICIES ============

-- profiles
CREATE POLICY "profiles read all" ON public.profiles FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "profiles read public" ON public.profiles FOR SELECT TO anon USING (TRUE);
CREATE POLICY "profiles update own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles insert own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles admin update" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- user_roles
CREATE POLICY "roles read own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "roles insert own" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "roles admin all" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- categories (public read, admin write)
CREATE POLICY "categories public read" ON public.categories FOR SELECT USING (TRUE);
CREATE POLICY "categories admin write" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- jobs
CREATE POLICY "jobs public read" ON public.jobs FOR SELECT USING (TRUE);
CREATE POLICY "jobs client insert" ON public.jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id);
CREATE POLICY "jobs client update" ON public.jobs FOR UPDATE TO authenticated USING (auth.uid() = client_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "jobs admin delete" ON public.jobs FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- bids
CREATE POLICY "bids read involved" ON public.bids FOR SELECT TO authenticated USING (
  auth.uid() = freelancer_id
  OR EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.client_id = auth.uid())
  OR public.has_role(auth.uid(),'admin')
);
CREATE POLICY "bids freelancer insert" ON public.bids FOR INSERT TO authenticated WITH CHECK (auth.uid() = freelancer_id);
CREATE POLICY "bids freelancer update" ON public.bids FOR UPDATE TO authenticated USING (auth.uid() = freelancer_id);
CREATE POLICY "bids admin all" ON public.bids FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- favourites (own)
CREATE POLICY "favs own" ON public.favourites FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- portfolio (public read, own write)
CREATE POLICY "portfolio read" ON public.portfolio_items FOR SELECT USING (TRUE);
CREATE POLICY "portfolio own write" ON public.portfolio_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- notifications (own)
CREATE POLICY "notif own" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notif own update" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notif admin insert" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin') OR auth.uid() = user_id);

-- broadcasts (admin)
CREATE POLICY "broadcasts admin" ON public.broadcasts FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- transcription
CREATE POLICY "trans own" ON public.transcription_attempts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- admin_activity
CREATE POLICY "activity admin read" ON public.admin_activity FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "activity admin write" ON public.admin_activity FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ TRIGGERS ============

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  full_nm TEXT;
  initials TEXT;
  selected_role public.app_role;
BEGIN
  full_nm := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1));
  initials := UPPER(LEFT(full_nm,1) || COALESCE(LEFT(split_part(full_nm,' ',2),1),''));
  IF initials = '' THEN initials := UPPER(LEFT(NEW.email,2)); END IF;

  INSERT INTO public.profiles (id, full_name, email, avatar_initials)
  VALUES (NEW.id, full_nm, NEW.email, initials);

  selected_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'freelancer');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, selected_role)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ STORAGE ============
INSERT INTO storage.buckets (id, name, public) VALUES
  ('category-images','category-images',TRUE),
  ('portfolio','portfolio',TRUE)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "category images public read" ON storage.objects FOR SELECT USING (bucket_id = 'category-images');
CREATE POLICY "category images admin write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'category-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "category images admin update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'category-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "category images admin delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'category-images' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "portfolio public read" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio');
CREATE POLICY "portfolio own write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "portfolio own update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "portfolio own delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);
