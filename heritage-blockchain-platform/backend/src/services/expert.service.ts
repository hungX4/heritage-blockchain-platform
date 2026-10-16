import { AppDataSource } from "../config/database.js";
import { ExpertSpecialization } from "../models/expert-specialization.model.js";
import { Expert } from "../models/expert.model.js";
import { Specialization } from "../models/specialization.model.js";
import { User } from "../models/user.model.js";
import { AdminAssignExpertDto } from "../types/dto/expert.dto.js";
import { UserRole } from "../types/enums/rbac.js";

export class ExpertService {

  private static expertRepo = AppDataSource.getRepository(Expert);

  //Cập nhật quyền expert
  static async assignOrUpdateExpertByAdmin(params: {
    performerRole: UserRole,
    dto: AdminAssignExpertDto
  }) {
    const { performerRole, dto } = params;
    const { targetUserId, specializationIds } = dto;

    //start transaction
    return await AppDataSource.transaction(async (transactionEntityManager) => {
      //find user
      const user = await transactionEntityManager.findOneBy(User, { id: targetUserId });
      if (!user) throw new Error('USER_NOT_FOUND');

      //update user role by admin role
      if (performerRole === UserRole.SYSTEM_ADMIN) {
        user.role = UserRole.INDEPENDENT_EXPERT;
      } else if (performerRole === UserRole.ORG_ADMIN) {
        user.role = UserRole.ORG_EXPERT;
      } else {
        throw new Error('UNAUTHORIZE_ADMIN_ROLE');
      }
      await transactionEntityManager.save(user);

      //find or create expert profile
      let expert = await transactionEntityManager.findOneBy(Expert, { userId: targetUserId });
      if (!expert) {
        expert = transactionEntityManager.create(Expert, { userId: targetUserId });
        await transactionEntityManager.save(expert);
      }

      //delete old expert specilizations
      await transactionEntityManager.delete(ExpertSpecialization, { expertId: expert.id });

      //add new expert specialization list
      const newMapping = specializationIds.map((specId) => {
        return transactionEntityManager.create(ExpertSpecialization, {
          expertId: expert.id,
          specializationId: specId
        });
      })
      await transactionEntityManager.save(newMapping);

      return transactionEntityManager.findOne(Expert, {
        where: { id: expert.id },
        relations: ['user', 'specializationMappings', 'specializationMappings.specialization']
      });
    })
  }

  //delete
  static async revokeExpertStatus(targetUserId: string) {
    // 🟢 Bọc toàn bộ công việc vào 1 Transaction
    return await AppDataSource.transaction(async (transactionalEntityManager) => {
      const user = await transactionalEntityManager.findOneBy(User, { id: targetUserId });
      if (!user) throw new Error('USER_NOT_FOUND');

      const expert = await transactionalEntityManager.findOneBy(Expert, { userId: targetUserId });

      // 1. Reset Role User về mặc định
      user.role = UserRole.USER;
      await transactionalEntityManager.save(user);

      // 2. Xóa hồ sơ Expert và liên kết chuyên môn (nếu có)
      if (expert) {
        await transactionalEntityManager.delete(ExpertSpecialization, { expertId: expert.id });
        await transactionalEntityManager.remove(expert);
      }

      return {
        message: `Đã thu hồi quyền Chuyên gia của người dùng ${user.fullName}`,
        userId: user.id,
        newRole: user.role,
      };
    });
  }

  //get expert specialization list by user id
  static async getExpertByUserId(userId: string) {
    const expert = await this.expertRepo.findOne({
      where: { userId },
      relations: [
        'user',
        'specializationMappings',
        'specializationMappings.specialization',
      ],
    });

    return expert;
  }
}
