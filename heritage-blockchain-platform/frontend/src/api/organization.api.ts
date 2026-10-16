// src/api/organization.api.ts
import axiosClient from './axiosClient'; // Thay bằng instance axios của dự án bạn (ví dụ: http, api, client...)

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface CreateOrganizationPayload {
  name: string;
  email: string;
  code?: string;
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
  [key: string]: any;
}

export interface UpdateOrgStatusPayload {
  status: 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'INACTIVE';
  reason?: string;
}

export interface HandleJoinRequestPayload {
  status: 'APPROVED' | 'REJECTED';
}

export interface OrganizationQueryParams {
  search?: string;
  page?: number;
  limit?: number;
  status?: string;
}

// ==========================================
// ORGANIZATION API SERVICE
// ==========================================

export const organizationApi = {
  /**
   * 1. GET /organizations
   * Lấy danh sách các tổ chức đã được phê duyệt / đang hoạt động
   */
  getApprovedList: (params?: OrganizationQueryParams) => {
    return axiosClient.get('/organization', { params });
  },

  /**
   * 2. POST /organizations/request
   * User gửi yêu cầu tạo tổ chức mới (cần kiểm tra email .gov.vn, .edu.vn)
   */
  requestCreation: (data: CreateOrganizationPayload) => {
    return axiosClient.post('/organization/request', data);
  },

  /**
   * 3. GET /organizations/pending
   * Administrator lấy danh sách các đơn đăng ký tạo tổ chức đang chờ duyệt
   */
  getPendingRequests: (params?: { page?: number; limit?: number }) => {
    return axiosClient.get('/organization/pending', { params });
  },

  /**
   * 4. PATCH /organizations/:id/status
   * System Admin phê duyệt hoặc từ chối tạo tổ chức theo ID
   */
  updateStatus: (id: string, data: UpdateOrgStatusPayload) => {
    return axiosClient.patch(`/organization/${id}/status`, data);
  },

  /**
   * 5. GET /organizations/:orgId/join-requests
   * Quản trị viên tổ chức lấy danh sách các đơn xin gia nhập
   */
  getPendingJoinRequests: (orgId: string) => {
    return axiosClient.get(`/organization/${orgId}/join-requests`);
  },

  /**
   * 6. PATCH /organizations/join-requests/:requestId
   * Phê duyệt hoặc từ chối đơn gia nhập tổ chức
   */
  handleJoinRequest: (requestId: string, data: HandleJoinRequestPayload) => {
    return axiosClient.patch(`/organization/join-requests/${requestId}`, data);
  },

  /**
   * 7. DELETE /organizations/members/:userId
   * Xóa / Kick thành viên ra khỏi tổ chức
   */
  kickMember: (userId: string) => {
    return axiosClient.delete(`/organization/members/${userId}`);
  },

  /**
   * 8. GET /organizations/:id/members
   * Lấy danh sách thành viên của một tổ chức
   */
  getMembers: (id: string) => {
    return axiosClient.get(`/organization/${id}/members`);
  },

  /**
   * 9. DELETE /organizations/join-requests/:requestId
   * User tự hủy / rút lại đơn xin gia nhập đã gửi
   */
  cancelJoinRequest: (requestId: string) => {
    return axiosClient.delete(`/organization/join-requests/${requestId}`);
  },

  /**
   * 10. POST /organizations/:id/join
   * User gửi yêu cầu xin gia nhập vào tổ chức theo ID
   */
  requestJoin: (id: string, data?: { reason?: string }) => {
    return axiosClient.post(`/organization/${id}/join`, data);
  },

  /**
   * 11. GET /organizations/:id
   * Lấy thông tin chi tiết của một tổ chức theo ID
   */
  getDetail: (id: string) => {
    return axiosClient.get(`/organization/${id}`);
  },
};
