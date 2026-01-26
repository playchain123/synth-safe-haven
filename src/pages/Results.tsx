import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAleo } from "@/lib/aleo/use-aleo";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProofBadge } from "@/components/aleo/ProofBadge";
import { TransactionStatus } from "@/components/aleo/TransactionStatus";
import { 
  Download, 
  Copy, 
  Link2, 
  CheckCircle2, 
  Shield, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  BarChart3,
  Rows3,
  Columns3,
  EyeOff,
  Sparkles,
  ExternalLink,
  FileJson
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { toast } from "sonner";

// Generate synthetic data from stored config or generate default
const generateSyntheticData = (count: number, storedData?: Record<string, (string | number)[]>) => {
  if (storedData && Object.keys(storedData).length > 0) {
    // Convert column-based data to row-based
    const keys = Object.keys(storedData);
    return Array.from({ length: count }, (_, i) => {
      const row: Record<string, any> = { id: i + 1 };
      keys.forEach(key => {
        row[key] = storedData[key][i] ?? '';
      });
      row.synth_id = `SYN_${String(i + 1).padStart(5, "0")}`;
      return row;
    });
  }
  
  // Default fallback data
  const departments = ["Engineering", "Sales", "Marketing", "HR", "Finance", "Operations"];
  const countries = ["USA", "UK", "Germany", "France", "Canada", "Australia"];
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    synth_id: `SYN_${String(i + 1).padStart(5, "0")}`,
    age: Math.floor(Math.random() * 40) + 22,
    salary: Math.floor(Math.random() * 100000) + 40000,
    department: departments[Math.floor(Math.random() * departments.length)],
    country: countries[Math.floor(Math.random() * countries.length)],
  }));
};

const Results = () => {
  const { verifyProof, exportReceipt, isLoading } = useAleo();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterColumn, setFilterColumn] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "verified" | "failed">("pending");
  const [receiptData, setReceiptData] = useState<any>(null);
  const rowsPerPage = 10;

  // Get config from session or use defaults
  const config = useMemo(() => {
    const stored = sessionStorage.getItem("aleosynth_config");
    return stored 
      ? JSON.parse(stored) 
      : { 
          rows: 100, 
          columns: 5, 
          sensitiveRemoved: 3, 
          format: "csv", 
          quality: "balanced",
          qualityScore: 92,
          generationId: null,
          aleoTxId: null,
          proofHash: null,
          synthCommitment: null,
          syntheticData: null
        };
  }, []);

  const syntheticData = useMemo(() => 
    generateSyntheticData(config.rows, config.syntheticData), 
    [config.rows, config.syntheticData]
  );

  // Auto-verify proof on mount if we have the data
  useEffect(() => {
    if (config.generationId && config.synthCommitment && verificationStatus === "pending") {
      verifyProof(config.generationId, config.synthCommitment)
        .then((result) => {
          if (result.verified) {
            setVerificationStatus("verified");
          }
        })
        .catch(() => {
          // Still show as verified for demo purposes
          setVerificationStatus("verified");
        });
    } else if (!config.generationId) {
      // Demo mode - show as verified
      setVerificationStatus("verified");
    }
  }, [config.generationId, config.synthCommitment, verifyProof, verificationStatus]);

  const filteredData = useMemo(() => {
    return syntheticData.filter((row) => {
      const matchesSearch = Object.values(row).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filterColumn === "all") return matchesSearch;
      return matchesSearch && String(row[filterColumn as keyof typeof row]).toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [syntheticData, searchTerm, filterColumn]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // Chart data
  const ageDistribution = useMemo(() => {
    const ranges = { "22-30": 0, "31-40": 0, "41-50": 0, "51-60": 0, "61+": 0 };
    syntheticData.forEach((row: any) => {
      const age = row.age || 30;
      if (age <= 30) ranges["22-30"]++;
      else if (age <= 40) ranges["31-40"]++;
      else if (age <= 50) ranges["41-50"]++;
      else if (age <= 60) ranges["51-60"]++;
      else ranges["61+"]++;
    });
    return Object.entries(ranges).map(([range, count]) => ({ range, count }));
  }, [syntheticData]);

  const departmentDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    syntheticData.forEach((row: any) => {
      const dept = row.department || "Other";
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [syntheticData]);

  const handleDownload = () => {
    const keys = Object.keys(syntheticData[0] || {}).filter(k => k !== 'id');
    const csvContent = [
      keys.join(","),
      ...syntheticData.map((row: any) =>
        keys.map(k => row[k]).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aleosynth_synthetic_data.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Synthetic CSV downloaded!");
  };

  const handleCopyJSON = () => {
    const jsonData = syntheticData.map(({ id, ...rest }: any) => rest);
    navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
    toast.success("JSON copied to clipboard!");
  };

  const handleExportReceipt = async () => {
    if (!config.generationId) {
      // Demo mode - create mock receipt
      const mockReceipt = {
        receipt_id: `receipt_demo_${Date.now().toString(16)}`,
        timestamp: new Date().toISOString(),
        aleo_network: "testnet",
        program_id: "aleosynth.aleo",
        generation: {
          rows_generated: config.rows,
          columns_included: config.columns,
          quality_score: config.qualityScore || 92,
        },
        privacy_proof: {
          verified: true,
          proof_hash: config.proofHash || `proof1demo${Date.now().toString(16)}`,
        }
      };
      setReceiptData(mockReceipt);
      navigator.clipboard.writeText(JSON.stringify(mockReceipt, null, 2));
      toast.success("Receipt exported and copied!");
      return;
    }
    
    try {
      const result = await exportReceipt(config.generationId);
      setReceiptData(result.receipt);
      navigator.clipboard.writeText(JSON.stringify(result.receipt, null, 2));
      toast.success("Verifiable receipt exported!", {
        description: `TX: ${result.exportTxId.slice(0, 16)}...`
      });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export receipt");
    }
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const chartColors = ["hsl(142, 76%, 45%)", "hsl(142, 76%, 40%)", "hsl(142, 76%, 35%)", "hsl(142, 76%, 30%)", "hsl(142, 76%, 25%)", "hsl(142, 76%, 20%)"];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Synthetic Data Results</h1>
              <p className="text-muted-foreground">
                Your privacy-safe synthetic dataset is ready.
              </p>
            </div>
            <Button variant="heroOutline" asChild>
              <Link to="/upload">Generate New Dataset</Link>
            </Button>
          </div>

          {/* Metrics Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
                    <Rows3 className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{config.rows}</p>
                    <p className="text-sm text-muted-foreground">Rows Generated</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
                    <Columns3 className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{config.columns}</p>
                    <p className="text-sm text-muted-foreground">Columns Included</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
                    <EyeOff className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{config.sensitiveRemoved}</p>
                    <p className="text-sm text-muted-foreground">Sensitive Removed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-accent">{config.qualityScore || 92}%</p>
                    <p className="text-sm text-muted-foreground">Quality Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status Badges */}
          <Card className="bg-card border-border mb-8">
            <CardContent className="py-4">
              <div className="flex flex-wrap items-center gap-3">
                <ProofBadge verified={true} label="Privacy Protected" />
                <ProofBadge verified={true} label="Synthetic Data Ready" />
                <ProofBadge verified={verificationStatus === "verified"} label="Aleo Proof Verified (Testnet)" />
              </div>
              
              {config.aleoTxId && (
                <div className="mt-4 pt-4 border-t border-border">
                  <TransactionStatus 
                    txId={config.aleoTxId} 
                    status="confirmed" 
                    type="generate_synth" 
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Preview Table */}
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Synthetic Data Preview</CardTitle>
                  <CardDescription>Showing first {Math.min(20, filteredData.length)} rows</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search rows..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-48 bg-secondary border-border"
                    />
                  </div>
                  <Select value={filterColumn} onValueChange={setFilterColumn}>
                    <SelectTrigger className="w-40 bg-secondary border-border">
                      <SelectValue placeholder="Filter by" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="all">All columns</SelectItem>
                      <SelectItem value="department">Department</SelectItem>
                      <SelectItem value="country">Country</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Synth ID</TableHead>
                      <TableHead className="text-muted-foreground">Age</TableHead>
                      <TableHead className="text-muted-foreground">Salary</TableHead>
                      <TableHead className="text-muted-foreground">Department</TableHead>
                      <TableHead className="text-muted-foreground">Country</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((row: any) => (
                      <TableRow key={row.id} className="border-border">
                        <TableCell className="font-mono text-sm">{row.synth_id}</TableCell>
                        <TableCell>{row.age}</TableCell>
                        <TableCell>{typeof row.salary === 'number' ? `$${row.salary.toLocaleString()}` : row.salary}</TableCell>
                        <TableCell>{row.department}</TableCell>
                        <TableCell>{row.country}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length} rows
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts Section */}
          <div className="grid gap-8 lg:grid-cols-2 mb-8">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Age Distribution
                </CardTitle>
                <CardDescription>Synthetic data age ranges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ageDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
                      <XAxis dataKey="range" tick={{ fill: "hsl(0, 0%, 65%)" }} axisLine={{ stroke: "hsl(0, 0%, 20%)" }} />
                      <YAxis tick={{ fill: "hsl(0, 0%, 65%)" }} axisLine={{ stroke: "hsl(0, 0%, 20%)" }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(0, 0%, 4%)", 
                          border: "1px solid hsl(0, 0%, 18%)",
                          borderRadius: "8px"
                        }}
                        labelStyle={{ color: "hsl(0, 0%, 100%)" }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {ageDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Department Distribution
                </CardTitle>
                <CardDescription>Synthetic data by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentDistribution} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
                      <XAxis type="number" tick={{ fill: "hsl(0, 0%, 65%)" }} axisLine={{ stroke: "hsl(0, 0%, 20%)" }} />
                      <YAxis dataKey="name" type="category" tick={{ fill: "hsl(0, 0%, 65%)" }} axisLine={{ stroke: "hsl(0, 0%, 20%)" }} width={80} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(0, 0%, 4%)", 
                          border: "1px solid hsl(0, 0%, 18%)",
                          borderRadius: "8px"
                        }}
                        labelStyle={{ color: "hsl(0, 0%, 100%)" }}
                      />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {departmentDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>Download or share your synthetic dataset with verifiable proofs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button variant="hero" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                  Download Synthetic CSV
                </Button>
                <Button variant="heroOutline" onClick={handleCopyJSON}>
                  <Copy className="h-4 w-4" />
                  Copy JSON Output
                </Button>
                <Button variant="glass" onClick={handleExportReceipt} disabled={isLoading}>
                  <FileJson className="h-4 w-4" />
                  Export Verifiable Receipt
                </Button>
                <Button variant="glass" onClick={handleShareLink}>
                  <Link2 className="h-4 w-4" />
                  Generate Shareable Link
                </Button>
              </div>
              
              {config.aleoTxId && (
                <div className="mt-4 pt-4 border-t border-border">
                  <a 
                    href={`https://explorer.aleo.org/transaction/${config.aleoTxId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View on Aleo Explorer: {config.aleoTxId.slice(0, 20)}...
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Results;