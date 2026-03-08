import { Request, Response } from 'express';
import { RoleService } from '../services/role.service';

export class RoleController {
  private roleService = new RoleService();

  // [POST] /api/roles
  create = async (req: Request, res: Response) => {
    try {
      const result = await this.roleService.createRole(req.body);
      res.status(201).json({ success: true, message: 'Tạo vai trò thành công', data: result });
    } catch (error: any) {
      if (error.code === 11000) {
        return res.status(400).json({ success: false, message: 'Tên vai trò này đã tồn tại' });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // [GET] /api/roles
  getAll = async (req: Request, res: Response) => {
    try {
      const { items, total } = await this.roleService.getAllRoles(req.query as any);

      res.status(200).json({
        success: true,
        message: 'Lấy danh sách vai trò thành công',
        data: items,
        totalCount: total,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // [GET] /api/roles/:id
  getById = async (req: Request, res: Response) => {
    try {
      const result = await this.roleService.getRoleById(req.params.id as string);
      if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy vai trò' });

      res.status(200).json({ success: true, message: 'Lấy vai trò thành công', data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // [PUT] /api/roles/:id
  update = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;

      const result = await this.roleService.updateRole(id, req.body);
      if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy vai trò' });

      res.status(200).json({ success: true, message: 'Cập nhật vai trò thành công', data: result });
    } catch (error: any) {
      if (error.code === 11000) return res.status(400).json({ success: false, message: 'Tên vai trò đã tồn tại' });
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // [DELETE] /api/roles/:id
  remove = async (req: Request, res: Response) => {
    try {
      const result = await this.roleService.deleteRole(req.params.id as string);
      if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy vai trò' });

      res.status(200).json({ success: true, message: 'Xóa vai trò thành công' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
