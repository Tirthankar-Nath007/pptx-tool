import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MAX_CHARS, RowValidationErrors } from "@/lib/validation";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface RowData {
  brief: string;
  impact: string;
  effort: string;
  remarks: string;
  eta: string;
  status: string;
}

interface ProjectUpdateTableProps {
  rows: RowData[];
  onRowChange: (index: number, field: keyof RowData, value: string) => void;
  validationErrors: RowValidationErrors[];
}

const STATUS_OPTIONS = ["Action Over", "In Progress", "Not as per Plan", "Yet to Start"];
const EFFORT_OPTIONS = ["S", "M", "L", "XL"];

const ProjectUpdateTable = ({ rows, onRowChange, validationErrors }: ProjectUpdateTableProps) => {
  const renderTextareaWithError = (
    rowIndex: number,
    field: keyof typeof MAX_CHARS,
    value: string,
    placeholder: string,
    minWidth: string
  ) => {
    const error = validationErrors[rowIndex]?.[field];
    return (
      <div className="space-y-1">
        <Textarea
          value={value}
          onChange={(e) => onRowChange(rowIndex, field, e.target.value)}
          placeholder={placeholder}
          className={`${minWidth} min-h-[60px] resize-none text-sm ${error ? "border-destructive" : ""}`}
          rows={2}
        />
        {error && (
          <p className="text-xs text-destructive break-words">{error}</p>
        )}
      </div>
    );
  };

  const renderInputWithError = (
    rowIndex: number,
    field: keyof typeof MAX_CHARS,
    value: string,
    placeholder: string,
    className: string
  ) => {
    const error = validationErrors[rowIndex]?.[field];
    return (
      <div className="space-y-1">
        <Input
          value={value}
          onChange={(e) => onRowChange(rowIndex, field, e.target.value)}
          placeholder={placeholder}
          className={`${className} ${error ? "border-destructive" : ""}`}
        />
        {error && (
          <p className="text-xs text-destructive break-words">{error}</p>
        )}
      </div>
    );
  };

  console.log("eta", rows.map(row => row.eta));

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-16 text-center font-semibold">Sl No.</TableHead>
            <TableHead className="min-w-[180px] font-semibold">
              Brief about change
              <span className="text-xs text-muted-foreground ml-1">({MAX_CHARS.brief})</span>
            </TableHead>
            <TableHead className="min-w-[180px] font-semibold">
              What is the impact
              <span className="text-xs text-muted-foreground ml-1">({MAX_CHARS.impact})</span>
            </TableHead>
            <TableHead className="w-24 font-semibold">
              Dev effort
              <span className="text-xs text-muted-foreground ml-1">({MAX_CHARS.effort})</span>
            </TableHead>
            <TableHead className="min-w-[150px] font-semibold">
              Remarks
              <span className="text-xs text-muted-foreground ml-1">({MAX_CHARS.remarks})</span>
            </TableHead>
            <TableHead className="w-32 font-semibold">
              Gone Live/ETA
              <span className="text-xs text-muted-foreground ml-1">({MAX_CHARS.eta})</span>
            </TableHead>
            <TableHead className="w-40 font-semibold">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              <TableCell className="text-center font-medium text-muted-foreground">
                {index + 1}
              </TableCell>
              <TableCell className="align-top">
                {renderTextareaWithError(index, "brief", row.brief, "Enter brief...", "min-w-[160px]")}
              </TableCell>
              <TableCell className="align-top">
                {renderTextareaWithError(index, "impact", row.impact, "Enter impact...", "min-w-[160px]")}
              </TableCell>
              <TableCell className="align-center">
                <Select
                  value={row.effort}
                  onValueChange={(value) => onRowChange(index, "effort", value)}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue placeholder="S/M/L" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {EFFORT_OPTIONS.map((effort) => (
                      <SelectItem key={effort} value={effort}>
                        {effort}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors[index]?.effort && (
                  <p className="text-xs text-destructive break-words">{validationErrors[index].effort}</p>
                )}
              </TableCell>
              <TableCell className="align-top">
                {renderTextareaWithError(index, "remarks", row.remarks, "Remarks...", "min-w-[130px]")}
              </TableCell>
              <TableCell>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-30 justify-start text-left font-normal ${
                        validationErrors[index]?.eta ? "border-destructive" : ""
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {row.eta ? (() => {
                        // Parse date string in dd/MM/yyyy format correctly
                        const [day, month, year] = row.eta.split("/");
                        const date = new Date(Number(year), Number(month) - 1, Number(day));
                        return format(date, "dd/MM/yyyy");
                      })() : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={row.eta ? (() => {
                        const [day, month, year] = row.eta.split("/");
                        return new Date(Number(year), Number(month) - 1, Number(day));
                      })() : undefined}
                      onSelect={(date) => onRowChange(index, "eta", date ? format(date, "dd/MM/yyyy") : "")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {validationErrors[index]?.eta && (
                  <p className="text-xs text-destructive break-words">{validationErrors[index].eta}</p>
                )}
              </TableCell>
              <TableCell>
                <Select
                  value={row.status}
                  onValueChange={(value) => onRowChange(index, "status", value)}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProjectUpdateTable;
