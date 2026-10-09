import { WorkflowDefinition, QuyTrinhId } from '../types/workflow';

export const WORKFLOW_DEFINITIONS: Record<QuyTrinhId, WorkflowDefinition> = {
  'to-giac': {
    id: 'to-giac',
    name: 'Quy trình tiếp nhận và xử lý tố giác/tin báo về tội phạm tại Công an cấp xã',
    code: 'QT-TG-CAX-2026',
    version: 'Phiên bản 3.0 (Chuẩn hóa 8 bước theo TTLT 01/2021 & BLTTHS 2015)',
    matchedLoaiDon: ['Đơn tố giác về tội phạm', 'Đơn tin báo về tội phạm', 'Tố giác tội phạm', 'Tin báo tội phạm', 'Kiến nghị khởi tố'],
    description: 'Quy trình nghiệp vụ tiếp nhận, kiểm tra ban đầu, thực hiện xác minh, lập báo cáo xác minh và trình báo cáo đề xuất hướng xử lý tại Công an cấp xã theo quy định của pháp luật Tố tụng hình sự.',
    selectionBasis: 'Dựa trên: Loại đơn "Tố giác/Tin báo tội phạm" đã được cán bộ xác nhận + Thẩm quyền kiểm tra, xác minh sơ bộ của Công an cấp xã theo Khoản 3 Điều 146 BLTTHS.',
    totalSteps: 8,
    participatingRoles: [
      'Cán bộ tiếp nhận & thụ lý hồ sơ (Công an cấp xã)',
      'Tổ công tác / Cán bộ kiểm tra xác minh',
      'Phó Trưởng Công an xã (Kiểm tra, hoàn thiện báo cáo)',
      'Trưởng Công an cấp xã (Người có thẩm quyền xem xét, quyết định)',
      'Cơ quan CSĐT Công an cấp trên (Cơ quan tiếp nhận chuyển giao)'
    ],
    steps: [
      {
        id: 'step-1',
        stepNumber: 1,
        name: 'Tiếp nhận tố giác/tin báo',
        responsibleRole: 'Cán bộ trực ban / Tiếp nhận Công an cấp xã',
        responsibleUnit: 'Bộ phận Tiếp nhận & Một cửa Công an cấp xã',
        status: 'completed',
        description: 'Tiếp nhận đơn, thông tin tố giác từ công dân/tổ chức; vào sổ tiếp nhận điện tử, cấp giấy biên nhận và bảo quản tài liệu ban đầu.',
        transferCondition: 'Hồ sơ có đủ đơn gốc hoặc biên bản tiếp nhận, định danh người nộp và biên bản giao nhận tài liệu.',
        estimatedDays: 1,
      },
      {
        id: 'step-2',
        stepNumber: 2,
        name: 'Kiểm tra ban đầu, đọc hiểu nội dung và tra cứu thông tin liên quan',
        responsibleRole: 'Cán bộ thụ lý hồ sơ (Công an cấp xã)',
        responsibleUnit: 'Tổ Cảnh sát phòng chống tội phạm / Công an xã',
        status: 'active',
        description: 'Đọc hiểu nội dung, đối soát chứng cứ ban đầu, tra cứu cơ sở dữ liệu dân cư, rà soát tiền sử đơn thư và xác định thẩm quyền.',
        transferCondition: 'Có phiếu phân loại sơ bộ, kết quả tra cứu hệ thống và danh mục tài liệu đối soát.',
        estimatedDays: 2,
      },
      {
        id: 'step-3',
        stepNumber: 3,
        name: 'Xác định hướng xử lý và thực hiện các hoạt động kiểm tra, xác minh cần thiết',
        responsibleRole: 'Cán bộ thụ lý / Tổ xác minh Công an cấp xã',
        responsibleUnit: 'Công an cấp xã',
        status: 'pending',
        description: 'Xây dựng kế hoạch xác minh, mời đương sự làm việc, lấy lời khai người tố giác/người bị tố giác, kiểm tra hiện trường sơ bộ theo thẩm quyền.',
        transferCondition: 'Hoàn thành các hoạt động kiểm tra xác minh thực tế theo kế hoạch.',
        estimatedDays: 5,
      },
      {
        id: 'step-4',
        stepNumber: 4,
        name: 'Ghi nhận kết quả kiểm tra, xác minh và cập nhật tài liệu chứng minh',
        responsibleRole: 'Cán bộ thụ lý (Công an cấp xã)',
        responsibleUnit: 'Công an cấp xã',
        status: 'pending',
        description: 'Lập biên bản làm việc, số hóa tài liệu đồ vật đã thu thập, tổng hợp kết quả của từng hoạt động xác minh và kiểm đếm chứng cứ.',
        transferCondition: 'Có đầy đủ biên bản ghi nhận kết quả và tài liệu chứng minh được cập nhật vào hồ sơ điện tử.',
        estimatedDays: 2,
      },
      {
        id: 'step-5',
        stepNumber: 5,
        name: 'Lập báo cáo xác minh',
        responsibleRole: 'Cán bộ thụ lý chính (Thượng úy Nguyễn Minh Anh)',
        responsibleUnit: 'Công an cấp xã',
        status: 'pending',
        description: 'Khởi tạo Báo cáo xác minh từ hồ sơ; tự động tổng hợp thông tin sự việc, người liên quan, hoạt động & kết quả; liên kết căn cứ chứng minh; biên tập và xác nhận nội dung báo cáo.',
        transferCondition: 'Báo cáo xác minh được lập đầy đủ nội dung, đính kèm căn cứ chứng minh và đáp ứng điều kiện kiểm tra trước khi trình.',
        estimatedDays: 2,
      },
      {
        id: 'step-6',
        stepNumber: 6,
        name: 'Kiểm tra, hoàn thiện báo cáo và trình người có thẩm quyền',
        responsibleRole: 'Cán bộ kiểm tra / Phó Trưởng Công an xã',
        responsibleUnit: 'Chỉ huy Công an cấp xã',
        status: 'pending',
        description: 'Rà soát tính đầy đủ, chặt chẽ của Báo cáo xác minh và hồ sơ đính kèm; hoàn thiện báo cáo và lập phiếu trình người có thẩm quyền xem xét.',
        transferCondition: 'Báo cáo được hoàn thiện và có ý kiến kiểm tra của Chỉ huy/Phó Trưởng Công an xã.',
        estimatedDays: 1,
      },
      {
        id: 'step-7',
        stepNumber: 7,
        name: 'Lập báo cáo đề xuất hướng xử lý hoặc thực hiện bước trình quyết định',
        responsibleRole: 'Cán bộ thụ lý & Chỉ huy Công an cấp xã',
        responsibleUnit: 'Công an cấp xã',
        status: 'pending',
        description: 'Lập Báo cáo đề xuất hướng xử lý độc lập (đề xuất chuyển Cơ quan CSĐT Công an cấp huyện / xử phạt hành chính / đình chỉ) trình Trưởng Công an cấp xã ký duyệt.',
        transferCondition: 'Có Báo cáo đề xuất hướng xử lý kèm dự thảo văn bản chuyển giao hoặc xử lý.',
        estimatedDays: 2,
      },
      {
        id: 'step-8',
        stepNumber: 8,
        name: 'Ghi nhận quyết định và chuyển thông tin sang luồng nghiệp vụ tiếp theo',
        responsibleRole: 'Trưởng Công an cấp xã & Văn thư',
        responsibleUnit: 'Công an cấp xã',
        status: 'pending',
        description: 'Ghi nhận quyết định phê duyệt của Lãnh đạo; bàn giao chuyển hồ sơ sang Cơ quan CSĐT thẩm quyền hoặc luồng nghiệp vụ tương ứng; thông báo cho công dân.',
        transferCondition: 'Biên bản bàn giao hồ sơ vật chứng cho Cơ quan CSĐT hoặc văn bản giải quyết ban hành chính thức.',
        estimatedDays: 1,
      },
    ],
    defaultTasks: [
      {
        id: 'task-1',
        title: 'Kiểm tra hồ sơ giấy & Đối chiếu tính hợp lệ các chứng cứ gốc',
        stepId: 'step-2',
        stepName: 'Kiểm tra hồ sơ & Đối soát chứng cứ ban đầu',
        assignedTo: 'Nguyễn Minh Anh',
        assignedRole: 'Cán bộ thụ lý hồ sơ',
        isCurrentUser: true,
        deadline: '18/09/2026 (Còn 1 ngày)',
        status: 'in_progress',
        relatedDocuments: [
          'Đơn tố giác bản scan (3 trang)',
          'Hợp đồng góp vốn đầu tư số 14/2024/HĐGV',
          'Biên lai ủy nhiệm chi 3.500.000.000 VNĐ'
        ],
        aiAssistance: {
          summary: 'Đơn của ông Nguyễn Văn A tố giác ông Trần Văn B chiếm đoạt 3.5 tỷ VNĐ qua danh nghĩa Dự án Khu đô thị Y. Hồ sơ cơ bản đủ đơn và hợp đồng photo.',
          checkDocuments: [
            'Kiểm tra con dấu Công ty X trên Hợp đồng góp vốn có khớp với mẫu dấu đăng ký kinh doanh không.',
            'Kiểm tra mã giao dịch trên Giấy nộp tiền ngân hàng Vietcombank ngày 15/03/2024.',
            'Kiểm tra tính pháp lý của Giấy ủy quyền của luật sư Lê Quang Đ.'
          ],
          verifyInformation: [
            'Tình trạng pháp lý hiện tại của Dự án Khu đô thị Y tại quận Hà Đông.',
            'Xác minh thông tin tài khoản thụ hưởng của Công ty Cổ phần X đã bị đóng băng hay còn hoạt động.'
          ],
          actionSuggestions: [
            'Lập Biên bản giao nhận tài liệu và xác định các chứng từ thiếu',
            'Dự thảo Phiếu đề xuất thụ lý nguồn tin tội phạm gửi Lãnh đạo Đội'
          ],
          warningNotes: [
            'Thời hạn kiểm tra sơ bộ nguồn tin theo Điều 147 BLTTHS là không quá 20 ngày kể từ ngày nhận đơn.',
            'Cần sớm gửi văn bản ngăn chặn tẩu tán tài sản nếu có nguy cơ đối tượng rút tiền.'
          ],
          draftTemplates: [
            'Mẫu Phiếu giao nhận tài liệu chứng cứ',
            'Mẫu Phiếu đề xuất thụ lý nguồn tin tội phạm'
          ]
        }
      },
      {
        id: 'task-2',
        title: 'Lập phiếu yêu cầu cung cấp bổ sung sao kê và tài liệu ủy quyền',
        stepId: 'step-2',
        stepName: 'Kiểm tra hồ sơ & Đối soát chứng cứ ban đầu',
        assignedTo: 'Nguyễn Minh Anh',
        assignedRole: 'Cán bộ thụ lý hồ sơ',
        isCurrentUser: true,
        deadline: '19/09/2026 (Còn 2 ngày)',
        status: 'pending',
        relatedDocuments: ['Phiếu hướng dẫn bổ sung tài liệu'],
        aiAssistance: {
          summary: 'AI phát hiện người nộp đơn chưa cung cấp bản gốc sao kê tài khoản ngân hàng và hợp đồng ủy quyền công chứng của luật sư đại diện.',
          actionSuggestions: [
            'Tạo Thông báo yêu cầu bổ sung chứng cứ trong thời hạn 07 ngày',
            'Liên hệ điện thoại trực tiếp người nộp đơn để hướng dẫn thủ tục'
          ]
        }
      },
      {
        id: 'task-3',
        title: 'Trình Lãnh đạo ký Quyết định phân công Điều tra viên thụ lý chính',
        stepId: 'step-3',
        stepName: 'Phân công Điều tra viên thụ lý',
        assignedTo: 'Thượng tá Trần Quốc Dũng',
        assignedRole: 'Phó Thủ trưởng Cơ quan CSĐT',
        isCurrentUser: false,
        deadline: '20/09/2026',
        status: 'pending',
        relatedDocuments: ['Tờ trình phân công', 'Dự thảo Quyết định phân công Điều tra viên'],
        aiAssistance: {
          summary: 'Đề xuất phân công Trung tá Lê Văn Nam (ĐTV Đội Điều tra kinh tế) do có kinh nghiệm xử lý các vụ án bất động sản tương tự.'
        }
      },
      {
        id: 'task-4',
        title: 'Ghi nhận kết quả kiểm tra, xác minh và số hóa tài liệu chứng minh',
        stepId: 'step-4',
        stepName: 'Ghi nhận kết quả kiểm tra, xác minh và cập nhật tài liệu chứng minh',
        assignedTo: 'Thượng úy Nguyễn Minh Anh',
        assignedRole: 'Cán bộ thụ lý',
        isCurrentUser: true,
        deadline: '24/09/2026',
        status: 'pending',
        relatedDocuments: ['Biên bản lấy lời khai', 'Biên bản kiểm tra thực địa', 'Biên bản niêm phong vật chứng'],
        aiAssistance: {
          summary: 'Tổng hợp 04 hoạt động xác minh và kiểm đếm danh mục chứng cứ gốc đã thu thập.',
        }
      },
      {
        id: 'task-5',
        title: 'Khởi tạo và biên tập Báo cáo xác minh nguồn tin tội phạm',
        stepId: 'step-5',
        stepName: 'Lập báo cáo xác minh',
        assignedTo: 'Thượng úy Nguyễn Minh Anh',
        assignedRole: 'Cán bộ thụ lý chính (Công an cấp xã)',
        isCurrentUser: true,
        deadline: '26/09/2026',
        status: 'pending',
        relatedDocuments: ['Dự thảo Báo cáo xác minh số 08/BC-CAX-XM', 'Hồ sơ tài liệu chứng minh'],
        aiAssistance: {
          summary: 'Hệ thống tự động trích xuất diễn biến sự việc, thông tin người liên quan và đối chiếu kết quả 04 hoạt động xác minh làm căn cứ cho báo cáo.',
          actionSuggestions: [
            'Kiểm tra tính thống nhất giữa lời khai người tố giác và tài liệu thực địa',
            'Rà soát điều kiện tiên quyết trước khi trình: Kết quả xác minh + Tài liệu đính kèm + Ký xác nhận',
            'Hoàn thiện dự thảo báo cáo và gửi Phó Trưởng Công an xã kiểm tra tại Bước 6'
          ],
          draftTemplates: ['Mẫu Báo cáo kết quả kiểm tra, xác minh nguồn tin tội phạm (Công an cấp xã)']
        }
      }
    ],
    potentialMissingInfo: [
      {
        id: 'miss-1',
        title: 'Chưa có bản sao kê tài khoản ngân hàng có đóng dấu xác nhận',
        impactLevel: 'high',
        description: 'Người nộp đơn mới nộp ảnh chụp màn hình chuyển khoản qua ứng dụng, chưa có bản sao kê tài khoản chính thức có dấu mộc đỏ ngân hàng xác nhận giao dịch 3.5 tỷ VNĐ.',
        suggestedAction: 'Yêu cầu người nộp đơn đến Ngân hàng Vietcombank xin in sao kê có mộc để làm căn cứ giám định tài chính.',
        relatedDoc: 'Biên lai giao dịch điện tử đính kèm',
        aiSource: 'Trang 2 đơn: "Tôi đã chuyển tiền qua internet banking nhưng chưa in sao kê ngân hàng".'
      },
      {
        id: 'miss-2',
        title: 'Văn bản ủy quyền cho Luật sư chưa có công chứng/chứng thực',
        impactLevel: 'medium',
        description: 'Giấy ủy quyền số 12/2026/UQ giữa ông Nguyễn Văn A và Luật sư Lê Quang Đ là bản tự lập viết tay, thiếu chữ ký chứng thực của UBND hoặc Phòng Công chứng.',
        suggestedAction: 'Yêu cầu luật sư xuất trình Thẻ luật sư kèm Giấy giới thiệu của Văn phòng luật sư hoặc bản công chứng Hợp đồng ủy quyền.',
        relatedDoc: 'Giấy ủy quyền số 12/2026/UQ',
        aiSource: 'Bóc tách từ file Giấy ủy quyền đính kèm: Không phát hiện dấu nổi hoặc dấu đỏ công chứng.'
      }
    ]
  },

  'khieu-nai': {
    id: 'khieu-nai',
    name: 'Quy trình giải quyết khiếu nại hành chính',
    code: 'QT-KN-2026-V3',
    version: 'Phiên bản 3.1 (Áp dụng Luật Khiếu nại 2011 & Luật Đất đai 2024)',
    matchedLoaiDon: ['Đơn khiếu nại', 'Đơn khiếu nại (Lần 1)', 'Đơn khiếu nại (Lần 2)', 'Khiếu nại đất đai', 'Khiếu nại bồi thường'],
    description: 'Quy trình xử lý đơn khiếu nại quyết định hành chính, hành vi hành chính của cơ quan Nhà nước trong lĩnh vực quản lý đất đai và bồi thường tái định cư.',
    selectionBasis: 'Dựa trên: Loại đơn "Khiếu nại" đã được cán bộ xác nhận + Nội dung yêu cầu nâng đơn giá bồi thường đất và bố trí suất tái định cư + Thẩm quyền Chủ tịch UBND cấp quận/huyện.',
    totalSteps: 7,
    participatingRoles: [
      'Cán bộ tiếp nhận & thụ lý (Nguyễn Minh Anh)',
      'Tổ trưởng Tổ xác minh thực địa',
      'Lãnh đạo Phòng Tài nguyên & Môi trường',
      'Chủ tịch / Phó Chủ tịch UBND quận/huyện'
    ],
    steps: [
      {
        id: 'step-1',
        stepNumber: 1,
        name: 'Tiếp nhận đơn & Kiểm tra điều kiện thụ lý',
        responsibleRole: 'Cán bộ thụ lý hồ sơ (Nguyễn Minh Anh)',
        responsibleUnit: 'Ban Tiếp công dân',
        status: 'completed',
        description: 'Kiểm tra thời hiệu khiếu nại (90 ngày), tư cách người khiếu nại và các quyết định hành chính bị khiếu nại.',
        transferCondition: 'Đơn đủ điều kiện thụ lý theo Điều 11 Luật Khiếu nại 2011.',
        estimatedDays: 2,
      },
      {
        id: 'step-2',
        stepNumber: 2,
        name: 'Ban hành Quyết định thụ lý giải quyết khiếu nại',
        responsibleRole: 'Chủ tịch UBND / Thủ trưởng cơ quan',
        responsibleUnit: 'UBND quận/huyện',
        status: 'active',
        description: 'Soạn thảo và ban hành Thông báo thụ lý giải quyết khiếu nại gửi người khiếu nại trong thời hạn 10 ngày.',
        transferCondition: 'Quyết định thụ lý được ký số và gửi đến người khiếu nại.',
        estimatedDays: 3,
      },
      {
        id: 'step-3',
        stepNumber: 3,
        name: 'Thành lập Tổ xác minh nội dung khiếu nại',
        responsibleRole: 'Lãnh đạo cơ quan giải quyết',
        responsibleUnit: 'Phòng TN&MT phối hợp Thanh tra',
        status: 'pending',
        description: 'Ban hành Quyết định thành lập Tổ xác minh liên ngành, xây dựng kế hoạch làm việc và kiểm tra thực địa thửa đất.',
        transferCondition: 'Có kế hoạch xác minh được phê duyệt.',
        estimatedDays: 2,
      },
      {
        id: 'step-4',
        stepNumber: 4,
        name: 'Kiểm tra thực địa, đo đạc & Đối chiếu hồ sơ đất',
        responsibleRole: 'Tổ xác minh khiếu nại',
        responsibleUnit: 'Tổ công tác liên ngành',
        status: 'pending',
        description: 'Làm việc trực tiếp với người khiếu nại, đo đạc ranh giới thửa đất, đối chiếu bản đồ địa chính và phương án bồi thường đã duyệt.',
        transferCondition: 'Biên bản làm việc thực tế có chữ ký của người khiếu nại và chính quyền cơ sở.',
        estimatedDays: 10,
      },
      {
        id: 'step-5',
        stepNumber: 5,
        name: 'Tổ chức đối thoại trực tiếp với công dân',
        responsibleRole: 'Người có thẩm quyền giải quyết / Tổ xác minh',
        responsibleUnit: 'UBND quận/huyện',
        status: 'pending',
        description: 'Mời công dân đến trụ sở đối thoại công khai, làm rõ các căn cứ pháp lý và nội dung tranh chấp về đơn giá đất.',
        transferCondition: 'Biên bản đối thoại ghi nhận đầy đủ ý kiến các bên.',
        estimatedDays: 5,
      },
      {
        id: 'step-6',
        stepNumber: 6,
        name: 'Dự thảo Quyết định giải quyết khiếu nại',
        responsibleRole: 'Tổ xác minh & Phòng Tư pháp thẩm định',
        responsibleUnit: 'Phòng Tư pháp & Thanh tra',
        status: 'pending',
        description: 'Tổng hợp kết quả đối thoại và xác minh để dự thảo Quyết định giải quyết khiếu nại lần 1.',
        transferCondition: 'Có báo cáo thẩm định pháp lý của cơ quan Tư pháp.',
        estimatedDays: 4,
      },
      {
        id: 'step-7',
        stepNumber: 7,
        name: 'Ban hành Quyết định & Công khai kết quả',
        responsibleRole: 'Chủ tịch UBND & Văn thư',
        responsibleUnit: 'UBND quận/huyện',
        status: 'pending',
        description: 'Ký ban hành Quyết định giải quyết khiếu nại, gửi công dân và công khai trên Cổng thông tin điện tử.',
        transferCondition: 'Đã tống đạt văn bản đến người khiếu nại theo biên nhận.',
        estimatedDays: 2,
      },
    ],
    defaultTasks: [
      {
        id: 'task-kn-1',
        title: 'Kiểm tra điều kiện thụ lý khiếu nại & Lập Tờ trình thụ lý',
        stepId: 'step-2',
        stepName: 'Ban hành Quyết định thụ lý giải quyết khiếu nại',
        assignedTo: 'Nguyễn Minh Anh',
        assignedRole: 'Cán bộ thụ lý hồ sơ',
        isCurrentUser: true,
        deadline: '19/09/2026 (Còn 2 ngày)',
        status: 'in_progress',
        relatedDocuments: ['Thông báo thu hồi đất số 45/TB-UBND', 'Quyết định bồi thường số 1422'],
        aiAssistance: {
          summary: 'Đơn của công dân khiếu nại giá bồi thường đất 18.5 triệu/m2 chưa sát giá thị trường và yêu cầu cấp 01 nền tái định cư.',
          checkDocuments: [
            'Đối chiếu ngày nhận Quyết định 1422 (05/08/2026) với ngày gửi đơn để tính thời hiệu 90 ngày (Hợp lệ).',
            'Kiểm tra Giấy chứng nhận quyền sử dụng đất của Thửa đất số 45, tờ bản đồ số 12.'
          ],
          actionSuggestions: [
            'Soạn Thông báo thụ lý giải quyết khiếu nại mẫu số 01',
            'Dự thảo Quyết định thành lập Tổ xác minh'
          ]
        }
      }
    ],
    potentialMissingInfo: [
      {
        id: 'miss-kn-1',
        title: 'Chưa có bản gốc Quyết định thu hồi đất và Biên bản kiểm đếm cây trồng',
        impactLevel: 'medium',
        description: 'Người làm đơn mới gửi Quyết định phê duyệt phương án tổng thể, chưa nộp Biên bản kiểm kê thực địa áp giá đền bù tài sản trên đất.',
        suggestedAction: 'Tra cứu hồ sơ lưu trữ tại Trung tâm Phát triển quỹ đất quận.',
        relatedDoc: 'QĐ 1422/QĐ-UBND',
        aiSource: 'Hồ sơ thiếu file đính kèm: "Biên bản kiểm đếm hiện trạng cây trồng vật nuôi".'
      }
    ]
  },

  'to-cao': {
    id: 'to-cao',
    name: 'Quy trình giải quyết đơn tố cáo',
    code: 'QT-TC-2026-V1',
    version: 'Phiên bản 1.8 (Áp dụng Luật Tố cáo 2018)',
    matchedLoaiDon: ['Đơn tố cáo', 'Tố cáo', 'Tố cáo hành vi vi phạm pháp luật', 'Tố cáo cán bộ công chức'],
    description: 'Quy trình tiếp nhận, xác minh sơ bộ, giữ bí mật thông tin người tố cáo và xử lý hành vi vi phạm pháp luật của cán bộ, công chức hoặc cơ quan tổ chức.',
    selectionBasis: 'Dựa trên: Loại đơn "Tố cáo" đã được cán bộ xác nhận + Nội dung phản ánh hành vi vi phạm công vụ, lợi dụng chức vụ quyền hạn.',
    totalSteps: 6,
    participatingRoles: [
      'Cán bộ tiếp nhận đơn (Nguyễn Minh Anh)',
      'Tổ trưởng Tổ xác minh tố cáo',
      'Người có thẩm quyền giải quyết tố cáo',
      'Cơ quan Thanh tra nhà nước'
    ],
    steps: [
      {
        id: 'step-1',
        stepNumber: 1,
        name: 'Tiếp nhận & Vào sổ quản lý bí mật người tố cáo',
        responsibleRole: 'Cán bộ thụ lý (Nguyễn Minh Anh)',
        responsibleUnit: 'Bộ phận Tiếp công dân & Xử lý đơn',
        status: 'completed',
        description: 'Mã hóa thông tin cá nhân của người tố cáo, lập hồ sơ mật theo quy định bảo vệ người tố cáo.',
        transferCondition: 'Đã thực hiện che giấu danh tính và cấp mã hồ sơ mật.',
        estimatedDays: 1,
      },
      {
        id: 'step-2',
        stepNumber: 2,
        name: 'Xác minh ban đầu điều kiện thụ lý tố cáo',
        responsibleRole: 'Cán bộ thụ lý (Nguyễn Minh Anh)',
        responsibleUnit: 'Thanh tra / Bộ phận Xử lý đơn',
        status: 'active',
        description: 'Kiểm tra tư cách người tố cáo, nội dung có địa chỉ rõ ràng, chứng cứ ban đầu về hành vi vi phạm pháp luật.',
        transferCondition: 'Xác định rõ danh tính người tố cáo và hành vi bị tố cáo.',
        estimatedDays: 3,
      },
      {
        id: 'step-3',
        stepNumber: 3,
        name: 'Ban hành Quyết định thụ lý & Thành lập Tổ xác minh',
        responsibleRole: 'Người có thẩm quyền giải quyết tố cáo',
        responsibleUnit: 'Lãnh đạo đơn vị',
        status: 'pending',
        description: 'Ban hành quyết định thụ lý trong thời hạn 07 ngày làm việc kể từ ngày tiếp nhận đủ điều kiện.',
        transferCondition: 'Quyết định thành lập Tổ xác minh từ 2 cán bộ trở lên.',
        estimatedDays: 2,
      },
      {
        id: 'step-4',
        stepNumber: 4,
        name: 'Tiến hành xác minh nội dung tố cáo',
        responsibleRole: 'Tổ xác minh tố cáo',
        responsibleUnit: 'Tổ xác minh liên ngành',
        status: 'pending',
        description: 'Làm việc với người bị tố cáo, thu thập tài liệu hồ sơ gốc, tiến hành giám định hoặc thẩm tra thực tế.',
        transferCondition: 'Có đầy đủ chứng cứ chứng minh hoặc bác bỏ hành vi bị tố cáo.',
        estimatedDays: 20,
      },
      {
        id: 'step-5',
        stepNumber: 5,
        name: 'Dự thảo Kết luận nội dung tố cáo',
        responsibleRole: 'Tổ xác minh tố cáo',
        responsibleUnit: 'Thanh tra đơn vị',
        status: 'pending',
        description: 'Lập báo cáo kết quả xác minh và dự thảo Kết luận nội dung tố cáo trình lãnh đạo phê duyệt.',
        transferCondition: 'Báo cáo kết quả xác minh có đầy đủ chữ ký các thành viên Tổ xác minh.',
        estimatedDays: 5,
      },
      {
        id: 'step-6',
        stepNumber: 6,
        name: 'Ban hành Kết luận & Xử lý người vi phạm',
        responsibleRole: 'Người có thẩm quyền giải quyết tố cáo',
        responsibleUnit: 'Cơ quan có thẩm quyền',
        status: 'pending',
        description: 'Ban hành Kết luận nội dung tố cáo, chuyển cơ quan điều tra nếu có dấu hiệu tội phạm hoặc xử lý kỷ luật.',
        transferCondition: 'Gửi kết luận đến người bị tố cáo và thông báo cho người tố cáo.',
        estimatedDays: 3,
      },
    ],
    defaultTasks: [
      {
        id: 'task-tc-1',
        title: 'Mã hóa danh tính người tố cáo và thẩm tra ban đầu chứng cứ',
        stepId: 'step-2',
        stepName: 'Xác minh ban đầu điều kiện thụ lý tố cáo',
        assignedTo: 'Nguyễn Minh Anh',
        assignedRole: 'Cán bộ thụ lý hồ sơ',
        isCurrentUser: true,
        deadline: '18/09/2026 (Còn 1 ngày)',
        status: 'in_progress',
        relatedDocuments: ['Đơn tố cáo gốc', 'Hồ sơ chứng minh vi phạm'],
        aiAssistance: {
          summary: 'Đơn tố cáo đích danh hành vi sai phạm trong thi hành công vụ. Cần áp dụng quy trình bảo mật danh tính tuyệt đối.',
          actionSuggestions: [
            'Lập hồ sơ mã hóa danh tính người tố cáo',
            'Kiểm tra tính xác thực của các tài liệu file ghi âm/ảnh kèm theo'
          ]
        }
      }
    ],
    potentialMissingInfo: [
      {
        id: 'miss-tc-1',
        title: 'Chưa có thông tin định danh chính xác của người bị tố cáo',
        impactLevel: 'critical',
        description: 'Đơn chỉ ghi tên gọi thường ngày của cán bộ, chưa có họ tên đầy đủ, chức vụ và cơ quan công tác cụ thể.',
        suggestedAction: 'Đối soát danh bạ cán bộ hoặc tra cứu hệ thống nhân sự cơ quan.',
        relatedDoc: 'Trang 1 đơn tố cáo',
        aiSource: 'Trích xuất từ nội dung: Người bị tố giác chỉ ghi "ông Tuấn - cán bộ địa chính".'
      }
    ]
  },

  'kien-nghi': {
    id: 'kien-nghi',
    name: 'Quy trình tiếp nhận & xử lý kiến nghị, phản ánh',
    code: 'QT-KNPA-2026-V1',
    version: 'Phiên bản 1.2',
    matchedLoaiDon: ['Đơn phản ánh, kiến nghị', 'Kiến nghị', 'Phản ánh', 'Đơn kiến nghị', 'Đơn phản ánh'],
    description: 'Quy trình tiếp nhận, xử lý nhanh các nội dung kiến nghị, phản ánh của người dân về các bất cập trong quản lý công hoặc thủ tục hành chính.',
    selectionBasis: 'Dựa trên: Loại đơn "Phản ánh, kiến nghị" đã được cán bộ xác nhận + Nội dung mang tính xây dựng, góp ý cải cách hoặc thắc mắc cơ chế.',
    totalSteps: 5,
    participatingRoles: [
      'Cán bộ tiếp nhận (Nguyễn Minh Anh)',
      'Phòng Chuyên môn phụ trách lĩnh vực',
      'Lãnh đạo đơn vị tiếp nhận'
    ],
    steps: [
      {
        id: 'step-1',
        stepNumber: 1,
        name: 'Tiếp nhận phản ánh & Phân loại thẩm quyền',
        responsibleRole: 'Cán bộ tiếp nhận (Nguyễn Minh Anh)',
        responsibleUnit: 'Bộ phận Tiếp nhận & Xử lý đơn',
        status: 'completed',
        description: 'Tiếp nhận kiến nghị từ công dân qua Cổng dịch vụ công hoặc trực tiếp, xác định nội dung thuộc thẩm quyền cơ quan nào.',
        transferCondition: 'Nội dung phản ánh được ghi nhận đầy đủ vào hệ thống.',
        estimatedDays: 1,
      },
      {
        id: 'step-2',
        stepNumber: 2,
        name: 'Chuyển đơn vị chuyên môn xử lý hoặc Chuyển cơ quan ngoài',
        responsibleRole: 'Cán bộ thụ lý (Nguyễn Minh Anh)',
        responsibleUnit: 'Bộ phận Xử lý đơn',
        status: 'active',
        description: 'Ban hành phiếu chuyển kiến nghị đến phòng chuyên môn hoặc cơ quan có chức năng giải quyết.',
        transferCondition: 'Phiếu chuyển đơn được phát hành điện tử.',
        estimatedDays: 2,
      },
      {
        id: 'step-3',
        stepNumber: 3,
        name: 'Xử lý kiến nghị & Chuẩn bị nội dung giải trình',
        responsibleRole: 'Phòng chuyên môn phụ trách',
        responsibleUnit: 'Phòng ban chức năng',
        status: 'pending',
        description: 'Kiểm tra hiện trường, khắc phục bất cập hoặc soạn văn bản trả lời, giải thích chính sách cho công dân.',
        transferCondition: 'Có dự thảo văn bản trả lời kèm hồ sơ minh chứng.',
        estimatedDays: 7,
      },
      {
        id: 'step-4',
        stepNumber: 4,
        name: 'Lãnh đạo phê duyệt nội dung trả lời',
        responsibleRole: 'Lãnh đạo đơn vị',
        responsibleUnit: 'Ban Lãnh đạo',
        status: 'pending',
        description: 'Xem xét và ký duyệt văn bản trả lời phản ánh, kiến nghị của công dân.',
        transferCondition: 'Văn bản được ký duyệt chính thức.',
        estimatedDays: 2,
      },
      {
        id: 'step-5',
        stepNumber: 5,
        name: 'Công khai kết quả & Trả lời công dân',
        responsibleRole: 'Bộ phận Cổng thông tin / Văn thư',
        responsibleUnit: 'Cổng Dịch vụ công',
        status: 'pending',
        description: 'Gửi kết quả giải quyết cho người phản ánh qua SMS/Email và công khai trên Cổng thông tin.',
        transferCondition: 'Công dân nhận được thông báo phản hồi.',
        estimatedDays: 1,
      },
    ],
    defaultTasks: [
      {
        id: 'task-pa-1',
        title: 'Phân loại nội dung kiến nghị và phát hành phiếu chuyển chuyên ban',
        stepId: 'step-2',
        stepName: 'Chuyển đơn vị chuyên môn xử lý hoặc Chuyển cơ quan ngoài',
        assignedTo: 'Nguyễn Minh Anh',
        assignedRole: 'Cán bộ thụ lý',
        isCurrentUser: true,
        deadline: '18/09/2026',
        status: 'in_progress',
        relatedDocuments: ['Phiếu tiếp nhận kiến nghị phản ánh'],
        aiAssistance: {
          summary: 'Nội dung kiến nghị về hạ tầng giao thông và tiến độ thi công. Đề xuất chuyển Ban QLDA công trình giao thông xử lý.',
          actionSuggestions: [
            'Dự thảo Phiếu chuyển đơn vị xử lý theo mẫu',
            'Cập nhật hạn xử lý trên Cổng thông tin'
          ]
        }
      }
    ],
    potentialMissingInfo: []
  }
};

/**
 * Hàm tìm kiếm quy trình phù hợp nhất dựa trên loại đơn đã được cán bộ xác nhận
 */
export function matchWorkflowByLoaiDon(loaiDon: string): WorkflowDefinition {
  const norm = (loaiDon || '').toLowerCase().trim();

  if (norm.includes('tố giác') || norm.includes('tin báo') || norm.includes('khởi tố') || norm.includes('hình sự')) {
    return WORKFLOW_DEFINITIONS['to-giac'];
  }
  if (norm.includes('tố cáo')) {
    return WORKFLOW_DEFINITIONS['to-cao'];
  }
  if (norm.includes('khiếu nại') || norm.includes('đất đai') || norm.includes('bồi thường') || norm.includes('giải phóng')) {
    return WORKFLOW_DEFINITIONS['khieu-nai'];
  }
  if (norm.includes('kiến nghị') || norm.includes('phản ánh') || norm.includes('góp ý')) {
    return WORKFLOW_DEFINITIONS['kien-nghi'];
  }

  // Mặc định trả về tố giác nếu là đơn hình sự, hoặc khiếu nại nếu chung chung
  return WORKFLOW_DEFINITIONS['to-giac'];
}
