import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAleo } from "@/lib/aleo/use-aleo";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Upload as UploadIcon, FileText, X, Shield, Zap, Settings2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface ColumnInfo {
  name: string;
  type: "sensitive" | "numeric" | "categorical";
  selected: boolean;
}

const Upload = () => {
  const navigate = useNavigate();
  const { registerDataset, generateSynthetic, address, connected, isLoading } = useAleo();
  
  const [file, setFile] = useState<File | null>(null);
  const [datasetType, setDatasetType] = useState<string>("");
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [hideSensitive, setHideSensitive] = useState(true);
  const [privacySafeRanges, setPrivacySafeRanges] = useState(true);
  const [syntheticRows, setSyntheticRows] = useState([100]);
  const [outputFormat, setOutputFormat] = useState("csv");
  const [qualityMode, setQualityMode] = useState("balanced");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [originalHash, setOriginalHash] = useState<string>("");

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "text/csv" || droppedFile?.name.endsWith(".csv")) {
      processFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = async (file: File) => {
    setFile(file);
    
    // Generate hash of file content
    const content = await file.text();
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    setOriginalHash(Math.abs(hash).toString(16));
    
    // Simulate column detection from CSV headers
    const lines = content.split('\n');
    const headers = lines[0]?.split(',').map(h => h.trim().toLowerCase()) || [];
    
    const mockColumns: ColumnInfo[] = headers.length > 0 ? headers.map(header => {
      let type: "sensitive" | "numeric" | "categorical" = "categorical";
      if (["name", "email", "phone", "ssn", "address"].some(s => header.includes(s))) {
        type = "sensitive";
      } else if (["id", "age", "salary", "amount", "price", "count", "number"].some(s => header.includes(s))) {
        type = "numeric";
      }
      return { name: header, type, selected: true };
    }) : [
      { name: "id", type: "numeric", selected: false },
      { name: "name", type: "sensitive", selected: true },
      { name: "email", type: "sensitive", selected: true },
      { name: "phone", type: "sensitive", selected: true },
      { name: "age", type: "numeric", selected: true },
      { name: "salary", type: "numeric", selected: true },
      { name: "department", type: "categorical", selected: true },
      { name: "country", type: "categorical", selected: true },
    ];
    
    setColumns(mockColumns);
  };

  const toggleColumn = (index: number) => {
    setColumns(cols =>
      cols.map((col, i) => (i === index ? { ...col, selected: !col.selected } : col))
    );
  };

  const handleRegisterDataset = async () => {
    if (!file) return;
    
    setIsGenerating(true);
    setGenerationStep("Registering dataset on Aleo testnet…");
    
    try {
      const result = await registerDataset(
        file.name,
        originalHash,
        columns.length,
        100, // Estimated row count
        datasetType || "custom"
      );
      
      setDatasetId(result.datasetId);
      toast.success("Dataset registered on Aleo testnet!", {
        description: `TX: ${result.aleoTxId.slice(0, 16)}...`
      });
      
      return result.datasetId;
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Failed to register dataset");
      throw error;
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      // Step 1: Register dataset if not already registered
      let currentDatasetId = datasetId;
      if (!currentDatasetId) {
        setGenerationStep("Registering dataset on Aleo testnet…");
        currentDatasetId = await handleRegisterDataset();
      }
      
      // Step 2: Generate synthetic data
      setGenerationStep("Generating synthetic dataset…");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = await generateSynthetic(
        currentDatasetId!,
        columns,
        hideSensitive,
        privacySafeRanges,
        syntheticRows[0],
        outputFormat,
        qualityMode,
        originalHash
      );
      
      setGenerationStep("Verifying privacy rules…");
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setGenerationStep("Creating Aleo proof…");
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Store generation result in sessionStorage for results page
      sessionStorage.setItem("aleosynth_config", JSON.stringify({
        rows: syntheticRows[0],
        columns: result.columnsIncluded,
        sensitiveRemoved: result.sensitiveRemoved,
        format: outputFormat,
        quality: qualityMode,
        qualityScore: result.qualityScore,
        generationId: result.generationId,
        aleoTxId: result.aleoTxId,
        proofHash: result.proofHash,
        synthCommitment: result.synthCommitment,
        syntheticData: result.syntheticData,
      }));
      
      toast.success("Synthetic dataset generated!", {
        description: `Quality Score: ${result.qualityScore}%`
      });
      
      navigate("/results");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate synthetic data");
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  const rowOptions = [10, 50, 100, 500, 1000];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Upload Your Dataset</h1>
            <p className="text-muted-foreground text-lg">
              Your original dataset remains private throughout the process.
            </p>
            {connected && address && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-xs">
                <CheckCircle className="h-3 w-3 text-accent" />
                <span className="font-mono">{address.slice(0, 12)}...{address.slice(-6)}</span>
              </div>
            )}
          </div>

          <div className="grid gap-8">
            {/* Upload Section */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UploadIcon className="h-5 w-5" />
                  Dataset Upload
                </CardTitle>
                <CardDescription>Upload a CSV file to begin</CardDescription>
              </CardHeader>
              <CardContent>
                {!file ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-foreground/50 transition-colors cursor-pointer"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    <UploadIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">Drop your CSV file here</p>
                    <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <Shield className="h-3 w-3" />
                      Your data stays private — only hashes go on-chain
                    </p>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-foreground" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB • Hash: {originalHash.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setFile(null);
                        setColumns([]);
                        setDatasetId(null);
                        setOriginalHash("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {file && (
                  <div className="mt-6">
                    <Label className="text-sm font-medium mb-2 block">Dataset Type</Label>
                    <Select value={datasetType} onValueChange={setDatasetType}>
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="Select dataset type" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Column Mapping Section */}
            {columns.length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5" />
                    Column Mapping
                  </CardTitle>
                  <CardDescription>Select columns to include in synthetic output</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-3">
                    {/* Sensitive Columns */}
                    <div>
                      <h4 className="font-medium text-sm mb-3 text-destructive">Sensitive (PII)</h4>
                      <div className="space-y-2">
                        {columns
                          .filter((c) => c.type === "sensitive")
                          .map((col) => {
                            const originalIndex = columns.findIndex((c) => c.name === col.name);
                            return (
                              <div key={col.name} className="flex items-center gap-2">
                                <Checkbox
                                  id={col.name}
                                  checked={col.selected}
                                  onCheckedChange={() => toggleColumn(originalIndex)}
                                />
                                <Label htmlFor={col.name} className="text-sm cursor-pointer">
                                  {col.name}
                                </Label>
                              </div>
                            );
                          })}
                        {columns.filter((c) => c.type === "sensitive").length === 0 && (
                          <p className="text-xs text-muted-foreground">No sensitive columns detected</p>
                        )}
                      </div>
                    </div>

                    {/* Numeric Columns */}
                    <div>
                      <h4 className="font-medium text-sm mb-3 text-accent">Numeric</h4>
                      <div className="space-y-2">
                        {columns
                          .filter((c) => c.type === "numeric")
                          .map((col) => {
                            const originalIndex = columns.findIndex((c) => c.name === col.name);
                            return (
                              <div key={col.name} className="flex items-center gap-2">
                                <Checkbox
                                  id={col.name}
                                  checked={col.selected}
                                  onCheckedChange={() => toggleColumn(originalIndex)}
                                />
                                <Label htmlFor={col.name} className="text-sm cursor-pointer">
                                  {col.name}
                                </Label>
                              </div>
                            );
                          })}
                        {columns.filter((c) => c.type === "numeric").length === 0 && (
                          <p className="text-xs text-muted-foreground">No numeric columns detected</p>
                        )}
                      </div>
                    </div>

                    {/* Categorical Columns */}
                    <div>
                      <h4 className="font-medium text-sm mb-3 text-foreground">Categorical</h4>
                      <div className="space-y-2">
                        {columns
                          .filter((c) => c.type === "categorical")
                          .map((col) => {
                            const originalIndex = columns.findIndex((c) => c.name === col.name);
                            return (
                              <div key={col.name} className="flex items-center gap-2">
                                <Checkbox
                                  id={col.name}
                                  checked={col.selected}
                                  onCheckedChange={() => toggleColumn(originalIndex)}
                                />
                                <Label htmlFor={col.name} className="text-sm cursor-pointer">
                                  {col.name}
                                </Label>
                              </div>
                            );
                          })}
                        {columns.filter((c) => c.type === "categorical").length === 0 && (
                          <p className="text-xs text-muted-foreground">No categorical columns detected</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Privacy Toggles */}
                  <div className="pt-4 border-t border-border space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Hide sensitive fields in output</Label>
                        <p className="text-xs text-muted-foreground">
                          Remove PII columns from synthetic data
                        </p>
                      </div>
                      <Switch checked={hideSensitive} onCheckedChange={setHideSensitive} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Generate privacy-safe ranges</Label>
                        <p className="text-xs text-muted-foreground">
                          Use ranges instead of exact values
                        </p>
                      </div>
                      <Switch checked={privacySafeRanges} onCheckedChange={setPrivacySafeRanges} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generation Settings */}
            {columns.length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Generation Settings
                  </CardTitle>
                  <CardDescription>Configure synthetic data output</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Rows Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Label className="font-medium">Number of synthetic rows</Label>
                      <span className="text-lg font-semibold">{syntheticRows[0]}</span>
                    </div>
                    <Slider
                      value={syntheticRows}
                      onValueChange={setSyntheticRows}
                      min={10}
                      max={1000}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      {rowOptions.map((opt) => (
                        <span key={opt}>{opt}</span>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Output Format */}
                    <div>
                      <Label className="font-medium mb-2 block">Output Format</Label>
                      <Select value={outputFormat} onValueChange={setOutputFormat}>
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Quality Mode */}
                    <div>
                      <Label className="font-medium mb-2 block">Synthetic Quality</Label>
                      <Select value={qualityMode} onValueChange={setQualityMode}>
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="fast">Fast</SelectItem>
                          <SelectItem value="balanced">Balanced</SelectItem>
                          <SelectItem value="high">High Quality</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button
                    variant="hero"
                    size="xl"
                    className="w-full mt-4"
                    onClick={handleGenerate}
                    disabled={isGenerating || isLoading}
                  >
                    {isGenerating ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                        {generationStep}
                      </span>
                    ) : (
                      <>
                        <Zap className="h-5 w-5" />
                        Run AleoSynth Generator
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Upload;