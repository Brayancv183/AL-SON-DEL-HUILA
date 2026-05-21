import api from '../services/api';

export const getMisPublicaciones = () => api.get('/perfil/mis-publicaciones').then(res => res.data);

export const updatePublicacion = (id, data) => api.put(`/publicaciones/${id}`, data).then(res => res.data);

export const deletePublicacion = (id) => api.delete(`/publicaciones/${id}`).then(res => res.data);