import { useEffect, useRef, useState, useMemo } from "react";
import { filesApi, connectedAccountsApi } from "../api/resources";
import type { FileItem } from "../api/types";
import { formatBytes, formatDate } from "../utils/format";
import { uploadFile } from "../api/upload";
import type { MenuState } from "./ContextMenu";
import type { UploadState } from "./UploadPanel";
import { apiBlob } from "../api/client";
import { readUploadActivity, writeUploadActivity } from "./ActivityView";
import { File, Image as ImageIcon, FileText, Video, FileArchive, Folder, Search, Grid, List } from "lucide-react";
import { 
  Button, 
  Input, 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell, 
  Card, 
  CardBody, 
  CardFooter,
  Pagination,
  ButtonGroup,
  Chip
} from "@nextui-org/react";

// Pre-defined color palette for drives
const DRIVE_COLORS = [
  "primary",
  "secondary",
  "success",
  "warning",
  "danger",
] as const;

function ImageThumbnail({ fileId, name }: { fileId: string; name: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    apiBlob(`/files/${fileId}/thumbnail`)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => {});
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileId]);

  return src ? (
    <img src={src} alt={name} className="h-full w-full object-cover" />
  ) : (
    <ImageIcon size={42} className="text-primary" />
  );
}

export function FilesView({
  refreshKey,
  onContextMenu,
  onUploadStart,
  onUploadProgress,
  onUploadDone,
}: {
  refreshKey: number;
  onContextMenu: (m: MenuState) => void;
  onUploadStart: (u: UploadState) => void;
  onUploadProgress: (u: UploadState) => void;
  onUploadDone: () => void;
}) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [accountsMeta, setAccountsMeta] = useState<Record<string, { email: string, colorIndex: number }>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "video" | "document" | "other">("all");
  const [sortBy, setSortBy] = useState<"newest" | "name" | "size">("newest");
  const [isDragging, setIsDragging] = useState(false);
  const [page, setPage] = useState(1);
  const [algorithm, setAlgorithm] = useState<"first-fit" | "round-robin" | "adaptive">("adaptive");
  const fileInput = useRef<HTMLInputElement>(null);

  const ITEMS_PER_PAGE = 30;

  useEffect(() => {
    filesApi.list().then(setFiles).catch(() => {});
    connectedAccountsApi
      .list()
      .then((accounts) => {
        const map: Record<string, { email: string, colorIndex: number }> = {};
        accounts.forEach((a, index) => {
          map[a.id] = {
            email: a.googleAccountEmail.split("@")[0],
            colorIndex: index % DRIVE_COLORS.length
          };
        });
        setAccountsMeta(map);
      })
      .catch(() => {});
  }, [refreshKey]);

  const filteredFiles = useMemo(() => {
    const filtered = files.filter((f) => {
      const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all"
        || (typeFilter === "image" && f.mimeType.startsWith("image/"))
        || (typeFilter === "video" && f.mimeType.startsWith("video/"))
        || (typeFilter === "document" && (f.mimeType.includes("pdf") || f.mimeType.includes("document") || f.mimeType.includes("text")))
        || (typeFilter === "other" && !f.mimeType.startsWith("image/") && !f.mimeType.startsWith("video/") && !f.mimeType.includes("pdf") && !f.mimeType.includes("document") && !f.mimeType.includes("text"));
      return matchesSearch && matchesType;
    });
    return filtered.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "size") return Number(b.sizeBytes) - Number(a.sizeBytes);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [files, search, sortBy, typeFilter]);

  const totalPages = Math.ceil(filteredFiles.length / ITEMS_PER_PAGE) || 1;
  const paginatedFiles = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredFiles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredFiles, page]);

  useEffect(() => setPage(1), [search, sortBy, typeFilter]);

  const handleFilesPicked = async (pickedFiles: FileList) => {
    const filesToUpload = Array.from(pickedFiles);
    for (const file of filesToUpload) {
      const activityId = `${Date.now()}-${file.name}`;
      onUploadStart({ fileName: file.name, pct: 0 });
      try {
        await uploadFile(file, null, (pct) => onUploadProgress({ fileName: file.name, pct }), algorithm);
        onUploadProgress({ fileName: file.name, pct: 100, done: true });
        writeUploadActivity([
          { id: activityId, fileName: file.name, status: "completed", createdAt: new Date().toISOString() },
          ...readUploadActivity(),
        ]);
      } catch (err) {
        const message = (err as Error).message;
        onUploadProgress({ fileName: file.name, pct: 0, error: message });
        writeUploadActivity([
          { id: activityId, fileName: file.name, status: "failed", message, createdAt: new Date().toISOString() },
          ...readUploadActivity(),
        ]);
      }
    }
    onUploadDone();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files.length > 0) void handleFilesPicked(event.dataTransfer.files);
  };

  const duplicateIds = useMemo(() => {
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    files.forEach((file) => {
      const key = `${file.name.toLowerCase()}-${file.sizeBytes}`;
      if (seen.has(key)) duplicates.add(file.id);
      seen.add(key);
    });
    return duplicates;
  }, [files]);

  const getFileIcon = (mimeType: string, size: number) => {
    if (mimeType.includes("image/")) return <ImageIcon size={size} className="text-primary" />;
    if (mimeType.includes("video/")) return <Video size={size} className="text-danger" />;
    if (mimeType.includes("pdf") || mimeType.includes("document")) return <FileText size={size} className="text-blue-500" />;
    if (mimeType.includes("zip") || mimeType.includes("tar")) return <FileArchive size={size} className="text-yellow-500" />;
    if (mimeType === "application/vnd.google-apps.folder") return <Folder size={size} className="text-primary fill-primary" />;
    return <File size={size} className="text-default-500" />;
  };

  return (
    <div
      className={`relative flex flex-col h-full overflow-hidden w-full px-2 ${isDragging ? "rounded-xl ring-2 ring-primary ring-inset" : ""}`}
      onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => { if (event.currentTarget === event.target) setIsDragging(false); }}
      onDrop={handleDrop}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 font-mono text-sm text-default-500">
          <span className="font-semibold text-foreground">CloudFusion</span>
          <span>/</span>
          <span>All Files</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Input
            classNames={{
              base: "w-64",
              input: "text-sm",
            }}
            placeholder="Search files..."
            size="sm"
            startContent={<Search size={16} className="text-default-400" />}
            value={search}
            onValueChange={setSearch}
            isClearable
          />
          <select aria-label="Filter files by type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as typeof typeFilter)} className="h-8 rounded-medium border border-divider bg-content1 px-2 text-xs text-default-600">
            <option value="all">All types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="document">Documents</option>
            <option value="other">Other</option>
          </select>
          <select aria-label="Sort files" value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)} className="h-8 rounded-medium border border-divider bg-content1 px-2 text-xs text-default-600">
            <option value="newest">Newest</option>
            <option value="name">Name</option>
            <option value="size">Largest</option>
          </select>

          <ButtonGroup size="sm" variant="flat">
            <Button isIconOnly onPress={() => setViewMode("list")} className={viewMode === "list" ? "bg-default-200" : ""}>
              <List size={16} />
            </Button>
            <Button isIconOnly onPress={() => setViewMode("grid")} className={viewMode === "grid" ? "bg-default-200" : ""}>
              <Grid size={16} />
            </Button>
          </ButtonGroup>

          <Button color="primary" size="sm" onPress={() => fileInput.current?.click()} className="font-semibold">
            + Add files
          </Button>
          <select
            aria-label="Upload placement algorithm"
            value={algorithm}
            onChange={(event) => setAlgorithm(event.target.value as typeof algorithm)}
            className="h-8 rounded-medium border border-divider bg-content1 px-2 text-xs text-default-600"
          >
            <option value="adaptive">Adaptive</option>
            <option value="first-fit">First-fit</option>
            <option value="round-robin">Round-robin</option>
          </select>
          <input ref={fileInput} type="file" multiple className="hidden" onChange={(e) => { if (e.target.files?.length) void handleFilesPicked(e.target.files); e.target.value = ""; }} />
        </div>

        {isDragging && (
          <div className="pointer-events-none absolute inset-4 z-20 flex items-center justify-center rounded-xl border-2 border-dashed border-primary bg-primary/10">
            <p className="rounded-lg bg-content1 px-5 py-3 text-sm font-semibold text-primary shadow-lg">Drop files to upload</p>
          </div>
        )}
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto pb-6 pr-2">
        {paginatedFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-default-400">
            <Folder size={64} className="opacity-50" />
            <p className="text-sm">No files found</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {paginatedFiles.map(f => {
              const sel = selected === f.id;
              const meta = accountsMeta[f.connectedAccountId];
              return (
                <Card 
                  key={f.id} 
                  isPressable 
                  isHoverable
                  onPress={() => setSelected(f.id)}
                  onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setSelected(f.id); onContextMenu({ x: e.clientX, y: e.clientY, file: f }); }}
                  className={`border-2 transition-all ${sel ? "border-primary bg-content2" : "border-transparent bg-content1"}`}
                  shadow="sm"
                >
                  <CardBody className="flex aspect-[4/3] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-content2 to-content1 p-0">
                    {f.mimeType.startsWith("image/") ? (
                      <ImageThumbnail fileId={f.id} name={f.name} />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">{getFileIcon(f.mimeType, 48)}</div>
                    )}
                  </CardBody>
                  <CardFooter className="flex flex-col items-start px-4 pb-4 pt-0 gap-1.5 overflow-hidden">
                    <div className="flex w-full items-center gap-1">
                      <p className="text-xs font-semibold text-foreground truncate" title={f.name}>{f.name}</p>
                      {duplicateIds.has(f.id) && <Chip size="sm" color="warning" variant="flat" className="h-4 px-1 text-[9px]">Duplicate</Chip>}
                    </div>
                    <div className="flex justify-between w-full items-center">
                      <p className="text-[10px] text-default-500">{formatBytes(f.sizeBytes)}</p>
                      {meta && (
                        <Chip size="sm" variant="flat" color={DRIVE_COLORS[meta.colorIndex]} className="text-[9px] h-4 px-1" title={`Stored on ${meta.email}`}>
                          Drive {meta.colorIndex + 1}
                        </Chip>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Table 
            aria-label="Files table" 
            selectionMode="single" 
            color="primary"
            selectedKeys={selected ? [selected] : []}
            onRowAction={(key) => setSelected(key as string)}
            classNames={{ wrapper: "bg-content1", td: "py-3" }}
          >
            <TableHeader>
              <TableColumn>NAME</TableColumn>
              <TableColumn>DRIVE</TableColumn>
              <TableColumn>SIZE</TableColumn>
              <TableColumn>MODIFIED</TableColumn>
            </TableHeader>
            <TableBody items={paginatedFiles}>
              {(f) => {
                const meta = accountsMeta[f.connectedAccountId];
                return (
                  <TableRow 
                    key={f.id} 
                    onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setSelected(f.id); onContextMenu({ x: e.clientX, y: e.clientY, file: f }); }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getFileIcon(f.mimeType, 20)}
                        <span className="max-w-[300px] truncate text-sm">{f.name}</span>
                        {duplicateIds.has(f.id) && <Chip size="sm" color="warning" variant="flat">Duplicate</Chip>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {meta ? (
                        <Chip size="sm" variant="flat" color={DRIVE_COLORS[meta.colorIndex]}>
                          {meta.email}
                        </Chip>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-sm font-mono">{formatBytes(f.sizeBytes)}</TableCell>
                    <TableCell className="text-sm text-default-500">{formatDate(f.createdAt)}</TableCell>
                  </TableRow>
                )
              }}
            </TableBody>
          </Table>
        )}
      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center py-4 mt-auto border-t border-divider">
        <p className="text-xs text-default-500 font-mono">
          {filteredFiles.length} files total
        </p>
        
        {totalPages > 1 && (
          <Pagination 
            isCompact 
            showControls 
            color="primary" 
            page={page} 
            total={totalPages} 
            onChange={setPage} 
          />
        )}
      </div>
    </div>
  );
}
