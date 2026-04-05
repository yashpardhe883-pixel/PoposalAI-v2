-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- PROFILES TABLE
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  company_name TEXT,
  industry TEXT DEFAULT 'General',
  services TEXT[] DEFAULT '{}',
  default_currency TEXT DEFAULT 'USD',
  default_tone TEXT DEFAULT 'professional',
  logo_url TEXT,
  brand_color TEXT DEFAULT '#d4a843',
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free','pro','agency')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  proposals_used_this_month INTEGER DEFAULT 0,
  proposals_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROPOSALS TABLE
CREATE TABLE proposals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  project_type TEXT,
  project_description TEXT,
  budget TEXT,
  deadline TEXT,
  tone TEXT DEFAULT 'professional',
  mode TEXT DEFAULT 'smart' CHECK (mode IN ('smart','template')),
  template_id TEXT,
  content JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft','sent','viewed','signed','won','lost')),
  score INTEGER DEFAULT 0,
  score_feedback JSONB DEFAULT '[]',
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  is_signed BOOLEAN DEFAULT FALSE,
  signed_at TIMESTAMPTZ,
  signer_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROPOSAL EVENTS TABLE
CREATE TABLE proposal_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TEMPLATES TABLE
CREATE TABLE templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  industry TEXT,
  description TEXT,
  structure JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TEAM MEMBERS TABLE
CREATE TABLE team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  member_email TEXT NOT NULL,
  member_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin','member')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ
);

-- ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- PROPOSALS POLICIES
CREATE POLICY "Users can CRUD own proposals"
  ON proposals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public can view proposal by share token"
  ON proposals FOR SELECT USING (share_token IS NOT NULL);

-- PROPOSAL EVENTS POLICIES
CREATE POLICY "Users can view own proposal events"
  ON proposal_events FOR SELECT
  USING (proposal_id IN (
    SELECT id FROM proposals WHERE user_id = auth.uid()
  ));
CREATE POLICY "Anyone can insert proposal events"
  ON proposal_events FOR INSERT WITH CHECK (TRUE);

-- TEMPLATES POLICIES
CREATE POLICY "Users can view own and public templates"
  ON templates FOR SELECT
  USING (user_id = auth.uid() OR is_public = TRUE);
CREATE POLICY "Users can CRUD own templates"
  ON templates FOR ALL USING (auth.uid() = user_id);

-- TEAM MEMBERS POLICIES
CREATE POLICY "Agency owners can manage team"
  ON team_members FOR ALL USING (auth.uid() = agency_id);

-- AUTO-CREATE PROFILE ON SIGNUP TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, logo_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RESET MONTHLY PROPOSAL COUNT
CREATE OR REPLACE FUNCTION reset_monthly_proposals()
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET proposals_used_this_month = 0,
      proposals_reset_date = CURRENT_DATE
  WHERE proposals_reset_date < DATE_TRUNC('month', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- SEED SYSTEM TEMPLATES
INSERT INTO templates (name, industry, description, is_public, user_id)
VALUES
  ('Web Design Proposal','Design','Complete web design and development proposal',TRUE,NULL),
  ('Mobile App Development','Technology','iOS/Android app development proposal',TRUE,NULL),
  ('Brand Identity Package','Design','Logo, branding, and visual identity proposal',TRUE,NULL),
  ('Digital Marketing Retainer','Marketing','Monthly retainer for digital marketing',TRUE,NULL),
  ('SEO & Content Strategy','Marketing','Search engine optimization and content proposal',TRUE,NULL),
  ('Copywriting Project','Content','Website copy and content writing proposal',TRUE,NULL),
  ('Business Consulting','Consulting','Strategy and business consulting proposal',TRUE,NULL),
  ('Photography Package','Creative','Commercial or event photography proposal',TRUE,NULL),
  ('Video Production','Creative','Video production and editing proposal',TRUE,NULL),
  ('SaaS Development','Technology','Full-stack SaaS product development proposal',TRUE,NULL);
