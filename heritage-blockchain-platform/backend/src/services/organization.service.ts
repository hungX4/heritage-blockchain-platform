import { AppDataSource } from '../config/database.js';
import { OrganizationJoinRequest } from '../models/organization-join-request.model.js';
import { Organization } from '../models/organization.model.js';
import { User } from '../models/user.model.js';
import { CreateOrganizationDto, UpdateOrgStatusDto } from '../types/dto/organization.dto.js';
import { RequestStatus } from '../types/enums/organization.enum.js';
import { UserRole } from '../types/enums/rbac.js';

export class OrganizationService {
  private static get orgRepository() {
    return AppDataSource.getRepository(Organization);
  }

  private static get UserReposistory() {
    return AppDataSource.getRepository(User);
  }

  private static get joinRequestReposistory() {
    return AppDataSource.getRepository(OrganizationJoinRequest);
  }

  static async createOrganizationRequest(userId: string, dto: CreateOrganizationDto) {
    const existingOrg = await this.orgRepository.findOne({
      where: [
        { name: dto.name.trim() },
        { contactEmail: dto.contactEmail.trim() }
      ]
    });

    if (existingOrg) {
      throw new Error('ORGANIZATION_OR_EMAIL_ALREADY_EXISTS');
    }
    console.log(userId)
    const newOrg = this.orgRepository.create({
      name: dto.name.trim(),
      description: dto.description.trim(),
      contactEmail: dto.contactEmail.trim(),
      legalDocumentUrls: dto.legalDocumentUrls,
      status: RequestStatus.PENDING,
      requesterId: userId
    });

    return this.orgRepository.save(newOrg);
  }

  //lay danh sach cho duyet
  static async getPendingOrganizations() {
    return this.orgRepository.find({
      where: { status: RequestStatus.PENDING },
      order: { createdAt: 'DESC' }
    });
  }

  static async updateOrganizationStatus(orgId: string, dto: UpdateOrgStatusDto) {
    const org = await this.orgRepository.findOne({ where: { id: orgId } });
    if (!org) throw new Error('ORGANIZATION_NOT_FOUND');

    if (org.status !== RequestStatus.PENDING) {
      throw new Error('ORGANIZATION_ALREADY_PROCESSED');
    }

    // Sử dụng Transaction để đảm bảo tính toàn vẹn dữ liệu
    return await AppDataSource.transaction(async (transactionalEntityManager) => {
      org.status = dto.status;

      if (dto.status === RequestStatus.APPROVED) {
        // Nâng quyền người nộp hồ sơ thành ORG_ADMIN của tổ chức này
        await transactionalEntityManager.update(User, org.requesterId, {
          role: UserRole.ORG_ADMIN,
          organizationId: org.id
        });
      }

      return await transactionalEntityManager.save(Organization, org);
    });
  }

  static async getApprovedOrganizations() {
    return this.orgRepository.find({
      where: { status: RequestStatus.APPROVED },
      select: ['id', 'name', 'description', 'contactEmail', 'createdAt'],
      order: { createdAt: 'DESC' }
    });
  }

  // 2. Lấy chi tiết 1 tổ chức theo ID
  static async getOrganizationById(id: string) {
    const org = await this.orgRepository.findOne({ where: { id } });
    if (!org) throw new Error('ORGANIZATION_NOT_FOUND');
    return org;
  }

  static async createJoinRequest(userId: string, organizationId: string) {
    // 1. Kiểm tra User có tồn tại & đã thuộc tổ chức nào chưa
    const user = await this.UserReposistory.findOne({ where: { id: userId } });
    if (!user) throw new Error('Nguời dùng không tồn tại');
    if (user.organizationId) {
      throw new Error('Bạn đã thuộc một tổ chức khác, không thể gửi thêm yêu cầu');
    }

    // 2. Kiểm tra Tổ chức có tồn tại không
    const organization = await this.orgRepository.findOne({ where: { id: organizationId } });
    if (!organization) throw new Error('Tổ chức không tồn tại');

    // 3. Kiểm tra xem đã có đơn xin gia nhập đang CHỜ DUYỆT (PENDING) chưa
    const existingPendingRequest = await this.joinRequestReposistory.findOne({
      where: {
        userId,
        organizationId,
        status: RequestStatus.PENDING,
      },
    });

    if (existingPendingRequest) {
      throw new Error('Bạn đã gửi yêu cầu gia nhập tổ chức này rồi. Vui lòng chờ phê duyệt');
    }

    // 4. Tạo đơn mới
    const joinRequest = this.joinRequestReposistory.create({
      userId,
      organizationId,
      status: RequestStatus.PENDING,
    });

    return await this.joinRequestReposistory.save(joinRequest);
  }

  //Phê duyệt hoặc Từ chối yêu cầu gia nhập của thành viên
  static async processJoinRequest(
    requestId: string,
    action: 'APPROVE' | 'REJECT',
    reviewerId: string
  ) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Tìm đơn xin gia nhập
      const request = await queryRunner.manager.findOne(OrganizationJoinRequest, {
        where: { id: requestId },
        relations: ['user'],
      });

      if (!request) throw new Error('Yêu cầu gia nhập không tồn tại');
      if (request.status !== RequestStatus.PENDING) {
        throw new Error('Yêu cầu này đã được xử lý trước đó');
      }

      if (action === 'REJECT') {
        request.status = RequestStatus.REJECTED;
        await queryRunner.manager.save(request);
      } else {
        // Nếu APPROVE: Cập nhật trạng thái đơn + Gán organizationId cho User
        request.status = RequestStatus.APPROVED;
        await queryRunner.manager.save(request);

        const user = request.user;
        if (user.organizationId) {
          throw new Error('Người dùng này đã thuộc về một tổ chức khác');
        }

        user.organizationId = request.organizationId;
        // Nếu muốn tự động nâng role của user thành MEMBER hoặc giữ nguyên
        await queryRunner.manager.save(user);
      }

      await queryRunner.commitTransaction();
      return request;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // 2. Xóa/Kick User ra khỏi Tổ chức
  static async removeUserFromOrganization(targetUserId: string, orgAdminId: string) {
    const adminUser = await this.UserReposistory.findOne({ where: { id: orgAdminId } });
    const targetUser = await this.UserReposistory.findOne({ where: { id: targetUserId } });

    if (!targetUser) throw new Error('Người dùng không tồn tại');
    if (!targetUser.organizationId) throw new Error('Người dùng này hiện không thuộc tổ chức nào');

    // Kiểm tra xem Admin thực hiện thao tác có thuộc cùng tổ chức không
    if (adminUser?.role !== UserRole.SYSTEM_ADMIN && adminUser?.organizationId !== targetUser.organizationId) {
      throw new Error('Bạn không có quyền xóa thành viên của tổ chức khác');
    }

    // Xóa organizationId khỏi User (Giữ nguyên lịch sử trong bảng organization_join_requests)
    targetUser.organizationId = null;
    return await this.UserReposistory.save(targetUser);
  }

  // 3. Lấy danh sách các đơn xin gia nhập đang chờ duyệt của 1 Tổ chức
  static async getPendingJoinRequests(organizationId: string) {
    return await this.joinRequestReposistory.find({
      where: {
        organizationId,
        status: RequestStatus.PENDING,
      },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  // User tự hủy / rút lại yêu cầu gia nhập của chính mình
  static async cancelJoinRequest(userId: string, requestId: string) {
    const request = await this.joinRequestReposistory.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('Yêu cầu gia nhập không tồn tại');
    }

    // Bắt buộc phải là chính User đó rút đơn
    if (request.userId !== userId) {
      throw new Error('Bạn không có quyền hủy yêu cầu của người khác');
    }

    // Chỉ cho phép rút đơn khi còn ở trạng thái PENDING
    if (request.status !== RequestStatus.PENDING) {
      throw new Error('Không thể rút yêu cầu đã được xử lý (Phê duyệt/Từ chối)');
    }

    // Xóa hẳn (Hard Delete) khỏi DB
    return await this.joinRequestReposistory.remove(request);
  }

  // Lấy danh sách thành viên thuộc tổ chức
  static async getMembersByOrgId(organizationId: string) {
    //Kiểm tra tổ chức có tồn tại không
    const organization = await this.orgRepository.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new Error('Tổ chức không tồn tại');
    }

    // 2. Lấy danh sách User có organizationId trùng với ID tổ chức
    const members = await this.UserReposistory.find({
      where: { organizationId },
      select: ['id', 'fullName', 'email', 'role', 'createdAt'], // ⚠️ Không lấy password/hash
      order: {
        role: 'ASC', // Hiện ORG_ADMIN lên trước
        createdAt: 'DESC',
      },
    });

    return members;
  }
}

