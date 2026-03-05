"use client";
import { useState, useEffect } from "react";

interface Song {
  id: string;
  title: string;
  artist: string;
  keySong: string;
  content: string;
  url?: string;
}
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { db, auth, provider } from "../firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';


export default function WorshipSongs() {
  const [user, setUser] = useState<User | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [filter, setFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState({ open: false, id: null as string | null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  // Campos para crear
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [keySong, setKeySong] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");

  // Campos para editar
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editArtist, setEditArtist] = useState("");
  const [editKeySong, setEditKeySong] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editUrl, setEditUrl] = useState("");

  // Mover fetchSongs antes del useEffect
  const fetchSongs = async () => {
    const querySnapshot = await getDocs(collection(db, "musics"));
    const data = querySnapshot.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        title: d.title || '',
        artist: d.artist || '',
        keySong: d.keySong || '',
        content: d.content || '',
        url: d.url || ''
      } as Song;
    });
    setSongs(data);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) fetchSongs();
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    await signInWithPopup(auth, provider);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const keySongInput = String(formData.get("keySong") ?? keySong);
    try {
      await addDoc(collection(db, "musics"), { title, artist, keySong: keySongInput, content, url });
      setSnackbar({ open: true, message: 'Canción agregada', severity: 'success' });
      setShowCreate(false);
      setTitle(""); setArtist(""); setKeySong(""); setContent(""); setUrl("");
      fetchSongs();
    } catch {
      setSnackbar({ open: true, message: 'Error al agregar', severity: 'error' });
    }
  };

  const handleEditSong = (song: Song) => {
    setEditId(song.id);
    setEditTitle(song.title);
    setEditArtist(song.artist);
    setEditKeySong(song.keySong);
    setEditContent(song.content);
    setEditUrl(song.url || "");
    setShowEdit(true);
  };

  const handleUpdateSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const editKeySongInput = String(formData.get("editKeySong") ?? editKeySong);
    try {
      await updateDoc(doc(db, "musics", editId), {
        title: editTitle,
        artist: editArtist,
        keySong: editKeySongInput,
        content: editContent,
        url: editUrl
      });
      setSnackbar({ open: true, message: 'Canción actualizada', severity: 'success' });
      setShowEdit(false);
      fetchSongs();
    } catch {
      setSnackbar({ open: true, message: 'Error al actualizar', severity: 'error' });
    }
  };

  const handleDeleteSong = async () => {
    if (!showDelete.id) return;
    try {
      await deleteDoc(doc(db, "musics", showDelete.id));
      setSnackbar({ open: true, message: 'Canción eliminada', severity: 'success' });
      setShowDelete({ open: false, id: null });
      fetchSongs();
    } catch {
      setSnackbar({ open: true, message: 'Error al eliminar', severity: 'error' });
    }
  };

  const handleCancelEdit = () => {
    setShowEdit(false);
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 5 }}>
      <Card sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        {!user ? (
          <Box textAlign="center">
            <Button variant="contained" color="primary" onClick={handleLogin} sx={{ fontWeight: 700, fontSize: 18, px: 4, py: 1.5, borderRadius: 2 }}>
              Iniciar sesión con Google
            </Button>
          </Box>
        ) : (
          <>
            <Button
              onClick={handleLogout}
              variant="outlined"
              color="primary"
              fullWidth
              sx={{ mb: 3, fontWeight: 700, fontSize: 16, py: 1.2, borderRadius: 2, boxShadow: 1, textTransform: 'none', letterSpacing: 1 }}
            >
              Cerrar sesión
            </Button>
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<AddIcon />}
                sx={{ fontWeight: 700, borderRadius: 2, px: 3, py: 1.2, fontSize: 16, boxShadow: 2, textTransform: 'none', letterSpacing: 1 }}
                onClick={() => setShowCreate(true)}
              >
                Nueva Canción
              </Button>
            </Box>
            <Dialog open={showCreate} onClose={() => setShowCreate(false)} maxWidth="sm" fullWidth>
              <DialogTitle fontWeight={700}>Agregar nueva canción</DialogTitle>
              <form onSubmit={handleAddSong}>
                <DialogContent dividers>
                  <Stack spacing={2}>
                    <TextField label="Título" value={title} onChange={e => setTitle(e.target.value)} required fullWidth InputProps={{ style: { background: '#fff', borderRadius: 8, fontSize: 18, minHeight: 56 } }} />
                    <TextField label="Artista" value={artist} onChange={e => setArtist(e.target.value)} required fullWidth InputProps={{ style: { background: '#fff', borderRadius: 8, fontSize: 18, minHeight: 56 } }} />
                    <TextField
                      name="keySong"
                      label="Tonalidad"
                      value={keySong}
                      onChange={e => setKeySong(e.target.value)}
                      required
                      fullWidth
                      inputProps={{ autoCapitalize: 'none', autoCorrect: 'off', spellCheck: 'false' }}
                      InputProps={{ style: { background: '#fff', borderRadius: 8, fontSize: 18, minHeight: 56 } }}
                    />
                    <TextField
                      label="Letra / Contenido"
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      required
                      fullWidth
                      multiline
                      rows={8}
                      minRows={6}
                      maxRows={16}
                      InputProps={{
                        style: {
                          background: '#f7f7f7',
                          borderRadius: 8,
                          fontSize: 16,
                          minHeight: 180,
                          fontFamily: 'monospace',
                          whiteSpace: 'pre',
                          letterSpacing: 0.5
                        }
                      }}
                      sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace', whiteSpace: 'pre', fontSize: 16, background: '#f7f7f7', borderRadius: 1 } }}
                    />
                    <TextField label="URL (YouTube)" value={url} onChange={e => setUrl(e.target.value)} fullWidth InputProps={{ style: { background: '#fff', borderRadius: 8, fontSize: 16, minHeight: 56 } }} />
                  </Stack>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setShowCreate(false)} color="inherit" sx={{ fontWeight: 700, borderRadius: 2, px: 3, py: 1.2, fontSize: 16, textTransform: 'none', letterSpacing: 1 }}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="contained" color="secondary" sx={{ fontWeight: 700, fontSize: 18, borderRadius: 2, px: 4, py: 1.2, textTransform: 'none', letterSpacing: 1 }}>
                    Agregar
                  </Button>
                </DialogActions>
              </form>
            </Dialog>
            <Card sx={{ p: 3, borderRadius: 3, boxShadow: 2, background: '#f8fafc', color: '#222' }}>
              <Typography variant="h6" fontWeight={700} mb={2}>Listado de canciones</Typography>
              <TextField
                placeholder="Buscar por título o artista..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  style: { background: '#fff', borderRadius: 8 }
                }}
              />
              <Box sx={{ height: 500, width: '100%' }}>
                <DataGrid
                  rows={songs.filter(song =>
                    song.title.toLowerCase().includes(filter.toLowerCase()) ||
                    song.artist.toLowerCase().includes(filter.toLowerCase())
                  )}
                  columns={[
                    { field: 'title', headerName: 'Título', flex: 1, minWidth: 180 },
                    { field: 'artist', headerName: 'Artista', flex: 1, minWidth: 180 },
                    { field: 'keySong', headerName: 'Tonalidad', minWidth: 120 },
                    {
                      field: 'actions',
                      headerName: 'Acciones',
                      sortable: false,
                      filterable: false,
                      minWidth: 180,
                      renderCell: (params) => (
                        <Box>
                          <Button
                            onClick={() => handleEditSong(params.row)}
                            size="small"
                            variant="outlined"
                            color="primary"
                            sx={{ fontWeight: 700, borderRadius: 2, mr: 1, px: 2.5, py: 0.7, fontSize: 15, textTransform: 'none', letterSpacing: 1 }}
                          >
                            Editar
                          </Button>
                          <Button
                            onClick={() => setShowDelete({ open: true, id: params.row.id })}
                            size="small"
                            variant="outlined"
                            color="error"
                            sx={{ fontWeight: 700, borderRadius: 2, px: 2.5, py: 0.7, fontSize: 15, textTransform: 'none', letterSpacing: 1 }}
                          >
                            Eliminar
                          </Button>
                        </Box>
                      ),
                    },
                  ] as GridColDef[]}
                  pagination
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
                  pageSizeOptions={[5, 10, 20, 50]}
                  disableRowSelectionOnClick
                  sx={{ background: '#fff', borderRadius: 2 }}
                />
              </Box>
            </Card>
            {/* Modal de edición */}
            <Dialog open={showEdit} onClose={handleCancelEdit} maxWidth="sm" fullWidth>
              <DialogTitle fontWeight={700}>Editar canción</DialogTitle>
              <form onSubmit={handleUpdateSong}>
                <DialogContent dividers>
                  <Stack spacing={2}>
                    <TextField
                      label="Letra / Contenido"
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      required
                      fullWidth
                      multiline
                      rows={8}
                      minRows={6}
                      maxRows={16}
                      InputProps={{
                        style: {
                          background: '#f7f7f7',
                          borderRadius: 8,
                          fontSize: 16,
                          minHeight: 180,
                          fontFamily: 'monospace',
                          whiteSpace: 'pre',
                          letterSpacing: 0.5
                        }
                      }}
                      sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace', whiteSpace: 'pre', fontSize: 16, background: '#f7f7f7', borderRadius: 1 } }}
                    />
                    <TextField label="Título" value={editTitle} onChange={e => setEditTitle(e.target.value)} required fullWidth InputProps={{ style: { background: '#fff', borderRadius: 8, fontSize: 18, minHeight: 56 } }} />
                    <TextField label="Artista" value={editArtist} onChange={e => setEditArtist(e.target.value)} required fullWidth InputProps={{ style: { background: '#fff', borderRadius: 8, fontSize: 18, minHeight: 56 } }} />
                    <TextField
                      name="editKeySong"
                      label="Tonalidad"
                      value={editKeySong}
                      onChange={e => setEditKeySong(e.target.value)}
                      required
                      fullWidth
                      inputProps={{ autoCapitalize: 'none', autoCorrect: 'off', spellCheck: 'false' }}
                      InputProps={{ style: { background: '#fff', borderRadius: 8, fontSize: 18, minHeight: 56 } }}
                    />
                    <TextField label="URL (YouTube)" value={editUrl} onChange={e => setEditUrl(e.target.value)} fullWidth InputProps={{ style: { background: '#fff', borderRadius: 8, fontSize: 16, minHeight: 56 } }} />
                  </Stack>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCancelEdit} color="inherit" sx={{ fontWeight: 700, borderRadius: 2, px: 3, py: 1.2, fontSize: 16, textTransform: 'none', letterSpacing: 1 }}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="contained" color="primary" sx={{ fontWeight: 700, fontSize: 18, borderRadius: 2, px: 4, py: 1.2, textTransform: 'none', letterSpacing: 1 }}>
                    Actualizar
                  </Button>
                </DialogActions>
              </form>
            </Dialog>
            {/* Modal de confirmación para eliminar */}
            <Dialog open={showDelete.open} onClose={() => setShowDelete({ open: false, id: null })}>
              <DialogTitle>¿Eliminar canción?</DialogTitle>
              <DialogContent>¿Estás seguro que deseas eliminar esta canción? Esta acción no se puede deshacer.</DialogContent>
              <DialogActions>
                <Button onClick={() => setShowDelete({ open: false, id: null })} color="inherit" sx={{ fontWeight: 700, borderRadius: 2, px: 3, py: 1.2, fontSize: 16, textTransform: 'none', letterSpacing: 1 }}>
                  Cancelar
                </Button>
                <Button onClick={handleDeleteSong} color="error" variant="contained" sx={{ fontWeight: 700, borderRadius: 2, px: 4, py: 1.2, fontSize: 16, textTransform: 'none', letterSpacing: 1 }}>
                  Eliminar
                </Button>
              </DialogActions>
            </Dialog>
            {/* Snackbar de éxito */}
            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
              <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                {snackbar.message}
              </Alert>
            </Snackbar>
          </>
        )}
      </Card>
    </Box>
  );
}
         