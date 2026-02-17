import { useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, FileDown, Upload, FileSpreadsheet } from "lucide-react";
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

const Index = () => {
  const [tag, setTag] = useState("");
  const [subtag, setSubtag] = useState("");
  const [metadata, setMetadata] = useState("");
  const [rows, setRows] = useState<RowData[]>([createEmptyRow()]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isUploadingExcel, setIsUploadingExcel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const presentationTitle = `${tag}: ${subtag} - ${metadata}`;

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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Project Status Update</h1>
          <p className="text-muted-foreground mt-2">
            Generate PowerPoint presentations from project updates
          </p>
        </div>

        {/* Presentation Title */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Presentation Title</CardTitle>
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
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
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
                      value={subtag}
                      onChange={(e) => setSubtag(e.target.value)}
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
                  Preview: <span className="font-medium text-foreground">{presentationTitle}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Entry Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Project Updates Data</CardTitle>
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
                className="w-full sm:w-auto"
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
        </Card>

        {/* Excel Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Excel Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleDownloadTemplate}
                variant="secondary"
                disabled={isDownloadingTemplate}
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
        </Card>
      </div>
    </div>
  );
};

export default Index;
