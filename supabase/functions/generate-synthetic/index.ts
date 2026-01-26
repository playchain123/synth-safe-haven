import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateRequest {
  datasetId: string;
  userAddress: string;
  columns: { name: string; type: string; selected: boolean }[];
  hideSensitive: boolean;
  privacySafeRanges: boolean;
  syntheticRows: number;
  outputFormat: string;
  qualityMode: string;
  originalDataHash: string;
}

// Generate synthetic data based on column types
function generateSyntheticValue(columnName: string, columnType: string, rowIndex: number): string | number {
  const faker = {
    names: ["James Wilson", "Sarah Chen", "Michael Brown", "Emily Davis", "David Lee", "Anna Martinez", "Robert Taylor", "Lisa Anderson", "John Smith", "Maria Garcia"],
    emails: ["user1@email.com", "user2@email.com", "user3@email.com", "user4@email.com", "user5@email.com"],
    phones: ["555-0100", "555-0101", "555-0102", "555-0103", "555-0104"],
    departments: ["Engineering", "Marketing", "Sales", "HR", "Finance", "Operations"],
    countries: ["USA", "Canada", "UK", "Germany", "France", "Japan", "Australia"],
  };

  if (columnType === "sensitive") {
    if (columnName.toLowerCase().includes("name")) {
      return faker.names[rowIndex % faker.names.length];
    }
    if (columnName.toLowerCase().includes("email")) {
      return `synth_${rowIndex}@privacy.aleo`;
    }
    if (columnName.toLowerCase().includes("phone")) {
      return faker.phones[rowIndex % faker.phones.length];
    }
    return `[REDACTED-${rowIndex}]`;
  }

  if (columnType === "numeric") {
    if (columnName.toLowerCase().includes("id")) {
      return rowIndex + 1;
    }
    if (columnName.toLowerCase().includes("age")) {
      return 20 + Math.floor(Math.random() * 50);
    }
    if (columnName.toLowerCase().includes("salary")) {
      return 30000 + Math.floor(Math.random() * 120000);
    }
    return Math.floor(Math.random() * 1000);
  }

  if (columnType === "categorical") {
    if (columnName.toLowerCase().includes("department")) {
      return faker.departments[rowIndex % faker.departments.length];
    }
    if (columnName.toLowerCase().includes("country")) {
      return faker.countries[rowIndex % faker.countries.length];
    }
    return `Category_${(rowIndex % 5) + 1}`;
  }

  return `Value_${rowIndex}`;
}

// Generate commitment hash (simulating Aleo BHP256 hash)
function generateCommitment(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `aleo1commitment${Math.abs(hash).toString(16).padStart(32, '0').slice(0, 32)}`;
}

// Generate proof hash (simulating Aleo proof generation)
function generateProofHash(commitment: string, params: string): string {
  const combined = commitment + params + Date.now().toString();
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `proof1${Math.abs(hash).toString(16).padStart(48, '0').slice(0, 48)}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: GenerateRequest = await req.json();
    const {
      datasetId,
      userAddress,
      columns,
      hideSensitive,
      privacySafeRanges,
      syntheticRows,
      outputFormat,
      qualityMode,
      originalDataHash,
    } = body;

    // Filter columns based on selection and privacy settings
    const includedColumns = columns.filter(c => {
      if (!c.selected) return false;
      if (hideSensitive && c.type === "sensitive") return false;
      return true;
    });

    // Generate synthetic data
    const syntheticData: Record<string, (string | number)[]> = {};
    includedColumns.forEach(col => {
      syntheticData[col.name] = [];
      for (let i = 0; i < syntheticRows; i++) {
        let value = generateSyntheticValue(col.name, col.type, i);
        
        // Apply privacy-safe ranges for numeric columns
        if (privacySafeRanges && col.type === "numeric" && typeof value === "number") {
          const rangeSize = 10;
          const lowerBound = Math.floor(value / rangeSize) * rangeSize;
          value = `${lowerBound}-${lowerBound + rangeSize}` as unknown as number;
        }
        
        syntheticData[col.name].push(value);
      }
    });

    // Calculate quality score based on mode
    const qualityScores = { fast: 75, balanced: 88, high: 95 };
    const baseScore = qualityScores[qualityMode as keyof typeof qualityScores] || 88;
    const qualityScore = baseScore + Math.floor(Math.random() * 5);

    // Generate Aleo-compatible commitments and proofs
    const dataCommitment = generateCommitment(originalDataHash);
    const synthCommitment = generateCommitment(JSON.stringify(syntheticData).slice(0, 100));
    const paramsHash = generateCommitment(`${syntheticRows}:${qualityMode}:${outputFormat}`);
    const proofHash = generateProofHash(synthCommitment, paramsHash);

    // Simulate Aleo transaction ID
    const aleoTxId = `at1${Date.now().toString(16)}${Math.random().toString(16).slice(2, 18)}`;

    // Store the generation result
    const { data: generation, error: genError } = await supabase
      .from("synthetic_generations")
      .insert({
        dataset_id: datasetId,
        user_address: userAddress,
        synth_commitment: synthCommitment,
        quality_score: qualityScore,
        rows_generated: syntheticRows,
        columns_included: includedColumns.length,
        sensitive_removed: columns.filter(c => c.type === "sensitive" && hideSensitive).length,
        output_format: outputFormat,
        quality_mode: qualityMode,
        aleo_tx_id: aleoTxId,
        aleo_proof_hash: proofHash,
        privacy_verified: true,
        synth_ready: true,
        aleo_verified: true,
        synthetic_data: syntheticData,
      })
      .select()
      .single();

    if (genError) throw genError;

    // Store the Aleo transaction record
    const { error: txError } = await supabase
      .from("aleo_transactions")
      .insert({
        generation_id: generation.id,
        user_address: userAddress,
        tx_id: aleoTxId,
        tx_type: "generate_synth",
        program_id: "aleosynth.aleo",
        function_name: "generate_synth",
        inputs: { commitment: dataCommitment, rows: syntheticRows, quality: qualityMode },
        outputs: { synth_commitment: synthCommitment, quality_score: qualityScore },
        status: "confirmed",
        block_height: Math.floor(Date.now() / 1000),
        confirmed_at: new Date().toISOString(),
      });

    if (txError) console.error("Transaction storage error:", txError);

    // Store the proof record
    const { error: proofError } = await supabase
      .from("proofs")
      .insert({
        generation_id: generation.id,
        user_address: userAddress,
        proof_hash: proofHash,
        dataset_commitment: dataCommitment,
        synth_commitment: synthCommitment,
        params_hash: paramsHash,
        quality_score: qualityScore,
        verified: true,
        receipt_data: {
          dataset_id: datasetId,
          timestamp: new Date().toISOString(),
          params: { rows: syntheticRows, format: outputFormat, quality: qualityMode },
          aleo_network: "testnet",
          program_id: "aleosynth.aleo",
        },
      });

    if (proofError) console.error("Proof storage error:", proofError);

    // Update dataset status
    await supabase
      .from("datasets")
      .update({ status: "generated" })
      .eq("id", datasetId);

    return new Response(
      JSON.stringify({
        success: true,
        generationId: generation.id,
        syntheticData,
        qualityScore,
        aleoTxId,
        proofHash,
        synthCommitment,
        columnsIncluded: includedColumns.length,
        sensitiveRemoved: columns.filter(c => c.type === "sensitive" && hideSensitive).length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Generation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});