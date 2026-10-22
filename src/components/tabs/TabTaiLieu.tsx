import React, { useState, useEffect } from 'react';
import { DonDetail } from '../../types';
import { VanBanXacMinhItem } from '../modals/XacMinhVaDeXuatModal';
import { SigningDocument, SigningStatus, SignerItem, SignerRole } from '../../types/signing';
import TaoLuotTrinhModal, { LeaderOption, Permission } from '../modals/TaoLuotTrinhModal';

export interface TabTaiLieuProps {
  currentDon: DonDetail;
  onDocCountChange?: (count: number) => void;
  initialEditingDoc?: {
    id?: string;
    loai?: 'giay_moi' | 'bien_ban' | 'cong_van' | 'quyet_dinh' | 'thong_bao' | 'file_scan' | string;
    soHieu: string;
    tenVanBan: string;
    category?: string;
    ngayLap?: string;
    coQuanBanHanh?: string;
    nguoiNhan?: string;
    diaDiem?: string;
    thoiGianHen?: string;
    trichYeu?: string;
    noiDungChiTiet?: string;
    signer?: string;
    trangThai?: 'du_thao' | 'da_ban_hanh' | 'da_dinh_kem';
    fromXacMinh?: boolean;
  } | null;
  onClearInitialEditingDoc?: () => void;
  onReturnToXacMinh?: () => void;
  sharedVanBanList?: VanBanXacMinhItem[];
  onUpdateSharedVanBanList?: (list: VanBanXacMinhItem[] | ((prev: VanBanXacMinhItem[]) => VanBanXacMinhItem[])) => void;
  signingDocuments?: SigningDocument[];
  onUpdateSigningDocuments?: React.Dispatch<React.SetStateAction<SigningDocument[]>>;
  onOpenBaoCaoDeXuat?: (doc?: any) => void;
  onTrinhKyBaoCao?: (docId?: string, updatedDoc?: SigningDocument) => void;
}

export type VaiTroTaiLieu = 'tai_lieu_chinh' | 'tai_lieu_kem_theo' | 'tai_lieu_bo_sung';

export interface DocItem {
  id: string;
  name: string;
  category: string;
  vaiTroTaiLieu?: VaiTroTaiLieu;
  soHieu?: string;
  size: string;
  pages: number;
  uploadDate: string;
  signer: string;
  coQuanBanHanh?: string;
  stepBelongsTo?: string;
  ocrStatus: 'Hoàn tất' | 'Đang xử lý';
  previewExcerpt: string;
  isProcessDoc?: boolean;
  isEditable?: boolean;
  loaiVanBan?: 'giay_moi' | 'bien_ban' | 'cong_van' | 'quyet_dinh' | 'thong_bao' | 'khac' | 'bao_cao_de_xuat' | 'bao_cao_xac_minh' | 'quyet_dinh_thu_ly';
  tenVanBan?: string;
  nguoiNhan?: string;
  diaDiem?: string;
  thoiGianHen?: string;
  trichYeu?: string;
  noiDungChiTiet?: string;
  trangThai?: 'du_thao' | 'da_ban_hanh' | 'da_dinh_kem';
  fromXacMinh?: boolean;
  signingStatus?: SigningStatus;
  formData?: any;
  canCuPhapLy?: string;
  lyDoChinh?: string;
  lyDoChiTiet?: string;
  fileUrl?: string;
  folder?: string;
  yeuCau?: 'Ký' | 'Duyệt' | 'Xem';
  trangThaiTrinhKy?: 'chua_trinh' | 'dang_trinh' | 'da_trinh' | 'da_co_hieu_luc';
}

export const getVaiTroInfo = (doc: DocItem): { role: VaiTroTaiLieu; label: string; badgeClass: string; icon: string } => {
  if (
    doc.vaiTroTaiLieu === 'tai_lieu_chinh' ||
    doc.category === 'Tài liệu chính' ||
    doc.category === 'Báo cáo đề xuất' ||
    doc.loaiVanBan === 'bao_cao_de_xuat'
  ) {
    return {
      role: 'tai_lieu_chinh',
      label: 'Tài liệu chính',
      badgeClass: 'bg-blue-50 text-[#004ac6] border border-blue-200',
      icon: 'description',
    };
  }
  if (
    doc.vaiTroTaiLieu === 'tai_lieu_bo_sung' ||
    doc.category === 'Tài liệu bổ sung' ||
    doc.category === 'extra'
  ) {
    return {
      role: 'tai_lieu_bo_sung',
      label: 'Tài liệu bổ sung',
      badgeClass: 'bg-purple-50 text-purple-700 border border-purple-200',
      icon: 'post_add',
    };
  }
  return {
    role: 'tai_lieu_kem_theo',
    label: 'Tài liệu kèm theo',
    badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
    icon: 'attach_file',
  };
};

export default function TabTaiLieu({
  currentDon,
  onDocCountChange,
  initialEditingDoc,
  onClearInitialEditingDoc,
  sharedVanBanList,
  signingDocuments,
  onUpdateSigningDocuments,
  onTrinhKyBaoCao,
}: TabTaiLieuProps) {
  // Dữ liệu mẫu chuẩn hóa: Phân loại theo 3 vai trò: Tài liệu chính | Tài liệu kèm theo | Tài liệu bổ sung
  const defaultDocs: DocItem[] = [
    {
      id: 'DOC-2026-001',
      name: 'Hợp đồng cung cấp dịch vụ xác minh hồ sơ',
      category: 'Tài liệu kèm theo',
      vaiTroTaiLieu: 'tai_lieu_kem_theo',
      folder: 'tai_lieu_kem_theo',
      soHieu: 'VB-2026-001',
      size: '520 KB',
      pages: 2,
      uploadDate: '05/10/2026',
      signer: currentDon.nguoiNop || 'Nguyễn Thị Minh Phương',
      coQuanBanHanh: 'Văn phòng Tiếp nhận & Xử lý đơn',
      ocrStatus: 'Hoàn tất',
      yeuCau: 'Ký',
      trangThaiTrinhKy: 'chua_trinh',
      trichYeu: 'Hợp đồng thỏa thuận về cung cấp dịch vụ xác minh thông tin hồ sơ theo yêu cầu',
      previewExcerpt: 'HỢP ĐỒNG CUNG CẤP DỊCH VỤ XÁC MINH HỒ SƠ\nSố: VB-2026-001/HĐ-XM\nCăn cứ nhu cầu xác minh nguồn gốc và diễn biến vụ việc...',
      noiDungChiTiet: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n------------------------\n\nHỢP ĐỒNG CUNG CẤP DỊCH VỤ XÁC MINH HỒ SƠ\nSố: VB-2026-001\n\nHôm nay, ngày 05 tháng 10 năm 2026, tại Trụ sở tiếp nhận:\nBÊN A: ${currentDon.nguoiNop || 'Nguyễn Thị Minh Phương'}\nCCCD: ${currentDon.cccd || '001189012345'}\nĐịa chỉ: ${currentDon.diaChi || 'Số 45, Đường Xuân Thủy, Phường Dịch Vọng Hậu, Cầu Giấy, Hà Nội'}\n\nBÊN B: CƠ QUAN TIẾP NHẬN & XỬ LÝ ĐƠN\n\nHai bên thống nhất nội dung phối hợp xác minh thông tin chứng cứ phục vụ giải quyết vụ việc theo đúng quy định pháp luật.`,
    },
    {
      id: 'DOC-2026-002',
      name: 'Báo cáo đề xuất hướng xử lý đơn',
      category: 'Tài liệu chính',
      vaiTroTaiLieu: 'tai_lieu_chinh',
      loaiVanBan: 'bao_cao_de_xuat',
      folder: 'tai_lieu_chinh',
      soHieu: 'VB-2026-002',
      size: '340 KB',
      pages: 2,
      uploadDate: '05/10/2026',
      signer: currentDon.canBoXuLy || 'Nguyễn Minh Anh - Cán bộ thụ lý',
      coQuanBanHanh: 'Phòng Tiếp công dân & Xử lý đơn',
      ocrStatus: 'Hoàn tất',
      yeuCau: 'Duyệt',
      trangThaiTrinhKy: 'chua_trinh',
      trichYeu: `Đề xuất phê duyệt phương án xử lý đơn đối với hồ sơ ${currentDon.code}`,
      previewExcerpt: 'BÁO CÁO ĐỀ XUẤT HƯỚNG XỬ LÝ ĐƠN\nKính gửi: Lãnh đạo đơn vị\nCán bộ báo cáo kết quả kiểm tra sơ bộ và đề xuất tiếp nhận thụ lý...',
      noiDungChiTiet: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n------------------------\n\nBÁO CÁO ĐỀ XUẤT HƯỚNG XỬ LÝ ĐƠN\nSố: VB-2026-002\n\nKính gửi: Lãnh đạo đơn vị có thẩm quyền\n\nCán bộ thụ lý báo cáo kết quả kiểm tra sơ bộ đơn của công dân ${currentDon.nguoiNop || 'Nguyễn Thị Minh Phương'}:\n1. Đơn đủ điều kiện thụ lý theo quy định.\n2. Căn cứ hồ sơ tiếp nhận, đề xuất chuyển bước xác minh và phân công cán bộ chuyên môn thụ lý giải quyết.\n\nKính trình Đồng chí xem xét, phê duyệt.`,
    },
    {
      id: 'DOC-2026-003',
      name: 'Báo cáo kết quả kiểm tra xác minh',
      category: 'Tài liệu bổ sung',
      vaiTroTaiLieu: 'tai_lieu_bo_sung',
      folder: 'tai_lieu_bo_sung',
      soHieu: 'VB-2026-003',
      size: '620 KB',
      pages: 3,
      uploadDate: '04/10/2026',
      signer: 'Đ/c Trần Văn Hùng - Phó Thủ trưởng',
      coQuanBanHanh: 'Cơ quan Cảnh sát điều tra',
      ocrStatus: 'Hoàn tất',
      yeuCau: 'Xem',
      trangThaiTrinhKy: 'da_co_hieu_luc', // Đã ký số, khóa chọn
      trichYeu: 'Báo cáo kết quả kiểm tra xác minh điều kiện, đã ký số VGCA có hiệu lực thi hành',
      previewExcerpt: 'BÁO CÁO KẾT QUẢ KIỂM TRA XÁC MINH\nVề việc kiểm tra tính pháp lý và tài liệu kèm theo đơn...',
      noiDungChiTiet: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n------------------------\n\nBÁO CÁO KẾT QUẢ KIỂM TRA XÁC MINH\nSố: VB-2026-003\n\n(VĂN BẢN ĐÃ ĐƯỢC KÝ SỐ ĐIỆN TỬ - CÓ HIỆU LỰC PHÁP LÝ)\n\nCăn cứ Điều 145, 146 Bộ luật Tố tụng hình sự năm 2015;\nKết quả xác minh tính có căn cứ của đơn tố giác cho thấy dấu hiệu tội phạm rõ ràng, đề nghị tiến hành giải quyết theo đúng trình tự tố tụng.`,
    },
  ];

  const [documents, setDocuments] = useState<DocItem[]>(defaultDocs);
  // Văn bản đang được chọn xem bên OnlyOffice (mặc định item đầu tiên)
  const [activeDocId, setActiveDocId] = useState<string>('DOC-2026-001');
  // Danh sách các văn bản được tick chọn để đi trình ký (mặc định chọn item 1 giống ảnh)
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>(['DOC-2026-001']);
  // Sắp xếp danh sách: Mặc định | Ngày tải (Mới nhất) | Ngày tải (Cũ nhất)
  const [sortMode, setSortMode] = useState<'default' | 'date_desc' | 'date_asc'>('default');
  // Bộ lọc phân loại vai trò tài liệu: 'all' | 'tai_lieu_chinh' | 'tai_lieu_kem_theo' | 'tai_lieu_bo_sung'
  const [roleFilter, setRoleFilter] = useState<'all' | VaiTroTaiLieu>('all');
  // Từ khóa tìm kiếm văn bản
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Thu phóng OnlyOffice (mặc định 70% như trong ảnh)
  const [zoomPercent, setZoomPercent] = useState<number>(70);
  // Toast thông báo
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  // Trạng thái mở modal Tạo lượt trình & Ma trận phân quyền văn bản
  const [isTrinhKyModalOpen, setIsTrinhKyModalOpen] = useState<boolean>(false);
  // Trạng thái mở modal Tải file lên & Phân loại vai trò
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  // Trạng thái mở menu đổi nhanh vai trò của một doc cụ thể
  const [openRoleMenuDocId, setOpenRoleMenuDocId] = useState<string | null>(null);

  // Sync count to parent
  useEffect(() => {
    onDocCountChange?.(documents.length);
  }, [documents.length, onDocCountChange]);

  // Đồng bộ signingDocuments nếu có
  useEffect(() => {
    if (signingDocuments && signingDocuments.length > 0) {
      setDocuments((prev) => {
        const next = [...prev];
        signingDocuments.forEach((sd) => {
          const matchIdx = next.findIndex((d) => d.id === sd.id || d.soHieu === sd.soKyHieu);
          if (matchIdx >= 0) {
            next[matchIdx] = {
              ...next[matchIdx],
              trangThaiTrinhKy: sd.status === 'da_ky' || sd.status === 'hoan_tat' ? 'da_co_hieu_luc' : 'dang_trinh',
            };
          }
        });
        return next;
      });
    }
  }, [signingDocuments]);

  // Nhận doc từ initialEditingDoc nếu có
  useEffect(() => {
    if (initialEditingDoc) {
      const existsIdx = documents.findIndex((d) => d.id === initialEditingDoc.id || (initialEditingDoc.soHieu && d.soHieu === initialEditingDoc.soHieu));
      if (existsIdx >= 0) {
        const updated = {
          ...documents[existsIdx],
          noiDungChiTiet: initialEditingDoc.noiDungChiTiet || documents[existsIdx].noiDungChiTiet,
          previewExcerpt: (initialEditingDoc as any).previewExcerpt || initialEditingDoc.noiDungChiTiet || documents[existsIdx].previewExcerpt,
          category: initialEditingDoc.category || documents[existsIdx].category,
          folder: (initialEditingDoc as any).folder || documents[existsIdx].folder,
          name: (initialEditingDoc as any).name || documents[existsIdx].name,
          soHieu: initialEditingDoc.soHieu || documents[existsIdx].soHieu,
          trangThaiTrinhKy: (initialEditingDoc as any).signingStatus === 'da_trinh' ? 'dang_trinh' : documents[existsIdx].trangThaiTrinhKy,
        };
        setDocuments((prev) => {
          const next = [...prev];
          next[existsIdx] = updated;
          return next;
        });
        setActiveDocId(updated.id);
        setSelectedDocIds([updated.id]);
      } else {
        const isQd = Boolean(
          initialEditingDoc.category?.toLowerCase().includes('quyết định') ||
          (initialEditingDoc as any).tenVanBan?.toLowerCase().includes('quyết định') ||
          (initialEditingDoc as any).loaiVanBan === 'quyet_dinh' ||
          (initialEditingDoc as any).loaiVanBan === 'quyet_dinh_thu_ly' ||
          (initialEditingDoc as any).loaiVanBan === 'van_ban_tra_lai' ||
          (initialEditingDoc as any).loaiVanBan === 'thong_bao_khong_thu_ly' ||
          (initialEditingDoc as any).loaiVanBan === 'chuyen_don' ||
          (initialEditingDoc as any).loaiVanBan === 'tra_loi_don' ||
          (initialEditingDoc as any).loaiVanBan === 'thong_bao_bo_sung' ||
          initialEditingDoc.category?.toLowerCase().includes('thụ lý') ||
          initialEditingDoc.category?.toLowerCase().includes('trả lại') ||
          initialEditingDoc.category?.toLowerCase().includes('không thụ lý') ||
          initialEditingDoc.category?.toLowerCase().includes('chuyển') ||
          initialEditingDoc.category?.toLowerCase().includes('trả lời')
        );
        const docToAdd: DocItem = {
          id: initialEditingDoc.id || `DOC-INIT-${Date.now()}`,
          name: (initialEditingDoc as any).name || initialEditingDoc.tenVanBan || 'Văn bản',
          category: initialEditingDoc.category || (isQd ? 'Tài liệu chính' : 'Tài liệu chính'),
          vaiTroTaiLieu: 'tai_lieu_chinh',
          folder: 'tai_lieu_chinh',
          soHieu: initialEditingDoc.soHieu,
          size: (initialEditingDoc as any).size || '380 KB',
          pages: (initialEditingDoc as any).pages || 2,
          uploadDate: (initialEditingDoc as any).uploadDate || initialEditingDoc.ngayLap || '16/09/2026',
          signer: initialEditingDoc.signer || currentDon.canBoXuLy || 'Nguyễn Minh Anh',
          coQuanBanHanh: initialEditingDoc.coQuanBanHanh || 'Phòng Tiếp công dân & Xử lý đơn',
          ocrStatus: 'Hoàn tất',
          previewExcerpt: (initialEditingDoc as any).previewExcerpt || initialEditingDoc.noiDungChiTiet || '',
          noiDungChiTiet: initialEditingDoc.noiDungChiTiet || '',
          loaiVanBan: (initialEditingDoc as any).loaiVanBan || (initialEditingDoc.loai as any) || (isQd ? 'quyet_dinh' : 'bao_cao_de_xuat'),
          tenVanBan: initialEditingDoc.tenVanBan,
          trichYeu: initialEditingDoc.trichYeu,
          trangThaiTrinhKy: (initialEditingDoc as any).signingStatus === 'da_trinh' ? 'dang_trinh' : 'chua_trinh',
          yeuCau: 'Ký',
        };
        setDocuments((prev) => [docToAdd, ...prev]);
        setActiveDocId(docToAdd.id);
        setSelectedDocIds([docToAdd.id]);
      }
      onClearInitialEditingDoc?.();
    }
  }, [initialEditingDoc, documents, onClearInitialEditingDoc, currentDon.canBoXuLy]);

  // Đồng bộ danh sách tệp đính kèm từ currentDon nếu có (Phân loại chính / kèm theo / bổ sung)
  useEffect(() => {
    const rawFiles: any[] = (currentDon as any).files || [];
    if (rawFiles.length > 0) {
      setDocuments((prev) => {
        const existingNames = new Set(prev.map((d) => d.name));
        const newItems: DocItem[] = [];
        rawFiles.forEach((f: any, idx: number) => {
          if (!existingNames.has(f.name)) {
            const vaiTro: VaiTroTaiLieu =
              f.category === 'main' ? 'tai_lieu_chinh' : f.category === 'extra' ? 'tai_lieu_bo_sung' : 'tai_lieu_kem_theo';
            const roleLabel =
              vaiTro === 'tai_lieu_chinh' ? 'Tài liệu chính' : vaiTro === 'tai_lieu_bo_sung' ? 'Tài liệu bổ sung' : 'Tài liệu kèm theo';
            const fileUploadDate = currentDon.ngayNhan || (currentDon as any).ngayChuyenXuLy || '05/10/2026';
            newItems.push({
              id: `DOC-FILE-${Date.now()}-${idx}`,
              name: f.name,
              category: roleLabel,
              vaiTroTaiLieu: vaiTro,
              folder: vaiTro,
              soHieu: `TL-${String(idx + 1).padStart(3, '0')}`,
              size: f.size || '350 KB',
              pages: 1,
              uploadDate: fileUploadDate,
              signer: currentDon.nguoiNop || 'Người nộp hồ sơ',
              coQuanBanHanh: 'Hồ sơ người nộp cung cấp',
              ocrStatus: 'Hoàn tất',
              yeuCau: 'Xem',
              trangThaiTrinhKy: 'chua_trinh',
              trichYeu: `Tài liệu nộp theo hồ sơ: ${f.name}`,
              previewExcerpt: `TÀI LIỆU HỒ SƠ\nTên tài liệu: ${f.name}\nPhân loại: ${roleLabel}...`,
              noiDungChiTiet: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n------------------------\n\n${f.name.toUpperCase()}\n\nPhân loại vai trò: ${roleLabel}\nTệp đính kèm theo hồ sơ tiếp nhận: ${currentDon.code}\nNgười nộp: ${currentDon.nguoiNop || 'Công dân'}\nNgày nộp: ${fileUploadDate}\n\nNội dung văn bản được lưu trữ nguyên bản trên hệ thống.`,
            });
          }
        });
        return newItems.length > 0 ? [...newItems, ...prev] : prev;
      });
    }
  }, [currentDon]);

  // Đổi nhanh phân loại vai trò của tài liệu
  const handleChangeDocRole = (docId: string, newRole: VaiTroTaiLieu) => {
    const roleLabels: Record<VaiTroTaiLieu, string> = {
      tai_lieu_chinh: 'Tài liệu chính',
      tai_lieu_kem_theo: 'Tài liệu kèm theo',
      tai_lieu_bo_sung: 'Tài liệu bổ sung',
    };
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              vaiTroTaiLieu: newRole,
              category: roleLabels[newRole],
              folder: newRole,
            }
          : d
      )
    );
    setOpenRoleMenuDocId(null);
    showToast(`✓ Đã đổi phân loại sang "${roleLabels[newRole]}"!`);
  };

  // Xử lý thêm tài liệu mới tải lên
  const handleUploadNewDoc = (fileData: {
    name: string;
    soHieu: string;
    vaiTro: VaiTroTaiLieu;
    yeuCau: 'Ký' | 'Duyệt' | 'Xem';
    size: string;
    trichYeu: string;
  }) => {
    const roleLabels: Record<VaiTroTaiLieu, string> = {
      tai_lieu_chinh: 'Tài liệu chính',
      tai_lieu_kem_theo: 'Tài liệu kèm theo',
      tai_lieu_bo_sung: 'Tài liệu bổ sung',
    };
    const now = new Date();
    const todayStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    const newDocItem: DocItem = {
      id: `DOC-UP-${Date.now()}`,
      name: fileData.name,
      category: roleLabels[fileData.vaiTro],
      vaiTroTaiLieu: fileData.vaiTro,
      folder: fileData.vaiTro,
      soHieu: fileData.soHieu || `VB-${now.getFullYear()}-${String(documents.length + 1).padStart(3, '0')}`,
      size: fileData.size || '420 KB',
      pages: 1,
      uploadDate: todayStr,
      signer: currentDon.canBoXuLy || 'Cán bộ thụ lý',
      coQuanBanHanh: 'Phòng Tiếp công dân & Xử lý đơn',
      ocrStatus: 'Hoàn tất',
      yeuCau: fileData.yeuCau,
      trangThaiTrinhKy: 'chua_trinh',
      trichYeu: fileData.trichYeu || `Tài liệu tải lên: ${fileData.name}`,
      previewExcerpt: `${fileData.name.toUpperCase()}\nPhân loại: ${roleLabels[fileData.vaiTro]}\nTrích yếu: ${fileData.trichYeu || 'Tài liệu tiếp nhận'}\nNgày tải: ${todayStr}...`,
      noiDungChiTiet: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n------------------------\n\n${fileData.name.toUpperCase()}\nSố: ${fileData.soHieu || 'Chưa cấp số'}\n\nPhân loại vai trò: ${roleLabels[fileData.vaiTro]}\nNgày cập nhật: ${todayStr}\nHồ sơ tiếp nhận: ${currentDon.code}\n\nNội dung chi tiết:\n${fileData.trichYeu || 'Tài liệu đã được tải lên thành công và tích hợp vào hệ thống quản lý văn bản hồ sơ.'}`,
    };

    setDocuments((prev) => [newDocItem, ...prev]);
    setActiveDocId(newDocItem.id);
    setSelectedDocIds([newDocItem.id]);
    setIsUploadModalOpen(false);
    showToast(`✓ Đã tải lên "${fileData.name}" với vai trò ${roleLabels[fileData.vaiTro]}!`);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  // Lấy văn bản đang active để hiển thị OnlyOffice
  const currentActiveDoc = documents.find((d) => d.id === activeDocId) || documents[0];

  // Xử lý toggle checkbox của từng tài liệu
  const handleToggleDocSelect = (doc: DocItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (doc.trangThaiTrinhKy === 'da_co_hieu_luc') return; // Khóa chọn

    setSelectedDocIds((prev) => {
      if (prev.includes(doc.id)) {
        return prev.filter((id) => id !== doc.id);
      } else {
        return [...prev, doc.id];
      }
    });
  };

  // Bỏ chọn tất cả
  const handleClearSelection = () => {
    setSelectedDocIds([]);
  };

  // Danh sách các văn bản có thể chọn để trình ký (loại trừ các văn bản đã có hiệu lực pháp lý)
  const selectableDocs = documents.filter((d) => d.trangThaiTrinhKy !== 'da_co_hieu_luc');
  const isAllSelected = selectableDocs.length > 0 && selectableDocs.every((d) => selectedDocIds.includes(d.id));

  // Toggle chọn tất cả văn bản hợp lệ
  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(selectableDocs.map((d) => d.id));
    }
  };

  // Helper xác định icon và style nhận diện loại văn bản
  const getDocIcon = (doc: DocItem) => {
    const isQd = Boolean(
      doc.loaiVanBan === 'quyet_dinh' ||
      (doc.loaiVanBan as string) === 'quyet_dinh_thu_ly' ||
      doc.category?.toLowerCase().includes('quyết định') ||
      doc.name.toLowerCase().includes('quyết định') ||
      doc.name.toLowerCase().includes('thụ lý')
    );
    const isBc = Boolean(
      doc.loaiVanBan === 'bao_cao_de_xuat' ||
      doc.loaiVanBan === 'bao_cao_xac_minh' ||
      doc.name.toLowerCase().includes('báo cáo') ||
      doc.name.toLowerCase().includes('đề xuất') ||
      doc.name.toLowerCase().includes('tờ trình')
    );
    const isHd = Boolean(
      doc.name.toLowerCase().includes('hợp đồng') ||
      doc.name.toLowerCase().includes('thỏa thuận')
    );

    if (isQd) {
      return { icon: 'gavel', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200/80' };
    }
    if (isBc) {
      return { icon: 'assignment', color: 'text-[#004ac6]', bg: 'bg-blue-50 border-blue-200/80' };
    }
    if (isHd) {
      return { icon: 'handshake', color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200/80' };
    }
    return { icon: 'picture_as_pdf', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200/80' };
  };

  // Thống kê số lượng theo vai trò
  const countChinh = documents.filter((d) => getVaiTroInfo(d).role === 'tai_lieu_chinh').length;
  const countKemTheo = documents.filter((d) => getVaiTroInfo(d).role === 'tai_lieu_kem_theo').length;
  const countBoSung = documents.filter((d) => getVaiTroInfo(d).role === 'tai_lieu_bo_sung').length;

  // Danh sách văn bản sau khi lọc theo vai trò, từ khóa & sắp xếp theo yêu cầu
  const filteredAndSortedDocs = documents
    .filter((doc) => {
      const vaiTro = getVaiTroInfo(doc).role;
      if (roleFilter !== 'all' && vaiTro !== roleFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        doc.name.toLowerCase().includes(q) ||
        (doc.soHieu && doc.soHieu.toLowerCase().includes(q)) ||
        (doc.signer && doc.signer.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      const parseDate = (dStr: string) => {
        if (!dStr) return 0;
        const parts = dStr.split(/[\/\-]/);
        if (parts.length === 3) return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
        return 0;
      };

      if (sortMode === 'date_desc') {
        return parseDate(b.uploadDate) - parseDate(a.uploadDate);
      }
      if (sortMode === 'date_asc') {
        return parseDate(a.uploadDate) - parseDate(b.uploadDate);
      }
      return 0;
    });

  // Mở popup Ma trận phân quyền & thêm lãnh đạo khi bấm nút "Trình ký"
  const handleOpenTrinhKyModal = () => {
    if (selectedDocIds.length === 0) {
      showToast('⚠️ Vui lòng chọn ít nhất 01 văn bản để đi trình ký!');
      return;
    }
    setIsTrinhKyModalOpen(true);
  };

  // Xác nhận trình ký từ modal Tạo lượt trình & Ma trận phân quyền
  const handleConfirmTrinhKy = (
    configuredLeaders: LeaderOption[],
    permissions: Record<string, Permission>
  ) => {
    const docsToSubmit = documents.filter((d) => selectedDocIds.includes(d.id));

    // Cập nhật trạng thái các văn bản được chọn sang 'da_trinh'
    setDocuments((prev) =>
      prev.map((d) =>
        selectedDocIds.includes(d.id)
          ? {
            ...d,
            trangThaiTrinhKy: 'da_trinh',
            signingStatus: 'da_trinh',
          }
          : d
      )
    );

    const now = new Date();
    const todayStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const timeStr = `${todayStr} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const createdSigningDocs: SigningDocument[] = docsToSubmit.map((doc) => {
      // Xây dựng danh sách signers theo ma trận phân quyền đã cấu hình
      const signers: SignerItem[] = configuredLeaders.map((ldr, idx) => {
        const perm = permissions[`${doc.id}:${ldr.id}`] || 'Xem';
        let vaiTro: SignerRole = 'cho_y_kien';
        if (perm === 'Ký số') vaiTro = 'ky';
        else if (perm === 'Duyệt') vaiTro = 'duyet';

        return {
          id: ldr.id,
          name: ldr.name,
          chucVu: ldr.title,
          coQuan: ldr.department || 'Ban Lãnh đạo',
          vaiTro,
          thuTu: idx + 1,
          status: idx === 0 ? 'cho_ky' : 'chua_den_luot',
        };
      });

      const primarySigner = signers.find((s) => s.vaiTro === 'ky') || signers[0];

      const isTraLai = Boolean(
        (doc.loaiVanBan as string) === 'van_ban_tra_lai' ||
        doc.category?.toLowerCase().includes('trả lại') ||
        doc.name.toLowerCase().includes('trả lại') ||
        doc.name.toLowerCase().includes('tra_lai')
      );
      const isKhongThuLy = Boolean(
        (doc.loaiVanBan as string) === 'thong_bao_khong_thu_ly' ||
        doc.category?.toLowerCase().includes('không thụ lý') ||
        doc.name.toLowerCase().includes('không thụ lý') ||
        doc.name.toLowerCase().includes('khong_thu_ly')
      );
      const isChuyenDon = Boolean(
        (doc.loaiVanBan as string) === 'bien_ban_ban_giao' ||
        (doc.loaiVanBan as string) === 'phieu_chuyen_don' ||
        (doc.loaiVanBan as string) === 'chuyen_don' ||
        doc.category?.toLowerCase().includes('chuyển') ||
        doc.name.toLowerCase().includes('chuyen_don') ||
        doc.name.toLowerCase().includes('chuyển đơn')
      );
      const isTraLoiDon = Boolean(
        (doc.loaiVanBan as string) === 'tra_loi_don' ||
        doc.category?.toLowerCase().includes('trả lời') ||
        doc.name.toLowerCase().includes('tra_loi') ||
        doc.name.toLowerCase().includes('trả lời')
      );
      const isQuyetDinhThuLy = Boolean(
        !isTraLai && !isKhongThuLy && !isChuyenDon && !isTraLoiDon &&
        (doc.loaiVanBan === 'quyet_dinh' ||
          (doc.loaiVanBan as string) === 'quyet_dinh_thu_ly' ||
          doc.category?.toLowerCase().includes('quyết định') ||
          doc.category?.toLowerCase().includes('thụ lý') ||
          doc.tenVanBan?.toLowerCase().includes('quyết định') ||
          doc.tenVanBan?.toLowerCase().includes('thụ lý') ||
          doc.name.toLowerCase().includes('quyết định') ||
          doc.name.toLowerCase().includes('quyet_dinh') ||
          doc.name.toLowerCase().includes('thụ lý') ||
          doc.name.toLowerCase().includes('thu_ly'))
      );
      const isBaoCao =
        !isQuyetDinhThuLy && !isTraLai && !isKhongThuLy && !isChuyenDon && !isTraLoiDon &&
        (doc.category === 'Báo cáo đề xuất' ||
          doc.loaiVanBan === 'bao_cao_de_xuat' ||
          doc.loaiVanBan === 'bao_cao_xac_minh' ||
          doc.name.toLowerCase().includes('báo cáo') ||
          doc.name.toLowerCase().includes('bao_cao') ||
          doc.name.toLowerCase().includes('tờ trình') ||
          doc.name.toLowerCase().includes('to_trinh') ||
          doc.name.toLowerCase().includes('đề xuất') ||
          doc.name.toLowerCase().includes('xác minh') ||
          doc.id === 'DOC-2026-001' ||
          doc.id === 'DOC-2026-002');

      const newSd: SigningDocument = {
        id: doc.id,
        soKyHieu: doc.soHieu || 'VB-2026',
        hoSoCode: currentDon.code,
        luotNhanId: currentDon.luotNhanId,
        loaiDon: currentDon.loaiDon || 'Đơn khiếu nại',
        nguoiGuiDon: currentDon.nguoiNop,
        noiDungDon: currentDon.title,
        tenVanBan: doc.name,
        loaiVanBan: isTraLai
          ? 'van_ban_tra_lai'
          : isKhongThuLy
            ? 'thong_bao_khong_thu_ly'
            : isChuyenDon
              ? 'bien_ban_ban_giao'
              : isTraLoiDon
                ? ('tra_loi_don' as any)
                : isQuyetDinhThuLy
                  ? 'quyet_dinh_thu_ly'
                  : isBaoCao
                    ? 'bao_cao_de_xuat'
                    : 'to_trinh_thu_ly',
        loaiVanBanLabel: doc.category || (
          isTraLai
            ? 'Phiếu hướng dẫn trả lại đơn'
            : isKhongThuLy
              ? 'Quyết định không thụ lý'
              : isChuyenDon
                ? 'Phiếu chuyển đơn xử lý'
                : isTraLoiDon
                  ? 'Văn bản trả lời đơn'
                  : isQuyetDinhThuLy
                    ? 'Quyết định thụ lý'
                    : isBaoCao
                      ? 'Báo cáo đề xuất'
                      : 'Tờ trình thụ lý'
        ),
        trichYeu: doc.trichYeu || doc.name,
        noiDungChiTiet: doc.noiDungChiTiet || '',
        nguoiLap: doc.signer,
        donViNguoiLap: doc.coQuanBanHanh || 'Phòng Tiếp công dân & Xử lý đơn',
        ngayTao: doc.uploadDate || `${todayStr} 09:00`,
        status: 'da_trinh',
        thoiGianTrinh: timeStr,
        nguoiTrinh: currentDon.canBoXuLy || 'Nguyễn Minh Anh',
        mucDoUuTien: 'thuong',
        hanXuLy: '24 giờ',
        signers: signers.length > 0 ? signers : [
          {
            id: 'lanh_dao_hung',
            name: 'Đ/c Trần Văn Hùng',
            chucVu: 'Phó Chánh Thanh tra thành phố',
            coQuan: 'Ban Lãnh đạo Thanh tra',
            vaiTro: 'ky',
            thuTu: 1,
            status: 'cho_ky',
          },
        ],
        currentSignerIndex: 0,
        lanhDaoId: primarySigner?.id || 'lanh_dao_hung',
        lanhDaoName: primarySigner?.name || 'Đ/c Trần Văn Hùng',
        lanhDaoChucVu: primarySigner?.chucVu || 'Phó Chánh Thanh tra thành phố',
        tepDinhKem: [
          {
            id: `att-${doc.id}`,
            tenTep: `${doc.name}.pdf`,
            dungLuong: doc.size,
            loai: 'du_thao',
          },
        ],
        phienBanHienTai: 'V1',
        versionHistory: [
          {
            version: 'V1',
            thoiGian: timeStr,
            nguoiTao: currentDon.canBoXuLy || 'Nguyễn Minh Anh',
            trangThaiLucDo: 'Đã trình ký',
            ghiChu: `Trình ký ${doc.name}`,
            noiDungSnapshot: doc.noiDungChiTiet || '',
          },
        ],
        history: [
          {
            id: `hist-${Date.now()}-${doc.id}`,
            time: timeStr,
            actor: currentDon.canBoXuLy || 'Nguyễn Minh Anh',
            action: `Trình Lãnh đạo (${primarySigner?.name || 'Lãnh đạo'}) phê duyệt văn bản ${doc.name}`,
          },
        ],
        auditLogs: [
          {
            id: `al-${Date.now()}-${doc.id}`,
            time: timeStr,
            actor: currentDon.canBoXuLy || 'Nguyễn Minh Anh',
            actorRole: 'Cán bộ thụ lý',
            action: 'Trình văn bản',
            statusBefore: 'nhap',
            statusAfter: 'da_trinh',
            version: 'V1',
            note: doc.trichYeu,
          },
        ],
      };

      return newSd;
    });

    // Đồng bộ sang signingDocuments
    if (onUpdateSigningDocuments) {
      onUpdateSigningDocuments((prevDocs) => {
        let next = [...prevDocs];
        createdSigningDocs.forEach((newSd) => {
          const existIdx = next.findIndex((item) => item.id === newSd.id);
          if (existIdx >= 0) {
            next[existIdx] = newSd;
          } else {
            next = [newSd, ...next];
          }
        });
        return next;
      });
    }

    // Gọi callback để thông báo cho DonTiepNhan cập nhật trạng thái bước quy trình
    if (onTrinhKyBaoCao) {
      createdSigningDocs.forEach((newSd) => {
        onTrinhKyBaoCao(newSd.id, newSd);
      });
    }

    setIsTrinhKyModalOpen(false);
    showToast(`✓ Đã gửi trình ký ${docsToSubmit.length} văn bản tới Lãnh đạo thành công!`);
    setSelectedDocIds([]);
  };

  // Zoom controls
  const handleZoomIn = () => setZoomPercent((z) => Math.min(z + 10, 150));
  const handleZoomOut = () => setZoomPercent((z) => Math.max(z - 10, 40));

  return (
    <div className="space-y-3 font-sans">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-slate-900/95 backdrop-blur-md text-white rounded-xl shadow-2xl text-xs font-medium border border-slate-700 animate-fade-in">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-8 flex flex-col space-y-2 h-[820px]">
          <div className="px-1 py-1 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-rose-600 text-[20px] shrink-0">
                picture_as_pdf
              </span>
              <h2 className="text-[15px] font-bold text-slate-900 truncate tracking-tight">
                {currentActiveDoc.name}
              </h2>
            </div>
            {currentActiveDoc.soHieu && (
              <span className="text-[12.5px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                {currentActiveDoc.soHieu}
              </span>
            )}
          </div>

          {/* Khung OnlyOffice Suite */}
          <div className="bg-[#2b2b2b] rounded-xl shadow-md overflow-hidden border border-slate-700 flex flex-col min-h-[750px]">
            {/* Top Toolbar OnlyOffice */}
            <div className="bg-[#2e2e2e] text-slate-200 px-3.5 py-2.5 flex items-center justify-between border-b border-[#3e3e3e] select-none text-[12.5px]">
              <div className="flex items-center gap-4">
                <span className="font-extrabold tracking-wider text-white text-[12px] flex items-center gap-1">
                  ONLYOFFICE
                </span>
                <div className="flex items-center gap-3.5 text-slate-300 font-medium text-[12.5px]">
                  <span className="hover:text-white cursor-pointer transition-colors">Tệp</span>
                  <span className="hover:text-white cursor-pointer transition-colors">Xem</span>
                  <span className="hover:text-white cursor-pointer transition-colors">Plugin</span>
                  <span className="hover:text-white cursor-pointer transition-colors">AI</span>
                </div>
              </div>

              {/* Action icons bên phải OnlyOffice */}
              <div className="flex items-center gap-2.5 text-slate-300">
                <button
                  type="button"
                  className="hover:text-white p-1 rounded hover:bg-[#3e3e3e] transition-colors cursor-pointer"
                  title="Chế độ xem"
                >
                  <span className="material-symbols-outlined text-[17px]">tab</span>
                </button>
                <button
                  type="button"
                  className="hover:text-white p-1 rounded hover:bg-[#3e3e3e] transition-colors cursor-pointer"
                  title="Tải văn bản"
                >
                  <span className="material-symbols-outlined text-[17px]">download</span>
                </button>
                <button
                  type="button"
                  className="hover:text-white p-1 rounded hover:bg-[#3e3e3e] transition-colors cursor-pointer"
                  title="In / Tìm kiếm"
                >
                  <span className="material-symbols-outlined text-[17px]">search</span>
                </button>
                <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-[11px] border border-slate-500 shadow-xs">
                  NA
                </div>
              </div>
            </div>

            {/* Thân OnlyOffice: Sidebar dọc bên trái + Canvas giấy A4 ở giữa */}
            <div className="flex-1 flex bg-[#333333] relative overflow-hidden">
              {/* Vertical Sidebar mỏng bên trái OnlyOffice */}
              <div className="w-10 bg-[#2b2b2b] border-r border-[#3e3e3e] flex flex-col items-center py-3 gap-4 text-slate-400 select-none">
                <button
                  type="button"
                  className="hover:text-white p-1.5 rounded hover:bg-[#3e3e3e] transition-colors cursor-pointer"
                  title="Tìm kiếm"
                >
                  <span className="material-symbols-outlined text-[17px]">search</span>
                </button>
                <button
                  type="button"
                  className="hover:text-white p-1.5 rounded hover:bg-[#3e3e3e] transition-colors cursor-pointer text-slate-200"
                  title="Trang thu nhỏ (Thumbnails)"
                >
                  <span className="material-symbols-outlined text-[17px]">auto_stories</span>
                </button>
                <button
                  type="button"
                  className="hover:text-white p-1.5 rounded hover:bg-[#3e3e3e] transition-colors cursor-pointer"
                  title="Bình luận"
                >
                  <span className="material-symbols-outlined text-[17px]">chat_bubble_outline</span>
                </button>
                <button
                  type="button"
                  className="hover:text-white p-1.5 rounded hover:bg-[#3e3e3e] transition-colors cursor-pointer"
                  title="Tiện ích mở rộng / Plugins"
                >
                  <span className="material-symbols-outlined text-[17px]">widgets</span>
                </button>
                <button
                  type="button"
                  className="hover:text-white p-1.5 rounded hover:bg-[#3e3e3e] transition-colors cursor-pointer mt-auto"
                  title="Thông tin văn bản"
                >
                  <span className="material-symbols-outlined text-[17px]">info</span>
                </button>
              </div>

              {/* Vùng Canvas trang giấy A4 (Cuộn được, phóng to thu nhỏ) */}
              <div className="flex-1 bg-[#404040] p-4 sm:p-6 overflow-auto flex justify-center items-start">
                <div
                  className="bg-white text-slate-900 shadow-2xl p-8 sm:p-12 font-serif relative transition-transform duration-150 origin-top select-text"
                  style={{
                    width: '680px',
                    minHeight: '960px',
                    transform: `scale(${zoomPercent / 100})`,
                    fontFamily: '"Times New Roman", Times, serif',
                  }}
                >
                  {/* Mã FORM ID & Nguồn mẫu góc trên */}
                  <div className="flex items-center justify-between text-[12px] font-mono text-slate-500 pb-3 border-b border-slate-200 mb-6">
                    <span className="border border-dashed border-slate-300 px-2 py-0.5 rounded">
                      {currentActiveDoc.soHieu || 'VB-2026/UBND'}
                    </span>
                    <span className="italic font-sans text-[12px] font-semibold text-slate-600">
                      {getVaiTroInfo(currentActiveDoc).label}
                    </span>
                  </div>

                  {currentActiveDoc.noiDungChiTiet ? (
                    <div className="space-y-4">
                      <div className="text-[14px] leading-relaxed font-serif whitespace-pre-wrap text-slate-900 selection:bg-blue-100">
                        {currentActiveDoc.noiDungChiTiet}
                      </div>

                      {/* Hiển thị con dấu / chữ ký số nếu đã có hiệu lực */}
                      {currentActiveDoc.trangThaiTrinhKy === 'da_co_hieu_luc' && (
                        <div className="mt-8 pt-4 border-t border-slate-200 flex justify-end">
                          <div className="p-3 rounded-lg border-2 border-emerald-600 bg-emerald-50 text-emerald-900 text-[12px] font-mono inline-block shadow-xs">
                            <p className="font-bold flex items-center gap-1.5 text-[12.5px] text-emerald-900">
                              <span className="material-symbols-outlined text-[16px] text-emerald-700">verified</span>
                              <span>KÝ SỐ BỞI: {currentActiveDoc.signer || 'LÃNH ĐẠO'}</span>
                            </p>
                            <p className="text-[12px] text-emerald-800 mt-1">Cơ quan: {currentActiveDoc.coQuanBanHanh || 'UBND Quận Cầu Giấy'}</p>
                            <p className="text-[12px] text-emerald-700 mt-0.5">Thời gian: {currentActiveDoc.uploadDate}</p>
                            <p className="text-[11.5px] text-emerald-600 italic mt-1">Chứng thư số Ban Cơ yếu Chính phủ VGCA cấp</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Quốc hiệu Tiêu ngữ */}
                      <div className="text-center space-y-1 mb-8">
                        <h3 className="font-bold text-[13px] uppercase tracking-wider text-slate-900">
                          CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                        </h3>
                        <p className="font-bold text-[13.5px] text-slate-900">
                          Độc lập - Tự do - Hạnh phúc
                        </p>
                        <div className="w-36 h-px bg-slate-800 mx-auto mt-1"></div>
                      </div>

                      {/* Tiêu đề văn bản */}
                      <div className="text-center mb-6">
                        <h1 className="font-bold text-[16px] uppercase text-slate-900 tracking-wide">
                          {currentActiveDoc.name.toUpperCase()}
                        </h1>
                        <p className="italic text-[13px] text-slate-700 mt-1">
                          (Về hành vi có dấu hiệu "Lừa đảo chiếm đoạt tài sản" qua mạng xã hội)
                        </p>
                      </div>

                      {/* Kính gửi */}
                      <div className="mb-6 text-[14px] leading-relaxed space-y-0.5">
                        <p>
                          <strong className="font-bold">Kính gửi:</strong> Cơ quan Cảnh sát điều tra - Công an Quận Cầu Giấy, TP. Hà Nội
                        </p>
                        <p className="pl-14">
                          Viện kiểm sát nhân dân Quận Cầu Giấy, TP. Hà Nội
                        </p>
                      </div>

                      {/* Mục I: Thông tin người tố giác */}
                      <div className="mb-6 space-y-2 text-[13.5px] leading-relaxed">
                        <h4 className="font-bold uppercase text-slate-900 border-b border-slate-200 pb-0.5 text-[14px]">
                          I. THÔNG TIN NGƯỜI TỐ GIÁC (DENOUNCER INFORMATION)
                        </h4>
                        <div className="space-y-1 pt-1">
                          <p>
                            <strong>1. Họ và tên:</strong> {currentDon.nguoiNop?.toUpperCase() || 'NGUYỄN THỊ MINH PHƯƠNG'}
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <p><strong>2. Ngày sinh:</strong> 24/11/1989</p>
                            <p><strong>3. Giới tính:</strong> Nữ</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <p><strong>4. Số CCCD/CMND:</strong> {currentDon.cccd || '001189012345'}</p>
                            <p><strong>5. Ngày cấp:</strong> 12/03/2021</p>
                          </div>
                          <p>
                            <strong>6. Thường trú:</strong> {currentDon.diaChi || 'Số 45, Đường Xuân Thủy, Phường Dịch Vọng Hậu, Quận Cầu Giấy, TP. Hà Nội'}
                          </p>
                          <p>
                            <strong>7. Số điện thoại:</strong> {(currentDon as any).phone || (currentDon as any).sdt || '0912 888 999'}
                          </p>
                        </div>
                      </div>

                      {/* Mục II: Thông tin người bị tố giác / Nội dung */}
                      <div className="mb-6 space-y-2 text-[13.5px] leading-relaxed">
                        <h4 className="font-bold uppercase text-slate-900 border-b border-slate-200 pb-0.5 text-[14px]">
                          II. THÔNG TIN NGƯỜI BỊ TỐ GIÁC (ACCUSED INFORMATION)
                        </h4>
                        <div className="space-y-1 pt-1">
                          <p>
                            <strong>1. Họ và tên đối tượng:</strong> TRẦN VĂN HÙNG (Sử dụng tài khoản "Hùng Đầu Tư")
                          </p>
                          <p>
                            <strong>2. Nội dung tóm tắt vụ việc:</strong> {currentDon.title || 'Hành vi kêu gọi góp vốn đầu tư sau đó chiếm đoạt số tiền 3.500.000.000 VNĐ thông qua giao dịch chuyển khoản ngân hàng.'}
                          </p>
                        </div>
                      </div>

                      {/* Phần chữ ký hoặc con dấu */}
                      <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-6 text-[12.5px] text-center font-sans">
                        <div className="space-y-1 text-slate-500">
                          <p className="font-bold text-slate-700 text-[13px]">NGƯỜI XÁC NHẬN</p>
                          <p className="italic text-[12px]">(Ký, ghi rõ họ tên)</p>
                          <div className="h-12"></div>
                          <p className="font-semibold text-slate-800 text-[13px]">Cán bộ thụ lý hồ sơ</p>
                        </div>

                        <div className="space-y-1">
                          <p className="font-bold text-slate-800 text-[13px]">NGƯỜI LÀM ĐƠN</p>
                          <p className="italic text-[12px] text-slate-500">(Ký, ghi rõ họ tên)</p>
                          {currentActiveDoc.trangThaiTrinhKy === 'da_co_hieu_luc' ? (
                            <div className="my-2 p-1.5 rounded border border-emerald-500 bg-emerald-50 text-emerald-800 text-[12px] font-mono inline-block">
                              <p className="font-bold">✓ ĐÃ KÝ SỐ ĐIỆN TỬ VGCA</p>
                              <p>Ký bởi: {currentActiveDoc.signer}</p>
                              <p>Thời gian: {currentActiveDoc.uploadDate}</p>
                            </div>
                          ) : (
                            <div className="h-12"></div>
                          )}
                          <p className="font-bold text-slate-900 text-[14px]">
                            {currentDon.nguoiNop || 'Nguyễn Thị Minh Phương'}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Toolbar OnlyOffice */}
            <div className="bg-[#2e2e2e] text-slate-300 px-3.5 py-2.5 flex items-center justify-between border-t border-[#3e3e3e] text-[12.5px] select-none">
              <div className="flex items-center gap-4">
                <span>Trang 1 trên {currentActiveDoc.pages || 2}</span>
                <span className="hover:text-white cursor-pointer transition-colors">Word count</span>
              </div>

              {/* Điều khiển Zoom */}
              <div className="flex items-center gap-2 font-mono text-[12.5px]">
                <span>Thu phóng {zoomPercent}%</span>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="w-5.5 h-5.5 rounded hover:bg-[#3e3e3e] hover:text-white flex items-center justify-center cursor-pointer transition-colors text-xs"
                  title="Thu nhỏ"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="w-5.5 h-5.5 rounded hover:bg-[#3e3e3e] hover:text-white flex items-center justify-center cursor-pointer transition-colors text-xs"
                  title="Phóng to"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* CỘT PHẢI (~30-35% width): DANH SÁCH VĂN BẢN                               */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col h-[820px] overflow-hidden">
          {/* 1. Header: Tiêu đề Danh sách văn bản + Tùy chọn sắp xếp + Nút Tải file */}
          <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#004ac6]">description</span>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Danh sách văn bản</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-white text-[#004ac6] border border-blue-200 shadow-2xs">
                {documents.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Nút Tải file lên */}
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 active:scale-95 text-[#004ac6] border border-blue-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                title="Tải lên tài liệu và phân loại vai trò"
              >
                <span className="material-symbols-outlined text-[16px]">upload_file</span>
                <span>Tải file</span>
              </button>

              {/* Tùy chọn sắp xếp theo ngày tải hoặc mặc định */}
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as any)}
                className="text-[12px] font-semibold bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:border-[#004ac6] cursor-pointer shadow-2xs"
                title="Sắp xếp danh sách văn bản"
              >
                <option value="default">Mặc định</option>
                <option value="date_desc">Mới nhất</option>
                <option value="date_asc">Cũ nhất</option>
              </select>
            </div>
          </div>

          {/* 2. Ô tìm kiếm văn bản nhanh */}
          <div className="px-3.5 pt-3 pb-1.5 shrink-0">
            <div className="relative">
              <span className="material-symbols-outlined text-[16px] text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên, số hiệu văn bản..."
                className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#004ac6] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Xóa tìm kiếm"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}
            </div>
          </div>

          {/* 2b. Bộ lọc phân loại vai trò tài liệu: Tất cả | Tài liệu chính | Kèm theo | Bổ sung */}
          <div className="px-3.5 pb-2 flex items-center gap-1.5 overflow-x-auto shrink-0 text-[11px] font-medium no-scrollbar">
            <button
              type="button"
              onClick={() => setRoleFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap font-bold ${
                roleFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              Tất cả ({documents.length})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('tai_lieu_chinh')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap font-bold ${
                roleFilter === 'tai_lieu_chinh'
                  ? 'bg-[#004ac6] text-white shadow-2xs'
                  : 'bg-blue-50 text-[#004ac6] border border-blue-200 hover:bg-blue-100'
              }`}
            >
              Tài liệu chính ({countChinh})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('tai_lieu_kem_theo')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap font-bold ${
                roleFilter === 'tai_lieu_kem_theo'
                  ? 'bg-slate-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200/80'
              }`}
            >
              Kèm theo ({countKemTheo})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('tai_lieu_bo_sung')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap font-bold ${
                roleFilter === 'tai_lieu_bo_sung'
                  ? 'bg-purple-700 text-white shadow-2xs'
                  : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
              }`}
            >
              Bổ sung ({countBoSung})
            </button>
          </div>

          {/* 3. Action Bar: Chọn tất cả + Đếm đã chọn + Nút Trình ký nổi bật */}
          <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between gap-2 bg-white shrink-0">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleToggleSelectAll}
                  disabled={selectableDocs.length === 0}
                  className="w-4 h-4 rounded text-[#004ac6] focus:ring-[#004ac6] border-slate-300 cursor-pointer accent-[#004ac6] disabled:opacity-40"
                />
                <span className="text-xs font-semibold text-slate-700">
                  {selectedDocIds.length > 0 ? (
                    <span>Đã chọn <strong className="text-[#004ac6] font-mono">{selectedDocIds.length}</strong>/{selectableDocs.length}</span>
                  ) : (
                    <span>Chọn tất cả ({selectableDocs.length})</span>
                  )}
                </span>
              </label>

              {selectedDocIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="text-[11.5px] text-slate-400 hover:text-rose-600 transition-colors font-medium cursor-pointer underline ml-1"
                >
                  Bỏ chọn
                </button>
              )}
            </div>

            {/* Nút TRÌNH KÝ */}
            <button
              type="button"
              onClick={handleOpenTrinhKyModal}
              disabled={selectedDocIds.length === 0}
              className="px-3.5 py-1.5 rounded-xl bg-[#004ac6] hover:bg-[#003ba0] active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
              title={selectedDocIds.length === 0 ? "Vui lòng tick chọn ít nhất 01 văn bản để trình ký" : "Trình ký các văn bản đã chọn"}
            >
              <span className="material-symbols-outlined text-[16px]">draw</span>
              <span>Trình ký</span>
              {selectedDocIds.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-[#004ac6] text-[10px] font-bold flex items-center justify-center font-mono">
                  {selectedDocIds.length}
                </span>
              )}
            </button>
          </div>

          {/* 4. Danh sách văn bản dạng thẻ/dòng - HIỂN THỊ TRỰC TIẾP (Cuộn độc lập) */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredAndSortedDocs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <span className="material-symbols-outlined text-[32px] text-slate-300 block mb-1">
                  search_off
                </span>
                Không tìm thấy văn bản nào phù hợp
              </div>
            ) : (
              filteredAndSortedDocs.map((doc) => {
                const isSelected = selectedDocIds.includes(doc.id);
                const isActiveView = activeDocId === doc.id;
                const isLocked = doc.trangThaiTrinhKy === 'da_co_hieu_luc';
                const { icon, color, bg } = getDocIcon(doc);
                const vaiTroInfo = getVaiTroInfo(doc);

                return (
                  <div
                    key={doc.id}
                    onClick={() => setActiveDocId(doc.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer relative group ${
                      isActiveView
                        ? 'border-[#004ac6] bg-blue-50/60 shadow-xs ring-1 ring-[#004ac6]/30'
                        : isSelected
                        ? 'border-blue-300 bg-blue-50/25 shadow-2xs'
                        : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/60 hover:shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Checkbox chọn */}
                      <div className="pt-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {isLocked ? (
                          <span title="Văn bản đã có hiệu lực (đã ký số), khóa chọn" className="cursor-not-allowed">
                            <input
                              type="checkbox"
                              disabled
                              checked={false}
                              className="w-4 h-4 rounded text-slate-300 border-slate-200 cursor-not-allowed opacity-40"
                            />
                          </span>
                        ) : (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            onClick={(e) => handleToggleDocSelect(doc, e)}
                            className="w-4 h-4 rounded text-[#004ac6] focus:ring-[#004ac6] border-slate-300 cursor-pointer accent-[#004ac6]"
                          />
                        )}
                      </div>

                      {/* Icon nhận diện loại văn bản */}
                      <div className={`w-8 h-8 rounded-lg ${bg} ${color} flex items-center justify-center shrink-0 mt-0.5 shadow-2xs border`}>
                        <span className="material-symbols-outlined text-[18px]">{icon}</span>
                      </div>

                      {/* Thông tin văn bản */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-1.5">
                          <h4 className={`text-[13px] font-bold leading-snug line-clamp-2 transition-colors ${
                            isActiveView ? 'text-[#004ac6]' : 'text-slate-900 group-hover:text-[#004ac6]'
                          }`}>
                            {doc.name}
                          </h4>

                          {/* Badge trạng thái */}
                          <div className="shrink-0">
                            {doc.trangThaiTrinhKy === 'da_co_hieu_luc' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/90">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Đã có hiệu lực
                              </span>
                            ) : doc.trangThaiTrinhKy === 'dang_trinh' || doc.trangThaiTrinhKy === 'da_trinh' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200/90">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                                Đang trình ký
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-slate-100 text-slate-600 border border-slate-200/80">
                                Chưa trình
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Số hiệu & Ngày văn bản & Kích thước */}
                        <div className="text-[11.5px] text-slate-500 mt-1 flex flex-wrap items-center gap-1.5 font-sans">
                          <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded text-[11px] border border-slate-200/70">
                            {doc.soHieu || 'Chưa cấp số'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-slate-500">
                            <span className="material-symbols-outlined text-[13px] text-slate-400">calendar_today</span>
                            <span>{doc.uploadDate}</span>
                          </span>
                          <span>•</span>
                          <span>{doc.size}</span>
                        </div>

                        {/* Yêu cầu xử lý (Xem, Ký hoặc Duyệt) & Phân loại vai trò tài liệu */}
                        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11.5px]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 font-medium">Yêu cầu:</span>
                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              doc.yeuCau === 'Ký' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                              doc.yeuCau === 'Duyệt' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                              'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {doc.yeuCau || 'Xem'}
                            </span>
                          </div>

                          {/* Phân loại vai trò tài liệu: Tài liệu chính | Tài liệu kèm theo | Tài liệu bổ sung */}
                          <div className="relative" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenRoleMenuDocId((curr) => (curr === doc.id ? null : doc.id));
                              }}
                              className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold shrink-0 transition-all flex items-center gap-0.5 cursor-pointer hover:shadow-2xs ${
                                vaiTroInfo.badgeClass
                              }`}
                              title="Bấm để đổi phân loại vai trò tài liệu"
                            >
                              <span>{vaiTroInfo.label}</span>
                              <span className="material-symbols-outlined text-[13px] opacity-70">expand_more</span>
                            </button>

                            {/* Dropdown nhanh đổi phân loại vai trò */}
                            {openRoleMenuDocId === doc.id && (
                              <div
                                className="absolute right-0 bottom-full mb-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-40 space-y-0.5 text-xs"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <p className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 tracking-wider">
                                  Đổi phân loại vai trò:
                                </p>
                                <button
                                  type="button"
                                  onClick={() => handleChangeDocRole(doc.id, 'tai_lieu_chinh')}
                                  className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                                    vaiTroInfo.role === 'tai_lieu_chinh'
                                      ? 'bg-blue-50 text-[#004ac6] font-bold'
                                      : 'text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  <span>Tài liệu chính</span>
                                  {vaiTroInfo.role === 'tai_lieu_chinh' && (
                                    <span className="material-symbols-outlined text-[14px] text-[#004ac6]">check</span>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleChangeDocRole(doc.id, 'tai_lieu_kem_theo')}
                                  className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                                    vaiTroInfo.role === 'tai_lieu_kem_theo'
                                      ? 'bg-slate-100 text-slate-800 font-bold'
                                      : 'text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  <span>Tài liệu kèm theo</span>
                                  {vaiTroInfo.role === 'tai_lieu_kem_theo' && (
                                    <span className="material-symbols-outlined text-[14px] text-slate-700">check</span>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleChangeDocRole(doc.id, 'tai_lieu_bo_sung')}
                                  className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                                    vaiTroInfo.role === 'tai_lieu_bo_sung'
                                      ? 'bg-purple-50 text-purple-700 font-bold'
                                      : 'text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  <span>Tài liệu bổ sung</span>
                                  {vaiTroInfo.role === 'tai_lieu_bo_sung' && (
                                    <span className="material-symbols-outlined text-[14px] text-purple-700">check</span>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 5. Dòng ghi chú chú thích ở dưới cùng */}
          <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center gap-1.5 text-[11.5px] text-slate-500 shrink-0">
            <span className="material-symbols-outlined text-[16px] text-slate-400">info</span>
            <p className="italic">
              Văn bản đã ký số (VGCA) được khóa chọn và hiển thị trạng thái Đã có hiệu lực.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Tạo lượt trình & Ma trận phân quyền văn bản */}
      <TaoLuotTrinhModal
        isOpen={isTrinhKyModalOpen}
        onClose={() => setIsTrinhKyModalOpen(false)}
        documents={documents.filter((d) => selectedDocIds.includes(d.id))}
        onSubmit={handleConfirmTrinhKy}
      />

      {/* Modal Tải lên & Phân loại vai trò tài liệu */}
      <TaiLenTaiLieuModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={handleUploadNewDoc}
      />
    </div>
  );
}

{/* Sub-component Modal Tải lên & Phân loại vai trò tài liệu */}
function TaiLenTaiLieuModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (fileData: {
    name: string;
    soHieu: string;
    vaiTro: VaiTroTaiLieu;
    yeuCau: 'Ký' | 'Duyệt' | 'Xem';
    size: string;
    trichYeu: string;
  }) => void;
}) {
  const [name, setName] = useState('');
  const [soHieu, setSoHieu] = useState('');
  const [vaiTro, setVaiTro] = useState<VaiTroTaiLieu>('tai_lieu_kem_theo');
  const [yeuCau, setYeuCau] = useState<'Ký' | 'Duyệt' | 'Xem'>('Xem');
  const [size, setSize] = useState('450 KB');
  const [trichYeu, setTrichYeu] = useState('');
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setSoHieu('');
      setVaiTro('tai_lieu_kem_theo');
      setYeuCau('Xem');
      setSize('450 KB');
      setTrichYeu('');
      setDragOver(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setName(file.name.replace(/\.[^/.]+$/, ''));
      const szKB = Math.round(file.size / 1024);
      setSize(szKB > 1024 ? `${(szKB / 1024).toFixed(1)} MB` : `${szKB} KB`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      soHieu: soHieu.trim(),
      vaiTro,
      yeuCau,
      size,
      trichYeu: trichYeu.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-[#004ac6]">upload_file</span>
            <div>
              <h3 className="text-[15px] font-bold text-slate-900">Tải lên & Phân loại tài liệu</h3>
              <p className="text-[11.5px] text-slate-500">Đánh dấu tài liệu là tài liệu chính, kèm theo hoặc bổ sung</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* File Picker Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) {
                setName(file.name.replace(/\.[^/.]+$/, ''));
                const szKB = Math.round(file.size / 1024);
                setSize(szKB > 1024 ? `${(szKB / 1024).toFixed(1)} MB` : `${szKB} KB`);
              }
            }}
            className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
              dragOver ? 'border-[#004ac6] bg-blue-50/50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100/70'
            }`}
          >
            <label className="cursor-pointer block">
              <span className="material-symbols-outlined text-[32px] text-[#004ac6] block mb-1">
                cloud_upload
              </span>
              <p className="text-xs font-semibold text-slate-700">
                Nhấp để chọn tệp hoặc kéo thả tệp vào đây
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Hỗ trợ định dạng PDF, DOCX, PNG, JPG (tối đa 25MB)
              </p>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Tên tài liệu */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên tài liệu <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Căn cước công dân của người làm đơn..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#004ac6] shadow-2xs"
            />
          </div>

          {/* Phân loại vai trò tài liệu (Bắt buộc chọn 1 trong 3) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Phân loại vai trò tài liệu <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* 1. Tài liệu chính */}
              <button
                type="button"
                onClick={() => setVaiTro('tai_lieu_chinh')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  vaiTro === 'tai_lieu_chinh'
                    ? 'bg-blue-50/90 border-[#004ac6] ring-1 ring-[#004ac6]/40 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    vaiTro === 'tai_lieu_chinh' ? 'border-[#004ac6] bg-[#004ac6]' : 'border-slate-300'
                  }`}>
                    {vaiTro === 'tai_lieu_chinh' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-blue-100 text-[#004ac6]">Chính</span>
                </div>
                <p className="text-[11.5px] font-bold text-slate-900">Tài liệu chính</p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">Đơn gốc, báo cáo, quyết định chủ trì</p>
              </button>

              {/* 2. Tài liệu kèm theo */}
              <button
                type="button"
                onClick={() => setVaiTro('tai_lieu_kem_theo')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  vaiTro === 'tai_lieu_kem_theo'
                    ? 'bg-slate-100 border-slate-700 ring-1 ring-slate-400 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    vaiTro === 'tai_lieu_kem_theo' ? 'border-slate-700 bg-slate-700' : 'border-slate-300'
                  }`}>
                    {vaiTro === 'tai_lieu_kem_theo' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-slate-200 text-slate-700">Kèm theo</span>
                </div>
                <p className="text-[11.5px] font-bold text-slate-900">Tài liệu kèm theo</p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">Chứng cứ, CCCD nộp kèm đơn</p>
              </button>

              {/* 3. Tài liệu bổ sung */}
              <button
                type="button"
                onClick={() => setVaiTro('tai_lieu_bo_sung')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  vaiTro === 'tai_lieu_bo_sung'
                    ? 'bg-purple-50/90 border-purple-600 ring-1 ring-purple-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    vaiTro === 'tai_lieu_bo_sung' ? 'border-purple-600 bg-purple-600' : 'border-slate-300'
                  }`}>
                    {vaiTro === 'tai_lieu_bo_sung' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-purple-100 text-purple-700">Bổ sung</span>
                </div>
                <p className="text-[11.5px] font-bold text-slate-900">Tài liệu bổ sung</p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">Bổ sung sau xác minh hồ sơ</p>
              </button>
            </div>
          </div>

          {/* Row: Số hiệu & Yêu cầu xử lý */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số hiệu văn bản
              </label>
              <input
                type="text"
                value={soHieu}
                onChange={(e) => setSoHieu(e.target.value)}
                placeholder="VD: VB-2026-004..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#004ac6] shadow-2xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Yêu cầu xử lý
              </label>
              <select
                value={yeuCau}
                onChange={(e) => setYeuCau(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#004ac6] shadow-2xs cursor-pointer font-semibold"
              >
                <option value="Xem">Xem văn bản</option>
                <option value="Ký">Ký số</option>
                <option value="Duyệt">Phê duyệt</option>
              </select>
            </div>
          </div>

          {/* Trích yếu / Nội dung tóm tắt */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Trích yếu / Ghi chú tài liệu
            </label>
            <textarea
              rows={2}
              value={trichYeu}
              onChange={(e) => setTrichYeu(e.target.value)}
              placeholder="Nhập tóm tắt nội dung tài liệu..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#004ac6] shadow-2xs resize-none"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003ba0] text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>Thêm vào danh sách</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
