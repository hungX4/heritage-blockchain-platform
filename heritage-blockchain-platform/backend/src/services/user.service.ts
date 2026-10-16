import { listenerCount } from "process";
import { AppDataSource } from "../config/database.js";
import { User } from "../models/user.model.js";
import { UserRole } from "../types/enums/rbac.js";

export class UserService {
  private static userRepo = AppDataSource.getRepository(User);

  static async getAllUsers(params: {
    page?: number,
    limit?: number,
    search?: string
    role?: UserRole
  }) {
    const page = Math.max(1, Number(params.page)) || 1;
    const limit = Math.max(1, Math.min(25, Number(params.limit)) || 10);
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.organization', 'organization')
      .select([
        'user.id',
        'user.fullName',
        'user.email',
        'user.role',
        'user.organizationId',
        'user.createdAt',
        'user.updatedAt',
        'organization.id',
        'organization.name',
      ]);
    //search by user name and email
    if (params.search && params.search.trim() !== '') {
      const keyword = `%${params.search.trim().toLowerCase()}%`;
      queryBuilder.andWhere(
        '(LOWER(user.fullName) LIKE :keyword OR LOWER(user.email) LIKE :keyword)',
        { keyword }
      );
    }

    //filter by role
    if (params.role) {
      queryBuilder.andWhere('user.role = :role', { role: params.role });
    }

    // sort and pagination
    queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getUserById(id: string) {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.organization', 'organization')
      .select([
        'user.id',
        'user.fullName',
        'user.email',
        'user.role',
        'user.organizationId',
        'user.createdAt',
        'user.updatedAt',
        'organization.id',
        'organization.name',
      ])
      .where('user.id = :id', { id })
      .getOne();

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    return user;
  }
}
