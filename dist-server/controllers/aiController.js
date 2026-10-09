export const aiController = {
    analyzeDon(req, res) {
        const { noiDung, loaiDon, nguoiNop } = req.body;
        const analysis = {
            isProcessed: true,
            confidence: 0.94,
            loaiDonDuDoan: loaiDon || 'Phản ánh / Kiến nghị',
            linhVuc: 'Trật tự đô thị & Môi trường',
            thamQuyen: 'Thuộc thẩm quyền giải quyết của UBND quận Cầu Giấy (Phòng QLĐT phối hợp TN&MT)',
            deXuatHuongXuLy: {
                action: 'ghep_don',
                reason: 'Hồ sơ có nội dung và vị trí trùng khớp 96% với vụ việc DS-29/2026-GOVEX đang thụ lý',
                targetDonCode: 'DS-29/2026-GOVEX',
            },
            thucTheTrichXuat: {
                nguoiNop: nguoiNop || 'Đại diện KDC số 4',
                doiTuongLienQuan: 'Cơ sở tái chế phế liệu Minh Phát',
                diaBan: 'Tổ dân phố số 4, Cầu Giấy, Hà Nội',
                yeuCauChinh: 'Đình chỉ xả khói bụi và tiếng ồn ban đêm',
            },
            aiPipelineSteps: [
                { name: 'OCR & Bóc tách văn bản', status: 'done', duration: '0.4s' },
                { name: 'Nhận diện thực thể (NER)', status: 'done', duration: '0.8s' },
                { name: 'Đối soát CSDL & Đơn trùng', status: 'done', duration: '1.2s' },
                { name: 'Xác định thẩm quyền & Đề xuất', status: 'done', duration: '0.6s' },
            ],
        };
        res.json({ success: true, data: analysis });
    },
    chatAssistant(req, res) {
        const { message, context } = req.body;
        let reply = 'Hệ thống AI Tiếp nhận đơn đã ghi nhận thông tin. Vui lòng cung cấp thêm giấy tờ hoặc căn cước công dân của người nộp.';
        if (message?.toLowerCase().includes('ghép')) {
            reply = 'Đã đối soát CSDL: Phát hiện hồ sơ DS-29/2026-GOVEX có cùng nội dung phản ánh về cơ sở Minh Phát. Khuyến nghị cán bộ chọn hướng "Ghép vào đơn đã có".';
        }
        else if (message?.toLowerCase().includes('tiếp nhận')) {
            reply = 'Hồ sơ hợp lệ và thuộc thẩm quyền giải quyết. Đề xuất tạo Đơn tiếp nhận mới theo quy trình một cửa.';
        }
        res.json({
            success: true,
            data: {
                reply,
                timestamp: new Date().toLocaleTimeString('vi-VN'),
            },
        });
    },
};
