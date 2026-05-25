import { useState, useCallback, useMemo } from "react";
import { BACKEND_URL } from "../api/adminAPI";
import { API_ROUTES } from "../utils/apiRoutes";
import useAdminTable from "../hooks/useAdminTable";
import Cropper from "react-easy-crop";
import Slider from "@mui/material/Slider";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Plus,
  Trash2,
  Edit3,
  X,
  Save,
  UploadCloud,
  Folder,
  Search,
  AlertTriangle,
} from "lucide-react";

const getCroppedImg = (imageSrc, pixelCrop) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const image = new Image();
  image.src = imageSrc;

  return new Promise((resolve) => {
    image.onload = () => {
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height,
      );
      canvas.toBlob((blob) => resolve(blob), "image/jpeg");
    };
  });
};

function ImageCropper({ imageSrc, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropCompleteInternal = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSave = async () => {
    const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
    onCropComplete(croppedBlob);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col justify-center items-center z-[100] p-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-lg border dark:border-slate-800">
        <h3 className="text-xl font-black mb-6 dark:text-white uppercase tracking-widest text-center">
          Refine Thumbnail
        </h3>
        <div className="relative w-full h-80 bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden shadow-inner">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropCompleteInternal}
          />
        </div>
        <div className="mt-8 px-4">
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(e, val) => setZoom(val)}
            sx={{ color: "#4f46e5" }}
          />
        </div>
        <div className="flex gap-3 mt-8">
          <button
            onClick={onCancel}
            className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Categories() {
  // 1. Replaced fetch states with useAdminTable Hook
  const { data: categories = [], loading, executeAction } = useAdminTable(
    API_ROUTES.ADMIN_CATEGORIES.GET_ALL
  );

  const [searchTerm, setSearchTerm] = useState("");

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState(null);
  const [editCategory, setEditCategory] = useState(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState(null);

  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    id: null,
    count: 0,
  });

  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [cropForEdit, setCropForEdit] = useState(false);

  const getFullImgPath = (path) => {
    if (!path)
      return "https://cdn.textstudio.com/output/sample/normal/8/3/4/6/vs-logo-275-16438.png";
    return path.startsWith("http") ? path : `${BACKEND_URL}/${path}`;
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [categories, searchTerm]);

  // 2. Updated to use executeAction hook
  const handleAddCategory = async () => {
    if (!newCategoryName) return;
    setUploading(true);
    setLoadingMessage("Creating Category...");
    
    const formData = new FormData();
    formData.append("name", newCategoryName);
    if (newCategoryImage) formData.append("image", newCategoryImage);

    const success = await executeAction(API_ROUTES.ADMIN_CATEGORIES.CREATE, "POST", formData);
    
    if (success) {
      setNewCategoryName("");
      setNewCategoryImage(null);
      setIsAdding(false);
    }
    
    setUploading(false);
  };

  // 3. Updated to use executeAction hook
  const handleEditCategory = async () => {
    setUploading(true);
    setLoadingMessage("Syncing Changes...");
    
    const formData = new FormData();
    formData.append("name", editName);
    if (editImage) formData.append("image", editImage);

    const success = await executeAction(API_ROUTES.ADMIN_CATEGORIES.UPDATE(editCategory), "PUT", formData);
    
    if (success) {
      setEditCategory(null);
      setEditImage(null);
    }

    setUploading(false);
  };

  // 4. Updated to use executeAction hook
  const executeDelete = async () => {
    const { id } = deleteDialog;
    setDeleteDialog({ open: false, id: null, count: 0 });
    setUploading(true);
    setLoadingMessage("Removing Category...");

    await executeAction(API_ROUTES.ADMIN_CATEGORIES.DELETE(id), "DELETE");

    setUploading(false);
  };

  const handleFileSelect = (file, isEdit = false) => {
    if (!file) return;
    setTempImage(URL.createObjectURL(file));
    setShowCropper(true);
    setCropForEdit(isEdit);
  };

  const handleCropComplete = (croppedBlob) => {
    const croppedFile = new File([croppedBlob], "category.jpg", {
      type: "image/jpeg",
    });
    if (cropForEdit) setEditImage(croppedFile);
    else setNewCategoryImage(croppedFile);
    setShowCropper(false);
  };

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-6 pt-24">
      {/* Progress Overlay */}
      {uploading && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex flex-col justify-center items-center z-[150]">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6">
            <div className="w-14 h-14 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-black uppercase tracking-widest text-xs text-slate-500">
              {loadingMessage}
            </span>
          </div>
        </div>
      )}

      {showCropper && (
        <ImageCropper
          imageSrc={tempImage}
          onCropComplete={handleCropComplete}
          onCancel={() => setShowCropper(false)}
        />
      )}

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
              <Folder className="text-indigo-600" /> Catalog
            </h1>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <TextField
              size="small"
              placeholder="Search category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                bgcolor: "white",
                borderRadius: "14px",
                "& .MuiOutlinedInput-root": { borderRadius: "14px" },
                display: { xs: "none", sm: "flex" },
                minWidth: "250px",
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} className="text-slate-400" />
                  </InputAdornment>
                ),
              }}
            />
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-indigo-700 transition-all flex items-center gap-3"
              >
                <Plus size={20} /> Create
              </button>
            )}
          </div>
        </div>

        {/* Create Form */}
        {isAdding && (
          <div className="mb-10 p-10 bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-6">
            <div className="flex flex-col md:flex-row gap-10 items-center">
              <div className="relative group w-40 h-40 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-4 border-dashed border-slate-200 dark:border-slate-700">
                {newCategoryImage ? (
                  <img
                    src={URL.createObjectURL(newCategoryImage)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UploadCloud className="text-slate-300" size={40} />
                )}
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => handleFileSelect(e.target.files[0], false)}
                />
              </div>
              <div className="flex-1 w-full space-y-6">
                <input
                  type="text"
                  placeholder="Category Name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full text-2xl font-black border-none bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl outline-none"
                />
                <div className="flex gap-4">
                  <button
                    onClick={handleAddCategory}
                    className="px-10 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] tracking-widest"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsAdding(false)}
                    className="px-10 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black text-[10px] tracking-widest"
                  >
                    Discard
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories Table */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <tr>
                <th className="p-8">Thumbnail</th>
                <th className="p-8">Details</th>
                <th className="p-8 text-center">Items</th>
                <th className="p-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {filteredCategories.map((cat) => (
                <tr
                  key={cat.id}
                  className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all"
                >
                  <td className="p-8">
                    <div className="relative w-20 h-20 rounded-[1.5rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-md">
                      <img
                        src={
                          editCategory === cat.id && editImage
                            ? URL.createObjectURL(editImage)
                            : getFullImgPath(cat.image_url)
                        }
                        className="w-full h-full object-cover"
                      />
                      {editCategory === cat.id && (
                        <input
                          type="file"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) =>
                            handleFileSelect(e.target.files[0], true)
                          }
                        />
                      )}
                    </div>
                  </td>
                  <td className="p-8">
                    {editCategory === cat.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="text-xl font-black bg-slate-100 dark:bg-slate-800 p-3 rounded-xl w-full outline-none"
                      />
                    ) : (
                      <span className="text-xl font-black">{cat.name}</span>
                    )}
                  </td>
                  <td className="p-8 text-center">
                    <span className="text-2xl font-black text-indigo-600">
                      {cat.productCount}
                    </span>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex gap-3 justify-end">
                      {editCategory === cat.id ? (
                        <>
                          <button
                            onClick={handleEditCategory}
                            className="group/btn relative p-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all"
                          >
                            <Save size={20} />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                              Save
                            </span>
                          </button>
                          <button
                            onClick={() => setEditCategory(null)}
                            className="group/btn relative p-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                          >
                            <X size={20} />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                              Cancel
                            </span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditCategory(cat.id);
                              setEditName(cat.name);
                            }}
                            className="group/btn relative p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all"
                          >
                            <Edit3 size={20} />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                              Edit
                            </span>
                          </button>
                          <button
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                id: cat.id,
                                count: cat.productCount,
                              })
                            }
                            className="group/btn relative p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all"
                          >
                            <Trash2 size={20} />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                              Delete
                            </span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, count: 0 })}
        PaperProps={{ sx: { borderRadius: "2rem", p: 2 } }}
      >
        <DialogTitle
          sx={{
            fontWeight: 900,
            textTransform: "uppercase",
            fontSize: "14px",
            letterSpacing: "1px",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <AlertTriangle className="text-rose-500" size={20} /> Security Lock
        </DialogTitle>
        <DialogContent>
          {deleteDialog.count > 0 ? (
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: "text.secondary" }}
            >
              Action Blocked: This category still contains {deleteDialog.count}{" "}
              products (active or inactive). Please reassign or delete the products first.
            </Typography>
          ) : (
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: "text.secondary" }}
            >
              Are you sure? This will permanently remove the category from the
              database.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setDeleteDialog({ open: false, id: null, count: 0 })}
            sx={{ fontWeight: 900, color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            onClick={executeDelete}
            disabled={deleteDialog.count > 0}
            variant="contained"
            color="error"
            sx={{ borderRadius: "14px", fontWeight: 900, px: 4 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}