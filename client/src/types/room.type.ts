export type RoomStatus = 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';

export interface GetRoomsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: RoomStatus;
}

export interface IRoom {
    _id?: string;
    name: string;
    capacity: number;
    status: RoomStatus;
    createdAt?: string;
    updatedAt?: string;
}

export interface RoomResponse {
    success: boolean;
    message: string;
    data: IRoom[];
    total: number;
}

export interface RoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<IRoom>) => void;
    initialData?: IRoom | null;
    loading?: boolean;
}
