import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyRequest {
  generationId: string;
  synthCommitment: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: VerifyRequest = await req.json();
    const { generationId, synthCommitment } = body;

    // Fetch the proof from database
    const { data: proof, error: proofError } = await supabase
      .from("proofs")
      .select("*")
      .eq("generation_id", generationId)
      .single();

    if (proofError) throw proofError;

    // Verify the commitment matches
    const isValid = proof.synth_commitment === synthCommitment;

    // Simulate Aleo verify_synth transition
    const verificationTxId = `at1verify${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;

    if (isValid) {
      // Update proof verification status
      await supabase
        .from("proofs")
        .update({ verified: true })
        .eq("id", proof.id);

      // Record verification transaction
      await supabase
        .from("aleo_transactions")
        .insert({
          generation_id: generationId,
          user_address: proof.user_address,
          tx_id: verificationTxId,
          tx_type: "verify_synth",
          program_id: "aleosynth.aleo",
          function_name: "verify_synth",
          inputs: { synth_commitment: synthCommitment },
          outputs: { verified: true },
          status: "confirmed",
          block_height: Math.floor(Date.now() / 1000),
          confirmed_at: new Date().toISOString(),
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        verified: isValid,
        proofHash: proof.proof_hash,
        qualityScore: proof.quality_score,
        verificationTxId: isValid ? verificationTxId : null,
        receipt: proof.receipt_data,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Verification error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message, verified: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});