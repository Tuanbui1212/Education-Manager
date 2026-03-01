import axios from './axiosClient';
import type { IRoom, GetRoomsParams } from '../types/room.type';

export const roomService = {
    getRooms: async (
        params?: GetRoomsParams,
    ): Promise<{ success: boolean; message: string; data?: IRoom[]; totalCount: number }> => {
        const response = await axios.get('/rooms', { params });
        return {
            success: true,
            message: 'Lấy danh sách phòng thành công',
            data: response.data.data,
            totalCount: response.data.total,
        };
    },

    getRoomById: async (id: string): Promise<{ success: boolean; message: string; data?: IRoom }> => {
        const response = await axios.get(`/rooms/${id}`);
        return {
            success: true,
            message: 'Lấy thông tin phòng thành công',
            data: response.data.data,
        };
    },

    createRoom: async (roomData: Partial<IRoom>): Promise<{ success: boolean; message: string; data?: IRoom }> => {
        const response = await axios.post('/rooms', roomData);
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    },

    updateRoom: async (
        id: string,
        roomData: Partial<IRoom>,
    ): Promise<{ success: boolean; message: string; data?: IRoom }> => {
        const response = await axios.put(`/rooms/${id}`, roomData);
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    },

    deleteRoom: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await axios.delete(`/rooms/${id}`);
        return {
            success: true,
            message: response.data.message,
        };
    },
};
