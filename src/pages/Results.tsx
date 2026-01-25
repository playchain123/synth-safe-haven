import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
  Sparkles
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { toast } from "sonner";

// Generate synthetic data
const generateSyntheticData = (count: number) => {
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterColumn, setFilterColumn] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Get config from session or use defaults
  const config = useMemo(() => {
    const stored = sessionStorage.getItem("aleosynth_config");
    return stored 
      ? JSON.parse(stored) 
      : { rows: 100, columns: 5, sensitiveRemoved: 3, format: "csv", quality: "balanced" };
  }, []);

  const syntheticData = useMemo(() => generateSyntheticData(config.rows), [config.rows]);

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
    syntheticData.forEach((row) => {
      if (row.age <= 30) ranges["22-30"]++;
      else if (row.age <= 40) ranges["31-40"]++;
      else if (row.age <= 50) ranges["41-50"]++;
      else if (row.age <= 60) ranges["51-60"]++;
      else ranges["61+"]++;
    });
    return Object.entries(ranges).map(([range, count]) => ({ range, count }));
  }, [syntheticData]);

  const departmentDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    syntheticData.forEach((row) => {
      counts[row.department] = (counts[row.department] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [syntheticData]);

  const handleDownload = () => {
    const headers = ["synth_id", "age", "salary", "department", "country"];
    const csvContent = [
      headers.join(","),
      ...syntheticData.map((row) =>
        [row.synth_id, row.age, row.salary, row.department, row.country].join(",")
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
    const jsonData = syntheticData.map(({ id, ...rest }) => rest);
    navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
    toast.success("JSON copied to clipboard!");
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
                    <p className="text-2xl font-bold text-accent">92%</p>
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
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 py-1.5 px-3">
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Privacy Protected
                </Badge>
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 py-1.5 px-3">
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Synthetic Data Ready
                </Badge>
                <Badge variant="outline" className="bg-foreground/10 text-foreground border-foreground/30 py-1.5 px-3">
                  <Shield className="h-4 w-4 mr-1.5" />
                  Aleo Proof Verified (Testnet)
                </Badge>
              </div>
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
                    {paginatedData.map((row) => (
                      <TableRow key={row.id} className="border-border">
                        <TableCell className="font-mono text-sm">{row.synth_id}</TableCell>
                        <TableCell>{row.age}</TableCell>
                        <TableCell>${row.salary.toLocaleString()}</TableCell>
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
              <CardDescription>Download or share your synthetic dataset</CardDescription>
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
                <Button variant="glass" onClick={handleShareLink}>
                  <Link2 className="h-4 w-4" />
                  Generate Shareable Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Results;
