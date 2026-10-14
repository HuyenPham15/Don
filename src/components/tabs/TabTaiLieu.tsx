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

export interface DocItem {
  id: string;
  name: string;
  category: string;
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
  loaiVanBan?: 'giay_moi' | 'bien_ban' | 'cong_van' | 'quyet_dinh' | 'thong_bao' | 'khac' | 'bao_cao_de_xuat' | 'bao_cao_xac_minh';
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
  // Dữ liệu mẫu chuẩn hóa theo đúng hình ảnh thiết kế
  const defaultDocs: DocItem[] = [
    {
      id: 'DOC-2026-001',
      name: 'Hợp đồng cung cấp dịch vụ xác minh hồ sơ',
      category: 'Hồ sơ ban đầu',
      folder: 'ho_so_ban_dau',
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
      category: 'Báo cáo đề xuất',
      loaiVanBan: 'bao_cao_de_xuat',
      folder: 'ho_so_ban_dau',
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
      noiDungChiTiet: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n------------------------\n\nBÁO CÁO ĐỀ XUẤT HƯỚNG XỬ LÝ ĐƠN\nSố: VB-2026-002\n\nKính gửi: Lãnh đạo đơn vị có thẩm quyền\n\nCán bộ thụ lý báo cáo kết quả kiểm tra sơ bộ đơn của công dân ${currentDon.nguoiNop || 'Nguyễn Thị Minh Phương'}:\n1. Đơn đủ điều kiện thụ lý theo quy định.\n2. Căn cứ hồ sơ ban đầu, đề xuất chuyển bước xác minh và phân công cán bộ chuyên môn thụ lý giải quyết.\n\nKính trình Đồng chí xem xét, phê duyệt.`,
    },
    {
      id: 'DOC-2026-003',
      name: 'Báo cáo kết quả kiểm tra ban đầu',
      category: 'Hồ sơ ban đầu',
      folder: 'ho_so_ban_dau',
      soHieu: 'VB-2026-003',
      size: '620 KB',
      pages: 3,
      uploadDate: '04/10/2026',
      signer: 'Đ/c Trần Văn Hùng - Phó Thủ trưởng',
      coQuanBanHanh: 'Cơ quan Cảnh sát điều tra',
      ocrStatus: 'Hoàn tất',
      yeuCau: 'Xem',
      trangThaiTrinhKy: 'da_co_hieu_luc', // Đã ký số, khóa chọn
      trichYeu: 'Báo cáo kết quả kiểm tra điều kiện ban đầu, đã ký số VGCA có hiệu lực thi hành',
      previewExcerpt: 'BÁO CÁO KẾT QUẢ KIỂM TRA BAN ĐẦU\nVề việc kiểm tra tính pháp lý và tài liệu kèm theo đơn...',
      noiDungChiTiet: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n------------------------\n\nBÁO CÁO KẾT QUẢ KIỂM TRA BAN ĐẦU\nSố: VB-2026-003\n\n(VĂN BẢN ĐÃ ĐƯỢC KÝ SỐ ĐIỆN TỬ - CÓ HIỆU LỰC PHÁP LÝ)\n\nCăn cứ Điều 145, 146 Bộ luật Tố tụng hình sự năm 2015;\nKết quả xác minh tính có căn cứ ban đầu của đơn tố giác cho thấy dấu hiệu tội phạm rõ ràng, đề nghị tiến hành giải quyết theo đúng trình tự tố tụng.`,
    },
  ];

  const [documents, setDocuments] = useState<DocItem[]>(defaultDocs);
  // Văn bản đang được chọn xem bên OnlyOffice (mặc định item đầu tiên)
  const [activeDocId, setActiveDocId] = useState<string>('DOC-2026-001');
  // Danh sách các văn bản được tick chọn để đi trình ký (mặc định chọn item 1 giống ảnh)
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>(['DOC-2026-001']);
  // Nhóm danh sách: Theo thư mục | Theo ngày tải
  const [groupMode, setGroupMode] = useState<'folder' | 'date'>('folder');
  // Thu phóng OnlyOffice (mặc định 70% như trong ảnh)
  const [zoomPercent, setZoomPercent] = useState<number>(70);
  // Trạng thái mở/đóng các thư mục
  const [openFolders, setOpenFolders] = useState<{ [key: string]: boolean }>({
    root: true,
    ho_so_ban_dau: true,
    van_ban_quyet_dinh: true,
  });
  // Toast thông báo
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  // Trạng thái mở modal Tạo lượt trình & Ma trận phân quyền văn bản
  const [isTrinhKyModalOpen, setIsTrinhKyModalOpen] = useState<boolean>(false);

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
      const exists = documents.find((d) => d.id === initialEditingDoc.id || d.soHieu === initialEditingDoc.soHieu);
      if (exists) {
        setActiveDocId(exists.id);
        setSelectedDocIds([exists.id]);
      } else {
        const docToAdd: DocItem = {
          id: initialEditingDoc.id || `DOC-INIT-${Date.now()}`,
          name: (initialEditingDoc as any).name || initialEditingDoc.tenVanBan || 'Văn bản',
          category: initialEditingDoc.category || 'Báo cáo đề xuất',
          soHieu: initialEditingDoc.soHieu,
          size: (initialEditingDoc as any).size || '380 KB',
          pages: (initialEditingDoc as any).pages || 2,
          uploadDate: (initialEditingDoc as any).uploadDate || initialEditingDoc.ngayLap || '16/09/2026',
          signer: initialEditingDoc.signer || currentDon.canBoXuLy || 'Nguyễn Minh Anh',
          coQuanBanHanh: initialEditingDoc.coQuanBanHanh || 'Phòng Tiếp công dân & Xử lý đơn',
          ocrStatus: 'Hoàn tất',
          previewExcerpt: initialEditingDoc.noiDungChiTiet || '',
          noiDungChiTiet: initialEditingDoc.noiDungChiTiet || '',
          loaiVanBan: (initialEditingDoc.loai as any) || 'bao_cao_de_xuat',
          tenVanBan: initialEditingDoc.tenVanBan,
          trichYeu: initialEditingDoc.trichYeu,
          trangThaiTrinhKy: 'chua_trinh',
          yeuCau: 'Ký',
        };
        setDocuments((prev) => [docToAdd, ...prev]);
        setActiveDocId(docToAdd.id);
        setSelectedDocIds([docToAdd.id]);
      }
      onClearInitialEditingDoc?.();
    }
  }, [initialEditingDoc, documents, onClearInitialEditingDoc, currentDon.canBoXuLy]);

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

  // Chọn toàn bộ văn bản trong thư mục "Hồ sơ ban đầu" (chỉ những văn bản chưa có hiệu lực)
  const selectableDocsInHoSo = documents.filter(
    (d) => d.folder === 'ho_so_ban_dau' && d.trangThaiTrinhKy !== 'da_co_hieu_luc'
  );
  const isAllHoSoSelected =
    selectableDocsInHoSo.length > 0 &&
    selectableDocsInHoSo.every((d) => selectedDocIds.includes(d.id));

  const handleToggleSelectAllHoSo = () => {
    if (isAllHoSoSelected) {
      const hoSoIds = selectableDocsInHoSo.map((d) => d.id);
      setSelectedDocIds((prev) => prev.filter((id) => !hoSoIds.includes(id)));
    } else {
      const hoSoIds = selectableDocsInHoSo.map((d) => d.id);
      setSelectedDocIds((prev) => Array.from(new Set([...prev, ...hoSoIds])));
    }
  };

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
      const isBaoCao =
        doc.category === 'Báo cáo đề xuất' ||
        doc.loaiVanBan === 'bao_cao_de_xuat' ||
        doc.name.toLowerCase().includes('báo cáo') ||
        doc.name.toLowerCase().includes('bao_cao');

      const newSd: SigningDocument = {
        id: doc.id,
        soKyHieu: doc.soHieu || 'VB-2026',
        hoSoCode: currentDon.code,
        luotNhanId: currentDon.luotNhanId,
        loaiDon: currentDon.loaiDon || 'Đơn tố giác',
        nguoiGuiDon: currentDon.nguoiNop,
        noiDungDon: currentDon.title,
        tenVanBan: doc.name,
        loaiVanBan: isBaoCao ? 'bao_cao_de_xuat' : 'to_trinh_thu_ly',
        loaiVanBanLabel: doc.category || (isBaoCao ? 'Báo cáo đề xuất' : 'Tờ trình thụ lý'),
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
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900/95 backdrop-blur-md text-white rounded-xl shadow-2xl text-xs font-semibold border border-slate-700 animate-fade-in">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GIAO DIỆN CHIA 2 CỘT CHUẨN THEO ẢNH: TRÌNH XEM ONLYOFFICE (TRÁI) & CHỌN VĂN BẢN (PHẢI) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ========================================================================= */}
        {/* CỘT TRÁI (~65% width): TRÌNH XEM ONLYOFFICE / DOCUMENT VIEWER             */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-2">
          {/* Header tên văn bản đang chọn */}
          <div className="px-1 py-0.5">
            <h2 className="text-base font-bold text-slate-900 truncate">
              {currentActiveDoc.name}
            </h2>
          </div>

          {/* Khung OnlyOffice Suite */}
          <div className="bg-[#2b2b2b] rounded-lg shadow-md overflow-hidden border border-slate-700 flex flex-col min-h-[750px]">
            {/* Top Toolbar OnlyOffice */}
            <div className="bg-[#2e2e2e] text-slate-200 px-3 py-2 flex items-center justify-between border-b border-[#3e3e3e] select-none text-xs">
              <div className="flex items-center gap-4">
                <span className="font-extrabold tracking-wider text-white text-[13px] flex items-center gap-1">
                  ONLYOFFICE
                </span>
                <div className="flex items-center gap-3 text-slate-300 font-medium">
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
                <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-[10px] border border-slate-500 shadow-xs">
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
                  }}
                >
                  {/* Mã FORM ID & Nguồn mẫu góc trên */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pb-3 border-b border-slate-200 mb-6">
                    <span className="border border-dashed border-slate-300 px-1.5 py-0.5 rounded">
                      FORM_ID: OCR_CRIME_REPORT_2026_01
                    </span>
                    <span className="italic font-sans">
                      Mẫu tố tụng hình sự (Bộ Công an)
                    </span>
                  </div>

                  {/* Quốc hiệu Tiêu ngữ */}
                  <div className="text-center space-y-1 mb-8">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                      CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                    </h3>
                    <p className="font-bold text-xs text-slate-900">
                      Độc lập - Tự do - Hạnh phúc
                    </p>
                    <div className="w-36 h-px bg-slate-800 mx-auto mt-1"></div>
                  </div>

                  {/* Tiêu đề văn bản */}
                  <div className="text-center mb-6">
                    <h1 className="font-bold text-base uppercase text-slate-900 tracking-wide">
                      {currentActiveDoc.name.toUpperCase()}
                    </h1>
                    <p className="italic text-xs text-slate-700 mt-1">
                      (Về hành vi có dấu hiệu "Lừa đảo chiếm đoạt tài sản" qua mạng xã hội)
                    </p>
                  </div>

                  {/* Kính gửi */}
                  <div className="mb-6 text-xs leading-relaxed space-y-0.5">
                    <p>
                      <strong className="font-bold">Kính gửi:</strong> Cơ quan Cảnh sát điều tra - Công an Quận Cầu Giấy, TP. Hà Nội
                    </p>
                    <p className="pl-14">
                      Viện kiểm sát nhân dân Quận Cầu Giấy, TP. Hà Nội
                    </p>
                  </div>

                  {/* Mục I: Thông tin người tố giác */}
                  <div className="mb-6 space-y-2 text-xs leading-relaxed">
                    <h4 className="font-bold uppercase text-slate-900 border-b border-slate-200 pb-0.5">
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
                  <div className="mb-6 space-y-2 text-xs leading-relaxed">
                    <h4 className="font-bold uppercase text-slate-900 border-b border-slate-200 pb-0.5">
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
                  <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-6 text-xs text-center font-sans">
                    <div className="space-y-1 text-slate-500">
                      <p className="font-bold text-slate-700">NGƯỜI XÁC NHẬN</p>
                      <p className="italic text-[10px]">(Ký, ghi rõ họ tên)</p>
                      <div className="h-12"></div>
                      <p className="font-semibold text-slate-800">Cán bộ thụ lý hồ sơ</p>
                    </div>

                    <div className="space-y-1">
                      <p className="font-bold text-slate-800">NGƯỜI LÀM ĐƠN</p>
                      <p className="italic text-[10px] text-slate-500">(Ký, ghi rõ họ tên)</p>
                      {currentActiveDoc.trangThaiTrinhKy === 'da_co_hieu_luc' ? (
                        <div className="my-2 p-1.5 rounded border border-emerald-500 bg-emerald-50 text-emerald-800 text-[9px] font-mono inline-block">
                          <p className="font-bold">✓ ĐÃ KÝ SỐ ĐIỆN TỬ VGCA</p>
                          <p>Ký bởi: {currentActiveDoc.signer}</p>
                          <p>Thời gian: {currentActiveDoc.uploadDate}</p>
                        </div>
                      ) : (
                        <div className="h-12"></div>
                      )}
                      <p className="font-bold text-slate-900">
                        {currentDon.nguoiNop || 'Nguyễn Thị Minh Phương'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Toolbar OnlyOffice */}
            <div className="bg-[#2e2e2e] text-slate-300 px-3 py-1.5 flex items-center justify-between border-t border-[#3e3e3e] text-[11px] select-none">
              <div className="flex items-center gap-4">
                <span>Trang 1 trên {currentActiveDoc.pages || 2}</span>
                <span className="hover:text-white cursor-pointer">Word count</span>
              </div>

              {/* Điều khiển Zoom */}
              <div className="flex items-center gap-2 font-mono">
                <span>Thu phóng {zoomPercent}%</span>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="w-5 h-5 rounded hover:bg-[#3e3e3e] hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                  title="Thu nhỏ"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="w-5 h-5 rounded hover:bg-[#3e3e3e] hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                  title="Phóng to"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CỘT PHẢI (~35% width): BẢNG CHỌN VĂN BẢN ĐI TRÌNH KÝ                    */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col space-y-4">
          {/* Header phân loại nhóm */}
          <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Nhóm danh sách:</span>
              <div className="flex items-center gap-1">
                {/* Nút "Theo thư mục" - Màu đỏ mận đậm đúng ảnh */}
                <button
                  type="button"
                  onClick={() => setGroupMode('folder')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${groupMode === 'folder'
                      ? 'bg-[#881337] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  Theo thư mục
                </button>
                <button
                  type="button"
                  onClick={() => setGroupMode('date')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${groupMode === 'date'
                      ? 'bg-[#881337] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  Theo ngày tải
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => showToast('Chức năng thêm thư mục mới')}
              className="text-xs font-semibold text-[#881337] hover:underline cursor-pointer flex items-center gap-0.5"
            >
              + Thêm thư mục
            </button>
          </div>

          {/* Action Bar: Số văn bản đã chọn + Nút Bỏ chọn + Nút Trình ký */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-900">
                Đã chọn {selectedDocIds.length} văn bản
              </span>
              {selectedDocIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Bỏ chọn
                </button>
              )}
            </div>

            {/* Nút TRÌNH KÝ màu xanh dương chuẩn ảnh */}
            <button
              type="button"
              onClick={handleOpenTrinhKyModal}
              className="px-4 py-1.5 rounded-lg bg-[#1d4ed8] hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Trình ký</span>
            </button>
          </div>

          {/* Cây thư mục tài liệu */}
          <div className="space-y-3 pt-2">
            {/* Cấp 1: Thư mục tài liệu */}
            <div className="space-y-2">
              <div
                onClick={() => setOpenFolders((prev) => ({ ...prev, root: !prev.root }))}
                className="flex items-center justify-between text-xs font-bold text-slate-900 cursor-pointer select-none py-1 hover:text-[#881337]"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500">
                    {openFolders.root ? '▾' : '▸'}
                  </span>
                  <span>Thư mục tài liệu</span>
                </div>
                <span className="text-[11px] text-slate-400 font-normal">
                  {documents.length} tài liệu
                </span>
              </div>

              {openFolders.root && (
                <div className="pl-2 space-y-3">
                  {/* Nhóm 1: Hồ sơ ban đầu */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800 select-none py-0.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isAllHoSoSelected}
                          onChange={handleToggleSelectAllHoSo}
                          className="w-4 h-4 rounded text-[#881337] focus:ring-[#881337] border-slate-300 cursor-pointer"
                        />
                        <span>Hồ sơ ban đầu</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-normal">
                        {selectableDocsInHoSo.length + 1} tài liệu
                      </span>
                    </div>

                    {/* Danh sách các văn bản trong Hồ sơ ban đầu */}
                    <div className="space-y-2 pl-4">
                      {documents
                        .filter((doc) => doc.folder === 'ho_so_ban_dau')
                        .map((doc) => {
                          const isSelected = selectedDocIds.includes(doc.id);
                          const isActiveView = activeDocId === doc.id;
                          const isLocked = doc.trangThaiTrinhKy === 'da_co_hieu_luc';

                          return (
                            <div
                              key={doc.id}
                              onClick={() => setActiveDocId(doc.id)}
                              className={`p-3 rounded-lg border transition-all cursor-pointer relative ${isSelected
                                  ? 'border-red-400 bg-red-50/50 shadow-xs'
                                  : isActiveView
                                    ? 'border-slate-300 bg-slate-50/80'
                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/40'
                                }`}
                            >
                              <div className="flex items-start gap-2.5">
                                {/* Checkbox chọn */}
                                <div className="pt-0.5">
                                  {isLocked ? (
                                    <input
                                      type="checkbox"
                                      disabled
                                      className="w-4 h-4 rounded text-slate-400 border-slate-200 cursor-not-allowed opacity-50"
                                    />
                                  ) : (
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onClick={(e) => handleToggleDocSelect(doc, e)}
                                      onChange={() => { }}
                                      className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300 cursor-pointer"
                                    />
                                  )}
                                </div>

                                {/* Icon PDF */}
                                <div className="w-7 h-7 rounded bg-red-50 border border-red-200 text-red-600 flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                                  PDF
                                </div>

                                {/* Thông tin văn bản */}
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                                      {doc.name}
                                    </h4>

                                    {/* Trạng thái Badge bên phải */}
                                    <div className="shrink-0">
                                      {doc.trangThaiTrinhKy === 'da_co_hieu_luc' ? (
                                        <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300">
                                          Đã có hiệu lực
                                        </span>
                                      ) : doc.trangThaiTrinhKy === 'dang_trinh' ? (
                                        <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-blue-50 text-blue-700 border border-blue-300">
                                          Đang trình ký
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
                                          Chưa trình
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Mã số & Ngày */}
                                  <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                                    {doc.soHieu} • {doc.uploadDate}
                                  </div>

                                  {/* Dòng Yêu cầu */}
                                  <div className="text-[11px] text-slate-600 mt-1 font-medium">
                                    Yêu cầu: <span className="text-slate-800">{doc.yeuCau || 'Ký'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Nhóm 2: Văn bản và quyết định xử lý */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800 select-none py-0.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          disabled
                          className="w-4 h-4 rounded text-slate-400 border-slate-200 cursor-not-allowed opacity-50"
                        />
                        <span>Văn bản và quyết định xử lý</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-normal">
                        0 tài liệu
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dòng ghi chú chú thích ở dưới cùng cột phải */}
          <div className="pt-4 mt-auto border-t border-slate-100">
            <p className="text-[11px] text-slate-500 italic">
              Văn bản đã ký số được khóa chọn và hiển thị trạng thái Đã có hiệu lực.
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
    </div>
  );
}
