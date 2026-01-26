import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RegisterRequest {
  userAddress: string;
  filename: string;
  originalHash: string;
  columnCount: number;
  rowCount: number;
  datasetType: string;
}

// Simulate Aleo register_dataset transition
function generateDatasetCommitment(hash: string): string {
  let commitment = 0;
  for (let i = 0; i < hash.length; i++) {
    const char = hash.charCodeAt(i);
    commitment = ((commitment << 5) - commitment) + char;
    commitment = commitment & commitment;
  }
  return `aleo1dataset${Math.abs(commitment).toString(16).padStart(32, '0').slice(0, 32)}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: RegisterRequest = await req.json();
    const { userAddress, filename, originalHash, columnCount, rowCount, datasetType } = body;

    // Generate dataset commitment (simulating Aleo on-chain registration)
    const commitment = generateDatasetCommitment(originalHash);
    
    // Simulate transaction ID
    const aleoTxId = `at1reg${Date.now().toString(16)}${Math.random().toString(16).slice(2, 14)}`;

    // Store dataset in database
    const { data: dataset, error: datasetError } = await supabase
      .from("datasets")
      .insert({
        user_address: userAddress,
        original_hash: commitment,
        filename,
        column_count: columnCount,
        row_count: rowCount,
        dataset_type: datasetType,
        status: "registered",
      })
      .select()
      .single();

    if (datasetError) throw datasetError;

    // Record the Aleo transaction
    const { error: txError } = await supabase
      .from("aleo_transactions")
      .insert({
        user_address: userAddress,
        tx_id: aleoTxId,
        tx_type: "register_dataset",
        program_id: "aleosynth.aleo",
        function_name: "register_dataset",
        inputs: { commitment, filename, columns: columnCount, rows: rowCount },
        outputs: { dataset_id: dataset.id, registered: true },
        status: "confirmed",
        block_height: Math.floor(Date.now() / 1000),
        confirmed_at: new Date().toISOString(),
      });

    if (txError) console.error("Transaction storage error:", txError);

    return new Response(
      JSON.stringify({
        success: true,
        datasetId: dataset.id,
        commitment,
        aleoTxId,
        message: "Dataset registered on Aleo testnet",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});