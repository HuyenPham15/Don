import { INITIAL_WORK_ITEMS } from '../../../src/constants/workItems';
import { INITIAL_SIGNING_DOCUMENTS } from '../../../src/constants/signingData';
import { DEPARTMENTS } from '../../../src/constants/departments';
import { INITIAL_PROCESS_WORKFLOWS } from '../../../src/constants/processWorkflows';
import type { WorkItem } from '../../../src/types/work';
import type { LuotNhan, DonDetail } from '../../../src/types/index';
import type { SigningDocument } from '../../../src/types/signing';

export interface UserSession {
  id: string;
  username: string;
  fullName: string;
  role: string;
  department: string;
  avatar?: string;
}

// Dữ liệu lượt nhận ban đầu
const INITIAL_LUOT_NHAN: LuotNhan[] = [
  {
    id: 'LN-45/2026-GOVEX',
    ngayNhan: '16/09/2026 09:15',
    nguoiNop: 'Nguyễn Văn An',
    hinhThuc: 'Trực tiếp',
    noiDung: 'Khiếu nại về bồi thường, hỗ trợ tái định cư dự án Nâng cấp Quốc lộ 1A',
    donVi: 'Bộ phận Tiếp công dân Cần Thơ',
    aiJob: 5,
    cccd: '092088001234',
    sdt: '0903 123 456',
    diaChi: 'Số 45 đường 30/4, Ninh Kiều, Cần Thơ',
    loaiDon: 'Khiếu nại',
    status: 'cho_chuyen',
    hasFile: true,
    fileCount: 3,
  },
  {
    id: 'LN-56/2026-GOVEX',
    ngayNhan: '16/09/2026 09:30',
    nguoiNop: 'Đại diện KDC số 4',
    hinhThuc: 'Trực tiếp',
    noiDung: 'Phản ánh cơ sở tái chế phế liệu Minh Phát gây ô nhiễm môi trường và tiếng ồn tại TDP 4',
    donVi: 'Bộ phận Tiếp dân & Xử lý đơn',
    aiJob: 4,
    cccd: '001075018392',
    sdt: '0912 345 678',
    diaChi: 'Tổ dân phố số 4, Cầu Giấy, Hà Nội',
    loaiDon: 'Phản ánh / Kiến nghị',
    status: 'cho_chuyen',
    hasFile: true,
    fileCount: 4,
  },
  {
    id: 'LN-2025-0819',
    ngayNhan: '15/09/2026 09:15',
    nguoiNop: 'Trần Thị Mai',
    hinhThuc: 'Bưu chính',
    noiDung: 'Tố cáo hành vi chiếm đoạt tiền góp vốn đầu tư của Công ty X',
    donVi: 'Bộ phận Một cửa của Sở',
    aiJob: 5,
    cccd: '001188002931',
    sdt: '0988 777 666',
    diaChi: 'Phường Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
    loaiDon: 'Tố cáo',
    status: 'da_thu_ly',
    hasFile: true,
    fileCount: 2,
  },
];

// Danh sách đơn trùng / tương đồng phục vụ ghép đơn
export const DON_TRUNG_DATABASE = [
  {
    id: 'dt-1',
    code: 'DS-29/2026-GOVEX',
    status: 'Đang xử lý',
    title: 'Phản ánh cơ sở tái chế phế liệu Minh Phát gây ô nhiễm môi trường và tiếng ồn tại TDP 4',
    matchPercent: 96,
    tags: ['Người đứng đơn', 'Nội dung tương tự'],
    ngayNhan: '10/09/2026',
    nguoiNop: 'Đại diện KDC số 4',
    canBoThuLy: 'Nguyễn Minh Anh',
    donVi: 'Phòng QLĐT',
  },
  {
    id: 'dt-2',
    code: 'DS-4/2026-CATPHN',
    status: 'Đang xử lý',
    title: 'Tố giác cơ sở kinh doanh phế liệu Minh Phát lấn chiếm lối đi chung và xả khói bụi',
    matchPercent: 89,
    tags: ['Người đứng đơn', 'Nội dung tương tự'],
    ngayNhan: '05/09/2026',
    nguoiNop: 'Nguyễn Văn A',
    canBoThuLy: 'Trần Hoàng Long',
    donVi: 'Công an TP. Hà Nội',
  },
  {
    id: 'dt-3',
    code: 'DS-5/2026-CATPHN',
    status: 'Đang xử lý',
    title: 'Kiến nghị kiểm tra khí thải độc hại phát tán từ điểm thu mua phế liệu Minh Phát',
    matchPercent: 84,
    tags: ['Người đứng đơn', 'Nội dung tương tự'],
    ngayNhan: '01/09/2026',
    nguoiNop: 'Trần Thị C (Đồng đứng đơn)',
    canBoThuLy: 'Lê Thanh Tùng',
    donVi: 'Công an TP. Hà Nội',
  },
  {
    id: 'dt-4',
    code: 'Đ-2025-00341',
    status: 'Đang thụ lý',
    title: 'Khiếu nại về bồi thường hỗ trợ tái định cư dự án Khu đô thị Y',
    matchPercent: 78,
    tags: ['Cùng đối tượng', 'Nội dung tương tự'],
    ngayNhan: '15/12/2025',
    nguoiNop: 'Đại diện KDC số 4',
    canBoThuLy: 'Phạm Thu Hằng',
    donVi: 'Thanh tra Sở Xây dựng',
  },
];

class MockDatabase {
  private workItems: WorkItem[] = [...INITIAL_WORK_ITEMS];
  private luotNhanList: LuotNhan[] = [...INITIAL_LUOT_NHAN];
  private signingDocs: SigningDocument[] = [...INITIAL_SIGNING_DOCUMENTS];
  private departments = [...DEPARTMENTS];
  private workflows = [...INITIAL_PROCESS_WORKFLOWS];
  private donTrungList = [...DON_TRUNG_DATABASE];
  private currentUser: UserSession = {
    id: 'usr-01',
    username: 'cb_minhanh',
    fullName: 'Nguyễn Minh Anh',
    role: 'Cán bộ thụ lý & Tiếp công dân',
    department: 'Phòng Tiếp công dân & Xử lý đơn',
  };

  // --- Auth & User ---
  getCurrentUser() {
    return this.currentUser;
  }

  updateCurrentUser(user: Partial<UserSession>) {
    this.currentUser = { ...this.currentUser, ...user };
    return this.currentUser;
  }

  // --- Work Items ---
  getWorkItems(filter?: { column?: string; departmentId?: string; search?: string }) {
    let result = [...this.workItems];
    if (filter?.column && filter.column !== 'all') {
      result = result.filter((item) => item.column === filter.column);
    }
    if (filter?.departmentId && filter.departmentId !== 'all') {
      result = result.filter((item) => item.departmentId === filter.departmentId);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (item) =>
          item.code.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.sender.toLowerCase().includes(q)
      );
    }
    return result;
  }

  getWorkItemById(id: string) {
    return this.workItems.find((item) => item.id === id || item.code === id) || null;
  }

  updateWorkItem(id: string, updates: Partial<WorkItem>) {
    const index = this.workItems.findIndex((item) => item.id === id || item.code === id);
    if (index === -1) return null;
    this.workItems[index] = { ...this.workItems[index], ...updates };
    return this.workItems[index];
  }

  createWorkItem(item: WorkItem) {
    this.workItems.unshift(item);
    return item;
  }

  // --- Lượt nhận / Đơn ---
  getLuotNhanList(filter?: { status?: string; search?: string }) {
    let result = [...this.luotNhanList];
    if (filter?.status && filter.status !== 'all') {
      result = result.filter((ln) => ln.status === filter.status);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (ln) =>
          ln.id.toLowerCase().includes(q) ||
          ln.nguoiNop.toLowerCase().includes(q) ||
          ln.noiDung.toLowerCase().includes(q)
      );
    }
    return result;
  }

  getLuotNhanById(id: string) {
    return this.luotNhanList.find((ln) => ln.id === id) || null;
  }

  createLuotNhan(data: Omit<LuotNhan, 'id'> & { id?: string }) {
    const newId = data.id || `LN-${Date.now().toString().slice(-4)}/2026-GOVEX`;
    const newLuotNhan: LuotNhan = {
      ...data,
      id: newId,
      ngayNhan: data.ngayNhan || new Date().toLocaleString('vi-VN'),
      aiJob: data.aiJob ?? 5,
    };
    this.luotNhanList.unshift(newLuotNhan);
    return newLuotNhan;
  }

  updateLuotNhan(id: string, updates: Partial<LuotNhan>) {
    const idx = this.luotNhanList.findIndex((ln) => ln.id === id);
    if (idx === -1) return null;
    this.luotNhanList[idx] = { ...this.luotNhanList[idx], ...updates };
    return this.luotNhanList[idx];
  }

  ghepLuotNhanVaoDon(luotNhanId: string, targetDonCode: string, lyDo?: string, ghiChu?: string) {
    const luotNhan = this.updateLuotNhan(luotNhanId, {
      status: 'da_ghep',
      ghiChu: ghiChu || `Ghép vào hồ sơ ${targetDonCode}`,
    });
    return {
      success: !!luotNhan,
      luotNhanId,
      targetDonCode,
      lyDo,
      ghiChu,
    };
  }

  getDonTrungList() {
    return this.donTrungList;
  }

  // --- Signing Documents ---
  getSigningDocuments(status?: string) {
    let docs = [...this.signingDocs];
    if (status && status !== 'all') {
      docs = docs.filter((d) => d.status === status);
    }
    return docs;
  }

  getSigningDocumentById(id: string) {
    return this.signingDocs.find((d) => d.id === id || d.soKyHieu === id) || null;
  }

  signDocument(id: string, signerName: string, note?: string) {
    const doc = this.getSigningDocumentById(id);
    if (!doc) return null;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    doc.signers = doc.signers.map((s: any) => {
      if (s.name.includes(signerName) || s.status === 'cho_ky') {
        return {
          ...s,
          status: 'da_ky',
          thoiGianKy: timeStr,
          yKien: note || s.yKien || 'Đồng ý trình ký văn bản.',
          signatureCert: 'VGCA - Ban Cơ yếu Chính phủ',
        };
      }
      return s;
    });

    const allSigned = doc.signers.every((s: any) => s.status === 'da_ky');
    if (allSigned) {
      doc.status = 'da_ky';
    }

    doc.auditLogs = [
      ...(doc.auditLogs || []),
      {
        id: `log-${Date.now()}`,
        time: timeStr,
        actor: signerName,
        actorRole: 'Cán bộ thụ lý',
        action: 'Ký số văn bản thành công qua thiết bị chứng thư số VGCA',
        version: 'V1',
        signatureCert: 'VGCA - Ban Cơ yếu Chính phủ',
      },
    ];

    return doc;
  }

  // --- Departments & Workflows ---
  getDepartments() {
    return this.departments;
  }

  getWorkflows() {
    return this.workflows;
  }
}

export const db = new MockDatabase();
