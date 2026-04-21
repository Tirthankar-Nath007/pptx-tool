import { useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, FileDown, Upload, FileSpreadsheet, LogOut, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ProjectUpdateTable, { RowData } from "@/components/ProjectUpdateTable";
import {
  generatePptxFromJson,
  generatePptxFromExcel,
  downloadTemplate,
  downloadBlob,
  ProjectUpdatePayload,
} from "@/lib/api";
import { validateAllRows, hasValidationErrors } from "@/lib/validation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import logo from "../assets/tvscredit-logo.png";

const FIXED_COLUMNS = [
  "Sl no.",
  "Brief about change",
  "What is the impact",
  "Dev effort",
  "Remarks",
  "Gone Live/ETA",
  "Status",
];

const createEmptyRow = (): RowData => ({
  brief: "",
  impact: "",
  effort: "",
  remarks: "",
  eta: "",
  status: "",
});

const TAG_OPTIONS = [
  "Consumer Durables",
  "Cross Sell PL",
  "Insta PL",
  "E-COM",
  "DPL",
  "OMPL",
  "Gold Loan",
  "Two Wheeler",
  "Used Car",
  "UCV",
  "Mid Corporate",
  "Affordable LAP",
  "3W",
  "Tractors",
  "Dealer App",
  "WhatsApp, IVR and Chatbot",
  "Lead Management System",
  "HR & VMS",
  "CRM",
  "Saathi App"
];

const SUBTAG_OPTIONS = [
  "Key Enhancements"
];

interface IndexProps {
  user?: string | null;
  onLogout?: () => void;
}

const Index = ({ user, onLogout }: IndexProps) => {
  const [tag, setTag] = useState("");
  const [subtag, setSubtag] = useState("");
  const [customTag, setCustomTag] = useState("");
  const [customSubtag, setCustomSubtag] = useState("");
  const [metadata, setMetadata] = useState("");
  const [rows, setRows] = useState<RowData[]>([createEmptyRow()]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isUploadingExcel, setIsUploadingExcel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const presentationTitle = `${tag === "custom" ? customTag : tag}: ${subtag === "custom" ? customSubtag : subtag} - ${metadata}`;

  const validationErrors = useMemo(() => validateAllRows(rows), [rows]);
  const hasErrors = useMemo(() => hasValidationErrors(validationErrors), [validationErrors]);

  const handleRowChange = (index: number, field: keyof RowData, value: string) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addRow = () => {
    setRows((prev) => [...prev, createEmptyRow()]);
  };

  const removeLastRow = () => {
    if (rows.length > 1) {
      setRows((prev) => prev.slice(0, -1));
    }
  };

  const handleGeneratePptx = async () => {
    if (!tag.trim() || !subtag.trim() || !metadata.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all title fields (tag, subtag, metadata).",
        variant: "destructive",
      });
      return;
    }

    const hasEmptyRow = rows.some(
      (row) => !row.brief.trim() && !row.impact.trim() && !row.effort.trim()
    );
    if (hasEmptyRow && rows.length === 1) {
      toast({
        title: "Validation Error",
        description: "Please fill in at least one row of data.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const content: string[][] = rows.map((row, index) => [
        String(index + 1),
        row.brief,
        row.impact,
        row.effort,
        row.remarks,
        row.eta,
        row.status,
      ]);

      const payload: ProjectUpdatePayload = {
        type: "project_update",
        title: presentationTitle,
        columns: FIXED_COLUMNS,
        content,
      };

      const blob = await generatePptxFromJson(payload);
      downloadBlob(blob, "project-status-update.pptx");
      toast({
        title: "Success",
        description: "PPTX file generated and downloaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate PPTX",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true);
    try {
      const blob = await downloadTemplate();
      downloadBlob(blob, "project-update-template.xlsx");
      toast({
        title: "Success",
        description: "Excel template downloaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to download template",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx")) {
      toast({
        title: "Invalid File",
        description: "Please upload a .xlsx file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingExcel(true);
    try {
      const blob = await generatePptxFromExcel(file);
      downloadBlob(blob, "project-status-update.pptx");
      toast({
        title: "Success",
        description: "PPTX generated from Excel and downloaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate PPTX from Excel",
        variant: "destructive",
      });
    } finally {
      setIsUploadingExcel(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted via-background to-muted p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-tvs-blue/5" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-tvs-green/5" />
      </div>

      <div className="relative max-w-7xl mx-auto space-y-6">
        {/* Header with Logo */}
        <div className="text-center py-6">
          <div className="flex flex-col items-center gap-2">
            <img src={logo} alt="TVS Credit Service Ltd" className="h-12 object-contain" />
          </div>
          <div className="bg-muted/50 rounded-lg px-4 py-2 w-fit mx-auto mt-3">
            <span className="text-sm font-semibold text-tvs-blue tracking-wide uppercase">
              PPTX Automation
            </span>
          </div>
        </div>

        {/* User Info Bar */}
        {user && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-tvs-blue" />
                <div>
                  <p className="text-xs text-muted-foreground">Logged in as</p>
                  <p className="text-sm font-semibold text-foreground">{user}</p>
                </div>
              </div>
              <Button onClick={onLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}

        {/* Presentation Title Card */}
        <div className="bg-card rounded-2xl shadow-2xl shadow-tvs-blue/10 border border-border/60 overflow-hidden">
          <div className="h-1.5 w-full" style={{ background: "var(--tvs-gradient)" }} />
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-tvs-blue">Presentation Title</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tag">Team tag</Label>
                  <Select value={tag} onValueChange={setTag}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select team tag" />
                    </SelectTrigger>
                    <SelectContent>
                      {TAG_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Other (specify)</SelectItem>
                    </SelectContent>
                  </Select>
                  {tag === "custom" && (
                    <Input
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      placeholder="Enter custom tag..."
                      className="mt-2"
                    />
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subtag">Subtag</Label>
                  <Select value={subtag} onValueChange={setSubtag}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select subtag" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBTAG_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Other (specify)</SelectItem>
                    </SelectContent>
                  </Select>
                  {subtag === "custom" && (
                    <Input
                      value={customSubtag}
                      onChange={(e) => setCustomSubtag(e.target.value)}
                      placeholder="Enter custom subtag..."
                      className="mt-2"
                    />
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timeline">Timeline</Label>
                  <Input
                    id="metadata"
                    value={metadata}
                    onChange={(e) => setMetadata(e.target.value)}
                    placeholder="Enter timeline..."
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <p className="text-sm text-muted-foreground">
                  Preview: <span className="font-medium text-foreground">{presentationTitle || "Fill in the fields above"}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </div>

        {/* Data Entry Table Card */}
        <div className="bg-card rounded-2xl shadow-2xl shadow-tvs-blue/10 border border-border/60 overflow-hidden">
          <div className="h-1.5 w-full" style={{ background: "var(--tvs-gradient)" }} />
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-tvs-blue">Project Updates Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <ProjectUpdateTable rows={rows} onRowChange={handleRowChange} validationErrors={validationErrors} />
            </div>

            {/* Row Management Buttons */}
            <div className="flex gap-3">
              <Button onClick={addRow} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Row
              </Button>
              <Button
                onClick={removeLastRow}
                variant="outline"
                size="sm"
                disabled={rows.length <= 1}
              >
                <Minus className="h-4 w-4 mr-1" />
                Remove Last Row
              </Button>
            </div>

            <Separator />

            {/* Generate PPTX Button */}
            <div className="space-y-2">
              <Button
                onClick={handleGeneratePptx}
                disabled={isGenerating || hasErrors}
                className="w-full sm:w-auto bg-tvs-blue hover:bg-tvs-blue/90 text-primary-foreground font-semibold py-6 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-tvs-blue/20 hover:-translate-y-0.5"
                size="lg"
              >
                <FileDown className="h-4 w-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate PPTX"}
              </Button>
              {hasErrors && (
                <p className="text-sm text-destructive">
                  Please fix validation errors before generating PPTX.
                </p>
              )}
            </div>
          </CardContent>
        </div>

        {/* Excel Section Card */}
        <div className="bg-card rounded-2xl shadow-2xl shadow-tvs-blue/10 border border-border/60 overflow-hidden">
          <div className="h-1.5 w-full" style={{ background: "var(--tvs-gradient)" }} />
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-tvs-blue">Excel Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleDownloadTemplate}
                variant="secondary"
                disabled={isDownloadingTemplate}
                className="bg-tvs-green hover:bg-tvs-green/90 text-secondary-foreground"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                {isDownloadingTemplate ? "Downloading..." : "Download Excel Template"}
              </Button>

              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx"
                  onChange={handleExcelUpload}
                  className="hidden"
                />
                <Button
                  onClick={handleFileSelect}
                  variant="outline"
                  disabled={isUploadingExcel}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploadingExcel ? "Uploading..." : "Upload Excel & Generate PPTX"}
                </Button>
              </div>
            </div>
          </CardContent>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground py-4">
          © {new Date().getFullYear()} TVS Credit Service Ltd. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Index;