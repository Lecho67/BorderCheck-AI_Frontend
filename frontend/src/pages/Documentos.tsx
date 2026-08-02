import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { DocumentRecord } from '../types/database.types';

export default function Documentos() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setDocuments(data as DocumentRecord[]);
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const filePath = `${user.id}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      alert('Error al subir archivo: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { error: insertError } = await supabase.from('documents').insert({
      user_id: user.id,
      file_name: file.name,
      file_path: filePath,
      file_type: file.type,
    });

    if (insertError) {
      alert('Error al guardar registro: ' + insertError.message);
    } else {
      fetchDocuments();
    }
    setUploading(false);
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 60); // URL válida por 60 segundos

    if (error || !data) {
      alert('Error al generar enlace de descarga');
      return;
    }
    window.open(data.signedUrl, '_blank');
  };

  const handleDelete = async (doc: DocumentRecord) => {
    await supabase.storage.from('documents').remove([doc.file_path]);
    await supabase.from('documents').delete().eq('id', doc.id);
    fetchDocuments();
  };

  return (
    <div>
      <h1>Mis Documentos</h1>
      <input type="file" onChange={handleUpload} disabled={uploading} />
      {uploading && <p>Subiendo...</p>}

      <ul>
        {documents.map((doc) => (
          <li key={doc.id}>
            {doc.file_name}
            <button onClick={() => handleDownload(doc.file_path, doc.file_name)}>
              Descargar
            </button>
            <button onClick={() => handleDelete(doc)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}