import MuiTable from "@mui/material/Table";
import MuiTableHead from "@mui/material/TableHead";
import MuiTableBody from "@mui/material/TableBody";
import MuiTableFooter from "@mui/material/TableFooter";
import MuiTableRow from "@mui/material/TableRow";
import MuiTableCell from "@mui/material/TableCell";
import { cn } from "@/lib/utils";

const tableSx = {
  borderCollapse: "collapse",
  fontSize: "0.875rem",
  "& .MuiTableCell-root": {
    borderColor: "var(--border)",
    padding: "8px 8px",
    fontSize: "0.875rem",
    color: "var(--foreground)",
  },
  "& tr:last-child .MuiTableCell-root": { borderBottom: "none" },
};

function Table({ className, ...props }) {
  return (
    <div className="relative min-h-0 w-full flex-1 overflow-auto rounded-xl border border-border/60">
      <MuiTable
        size="small"
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        sx={tableSx}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }) {
  return (
    <MuiTableHead
      data-slot="table-header"
      className={cn("[&_tr]:bg-muted/50", className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }) {
  return (
    <MuiTableRow
      data-slot="table-row"
      className={cn(
        "transition-colors even:bg-muted/30 hover:bg-muted/50",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }) {
  return (
    <MuiTableCell
      component="th"
      scope="col"
      data-slot="table-head"
      className={cn(
        "sticky top-0 z-10 h-11 bg-muted px-2 text-left align-middle text-[11px] font-semibold tracking-[0.05em] whitespace-nowrap",
        className,
      )}
      sx={{ color: "var(--muted-foreground)", fontWeight: 600 }}
      {...props}
    />
  );
}

function TableCell({ className, ...props }) {
  return (
    <MuiTableCell
      data-slot="table-cell"
      className={cn("p-2 align-middle whitespace-nowrap", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }) {
  return (
    <MuiTableBody
      data-slot="table-body"
      className={cn("text-sm", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }) {
  return (
    <MuiTableFooter
      data-slot="table-footer"
      className={cn(className)}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
};