-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded');
CREATE TYPE slot_type AS ENUM ('community', 'private');
CREATE TYPE membership_type AS ENUM ('none', 'monthly', 'annual', 'lifetime');

-- Users table (extends auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    membership_type membership_type DEFAULT 'none',
    membership_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time slots table
CREATE TABLE public.time_slots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_type slot_type NOT NULL,
    max_capacity INTEGER NOT NULL,
    current_bookings INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date, start_time, slot_type)
);

-- Bookings table
CREATE TABLE public.bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    time_slot_id UUID REFERENCES public.time_slots(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_phone TEXT,
    booking_type slot_type NOT NULL,
    party_size INTEGER NOT NULL DEFAULT 1,
    status booking_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    payment_intent_id TEXT,
    total_amount INTEGER NOT NULL, -- Amount in cents
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_time_slots_date ON public.time_slots(date);
CREATE INDEX idx_time_slots_type ON public.time_slots(slot_type);
CREATE INDEX idx_bookings_time_slot ON public.bookings(time_slot_id);
CREATE INDEX idx_bookings_user ON public.bookings(user_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_slots_updated_at BEFORE UPDATE ON public.time_slots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update time slot booking count
CREATE OR REPLACE FUNCTION update_time_slot_bookings()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.time_slots 
        SET current_bookings = current_bookings + NEW.party_size
        WHERE id = NEW.time_slot_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle status changes
        IF OLD.status = 'confirmed' AND NEW.status = 'cancelled' THEN
            UPDATE public.time_slots 
            SET current_bookings = current_bookings - OLD.party_size
            WHERE id = OLD.time_slot_id;
        ELSIF OLD.status = 'cancelled' AND NEW.status = 'confirmed' THEN
            UPDATE public.time_slots 
            SET current_bookings = current_bookings + NEW.party_size
            WHERE id = NEW.time_slot_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.status = 'confirmed' THEN
            UPDATE public.time_slots 
            SET current_bookings = current_bookings - OLD.party_size
            WHERE id = OLD.time_slot_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for booking count updates
CREATE TRIGGER update_time_slot_bookings_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_time_slot_bookings();

-- Function to check booking capacity
CREATE OR REPLACE FUNCTION check_booking_capacity()
RETURNS TRIGGER AS $$
DECLARE
    slot_capacity INTEGER;
    current_count INTEGER;
    slot_type_val slot_type;
BEGIN
    -- Get slot info
    SELECT max_capacity, current_bookings, slot_type 
    INTO slot_capacity, current_count, slot_type_val
    FROM public.time_slots 
    WHERE id = NEW.time_slot_id;
    
    -- For private bookings, don't allow any other bookings
    IF NEW.booking_type = 'private' THEN
        IF current_count > 0 THEN
            RAISE EXCEPTION 'Cannot book private session: time slot already has bookings';
        END IF;
    END IF;
    
    -- For community bookings, check capacity
    IF NEW.booking_type = 'community' THEN
        -- Don't allow community bookings if slot is private
        IF slot_type_val = 'private' THEN
            RAISE EXCEPTION 'Cannot book community session: time slot is reserved for private use';
        END IF;
        
        -- Check capacity
        IF current_count + NEW.party_size > slot_capacity THEN
            RAISE EXCEPTION 'Booking exceeds capacity: % spots available, % requested', 
                slot_capacity - current_count, NEW.party_size;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for capacity checking
CREATE TRIGGER check_booking_capacity_trigger
    BEFORE INSERT ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION check_booking_capacity();

-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Users can only see and edit their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Time slots are publicly readable
CREATE POLICY "Time slots are publicly readable" ON public.time_slots
    FOR SELECT USING (true);

-- Only admins can modify time slots
CREATE POLICY "Admins can manage time slots" ON public.time_slots
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Booking policies
CREATE POLICY "Users can view own bookings" ON public.bookings
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Users can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR user_id IS NULL
    );

CREATE POLICY "Users can update own bookings" ON public.bookings
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated; 