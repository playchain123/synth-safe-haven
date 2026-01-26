-- Create datasets table for tracking user uploads and synthetic generations
CREATE TABLE public.datasets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_address TEXT NOT NULL,
  original_hash TEXT NOT NULL,
  filename TEXT NOT NULL,
  column_count INTEGER NOT NULL DEFAULT 0,
  row_count INTEGER NOT NULL DEFAULT 0,
  dataset_type TEXT NOT NULL DEFAULT 'custom',
  status TEXT NOT NULL DEFAULT 'uploaded',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create synthetic_generations table for tracking generated datasets
CREATE TABLE public.synthetic_generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dataset_id UUID NOT NULL REFERENCES public.datasets(id) ON DELETE CASCADE,
  user_address TEXT NOT NULL,
  synth_commitment TEXT,
  quality_score INTEGER DEFAULT 0,
  rows_generated INTEGER NOT NULL DEFAULT 0,
  columns_included INTEGER NOT NULL DEFAULT 0,
  sensitive_removed INTEGER NOT NULL DEFAULT 0,
  output_format TEXT NOT NULL DEFAULT 'csv',
  quality_mode TEXT NOT NULL DEFAULT 'balanced',
  aleo_tx_id TEXT,
  aleo_proof_hash TEXT,
  privacy_verified BOOLEAN NOT NULL DEFAULT false,
  synth_ready BOOLEAN NOT NULL DEFAULT false,
  aleo_verified BOOLEAN NOT NULL DEFAULT false,
  synthetic_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create aleo_transactions table for tracking on-chain activity
CREATE TABLE public.aleo_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  generation_id UUID REFERENCES public.synthetic_generations(id) ON DELETE CASCADE,
  user_address TEXT NOT NULL,
  tx_id TEXT NOT NULL UNIQUE,
  tx_type TEXT NOT NULL,
  program_id TEXT NOT NULL DEFAULT 'aleosynth.aleo',
  function_name TEXT NOT NULL,
  inputs JSONB,
  outputs JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  block_height BIGINT,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create proofs table for storing verification receipts
CREATE TABLE public.proofs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  generation_id UUID NOT NULL REFERENCES public.synthetic_generations(id) ON DELETE CASCADE,
  user_address TEXT NOT NULL,
  proof_hash TEXT NOT NULL,
  dataset_commitment TEXT NOT NULL,
  synth_commitment TEXT NOT NULL,
  params_hash TEXT NOT NULL,
  quality_score INTEGER NOT NULL DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT false,
  receipt_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.synthetic_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aleo_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proofs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (wallet-based auth, no traditional auth)
CREATE POLICY "Anyone can view datasets" ON public.datasets FOR SELECT USING (true);
CREATE POLICY "Anyone can insert datasets" ON public.datasets FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update own datasets" ON public.datasets FOR UPDATE USING (true);

CREATE POLICY "Anyone can view generations" ON public.synthetic_generations FOR SELECT USING (true);
CREATE POLICY "Anyone can insert generations" ON public.synthetic_generations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update generations" ON public.synthetic_generations FOR UPDATE USING (true);

CREATE POLICY "Anyone can view transactions" ON public.aleo_transactions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert transactions" ON public.aleo_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update transactions" ON public.aleo_transactions FOR UPDATE USING (true);

CREATE POLICY "Anyone can view proofs" ON public.proofs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert proofs" ON public.proofs FOR INSERT WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_datasets_updated_at
BEFORE UPDATE ON public.datasets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_datasets_user_address ON public.datasets(user_address);
CREATE INDEX idx_generations_dataset_id ON public.synthetic_generations(dataset_id);
CREATE INDEX idx_generations_user_address ON public.synthetic_generations(user_address);
CREATE INDEX idx_transactions_user_address ON public.aleo_transactions(user_address);
CREATE INDEX idx_transactions_tx_id ON public.aleo_transactions(tx_id);
CREATE INDEX idx_proofs_generation_id ON public.proofs(generation_id);